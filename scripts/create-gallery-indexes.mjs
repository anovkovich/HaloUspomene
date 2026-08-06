/**
 * Indexes for `gallery_photos`.
 *
 * The collection shipped with only `_id_`, so every query was a collection scan.
 * That is worst exactly when it hurts most: each upload confirm runs THREE
 * counts (per slug, per device, per IP) before it writes, so a wedding pushing
 * 500 photos did ~1500 full scans over a collection that grows all evening.
 *
 * Index → query map:
 *   {slug, approved, createdAt}  getGalleryPhotos (list, newest-first) and the
 *                                per-uploader aggregation on the guest page;
 *                                also serves getGalleryPhotoCount via prefix
 *   {slug, uploaderId}           per-device cap + renameGalleryUploader
 *   {slug, ip}                   per-IP backstop cap
 *
 * `slug` leads every index because every query is scoped to one event, and
 * deleteAllGalleryPhotos({slug}) uses the same prefix.
 *
 * Idempotent: createIndex is a no-op when an identical index exists.
 *
 * Usage:
 *   node --env-file=.env.local scripts/create-gallery-indexes.mjs
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

const DB = "halouspomene";
const COLLECTION = "gallery_photos";

const INDEXES = [
  {
    key: { slug: 1, approved: 1, createdAt: -1 },
    name: "slug_approved_createdAt",
    why: "lista slika + grupisanje po gostu + broj po slugu",
  },
  {
    key: { slug: 1, uploaderId: 1 },
    name: "slug_uploaderId",
    why: "kapa po uredjaju + preimenovanje gosta",
  },
  {
    key: { slug: 1, ip: 1 },
    name: "slug_ip",
    why: "rezervna kapa po IP-u",
  },
];

const client = new MongoClient(uri);
try {
  await client.connect();
  const col = client.db(DB).collection(COLLECTION);

  const before = (await col.indexes()).map((i) => i.name);
  console.log("pre:", before.join(", "));
  console.log("dokumenata u kolekciji:", await col.countDocuments({}));

  for (const idx of INDEXES) {
    const name = await col.createIndex(idx.key, {
      name: idx.name,
      background: true,
    });
    console.log(`  ✓ ${name}  — ${idx.why}`);
  }

  const after = (await col.indexes()).map((i) => i.name);
  console.log("posle:", after.join(", "));
} finally {
  await client.close();
}
