import { MongoClient } from "mongodb";
import {
  reportSlugFootprint,
  renameCoupleSlug,
  deleteCoupleCascade,
} from "./lib/couple-slug.mjs";

// Client created 3 trial invitations for the same wedding (24.10.2026, Niš).
// Keep only the premium one (milos-andjela-luka-2), rename it to "andjela-milos",
// fix couple_names (child "Luka" was wrongly put into the names — he goes into
// the tagline instead, which the couple will rewrite themselves), carry over
// both contact phones from the standard variants, and delete the two standard
// trial records.
//
// Usage: node --env-file=.env.local scripts/consolidate-andjela-milos.mjs [--apply]

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

const KEEP_SLUG = "milos-andjela-luka-2";
const NEW_SLUG = "andjela-milos";
const DELETE_SLUGS = ["milos-andjela-luka", "milos-andjela-luka-3"];
const APPLY = process.argv.includes("--apply");

const KEEPER_FIXES = {
  couple_names: {
    bride: "Anđela",
    groom: "Miloš",
    full_display: "Anđela & Miloš",
  },
  contact_phone: "+38162306613,+381695240422",
  number_names: ["Anđela", "Miloš"],
  show_numbers: [true, true],
  potvrde_password: "Milos1026",
};

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db("halouspomene");
  const couples = db.collection("couples");

  const collision = await couples.findOne({ slug: NEW_SLUG });
  if (collision) {
    console.error(`[abort] slug "${NEW_SLUG}" already exists on couples`);
    process.exit(1);
  }

  let keeper = null;
  for (const slug of [KEEP_SLUG, ...DELETE_SLUGS]) {
    console.log(`\n== ${slug} ==`);
    const doc = await reportSlugFootprint(db, slug);
    if (slug === KEEP_SLUG) keeper = doc;
  }
  if (!keeper) {
    console.error(`[abort] keeper couple "${KEEP_SLUG}" not found`);
    process.exit(1);
  }
  if (!keeper.premium) {
    console.error(`[abort] keeper "${KEEP_SLUG}" is not the premium record`);
    process.exit(1);
  }

  if (!APPLY) {
    console.log("\n[dry-run] re-run with --apply to perform the consolidation");
    process.exit(0);
  }

  console.log(`\n[apply] fixing keeper fields + renaming "${KEEP_SLUG}" -> "${NEW_SLUG}"`);
  await renameCoupleSlug(db, KEEP_SLUG, NEW_SLUG, KEEPER_FIXES);

  for (const slug of DELETE_SLUGS) {
    console.log(`\n[apply] deleting "${slug}"`);
    await deleteCoupleCascade(db, slug);
  }

  console.log("\n[verify]");
  const post = await couples.findOne({ slug: NEW_SLUG });
  console.log(
    `  "${NEW_SLUG}": ${post ? "OK" : "MISSING"} — names=${JSON.stringify(post?.couple_names)} password=${post?.potvrde_password} phone=${post?.contact_phone}`,
  );
  for (const slug of [KEEP_SLUG, ...DELETE_SLUGS]) {
    const left = await couples.countDocuments({ slug });
    console.log(`  "${slug}" remaining: ${left}`);
  }
} finally {
  await client.close();
}
