"use server";

import { loadSeatingLayout, saveSeatingLayout } from "@/lib/seating";
import { getWeddingData } from "@/lib/couples";
import type { TableData } from "./types";

export async function saveRaspored(
  slug: string,
  json: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await getWeddingData(slug);
    if (!data?.paid_for_raspored) {
      return { success: false, error: "Raspored sedenja nije aktiviran za ovu pozivnicu" };
    }
    const tables: TableData[] = JSON.parse(json);
    await saveSeatingLayout(slug, tables);
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
    const tables = await loadSeatingLayout(slug);
    return tables ? JSON.stringify(tables) : null;
  } catch {
    return null;
  }
}
