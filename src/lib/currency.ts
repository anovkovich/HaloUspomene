/** Fallback EUR→RSD estimate, used only when no live rate has been cached
 *  yet or the National Bank of Serbia's site is unreachable — see
 *  `src/lib/nbs-rate.ts` for the actual live source. Used ONLY for the
 *  couple's own private budget/gift displays (converting their manually
 *  entered EUR amounts to one baseline currency for a total). NOT related
 *  to product pricing — see src/data/pricing.ts for actual catalog prices. */
export const FALLBACK_EUR_RATE = 117.5;

export function toRSD(
  value: number,
  currency: "RSD" | "EUR" | undefined,
  eurRate: number = FALLBACK_EUR_RATE,
): number {
  return currency === "EUR" ? value * eurRate : value;
}