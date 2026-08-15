/**
 * Agenda ordering for admin lists: what is coming, then what just happened.
 *
 * Replaces a sort by ABSOLUTE distance from now, which interleaved the two
 * halves — a wedding 13 days past outranked three happening in 14 days, which
 * reads as random. Agenda order is what every calendar does, so it needs no
 * explaining.
 *
 * Pure: no DB, no React, no `"use server"`. Safe to import from client
 * components. The date field differs per product (`event_date` / `eventDate` /
 * `rental_date`), hence the accessor.
 */

/**
 * Start of the local day, in ms — the future/past boundary.
 *
 * Deliberately NOT `Date.now()`: event dates carry a time (e.g.
 * `2026-08-29T15:30`), so against the current instant a wedding would drop into
 * the past block at its own start time — on its wedding day, the day the admin
 * needs it at the top of the list.
 *
 * Compute it ONCE per render pass and pass the same value to every function
 * here; letting each call re-derive it is how a sort and its divider end up
 * disagreeing across a midnight straddle.
 */
export function startOfToday(now: Date = new Date()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function timeOf(date: string | undefined): number {
  if (!date) return Number.NaN;
  const t = new Date(date).getTime();
  return Number.isNaN(t) ? Number.NaN : t;
}

/** Upcoming ascending (soonest first), then past descending (most recent
 *  first), undated last. Stable on ties, so the caller's incoming order (the
 *  API's `created_at` desc) decides same-day sub-order deterministically. */
export function sortByEventTimeline<T>(
  items: T[],
  getDate: (item: T) => string | undefined,
  boundary: number,
): T[] {
  return [...items].sort((a, b) => {
    const ta = timeOf(getDate(a));
    const tb = timeOf(getDate(b));
    const aMissing = Number.isNaN(ta);
    const bMissing = Number.isNaN(tb);
    if (aMissing !== bMissing) return aMissing ? 1 : -1;
    if (aMissing) return 0;

    const aUpcoming = ta >= boundary;
    const bUpcoming = tb >= boundary;
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    return aUpcoming ? ta - tb : tb - ta;
  });
}

/** Index of the first past row in an agenda-sorted array, or -1 when there is
 *  none. Drives the divider that separates the work queue from history. */
export function firstPastIndex<T>(
  sorted: T[],
  getDate: (item: T) => string | undefined,
  boundary: number,
): number {
  return sorted.findIndex((item) => {
    const t = timeOf(getDate(item));
    return !Number.isNaN(t) && t < boundary;
  });
}

/** Whole days since the event (0 = today), or null when undated or still
 *  ahead. Feeds hot-window checks such as "finished within the last week". */
export function daysSinceEvent(
  date: string | undefined,
  boundary: number,
): number | null {
  const t = timeOf(date);
  if (Number.isNaN(t)) return null;
  const day = new Date(t);
  day.setHours(0, 0, 0, 0);
  const diff = boundary - day.getTime();
  return diff < 0 ? null : Math.round(diff / 86_400_000);
}
