import clientPromise from "../mongodb";
import type { TableData } from "./types";

interface SeatingDocument {
  slug: string;
  tables: TableData[];
  /** Optional per-party member names, keyed by RSVP id. Lets the editor place
   *  individual guests (e.g. "Jovan Glavonjić") on seats instead of the party
   *  label. Absent on layouts created before this feature. */
  members?: Record<string, string[]>;
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

/** Loads tables + party member names in a single query (used by the editor). */
export async function loadSeatingDoc(
  slug: string
): Promise<{ tables: TableData[]; members: Record<string, string[]> } | null> {
  const c = await col();
  const doc = await c.findOne({ slug });
  if (!doc) return null;
  return { tables: doc.tables ?? [], members: doc.members ?? {} };
}

export async function deleteSeatingLayout(slug: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ slug });
}

export async function saveSeatingLayout(
  slug: string,
  tables: TableData[],
  members: Record<string, string[]> = {}
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { slug },
    { $set: { slug, tables, members, updatedAt: new Date() } },
    { upsert: true }
  );
}
