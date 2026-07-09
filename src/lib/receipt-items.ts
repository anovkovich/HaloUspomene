// Receipt line-item builder — single source of pricing truth for /racun.
//
// Receipts are IMMUTABLE QUOTES: at generation time (in the admin builders) we
// snapshot the computed line items into the receipt payload (`v: 2`, `li`, `bd`).
// /racun then renders the carried snapshot instead of recomputing — so editing
// pricing.json or flipping a promo can NEVER change the amount on a receipt
// already sent to a customer (the NBS IPS QR encodes that frozen amount).
//
// `buildReceiptItems` is a pure function of (flags, priceTable). New receipts
// use `currentPriceTable()` (live pricing.json). Legacy receipts (no `v`) are
// priced with the frozen `LEGACY_PRICE_TABLE` so links already in WhatsApp keep
// exactly the amounts they were quoted — forever. There is only ever ONE legacy
// table (no per-promo epoch accretion).

import {
  pricing,
  getPremiumPrice,
  getPremiumRasporedPrice,
  getPremiumAudioPrice,
  getAudioPrice,
  getStandaloneSeatingPrice,
  getRodjendanPozivnicaPrice,
  getRodjendanPozivnicaLabel,
  getRodjendanRasporedPrice,
  getKompletnoSavings,
  getPremiumTierSavings,
} from "@/data/pricing";

/** A single receipt line item. `f: 1` renders as GRATIS. */
export interface ReceiptItem {
  l: string;
  p: number;
  f?: 1;
}

/** Pricing-relevant subset of the receipt payload. */
export interface ReceiptFlags {
  kind?: "rodjendan" | "raspored";
  custom?: 1;
  s?: string;
  r?: number;
  a?: number;
  uk?: number;
  ub?: number;
  rp?: number;
  pd?: number;
  cc?: number;
  ig?: number;
  g?: number;
  mu?: number;
  p?: number;
  t18?: number;
  ci?: Array<{ l: string; p: number }>;
}

/** All numbers/labels the item builder needs, so it can be run against either
 *  live pricing (new receipts) or a frozen snapshot (legacy receipts). */
export interface PriceTable {
  website: number;
  raspored: number;
  audio: number;
  galerija: number;
  bundleFull: number;
  bundle: number;
  premium: number;
  premiumRaspored: number;
  premiumAudio: number;
  /** Tier discounts (à-la-carte full − tier price). 0 disables that tier bundle
   *  (legacy receipts keep 0 so they fall back to the old −2.000 partial promo). */
  kompletnoSavings: number;
  premiumSavings: number;
  /** Whether Premium also gets a partial bundle discount (raspored + one).
   *  Legacy premium receipts had no bundle discount, so this is false for them. */
  premiumPartialBundle: boolean;
  /** Premium partial bundle discount amount (raspored + galerija OR audio). */
  premiumPartialDiscount: number;
  usbKaseta: number;
  usbBocica: number;
  customColor: number;
  images: number;
  backgroundMusic: number;
  personalizovanaDobrodoslica: number;
  retroPhoneAudio: number;
  rodjendanPozivnica: number;
  rodjendanPunoletstvo: number;
  rodjendanRaspored: number;
  standaloneSeating: number;
}

const addon = (id: string): number =>
  pricing.addons.find((a) => a.id === id)?.price ?? 0;

/** Live price table from the current pricing.json (used for NEW receipts). */
export function currentPriceTable(): PriceTable {
  return {
    website: pricing.pozivnica.website.price,
    raspored: pricing.pozivnica.raspored.price,
    audio: pricing.pozivnica.audio.price,
    galerija: pricing.pozivnica.galerija.price,
    bundleFull: pricing.pozivnica.bundleFullPrice,
    bundle: pricing.pozivnica.bundlePrice,
    premium: getPremiumPrice(),
    premiumRaspored: getPremiumRasporedPrice(),
    premiumAudio: getPremiumAudioPrice(),
    kompletnoSavings: getKompletnoSavings(),
    premiumSavings: getPremiumTierSavings(),
    premiumPartialBundle: true,
    premiumPartialDiscount: 2500,
    usbKaseta: addon("usb_kaseta"),
    usbBocica: addon("usb_bocica"),
    customColor: addon("custom_color"),
    images: addon("images"),
    backgroundMusic: addon("background_music"),
    personalizovanaDobrodoslica: addon("personalizovana_dobrodoslica"),
    retroPhoneAudio: getAudioPrice(),
    rodjendanPozivnica: getRodjendanPozivnicaPrice(false),
    rodjendanPunoletstvo: getRodjendanPozivnicaPrice(true),
    rodjendanRaspored: getRodjendanRasporedPrice(),
    standaloneSeating: getStandaloneSeatingPrice(),
  };
}

/** Frozen snapshot of the EFFECTIVE prices as they were before the snapshot
 *  mechanism shipped — so pre-existing receipt links never reprice. Do NOT
 *  edit these to follow future price changes; that is exactly what would break
 *  old links. New receipts carry their own snapshot and never touch this. */
export const LEGACY_PRICE_TABLE: PriceTable = {
  website: 5000,
  raspored: 2500,
  audio: 3000,
  galerija: 3500,
  bundleFull: 10500,
  bundle: 8500,
  premium: 10000, // premium PROMO price was active
  premiumRaspored: 1000,
  premiumAudio: 1000,
  kompletnoSavings: 0, // tiers didn't exist pre-deploy → old −2.000 partial applies
  premiumSavings: 0,
  premiumPartialBundle: false, // legacy premium receipts had no bundle discount
  premiumPartialDiscount: 0,
  usbKaseta: 2500,
  usbBocica: 2000,
  customColor: 600,
  images: 600,
  backgroundMusic: 1000,
  personalizovanaDobrodoslica: 0,
  retroPhoneAudio: 8000,
  rodjendanPozivnica: 4000,
  rodjendanPunoletstvo: 4000,
  rodjendanRaspored: 2500,
  standaloneSeating: 4000, // July promo was active
};

/** Build receipt line items + bundle discount for the given flags & price table.
 *  Pure: no side effects, no live-pricing reads beyond the passed table
 *  (labels for rodjendan come from a non-price helper). */
export function buildReceiptItems(
  f: ReceiptFlags,
  T: PriceTable,
): { items: ReceiptItem[]; bundleDiscount: number } {
  const items: ReceiptItem[] = [];

  const isRodjendan = f.kind === "rodjendan";
  const isRaspored = f.kind === "raspored";
  const isPhoneRental = f.s?.startsWith("tel-") ?? false;
  const isWedding = !isRodjendan && !isRaspored && !isPhoneRental && !f.custom;

  // Retro-phone add-ons (allowed alongside any wedding/phone receipt).
  if (!isRodjendan && !isRaspored) {
    if (f.rp) items.push({ l: "Audio Guest Book — telefon", p: T.retroPhoneAudio });
    if (f.pd)
      items.push({
        l: "Personalizovana audio dobrodošlica",
        p: T.personalizovanaDobrodoslica,
      });
  }

  if (isWedding) {
    if (f.p) {
      items.push({ l: "Premium pozivnica", p: T.premium });
    } else {
      items.push({ l: "Website pozivnica", p: T.website });
      items.push({ l: "PDF pozivnica za štampu", p: 0, f: 1 });
    }

    if (f.r)
      items.push({
        l: "Raspored sedenja",
        p: f.p ? T.premiumRaspored : T.raspored,
      });
    if (f.a)
      items.push({
        l: "Audio knjiga utisaka",
        p: f.p ? T.premiumAudio : T.audio,
      });
    if (f.g) items.push({ l: "QR galerija fotografija", p: T.galerija });

    if (f.uk) items.push({ l: "USB retro kaseta", p: T.usbKaseta });
    if (f.ub) items.push({ l: "USB u bočici", p: T.usbBocica });
    if (f.cc) items.push({ l: "Prilagođena boja teme", p: T.customColor });
    // (bug fix: Polaroid galerija priced from "images", not "custom_color")
    if (f.ig) items.push({ l: "Polaroid galerija slika", p: T.images });
    if (f.mu) items.push({ l: "Muzika u pozadini", p: T.backgroundMusic });
  }

  if (isRodjendan) {
    const isPunoletstvo = !!f.t18;
    items.push({
      l: getRodjendanPozivnicaLabel(isPunoletstvo),
      p: isPunoletstvo ? T.rodjendanPunoletstvo : T.rodjendanPozivnica,
    });
    if (f.r) items.push({ l: "Raspored sedenja", p: T.rodjendanRaspored });
  }

  if (isRaspored) {
    items.push({ l: "Raspored sedenja za organizatore", p: T.standaloneSeating });
  }

  // Manual custom line items added by admin.
  if (f.ci?.length) {
    for (const ci of f.ci) items.push({ l: ci.l, p: ci.p });
  }

  // Tier / bundle discount. Full packages take precedence over the partial promo.
  //  Premium + all three add-ons → Premium paket (−5.100)
  //  Classic + all three         → Kompletno (−4.100)
  //  Classic + raspored + one    → partial promo (−2.000)
  const allThree = isWedding && !!f.r && !!f.a && !!f.g;
  let bundleDiscount = 0;
  if (isWedding) {
    if (f.p && allThree && T.premiumSavings) {
      bundleDiscount = T.premiumSavings;
    } else if (!f.p && allThree && T.kompletnoSavings) {
      bundleDiscount = T.kompletnoSavings;
    } else if (
      f.p &&
      !!f.r &&
      (!!f.g || !!f.a) &&
      T.premiumPartialBundle
    ) {
      bundleDiscount = T.premiumPartialDiscount;
    } else if (!f.p && !!f.r && (!!f.g || !!f.a)) {
      bundleDiscount = T.bundleFull - T.bundle;
    }
  }

  return { items, bundleDiscount };
}
