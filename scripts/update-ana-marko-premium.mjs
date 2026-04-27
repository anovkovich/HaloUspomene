import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set. Run with: node --env-file=.env.local scripts/update-ana-marko-premium.mjs");
  process.exit(1);
}

const SLUG = "ana-marko";
const UPDATES = {
  premium_city: "zica",
  premium_car: "mercedes_190_sl",
};

const client = new MongoClient(uri);

try {
  await client.connect();
  const couples = client.db("halouspomene").collection("couples");

  const before = await couples.findOne(
    { slug: SLUG },
    { projection: { slug: 1, premium_city: 1, premium_car: 1, _id: 0 } },
  );
  if (!before) {
    console.error(`No couple with slug "${SLUG}" found in couples collection.`);
    process.exit(2);
  }
  console.log("BEFORE:", before);

  const res = await couples.updateOne({ slug: SLUG }, { $set: UPDATES });
  console.log(`Matched ${res.matchedCount}, modified ${res.modifiedCount}`);

  const after = await couples.findOne(
    { slug: SLUG },
    { projection: { slug: 1, premium_city: 1, premium_car: 1, _id: 0 } },
  );
  console.log("AFTER:", after);
} finally {
  await client.close();
}
