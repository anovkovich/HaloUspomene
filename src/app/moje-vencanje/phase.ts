import type { ChecklistGroup } from "./types";

/**
 * Which checklist phase a couple is actually in, derived from the wedding date.
 *
 * Why this exists: `ChecklistCard` never saw `event_date`, so every couple —
 * whether the wedding is in a year or in a week — opened on "12+ meseci pre".
 * A couple three months out was greeted by work they finished long ago or can
 * no longer do, which is the single worst thing a checklist can do.
 *
 * Purely presentational. Nothing here ever moves an item between groups in the
 * database; the couple's record stays exactly what the couple typed. The only
 * phase-driven write in the whole feature is the explicit "Prebaci u trenutnu
 * fazu" button, and that is always a click.
 */

/** Phases in chronological order. `custom` is excluded — it has no place in
 *  time, it is wherever the couple put it. */
export const PHASE_ORDER: ChecklistGroup[] = [
  "12+",
  "9-12",
  "6-9",
  "3-6",
  "1-3",
  "2-weeks",
  "day-before",
  "wedding-day",
];

/**
 * Lower bound of each phase, in days before the wedding. A phase is current
 * while `daysUntil` is greater than or equal to its bound and below the bound
 * of the previous one.
 */
const PHASE_MIN_DAYS: Record<string, number> = {
  "12+": 365,
  "9-12": 274,
  "6-9": 183,
  "3-6": 92,
  "1-3": 15,
  "2-weeks": 2,
  "day-before": 1,
  "wedding-day": 0,
};

/** Whole days from today until the event; negative once it has passed. */
export function daysUntilEvent(
  eventDate: string | undefined | null,
  now: Date = new Date(),
): number | null {
  if (!eventDate) return null;
  const t = new Date(eventDate).getTime();
  if (Number.isNaN(t)) return null;
  const day = new Date(t);
  day.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((day.getTime() - today.getTime()) / 86_400_000);
}

/**
 * The couple's current phase, or `null` when the date is missing/unparseable —
 * in which case every caller must fall back to today's behaviour rather than
 * guessing. A wedding already past reports `wedding-day`, so nothing is ever
 * marked "missed" after the fact.
 */
export function currentPhase(
  eventDate: string | undefined | null,
  now: Date = new Date(),
): ChecklistGroup | null {
  const days = daysUntilEvent(eventDate, now);
  if (days === null) return null;
  if (days <= 0) return "wedding-day";
  for (const phase of PHASE_ORDER) {
    if (days >= PHASE_MIN_DAYS[phase]) return phase;
  }
  return "wedding-day";
}

/**
 * True when `group` lies strictly before the couple's current phase.
 *
 * `custom` is never past — the couple's own items are not on our timeline.
 * Returns false whenever the phase is unknown, so an unparseable date can never
 * paint a group as missed.
 */
export function isPastPhase(
  group: ChecklistGroup,
  phase: ChecklistGroup | null,
): boolean {
  if (!phase || group === "custom") return false;
  const g = PHASE_ORDER.indexOf(group);
  const p = PHASE_ORDER.indexOf(phase);
  if (g < 0 || p < 0) return false;
  return g < p;
}
