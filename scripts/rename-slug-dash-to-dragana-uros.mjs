import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error(
    "MONGODB_URI not set. Run with: node --env-file=.env.local scripts/rename-slug-dash-to-dragana-uros.mjs [--apply]",
  );
  process.exit(1);
}

const OLD_SLUG = "-";
const NEW_SLUG = "dragana-uros";
const APPLY = process.argv.includes("--apply");

// All collections that store the slug as a key/field. Order: couples last so
// that if anything fails, the broken master record stays so we can retry.
const COLLECTIONS = [
  "rsvp_responses",
  "seating_layouts",
  "audio_messages",
  "wedding_portal",
  "couples",
];

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db("halouspomene");

  // Sanity check: target slug must not already exist on couples
  const collision = await db.collection("couples").findOne({ slug: NEW_SLUG });
  if (collision) {
    console.error(
      `[abort] slug "${NEW_SLUG}" already exists on couples — pick a different target`,
    );
    process.exit(1);
  }

  // Find broken couple
  const broken = await db.collection("couples").findOne({ slug: OLD_SLUG });
  if (!broken) {
    console.error(`[abort] no couple with slug "${OLD_SLUG}" found`);
    process.exit(1);
  }

  console.log(
    `[found] couple at slug "${OLD_SLUG}":`,
    JSON.stringify(
      {
        couple_names: broken.couple_names,
        useCyrillic: broken.useCyrillic,
        premium: broken.premium,
        event_date: broken.event_date,
        created_at: broken.created_at,
      },
      null,
      2,
    ),
  );

  // Per-collection counts
  for (const name of COLLECTIONS) {
    const c = db.collection(name);
    const count = await c.countDocuments({ slug: OLD_SLUG });
    console.log(`  ${name}: ${count} doc(s) with slug "${OLD_SLUG}"`);
  }

  if (!APPLY) {
    console.log("\n[dry-run] re-run with --apply to perform the rename");
    process.exit(0);
  }

  console.log(`\n[apply] renaming slug "${OLD_SLUG}" -> "${NEW_SLUG}"`);
  for (const name of COLLECTIONS) {
    const c = db.collection(name);
    const res = await c.updateMany(
      { slug: OLD_SLUG },
      { $set: { slug: NEW_SLUG } },
    );
    console.log(
      `  ${name}: matched=${res.matchedCount} modified=${res.modifiedCount}`,
    );
  }

  // Verify
  const post = await db.collection("couples").findOne({ slug: NEW_SLUG });
  console.log(
    `\n[verify] couple now at slug "${NEW_SLUG}":`,
    post ? "OK" : "MISSING",
  );
  const stillBroken = await db.collection("couples").countDocuments({ slug: OLD_SLUG });
  console.log(`[verify] remaining couples at "${OLD_SLUG}": ${stillBroken}`);
} finally {
  await client.close();
}
