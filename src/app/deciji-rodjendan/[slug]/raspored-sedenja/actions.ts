"use server";

import { loadSeatingDoc, saveSeatingLayout } from "@/lib/seating";
import {
  parseEditorPayload,
  serializeEditorPayload,
} from "@/lib/seating/payload";
import { getBirthdayData } from "@/lib/birthday";

// Birthday raspored shares seating_layouts (slug-keyed) with the wedding
// editor but checks paid_for_raspored against birthday_events instead.

export async function saveBirthdayRaspored(
  slug: string,
  json: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await getBirthdayData(slug);
    if (!data?.paid_for_raspored) {
      return {
        success: false,
        error: "Raspored sedenja nije aktiviran za ovaj rođendan",
      };
    }
    const { tables, members } = parseEditorPayload(json);
    await saveSeatingLayout(slug, tables, members);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Greška pri čuvanju",
    };
  }
}

export async function checkBirthdayPaidStatus(slug: string): Promise<boolean> {
  try {
    const data = await getBirthdayData(slug);
    return data?.paid_for_raspored ?? false;
  } catch {
    return false;
  }
}

export async function loadBirthdayRaspored(
  slug: string,
): Promise<string | null> {
  try {
    const doc = await loadSeatingDoc(slug);
    return doc ? serializeEditorPayload(doc.tables, doc.members) : null;
  } catch {
    return null;
  }
}
