"use server";

import { saveRasporedSedenja, loadRasporedSedenja } from "@/lib/google-sheets";

export async function saveRaspored(
  spreadsheetId: string,
  json: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await saveRasporedSedenja(spreadsheetId, json);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Greška pri čuvanju",
    };
  }
}

export async function loadRaspored(
  spreadsheetId: string,
): Promise<string | null> {
  try {
    return await loadRasporedSedenja(spreadsheetId);
  } catch {
    return null;
  }
}
