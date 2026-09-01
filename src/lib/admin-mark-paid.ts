import type { PaymentKind } from "@/lib/orders";

/**
 * Target of the admin "Označi kao plaćeno" modal (rendered once in
 * `src/app/admin/page.tsx`, opened from every tab that prints a receipt).
 *
 * The type lives here rather than next to the modal so a tab can describe a
 * payment without importing the admin page component. Every tab that can print
 * a receipt MUST route its "Označi kao plaćeno" through this modal — that is
 * what guarantees a paid receipt always leaves a row in the Uplate ledger.
 */
export interface MarkPaidTarget {
  slug: string;
  name: string;
  premium: boolean;
  /** Payment kind written onto the recorded order. Defaults to "pozivnica"; every
   *  other tab passes its own so the Uplate ledger names the right product (and a
   *  later approve can't publish an invitation nobody bought). */
  kind?: PaymentKind;
  /** Overrides the tier dropdown default. Only `pozivnica` has more than one
   *  tier, so every other kind hides the selector and rides "default". */
  defaultTier?: string;
  prefillAmount: number;
  prefillLabel: string;
  slugEditable: boolean;
  source:
    | { type: "couple" }
    | { type: "custom"; id: string }
    // Tabs that own their own records (Raspored / Rođendani / Retro telefon)
    // hand in the callback that invalidates THEIR receipt once the payment is
    // filed — page.tsx has no access to their state.
    | { type: "external"; onInvalidate: () => void | Promise<void> };
}
