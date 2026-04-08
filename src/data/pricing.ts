import data from "./pricing.json";

export const pricing = data;

/** Formats a number as Serbian price string, e.g. 9000 → "9.000 din" */
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
