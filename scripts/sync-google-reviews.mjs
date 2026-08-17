/**
 * Dovlači recenzije sa našeg Google Business Profila i upisuje ih u
 * `google_reviews`. Pokreće ga GitHub Actions jednom mesečno, a ručno se zove
 * isto kao i ostale skripte iz ovog foldera:
 *
 *   node --env-file=.env.local scripts/sync-google-reviews.mjs            # dry-run
 *   node --env-file=.env.local scripts/sync-google-reviews.mjs --apply    # upis
 *   node --env-file=.env.local scripts/sync-google-reviews.mjs --raw      # sirov JSON
 *
 * ── ZAŠTO APIFY, A NE GOOGLE ────────────────────────────────────────────────
 * Profil je neverifikovan, pa Business Profile API otpada (`reviews.list` radi
 * samo za verifikovanu lokaciju, a i prijava za pristup API-ju traži
 * verifikovan profil star 60+ dana). Places API radi bez verifikacije ali vraća
 * najviše 5 od 16 recenzija.
 *
 * Outscraper je bio prvi izbor dok se nije pokazalo da mu je API iza plaćenog
 * tiera — free tier pokriva samo njihov web interfejs. Apify free plan daje $5
 * kredita mesečno bez kartice i uključuje API; actor naplaćuje $0.30 na 1.000
 * recenzija, dakle ~$0.005 po pokretanju.
 *
 * ── SIGURNOSNA PRAVILA ──────────────────────────────────────────────────────
 * Skripta NIKAD ne briše. Upsert ide po `review_id`, pa neuspeo poziv, promena
 * formata ili prazan odgovor ostavljaju postojeći prikaz netaknut. Nula
 * recenzija se tretira kao greška (exit 1) da bi cron pao glasno umesto da
 * tiho isprazni sekciju sa utiscima.
 * ────────────────────────────────────────────────────────────────────────────
 */
import { MongoClient } from "mongodb";
import { writeFileSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const RAW = process.argv.includes("--raw");

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Google Maps URL profila „Halo Uspomene & Pozivnice".
 *
 * Actor ne prima `?cid=` skraćenicu — traži `/maps/place/` oblik. Zato je isti
 * CID (12090923469823668258) ovde zapisan heksadecimalno, kako ga Google i sam
 * nosi u `data=` delu adrese: 0xa7cb96d5d945f022. Prvi deo para je feature id
 * i sme biti 0x0 — Google mesto razrešava po CID-u.
 *
 * Ako actor ikad prestane da vari ovaj oblik, `GOOGLE_REVIEWS_PLACE_URL`
 * prihvata pun link iz adresne trake otvorenog profila.
 */
const PLACE_URL =
  process.env.GOOGLE_REVIEWS_PLACE_URL ||
  "https://www.google.com/maps/place/data=!4m2!3m1!1s0x0:0xa7cb96d5d945f022";

const ACTOR = "compass~google-maps-reviews-scraper";
const DB_NAME = "halouspomene";
const SUMMARY_KEY = "google_reviews_summary";

/** Sa 16 recenzija ovo je ogromna rezerva, a naplata ide po stvarnom broju. */
const REVIEWS_LIMIT = 200;

function die(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

if (!APIFY_TOKEN) die("Nedostaje APIFY_TOKEN.");
if (!MONGODB_URI) die("Nedostaje MONGODB_URI.");

// ── Apify ────────────────────────────────────────────────────────────────────

/**
 * `run-sync-get-dataset-items` pokrene actor i vrati gotove stavke u jednom
 * pozivu, bez ručnog poll-ovanja. Granica je 300s, što je za 16 recenzija
 * višestruko dovoljno.
 */
async function fetchReviews() {
  const url =
    `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items` +
    `?token=${encodeURIComponent(APIFY_TOKEN)}&timeout=300`;

  const input = {
    startUrls: [{ url: PLACE_URL }],
    maxReviews: REVIEWS_LIMIT,
    reviewsSort: "newest",
    // Bez ovoga actor izostavlja ime recenzenta, a ime je deo atribucije.
    personalData: true,
    language: "sr",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = await res.text();
  if (!res.ok) die(`Apify HTTP ${res.status}: ${body.slice(0, 800)}`);

  try {
    return JSON.parse(body);
  } catch {
    die(`Apify nije vratio JSON: ${body.slice(0, 500)}`);
  }
}

/**
 * Original, ne prevod.
 *
 * Actor vraća `text` kao izvorni tekst i `textTranslated` kao Google-ov prevod.
 * Prikazati prevod značilo bi potpisati tuđim imenom rečenice koje ta osoba
 * nije napisala, pa prevod ovde nikad ne ulazi.
 */
function originalText(r) {
  return String(r.text ?? "").trim();
}

function toIso(r) {
  const raw = r.publishedAtDate || r.publishAt;
  if (!raw) return new Date(0).toISOString();
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}

function normalize(r, syncedAt) {
  return {
    review_id: String(r.reviewId ?? ""),
    author_name: String(r.name ?? "").trim(),
    author_image: r.reviewerPhotoUrl || undefined,
    rating: Number(r.stars ?? 0),
    text: originalText(r),
    language: r.originalLanguage || undefined,
    published_at: toIso(r),
    review_link: r.reviewUrl || undefined,
    owner_answer: String(r.responseFromOwnerText ?? "").trim() || undefined,
    synced_at: syncedAt,
  };
}

// ── glavni tok ───────────────────────────────────────────────────────────────

const items = await fetchReviews();

if (RAW) {
  const path = "apify-raw.json";
  writeFileSync(path, JSON.stringify(items, null, 2));
  console.log(`Sirov odgovor upisan u ${path}`);
}

if (!Array.isArray(items)) {
  die("Apify nije vratio niz. Pokreni sa --raw i pogledaj stvarni oblik.");
}

const syncedAt = new Date().toISOString();
const reviews = items
  .map((r) => normalize(r, syncedAt))
  .filter((r) => r.review_id && r.rating > 0);

if (reviews.length === 0) {
  die("Apify je vratio nula upotrebljivih recenzija — ne diram bazu.");
}

// Actor uz svaku recenziju ponavlja podatke o mestu, pa je dovoljna prva stavka.
const place = items[0] ?? {};
const summary = {
  rating: Number(place.totalScore ?? 0) || null,
  count: Number(place.reviewsCount ?? 0) || null,
};

const withText = reviews.filter((r) => r.text);

console.log(`\nProfil: ${place.title ?? PLACE_URL}`);
console.log(`  ocena na profilu:   ${summary.rating ?? "nepoznato"}`);
console.log(`  ukupno recenzija:   ${summary.count ?? "nepoznato"}`);
console.log(`  dovučeno:           ${reviews.length}`);
console.log(`  od toga sa tekstom: ${withText.length}\n`);

for (const r of withText) {
  const datum = r.published_at.slice(0, 10);
  const jezik = r.language ? ` [${r.language}]` : "";
  console.log(`  ${"★".repeat(r.rating)} ${r.author_name} · ${datum}${jezik}`);
  console.log(`    ${r.text.replace(/\s+/g, " ").slice(0, 160)}`);
}

// Namerno bez `process.exit(0)` u uspešnom toku: `fetch` drži keep-alive
// socket, pa nasilan izlazak na Windows-u obara libuv uz „Assertion failed …
// UV_HANDLE_CLOSING". Petlja događaja se sama isprazni za koju sekundu.
if (!APPLY) {
  console.log("\nDry-run — ništa nije upisano. Dodaj --apply za upis.\n");
} else {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const result = await db.collection("google_reviews").bulkWrite(
      reviews.map((r) => ({
        updateOne: {
          filter: { review_id: r.review_id },
          // `hidden` se namerno ne dira — ručno sklonjena ostaje sklonjena.
          update: { $set: r },
          upsert: true,
        },
      })),
      { ordered: false }
    );

    if (summary.rating && summary.count) {
      await db.collection("site_config").updateOne(
        { key: SUMMARY_KEY },
        {
          $set: {
            rating: summary.rating,
            count: summary.count,
            synced_at: syncedAt,
          },
        },
        { upsert: true }
      );
    }

    console.log(
      `\n✓ Novih: ${result.upsertedCount} · ažuriranih: ${result.modifiedCount}\n`
    );
  } finally {
    await client.close();
  }
}
