import { MongoClient } from "mongodb";

// thankYouFooter was in past tense ("Hvala što ste bili deo naše bajke!") —
// rephrase to present: "Hvala što ste deo naše bajke!"

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const couples = client.db("halouspomene").collection("couples");
  const res = await couples.updateOne(
    { slug: "andjela-milos" },
    {
      $set: {
        thankYouFooter:
          "Najlepše uspomene nastaju sa najdražim ljudima. Hvala što ste deo naše bajke!",
      },
    },
  );
  const post = await couples.findOne(
    { slug: "andjela-milos" },
    { projection: { thankYouFooter: 1 } },
  );
  console.log(`matched=${res.matchedCount} modified=${res.modifiedCount}`);
  console.log(`thankYouFooter: ${post.thankYouFooter}`);
} finally {
  await client.close();
}
