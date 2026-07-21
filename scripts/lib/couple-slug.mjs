// Shared helpers for cascading couple-slug operations across every MongoDB
// collection that keys documents by couple slug. Used by
// scripts/rename-couple-slug.mjs and one-off consolidation scripts.

// Keep in sync with the cascade in src/app/api/admin/couples/[slug]/route.ts
// (DELETE handler) — that's the authoritative list of slug-keyed collections.
export const LINKED_COLLECTIONS = [
  "rsvp_responses",
  "seating_layouts",
  "audio_messages",
  "wedding_portal",
  "gallery_photos",
  "share_links",
  "orders",
  "promo_redemptions",
];

/** Print per-collection doc counts for a slug (dry-run inspection). */
export async function reportSlugFootprint(db, slug) {
  const doc = await db.collection("couples").findOne({ slug });
  console.log(doc ? `  couples: found (premium=${!!doc.premium})` : "  couples: MISSING");
  if (doc && (doc.images?.length || doc.music_url)) {
    console.log(
      `  [warn] has blobs: images=${doc.images?.length ?? 0} music=${!!doc.music_url}`,
    );
  }
  for (const name of LINKED_COLLECTIONS) {
    const count = await db.collection(name).countDocuments({ slug });
    if (count > 0) console.log(`  ${name}: ${count} doc(s)`);
  }
  return doc;
}

/**
 * Cascading slug rename: linked collections first, couples last, so a partial
 * failure leaves the master record findable under the old slug for a retry.
 * `extraSet` merges additional field updates into the couples document.
 * Throws if the target slug is taken or the source couple doesn't exist.
 */
export async function renameCoupleSlug(db, oldSlug, newSlug, extraSet = {}) {
  const couples = db.collection("couples");

  const collision = await couples.findOne({ slug: newSlug });
  if (collision) throw new Error(`slug "${newSlug}" already exists on couples`);
  const source = await couples.findOne({ slug: oldSlug });
  if (!source) throw new Error(`no couple with slug "${oldSlug}" found`);

  for (const name of LINKED_COLLECTIONS) {
    const res = await db
      .collection(name)
      .updateMany({ slug: oldSlug }, { $set: { slug: newSlug } });
    if (res.matchedCount > 0)
      console.log(`  ${name}: renamed ${res.modifiedCount} doc(s)`);
  }
  const res = await couples.updateOne(
    { slug: oldSlug },
    { $set: { slug: newSlug, ...extraSet } },
  );
  console.log(`  couples: matched=${res.matchedCount} modified=${res.modifiedCount}`);
}

/**
 * Cascading delete of a couple and all its slug-keyed documents.
 * NOTE: does NOT clean up Vercel Blob / R2 objects — check for blobs first
 * (reportSlugFootprint warns) and use the admin panel delete for couples
 * with uploaded images/audio/gallery.
 */
export async function deleteCoupleCascade(db, slug) {
  for (const name of LINKED_COLLECTIONS) {
    const res = await db.collection(name).deleteMany({ slug });
    if (res.deletedCount > 0)
      console.log(`  ${name}: deleted ${res.deletedCount} doc(s)`);
  }
  const res = await db.collection("couples").deleteOne({ slug });
  console.log(`  couples: deleted ${res.deletedCount}`);
}
