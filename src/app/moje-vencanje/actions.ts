"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getWeddingData } from "@/data/pozivnice";
import {
  loadPortalData as dbLoadPortal,
  saveChecklist as dbSaveChecklist,
  saveBudget as dbSaveBudget,
  saveVendorFavorites as dbSaveVendorFavorites,
  getHighlightedVendors as dbGetHighlighted,
  setHighlightedVendors as dbSetHighlighted,
} from "@/lib/portal";
import { getAudioMessages, deleteAudioMessage as dbDeleteAudio } from "@/lib/audio";
import type { AudioMessage } from "@/lib/audio";
import {
  getRSVPResponses,
  addRSVPResponse,
  updateRSVPCategory,
  updateRSVPGuestCount,
  deleteRSVPResponse,
  type RSVPEntry,
} from "@/lib/rsvp";
import { del } from "@vercel/blob";
import type { ChecklistItem, PortalBudget } from "./types";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function getAuthSlug(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get("moje_vencanje_auth")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.slug as string) ?? null;
  } catch {
    return null;
  }
}

export async function verifyAuth(): Promise<{
  ok: boolean;
  slug?: string;
  bride?: string;
  groom?: string;
  eventDate?: string;
  scriptFont?: string;
  draft?: boolean;
} | null> {
  const slug = await getAuthSlug();
  if (!slug) return null;

  const data = await getWeddingData(slug);
  if (!data) return null;

  return {
    ok: true,
    slug,
    bride: data.couple_names.bride,
    groom: data.couple_names.groom,
    eventDate: data.event_date,
    scriptFont: data.scriptFont ?? "great-vibes",
    draft: data.draft ?? false,
  };
}

export async function loadPortalDataAction() {
  const slug = await getAuthSlug();
  if (!slug) return null;

  const data = await dbLoadPortal(slug);
  return {
    checklist: data.checklist,
    budget: data.budget,
    vendorFavorites: data.vendorFavorites ?? [],
  };
}

export async function saveChecklistAction(checklist: ChecklistItem[]) {
  const slug = await getAuthSlug();
  if (!slug) return { error: "Niste prijavljeni" };
  await dbSaveChecklist(slug, checklist);
  return { ok: true };
}

export async function saveBudgetAction(budget: PortalBudget) {
  const slug = await getAuthSlug();
  if (!slug) return { error: "Niste prijavljeni" };
  await dbSaveBudget(slug, budget);
  return { ok: true };
}

export async function saveVendorFavoritesAction(vendorFavorites: string[]) {
  const slug = await getAuthSlug();
  if (!slug) return { error: "Niste prijavljeni" };
  await dbSaveVendorFavorites(slug, vendorFavorites);
  return { ok: true };
}

/* ── Highlighted Vendors (global) ─────────────────────────── */

export async function loadHighlightedVendorsAction(): Promise<string[]> {
  return dbGetHighlighted();
}

export async function setHighlightedVendorsAction(vendorIds: string[]) {
  // Admin-only: check admin JWT
  const jar = await cookies();
  const adminToken = jar.get("admin_token")?.value;
  if (!adminToken) return { error: "Nemate admin pristup" };
  try {
    await jwtVerify(adminToken, secret);
  } catch {
    return { error: "Nemate admin pristup" };
  }
  await dbSetHighlighted(vendorIds);
  return { ok: true };
}

/* ── Audio ──────────────────────────────────────────────────── */

export async function loadAudioMessagesAction(): Promise<{
  messages: AudioMessage[];
  paidForAudio: boolean;
} | null> {
  const slug = await getAuthSlug();
  if (!slug) return null;
  const data = await getWeddingData(slug);
  if (!data) return null;
  const paid = data.paid_for_audio ?? false;
  if (!paid) return { messages: [], paidForAudio: false };
  try {
    const messages = await getAudioMessages(slug);
    return { messages, paidForAudio: true };
  } catch {
    return { messages: [], paidForAudio: true };
  }
}

export async function refreshAudioMessagesAction(): Promise<{
  success: boolean;
  messages?: AudioMessage[];
}> {
  const slug = await getAuthSlug();
  if (!slug) return { success: false };
  try {
    const messages = await getAudioMessages(slug);
    return { success: true, messages };
  } catch {
    return { success: false };
  }
}

export async function deleteAudioMsgAction(
  id: string,
  blobUrl: string,
): Promise<{ success: boolean }> {
  const slug = await getAuthSlug();
  if (!slug) return { success: false };
  const data = await getWeddingData(slug);
  if (!data?.paid_for_audio) return { success: false };
  try {
    try { await del(blobUrl); } catch { /* blob may be gone */ }
    await dbDeleteAudio(id);
    return { success: true };
  } catch {
    return { success: false };
  }
}

/* ── RSVP / Guests ─────────────────────────────────────────── */

export async function loadGuestsAction(): Promise<{
  attending: RSVPEntry[];
  notAttending: RSVPEntry[];
  totalGuests: number;
  eventDate: string;
  paidForPdf: boolean;
  slug: string;
} | null> {
  const slug = await getAuthSlug();
  if (!slug) return null;
  const data = await getWeddingData(slug);
  if (!data) return null;
  try {
    const responses = await getRSVPResponses(slug);
    const attending = responses.filter((r) => r.attending === "Da");
    const notAttending = responses.filter((r) => r.attending === "Ne");
    const totalGuests = attending.reduce(
      (sum, r) => sum + (parseInt(r.guestCount) || 1),
      0,
    );
    return {
      attending,
      notAttending,
      totalGuests,
      eventDate: data.event_date,
      paidForPdf: data.paid_for_pdf ?? false,
      slug,
    };
  } catch {
    return null;
  }
}

export async function refreshGuestsAction(): Promise<{
  success: boolean;
  attending?: RSVPEntry[];
  notAttending?: RSVPEntry[];
  totalGuests?: number;
}> {
  const slug = await getAuthSlug();
  if (!slug) return { success: false };
  try {
    const responses = await getRSVPResponses(slug);
    const attending = responses.filter((r) => r.attending === "Da");
    const notAttending = responses.filter((r) => r.attending === "Ne");
    const totalGuests = attending.reduce(
      (sum, r) => sum + (parseInt(r.guestCount) || 1),
      0,
    );
    return { success: true, attending, notAttending, totalGuests };
  } catch {
    return { success: false };
  }
}

export async function addManualGuestAction(
  name: string,
  guestCount: number,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const slug = await getAuthSlug();
  if (!slug) return { success: false, error: "Niste prijavljeni" };
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

export async function updateGuestCategoryAction(
  id: string,
  category: string,
): Promise<{ success: boolean }> {
  const slug = await getAuthSlug();
  if (!slug) return { success: false };
  try {
    await updateRSVPCategory(id, category);
    return { success: true };
  } catch {
    return { success: false };
  }
}

/* ── PDF ───────────────────────────────────────────────────── */

export async function getWeddingDataForPDF(): Promise<{
  weddingData: import("@/app/pozivnica/[slug]/types").WeddingData;
  slug: string;
} | null> {
  const slug = await getAuthSlug();
  if (!slug) return null;
  const data = await getWeddingData(slug);
  if (!data) return null;
  return { weddingData: data as import("@/app/pozivnica/[slug]/types").WeddingData, slug };
}

/* ── Seating Stats ────────────────────────────────────────── */

export async function loadSeatingStatsAction(): Promise<{
  totalGuests: number;
  seated: number;
  notSeated: number;
  slug: string;
} | null> {
  const slug = await getAuthSlug();
  if (!slug) return null;

  const { loadSeatingLayout } = await import("@/lib/seating");

  // Total attending guests
  let totalGuests = 0;
  try {
    const responses = await getRSVPResponses(slug);
    const att = responses.filter((r) => r.attending === "Da");
    totalGuests = att.reduce((s, r) => s + (parseInt(r.guestCount) || 1), 0);
  } catch { /* ignore */ }

  // Count seated from seating layout
  let seated = 0;
  try {
    const tables = await loadSeatingLayout(slug);
    if (tables) {
      for (const table of tables) {
        for (const seat of table.assignments) {
          if (seat) seated++;
        }
      }
    }
  } catch { /* ignore */ }

  return { totalGuests, seated, notSeated: totalGuests - seated, slug };
}

/* ── Overview ──────────────────────────────────────────────── */

export async function loadOverviewAction(): Promise<{
  slug: string;
  guestStats: {
    attending: number;
    notAttending: number;
    totalGuests: number;
    uncategorized: number;
    recentResponses: { name: string; attending: string; guestCount: string; timestamp: string }[];
  };
  audioStats: { count: number; totalDurationMs: number; paidForAudio: boolean };
} | null> {
  const slug = await getAuthSlug();
  if (!slug) return null;
  const data = await getWeddingData(slug);
  if (!data) return null;

  // Guests
  let guestStats = { attending: 0, notAttending: 0, totalGuests: 0, uncategorized: 0, recentResponses: [] as { name: string; attending: string; guestCount: string; timestamp: string }[] };
  try {
    const responses = await getRSVPResponses(slug);
    const att = responses.filter((r) => r.attending === "Da");
    const notAtt = responses.filter((r) => r.attending === "Ne");
    guestStats = {
      attending: att.length,
      notAttending: notAtt.length,
      totalGuests: att.reduce((s, r) => s + (parseInt(r.guestCount) || 1), 0),
      uncategorized: att.filter((r) => !r.category).length,
      recentResponses: [...responses]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)
        .map((r) => ({ name: r.name, attending: r.attending, guestCount: r.guestCount, timestamp: r.timestamp })),
    };
  } catch { /* ignore */ }

  // Audio
  let audioStats = { count: 0, totalDurationMs: 0, paidForAudio: data.paid_for_audio ?? false };
  if (audioStats.paidForAudio) {
    try {
      const msgs = await getAudioMessages(slug);
      audioStats.count = msgs.length;
      audioStats.totalDurationMs = msgs.reduce((s, m) => s + m.durationMs, 0);
    } catch { /* ignore */ }
  }

  return { slug, guestStats, audioStats };
}

/* ── Guest Edit ────────────────────────────────────────────── */

export async function updateGuestCountAction(
  id: string,
  guestCount: number,
): Promise<{ success: boolean }> {
  const slug = await getAuthSlug();
  if (!slug) return { success: false };
  try {
    await updateRSVPGuestCount(id, guestCount);
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function deleteGuestAction(
  id: string,
): Promise<{ success: boolean }> {
  const slug = await getAuthSlug();
  if (!slug) return { success: false };
  try {
    await deleteRSVPResponse(id);
    return { success: true };
  } catch {
    return { success: false };
  }
}
