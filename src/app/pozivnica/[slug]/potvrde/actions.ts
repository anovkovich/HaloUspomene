"use server";

import type { Entry_IDs } from "../types";
import { setEntryCategory, getRSVPResponses } from "@/lib/google-sheets";

export async function refreshResponses(
  spreadsheetId: string,
): Promise<{ success: boolean; attending?: import("@/lib/google-sheets").RSVPEntry[]; notAttending?: import("@/lib/google-sheets").RSVPEntry[]; totalGuests?: number; error?: string }> {
  try {
    const responses = await getRSVPResponses(spreadsheetId);
    const attending = responses.filter((r) => r.attending === "Da");
    const notAttending = responses.filter((r) => r.attending === "Ne");
    const totalGuests = attending.reduce((sum, r) => sum + (parseInt(r.plusOnes) || 1), 0);
    return { success: true, attending, notAttending, totalGuests };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Greška" };
  }
}

export async function updateGuestCategory(
  spreadsheetId: string,
  rowIndex: number,
  category: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await setEntryCategory(spreadsheetId, rowIndex, category);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Greška" };
  }
}

export async function addManualGuest(
  formUrl: string,
  entry_IDs: Entry_IDs,
  name: string,
  plusOnes: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const params = new URLSearchParams();
    params.append(entry_IDs.name, name);
    params.append(entry_IDs.attending, "Da");
    params.append(entry_IDs.plusOnes, String(plusOnes));
    params.append(entry_IDs.details, "");

    await fetch(formUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Greška",
    };
  }
}
