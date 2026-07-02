import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db("halouspomene");

  for (const slug of ["katarina-marko", "katarina-marko-2"]) {
    console.log(`\n===== ${slug} =====`);
    const c = await db.collection("couples").findOne({ slug });
    if (!c) {
      console.log("  (not found)");
      continue;
    }
    // Print top-level keys with concise values
    const summary = {};
    for (const [k, v] of Object.entries(c)) {
      if (k === "_id") continue;
      if (Array.isArray(v)) summary[k] = `[Array(${v.length})]`;
      else if (v && typeof v === "object" && !(v instanceof Date)) summary[k] = `{Object keys: ${Object.keys(v).join(", ")}}`;
      else if (typeof v === "string" && v.length > 80) summary[k] = v.slice(0, 80) + "…";
      else summary[k] = v;
    }
    console.log(JSON.stringify(summary, null, 2));

    // Linked collections counts
    const portalCount = await db.collection("wedding_portal").countDocuments({ slug });
    const rsvpCount = await db.collection("rsvp_responses").countDocuments({ slug });
    const seatingCount = await db.collection("seating_layouts").countDocuments({ slug });
    const audioCount = await db.collection("audio_messages").countDocuments({ slug });
    console.log(`  wedding_portal: ${portalCount} | rsvp_responses: ${rsvpCount} | seating_layouts: ${seatingCount} | audio_messages: ${audioCount}`);
  }
} finally {
  await client.close();
}
