import clientPromise from "./mongodb";
import type { PaymentKind } from "./orders";

// Thin ledger of promo-code redemptions — the ONLY promo state in the DB
// (codes themselves are stateless, see payments/promo.ts). Used solely to
// enforce the per-code abuse cap. A redemption is recorded at UNLOCK time
// (card webhook / admin approve), never at checkout freeze.

export interface PromoRedemption {
  code: string;
  orderId: string;
  slug: string;
  kind: PaymentKind;
  at: Date;
}

async function col() {
  const client = await clientPromise;
  return client
    .db("halouspomene")
    .collection<PromoRedemption>("promo_redemptions");
}

export async function countRedemptions(code: string): Promise<number> {
  const c = await col();
  return c.countDocuments({ code });
}

/** Idempotent per order — a re-run (webhook redelivery) won't double-count. */
export async function recordRedemption(r: {
  code: string;
  orderId: string;
  slug: string;
  kind: PaymentKind;
}): Promise<void> {
  const c = await col();
  await c.updateOne(
    { orderId: r.orderId },
    { $setOnInsert: { ...r, at: new Date() } },
    { upsert: true },
  );
}
