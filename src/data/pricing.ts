import data from "./pricing.json";

/**
 * Shape of `pricing.json`.
 *
 * Declared by hand rather than inferred, because TypeScript types a JSON import
 * by its *current literal contents*: a promo that happens to be switched off
 * today has no `promoPrice` key, so the inferred type has no such field and
 * every reader has to reach for `as any`. Marking the promo fields optional
 * describes what the file may legitimately contain, and the readers below
 * become type-checked instead of type-erased.
 */
interface PriceEntry {
  label: string;
  price: number;
}

/** Entry that is also sold by card, so it carries a fixed EUR price. */
interface PriceEntryEur extends PriceEntry {
  priceEur: number;
}

/** Entry whose price can be temporarily overridden by an active promo. When the
 *  promo is off, `promoPrice` is simply absent from the JSON — hence optional. */
interface PromoPriceEntry extends PriceEntry {
  promoPrice?: number | null;
  promoActive?: boolean;
}

interface Pricing {
  packages: {
    essential: {
      name: string;
      price: number;
      /** Frozen onto card/IPS orders for the `telefon` kind (foreign-card view). */
      priceEur: number;
      discountPrice?: number | null;
      discountActive?: boolean;
    };
  };
  pozivnica: {
    website: PriceEntry;
    pdf: PriceEntry;
    raspored: PriceEntry;
    audio: PriceEntry;
    galerija: PriceEntryEur;
    bundlePrice: number;
    bundleFullPrice: number;
  };
  /** Bundle tiers on /cene. Keys are optional so `getTier` can keep returning
   *  null for a tier that has been pulled from the page. */
  tiers?: Partial<
    Record<
      "osnovno" | "kompletno" | "premium",
      PriceEntryEur & { fullPrice?: number; includes?: string[] }
    >
  >;
  addons: Array<{
    id: string;
    label: string;
    price: number;
    note?: string;
    for_retro_phone?: boolean;
  }>;
  /** `rasporedPrice` / `audioPrice` are the bundled add-on prices that apply
   *  only when bought together with Premium; absent means "no discount". */
  premium: PromoPriceEntry & {
    rasporedPrice?: number;
    audioPrice?: number;
  };
  rodjendan: {
    pozivnica: PriceEntryEur;
    punoletstvo: PriceEntryEur;
    raspored: PriceEntry;
  };
  standalone_seating: PromoPriceEntry & { priceEur: number };
  dogadjaj: {
    pozivnica: PriceEntryEur;
    paket: PriceEntryEur;
  };
}

export const pricing = data as Pricing;

/** Formats a number as Serbian price string, e.g. 8000 → "8.000 din" */
export function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " din";
}

/** Formats a number as a EUR price string, e.g. 85 → "85 €". EUR prices are a
 *  separate fixed list (card / Lemon Squeezy), NOT a live FX conversion of the
 *  RSD price — see `priceEur` fields in pricing.json. */
export function formatEur(price: number): string {
  return `${price} €`;
}

/** Returns effective price: discountPrice when active, otherwise regular price */
export function getAudioPrice(): number {
  const { price, discountPrice, discountActive } = pricing.packages.essential;
  return discountActive && discountPrice ? discountPrice : price;
}

/** True if a discount is currently configured and active */
export function isAudioDiscountActive(): boolean {
  const { discountPrice, discountActive } = pricing.packages.essential;
  return !!(discountActive && discountPrice);
}

/** Returns effective premium price: promoPrice when active, otherwise regular price */
export function getPremiumPrice(): number {
  const { price, promoPrice, promoActive } = pricing.premium;
  return promoActive && promoPrice ? promoPrice : price;
}

/** True if a premium promo is currently active */
export function isPremiumPromoActive(): boolean {
  const { promoPrice, promoActive } = pricing.premium;
  return !!(promoActive && promoPrice);
}

/** Regular (non-promo) premium price */
export function getPremiumRegularPrice(): number {
  return pricing.premium.price;
}

/** Premium-bundled raspored price (discounted when purchased with Premium) */
export function getPremiumRasporedPrice(): number {
  return (
    pricing.premium.rasporedPrice ?? pricing.pozivnica.raspored.price
  );
}

/** Premium-bundled audio price (discounted when purchased with Premium) */
export function getPremiumAudioPrice(): number {
  return pricing.premium.audioPrice ?? pricing.pozivnica.audio.price;
}

export function getRodjendanPozivnicaPrice(t18 = false): number {
  const r = pricing.rodjendan;
  return t18 ? r.punoletstvo.price : r.pozivnica.price;
}

export function getRodjendanPozivnicaLabel(t18 = false): string {
  const r = pricing.rodjendan;
  return t18 ? r.punoletstvo.label : r.pozivnica.label;
}

export function getRodjendanRasporedPrice(): number {
  return pricing.rodjendan.raspored.price;
}

/** Effective price for the standalone seating tool (raspored za organizatore):
 *  promoPrice when promo is active, otherwise the regular price. */
export function getStandaloneSeatingPrice(): number {
  const ss = pricing.standalone_seating;
  return ss.promoActive && ss.promoPrice ? ss.promoPrice : ss.price;
}

/** True if a standalone seating promo is currently configured and active. */
export function isStandaloneSeatingPromoActive(): boolean {
  const ss = pricing.standalone_seating;
  return !!(ss.promoActive && ss.promoPrice);
}

/** Regular (non-promo) standalone seating price. */
export function getStandaloneSeatingRegularPrice(): number {
  return pricing.standalone_seating.price;
}

/** Event invitation as an add-on for a client who already has the seating
 *  tool. Sold manually (IPS / bank transfer); the card rail sells the package
 *  below instead. */
export function getDogadjajPozivnicaPrice(): number {
  return pricing.dogadjaj.pozivnica.price;
}

export function getDogadjajPozivnicaPriceEur(): number {
  return pricing.dogadjaj.pozivnica.priceEur;
}

/** Korporativni paket — seating + invitation + QR gallery in one purchase, so
 *  a company pays once with a company card. */
export function getDogadjajPaketPrice(): number {
  return pricing.dogadjaj.paket.price;
}

export function getDogadjajPaketPriceEur(): number {
  return pricing.dogadjaj.paket.priceEur;
}

/** A /cene bundle tier (osnovno | kompletno | premium). */
export function getTier(id: "osnovno" | "kompletno" | "premium"): {
  label: string;
  price: number;
  priceEur?: number;
  fullPrice?: number;
  includes?: string[];
} | null {
  return pricing.tiers?.[id] ?? null;
}

/** Savings of the Kompletno tier vs à-la-carte full price (e.g. 14000 - 9900 = 4100). */
export function getKompletnoSavings(): number {
  const t = getTier("kompletno");
  if (!t || !t.fullPrice) return 0;
  return Math.max(0, t.fullPrice - t.price);
}

/** Savings of the Premium tier vs à-la-carte full price (e.g. 19000 - 13900 = 5100). */
export function getPremiumTierSavings(): number {
  const t = getTier("premium");
  if (!t || !t.fullPrice) return 0;
  return Math.max(0, t.fullPrice - t.price);
}
