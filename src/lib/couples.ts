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

export async function getAllWeddingSlugs(): Promise<string[]> {
  const c = await col();
  const docs = await c
    .find({}, { projection: { slug: 1, _id: 0 } })
    .toArray();
  return docs.map((d) => d.slug);
}

export async function getAllCouples(): Promise<CoupleDocument[]> {
  const c = await col();
  return c.find({}, { projection: { _id: 0 } }).toArray();
}

export async function upsertCouple(
  slug: string,
  data: WeddingData
): Promise<void> {
  const c = await col();
  await c.replaceOne({ slug }, { slug, ...data }, { upsert: true });
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
