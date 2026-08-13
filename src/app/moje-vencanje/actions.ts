"use server";

import { isAdminSession } from "@/lib/admin-auth";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { jwtVerify } from "jose";
import { getWeddingData } from "@/data/pozivnice";
import { patchCouple, toPortalCoupleInfo } from "@/lib/couples";
import type { PortalCoupleInfo } from "@/lib/couples";
import type { MeniData } from "@/app/pozivnica/[slug]/types";
import {
  loadPortalData as dbLoadPortal,
  saveChecklist as dbSaveChecklist,
  saveBudget as dbSaveBudget,
  saveVendorFavorites as dbSaveVendorFavorites,
  saveGuestList as dbSaveGuestList,
  saveSeatingNudge,
  getHighlightedVendors as dbGetHighlighted,
  setHighlightedVendors as dbSetHighlighted,
} from "@/lib/portal";
import { snoozeUntil } from "@/lib/seating/nudge";
import type {
  SeatingNudgeDismiss,
  NudgeState,
  NudgeStage,
} from "@/lib/seating/nudge";
import { getAudioMessages, deleteAudioMessage as dbDeleteAudio } from "@/lib/audio";
import type { AudioMessage } from "@/lib/audio";
import {
  getGalleryPhotos,
  getGalleryPhoto,
  getGalleryPhotoCount,
  deleteGalleryPhoto as dbDeleteGalleryPhoto,
  type GalleryPhoto,
} from "@/lib/gallery";
import { deleteObject as r2Delete } from "@/lib/r2";
import { galleryPhase, canCoupleAccess, type GalleryPhase } from "@/lib/gallery-lifecycle";
import {
  getRSVPResponses,
  addRSVPResponse,
  updateRSVPCategory,
  updateRSVPGuestCount,
  deleteRSVPResponse,
  type RSVPEntry,
} from "@/lib/rsvp";
import { del } from "@vercel/blob";
import type {
  ChecklistItem,
  PortalBudget,
  GuestList,
  Vendor,
  VendorCategoryMeta,
  VendorTrackKind,
} from "./types";
import { CATEGORY_META } from "./vendor-constants";
import {
  getAllVendors as dbGetAllVendors,
  toggleEndorsement as dbToggleEndorsement,
  getEndorsementsByCouple as dbGetEndorsementsByCouple,
  incrementVendorStat as dbIncrementVendorStat,
} from "@/lib/vendors";

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

export async function verifyAuth(): Promise<
  ({ ok: boolean; slug?: string } & Partial<PortalCoupleInfo>) | null
> {
  const slug = await getAuthSlug();
  if (!slug) return null;

  const data = await getWeddingData(slug);
  if (!data) return null;

  return { ok: true, slug, ...toPortalCoupleInfo(data) };
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

/* ── Meni (free value-add: food/drinks shown in the guest hub) ────────── */

export async function loadMeniAction(): Promise<MeniData | null> {
  const slug = await getAuthSlug();
  if (!slug) return null;
  const data = await getWeddingData(slug);
  return data?.meni ?? null;
}

export async function saveMeniAction(meni: MeniData) {
  const slug = await getAuthSlug();
  if (!slug) return { error: "Niste prijavljeni" };
  // Meni lives on the couple record (WeddingData) so the guest hub can read it.
  await patchCouple(slug, { meni });
  return { ok: true };
}

/* ── Rok za potvrde dolaska (submit_until) ─────────────────── */

/** Most days the portal will push the deadline back in one go. A cap keeps a
 *  stuck "+" button from parking the deadline months past the wedding. */
const MAX_EXTENSION_DAYS = 30;

/** Local-calendar ISO date (YYYY-MM-DD). `toISOString()` would shift the day
 *  back in UTC+1/+2, which is exactly the off-by-one the guests would feel. */
function toISODate(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Pushes `submit_until` back by N days, counted from today or the existing
 *  deadline — whichever is later. Capped at the wedding day: a confirmation
 *  that lands after the event helps nobody, and the invitation is behind
 *  EventPassedGuard by then anyway. */
export async function extendRsvpDeadlineAction(days: number): Promise<
  | { ok: true; submitUntil: string; capped: boolean }
  | { ok?: false; error: string }
> {
  const slug = await getAuthSlug();
  if (!slug) return { error: "Niste prijavljeni" };

  const n = Math.floor(Number(days));
  if (!Number.isFinite(n) || n < 1 || n > MAX_EXTENSION_DAYS) {
    return { error: "Neispravan broj dana" };
  }

  const data = await getWeddingData(slug);
  if (!data) return { error: "Pozivnica nije pronađena" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const current = new Date(data.submit_until);
  const base = new Date(
    !isNaN(current.getTime()) && current.getTime() > today.getTime()
      ? current.setHours(0, 0, 0, 0)
      : today.getTime(),
  );
  base.setDate(base.getDate() + n);

  let capped = false;
  const eventDate = new Date(data.event_date);
  if (!isNaN(eventDate.getTime())) {
    eventDate.setHours(0, 0, 0, 0);
    if (eventDate.getTime() < today.getTime()) {
      return { error: "Venčanje je prošlo — rok se više ne može produžiti" };
    }
    if (base.getTime() > eventDate.getTime()) {
      base.setTime(eventDate.getTime());
      capped = true;
    }
  }

  const submitUntil = toISODate(base);
  if (submitUntil === data.submit_until) {
    return { error: "Rok već ističe na dan venčanja" };
  }

  await patchCouple(slug, { submit_until: submitUntil });
  // The invitation is cached; without this the guests would keep seeing the old
  // deadline (and a disabled form) until the next revalidation window.
  revalidatePath(`/pozivnica/${slug}`);
  revalidatePath(`/premium-pozivnica/${slug}`);

  return { ok: true, submitUntil, capped };
}

/* ── Guest List (private planning list of invitees) ────────── */

export async function loadGuestListAction(): Promise<GuestList | null> {
  const slug = await getAuthSlug();
  if (!slug) return null;
  const data = await dbLoadPortal(slug);
  return data.guestList ?? { sections: [], invitees: [] };
}

export async function saveGuestListAction(
  guestList: GuestList,
): Promise<{ ok: boolean }> {
  const slug = await getAuthSlug();
  if (!slug) return { ok: false };
  await dbSaveGuestList(slug, guestList);
  return { ok: true };
}

/* ── Highlighted Vendors (global) ─────────────────────────── */

export async function loadHighlightedVendorsAction(): Promise<string[]> {
  return dbGetHighlighted();
}

export async function setHighlightedVendorsAction(vendorIds: string[]) {
  // Admin-only. The role claim matters: every token this app issues shares
  // JWT_SECRET, so a bare signature check accepted any couple session — or the
  // trust token from the public SMS flow — as admin.
  if (!(await isAdminSession())) return { error: "Nemate admin pristup" };
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

/* ── Gallery ────────────────────────────────────────────────── */

export async function loadGalleryAction(
  skip = 0,
  limit = 60
): Promise<{
  photos: GalleryPhoto[];
  total: number;
  paidForGallery: boolean;
  canAccess: boolean;
  phase: GalleryPhase;
} | null> {
  const slug = await getAuthSlug();
  if (!slug) return null;
  const data = await getWeddingData(slug);
  if (!data) return null;

  const paidForGallery = data.paid_for_gallery ?? false;
  const extra = data.gallery_extra_days ?? 0;
  const phase = galleryPhase(data.event_date, extra);
  const canAccess = canCoupleAccess(data.event_date, extra);

  if (!paidForGallery || !canAccess) {
    return { photos: [], total: 0, paidForGallery, canAccess, phase };
  }
  try {
    const [photos, total] = await Promise.all([
      getGalleryPhotos(slug, { includeUnapproved: true, skip, limit }),
      getGalleryPhotoCount(slug),
    ]);
    return { photos, total, paidForGallery, canAccess, phase };
  } catch {
    return { photos: [], total: 0, paidForGallery, canAccess, phase };
  }
}

export async function deleteGalleryPhotoAction(
  id: string
): Promise<{ success: boolean }> {
  const slug = await getAuthSlug();
  if (!slug) return { success: false };
  const data = await getWeddingData(slug);
  if (!data?.paid_for_gallery) return { success: false };
  try {
    const photo = await getGalleryPhoto(id);
    // Only allow deleting a photo that belongs to this couple.
    if (!photo || photo.slug !== slug) return { success: false };
    try {
      await r2Delete(photo.key);
    } catch {
      /* object may already be gone */
    }
    await dbDeleteGalleryPhoto(id);
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
  /** "Ne" records a declined potvrda (guest cancelled), mirroring what the
   *  guest-facing RSVP form writes. */
  attending: "Da" | "Ne" = "Da",
): Promise<{ success: boolean; id?: string; error?: string }> {
  const slug = await getAuthSlug();
  if (!slug) return { success: false, error: "Niste prijavljeni" };
  try {
    const id = await addRSVPResponse(slug, {
      name,
      attending,
      // Declines carry no party size — same as a guest-submitted "Ne".
      guestCount: attending === "Ne" ? 1 : guestCount,
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
  paidForRaspored: boolean;
  eventDate: string;
  submitUntil?: string;
  draft: boolean;
  seatingNudge?: SeatingNudgeDismiss;
} | null> {
  const slug = await getAuthSlug();
  if (!slug) return null;
  const data = await getWeddingData(slug);
  if (!data) return null;

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

  let seatingNudge: SeatingNudgeDismiss | undefined;
  try {
    seatingNudge = (await dbLoadPortal(slug)).seatingNudge;
  } catch { /* ignore */ }

  return {
    totalGuests,
    seated,
    notSeated: totalGuests - seated,
    slug,
    paidForRaspored: data.paid_for_raspored ?? false,
    eventDate: data.event_date,
    submitUntil: data.submit_until,
    draft: data.draft ?? false,
    seatingNudge,
  };
}

/** Par je zatvorio ponudu za raspored sedenja. Slug se uzima iz kolačića —
 *  klijent ga nikad ne šalje. */
export async function dismissSeatingNudgeAction(
  state: NudgeState,
  stage: NudgeStage,
): Promise<{ success: boolean }> {
  const slug = await getAuthSlug();
  if (!slug) return { success: false };
  try {
    const prev = (await dbLoadPortal(slug)).seatingNudge;
    // Plafon se broji po stanju: par koji je odbio ponudu za kupovinu, pa
    // kasnije kupio raspored, kreće od nule za poziv da uđe u alat.
    const sameState = prev && (prev.state ?? "unpaid") === state;
    await saveSeatingNudge(slug, {
      count: (sameState ? prev.count : 0) + 1,
      snoozedUntil: snoozeUntil(),
      lastStage: stage,
      state,
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

/* ── Overview ──────────────────────────────────────────────── */

export async function loadOverviewAction(): Promise<{
  slug: string;
  guestStats: {
    attending: number;
    notAttending: number;
    totalGuests: number;
    uncategorized: number;
    notInvited: number;
    unlinkedConfirmations: number;
    /** Zvanice in the private planning list — 0 means the couple never started one. */
    inviteeCount: number;
    recentResponses: { name: string; attending: string; guestCount: string; timestamp: string }[];
  };
  audioStats: { count: number; totalDurationMs: number; paidForAudio: boolean };
  paidForRaspored: boolean;
  paidForGallery: boolean;
} | null> {
  const slug = await getAuthSlug();
  if (!slug) return null;
  const data = await getWeddingData(slug);
  if (!data) return null;

  // Guests
  let guestStats = { attending: 0, notAttending: 0, totalGuests: 0, uncategorized: 0, notInvited: 0, unlinkedConfirmations: 0, inviteeCount: 0, recentResponses: [] as { name: string; attending: string; guestCount: string; timestamp: string }[] };
  try {
    const responses = await getRSVPResponses(slug);
    const att = responses.filter((r) => r.attending === "Da");
    const notAtt = responses.filter((r) => r.attending === "Ne");
    const portal = await dbLoadPortal(slug);
    const invitees = portal.guestList?.invitees ?? [];
    const linkedIds = new Set(
      invitees.map((i) => i.linkedRsvpId).filter(Boolean) as string[],
    );
    guestStats = {
      attending: att.length,
      notAttending: notAtt.length,
      totalGuests: att.reduce((s, r) => s + (parseInt(r.guestCount) || 1), 0),
      uncategorized: att.filter((r) => !r.category).length,
      notInvited: invitees.filter((i) => i.status === "not-invited").length,
      inviteeCount: invitees.length,
      // Only meaningful once the couple actually uses the planning list.
      unlinkedConfirmations:
        invitees.length > 0
          ? responses.filter((r) => !linkedIds.has(r.id)).length
          : 0,
      recentResponses: [...responses]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)
        .map((r) => ({ name: r.name, attending: r.attending, guestCount: r.guestCount, timestamp: r.timestamp })),
    };
  } catch { /* ignore */ }

  // Audio
  const audioStats = { count: 0, totalDurationMs: 0, paidForAudio: data.paid_for_audio ?? false };
  if (audioStats.paidForAudio) {
    try {
      const msgs = await getAudioMessages(slug);
      audioStats.count = msgs.length;
      audioStats.totalDurationMs = msgs.reduce((s, m) => s + m.durationMs, 0);
    } catch { /* ignore */ }
  }

  return {
    slug,
    guestStats,
    audioStats,
    paidForRaspored: data.paid_for_raspored ?? false,
    paidForGallery: data.paid_for_gallery ?? false,
  };
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

/* ── Vendor Directory (DB) ─────────────────────────────────── */


export async function loadVendorsAction(): Promise<{
  vendors: Vendor[];
  categories: VendorCategoryMeta[];
  cities: string[];
}> {
  const vendors = await dbGetAllVendors();

  const categories: VendorCategoryMeta[] = CATEGORY_META.map((cat) => ({
    ...cat,
    count: vendors.filter((v) => v.category === cat.id).length,
  }));

  const cities = [...new Set(vendors.map((v) => v.city))].sort();

  return { vendors, categories, cities };
}

export async function loadMyEndorsementsAction(): Promise<string[]> {
  const slug = await getAuthSlug();
  if (!slug) return [];
  return dbGetEndorsementsByCouple(slug);
}

export async function toggleEndorsementAction(
  vendorId: string,
): Promise<{ ok: boolean; endorsed: boolean } | { error: string }> {
  const slug = await getAuthSlug();
  if (!slug) return { error: "Niste prijavljeni" };
  const endorsed = await dbToggleEndorsement(vendorId, slug);
  return { ok: true, endorsed };
}

const ALLOWED_TRACK_KINDS: VendorTrackKind[] = [
  "view",
  "phone",
  "website",
  "instagram",
];

/**
 * Fire-and-forget click/view tracking from the vendor directory.
 * Unauthenticated callers are ignored silently — the planner is gated by
 * moje_vencanje_auth, but we don't want a tracking failure to surface as a
 * visible error.
 */
export async function trackVendorEventAction(
  vendorId: string,
  kind: VendorTrackKind,
): Promise<{ ok: boolean }> {
  if (!vendorId || !ALLOWED_TRACK_KINDS.includes(kind)) return { ok: false };
  try {
    await dbIncrementVendorStat(vendorId, kind);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

