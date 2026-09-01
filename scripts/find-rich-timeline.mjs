import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI not set"); process.exit(1); }

const client = new MongoClient(uri);
try {
  await client.connect();
  const couples = client.db("halouspomene").collection("couples");

  const all = await couples
    .find({
      "timeline.0": { $exists: true },
      $or: [
        { "timeline.what": { $exists: true, $ne: "" } },
        { "timeline.description": { $exists: true, $ne: "" } },
      ],
    })
    .project({ slug: 1, timeline: 1, couple_names: 1 })
    .limit(20)
    .toArray();

  for (const c of all) {
    const hasWhat = c.timeline.some((t) => t.what && String(t.what).trim());
    const hasDesc = c.timeline.some((t) => t.description && String(t.description).trim());
    if (!hasWhat && !hasDesc) continue;
    console.log(`\n=== ${c.slug} (${c.couple_names?.full_display || ""}) — what:${hasWhat} desc:${hasDesc}`);
    for (const t of c.timeline) {
      console.log(`  ${t.time}  title="${t.title}"  what="${t.what || ""}"  desc="${t.description || ""}"`);
    }
  }
} finally {
  await client.close();
}
