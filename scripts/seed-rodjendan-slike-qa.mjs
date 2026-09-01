/**
 * QA seed za "Fotografije" korak u rodjendan/punoletstvo builderu.
 *
 *   node --env-file=.env.local scripts/seed-rodjendan-slike-qa.mjs           # prikaz
 *   node --env-file=.env.local scripts/seed-rodjendan-slike-qa.mjs --apply   # napravi
 *   node --env-file=.env.local scripts/seed-rodjendan-slike-qa.mjs --clean   # obrisi
 *
 * Pravi cetiri draft zapisa u `birthday_events` (sa i bez `builder_images`, za
 * oba proizvoda), da bi se na /placanje/... proverilo da se pozivnica sa
 * fotografijama naplacuje po standardnoj ceni, a bez njih po ceni proslave.
 *
 * Bez `--apply` nista ne menja. Svi slugovi imaju prefiks `qa-slike-` i
 * skripta NIKAD ne dira zapise bez tog prefiksa — MONGODB_URI je u praksi
 * produkcija. `--clean` brise i eventualne `orders` redove tih slugova.
 */
import { MongoClient } from "mongodb";
import { randomInt } from "node:crypto";

const PREFIX = /^qa-slike-/;
const COLLECTIONS = ["birthday_events", "orders", "rsvp_responses"];

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db("halouspomene");

const APPLY = process.argv.includes("--apply");
const CLEAN = process.argv.includes("--clean");

async function clean() {
  for (const name of COLLECTIONS) {
    const r = await db.collection(name).deleteMany({ slug: PREFIX });
    if (r.deletedCount) console.log(`  ${name}: -${r.deletedCount}`);
  }
}

if (!APPLY && !CLEAN) {
  const n = await db
    .collection("birthday_events")
    .countDocuments({ slug: PREFIX });
  console.log(
    `DRY RUN - nista nije promenjeno.\n` +
      `  baza: ${db.databaseName}\n` +
      `  postojecih qa-slike- zapisa: ${n}\n` +
      `  --apply  obrisao bi ih i napravio 4 nova\n` +
      `  --clean  samo bi ih obrisao`,
  );
  await client.close();
  process.exit(0);
}

await clean();
if (CLEAN) {
  console.log("Obrisano.");
  await client.close();
  process.exit(0);
}

const now = new Date();
const eventDate = new Date(now.getTime() + 60 * 86_400_000)
  .toISOString()
  .slice(0, 10);

const base = (extra) => ({
  event_date: `${eventDate}T20:00:00`,
  submit_until: eventDate,
  location: { name: "Restoran QA", address: "Bulevar 1, Novi Sad" },
  countdown_enabled: true,
  map_enabled: true,
  admin_password: `QA${randomInt(1000, 10000)}`,
  contact_phone: "+381600000000",
  draft: true,
  created_at: now,
  ...extra,
});

const docs = [
  base({
    slug: "qa-slike-punoletstvo-sa",
    type: "eighteenth",
    theme: "white_gold_burgundy",
    gender: "girl",
    honoree_name: "Qa",
    honoree_surname: "Testeric",
    child_name: "Qa Testeric",
    parent_names: "",
    age: 18,
    tagline: "QA punoletstvo sa fotografijama",
    paid_for_images: true,
    builder_images: true,
  }),
  base({
    slug: "qa-slike-punoletstvo-bez",
    type: "eighteenth",
    theme: "white_gold_navy",
    gender: "boy",
    honoree_name: "Qa",
    honoree_surname: "Bezslika",
    child_name: "Qa Bezslika",
    parent_names: "",
    age: 18,
    tagline: "QA punoletstvo bez fotografija",
  }),
  base({
    slug: "qa-slike-rodjendan-sa",
    type: "child",
    theme: "boy_animals",
    gender: "boy",
    displayFont: "fredoka",
    child_name: "Qa Mali",
    parent_names: "QA roditelji",
    age: 5,
    tagline: "QA rodjendan sa fotografijama",
    paid_for_images: true,
    builder_images: true,
  }),
  base({
    slug: "qa-slike-rodjendan-bez",
    type: "child",
    theme: "boy_animals",
    gender: "boy",
    displayFont: "fredoka",
    child_name: "Qa Mali Bez",
    parent_names: "QA roditelji",
    age: 5,
    tagline: "QA rodjendan bez fotografija",
  }),
];

await db.collection("birthday_events").insertMany(docs);

console.log("Napravljeno:");
for (const d of docs) {
  const kind = d.type === "eighteenth" ? "punoletstvo" : "rodjendan";
  console.log(
    `  /placanje/${kind}/${d.slug}/   (builder_images: ${!!d.builder_images}, lozinka ${d.admin_password})`,
  );
}
await client.close();
