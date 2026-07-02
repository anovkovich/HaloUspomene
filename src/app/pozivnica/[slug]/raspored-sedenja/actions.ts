"use server";

import { revalidatePath } from "next/cache";
import { loadSeatingDoc, saveSeatingLayout } from "@/lib/seating";
import {
  parseEditorPayload,
  serializeEditorPayload,
} from "@/lib/seating/payload";
import { getWeddingData } from "@/lib/couples";

export async function saveRaspored(
  slug: string,
  json: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await getWeddingData(slug);
    if (!data?.paid_for_raspored) {
      return { success: false, error: "Raspored sedenja nije aktiviran za ovu pozivnicu" };
    }
    const { tables, members } = parseEditorPayload(json);
    await saveSeatingLayout(slug, tables, members);
    revalidatePath(`/pozivnica/${slug}/gde-sedim`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Greška pri čuvanju",
    };
  }
}

export async function checkPaidStatus(slug: string): Promise<boolean> {
  try {
    const data = await getWeddingData(slug);
    return data?.paid_for_raspored ?? false;
  } catch {
    return false;
  }
}

export async function loadRaspored(
  slug: string,
): Promise<string | null> {
  try {
    const doc = await loadSeatingDoc(slug);
    return doc ? serializeEditorPayload(doc.tables, doc.members) : null;
  } catch {
    return null;
  }
}
