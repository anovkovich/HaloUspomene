import { MongoClient } from "mongodb";

// Correct church address for andjela-milos: Kosovke Devojke 23 -> 34
// (appears in locations[0].address, locations[0].map_url and timeline[0].description)

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const couples = client.db("halouspomene").collection("couples");

  const res = await couples.updateOne(
    { slug: "andjela-milos" },
    {
      $set: {
        "locations.0.address": "Kosovke Devojke 34, Niš",
        "locations.0.map_url":
          "https://maps.google.com/maps?q=Crkva%20Sv%20Pantelejmona%2C%20Kosovke%20Devojke%2034%2C%20Ni%C5%A1&output=embed",
        "timeline.0.description": "Kosovke Devojke 34, Niš",
      },
    },
  );
  console.log(`matched=${res.matchedCount} modified=${res.modifiedCount}`);

  const post = await couples.findOne(
    { slug: "andjela-milos" },
    { projection: { locations: 1, "timeline.description": 1 } },
  );
  console.log(JSON.stringify(post.locations[0], null, 2));
  console.log(JSON.stringify(post.timeline, null, 2));
} finally {
  await client.close();
}
