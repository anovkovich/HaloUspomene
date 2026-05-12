/**
 * Seed a test premium couple using the Fountain theme.
 *
 * Reuses `ana-dejan`'s uploaded `images` array so we can visually verify the
 * gallery section without re-uploading photos. The seeded couple is created
 * with `draft: false` (visible in production) and `premium_paid: true` so the
 * 7-day post-event grace check passes during local testing.
 *
 * Run: node --env-file=.env.local scripts/seed-fountain-test.mjs
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set in environment");
  process.exit(1);
}

const TEST_SLUG = "viktor-paula";
const SOURCE_PHOTOS_SLUG = "ana-dejan";

// 30 days in the future — keeps countdown visible
const eventDate = new Date(Date.now() + 30 * 86400000);
const eventISO = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, "0")}-${String(eventDate.getDate()).padStart(2, "0")}T16:00:00`;
const submitUntil = new Date(eventDate.getTime() - 7 * 86400000);
const submitISO = `${submitUntil.getFullYear()}-${String(submitUntil.getMonth() + 1).padStart(2, "0")}-${String(submitUntil.getDate()).padStart(2, "0")}`;

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db("halouspomene");
  const couples = db.collection("couples");

  // Pull ana-dejan's images for the gallery
  const source = await couples.findOne(
    { slug: SOURCE_PHOTOS_SLUG },
    { projection: { images: 1 } },
  );
  if (!source) {
    console.error(`Source couple '${SOURCE_PHOTOS_SLUG}' not found.`);
    process.exit(1);
  }
  const images = source.images || [];
  console.log(`Pulled ${images.length} image(s) from ${SOURCE_PHOTOS_SLUG}.`);

  const data = {
    slug: TEST_SLUG,
    theme: "luxury_gold",
    scriptFont: "great-vibes",
    useCyrillic: false,
    potvrde_password: "Viktor1234",
    couple_names: {
      bride: "Paula",
      groom: "Viktor",
      full_display: "Viktor & Paula",
    },
    event_date: eventISO,
    submit_until: submitISO,
    tagline:
      "Spremamo se da kažemo 'da' — zahvalni smo na divnim ljudima u našim životima i radujemo se da ovaj dan podelimo s vama.",
    thankYouFooter: "Hvala vam što ste deo naše priče",
    locations: [
      {
        name: "Château de Paon",
        address: "Petit Chemin de Saint-Gilles, 13200 Arles, France",
        time: "16:00",
        type: "ceremony",
        map_url:
          "https://maps.google.com/maps?q=Arles%2C%20France&output=embed",
      },
    ],
    timeline: [
      { time: "16:00", title: "Wedding Ceremony", icon: "💒" },
      { time: "17:00", title: "Cocktail Hour", icon: "🥂" },
      { time: "19:00", title: "Dinner", icon: "🍽️" },
      { time: "20:00", title: "Party", icon: "🎉" },
    ],
    countdown_enabled: true,
    map_enabled: true,
    // Premium fountain
    premium: true,
    premium_theme: "fountain",
    premium_paid: true,
    envelope_style: "classic",
    envelope_rose_petals: true,
    // Gallery
    paid_for_images: true,
    images,
    image_layout: "line",
    draft: false,
  };

  const result = await couples.updateOne(
    { slug: TEST_SLUG },
    { $set: data },
    { upsert: true },
  );

  if (result.upsertedCount) {
    console.log(`Created '${TEST_SLUG}'.`);
  } else if (result.modifiedCount) {
    console.log(`Updated '${TEST_SLUG}'.`);
  } else {
    console.log(`'${TEST_SLUG}' already up-to-date.`);
  }
  console.log(`Preview: /premium-pozivnica/${TEST_SLUG}`);
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await client.close();
}
