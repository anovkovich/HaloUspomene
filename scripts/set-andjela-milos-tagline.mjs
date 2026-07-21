import { MongoClient } from "mongodb";

// New tagline: wedding + Luka's christening + first birthday in one day.

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const couples = client.db("halouspomene").collection("couples");
  const res = await couples.updateOne(
    { slug: "andjela-milos" },
    {
      $set: {
        tagline:
          "Jedan dan, tri najlepša razloga za slavlje — naše venčanje, Lukino krštenje i njegov prvi rođendan. Budite deo naše priče!",
      },
    },
  );
  const post = await couples.findOne(
    { slug: "andjela-milos" },
    { projection: { tagline: 1 } },
  );
  console.log(`matched=${res.matchedCount} modified=${res.modifiedCount}`);
  console.log(`tagline: ${post.tagline}`);
} finally {
  await client.close();
}
