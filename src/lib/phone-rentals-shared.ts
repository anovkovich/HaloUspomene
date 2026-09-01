/**
 * Pure retro-phone rules — no MongoDB, no server-only imports, so the admin
 * calendar and the booking form can apply the SAME occupancy and weekend logic
 * the server enforces. Duplicating these rules client-side is how the admin
 * panel ends up refusing a date the public checkout is still happily selling.
 *
 * `src/lib/phone-rentals.ts` re-exports everything here; import from there on
 * the server, from this file in `"use client"` components.
 */

/** Fallback fleet size, used only when `site_config` has no override yet. */
export const PHONE_UNITS_DEFAULT = 2;

/** Self-serve rows hold their date for this long before payment. Without the
 *  hold two buyers could pay for the last phone at once; with a permanent hold
 *  every abandoned form would kill a date forever. Admin-entered rows are real
 *  bookings and hold their date regardless of `paid`. */
export const HOLD_MS = 60 * 60 * 1000;

export interface PhoneRental {
  id: string;
  contact_name: string;
  rental_date: string; // ISO date (pickup date)
  notes?: string;
  dobrodoslica?: boolean; // personalized welcome message addon
  custom_discount?: number;
  receipt_valid?: boolean;
  receipt_created?: string;
  created_at: string;
  // ── self-serve fields (source: "self") ────────────────────────────────────
  /** "admin" (default, entered by us) or "self" (bought at /telefon-uspomena/online-placanje). */
  source?: "admin" | "self";
  /** Set true by the `telefon` payment kind's unlock(); false again on revoke. */
  paid?: boolean;
  phone?: string; // E.164, collected + SMS-verified on the self-serve form
  city?: string; // delivery city / venue — the courier needs it
}

const DAY_MS = 86_400_000;

function parseDay(date: string): number {
  return Date.parse(date.slice(0, 10) + "T00:00:00Z");
}

function formatDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Days to shift each weekday to reach its capacity weekend, indexed by UTC day
 *  (0 = Sunday … 6 = Saturday). A phone leaves for a Saturday wedding and is not
 *  back in time for anything else that weekend, so Fri/Sat/Sun share one pool.
 *  Mon–Thu attach to the NEAREST weekend — Mon/Tue back to the one just gone,
 *  Wed/Thu forward to the one coming — which carves the calendar into clean
 *  7-day Wed→Tue blocks, each centred on its Saturday. */
const SATURDAY_OFFSET = [-1, -2, -3, 3, 2, 1, 0];

/** The capacity bucket a date belongs to, identified by its Saturday. Two
 *  bookings sharing a key are competing for the same physical phones. */
export function weekendKey(date: string): string {
  const ms = parseDay(date);
  return formatDay(ms + SATURDAY_OFFSET[new Date(ms).getUTCDay()] * DAY_MS);
}

/** Every date that maps to `saturdayKey` — Wednesday through the next Tuesday. */
export function weekendDates(saturdayKey: string): string[] {
  const ms = parseDay(saturdayKey);
  return [-3, -2, -1, 0, 1, 2, 3].map((o) => formatDay(ms + o * DAY_MS));
}

/** True while this row occupies its weekend: every admin booking, every paid
 *  rental, and a self-serve row still inside its payment hold. */
export function occupies(r: PhoneRental, now: number): boolean {
  if (!r.rental_date) return false;
  if (r.source !== "self") return true;
  if (r.paid) return true;
  return now - new Date(r.created_at).getTime() < HOLD_MS;
}
