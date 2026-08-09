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

export const KIND_LABEL_SR: Record<PaymentKind, string> = {
  pozivnica: "Pozivnica",
  rodjendan: "Rođendanska pozivnica",
  punoletstvo: "Pozivnica za punoletstvo",
  raspored: "Raspored sedenja",
  galerija: "QR galerija",
  dogadjaj: "Korporativni paket",
  telefon: "Retro telefon",
};
