/**
 * Copy a rich (what + description) timeline from `jovana-milos` onto the
 * `viktor-paula` test premium couple, so the fountain theme's Schedule
 * section actually has subtitle metadata to display.
 *
 * Run: node --env-file=.env.local scripts/copy-timeline-to-viktor-paula.mjs
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI not set"); process.exit(1); }

const client = new MongoClient(uri);
try {
  await client.connect();
  const couples = client.db("halouspomene").collection("couples");

  const source = await couples.findOne(
    { slug: "jovana-milos" },
    { projection: { timeline: 1 } },
  );
  if (!source?.timeline?.length) {
    console.error("jovana-milos has no timeline");
    process.exit(1);
  }

  const result = await couples.updateOne(
    { slug: "viktor-paula" },
    { $set: { timeline: source.timeline } },
  );

  if (result.matchedCount === 0) {
    console.error("viktor-paula not found");
    process.exit(1);
  }
  console.log(`Copied ${source.timeline.length} timeline entries to viktor-paula.`);
  for (const t of source.timeline) {
    console.log(`  ${t.time}  ${t.title}  [what="${t.what || ""}", desc="${t.description || ""}"]`);
  }
} finally {
  await client.close();
}
