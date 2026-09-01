import type { WeddingData } from "@/app/pozivnica/[slug]/types";

/** Only the flags the predicate reads, so admin list rows (which carry a subset
 *  of WeddingData) can be passed without a cast. */
export type GalleryOnlyInput = Pick<
  WeddingData,
  | "standalone_gallery"
  | "draft"
  | "paid_for_gallery"
  | "paid_for_raspored"
  | "paid_for_audio"
  | "premium_paid"
>;

/**
 * Standalone gallery client: the record was created for the QR gallery product
 * AND nothing else has been bought since.
 *
 * Pure predicate — deliberately free of any DB import so client components (the
 * admin list filter) can use it too. `src/lib/couples.ts` re-exports it, so
 * existing `import { isGalleryOnlyCouple } from "@/lib/couples"` keeps working.
 *
 * `standalone_gallery` is an origin marker that is never cleared. The second
 * clause is what handles an upgrade: buying an invitation (which sets
 * `draft: false`), seating, audio or premium unlocks the full portal on its own,
 * so none of the six places in payments/kinds.ts that flip those flags has to
 * remember to clear anything — and a refund puts the client back where they were.
 *
 * Note `paid_for_gallery` is deliberately NOT part of this. A buyer counts as
 * gallery-only from signup, before paying, so the portal doesn't hand them the
 * whole planner and then take it away the moment they pay.
 */
export function isGalleryOnlyCouple(data: GalleryOnlyInput): boolean {
  if (!data.standalone_gallery) return false;
  const hasOtherPaidProduct =
    data.draft === false || // an invitation was published — any tier sets this
    !!data.paid_for_raspored ||
    !!data.paid_for_audio ||
    !!data.premium_paid;
  return !hasOtherPaidProduct;
}
