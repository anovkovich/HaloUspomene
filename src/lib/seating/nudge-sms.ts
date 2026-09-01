import clientPromise from "@/lib/mongodb";
import type { SeatingNudgeDismiss } from "./nudge";

/**
 * One-off SMS offering the seating tool to a couple whose wedding is close.
 *
 * Why it exists: the in-portal nudge only reaches couples who open the portal.
 * A couple with 138 guests and two weeks to go, who never opened the Gosti tab,
 * never sees it at all — this is the channel for those.
 *
 * The rule that keeps it decent: **SMS is for the UNREACHED, never a second
 * attempt on the REFUSED.** A couple who saw the in-portal offer and dismissed
 * it already answered; escalating to their personal phone because they said no
 * inverts the consent gradient, and two weeks before a wedding is when that
 * lands worst. Dismissal is checked by EXISTENCE, not by the banner's
 * `MAX_DISMISSALS` count — one dismissal is an answer for channel-escalation
 * purposes even though the banner itself is allowed a second showing.
 */

/** Wide enough that a single missed cron run doesn't lose the couple — the
 *  `seating_sms_offer_sent` flag is what keeps it to one message, not the
 *  narrowness of the window. */
export const SMS_WINDOW_MIN_DAYS = 7;
export const SMS_WINDOW_MAX_DAYS = 14;

/** An SMS should clear a higher bar than a banner: the in-portal nudge fires
 *  from 15 attending people, this one from 30. */
export const SMS_MIN_ATTENDING = 30;

export interface SeatingSmsCandidate {
  slug: string;
  phone: string;
  daysUntil: number;
  attendingPeople: number;
}

/**
 * The offer. No link on purpose — the couple already has portal credentials and
 * a bare "open your portal" is shorter and less phishy than a URL.
 *
 * 2.500 is genuinely half of the 5.000 standalone list price, so "umesto 5.000"
 * is a true comparison, not a manufactured anchor. Diacritic-free and with an
 * ASCII hyphen: one Serbian letter or an em-dash flips the whole message from
 * GSM-7 (160 chars) to UCS-2 (70), tripling the cost per send.
 */
export function seatingOfferSms(): string {
  return (
    "HaloUspomene: Vencanje vam je za 2 nedelje. Raspored sedenja je uz " +
    "vasu pozivnicu 2.500 din umesto 5.000 - upola cene. " +
    "Aktivirajte alat na svom portalu."
  );
}

function primaryPhone(contact?: string): string | null {
  const first = (contact || "").split(",")[0]?.trim();
  return first && first.startsWith("+") ? first : null;
}

function daysUntil(iso: string | undefined, now: Date): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const day = new Date(t);
  day.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((day.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Couples who should receive the offer on this run.
 *
 * Three collections are consulted: `couples` for eligibility, `rsvp_responses`
 * for how many people are actually coming, and `wedding_portal` for whether the
 * in-portal offer was already refused.
 */
export async function findSeatingSmsCandidates(
  now: Date = new Date(),
): Promise<SeatingSmsCandidate[]> {
  const client = await clientPromise;
  const db = client.db("halouspomene");

  const couples = await db
    .collection("couples")
    .find(
      {
        draft: { $ne: true },
        paid_for_raspored: { $ne: true },
        seating_sms_offer_sent: { $ne: true },
        contact_phone: { $exists: true, $ne: "" },
        event_date: { $exists: true, $ne: "" },
      },
      { projection: { slug: 1, event_date: 1, contact_phone: 1 } },
    )
    .toArray();

  const out: SeatingSmsCandidate[] = [];

  for (const c of couples) {
    const days = daysUntil(c.event_date as string, now);
    if (
      days === null ||
      days < SMS_WINDOW_MIN_DAYS ||
      days > SMS_WINDOW_MAX_DAYS
    ) {
      continue;
    }

    const phone = primaryPhone(c.contact_phone as string);
    if (!phone) continue;

    // Refusal in the portal ends it — see the module note.
    const portal = await db
      .collection("wedding_portal")
      .findOne(
        { slug: c.slug },
        { projection: { seatingNudge: 1 } },
      );
    const dismiss = portal?.seatingNudge as SeatingNudgeDismiss | undefined;
    if (dismiss && (dismiss.state ?? "unpaid") === "unpaid") continue;

    const responses = await db
      .collection("rsvp_responses")
      .find({ slug: c.slug, attending: "Da" }, { projection: { guestCount: 1 } })
      .toArray();
    const attendingPeople = responses.reduce(
      (sum, r) => sum + (parseInt(String(r.guestCount)) || 1),
      0,
    );
    if (attendingPeople < SMS_MIN_ATTENDING) continue;

    out.push({ slug: c.slug, phone, daysUntil: days, attendingPeople });
  }

  return out;
}
