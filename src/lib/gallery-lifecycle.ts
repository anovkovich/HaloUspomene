/**
 * QR photo gallery lifecycle — day math (single source of truth).
 *
 * Timeline relative to the wedding day (d0 = event_date's calendar day),
 * counted in the Europe/Belgrade calendar so boundaries land on local midnight
 * regardless of server timezone (Vercel runs UTC):
 *
 *   d0  wedding day    guests upload ✅   couple access ✅
 *   d1  day after      guests upload ✅   couple access ✅   (upload window ends)
 *   d2                 guests ❌          couple access ✅
 *   d3                 guests ❌          couple access ✅
 *   d4                 guests ❌          couple access ✅   → SMS #1 (last access day)
 *   d5                 guests ❌          couple access ❌   → SMS #2 (deletion warning); photos still exist
 *   end of d5 (midnight) ───────────────────────────────── 🗑️ purge all photos
 *
 * Before d0 the couple can still access (to print/share the QR); guests cannot
 * upload until the wedding day.
 */

export const GALLERY_UPLOAD_LAST_DAY = 1; // guests can upload on d0..d1
export const GALLERY_ACCESS_LAST_DAY = 4; // couple can access on ...d4
export const GALLERY_PURGE_WARNING_DAY = 5; // d5: no access, SMS #2, purged at its end
export const GALLERY_PURGE_DAY = 6; // from d6 onward the photos are gone

const TZ = "Europe/Belgrade";

/** "YYYY-MM-DD" for a Date in the Belgrade calendar. */
function belgradeYMD(d: Date): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Days between two "YYYY-MM-DD" strings (b - a), calendar-day based. */
function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const au = Date.UTC(ay, am - 1, ad);
  const bu = Date.UTC(by, bm - 1, bd);
  return Math.round((bu - au) / 86_400_000);
}

/**
 * Whole days since the wedding day, in Belgrade calendar days.
 * d0 = wedding day, negative before it. Returns null if event_date is missing.
 */
export function galleryDayOffset(
  eventDate: string | undefined,
  now: Date = new Date()
): number | null {
  if (!eventDate) return null;
  const eventDay = eventDate.slice(0, 10); // "YYYY-MM-DD..." → date part
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDay)) return null;
  return daysBetween(eventDay, belgradeYMD(now));
}

export type GalleryPhase =
  | "before" // before the wedding — couple can prep/share QR, no guest uploads
  | "upload" // d0..d1 — guests upload, couple access
  | "access" // d2..d3 — couple access only
  | "last-access" // d4 — last couple-access day (SMS #1)
  | "grace" // d5 — no access, photos still exist (SMS #2), purged at end
  | "expired" // d6+ — photos purged
  | "unknown"; // no valid event_date

export function galleryPhase(
  eventDate: string | undefined,
  extraDays = 0,
  now: Date = new Date()
): GalleryPhase {
  const d = galleryDayOffset(eventDate, now);
  if (d === null) return "unknown";
  if (d < 0) return "before";
  if (d <= GALLERY_UPLOAD_LAST_DAY) return "upload";
  if (d < GALLERY_ACCESS_LAST_DAY + extraDays) return "access";
  if (d === GALLERY_ACCESS_LAST_DAY + extraDays) return "last-access";
  if (d < GALLERY_PURGE_DAY + extraDays) return "grace";
  return "expired";
}

/** Guests may upload only on the wedding day and the day after (d0..d1).
 * Admin-granted extra days extend the couple's download window, NOT guest upload. */
export function canGuestUpload(
  eventDate: string | undefined,
  now: Date = new Date()
): boolean {
  const d = galleryDayOffset(eventDate, now);
  return d !== null && d >= 0 && d <= GALLERY_UPLOAD_LAST_DAY;
}

/** Couple may view/download from activation through d4 (+ any admin-granted extra days). */
export function canCoupleAccess(
  eventDate: string | undefined,
  extraDays = 0,
  now: Date = new Date()
): boolean {
  const d = galleryDayOffset(eventDate, now);
  // Before the event (d<0) access is allowed for QR prep; blocked once past the window.
  return d !== null && d <= GALLERY_ACCESS_LAST_DAY + extraDays;
}

/** True once the photos should be gone (from start of d6 + any extra days). */
export function shouldPurgeGallery(
  eventDate: string | undefined,
  extraDays = 0,
  now: Date = new Date()
): boolean {
  const d = galleryDayOffset(eventDate, now);
  return d !== null && d >= GALLERY_PURGE_DAY + extraDays;
}
