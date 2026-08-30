import clientPromise from "./mongodb";
import type { PokloniData, GiftEntry } from "@/app/moje-vencanje/types";

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<PokloniData>("pokloni");
}

export async function loadPokloni(slug: string): Promise<PokloniData> {
  const c = await col();
  const now = new Date();
  const doc = await c.findOneAndUpdate(
    { slug },
    {
      $setOnInsert: {
        slug,
        gifts: [],
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  return doc!;
}

export async function saveGifts(
  slug: string,
  gifts: GiftEntry[]
): Promise<void> {
  const c = await col();
  await c.updateOne({ slug }, { $set: { gifts, updatedAt: new Date() } });
}

export async function deletePokloni(slug: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ slug });
}