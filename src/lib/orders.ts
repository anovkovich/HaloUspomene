import { randomInt } from "crypto";
import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";

// ─────────────────────────────────────────────────────────────────────────────
// `orders` — the money ledger for self-serve payments (card via Lemon Squeezy +
// IPS bank QR). This is the ONLY file that touches the `orders` collection.
//
// Orders NEVER gate runtime access — the entity flags (`draft`, `paid_for_*`,
// `active`, …) remain the sole access gate. Orders are an append-first audit
// trail; `unlock()`/`revoke()` (in `payments/kinds.ts`) flip the real flags.
// ─────────────────────────────────────────────────────────────────────────────

export type PaymentKind =
  | "pozivnica"
  | "rodjendan"
  | "punoletstvo"
  | "raspored"
  | "galerija";

export type OrderRail = "card" | "ips";

export type OrderStatus =
  | "pending" // created, no money seen
  | "review" // IPS: buyer clicked "Obavesti nas o uplati", awaiting admin
  | "paid" // card: LS webhook verified, unlock in progress (transient)
  | "unlocked" // flags flipped on the entity — terminal happy path
  | "expired" // pending > 7 days, swept (soft — record kept)
  | "canceled" // admin rejected an IPS review, or buyer restarted
  | "refunded" // LS order_refunded received (full refund)
  | "revoked"; // flags reversed after refund/admin action — terminal

export interface CheckoutLine {
  l: string;
  rsd: number;
  eur: number;
}

export interface OrderDocument {
  _id?: ObjectId;
  orderId: string; // "HU" + 12 decimal digits; digits double as the NBS RO
  kind: PaymentKind;
  slug: string;
  tier: string; // pozivnica: "osnovni"|"kompletan"|"premium"; others: "default"
  rail: OrderRail | null;
  status: OrderStatus;

  // Money — FROZEN at order creation, server-computed (never recomputed later)
  amountRsd: number;
  amountEur: number;
  lines: CheckoutLine[];

  // Card rail (Lemon Squeezy)
  ls?: {
    checkoutId?: string;
    orderId?: number; // LS numeric order id — unique partial index (replay guard)
    orderNumber?: number;
    variantId?: number;
    customerEmail?: string;
    receiptUrl?: string;
    totalCents?: number;
    currency?: string;
    testMode?: boolean;
    refundedAt?: Date;
  };

  // IPS rail
  ipsRef: string; // = digits of orderId
  ipsAccountIdx: number; // index into BANK_ACCOUNTS (0 = Erste default)
  notify?: { at: Date; payerName: string; note?: string; ip: string };

  // Promo code applied to this order (part of the order identity — a promo and
  // non-promo checkout for the same tuple are DIFFERENT orders). The frozen
  // amounts above already include the discount; this is the audit + redemption key.
  promo?: { code: string; discountEur: number; discountRsd: number };

  // Frozen builder selection for a custom (partial-combo) pozivnica order. The
  // amount above is server-computed from this at freeze time; unlock() reads it
  // (not the couple's live snapshot) to decide exactly which flags to set. Only
  // present when tier === "custom".
  customSelection?: {
    premium: boolean;
    raspored: boolean;
    audio: boolean;
    galerija: boolean;
    music: boolean;
    usb: "" | "kaseta" | "bocica";
    images: boolean;
    customColor: boolean;
  };

  webhookEvents?: Array<{
    eventName: string;
    lsEventId: string | null;
    at: Date;
  }>;
  approvedBy?: "webhook" | "admin";
  adminNote?: string;

  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  unlockedAt?: Date;
  revokedAt?: Date;
  meta?: { ip?: string; ua?: string };
}

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<OrderDocument>("orders");
}

/** "HU" + 12 crypto-random decimal digits (no leading zero). The 12 digits also
 *  serve as the NBS poziv-na-broj (RO) on the IPS QR. */
function generateOrderId(): { orderId: string; ipsRef: string } {
  // 12-digit space [100000000000, 1000000000000) — guarantees exactly 12 digits.
  const n = randomInt(100000000000, 1000000000000);
  const ipsRef = String(n);
  return { orderId: `HU${ipsRef}`, ipsRef };
}

/** The state-machine primitive. Returns true iff THIS call performed the
 *  transition. `matchedCount === 0` ⇒ someone else already moved it (replay,
 *  double-click, concurrent admin) ⇒ caller treats a `false` as a no-op success. */
export async function transitionOrder(
  orderId: string,
  from: OrderStatus[],
  to: OrderStatus,
  set: Partial<OrderDocument> = {},
): Promise<boolean> {
  const c = await col();
  const r = await c.updateOne(
    { orderId, status: { $in: from } },
    { $set: { ...set, status: to, updatedAt: new Date() } },
  );
  return r.matchedCount === 1;
}

export interface CreateOrderInput {
  kind: PaymentKind;
  slug: string;
  tier: string;
  amountRsd: number;
  amountEur: number;
  lines: CheckoutLine[];
  ipsAccountIdx?: number;
  promo?: { code: string; discountEur: number; discountRsd: number };
  customSelection?: OrderDocument["customSelection"];
  meta?: { ip?: string; ua?: string };
}

/** Tuple reuse: returns an existing `pending` order for the same
 *  (kind, slug, tier) younger than 24h instead of inserting a new one, so page
 *  refreshes and back-buttons never spawn duplicate ledger rows. The money
 *  passed in is used ONLY on the insert path — a reused order keeps its frozen
 *  amounts. A price change mid-flow only creates a fresh order once the old one
 *  is canceled/expired/unlocked. */
export async function getOrCreatePendingOrder(
  input: CreateOrderInput,
): Promise<OrderDocument> {
  const c = await col();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Promo is part of the order identity: a promo checkout and a non-promo
  // checkout for the same (kind, slug, tier) resolve to DIFFERENT pending rows,
  // so tuple-reuse never serves a stale full-price (or wrong-promo) frozen order.
  const promoFilter = input.promo?.code
    ? { "promo.code": input.promo.code }
    : { "promo.code": { $exists: false } };

  // A custom order's amount depends on the frozen selection, which can change
  // (via upgrade). Match the amount too so a changed selection never reuses a
  // stale-priced pending row — it just spawns a fresh one (the old expires).
  const amountFilter =
    input.tier === "custom" ? { amountRsd: input.amountRsd } : {};

  const existing = await c.findOne({
    kind: input.kind,
    slug: input.slug,
    tier: input.tier,
    status: "pending",
    createdAt: { $gte: cutoff },
    ...promoFilter,
    ...amountFilter,
  });
  if (existing) return existing;

  // Insert with a fresh unique orderId; retry a few times on the astronomically
  // unlikely orderId / ls.orderId collision (duplicate-key = code 11000).
  for (let attempt = 0; attempt < 5; attempt++) {
    const { orderId, ipsRef } = generateOrderId();
    const now = new Date();
    const doc: OrderDocument = {
      orderId,
      kind: input.kind,
      slug: input.slug,
      tier: input.tier,
      rail: null,
      status: "pending",
      amountRsd: input.amountRsd,
      amountEur: input.amountEur,
      lines: input.lines,
      ipsRef,
      ipsAccountIdx: input.ipsAccountIdx ?? 0,
      promo: input.promo, // undefined → BSON omits it (matches the $exists:false reuse filter)
      customSelection: input.customSelection,
      webhookEvents: [],
      createdAt: now,
      updatedAt: now,
      meta: input.meta,
    };
    try {
      const res = await c.insertOne(doc);
      return { ...doc, _id: res.insertedId };
    } catch (e) {
      if ((e as { code?: number }).code === 11000 && attempt < 4) continue;
      throw e;
    }
  }
  throw new Error("Could not create order after 5 attempts");
}

export async function getOrder(orderId: string): Promise<OrderDocument | null> {
  const c = await col();
  return c.findOne({ orderId });
}

export async function getOrderByLsOrderId(
  lsOrderId: number,
): Promise<OrderDocument | null> {
  const c = await col();
  return c.findOne({ "ls.orderId": lsOrderId });
}

/** An already-unlocked order for the same tuple, if any — powers the admin
 *  "⚠ već plaćeno" double-payment warning. */
export async function findUnlockedOrderForTuple(
  kind: PaymentKind,
  slug: string,
  tier: string,
): Promise<OrderDocument | null> {
  const c = await col();
  return c.findOne({ kind, slug, tier, status: "unlocked" });
}

/** Sets the chosen rail (+ optional extra fields) on an order without changing
 *  its status. Used when the buyer picks card (checkout creation) or IPS. */
export async function setOrderRail(
  orderId: string,
  rail: OrderRail,
  set: Partial<OrderDocument> = {},
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { orderId },
    { $set: { ...set, rail, updatedAt: new Date() } },
  );
}

/** Appends a webhook delivery to the audit trail unconditionally (every
 *  delivery, incl. replays). Never changes status. */
export async function appendWebhookEvent(
  orderId: string,
  event: { eventName: string; lsEventId: string | null },
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { orderId },
    {
      $push: { webhookEvents: { ...event, at: new Date() } },
      $set: { updatedAt: new Date() },
    },
  );
}

/** Sets an admin note without touching status. */
export async function setOrderAdminNote(
  orderId: string,
  adminNote: string,
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { orderId },
    { $set: { adminNote, updatedAt: new Date() } },
  );
}

/** Admin review queue + recent history. Newest first. */
export async function listOrders(opts?: {
  status?: OrderStatus | OrderStatus[];
  limit?: number;
}): Promise<OrderDocument[]> {
  const c = await col();
  const filter: Record<string, unknown> = {};
  if (opts?.status) {
    filter.status = Array.isArray(opts.status)
      ? { $in: opts.status }
      : opts.status;
  }
  return c
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(opts?.limit ?? 100)
    .toArray();
}

/** Count of orders awaiting admin action — feeds the "Uplate" badge. */
export async function countReviewOrders(): Promise<number> {
  const c = await col();
  return c.countDocuments({ status: "review" });
}
