import type { PaymentKind } from "@/lib/orders";

// Public URL of the unlocked product per kind. Type-only import above (erased at
// compile) so this stays client-safe — usable from both the admin table and the
// server `/hvala` page. galerija unlocks a flag on the couple record, so it
// deep-links to the invitation.
export function productUrl(kind: PaymentKind, slug: string): string {
  switch (kind) {
    case "pozivnica":
    case "galerija":
      return `/pozivnica/${slug}/`;
    case "rodjendan":
      return `/deciji-rodjendan/${slug}/`;
    case "punoletstvo":
      return `/punoletstvo/${slug}/`;
    case "raspored":
      return `/raspored-sedenja/${slug}/`;
  }
}

export const KIND_LABEL_SR: Record<PaymentKind, string> = {
  pozivnica: "Pozivnica",
  rodjendan: "Rođendanska pozivnica",
  punoletstvo: "Pozivnica za punoletstvo",
  raspored: "Raspored sedenja",
  galerija: "QR galerija",
};
