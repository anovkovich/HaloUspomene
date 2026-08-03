/**
 * QA seed za "pozivnicu za dogadjaj" (Deploy 1-4).
 *
 *   node --env-file=.env.local scripts/seed-dogadjaj-qa.mjs           # prikaz
 *   node --env-file=.env.local scripts/seed-dogadjaj-qa.mjs --apply   # napravi
 *   node --env-file=.env.local scripts/seed-dogadjaj-qa.mjs --clean   # obrisi
 *
 * Bez `--apply` skripta samo ispisuje sta bi uradila i NISTA ne menja - isti
 * dry-run obrazac koji koristi scripts/rename-couple-slug.mjs. Bez toga je
 * `node scripts/seed-dogadjaj-qa.mjs` brisao pa upisivao u onu bazu na koju
 * pokazuje MONGODB_URI, a to je u praksi produkcija.
 *
 * Svi zapisi imaju prefiks `qa-` i brisu se `--clean` prelazom. Skripta NIKAD
 * ne dira zapise bez tog prefiksa, pa pravi kupci ne mogu da se ostete.
 *
 * PIN i check-in token se generisu na svakom pokretanju i ispisuju na kraju.
 */
import { MongoClient } from "mongodb";
import { randomBytes, randomInt } from "node:crypto";

const PREFIX = /^qa-/;

// Fresh per run, and printed at the end. Fixed values used to live here, which
// meant every seeded fixture carried credentials anyone could read out of the
// repo — and these fixtures run against the production database.
const PIN = String(randomInt(100000, 1000000));
const CHECKIN_TOKEN = randomBytes(16).toString("hex");

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db("halouspomene");

const COLLECTIONS = [
  "standalone_seatings",
  "rsvp_responses",
  "wedding_portal",
  "seating_layouts",
  "orders",
];

const APPLY = process.argv.includes("--apply");
const CLEAN = process.argv.includes("--clean");

async function clean() {
  for (const name of COLLECTIONS) {
    const r = await db.collection(name).deleteMany({ slug: PREFIX });
    if (r.deletedCount) console.log(`  ${name}: -${r.deletedCount}`);
  }
  console.log("Obrisano.");
}

if (!APPLY && !CLEAN) {
  const n = await db
    .collection("standalone_seatings")
    .countDocuments({ slug: PREFIX });
  console.log(
    `DRY RUN - nista nije promenjeno.
` +
      `  baza: ${db.databaseName}
` +
      `  postojecih qa- zapisa: ${n}
` +
      `  --apply  obrisao bi ih i napravio 3 nova
` +
      `  --clean  samo bi ih obrisao`,
  );
  await client.close();
  process.exit(0);
}

await clean();

if (CLEAN) {
  console.log(
    "Pravih rasporeda u bazi:",
    await db.collection("standalone_seatings").countDocuments({}),
  );
  await client.close();
  process.exit(0);
}

const now = new Date();

// Datum dogadjaja: za 60 dana, da rokovi i odbrojavanje imaju smisla.
const eventDate = new Date(now.getTime() + 60 * 86_400_000)
  .toISOString()
  .slice(0, 10);
const submitUntil = new Date(now.getTime() + 30 * 86_400_000)
  .toISOString()
  .slice(0, 10);

const base = {
  password: PIN,
  ownerName: "QA Tester",
  ownerPhone: "+381600000000",
  active: true,
  createdAt: now,
  updatedAt: now,
};

const guests = () => [
  { id: "g-1", name: "Marko Petrović", guestCount: 2, category: "VIP" },
  { id: "g-2", name: "Ana Jovanović", guestCount: 1 },
  { id: "g-3", name: "Огњен Иковић", guestCount: 4, category: "Govornici" },
  { id: "g-4", name: "Jelena Simić", guestCount: 2 },
  { id: "g-5", name: "Stefan Nikolić", guestCount: 1, category: "VIP" },
];

await db.collection("standalone_seatings").insertMany([
  // 1) Korporativni, pozivnica UKLJUCENA — glavni test
  {
    ...base,
    slug: "qa-korporativni",
    eventName: "Godišnjica 10 godina — Acme d.o.o.",
    eventKind: "corporate",
    eventDate,
    eventTime: "19:30",
    paid_for_invitation: true,
    checkin_token: CHECKIN_TOKEN,
    guests: guests(),
    invitation: {
      location: {
        name: "Hotel Metropol",
        address: "Bulevar kralja Aleksandra 69, Beograd",
        map_url:
          "https://maps.google.com/maps?q=Hotel%20Metropol%20Beograd&output=embed",
      },
      submitUntil,
      theme: "executive_navy",
      tagline: "Deset godina zajedno — hvala što ste deo naše priče.",
      dressCode: "Svečano",
      agenda: [
        { time: "19:30", title: "Koktel dobrodošlice" },
        { time: "20:30", title: "Svečana večera" },
        { time: "22:00", title: "Dodela priznanja" },
        { time: "23:00", title: "Muzika i druženje" },
      ],
    },
  },

  // 2) Korporativni BEZ pozivnice — /dogadjaj mora da vrati 404
  {
    ...base,
    slug: "qa-korporativni-bez-pozivnice",
    eventName: "Konferencija bez pozivnice",
    eventKind: "corporate",
    eventDate,
    guests: guests().slice(0, 2),
  },

  // 3) LEGACY: bez `eventKind` polja — tacan oblik svih 7 zivih zapisa.
  //    Mora da se ponasa kao ranije (planer + budzet vidljivi).
  {
    ...base,
    slug: "qa-legacy-bez-polja",
    eventName: "Maja & Ostoja",
    eventDate,
    guests: guests().slice(0, 3),
  },
]);

console.log(`
Napravljeno. PIN za sve: ${PIN}

  qa-korporativni                 korporativni, pozivnica UKLJUCENA
  qa-korporativni-bez-pozivnice   korporativni, pozivnica iskljucena
  qa-legacy-bez-polja             bez eventKind polja (kao pravi zapisi)

Link za hostesu:
  /raspored-sedenja/qa-korporativni/prijem/?h=${CHECKIN_TOKEN}
`);

await client.close();
