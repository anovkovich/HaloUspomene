"use server";

import { KINDS, isPaymentKind, PaymentError } from "@/lib/payments/kinds";
import { productUrl } from "@/lib/payments/product-urls";
import { getOrCreatePendingOrder, setOrderRail } from "@/lib/orders";
import { createCheckout } from "@/lib/payments/lemonsqueezy";
import {
  verifyPromo,
  applyPromo,
  PROMO_CAP,
  PROMO_LS_CODE,
} from "@/lib/payments/promo";
import { countRedemptions } from "@/lib/promo-redemptions";

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
  promoCode?: string,
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

  // Re-validate the promo SERVER-SIDE (only the code string is trusted, never a
  // client amount) so the frozen order matches the same (kind,slug,tier,promo)
  // identity the page created — the card checkout reuses that exact row.
  let appliedPromo:
    | { code: string; discountEur: number; discountRsd: number }
    | undefined;
  if (promoCode) {
    const p = verifyPromo(promoCode, kind);
    if (p.valid && (await countRedemptions(p.code)) < PROMO_CAP) {
      const applied = applyPromo(money, p);
      money = applied;
      appliedPromo = {
        code: p.code,
        discountEur: applied.discountEur,
        discountRsd: applied.discountRsd,
      };
    }
  }

  const order = await getOrCreatePendingOrder({
    kind,
    slug,
    tier: tierId,
    amountRsd: money.totalRsd,
    amountEur: money.totalEur,
    lines: money.lines,
    promo: appliedPromo,
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
      // LS applies the discount code; the post-discount total must equal the
      // frozen order.amountRsd. The referral code is a percentage, the tier code
      // a flat amount — each must mirror exactly what applyPromo/computeOrder
      // already took off, or the webhook money invariant quarantines it. Only
      // one ever applies: the referral promo is pozivnica-only, and
      // lsDiscountCode is set only on other kinds' tiers.
      discountCode: appliedPromo ? PROMO_LS_CODE : tier.lsDiscountCode,
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
