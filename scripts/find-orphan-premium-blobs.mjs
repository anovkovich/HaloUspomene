// Pronalazi napuštene ("siroče") blobove pod `premium/` prefiksom na Vercel Blob-u.
//
//   node --env-file=.env.local scripts/find-orphan-premium-blobs.mjs
//   node --env-file=.env.local scripts/find-orphan-premium-blobs.mjs --apply
//
// Bez --apply ne briše ništa, samo izveštava.
//
// ─── Zašto tri nezavisne provere ─────────────────────────────────────────────
// Brisanje bloba koji je još u upotrebi trajno kvari tuđu pozivnicu, pa jedna
// provera nije dovoljna. Blob se proglašava siročetom SAMO ako padne sve tri:
//
//   1. REFERENCA  — njegov URL se ne pojavljuje NIGDE ni u jednoj kolekciji
//                   cele baze. Ne gleda se samo `ai_couple_image_url` nego se
//                   svaki dokument pretražuje regexom, pa i polja za koja ne
//                   znamo da postoje ulaze u proveru.
//   2. VLASNIK    — entitet iz kog je putanja izvedena više ne postoji:
//                   `premium/whitened/{slug}/`        -> nema para s tim slugom
//                   `premium/results/{mlada}_{mladoženja}/` -> nema para s tim imenima
//                   Ako par postoji, blob ostaje čak i kad na njega niko ne
//                   pokazuje — mogla bi da bude ranija verzija ilustracije.
//   3. STAROST    — blob je stariji od MIN_AGE_DANA. `premium/uploads/` fajlovi
//                   nastaju TOKOM popunjavanja upitnika, pre nego što par uopšte
//                   postoji u bazi, pa bi svež upload izgledao kao siroče.
//
// Na kraju ide i ponovna provera reference (pass 2), za slučaj da je neko
// sačuvao pozivnicu dok je skripta radila.

import { MongoClient } from "mongodb";
import { list, del } from "@vercel/blob";

const APPLY = process.argv.includes("--apply");
const MIN_AGE_DANA = 30;
const PREFIX = "premium/";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Nedostaje MONGODB_URI");
if (!process.env.BLOB_READ_WRITE_TOKEN)
  throw new Error("Nedostaje BLOB_READ_WRITE_TOKEN");

const client = new MongoClient(uri);
await client.connect();
const db = client.db("halouspomene");

// ─── 1. Svi blobovi pod premium/ ─────────────────────────────────────────────
const blobs = [];
let cursor;
do {
  const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
  blobs.push(...page.blobs);
  cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);

console.log(`Blobova pod "${PREFIX}": ${blobs.length}`);
if (blobs.length === 0) {
  await client.close();
  process.exit(0);
}

// ─── 2. Sve blob-reference iz CELE baze ──────────────────────────────────────
// Skupljamo pathname svakog blob URL-a koji se pojavi bilo gde, u bilo kojoj
// kolekciji. Poredimo po pathname-u, ne po celom URL-u, jer isti objekat ume da
// bude sačuvan i preko drugog hosta/domena.
const URL_RE = /https?:\/\/[^"'\s\\)]+/g;
// Neka polja (npr. `images[]`) čuvaju goli pathname bez hosta, pa se traži i
// sirova putanja — inače bi takva referenca promakla i blob bi ispao siroče.
const PATH_RE = /premium\/(?:results|whitened|uploads)\/[^"'\s\\)]+/g;

function pathnameOf(url) {
  try {
    return decodeURIComponent(new URL(url).pathname.replace(/^\/+/, ""));
  } catch {
    return null;
  }
}

async function skupiReference() {
  const referencirano = new Map(); // pathname -> "kolekcija:_id"
  const kolekcije = await db.listCollections().toArray();
  for (const { name } of kolekcije) {
    const kursor = db.collection(name).find({});
    for await (const doc of kursor) {
      const tekst = JSON.stringify(doc);
      if (
        !tekst.includes("blob.vercel-storage.com") &&
        !tekst.includes("premium/")
      )
        continue;
      const izvor = `${name}:${doc._id}`;
      for (const url of tekst.match(URL_RE) ?? []) {
        if (!url.includes("blob.vercel-storage.com")) continue;
        const p = pathnameOf(url);
        if (p && !referencirano.has(p)) referencirano.set(p, izvor);
      }
      for (const raw of tekst.match(PATH_RE) ?? []) {
        const p = decodeURIComponent(raw);
        if (!referencirano.has(p)) referencirano.set(p, `${izvor} (putanja)`);
      }
    }
  }
  return referencirano;
}

const referencirano = await skupiReference();
console.log(`Blob referenci nađeno u bazi: ${referencirano.size}`);

// ─── 3. Živi vlasnici (slugovi i imena parova) ───────────────────────────────
const parovi = await db
  .collection("couples")
  .find({}, { projection: { slug: 1, couple_names: 1 } })
  .toArray();

// Putanja i slug se razilaze češće nego što se čini: blob nosi dijakritiku
// ("nataša-zlatko") dok slug ne mora, a duplikati dobijaju numerički sufiks
// ("natasa-zlatko-2"). Poređenje doslovnih stringova takav par proglasi
// siročetom iako je živ, pa se sve svodi na isti oblik pre poređenja.
function normalizuj(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "dj")
    .trim()
    .toLowerCase();
}
const bezSufiksa = (s) => normalizuj(s).replace(/-\d+$/, "");

const zivSlug = new Set();
const zivImenskiKljuc = new Set();
for (const c of parovi) {
  if (c.slug) {
    zivSlug.add(normalizuj(c.slug));
    zivSlug.add(bezSufiksa(c.slug));
  }
  const b = c.couple_names?.bride && normalizuj(c.couple_names.bride);
  const g = c.couple_names?.groom && normalizuj(c.couple_names.groom);
  if (b && g) zivImenskiKljuc.add(`${b}_${g}`);
}

console.log(`Živih parova: ${parovi.length}\n`);

// ─── 4. Klasifikacija ────────────────────────────────────────────────────────
const sada = Date.now();
const kandidati = [];
const zadrzani = [];
const nejasni = []; // putanja ne odgovara nijednoj poznatoj šemi — nikad se ne briše

for (const b of blobs) {
  const p = b.pathname;
  const razlozi = [];
  const danaStar = (sada - new Date(b.uploadedAt).getTime()) / 86400000;

  // provera 1 — referenca
  const ref = referencirano.get(p);
  if (ref) razlozi.push(`referencira ga ${ref}`);

  // provera 2 — vlasnik
  const mWhitened = p.match(/^premium\/whitened\/([^/]+)\//);
  const mResults = p.match(/^premium\/results\/([^/]+)\//);
  const mUploads = p.match(/^premium\/uploads\/[^/]+$/);
  if (mWhitened) {
    const seg = normalizuj(mWhitened[1]);
    if (zivSlug.has(seg) || zivSlug.has(bezSufiksa(seg)))
      razlozi.push(`postoji par sa slugom "${mWhitened[1]}"`);
  } else if (mResults) {
    if (zivImenskiKljuc.has(normalizuj(mResults[1])))
      razlozi.push(`postoji par sa imenima "${mResults[1]}"`);
  } else if (!mUploads) {
    // Nepoznat oblik putanje (npr. stara šema bez slug segmenta) — vlasnik se
    // ne može utvrditi, pa ide na ručnu proveru umesto u automatsko brisanje.
    nejasni.push({ b, danaStar, ref });
    continue;
  }

  // provera 3 — starost
  if (danaStar < MIN_AGE_DANA)
    razlozi.push(`star tek ${danaStar.toFixed(1)} dana (< ${MIN_AGE_DANA})`);

  if (razlozi.length > 0) zadrzani.push({ b, razlozi });
  else kandidati.push({ b, danaStar });
}

// ─── 5. Pass 2 — ponovo skupi reference i preseci ────────────────────────────
let potvrdjeni = kandidati;
if (kandidati.length > 0) {
  console.log("Pass 2: ponovo proveravam reference...\n");
  const opet = await skupiReference();
  potvrdjeni = kandidati.filter(({ b }) => !opet.has(b.pathname));
  const izgubljeni = kandidati.length - potvrdjeni.length;
  if (izgubljeni > 0)
    console.log(`[!] ${izgubljeni} kandidat(a) je u međuvremenu referenciran — izbačeni.\n`);
}

// ─── 6. Izveštaj ─────────────────────────────────────────────────────────────
const grupa = (p) => p.split("/").slice(0, 2).join("/");
const zbir = {};
for (const { b } of potvrdjeni) {
  const g = grupa(b.pathname);
  zbir[g] = zbir[g] ?? { n: 0, bajtova: 0 };
  zbir[g].n += 1;
  zbir[g].bajtova += b.size;
}

console.log(`ZADRŽANO (u upotrebi ili presveže): ${zadrzani.length}`);
console.log(`SIROČAD (palo sve 3 provere + pass 2): ${potvrdjeni.length}\n`);

if (potvrdjeni.length > 0) {
  for (const [g, v] of Object.entries(zbir))
    console.log(`  ${g.padEnd(20)} ${String(v.n).padStart(4)} fajl(ova)  ${(v.bajtova / 1048576).toFixed(2)} MB`);
  const ukupno = potvrdjeni.reduce((s, { b }) => s + b.size, 0);
  console.log(`  ${"UKUPNO".padEnd(20)} ${String(potvrdjeni.length).padStart(4)} fajl(ova)  ${(ukupno / 1048576).toFixed(2)} MB\n`);

  console.log("--- spisak ---");
  for (const { b, danaStar } of potvrdjeni)
    console.log(`  ${b.pathname}  (${(b.size / 1024).toFixed(0)} KB, ${danaStar.toFixed(0)} dana)`);
}

if (nejasni.length > 0) {
  console.log(`\n--- ZA RUČNU PROVERU: ${nejasni.length} (nepoznata šema putanje, --apply ih NE dira) ---`);
  for (const { b, danaStar, ref } of nejasni)
    console.log(`  ${b.pathname}  (${(b.size / 1024).toFixed(0)} KB, ${danaStar.toFixed(0)} dana)${ref ? `  [referencira ga ${ref}]` : "  [bez reference]"}`);
}

// Uzorak zadržanih, da se vidi da provere stvarno hvataju
if (zadrzani.length > 0) {
  console.log(`\n--- zašto su neki zadržani (prvih 10 od ${zadrzani.length}) ---`);
  for (const { b, razlozi } of zadrzani.slice(0, 10))
    console.log(`  ${b.pathname}\n      -> ${razlozi.join("; ")}`);
}

// ─── 7. Brisanje ─────────────────────────────────────────────────────────────
if (!APPLY) {
  console.log("\n--- DRY RUN, ništa nije obrisano. Dodaj --apply. ---");
} else if (potvrdjeni.length === 0) {
  console.log("\nNema šta da se briše.");
} else {
  console.log(`\n--- BRIŠEM ${potvrdjeni.length} blob(ova) ---`);
  let ok = 0;
  for (const { b } of potvrdjeni) {
    try {
      await del(b.url);
      ok += 1;
    } catch (e) {
      console.log(`  [greška] ${b.pathname}: ${e.message}`);
    }
  }
  console.log(`Obrisano: ${ok}/${potvrdjeni.length}`);
}

await client.close();
