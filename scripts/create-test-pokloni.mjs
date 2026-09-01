// Local test helper: creates (or refreshes) a couple with event_date = TODAY
// and a small guest list, so the new "Pokloni" tab on /moje-vencanje can be
// exercised end-to-end (button only shows on/after the wedding day).
//
// Idempotent — re-run any time; it upserts by slug. Pass --clean to remove it.
//
//   node scripts/create-test-pokloni.mjs
//   node scripts/create-test-pokloni.mjs --clean
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const m = env.match(/MONGODB_URI\s*=\s*"?([^"\r\n]+)"?/);
if (!m) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}
const uri = m[1];

const SLUG = "test-pokloni";
const PASSWORD = "Marko1234"; // GroomName + 4 digits, matches pozivnica/moje-vencanje format
const clean = process.argv.includes("--clean");

const today = new Date().toISOString().slice(0, 10);

const invitees = [
  { id: "i1", name: "Petar Petrović", count: 2, sectionId: "", category: "Mladini", status: "confirmed" },
  { id: "i2", name: "Jovana Jovanović", count: 1, sectionId: "", category: "Mladozenjini", status: "confirmed" },
  { id: "i3", name: "Nikola Nikolić", count: 3, sectionId: "", category: "Zajednicki", status: "invited" },
];

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db("halouspomene");
  const couples = db.collection("couples");
  const portal = db.collection("wedding_portal");
  const pokloni = db.collection("pokloni");

  if (clean) {
    await couples.deleteOne({ slug: SLUG });
    await portal.deleteOne({ slug: SLUG });
    await pokloni.deleteOne({ slug: SLUG });
    console.log(`Removed test couple "${SLUG}" and its data.`);
    process.exit(0);
  }

  const now = new Date();
  await couples.updateOne(
    { slug: SLUG },
    {
      $set: {
        couple_names: { bride: "Ana", groom: "Marko", full_display: "Ana & Marko" },
        event_date: today,
        submit_until: today,
        potvrde_password: PASSWORD,
        draft: false,
        theme: "classic",
        scriptFont: "great-vibes",
        useCyrillic: false,
        premium: false,
        premium_paid: false,
        paid_for_gallery: false,
        updatedAt: now,
      },
      $setOnInsert: { slug: SLUG, createdAt: now },
    },
    { upsert: true },
  );

  await portal.updateOne(
    { slug: SLUG },
    {
      $set: {
        guestList: { sections: [], invitees },
        updatedAt: now,
      },
      $setOnInsert: {
        slug: SLUG,
        checklist: [],
        budget: { totalBudget: 0, categories: [] },
        vendorFavorites: [],
        createdAt: now,
      },
    },
    { upsert: true },
  );

  console.log("\n✅ Test par spreman.\n");
  console.log(`  Slug:     ${SLUG}`);
  console.log(`  Lozinka:  ${PASSWORD}`);
  console.log(`  Datum:    ${today} (danas — Pokloni dugme treba da bude vidljivo)`);
  console.log("");
  console.log("  http://localhost:3000/moje-vencanje  (uloguj se sa slug + lozinka)\n");
} finally {
  await client.close();
}
