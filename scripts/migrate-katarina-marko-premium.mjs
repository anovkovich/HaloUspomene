/**
 * One-off migration: merge premium content from `katarina-marko-2` onto the
 * live `katarina-marko` couple (which has the active wedding_portal record),
 * then delete `-2` from couples collection (raw delete — blobs survive so the
 * ai_couple_image_url URL keeps resolving).
 *
 * Fields pulled from -2 (content / presentation):
 *   premium, premium_theme, premium_city, premium_car, ai_couple_image_url,
 *   couple_description, envelope_items, envelope_style, envelope_rose_petals,
 *   theme, scriptFont, useCyrillic, tagline, thankYouFooter, couple_names,
 *   locations, timeline, event_date, submit_until, countdown_enabled,
 *   map_enabled, draft
 *
 * Fields preserved on katarina-marko (infra / payments):
 *   slug, potvrde_password, contact_phone, contact_instagram, created_at,
 *   receipt_valid, receipt_created, custom_discount, paid_for_*
 *
 * Set: premium_paid: true (user confirmed payment).
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

const LIVE = "katarina-marko";
const SOURCE = "katarina-marko-2";

const CONTENT_FIELDS = [
  "premium",
  "premium_theme",
  "premium_city",
  "premium_car",
  "ai_couple_image_url",
  "couple_description",
  "envelope_items",
  "envelope_style",
  "envelope_rose_petals",
  "theme",
  "scriptFont",
  "useCyrillic",
  "tagline",
  "thankYouFooter",
  "couple_names",
  "locations",
  "timeline",
  "event_date",
  "submit_until",
  "countdown_enabled",
  "map_enabled",
  "draft",
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const couples = client.db("halouspomene").collection("couples");

  const live = await couples.findOne({ slug: LIVE });
  const src = await couples.findOne({ slug: SOURCE });

  if (!live) {
    console.error(`Live couple "${LIVE}" not found.`);
    process.exit(2);
  }
  if (!src) {
    console.error(`Source couple "${SOURCE}" not found.`);
    process.exit(3);
  }

  console.log(`BEFORE (${LIVE}):`);
  console.log(
    "  premium:", live.premium,
    "| theme:", live.theme,
    "| event_date:", live.event_date,
    "| draft:", live.draft,
    "| potvrde_password:", live.potvrde_password,
  );

  // Build $set payload from source's content fields + premium_paid.
  const $set = { premium_paid: true };
  for (const k of CONTENT_FIELDS) {
    if (k in src) $set[k] = src[k];
  }

  console.log("\nApplying $set keys:", Object.keys($set).join(", "));

  const upd = await couples.updateOne({ slug: LIVE }, { $set });
  console.log(`  matched=${upd.matchedCount} modified=${upd.modifiedCount}`);

  const after = await couples.findOne({ slug: LIVE });
  console.log(`\nAFTER (${LIVE}):`);
  console.log(
    "  premium:", after.premium,
    "| premium_paid:", after.premium_paid,
    "| premium_theme:", after.premium_theme,
    "| theme:", after.theme,
    "| event_date:", after.event_date,
    "| submit_until:", after.submit_until,
    "| draft:", after.draft,
  );
  console.log(
    "  potvrde_password:", after.potvrde_password,
    "| contact_phone:", after.contact_phone,
    "| receipt_valid:", after.receipt_valid,
    "| custom_discount:", after.custom_discount,
  );
  console.log(
    "  ai_couple_image_url:", after.ai_couple_image_url?.slice(0, 80) + "…",
  );

  // Now delete the -2 record (raw delete — blobs survive).
  const del = await couples.deleteOne({ slug: SOURCE });
  console.log(`\nDeleted "${SOURCE}": deletedCount=${del.deletedCount}`);

  const stillThere = await couples.findOne({ slug: SOURCE });
  console.log(`Verify "${SOURCE}" gone: ${stillThere === null ? "YES" : "NO — still present!"}`);
} finally {
  await client.close();
}
