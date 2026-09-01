/**
 * Calendar helpers — build "Add to calendar" links/files for RSVP success
 * screens and RSVP reminders.
 *
 * Events use *floating local time* (no timezone marker): a wedding at 18:00
 * shows as 18:00 in every guest's calendar, which is what couples expect.
 * Google links are pinned to Europe/Belgrade so they match.
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  /** Local start (wall-clock). For all-day events only the date is used. */
  start: Date;
  /** Local end. Defaults: timed → start + 3h; all-day → single day. */
  end?: Date;
  allDay?: boolean;
}

const TZ = "Europe/Belgrade";

export interface CalendarLabels {
  addToCalendar: string;
  dialogTitle: string;
  google: string;
  apple: string;
}

/** Default UI labels for the AddToCalendar chooser (Latin or Cyrillic). */
export function calendarLabels(cyrillic: boolean): CalendarLabels {
  return cyrillic
    ? {
        addToCalendar: "Додај у календар",
        dialogTitle: "Додај у календар",
        google: "Google календар",
        apple: "Apple / Outlook",
      }
    : {
        addToCalendar: "Dodaj u kalendar",
        dialogTitle: "Dodaj u kalendar",
        google: "Google kalendar",
        apple: "Apple / Outlook",
      };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Parse an ISO-ish string as local wall-clock (never UTC-shifted). */
export function parseLocalDate(s: string): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  const date = new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    h ? Number(h) : 0,
    mi ? Number(mi) : 0,
  );
  return isNaN(date.getTime()) ? null : date;
}

/** True when the string carries a time component (HH:mm). */
export function hasTimeComponent(s: string): boolean {
  return /[T ]\d{2}:\d{2}/.test(s ?? "");
}

function fmtLocal(d: Date): string {
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  );
}

function fmtDateOnly(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function fmtUTC(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

function defaultEnd(ev: CalendarEvent): Date {
  if (ev.end) return ev.end;
  if (ev.allDay) return ev.start;
  return new Date(ev.start.getTime() + 3 * 60 * 60 * 1000);
}

/** Google Calendar "add event" URL. */
export function googleCalendarUrl(ev: CalendarEvent): string {
  const params = new URLSearchParams();
  params.set("action", "TEMPLATE");
  params.set("text", ev.title);
  if (ev.description) params.set("details", ev.description);
  if (ev.location) params.set("location", ev.location);

  if (ev.allDay) {
    const start = fmtDateOnly(ev.start);
    // Google treats the all-day end as exclusive.
    const end = fmtDateOnly(addDays(defaultEnd(ev), 1));
    params.set("dates", `${start}/${end}`);
  } else {
    params.set("dates", `${fmtLocal(ev.start)}/${fmtLocal(defaultEnd(ev))}`);
    params.set("ctz", TZ);
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeICS(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Build a single-event .ics document (Apple Calendar / Outlook / etc.). */
export function buildICS(ev: CalendarEvent): string {
  const uid = `${fmtLocal(ev.start)}-${hash(ev.title)}@halouspomene.rs`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HaloUspomene//RSVP//SR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmtUTC(new Date())}`,
  ];

  if (ev.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${fmtDateOnly(ev.start)}`);
    lines.push(`DTEND;VALUE=DATE:${fmtDateOnly(addDays(defaultEnd(ev), 1))}`);
  } else {
    lines.push(`DTSTART:${fmtLocal(ev.start)}`);
    lines.push(`DTEND:${fmtLocal(defaultEnd(ev))}`);
  }

  lines.push(`SUMMARY:${escapeICS(ev.title)}`);
  if (ev.description) lines.push(`DESCRIPTION:${escapeICS(ev.description)}`);
  if (ev.location) lines.push(`LOCATION:${escapeICS(ev.location)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

function localDateTimeParam(d: Date): string {
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/**
 * URL of the server `.ics` endpoint for this event. Serving the file from a
 * real URL (with `Content-Type: text/calendar` + `Content-Disposition`) is the
 * only reliable way to add to calendar on iOS Safari — `download` on a
 * `data:`/`blob:` URL silently fails there. Works on desktop and Android too.
 */
export function icsHref(ev: CalendarEvent, filename = "dogadjaj"): string {
  const params = new URLSearchParams();
  params.set("title", ev.title);
  if (ev.description) params.set("desc", ev.description);
  if (ev.location) params.set("loc", ev.location);
  params.set("start", localDateTimeParam(ev.start));
  if (ev.end) params.set("end", localDateTimeParam(ev.end));
  if (ev.allDay) params.set("allday", "1");
  params.set("name", filename.replace(/\.ics$/i, ""));
  // Trailing slash matches `trailingSlash: true` so the tap isn't 308-redirected.
  return `/api/ics/?${params.toString()}`;
}

export interface ReminderPlan {
  remindDate: Date;
  /** "in15" → remind 15 days from now; "dayBefore" → day before deadline. */
  mode: "in15" | "dayBefore";
}

/**
 * Decide when to remind a guest to RSVP:
 * - if "today + 15 days" still falls on/before the deadline → remind in 15 days
 * - otherwise (deadline is sooner) → remind the day before the deadline
 * Returns null when the deadline is missing, invalid, or already today/past.
 */
export function planRsvpReminder(
  deadline: string,
  now: Date = new Date(),
): ReminderPlan | null {
  const d = parseLocalDate(deadline);
  if (!d) return null;
  d.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  if (d.getTime() <= today.getTime()) return null;

  const in15 = addDays(today, 15);
  if (in15.getTime() <= d.getTime()) {
    return { remindDate: in15, mode: "in15" };
  }

  let dayBefore = addDays(d, -1);
  if (dayBefore.getTime() < today.getTime()) dayBefore = today;
  return { remindDate: dayBefore, mode: "dayBefore" };
}
