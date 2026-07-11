"use server";

import { KINDS, isPaymentKind, PaymentError } from "@/lib/payments/kinds";
import { productUrl } from "@/lib/payments/product-urls";
import { getOrCreatePendingOrder, setOrderRail } from "@/lib/orders";
import { createCheckout } from "@/lib/payments/lemonsqueezy";

/**
 * Creates a Lemon Squeezy hosted checkout for the (kind, slug, tier) and returns
 * its URL for the client to redirect to. All money is server-computed and the
 * order_id is bound into the checkout's custom_data — that binding is what makes
 * the webhook trustworthy. Gated by PAYMENTS_CARD_ENABLED (off pre-KYC).
 */
export async function createCardCheckout(
  kind: string,
  slug: string,
  tierId: string,
): Promise<{ url?: string; error?: string }> {
  if (process.env.PAYMENTS_CARD_ENABLED !== "1") {
    return { error: "Kartično plaćanje trenutno nije dostupno." };
  }
  if (!isPaymentKind(kind)) return { error: "Neispravan zahtev." };

  const adapter = KINDS[kind];
  const entity = await adapter.loadEntity(slug);
  if (!entity) return { error: "Nije pronađeno." };

  const tier = adapter.tiers(entity).find((t) => t.id === tierId);
  if (!tier) return { error: "Nedostupan paket." };

  let money;
  try {
    money = adapter.computeOrder(entity, tierId);
  } catch (e) {
    if (e instanceof PaymentError && e.code === "ALREADY_UNLOCKED") {
      return { error: "Već aktivirano." };
    }
    return { error: "Greška u obračunu." };
  }

  const order = await getOrCreatePendingOrder({
    kind,
    slug,
    tier: tierId,
    amountRsd: money.totalRsd,
    amountEur: money.totalEur,
    lines: money.lines,
  });

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = process.env[tier.lsVariantEnv];
  if (!storeId || !variantId) {
    return { error: "Kartično plaćanje trenutno nije konfigurisano." };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";
  try {
    const { url, checkoutId } = await createCheckout({
      storeId,
      variantId,
      custom: { kind, slug, tier: tierId, order_id: order.orderId },
      redirectUrl: `${site}/placanje/${kind}/${slug}/hvala/?order=${order.orderId}`,
      receiptButtonText: "Nazad na pozivnicu",
      receiptLinkUrl: `${site}${productUrl(kind, slug)}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    await setOrderRail(order.orderId, "card", {
      ls: { ...order.ls, checkoutId },
    });
    // Nudge LS toward the Croatian checkout locale (closest to Serbian).
    const withLocale = `${url}${url.includes("?") ? "&" : "?"}locale=hr`;
    return { url: withLocale };
  } catch (e) {
    console.error("createCardCheckout failed:", e);
    return { error: "Kartično plaćanje trenutno nije dostupno." };
  }
}
