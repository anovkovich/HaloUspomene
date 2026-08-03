"use server";

import { revalidatePath } from "next/cache";
import { loadSeatingDoc, saveSeatingLayout } from "@/lib/seating";
import {
  parseEditorPayload,
  serializeEditorPayload,
} from "@/lib/seating/payload";
import { getWeddingData } from "@/lib/couples";
import { hasEventSession } from "@/lib/seating/action-auth";

/** Session cookie minted by `/api/auth/[slug]`. */
const sessionCookie = (slug: string) => `auth_${slug}`;

export async function saveRaspored(
  slug: string,
  json: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // The page gate in middleware is not sufficient — see action-auth.ts.
    if (!(await hasEventSession(sessionCookie(slug), slug))) {
      return { success: false, error: "Sesija je istekla. Prijavite se ponovo." };
    }
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
    if (!(await hasEventSession(sessionCookie(slug), slug))) return false;
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
    if (!(await hasEventSession(sessionCookie(slug), slug))) return null;
    const doc = await loadSeatingDoc(slug);
    return doc ? serializeEditorPayload(doc.tables, doc.members) : null;
  } catch {
    return null;
  }
}
