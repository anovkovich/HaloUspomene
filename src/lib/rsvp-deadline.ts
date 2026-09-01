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

/* ── Produženje roka (portal proslave) ───────────────────────────────────── */

/** Days a single extension may add. A cap keeps a stuck "+" button from parking
 *  the deadline months past the event. */
export const MAX_EXTENSION_DAYS = 30;

/** Local-calendar `YYYY-MM-DD`. Same trap as `endOfDeadlineDay` above, other
 *  direction: `toISOString()` renders the PREVIOUS day in UTC+1/+2. */
export function toISODate(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export type DeadlineExtension =
  | { ok: true; submitUntil: string; capped: boolean }
  | { ok: false; error: string };

/**
 * Pushes the deadline back by `days`, counted from today or the current
 * deadline — whichever is later — and capped at the event date. A confirmation
 * that lands after the party helps nobody.
 */
export function computeExtendedDeadline(input: {
  currentSubmitUntil: string;
  eventDate: string;
  days: number;
}): DeadlineExtension {
  const n = Math.floor(Number(input.days));
  if (!Number.isFinite(n) || n < 1 || n > MAX_EXTENSION_DAYS) {
    return { ok: false, error: "Neispravan broj dana" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const current = endOfDeadlineDay(input.currentSubmitUntil);
  const base =
    current && current.getTime() > today.getTime()
      ? new Date(current.getFullYear(), current.getMonth(), current.getDate())
      : new Date(today.getTime());
  base.setDate(base.getDate() + n);

  let capped = false;
  const event = endOfDeadlineDay(input.eventDate);
  if (event) {
    const eventDay = new Date(
      event.getFullYear(),
      event.getMonth(),
      event.getDate(),
    );
    if (eventDay.getTime() < today.getTime()) {
      return {
        ok: false,
        error: "Proslava je prošla — rok se više ne može produžiti",
      };
    }
    if (base.getTime() > eventDay.getTime()) {
      base.setTime(eventDay.getTime());
      capped = true;
    }
  }

  const submitUntil = toISODate(base);
  if (submitUntil === input.currentSubmitUntil) {
    return { ok: false, error: "Rok već ističe na dan proslave" };
  }
  return { ok: true, submitUntil, capped };
}

export type DeadlineState = {
  iso: string;
  /** Human date, e.g. "20. septembar 2026." */
  display: string;
  /** Whole days from today; negative once it has passed. */
  daysLeft: number;
  expired: boolean;
};

/** Read-only view for rendering. Null when the record has no usable date. */
export function describeDeadline(submitUntil: string): DeadlineState | null {
  const end = endOfDeadlineDay(submitUntil);
  if (!end) return null;
  const day = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((day.getTime() - today.getTime()) / 86_400_000);

  return {
    iso: toISODate(day),
    display: day.toLocaleDateString("sr-RS", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    daysLeft,
    expired: daysLeft < 0,
  };
}
