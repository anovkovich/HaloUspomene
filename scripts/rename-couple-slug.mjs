import { MongoClient } from "mongodb";
import { reportSlugFootprint, renameCoupleSlug } from "./lib/couple-slug.mjs";

// Reusable cascading slug rename for a couple. Renames the slug across every
// slug-keyed collection (RSVP, seating, audio, portal, gallery, share links,
// orders, promo redemptions) and the couples master record.
//
// Usage:
//   node --env-file=.env.local scripts/rename-couple-slug.mjs <old-slug> <new-slug> [--apply]

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set. Run with: node --env-file=.env.local scripts/rename-couple-slug.mjs <old-slug> <new-slug> [--apply]");
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => a !== "--apply");
const APPLY = process.argv.includes("--apply");
const [OLD_SLUG, NEW_SLUG] = args;

if (!OLD_SLUG || !NEW_SLUG || OLD_SLUG === NEW_SLUG) {
  console.error("Usage: node --env-file=.env.local scripts/rename-couple-slug.mjs <old-slug> <new-slug> [--apply]");
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(NEW_SLUG)) {
  console.error(`[abort] new slug "${NEW_SLUG}" must be lowercase ASCII letters, digits and dashes`);
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db("halouspomene");

  const collision = await db.collection("couples").findOne({ slug: NEW_SLUG });
  if (collision) {
    console.error(`[abort] slug "${NEW_SLUG}" already exists on couples`);
    process.exit(1);
  }

  console.log(`== ${OLD_SLUG} ==`);
  const doc = await reportSlugFootprint(db, OLD_SLUG);
  if (!doc) {
    console.error(`[abort] no couple with slug "${OLD_SLUG}" found`);
    process.exit(1);
  }

  if (!APPLY) {
    console.log(`\n[dry-run] re-run with --apply to rename "${OLD_SLUG}" -> "${NEW_SLUG}"`);
    process.exit(0);
  }

  console.log(`\n[apply] renaming "${OLD_SLUG}" -> "${NEW_SLUG}"`);
  await renameCoupleSlug(db, OLD_SLUG, NEW_SLUG);

  const post = await db.collection("couples").findOne({ slug: NEW_SLUG });
  console.log(`\n[verify] couple at "${NEW_SLUG}": ${post ? "OK" : "MISSING"}`);
  const remaining = await db.collection("couples").countDocuments({ slug: OLD_SLUG });
  console.log(`[verify] remaining couples at "${OLD_SLUG}": ${remaining}`);
} finally {
  await client.close();
}
