"use server";

import {
  getRSVPResponses,
  addRSVPResponse,
  updateRSVPCategory,
  type RSVPEntry,
} from "@/lib/rsvp";

export async function refreshResponses(
  slug: string,
): Promise<{
  success: boolean;
  attending?: RSVPEntry[];
  notAttending?: RSVPEntry[];
  totalGuests?: number;
  error?: string;
}> {
  try {
    const responses = await getRSVPResponses(slug);
    const attending = responses.filter((r) => r.attending === "Da");
    const notAttending = responses.filter((r) => r.attending === "Ne");
    const totalGuests = attending.reduce(
      (sum, r) => sum + (parseInt(r.guestCount) || 1),
      0,
    );
    return { success: true, attending, notAttending, totalGuests };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Greška",
    };
  }
}

export async function updateGuestCategory(
  id: string,
  category: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateRSVPCategory(id, category);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Greška",
    };
  }
}

export async function addManualGuest(
  slug: string,
  name: string,
  guestCount: number,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const id = await addRSVPResponse(slug, {
      name,
      attending: "Da",
      guestCount,
      details: "",
    });
    return { success: true, id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Greška",
    };
  }
}
