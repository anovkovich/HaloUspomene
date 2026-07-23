import { NextRequest, NextResponse } from "next/server";
import {
  verifySignature,
  parseWebhook,
  type LsWebhook,
} from "@/lib/payments/lemonsqueezy";
import {
  getOrder,
  getOrderByLsOrderId,
  transitionOrder,
  appendWebhookEvent,
  setOrderAdminNote,
  type OrderDocument,
} from "@/lib/orders";
import { KINDS } from "@/lib/payments/kinds";
import { recordRedemption } from "@/lib/promo-redemptions";

export const runtime = "nodejs"; // needs crypto.timingSafeEqual
export const dynamic = "force-dynamic";

/** The Lemon Squeezy store's charging currency. Products are priced in dinars,
 *  so the money invariant below compares LS totals against the frozen
 *  order.amountRsd (amountEur is display-only). LS reports totals in the
 *  currency's minor units — para for RSD. If a test-mode order ever quarantines
 *  with a total exactly 100× off, this factor is the only thing to revisit. */
const LS_CURRENCY = "RSD";
const LS_MINOR_UNITS = 100;
/** Stripe doesn't settle RSD natively, so LS charges via USD and back — the real
 *  total drifts from the frozen dinar amount by a conversion round-trip (rounding
 *  + spread; observed ~0.3% on a 100-din charge). The accepted band is the LARGER
 *  of a flat floor and a percentage: the floor absorbs rounding on small amounts,
 *  the percentage scales for big packages. Being generous here is safe — the
 *  amount is only a backstop (the real integrity check is the kind/slug/tier
 *  custom_data match), and the customer can't choose to pay less than LS charges.
 *  A wrong-product / grossly-wrong charge is still far outside the band. */
const LS_AMOUNT_TOLERANCE_PCT = 0.03; // ±3%
const LS_AMOUNT_TOLERANCE_FLOOR = 5000; // ±50 din, in para

function ok() {
  return NextResponse.json({ received: true });
}

export async function POST(req: NextRequest) {
  // Signature is over the RAW bytes — read text before parsing.
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-signature"))) {
    return new Response("bad signature", { status: 401 });
  }

  let evt: LsWebhook;
  try {
    evt = parseWebhook(raw);
  } catch {
    return new Response("bad body", { status: 400 });
  }

  const eventName = evt.meta?.event_name ?? "";

  if (eventName === "order_created") {
    return handleOrderCreated(evt);
  }
  if (eventName === "order_refunded") {
    return handleOrderRefunded(evt);
  }
  // Unsubscribed events shouldn't arrive; ack so LS stops retrying.
  return ok();
}

async function handleOrderCreated(evt: LsWebhook): Promise<Response> {
  // 1. Test-mode fence: never unlock prod entities from test purchases.
  if (evt.meta.test_mode && process.env.PAYMENTS_ALLOW_TEST !== "1") {
    console.warn("[webhook] test-mode order dropped");
    return ok();
  }

  const custom = evt.meta.custom_data ?? {};
  const orderId = String(custom.order_id ?? "").trim();
  if (!orderId) {
    console.error("[webhook] order_created without order_id custom");
    return ok();
  }

  const order = await getOrder(orderId);
  if (!order) {
    console.error("[webhook] unknown order_id:", orderId);
    return ok(); // stale / hand-built checkout — admin reconciles manually
  }

  await appendWebhookEvent(orderId, {
    eventName: "order_created",
    lsEventId: evt.data?.id ?? null,
  });

  // Custom (partial-combo) orders are IPS-only — the card rail never lists a
  // "custom" tier, so a card webhook for one is impossible-by-design. Quarantine
  // if it ever happens rather than unlock. (Defense in depth.)
  if (order.tier === "custom") {
    console.error("[webhook] card order with tier=custom → quarantine", orderId);
    await transitionOrder(orderId, ["pending", "paid"], "review", {
      adminNote: "Kartična uplata na custom order — nemoguće stanje, proveri.",
    });
    return ok();
  }

  // 3. Cross-check the server-bound identity.
  if (
    custom.kind !== order.kind ||
    custom.slug !== order.slug ||
    custom.tier !== order.tier
  ) {
    console.error("[webhook] custom_data mismatch → quarantine", orderId);
    await transitionOrder(orderId, ["pending", "paid"], "review", {
      adminNote: "Webhook custom_data ne odgovara orderu — proveri ručno.",
    });
    return ok();
  }

  // 4. Money invariant (currency exact, PRE-TAX net within the conversion band).
  // LS is merchant of record: for a buyer in a VAT jurisdiction it adds their
  // country's VAT ON TOP of our tax-exclusive price (rate varies by country —
  // 17–27% across the EU, 0% for a valid B2B reverse-charge). So `a.total`
  // legitimately exceeds the frozen amount by that tax. Validate the net
  // (total − tax) instead of total, so ANY VAT rate auto-approves while the net
  // must still match the frozen amount exactly (within the FX band). Tax is
  // LS-computed and the payload is HMAC-verified, so it can't be spoofed down to
  // sneak a short payment through. A domestic buyer has tax = 0 → net = total.
  const a = evt.data.attributes;
  const expectedTotal = order.amountRsd * LS_MINOR_UNITS;
  const tolerance = Math.max(
    Math.round(expectedTotal * LS_AMOUNT_TOLERANCE_PCT),
    LS_AMOUNT_TOLERANCE_FLOOR,
  );
  const tax = typeof a.tax === "number" ? a.tax : 0;
  const net = typeof a.total === "number" ? a.total - tax : NaN;
  const withinBand =
    Number.isFinite(net) && Math.abs(net - expectedTotal) <= tolerance;
  const amountOk =
    a.currency === LS_CURRENCY && a.status === "paid" && withinBand;
  if (!amountOk) {
    console.error("[webhook] amount/currency mismatch → quarantine", orderId, {
      currency: a.currency,
      total: a.total,
      tax,
      net,
      expected: expectedTotal,
      tolerance,
      status: a.status,
    });
    await transitionOrder(orderId, ["pending", "paid"], "review", {
      adminNote: `Neslaganje iznosa (LS neto ${net} = ${a.total} − PDV ${tax} ${a.currency}, očekivano ${expectedTotal} ${LS_CURRENCY}).`,
    });
    return ok();
  }

  // 5. pending|paid → paid (replay-safe). Merge ls to keep checkoutId.
  const lsOrderId = Number(evt.data.id);
  const lsSet: OrderDocument["ls"] = {
    ...order.ls,
    orderId: Number.isFinite(lsOrderId) ? lsOrderId : undefined,
    orderNumber: a.order_number,
    customerEmail: a.user_email,
    receiptUrl: a.urls?.receipt,
    totalCents: a.total,
    currency: a.currency,
    testMode: evt.meta.test_mode,
  };
  const moved = await transitionOrder(orderId, ["pending", "paid"], "paid", {
    rail: "card",
    ls: lsSet,
    paidAt: new Date(),
  });
  if (!moved) {
    // Already past paid (unlocked/refunded) → replay, nothing to do.
    return ok();
  }

  // 6. Unlock, then paid → unlocked. Throw on unlock failure → 500 → LS retries.
  try {
    await KINDS[order.kind].unlock(order.slug, order);
  } catch (e) {
    console.error("[webhook] unlock failed:", orderId, e);
    return new Response("unlock failed", { status: 500 });
  }
  await transitionOrder(orderId, ["paid"], "unlocked", {
    approvedBy: "webhook",
    unlockedAt: new Date(),
  });
  if (order.promo) {
    await recordRedemption({
      code: order.promo.code,
      orderId,
      slug: order.slug,
      kind: order.kind,
    }).catch((e) => console.error("[webhook] recordRedemption failed:", e));
  }
  return ok();
}

async function handleOrderRefunded(evt: LsWebhook): Promise<Response> {
  const lsOrderId = Number(evt.data.id);
  if (!Number.isFinite(lsOrderId)) return ok();
  const order = await getOrderByLsOrderId(lsOrderId);
  if (!order) {
    console.error("[webhook] refund for unknown ls.orderId:", lsOrderId);
    return ok();
  }

  await appendWebhookEvent(order.orderId, {
    eventName: "order_refunded",
    lsEventId: evt.data?.id ?? null,
  });

  const a = evt.data.attributes;
  // Partial refund → do NOT revoke access; flag for a human.
  if (
    typeof a.refunded_amount === "number" &&
    typeof a.total === "number" &&
    a.refunded_amount < a.total
  ) {
    await setOrderAdminNote(order.orderId, "DELIMIČAN REFUND — proveri ručno.");
    console.warn("[webhook] partial refund:", order.orderId);
    return ok();
  }

  // Full refund → refunded → revoke → revoked.
  const moved = await transitionOrder(
    order.orderId,
    ["unlocked", "paid"],
    "refunded",
    { ls: { ...order.ls, refundedAt: new Date() } },
  );
  if (!moved) return ok();
  try {
    await KINDS[order.kind].revoke(order.slug, order);
  } catch (e) {
    console.error("[webhook] revoke failed:", order.orderId, e);
    return new Response("revoke failed", { status: 500 });
  }
  await transitionOrder(order.orderId, ["refunded"], "revoked", {
    revokedAt: new Date(),
  });
  return ok();
}
