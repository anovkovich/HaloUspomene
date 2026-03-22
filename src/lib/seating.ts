import clientPromise from "./mongodb";
import type { TableData } from "@/app/pozivnica/[slug]/raspored-sedenja/types";

interface SeatingDocument {
  slug: string;
  tables: TableData[];
  updatedAt: Date;
}

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<SeatingDocument>("seating_layouts");
}

export async function loadSeatingLayout(
  slug: string
): Promise<TableData[] | null> {
  const c = await col();
  const doc = await c.findOne({ slug });
  return doc?.tables ?? null;
}

export async function deleteSeatingLayout(slug: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ slug });
}

export async function saveSeatingLayout(
  slug: string,
  tables: TableData[]
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { slug },
    { $set: { slug, tables, updatedAt: new Date() } },
    { upsert: true }
  );
}
