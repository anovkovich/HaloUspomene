"use server";

import { loadSeatingDoc, saveSeatingLayout } from "@/lib/seating";
import {
  parseEditorPayload,
  serializeEditorPayload,
} from "@/lib/seating/payload";
import { isStandaloneActive } from "@/lib/standalone-seating";

export async function saveStandaloneRaspored(
  slug: string,
  json: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const active = await isStandaloneActive(slug);
    if (!active) {
      return {
        success: false,
        error: "Pristup nije aktivan. Kontaktirajte HALO Uspomene.",
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

export async function loadStandaloneRaspored(
  slug: string,
): Promise<string | null> {
  try {
    const doc = await loadSeatingDoc(slug);
    return doc ? serializeEditorPayload(doc.tables, doc.members) : null;
  } catch {
    return null;
  }
}

/** Standalone seatings are gated only by `active` (no separate paid flag).
 *  Returning the active flag here keeps the shared editor's `recheckPaid`
 *  flow consistent — when admin disables the record mid-edit, save attempts
 *  fail, and the editor re-prompts via UpgradeModal (which we keep behind
 *  brand styling for visual consistency). */
export async function checkStandaloneActive(slug: string): Promise<boolean> {
  return isStandaloneActive(slug);
}
