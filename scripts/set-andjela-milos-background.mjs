import { MongoClient } from "mongodb";

// Switch andjela-milos watercolor background to the custom
// hram_pantelejmona key (Crkva Sv Pantelejmona, Niš — their church).

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const couples = client.db("halouspomene").collection("couples");
  const res = await couples.updateOne(
    { slug: "andjela-milos" },
    { $set: { premium_city: "hram_pantelejmona" } },
  );
  const post = await couples.findOne(
    { slug: "andjela-milos" },
    { projection: { premium_city: 1, premium_theme: 1 } },
  );
  console.log(`matched=${res.matchedCount} modified=${res.modifiedCount}`);
  console.log(`premium_theme=${post.premium_theme} premium_city=${post.premium_city}`);
} finally {
  await client.close();
}
