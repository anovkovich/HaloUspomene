import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";

/**
 * QR guest photo gallery — metadata store.
 *
 * One document per uploaded photo. The binary lives in Cloudflare R2 (see
 * `src/lib/r2.ts`); here we keep the R2 `key` (for deletion) and the public
 * `url` (for display), mirroring how `audio.ts` stores blobPathname + blobUrl.
 */

export interface GalleryPhoto {
  _id: string;
  slug: string;
  key: string; // R2 object key, e.g. "gallery/ana-dejan/1710765432-abc123.jpg"
  url: string; // public URL
  guestName: string;
  caption: string;
  fileSize: number; // bytes
  mimeType: string;
  approved: boolean;
  createdAt: string;
}

interface GalleryDocument {
  slug: string;
  key: string;
  url: string;
  guestName: string;
  caption: string;
  fileSize: number;
  mimeType: string;
  approved: boolean;
  createdAt: Date;
  ip?: string; // uploader IP — internal only (rate limit backstop); never serialized
  uploaderId?: string; // per-device token from guest localStorage — internal only
  //   (rate limit + rename authorization + identity); never serialized to clients
}

async function col() {
  const client = await clientPromise;
  return client
    .db("halouspomene")
    .collection<GalleryDocument>("gallery_photos");
}

function serialize(d: GalleryDocument & { _id: ObjectId }): GalleryPhoto {
  return {
    _id: d._id.toString(),
    slug: d.slug,
    key: d.key,
    url: d.url,
    guestName: d.guestName,
    caption: d.caption,
    fileSize: d.fileSize,
    mimeType: d.mimeType,
    approved: d.approved,
    createdAt: d.createdAt.toISOString(),
  };
}

/** Approved photos for a slug, newest first. Optional pagination. */
export async function getGalleryPhotos(
  slug: string,
  opts: { includeUnapproved?: boolean; limit?: number; skip?: number } = {}
): Promise<GalleryPhoto[]> {
  const c = await col();
  const filter: Record<string, unknown> = { slug };
  if (!opts.includeUnapproved) filter.approved = true;
  let cursor = c.find(filter).sort({ createdAt: -1 });
  if (opts.skip) cursor = cursor.skip(opts.skip);
  if (opts.limit) cursor = cursor.limit(opts.limit);
  const docs = await cursor.toArray();
  return docs.map(serialize);
}

export async function getGalleryPhotoCount(slug: string): Promise<number> {
  const c = await col();
  return c.countDocuments({ slug });
}

/** How many photos this IP has uploaded to this slug (high backstop cap). */
export async function getGalleryPhotoCountByIp(
  slug: string,
  ip: string
): Promise<number> {
  const c = await col();
  return c.countDocuments({ slug, ip });
}

/** How many photos this device (uploaderId) has uploaded — primary per-guest cap. */
export async function getGalleryPhotoCountByUploader(
  slug: string,
  uploaderId: string
): Promise<number> {
  const c = await col();
  return c.countDocuments({ slug, uploaderId });
}

/** Rename all of one device's photos (guest changed their name in the form).
 * Scoped to the caller's own uploaderId, so it can't touch anyone else's. */
export async function renameGalleryUploader(
  slug: string,
  uploaderId: string,
  name: string
): Promise<number> {
  const c = await col();
  const res = await c.updateMany(
    { slug, uploaderId },
    { $set: { guestName: name } }
  );
  return res.modifiedCount;
}

export async function addGalleryPhoto(
  slug: string,
  data: {
    key: string;
    url: string;
    guestName: string;
    caption: string;
    fileSize: number;
    mimeType: string;
    approved?: boolean;
    ip?: string;
    uploaderId?: string;
  }
): Promise<string> {
  const c = await col();
  const result = await c.insertOne({
    slug,
    key: data.key,
    url: data.url,
    guestName: data.guestName,
    caption: data.caption,
    fileSize: data.fileSize,
    mimeType: data.mimeType,
    approved: data.approved ?? true, // auto-approve; couple can delete later
    createdAt: new Date(),
    ip: data.ip,
    uploaderId: data.uploaderId,
  });
  return result.insertedId.toString();
}

/** Fetch one photo (for auth'd delete — caller needs the R2 key). */
export async function getGalleryPhoto(id: string): Promise<GalleryPhoto | null> {
  const c = await col();
  const doc = await c.findOne({ _id: new ObjectId(id) });
  return doc ? serialize(doc) : null;
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ _id: new ObjectId(id) });
}

export async function setGalleryPhotoApproved(
  id: string,
  approved: boolean
): Promise<void> {
  const c = await col();
  await c.updateOne({ _id: new ObjectId(id) }, { $set: { approved } });
}

/** Cascade helper — remove all metadata for a slug. R2 objects are cleaned
 * separately via `deleteByPrefix`. */
export async function deleteAllGalleryPhotos(slug: string): Promise<number> {
  const c = await col();
  const result = await c.deleteMany({ slug });
  return result.deletedCount;
}
