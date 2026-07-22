import { randomInt } from "crypto";
import clientPromise from "./mongodb";
import type { PaymentKind } from "./orders";
import {
  verifyPromo,
  isPromoEnabled,
  isPromoEligibleKind,
  PROMO_CAP,
  type PromoResult,
} from "./payments/promo";
import { countRedemptions } from "./promo-redemptions";

// Per-vendor referral promo codes. Unlike the guest code (stateless HMAC in
// payments/promo.ts), these are stored rows — created by hand when a vendor
// partnership is struck, and NOT tied to the `vendors` directory (a vendor need
// not be listed there). Discount is a fixed 5% or 10% → reuses the existing LS
// codes PROMO5HU / PROMO10HU. Attribution + the commission we owe are derived
// from the shared `promo_redemptions` ledger (counted by the code string), so no
// parallel tracking is added.

/** "vendor" = referral partner (5/10%, uncapped, commission owed). "friend" =
 *  personal single-use gift code (75%, no commission). Docs created before this
 *  field default to "vendor" when read. */
export type PromoType = "vendor" | "friend";

export interface VendorPromo {
  code: string;
  vendorName: string;
  contact: string;
  note: string;
  percent: 5 | 10 | 50 | 75;
  commissionRsd: number; // what we owe the vendor per realized purchase (0 for friend)
  active: boolean;
  createdAt: Date;
  type?: PromoType; // absent → "vendor" (backward compat)
  maxUses?: number | null; // null/absent → unlimited; 1 for friend (single-use)
}

/** A promo row enriched with its realized-purchase count + owed total. */
export interface VendorPromoRow {
  code: string;
  vendorName: string;
  contact: string;
  note: string;
  percent: 5 | 10 | 50 | 75;
  commissionRsd: number;
  active: boolean;
  createdAt: string; // ISO for the client
  type: PromoType;
  maxUses: number | null;
  activations: number;
  owedRsd: number;
  usedUp: boolean; // true when a capped code has hit its maxUses
}

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<VendorPromo>("vendor_promo_codes");
}

let indexEnsured = false;
async function ensureIndex(c: Awaited<ReturnType<typeof col>>) {
  if (indexEnsured) return;
  await c.createIndex({ code: 1 }, { unique: true });
  indexEnsured = true;
}

export interface CreateVendorPromoInput {
  code: string;
  vendorName: string;
  contact?: string;
  note?: string;
  percent: number;
  commissionRsd: number;
}

/** Validates + inserts a vendor promo. Returns a typed error (never throws for
 *  bad input) so the API layer can surface a 400 with the message verbatim. */
export async function createVendorPromo(
  input: CreateVendorPromoInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const code = (input.code || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{4,20}$/.test(code)) {
    return { ok: false, error: "Kod: 4–20 znakova, samo slova A-Z i brojevi." };
  }
  // Never collide with guest codes (HU-<expDay>-<tag>-<sig>). The regex already
  // forbids the dashes, but block the prefix too for clarity.
  if (code.startsWith("HU")) {
    return { ok: false, error: "Kod ne sme počinjati sa 'HU' (rezervisano)." };
  }

  const vendorName = (input.vendorName || "").trim().slice(0, 120);
  if (!vendorName) return { ok: false, error: "Ime vendora je obavezno." };

  if (input.percent !== 5 && input.percent !== 10) {
    return { ok: false, error: "Popust mora biti 5% ili 10%." };
  }

  const commissionRsd = Math.round(Number(input.commissionRsd));
  if (!Number.isFinite(commissionRsd) || commissionRsd < 0 || commissionRsd > 100_000) {
    return { ok: false, error: "Provizija: ceo broj 0–100.000 din." };
  }

  const c = await col();
  await ensureIndex(c);
  const existing = await c.findOne({ code });
  if (existing) return { ok: false, error: "Kod već postoji." };

  try {
    await c.insertOne({
      code,
      vendorName,
      contact: (input.contact || "").trim().slice(0, 160),
      note: (input.note || "").trim().slice(0, 300),
      percent: input.percent,
      commissionRsd,
      active: true,
      createdAt: new Date(),
    });
  } catch (e: unknown) {
    // Unique-index race (two creates same code) → treat as duplicate.
    if (typeof e === "object" && e && "code" in e && (e as { code: number }).code === 11000) {
      return { ok: false, error: "Kod već postoji." };
    }
    throw e;
  }
  return { ok: true };
}

/** All codes, newest first, each with its realized-purchase count + owed total.
 *  Activations come from ONE aggregation over `promo_redemptions` (grouped by
 *  code) rather than N per-code queries. */
export async function listVendorPromos(): Promise<VendorPromoRow[]> {
  const client = await clientPromise;
  const db = client.db("halouspomene");
  const promos = await db
    .collection<VendorPromo>("vendor_promo_codes")
    .find()
    .sort({ createdAt: -1 })
    .toArray();
  if (promos.length === 0) return [];

  const codes = promos.map((p) => p.code);
  const counts = await db
    .collection("promo_redemptions")
    .aggregate<{ _id: string; n: number }>([
      { $match: { code: { $in: codes } } },
      { $group: { _id: "$code", n: { $sum: 1 } } },
    ])
    .toArray();
  const countMap = new Map(counts.map((c) => [c._id, c.n]));

  return promos.map((p) => {
    const activations = countMap.get(p.code) ?? 0;
    const maxUses = p.maxUses ?? null;
    return {
      code: p.code,
      vendorName: p.vendorName,
      contact: p.contact,
      note: p.note,
      percent: p.percent,
      commissionRsd: p.commissionRsd,
      active: p.active,
      createdAt: p.createdAt.toISOString(),
      type: p.type ?? "vendor",
      maxUses,
      activations,
      owedRsd: activations * p.commissionRsd,
      usedUp: maxUses !== null && activations >= maxUses,
    };
  });
}

/** Hard-deletes a vendor code. Past redemptions in `promo_redemptions` stay
 *  (they're the payment audit trail); only the code definition is removed. */
export async function deleteVendorPromo(code: string): Promise<boolean> {
  const c = await col();
  const r = await c.deleteOne({ code: (code || "").trim().toUpperCase() });
  return r.deletedCount > 0;
}

/** Pure DB lookup mirroring verifyPromo's shape. Vendor codes never expire and
 *  have no per-code cap; validity = exists + active + master gate + eligible kind. */
export async function verifyVendorPromo(
  rawCode: string | undefined | null,
  kind: PaymentKind,
): Promise<PromoResult> {
  const code = (rawCode || "").trim().toUpperCase();
  const fail = (reason: NonNullable<PromoResult["reason"]>): PromoResult => ({
    valid: false,
    code,
    percent: 0,
    reason,
  });

  if (!isPromoEnabled()) return fail("invalid");
  if (!code) return fail("invalid");
  if (!isPromoEligibleKind(kind)) return fail("ineligible_kind");

  const c = await col();
  const doc = await c.findOne({ code, active: true });
  if (!doc) return fail("invalid");

  // Single-use (friend) or otherwise capped codes: reject once redemptions reach
  // maxUses. Vendor codes have no cap (maxUses null/absent) → skip. Redemptions
  // count at UNLOCK time, so this blocks reuse after the first order is approved.
  const maxUses = doc.maxUses ?? null;
  if (maxUses !== null && (await countRedemptions(code)) >= maxUses) {
    return fail("expired");
  }

  return { valid: true, code: doc.code, percent: doc.percent };
}

const FRIEND_PERCENTS = new Set([50, 75]);

/** Auto-generates a single-use friend code: PRIJATELJ + 4 random digits (random,
 *  not sequential, so codes reveal no order/count when friends compare them). The
 *  percent (50 or 75) is NOT encoded in the code string — two friends on different
 *  tiers can't tell them apart; only the admin list shows the percent.
 *  Guessability is harmless — every redemption is DB-validated + single-use. */
export async function createFriendPromo(
  percent: number,
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  if (!FRIEND_PERCENTS.has(percent)) {
    return { ok: false, error: "Prijatelj-popust mora biti 50% ili 75%." };
  }
  const c = await col();
  await ensureIndex(c);

  // Retry on the vanishingly rare collision (10k namespace).
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `PRIJATELJ${String(randomInt(0, 10000)).padStart(4, "0")}`;
    const exists = await c.findOne({ code }, { projection: { _id: 1 } });
    if (exists) continue;
    try {
      await c.insertOne({
        code,
        vendorName: "Prijatelj",
        contact: "",
        note: "",
        percent: percent as 50 | 75,
        commissionRsd: 0,
        active: true,
        createdAt: new Date(),
        type: "friend",
        maxUses: 1,
      });
      return { ok: true, code };
    } catch (e: unknown) {
      if (typeof e === "object" && e && "code" in e && (e as { code: number }).code === 11000) {
        continue; // lost the race — try another number
      }
      throw e;
    }
  }
  return { ok: false, error: "Ne mogu da generišem jedinstven kod, pokušaj ponovo." };
}

/** Single entry point for BOTH checkout rails: resolve a raw code to an
 *  applicable PromoResult, or null. Tries the guest code first (stateless, with
 *  the leak cap), then falls back to a vendor code (no cap). Callers then run
 *  applyPromo(money, result) and, on the card rail, lsCodeForPercent(result.percent). */
export async function resolveCheckoutPromo(
  rawCode: string | undefined | null,
  kind: PaymentKind,
): Promise<PromoResult | null> {
  if (!rawCode) return null;
  const guest = verifyPromo(rawCode, kind);
  if (guest.valid) {
    return (await countRedemptions(guest.code)) < PROMO_CAP ? guest : null;
  }
  const vendor = await verifyVendorPromo(rawCode, kind);
  return vendor.valid ? vendor : null;
}
