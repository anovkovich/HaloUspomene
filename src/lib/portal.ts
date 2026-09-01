import clientPromise from "./mongodb";
import type { PortalData, ChecklistItem, PortalBudget, GuestList } from "@/app/moje-vencanje/types";
import type { SeatingNudgeDismiss } from "./seating/nudge";

import { getDefaultChecklist, getDefaultBudgetCategories } from "@/app/moje-vencanje/defaults";

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<PortalData>("wedding_portal");
}

/**
 * @param opts.touch Stamp `lastSeenAt`. Pass ONLY from an authenticated portal
 *   entry point. `updatedAt` moves on writes alone, so a couple who opens the
 *   planner weekly and never ticks anything is indistinguishable from one who
 *   vanished months ago — `lastSeenAt` is what tells them apart.
 *
 *   Off by default because `/api/portal/[slug]` is a public GET with no auth
 *   whatsoever: anyone, crawlers included, could otherwise forge activity.
 */
export async function loadPortalData(
  slug: string,
  opts?: { touch?: boolean }
): Promise<PortalData> {
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
        guestList: { sections: [], invitees: [] },
        createdAt: now,
        updatedAt: now,
      },
      // Rides the upsert that already runs — no extra round trip. Safe to sit
      // beside `$setOnInsert`: the two never name the same field.
      ...(opts?.touch ? { $set: { lastSeenAt: now } } : {}),
    },
    { upsert: true, returnDocument: "after" }
  );
  return doc!;
}

/**
 * Guest list alone, read-only. Unlike `loadPortalData` this does NOT upsert —
 * surfaces that only *read* the list (seating editor) must not create a portal
 * document for a couple who never opened the planner.
 */
export async function getGuestList(slug: string): Promise<GuestList | null> {
  const c = await col();
  const doc = await c.findOne({ slug }, { projection: { guestList: 1 } });
  return doc?.guestList ?? null;
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

export async function saveGuestList(
  slug: string,
  guestList: GuestList
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { slug },
    { $set: { guestList, updatedAt: new Date() } }
  );
}

export async function saveSeatingNudge(
  slug: string,
  seatingNudge: SeatingNudgeDismiss
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { slug },
    { $set: { seatingNudge, updatedAt: new Date() } }
  );
}

/* ── Highlighted Vendors (global, admin-managed) ──────────── */

interface SiteConfig {
  key: string;
  vendorIds?: string[];
  rate?: number;
  updatedAt?: Date;
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

/** Cached EUR→RSD rate — see src/lib/nbs-rate.ts for the fetch/refresh
 *  logic. This module only reads/writes the cache document. */
export async function getCachedEurRateConfig(): Promise<{ rate: number; updatedAt: Date } | null> {
  const c = await configCol();
  const doc = await c.findOne({ key: "eur_rate" });
  return doc?.rate != null && doc.updatedAt
    ? { rate: doc.rate, updatedAt: doc.updatedAt }
    : null;
}

export async function setCachedEurRateConfig(rate: number): Promise<void> {
  const c = await configCol();
  await c.updateOne(
    { key: "eur_rate" },
    { $set: { rate, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function deletePortalData(slug: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ slug });
}
