"use server";

import {
  getStandaloneSeating,
  setStandaloneGuestArrival,
  checkinTokenMatches,
} from "@/lib/standalone-seating";

interface CheckinResult {
  success: boolean;
  error?: string;
  arrived?: number;
}

/**
 * Door check-in, authorised by the hostess token rather than the owner PIN.
 *
 * The hostess is often external staff, so she gets a link scoped to this one
 * action — she can mark arrivals but cannot reach the portal, the PIN, or the
 * guest-list editor. The organizer revokes every issued link by regenerating
 * the token.
 *
 * The token is re-verified here on every call: the page render granting access
 * is not a gate, since a server action can be invoked directly.
 */
export async function checkinGuestAction(
  slug: string,
  token: string,
  guestId: string,
  arrived: number,
): Promise<CheckinResult> {
  const seating = await getStandaloneSeating(slug);
  if (!seating || !seating.active) {
    return { success: false, error: "Pristup nije aktivan." };
  }
  if (!checkinTokenMatches(seating.checkin_token, token)) {
    return { success: false, error: "Link za prijem nije važeći." };
  }

  const guest = seating.guests.find((g) => g.id === guestId);
  if (!guest) {
    return { success: false, error: "Gost nije pronađen." };
  }

  // Never record more arrivals than the entry was booked for, and never a
  // negative count — 0 is the deliberate "undo a mis-tap" value.
  const clamped = Math.max(0, Math.min(Math.floor(arrived), guest.guestCount));
  await setStandaloneGuestArrival(slug, guestId, clamped);

  return { success: true, arrived: clamped };
}
