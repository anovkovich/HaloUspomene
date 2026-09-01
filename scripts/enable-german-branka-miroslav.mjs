import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error(
    "MONGODB_URI not set. Run with: node --env-file=.env.local scripts/enable-german-branka-miroslav.mjs",
  );
  process.exit(1);
}

const SLUG = "branka-miroslav";

// Top-level fields. Locations/timeline use Mongo dot-notation positional
// keys further below. We only set _de variants that meaningfully differ
// from the Serbian original — when a _de field is missing, the renderer
// falls back to the base value automatically (see localized() helper).
const UPDATES = {
  german_enabled: true,

  // Free-form copy fields, formal "Sie".
  tagline_de:
    "Wir heiraten! 🎉\nUnd möchten diesen besonderen Tag mit Ihnen feiern!\nFeiern Sie mit uns",
  thankYouFooter_de:
    "Liebe, Lachen und beste Stimmung erwarten Sie — verpassen Sie es nicht!",

  // timeline[0]: original `what` is "Skup u svečanoj sali" — translate that
  // step caption. Title/description are intentionally left untranslated
  // because the Serbian values (empty title, address-only description)
  // work as-is in either language.
  "timeline.0.what_de": "Empfang im Festsaal",

  // locations[0]: name is empty, address "Borač" is a town name that
  // doesn't translate. Leaving _de fields unset; renderer falls back.
};

const client = new MongoClient(uri);
try {
  await client.connect();
  const couples = client.db("halouspomene").collection("couples");

  const before = await couples.findOne(
    { slug: SLUG },
    {
      projection: {
        _id: 0,
        slug: 1,
        german_enabled: 1,
        tagline: 1,
        tagline_de: 1,
        thankYouFooter: 1,
        thankYouFooter_de: 1,
        timeline: 1,
      },
    },
  );
  if (!before) {
    console.error(`No couple with slug "${SLUG}" found.`);
    process.exit(2);
  }
  console.log("BEFORE:", JSON.stringify(before, null, 2));

  const res = await couples.updateOne({ slug: SLUG }, { $set: UPDATES });
  console.log(`Matched ${res.matchedCount}, modified ${res.modifiedCount}`);

  const after = await couples.findOne(
    { slug: SLUG },
    {
      projection: {
        _id: 0,
        slug: 1,
        german_enabled: 1,
        tagline_de: 1,
        thankYouFooter_de: 1,
        timeline: 1,
      },
    },
  );
  console.log("AFTER:", JSON.stringify(after, null, 2));
} finally {
  await client.close();
}
