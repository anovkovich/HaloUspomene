"use server";

/**
 * Read-only access to the venue hall scheme library for the seating editor.
 *
 * Server actions rather than a public API route, so one module serves the
 * wedding, birthday and standalone editors alike. The middleware gate on those
 * pages does NOT protect these — a server action can be POSTed to any URL that
 * resolves to a route carrying it, and `/raspored-sedenja/prijava/` is exactly
 * such an unguarded URL (see `action-auth.ts`). Hence the explicit session
 * check here: the library is for customers, not for anyone who can read an
 * action id out of the JS bundle.
 */

import {
  getHallTemplate,
  searchHallVenues,
  type HallTemplate,
  type HallVenueSummary,
} from "@/lib/hall-venues";
import { hasAnyEventSession } from "./action-auth";

export interface HallSearchResult {
  /** False only when the session is gone — the picker must say so rather than
   *  show "no such venue", which is what an empty list would look like. */
  ok: boolean;
  venues: HallVenueSummary[];
}

export async function searchHallVenuesAction(
  query: string,
): Promise<HallSearchResult> {
  try {
    if (!(await hasAnyEventSession())) return { ok: false, venues: [] };
    return { ok: true, venues: await searchHallVenues(query ?? "") };
  } catch {
    // A database hiccup is not "no such venue" either — same reasoning as the
    // session case above.
    return { ok: false, venues: [] };
  }
}

export async function loadHallTemplateAction(
  venueSlug: string,
  hallId: string,
): Promise<HallTemplate | null> {
  try {
    if (!(await hasAnyEventSession())) return null;
    return await getHallTemplate(venueSlug, hallId);
  } catch {
    return null;
  }
}
