// Receipt line-item builder — single source of pricing truth for /racun.
//
// Receipts are IMMUTABLE QUOTES: at generation time (in the admin builders) we
// snapshot the computed line items into the receipt payload (`v: 2`, `li`, `bd`).
// /racun then renders the carried snapshot instead of recomputing — so editing
// pricing.json or flipping a promo can NEVER change the amount on a receipt
// already sent to a customer (the NBS IPS QR encodes that frozen amount).
//
// `buildReceiptItems` is a pure function of (flags, priceTable). Every receipt
// now generated is `v: 2` and carries its own snapshot, so /racun renders that
// and never reprices. A payload without a snapshot just recomputes from
// `currentPriceTable()` (live pricing.json) — there are no pre-snapshot receipt
// links left in circulation to preserve, so no frozen legacy table is kept.

import {
  pricing,
  getPremiumPrice,
  getPremiumRasporedPrice,
  getPremiumAudioPrice,
  getAudioPrice,
  getStandaloneSeatingPrice,
  getDogadjajPozivnicaPrice,
  getDogadjajPaketPrice,
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
  kind?: "rodjendan" | "raspored" | "galerija";
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
  /** Event invitation add-on on a standalone seating (kind: "raspored"). */
  dp?: number;
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
  dogadjajPozivnica: number;
  dogadjajPaket: number;
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
    dogadjajPozivnica: getDogadjajPozivnicaPrice(),
    dogadjajPaket: getDogadjajPaketPrice(),
  };
}

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
  // Standalone QR gallery sold without an invitation. Needs its own branch:
  // the wedding branch always opens with the 5.000 website line, which a
  // gallery-only client never bought.
  const isGalerija = f.kind === "galerija";
  const isPhoneRental = f.s?.startsWith("tel-") ?? false;
  const isWedding =
    !isRodjendan && !isRaspored && !isGalerija && !isPhoneRental && !f.custom;

  // Retro-phone add-ons (allowed alongside any wedding/phone receipt).
  if (!isRodjendan && !isRaspored && !isGalerija) {
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
    if (f.dp)
      items.push({ l: "Pozivnica za događaj", p: T.dogadjajPozivnica });
    // The QR gallery ships inside the Korporativni paket, so it has to appear
    // here too — otherwise the receipt lists less than the client received.
    if (f.g) items.push({ l: "QR galerija fotografija", p: T.galerija });
  }

  if (isGalerija) {
    items.push({ l: "QR galerija fotografija", p: T.galerija });
    // Anything else (zahvalnice, printed QR stands, …) comes in as custom items
    // below. No bundle discount — there is no package to net down to.
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

  // Korporativni paket: seating + invitation + gallery bought as one. Billed
  // as a package, so the receipt has to net down to the package price instead
  // of totalling the three list prices.
  if (isRaspored && f.dp && f.g) {
    const listTotal = T.standaloneSeating + T.dogadjajPozivnica + T.galerija;
    const packagePrice = T.dogadjajPaket;
    if (listTotal > packagePrice) bundleDiscount = listTotal - packagePrice;
  }
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
