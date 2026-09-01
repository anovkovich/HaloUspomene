import { formatPrice } from "@/data/pricing";
import pricing from "@/data/pricing.json";

/**
 * Tabs and upsell copy for the proslava portal (punoletstvo + dečiji rođendan).
 *
 * Everything branches on `isEighteenth` and the entity's `paid_for_*` flags —
 * never on a slug. A per-slug branch would be dead code two weeks after the
 * party, and nobody would delete it.
 */

export type ProslavaTab =
  | "pregled"
  | "gosti"
  | "galerija"
  | "raspored"
  | "meni"
  | "slike";

export interface TabDef {
  key: ProslavaTab;
  label: string;
  /** Locked tabs render the upsell teaser instead of their content. */
  locked: boolean;
  /** When set, the tab is a plain link out of the portal, not a view. */
  href?: string;
}

export interface UpsellMeta {
  title: string;
  /** Factual "what is this". */
  what: string;
  /** One emotional line — why it's worth the money. */
  why: string;
  priceLabel: string;
  ctaLabel: string;
  ctaHref: string;
  /** Second route to the same outcome. Only Meni uses it: it is unlocked by
   *  EITHER paid add-on, so offering one of them would be arbitrary. */
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
}

/**
 * Flip a feature to `true` once its tier exists in `kinds.ts`, so the CTA sends
 * the buyer to checkout instead of the contact form. Until then `/placanje/...`
 * would render "sve je otključano" (the checkout page's zero-tier state), which
 * reads as a bug to a customer who is trying to give us money.
 */
const PURCHASABLE: Record<PurchasableFeature, boolean> = {
  galerija: true,
  raspored: true,
  slike: true,
};

export type UpsellFeature = "galerija" | "raspored" | "slike" | "meni";

/** The three that are actually sold. Meni is unlocked as a side effect. */
type PurchasableFeature = Exclude<UpsellFeature, "meni">;

function ctaFor(
  feature: PurchasableFeature,
  kind: "punoletstvo" | "rodjendan",
  slug: string,
): { ctaLabel: string; ctaHref: string } {
  return PURCHASABLE[feature]
    ? {
        ctaLabel: "Dodaj uz pozivnicu",
        ctaHref: `/placanje/${kind}/${slug}/?tier=${feature}`,
      }
    : { ctaLabel: "Pišite nam", ctaHref: "/#kontakt" };
}

export interface PortalFlags {
  isEighteenth: boolean;
  slug: string;
  paidForRaspored: boolean;
  paidForGallery: boolean;
  paidForImages: boolean;
}

export function getPortalTabs(flags: PortalFlags): TabDef[] {
  const { isEighteenth, slug, paidForRaspored, paidForGallery, paidForImages } =
    flags;

  // Order is deliberate: the two always-usable tabs first, then the add-ons
  // cheapest-to-dearest (slike 600 → galerija 3.500 … raspored 2.500 sits with
  // them), and Meni last because it is a bonus rather than a purchase.
  const tabs: TabDef[] = [
    { key: "pregled", label: "Pregled", locked: false },
    { key: "gosti", label: "Gosti", locked: false },
  ];

  // Only the punoletstvo renderer draws the polaroid strip, so the tab (and
  // its teaser) would be a promise the dečiji invitation cannot keep.
  if (isEighteenth) {
    tabs.push({ key: "slike", label: "Slike", locked: !paidForImages });
  }

  tabs.push({ key: "galerija", label: "Galerija", locked: !paidForGallery });

  // Paid seating ALWAYS gets its link, on both products — that link is the
  // client's only way into an editor they already bought.
  //
  // The unpaid *teaser* is punoletstvo-only: a dečiji rođendan in an igraonica
  // has no seating plan, so teasing it there would be noise — and noise erodes
  // trust in the teasers that do fit.
  if (paidForRaspored) {
    tabs.push({
      key: "raspored",
      label: "Raspored",
      locked: false,
      // Punoletstvo has no seating route of its own; it reuses the
      // dečiji-rođendan editor since both share `birthday_events`.
      href: `/deciji-rodjendan/${slug}/raspored-sedenja`,
    });
  } else if (isEighteenth) {
    tabs.push({ key: "raspored", label: "Raspored", locked: true });
  }

  // Meni is free, but NOT self-standing: the only way it reaches a guest is a
  // QR that one of the paid add-ons already puts in their hands — the gallery
  // code, or the raspored welcome sign. With neither, a menu the owner fills in
  // is a page nobody can open.
  //
  // Shown-but-locked rather than hidden: the teaser IS the pitch here, since
  // what it asks the client to buy is exactly what makes the menu deliverable.
  tabs.push({
    key: "meni",
    label: "Meni",
    locked: !(paidForGallery || paidForRaspored),
  });

  return tabs;
}

/**
 * Description shown inside the UNLOCKED Meni tab.
 *
 * Adapts to which add-on the client owns, because the sentence names a physical
 * object: telling a gallery-only client to look at their "pano dobrodošlice"
 * describes a sign they never ordered. No Serbian typographic quotes here — the
 * grandfathered ones in MeniCard survive only because they sit in JSX text, and
 * this is a string literal.
 */
export function getMeniDescription(flags: PortalFlags): string {
  const tail = "Možete dodati samo piće, samo hranu, ili oboje.";
  const { paidForGallery, paidForRaspored } = flags;

  if (paidForGallery && paidForRaspored) {
    return `Dodajte jela i/ili pića. Gosti ih vide u tabu Meni — bilo da skeniraju QR kod galerije sa stolova ili QR sa panoa dobrodošlice. ${tail}`;
  }
  if (paidForGallery) {
    return `Dodajte jela i/ili pića. Gosti ih vide u tabu Meni na istoj stranici koju otvara QR kod galerije sa stolova. ${tail}`;
  }
  return `Dodajte jela i/ili pića. Gosti ih vide u tabu Meni kada skeniraju QR kod sa panoa dobrodošlice. ${tail}`;
}

export function getUpsellMeta(
  feature: UpsellFeature,
  flags: PortalFlags,
): UpsellMeta {
  const kind = flags.isEighteenth ? "punoletstvo" : "rodjendan";

  if (feature === "meni") {
    const gallery = ctaFor("galerija", kind, flags.slug);
    // Only punoletstvo is offered raspored as the second route — the dečiji
    // portal deliberately never teases seating (see getPortalTabs), and this
    // teaser must not contradict that.
    const seating = flags.isEighteenth
      ? ctaFor("raspored", kind, flags.slug)
      : null;
    return {
      title: "Meni za goste",
      what:
        "Spisak jela i pića koji gosti otvaraju telefonom na proslavi — na istoj stranici na koju ih vodi QR kod galerije ili rasporeda sedenja.",
      why: "Meni ne ide sam: treba mu QR kod koji gosti ionako skeniraju na proslavi. Uz QR galeriju ili raspored sedenja dobijate ga uz njih.",
      priceLabel: "Dolazi uz QR galeriju ili raspored sedenja",
      ctaLabel: `QR galerija — ${formatPrice(pricing.pozivnica.galerija.price)}`,
      ctaHref: gallery.ctaHref,
      ...(seating
        ? {
            ctaSecondaryLabel: `Raspored sedenja — ${formatPrice(
              pricing.rodjendan.raspored.price,
            )}`,
            ctaSecondaryHref: seating.ctaHref,
          }
        : {}),
    };
  }

  if (feature === "galerija") {
    return {
      title: "QR galerija fotografija",
      what:
        "Gosti skeniraju QR kod i dodaju fotografije sa proslave — direktno sa telefona, bez ikakve aplikacije. Sve slike se skupljaju na jednom mestu, a vi ih preuzimate kad god poželite.",
      why: "Umesto da posle proslave jurite slike po grupama i telefonima, dobijate ceo album — očima vaših gostiju.",
      priceLabel: `${formatPrice(pricing.pozivnica.galerija.price)} jednokratno`,
      ...ctaFor("galerija", kind, flags.slug),
    };
  }

  if (feature === "slike") {
    const price =
      pricing.addons.find((a) => a.id === "images")?.price ?? 600;
    return {
      title: "Fotografije na pozivnici",
      what:
        "Do tri vaše fotografije na samoj pozivnici, u polaroid stilu ispod naslova. Dodajete ih i menjate sami iz portala, u svakom trenutku.",
      why: "Pozivnica prestaje da bude obrazac i postaje vaša — gost vidi lice, ne samo datum.",
      priceLabel: `${formatPrice(price)} jednokratno`,
      ...ctaFor("slike", kind, flags.slug),
    };
  }

  return {
    title: "Raspored sedenja",
    what:
      "Nacrtajte salu, rasporedite goste za stolove, a svako od gostiju sa pozivnice vidi gde sedi. Gotov raspored preuzimate i kao PDF za štampu.",
    why: "Bez pitanja „gde ja sedim\" na dan proslave — i bez menjanja rasporeda na salveti u poslednji čas.",
    priceLabel: `${formatPrice(pricing.rodjendan.raspored.price)} jednokratno`,
    ...ctaFor("raspored", kind, flags.slug),
  };
}
