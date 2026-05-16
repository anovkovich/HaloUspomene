import clientPromise from "./mongodb";
import { WeddingData } from "@/app/pozivnica/[slug]/types";

export type CoupleDocument = WeddingData & { slug: string };

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<CoupleDocument>("couples");
}

export async function getWeddingData(slug: string): Promise<WeddingData | null> {
  const c = await col();
  const doc = await c.findOne({ slug }, { projection: { _id: 0, slug: 0 } });
  return doc as WeddingData | null;
}

/** Slugs for classic invitations (excludes premium couples). */
export async function getClassicWeddingSlugs(): Promise<string[]> {
  const c = await col();
  const docs = await c
    .find(
      { premium: { $ne: true } },
      { projection: { slug: 1, _id: 0 } }
    )
    .toArray();
  return docs.map((d) => d.slug);
}

/** Slugs for premium invitations only. */
export async function getPremiumWeddingSlugs(): Promise<string[]> {
  const c = await col();
  const docs = await c
    .find(
      { premium: true },
      { projection: { slug: 1, _id: 0 } }
    )
    .toArray();
  return docs.map((d) => d.slug);
}

export async function getAllCouples(): Promise<CoupleDocument[]> {
  const c = await col();
  return c.find({}, { projection: { _id: 0 } }).sort({ created_at: -1, _id: -1 }).toArray();
}

export async function upsertCouple(
  slug: string,
  data: WeddingData
): Promise<void> {
  const c = await col();
  // Exclude created_at from data to avoid conflict with $setOnInsert
  const { created_at, ...dataWithoutTimestamp } = data as any;
  await c.updateOne(
    { slug },
    { $set: { slug, ...dataWithoutTimestamp }, $setOnInsert: { created_at: new Date() } },
    { upsert: true }
  );
}

export async function deleteCouple(slug: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ slug });
}

export async function patchCouple(
  slug: string,
  updates: Partial<WeddingData>
): Promise<void> {
  const c = await col();
  await c.updateOne({ slug }, { $set: updates });
}

/** Removes the listed fields from the couple document.
 *  Use this when you want to clear an optional field — `patchCouple` with
 *  `undefined` is a no-op in MongoDB because BSON drops undefined values. */
export async function unsetCoupleFields(
  slug: string,
  fields: Array<keyof WeddingData>
): Promise<void> {
  if (fields.length === 0) return;
  const c = await col();
  const unset: Record<string, "">  = {};
  for (const f of fields) unset[f as string] = "";
  await c.updateOne({ slug }, { $unset: unset });
}
