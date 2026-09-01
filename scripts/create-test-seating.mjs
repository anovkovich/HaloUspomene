// Local test helper: creates (or refreshes) a standalone seating with the
// audio guest book + QR photo gallery add-ons ENABLED and an event date of
// TODAY, so you can exercise the whole flow locally:
//   - admin "Raspored sedenja" tab (toggles, date edit)
//   - guest hub  /raspored-sedenja/test-hub/gde-sedim  (record audio, upload photo)
//   - owner portal /raspored-sedenja/test-hub/portal    (PIN below)
//
// Idempotent — re-run any time; it upserts by slug. Pass --clean to remove it.
//
//   node scripts/create-test-seating.mjs
//   node scripts/create-test-seating.mjs --clean
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const m = env.match(/MONGODB_URI\s*=\s*"?([^"\r\n]+)"?/);
if (!m) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}
const uri = m[1];

const SLUG = "test-hub";
const PIN = "123456"; // 6-digit numeric, matches the standalone format
const clean = process.argv.includes("--clean");

// Today's date as YYYY-MM-DD (audio/gallery windows require an event date).
const today = new Date().toISOString().slice(0, 10);

const guests = [
  { id: "g1", name: "Marko Petrović", guestCount: 2, category: "" },
  { id: "g2", name: "Jelena Jovanović", guestCount: 1, category: "VIP" },
  { id: "g3", name: "Nikola Nikolić", guestCount: 2, category: "" },
  { id: "g4", name: "Ana Anić", guestCount: 1, category: "" },
];

// Sample menu so the "Meni" tab shows up in both the guest hub and the portal.
const meni = {
  food: [
    { id: "mf1", kategorija: "predjelo", naziv: "Dalmatinski pršut i sir", opis: "Masline, domaći hleb" },
    { id: "mf2", kategorija: "glavno", naziv: "Punjena teletina", opis: "Mladi krompir, sezonsko povrće" },
    { id: "mf3", kategorija: "desert", naziv: "Torta", opis: "" },
  ],
  drinks: [
    { id: "md1", kategorija: "alkoholno", naziv: "Vranac", opis: "Crveno vino" },
    { id: "md2", kategorija: "bezalkoholno", naziv: "Prirodni sokovi", opis: "" },
  ],
};

// Two circle tables of 8; assign the guests to the first seats so "Gde sedim"
// and the portal fill-stats show real numbers.
function circle(id, label, x, assigned) {
  const assignments = Array.from({ length: 8 }, (_, i) =>
    assigned[i] ? { guestId: assigned[i].id, guestName: assigned[i].name } : null,
  );
  return { id, type: "circle", seats: 8, x, y: 200, label, assignments };
}
const tables = [
  circle("t1", "Sto 1", 200, [guests[0], guests[0], guests[1]]),
  circle("t2", "Sto 2", 500, [guests[2], guests[2], guests[3]]),
];

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db("halouspomene");
  const seatings = db.collection("standalone_seatings");
  const layouts = db.collection("seating_layouts");

  if (clean) {
    await seatings.deleteOne({ slug: SLUG });
    await layouts.deleteOne({ slug: SLUG });
    await db.collection("audio_messages").deleteMany({ slug: SLUG });
    await db.collection("gallery_photos").deleteMany({ slug: SLUG });
    await db.collection("wedding_portal").deleteOne({ slug: SLUG });
    console.log(`Removed test seating "${SLUG}" and its data.`);
    process.exit(0);
  }

  const now = new Date();
  await seatings.updateOne(
    { slug: SLUG },
    {
      $set: {
        ownerName: "Test Vlasnik",
        ownerPhone: "+381641234567",
        eventName: "Test Događaj",
        eventDate: today,
        password: PIN,
        guests,
        meni,
        active: true,
        paid_for_audio: true,
        paid_for_gallery: true,
        updatedAt: now,
      },
      $setOnInsert: { slug: SLUG, createdAt: now },
    },
    { upsert: true },
  );

  await layouts.updateOne(
    { slug: SLUG },
    { $set: { slug: SLUG, tables, members: {}, updatedAt: now } },
    { upsert: true },
  );

  const base = "http://localhost:3000";
  console.log("\n✅ Test seating spremljen.\n");
  console.log(`  Event:   Test Događaj  (datum: ${today})`);
  console.log(`  Slug:    ${SLUG}`);
  console.log(`  PIN:     ${PIN}`);
  console.log("");
  console.log("  Guest hub (QR pano cilj — snimi audio / dodaj sliku):");
  console.log(`    ${base}/raspored-sedenja/${SLUG}/gde-sedim`);
  console.log("  Owner portal (login PIN-om iznad):");
  console.log(`    ${base}/raspored-sedenja/${SLUG}/portal`);
  console.log("  Editor rasporeda:");
  console.log(`    ${base}/raspored-sedenja/${SLUG}`);
  console.log("  Admin tab: /admin → Raspored sedenja\n");
} finally {
  await client.close();
}
