import clientPromise from "./mongodb";
import type { Vendor, VendorCategory } from "@/app/moje-vencanje/types";

export interface VendorDocument extends Vendor {
  endorsementCount: number;
  createdAt: Date;
  updatedAt: Date;
}

let _indexesEnsured = false;

async function col() {
  const client = await clientPromise;
  const c = client.db("halouspomene").collection<VendorDocument>("vendors");
  if (!_indexesEnsured) {
    _indexesEnsured = true;
    c.createIndex({ id: 1 }, { unique: true }).catch(() => {});
    c.createIndex({ category: 1, city: 1 }).catch(() => {});
    const ec = client.db("halouspomene").collection("endorsements");
    ec.createIndex({ vendorId: 1, coupleSlug: 1 }, { unique: true }).catch(() => {});
    ec.createIndex({ coupleSlug: 1 }).catch(() => {});
  }
  return c;
}

async function endorseCol() {
  const client = await clientPromise;
  return client
    .db("halouspomene")
    .collection<{ vendorId: string; coupleSlug: string; createdAt: Date }>(
      "endorsements",
    );
}

// ── Read ──

export async function getAllVendors(): Promise<VendorDocument[]> {
  const c = await col();
  return c.find({}, { projection: { _id: 0 } }).toArray();
}

export async function getExistingIds(ids: string[]): Promise<string[]> {
  const c = await col();
  const docs = await c
    .find({ id: { $in: ids } }, { projection: { id: 1, _id: 0 } })
    .toArray();
  return docs.map((d) => d.id);
}

export async function insertNewVendors(
  vendors: Omit<VendorDocument, "endorsementCount" | "createdAt" | "updatedAt">[],
): Promise<number> {
  if (vendors.length === 0) return 0;
  const c = await col();
  const now = new Date();
  const docs = vendors.map((v) => ({
    ...v,
    endorsementCount: 0,
    createdAt: now,
    updatedAt: now,
  }));
  const result = await c.insertMany(docs);
  return result.insertedCount;
}

export async function getVendorById(
  id: string,
): Promise<VendorDocument | null> {
  const c = await col();
  return c.findOne({ id }, { projection: { _id: 0 } });
}

// ── Write (admin) ──

export async function upsertVendor(
  id: string,
  data: Partial<Vendor> & { name: string; category: VendorCategory; city: string },
): Promise<void> {
  const c = await col();
  const now = new Date();
  await c.updateOne(
    { id },
    {
      $set: { id, ...data, updatedAt: now },
      $setOnInsert: { endorsementCount: 0, createdAt: now },
    },
    { upsert: true },
  );
}

export async function patchVendor(
  id: string,
  updates: Partial<Vendor>,
): Promise<void> {
  const c = await col();
  await c.updateOne({ id }, { $set: { ...updates, updatedAt: new Date() } });
}

export async function deleteVendor(id: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ id });
  // Also clean up endorsements for this vendor
  const ec = await endorseCol();
  await ec.deleteMany({ vendorId: id });
}

// ── Endorsements ──

export async function toggleEndorsement(
  vendorId: string,
  coupleSlug: string,
): Promise<boolean> {
  const ec = await endorseCol();
  const existing = await ec.findOneAndDelete({ vendorId, coupleSlug });

  if (existing) {
    // Was endorsed → removed. Decrement count.
    const c = await col();
    await c.updateOne({ id: vendorId }, { $inc: { endorsementCount: -1 } });
    return false; // no longer endorsed
  }

  // Not endorsed → add it. Increment count.
  await ec.insertOne({ vendorId, coupleSlug, createdAt: new Date() });
  const c = await col();
  await c.updateOne({ id: vendorId }, { $inc: { endorsementCount: 1 } });
  return true; // now endorsed
}

export async function getEndorsementsByCouple(
  coupleSlug: string,
): Promise<string[]> {
  const ec = await endorseCol();
  const docs = await ec
    .find({ coupleSlug }, { projection: { vendorId: 1, _id: 0 } })
    .toArray();
  return docs.map((d) => d.vendorId);
}
