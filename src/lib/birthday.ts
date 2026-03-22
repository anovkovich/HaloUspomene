import clientPromise from "./mongodb";
import { BirthdayData } from "@/app/deciji-rodjendan/[slug]/types";

export type BirthdayDocument = BirthdayData & { slug: string };

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<BirthdayDocument>("birthday_events");
}

export async function getBirthdayData(slug: string): Promise<BirthdayData | null> {
  const c = await col();
  const doc = await c.findOne({ slug }, { projection: { _id: 0, slug: 0 } });
  return doc as BirthdayData | null;
}

export async function getAllBirthdaySlugs(): Promise<string[]> {
  const c = await col();
  const docs = await c
    .find({}, { projection: { slug: 1, _id: 0 } })
    .toArray();
  return docs.map((d) => d.slug);
}

export async function getAllBirthdays(): Promise<BirthdayDocument[]> {
  const c = await col();
  return c.find({}, { projection: { _id: 0 } }).toArray();
}

export async function upsertBirthday(
  slug: string,
  data: BirthdayData,
): Promise<void> {
  const c = await col();
  await c.replaceOne({ slug }, { slug, ...data }, { upsert: true });
}

export async function deleteBirthday(slug: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ slug });

  // Cascade: delete RSVP responses
  const client = await clientPromise;
  await client.db("halouspomene").collection("birthday_rsvp").deleteMany({ slug });
}

export async function patchBirthday(
  slug: string,
  updates: Partial<BirthdayData>,
): Promise<void> {
  const c = await col();
  await c.updateOne({ slug }, { $set: updates });
}
