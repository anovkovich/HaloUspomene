import clientPromise from "@/lib/mongodb";

/**
 * One-off SMS nudging a dormant planner account back into the portal.
 *
 * Who it is for: quick-register signups from `/planiranje-vencanja`, i.e.
 * `draft: true` — a couple that has a portal but has never bought anything.
 * They get no receipt, no delivery, and appear in no other SMS flow, so if they
 * forget the portal exists nothing at all reaches them.
 *
 * **Paid couples are excluded on purpose** (owner's rule). Someone who bought an
 * invitation got what they came for; reminding them to tick a checklist is
 * nagging. The rule also settles a collision for free: the one couple with an
 * untouched planner and a wedding two weeks away is a PAYING couple, and
 * "update your checklist" is the wrong thing to send them.
 */

/** Silence past which a nudge is warranted. */
export const REMINDER_MIN_SILENT_DAYS = 30;

/**
 * Below this many days to the wedding the reminder is simply late, and it would
 * compete with messages that matter more (seating offer, gallery purge warning).
 */
export const REMINDER_MIN_DAYS_UNTIL_EVENT = 60;

export interface PlannerReminderCandidate {
  slug: string;
  phone: string;
  silentDays: number;
  daysUntil: number;
}

/**
 * Deliberately does NOT claim "we haven't seen you in a while" — until
 * `lastSeenAt` has filled in we cannot know that, and a couple who browses the
 * portal without saving anything would be told something false. "Continue" is
 * true whether they stopped or never started.
 *
 * No link: they already have portal credentials, and a bare instruction reads
 * less like phishing than a URL does. Diacritic-free with an ASCII hyphen — a
 * single `č` or an em-dash flips the encoding from GSM-7 (160 chars) to UCS-2
 * (70), tripling the cost of every send.
 */
export function plannerReminderSms(): string {
  return (
    "HaloUspomene: Ceklista, budzet i lista zvanica cekaju vas u planeru " +
    "vencanja. Otvorite svoj portal i nastavite pripreme."
  );
}

function primaryPhone(contact?: string): string | null {
  const first = (contact || "").split(",")[0]?.trim();
  return first && first.startsWith("+") ? first : null;
}

function daysBetween(from: Date, to: Date): number {
  const a = new Date(from);
  a.setHours(0, 0, 0, 0);
  const b = new Date(to);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/**
 * Couples due a reminder on this run.
 *
 * The activity signal is `lastSeenAt ?? updatedAt`: it works today off the last
 * write, and sharpens by itself as `lastSeenAt` accumulates. Either way a couple
 * who opens the planner drops out of the list on their own, with no extra check.
 */
export async function findPlannerReminderCandidates(
  now: Date = new Date(),
): Promise<PlannerReminderCandidate[]> {
  const client = await clientPromise;
  const db = client.db("halouspomene");

  const couples = await db
    .collection("couples")
    .find(
      {
        draft: true,
        example: { $ne: true },
        planner_reminder_sent: { $ne: true },
        contact_phone: { $exists: true, $ne: "" },
        event_date: { $exists: true, $ne: "" },
      },
      { projection: { slug: 1, event_date: 1, contact_phone: 1 } },
    )
    .toArray();

  const out: PlannerReminderCandidate[] = [];

  for (const c of couples) {
    const phone = primaryPhone(c.contact_phone as string);
    if (!phone) continue;

    const eventTime = new Date(c.event_date as string).getTime();
    if (Number.isNaN(eventTime)) continue;
    const daysUntil = daysBetween(now, new Date(eventTime));
    if (daysUntil < REMINDER_MIN_DAYS_UNTIL_EVENT) continue;

    const portal = await db
      .collection("wedding_portal")
      .findOne(
        { slug: c.slug },
        { projection: { lastSeenAt: 1, updatedAt: 1 } },
      );
    // No portal document means the planner was never opened at all — the
    // account was created and abandoned on the spot.
    const lastSignal = portal?.lastSeenAt ?? portal?.updatedAt;
    const silentDays = lastSignal
      ? daysBetween(new Date(lastSignal as Date), now)
      : REMINDER_MIN_SILENT_DAYS;
    if (silentDays < REMINDER_MIN_SILENT_DAYS) continue;

    out.push({ slug: c.slug, phone, silentDays, daysUntil });
  }

  return out;
}
