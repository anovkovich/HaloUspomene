"use server";

import { getAudioMessages, deleteAudioMessage, type AudioMessage } from "@/lib/audio";
import { getWeddingData } from "@/lib/couples";
import { del } from "@vercel/blob";

export async function refreshAudioMessages(
  slug: string
): Promise<{
  success: boolean;
  messages?: AudioMessage[];
  error?: string;
}> {
  try {
    const messages = await getAudioMessages(slug);
    return { success: true, messages };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Greška",
    };
  }
}

export async function deleteAudioMsg(
  slug: string,
  id: string,
  blobUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const weddingData = await getWeddingData(slug);
    if (!weddingData?.paid_for_audio) {
      return { success: false, error: "Not authorized" };
    }

    // Delete blob from Vercel Blob
    try {
      await del(blobUrl);
    } catch {
      // Blob may already be deleted — continue with metadata cleanup
    }

    // Delete metadata from MongoDB
    await deleteAudioMessage(id);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Greška",
    };
  }
}

export async function checkAudioPaidStatus(
  slug: string
): Promise<boolean> {
  const weddingData = await getWeddingData(slug);
  return weddingData?.paid_for_audio ?? false;
}
