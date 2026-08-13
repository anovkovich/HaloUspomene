import type { PaymentKind } from "@/lib/orders";

// Public URL of the unlocked product per kind. Type-only import above (erased at
// compile) so this stays client-safe — usable from both the admin table and the
// server `/hvala` page.
export function productUrl(kind: PaymentKind, slug: string): string {
  switch (kind) {
    case "pozivnica":
      return `/pozivnica/${slug}/`;
    case "galerija":
      // Standalone galerija koristi portal; kupac je auto-ulogovan preko
      // QuickRegister mehanizma. ?tab=galerija otvara direktno Galerija view.
      return `/moje-vencanje/?tab=galerija`;
    case "rodjendan":
      return `/deciji-rodjendan/${slug}/`;
    case "punoletstvo":
      return `/punoletstvo/${slug}/`;
    case "raspored":
      return `/raspored-sedenja/${slug}/`;
    case "dogadjaj":
      // The package's headline deliverable is the public invitation.
      return `/dogadjaj/${slug}/`;
    case "telefon":
      // Physical rental — there is no per-buyer page, so we send them back to
      // the product page they bought from.
      return `/telefon-uspomena/`;
  }
}

/**
 * Which `share_links` category a payment kind belongs to, so /hvala can mint
 * the buyer's own `/pristup/[token]` page right after the order unlocks.
 *
 * `null` means the kind has no per-buyer portal to hand over: `telefon` is a
 * physical rental with no slug-scoped page of its own. Type-only import above,
 * so this stays client-safe like the rest of the module.
 */
export function shareProductKind(
  kind: PaymentKind,
): "couple" | "birthday" | "seating" | null {
  switch (kind) {
    case "pozivnica":
    case "galerija":
      return "couple";
    case "rodjendan":
    case "punoletstvo":
      return "birthday";
    case "raspored":
    case "dogadjaj":
      return "seating";
    case "telefon":
      return null;
  }
}

export const KIND_LABEL_SR: Record<PaymentKind, string> = {
  pozivnica: "Pozivnica",
  rodjendan: "Rođendanska pozivnica",
  punoletstvo: "Pozivnica za punoletstvo",
  raspored: "Raspored sedenja",
  galerija: "QR galerija",
  dogadjaj: "Korporativni paket",
  telefon: "Retro telefon",
};
