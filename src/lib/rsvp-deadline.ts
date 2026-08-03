/**
 * Shared "is the reply window closed?" check for the event invitation.
 *
 * Two traps this exists to avoid, both of which bit the first implementation:
 *
 * 1. `new Date("2026-08-08")` parses as **UTC** midnight, but `setHours(23,59)`
 *    then applies in the *local* zone. For a guest at UTC−5 that lands on
 *    23:59 of 7 August local — the form closed a full day early. Parsing the
 *    parts by hand keeps "the deadline is the end of that calendar day"
 *    true in whatever zone the code happens to run in.
 *
 * 2. The deadline lives on the invitation add-on, so it must only bind when
 *    that add-on is actually sold. Otherwise typing a date into the admin modal
 *    for a customer who never bought it would silently start rejecting replies
 *    on their existing QR-pano flow.
 */

/** End of `YYYY-MM-DD` in the current zone, or null when unparseable. */
export function endOfDeadlineDay(submitUntil?: string | null): Date | null {
  if (!submitUntil) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(submitUntil.trim());
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d), 23, 59, 59, 999);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * True when replies should be refused.
 *
 * `paidForInvitation` is required on purpose: pass the seating's flag so the
 * deadline can never apply to an event that hasn't bought the invitation.
 */
export function isPastSubmitDeadline(
  submitUntil: string | null | undefined,
  paidForInvitation: boolean | undefined,
): boolean {
  if (!paidForInvitation) return false;
  const deadline = endOfDeadlineDay(submitUntil);
  return !!deadline && Date.now() > deadline.getTime();
}
