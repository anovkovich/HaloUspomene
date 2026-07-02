import data from "./pricing.json";

export const pricing = data;

/** Formats a number as Serbian price string, e.g. 8000 → "8.000 din" */
export function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " din";
}

/** Returns effective price: discountPrice when active, otherwise regular price */
export function getAudioPrice(): number {
  const { price, discountPrice, discountActive } = pricing.packages.essential as any;
  return discountActive && discountPrice ? discountPrice : price;
}

/** True if a discount is currently configured and active */
export function isAudioDiscountActive(): boolean {
  const { discountPrice, discountActive } = pricing.packages.essential as any;
  return !!(discountActive && discountPrice);
}

/** Returns effective premium price: promoPrice when active, otherwise regular price */
export function getPremiumPrice(): number {
  const { price, promoPrice, promoActive } = pricing.premium as any;
  return promoActive && promoPrice ? promoPrice : price;
}

/** True if a premium promo is currently active */
export function isPremiumPromoActive(): boolean {
  const { promoPrice, promoActive } = pricing.premium as any;
  return !!(promoActive && promoPrice);
}

/** Regular (non-promo) premium price */
export function getPremiumRegularPrice(): number {
  return (pricing.premium as any).price;
}

/** Premium-bundled raspored price (discounted when purchased with Premium) */
export function getPremiumRasporedPrice(): number {
  return (
    (pricing.premium as any).rasporedPrice ?? pricing.pozivnica.raspored.price
  );
}

/** Premium-bundled audio price (discounted when purchased with Premium) */
export function getPremiumAudioPrice(): number {
  return (pricing.premium as any).audioPrice ?? pricing.pozivnica.audio.price;
}

export function getRodjendanPozivnicaPrice(t18 = false): number {
  const r = (pricing as any).rodjendan;
  if (!r) return 0;
  return t18 ? r.punoletstvo.price : r.pozivnica.price;
}

export function getRodjendanPozivnicaLabel(t18 = false): string {
  const r = (pricing as any).rodjendan;
  if (!r) return t18 ? "Pozivnica za punoletstvo" : "Rođendanska pozivnica";
  return t18 ? r.punoletstvo.label : r.pozivnica.label;
}

export function getRodjendanRasporedPrice(): number {
  return (pricing as any).rodjendan?.raspored?.price ?? 0;
}

/** Effective price for the standalone seating tool (raspored za organizatore):
 *  promoPrice when promo is active, otherwise the regular price. */
export function getStandaloneSeatingPrice(): number {
  const ss = (pricing as any).standalone_seating;
  if (!ss) return 0;
  return ss.promoActive && ss.promoPrice ? ss.promoPrice : ss.price;
}

/** True if a standalone seating promo is currently configured and active. */
export function isStandaloneSeatingPromoActive(): boolean {
  const ss = (pricing as any).standalone_seating;
  return !!(ss?.promoActive && ss?.promoPrice);
}

/** Regular (non-promo) standalone seating price. */
export function getStandaloneSeatingRegularPrice(): number {
  return (pricing as any).standalone_seating?.price ?? 0;
}
