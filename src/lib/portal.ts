import clientPromise from "./mongodb";
import type { PortalData, ChecklistItem, PortalBudget } from "@/app/moje-vencanje/types";

import { getDefaultChecklist, getDefaultBudgetCategories } from "@/app/moje-vencanje/defaults";

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<PortalData>("wedding_portal");
}

export async function loadPortalData(slug: string): Promise<PortalData> {
  const c = await col();
  const now = new Date();
  const doc = await c.findOneAndUpdate(
    { slug },
    {
      $setOnInsert: {
        slug,
        checklist: getDefaultChecklist(),
        budget: { totalBudget: 0, categories: getDefaultBudgetCategories() },
        vendorFavorites: [],
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  return doc!;
}

export async function saveChecklist(
  slug: string,
  checklist: ChecklistItem[]
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { slug },
    { $set: { checklist, updatedAt: new Date() } }
  );
}

export async function saveBudget(
  slug: string,
  budget: PortalBudget
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { slug },
    { $set: { budget, updatedAt: new Date() } }
  );
}

export async function saveVendorFavorites(
  slug: string,
  vendorFavorites: string[]
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { slug },
    { $set: { vendorFavorites, updatedAt: new Date() } }
  );
}

/* ── Highlighted Vendors (global, admin-managed) ──────────── */

interface SiteConfig {
  key: string;
  vendorIds?: string[];
}

async function configCol() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<SiteConfig>("site_config");
}

export async function getHighlightedVendors(): Promise<string[]> {
  const c = await configCol();
  const doc = await c.findOne({ key: "highlighted_vendors" });
  return doc?.vendorIds ?? [];
}

export async function setHighlightedVendors(vendorIds: string[]): Promise<void> {
  const c = await configCol();
  await c.updateOne(
    { key: "highlighted_vendors" },
    { $set: { vendorIds } },
    { upsert: true }
  );
}

export async function deletePortalData(slug: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ slug });
}
