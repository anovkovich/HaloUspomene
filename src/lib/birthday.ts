import clientPromise from "./mongodb";
import { del } from "@vercel/blob";
import { BirthdayData } from "@/app/deciji-rodjendan/[slug]/types";
import { deleteShareLinksForProduct } from "./share-links";

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
  // `example: 1` first so demo/example events (example: true) always sort to the
  // bottom of the admin list (missing field sorts as null < true); then
  // newest-first within each group.
  return c
    .find({}, { projection: { _id: 0 } })
    .sort({ example: 1, created_at: -1, _id: -1 })
    .toArray();
}

export async function upsertBirthday(
  slug: string,
  data: BirthdayData,
): Promise<void> {
  const c = await col();
  // Exclude created_at from $set so it doesn't conflict with $setOnInsert.
  // (Mongo rejects updates where the same field appears in both operators.)
  const { created_at: _created_at, ...dataWithoutTimestamp } =
    data as BirthdayData & { created_at?: unknown };
  void _created_at;
  await c.updateOne(
    { slug },
    {
      $set: { slug, ...dataWithoutTimestamp },
      $setOnInsert: { created_at: new Date() },
    },
    { upsert: true }
  );
}

export async function deleteBirthday(slug: string): Promise<void> {
  const c = await col();
  // Read before deleting — the doc carries the blob urls we must clean up.
  const doc = await c.findOne({ slug });
  await c.deleteOne({ slug });

  // Cascade: RSVP responses + share links
  const client = await clientPromise;
  await Promise.all([
    client.db("halouspomene").collection("birthday_rsvp").deleteMany({ slug }),
    deleteShareLinksForProduct("birthday", slug),
  ]);

  // Cascade: gallery + hero emblem blobs. Failures are swallowed per blob — a
  // leaked blob is preferable to leaving the event half-deleted.
  const urls = [
    ...(doc?.images ?? []).map((img) => img.url),
    doc?.hero_emblem_url,
  ].filter((u): u is string => !!u);
  if (urls.length > 0) {
    await Promise.all(
      urls.map((url) =>
        del(url).catch((err) =>
          console.error(`Blob cleanup failed for ${url}:`, err),
        ),
      ),
    );
  }
}

export async function patchBirthday(
  slug: string,
  updates: Partial<BirthdayData>,
): Promise<void> {
  const c = await col();
  await c.updateOne({ slug }, { $set: updates });
}
