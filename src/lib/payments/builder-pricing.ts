// Single source of pricing truth for the /napravi-pozivnicu builder checkout.
// Invitation base + the three FUNCTIONAL add-ons (raspored/audio/galerija) are
// always charged; their bundle discount mirrors QuestionnaireForm exactly.
// The flat extras (music / custom colour / polaroid images) are a PACKAGE PERK:
//   - FREE (0 din) only when the full functional trio is chosen (= Kompletan or
//     Premium) — a bonus that rewards taking the whole package.
//   - CHARGED à-la-carte otherwise → the selection becomes a custom (IPS) order.
// USB souvenirs (kaseta/bočica) are always off-system: paid on delivery
// (pouzeće), never a checkout line.
//
// Full-bundle math (verified): classic 5000+2500+3000+3500−4100 = 9.900;
// premium 10000+2500+3000+3500−5100 = 13.900. Both equal the tier prices.
// Client-safe: imports only pricing data.

import {
  pricing,
  getPremiumPrice,
  getPremiumRasporedPrice,
  getPremiumAudioPrice,
  getKompletnoSavings,
  getPremiumTierSavings,
  getTier,
} from "@/data/pricing";
import type { CheckoutLine } from "@/lib/orders";

/** Premium partial-bundle discount — MUST equal PREMIUM_PARTIAL_DISCOUNT in
 *  QuestionnaireForm.tsx. */
const PREMIUM_PARTIAL_DISCOUNT = 2500;

/** What the couple configured in the builder — also the shape of the
 *  `builder_extras` snapshot persisted on the couple. */
export interface BuilderSelection {
  premium: boolean;
  raspored: boolean;
  audio: boolean;
  galerija: boolean;
  music: boolean; // free bonus
  usb: "" | "kaseta" | "bocica"; // off-system, pouzeće
  images: boolean; // classic-only polaroid, free bonus
  customColor: boolean; // free bonus
}

const addonPrice = (id: string): number =>
  pricing.addons.find((a) => a.id === id)?.price ?? 0;

/**
 * Line-itemised money for a builder selection. Flat extras are free (0-din
 * lines) only inside the full package; USB never appears — it's collected on
 * delivery. `eur` is 0 on every line (the panel quotes RSD).
 */
export function computeBuilderMoney(sel: BuilderSelection): {
  lines: CheckoutLine[];
  totalRsd: number;
} {
  const lines: CheckoutLine[] = [];
  const line = (l: string, rsd: number) => lines.push({ l, rsd, eur: 0 });

  const base = sel.premium
    ? getPremiumPrice()
    : pricing.pozivnica.website.price;
  line(sel.premium ? "Premium pozivnica" : "Website pozivnica", base);

  if (sel.raspored) {
    line(
      "Raspored sedenja",
      sel.premium ? getPremiumRasporedPrice() : pricing.pozivnica.raspored.price,
    );
  }
  if (sel.audio) {
    line(
      "Digitalna audio knjiga",
      sel.premium ? getPremiumAudioPrice() : pricing.pozivnica.audio.price,
    );
  }
  if (sel.galerija)
    line("QR galerija fotografija", pricing.pozivnica.galerija.price);

  // Flat extras — free bonus with the full package, à-la-carte otherwise.
  const allThree = sel.raspored && sel.audio && sel.galerija;
  if (sel.music)
    line(
      allThree ? "Muzika u pozadini — gratis" : "Muzika u pozadini",
      allThree ? 0 : addonPrice("background_music"),
    );
  if (!sel.premium && sel.images)
    line(
      allThree ? "Galerija fotografija — gratis" : "Galerija fotografija",
      allThree ? 0 : addonPrice("images"),
    );
  if (sel.customColor)
    line(
      allThree ? "Prilagođena boja teme — gratis" : "Prilagođena boja teme",
      allThree ? 0 : addonPrice("custom_color"),
    );
  // USB souvenirs are intentionally NOT a line — paid on delivery (pouzeće).

  // Bundle discount — full three beats the partial promo. Applies only to the
  // raspored/audio/galerija bundle.
  const partial = sel.raspored && (sel.galerija || sel.audio);
  let discount = 0;
  if (sel.premium) {
    if (allThree) discount = getPremiumTierSavings();
    else if (partial) discount = PREMIUM_PARTIAL_DISCOUNT;
  } else {
    if (allThree) discount = getKompletnoSavings();
    else if (partial)
      discount =
        pricing.pozivnica.bundleFullPrice - pricing.pozivnica.bundlePrice;
  }
  if (discount > 0) line("Popust na paket", -discount);

  const totalRsd = Math.max(
    0,
    lines.reduce((s, l) => s + l.rsd, 0),
  );
  return { lines, totalRsd };
}

/**
 * The tier-routed /placanje URL for a couple's preview "pay & unlock" CTA:
 * full package → its fixed tier, partial combo → ?tier=custom (IPS), and the
 * bare page when there's no builder snapshot (legacy/admin couples).
 */
export function builderPayHref(
  slug: string,
  ex: BuilderSelection | undefined | null,
): string {
  if (!ex) return `/placanje/pozivnica/${slug}`;
  const d = detectPackage(ex);
  const tier = d.kind === "fixed" ? d.tier : "custom";
  return `/placanje/pozivnica/${slug}/?tier=${tier}`;
}

export type PackageDecision =
  | { kind: "fixed"; tier: "osnovni" | "kompletan" | "premium"; rsd: number }
  | {
      kind: "custom";
      rsd: number;
      /** The full bundle we upsell on the card rail for this base. */
      upsell: { tier: "kompletan" | "premium"; rsd: number };
      /** True when the full package costs the same or less than this custom
       *  combo — the success screen then offers ONLY the package. */
      upsellCheaper: boolean;
    };

/**
 * Routes a builder selection to a fixed tier (self-serve card + IPS) or the
 * custom path. Only the functional trio matters now (free bonuses/USB don't
 * change the total). The `total === tier.price` guard means any pricing.json
 * drift falls safely to "custom" rather than charging a wrong fixed amount.
 */
export function detectPackage(sel: BuilderSelection): PackageDecision {
  const { totalRsd } = computeBuilderMoney(sel);
  const osnovniPrice = getTier("osnovno")?.price ?? 5000;
  const kompletanPrice = getTier("kompletno")?.price ?? 9900;
  const premiumPrice = getTier("premium")?.price ?? 13900;

  const allThree = sel.raspored && sel.audio && sel.galerija;
  const noFunctional = !sel.raspored && !sel.audio && !sel.galerija;

  if (!sel.premium) {
    if (noFunctional && totalRsd === osnovniPrice)
      return { kind: "fixed", tier: "osnovni", rsd: osnovniPrice };
    if (allThree && totalRsd === kompletanPrice)
      return { kind: "fixed", tier: "kompletan", rsd: kompletanPrice };
    return {
      kind: "custom",
      rsd: totalRsd,
      upsell: { tier: "kompletan", rsd: kompletanPrice },
      upsellCheaper: totalRsd >= kompletanPrice,
    };
  }

  if (allThree && totalRsd === premiumPrice)
    return { kind: "fixed", tier: "premium", rsd: premiumPrice };
  return {
    kind: "custom",
    rsd: totalRsd,
    upsell: { tier: "premium", rsd: premiumPrice },
    upsellCheaper: totalRsd >= premiumPrice,
  };
}
