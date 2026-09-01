"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { del } from "@vercel/blob";
import {
  loadPortalData as dbLoadPortal,
  saveChecklist as dbSaveChecklist,
  saveBudget as dbSaveBudget,
} from "@/lib/portal";
import {
  getAudioMessages,
  deleteAudioMessage as dbDeleteAudio,
  type AudioMessage,
} from "@/lib/audio";
import {
  getGalleryPhotos,
  getGalleryPhoto,
  getGalleryPhotoCount,
  deleteGalleryPhoto as dbDeleteGalleryPhoto,
  type GalleryPhoto,
} from "@/lib/gallery";
import { deleteObject as r2Delete } from "@/lib/r2";
import {
  galleryPhase,
  canCoupleAccess,
  type GalleryPhase,
} from "@/lib/gallery-lifecycle";
import {
  getStandaloneSeating,
  setStandaloneMeni,
  patchStandaloneCheckinToken,
  generateCheckinToken,
} from "@/lib/standalone-seating";
import type { ChecklistItem, PortalBudget } from "@/app/moje-vencanje/types";
import type { MeniData } from "@/app/pozivnica/[slug]/types";

/**
 * Seating-scoped portal actions. Each verifies the caller holds the
 * `auth_seating_${slug}` PIN cookie for the requested slug (the cookie name +
 * signed JWT bind it to that slug), so a client passing another slug is
 * rejected. Backs the standalone owner portal with the same slug-keyed libs
 * the couple portal uses — without any couple gating.
 */

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function isOwner(slug: string): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(`auth_seating_${slug}`)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.slug === slug;
  } catch {
    return false;
  }
}

/* ── Hostess check-in link ──────────────────────────────────── */

/**
 * Issues a fresh check-in token, invalidating any link already handed out.
 * The organizer holds the PIN; the hostess only ever receives the resulting
 * URL, which grants check-in and nothing else.
 */
export async function issueCheckinTokenAction(slug: string) {
  if (!(await isOwner(slug))) return { error: "Niste prijavljeni" };
  const token = generateCheckinToken();
  await patchStandaloneCheckinToken(slug, token);
  return { ok: true, token };
}

export async function revokeCheckinTokenAction(slug: string) {
  if (!(await isOwner(slug))) return { error: "Niste prijavljeni" };
  await patchStandaloneCheckinToken(slug, null);
  return { ok: true };
}

/* ── Planner (checklist / budget) ───────────────────────────── */

export async function loadPortalDataAction(slug: string) {
  if (!(await isOwner(slug))) return null;
  const data = await dbLoadPortal(slug);
  return { checklist: data.checklist, budget: data.budget };
}

export async function saveChecklistAction(
  slug: string,
  checklist: ChecklistItem[],
) {
  if (!(await isOwner(slug))) return { error: "Niste prijavljeni" };
  await dbSaveChecklist(slug, checklist);
  return { ok: true };
}

export async function saveBudgetAction(slug: string, budget: PortalBudget) {
  if (!(await isOwner(slug))) return { error: "Niste prijavljeni" };
  await dbSaveBudget(slug, budget);
  return { ok: true };
}

/* ── Meni (free value-add shown in the guest hub) ───────────── */

export async function loadMeniAction(slug: string): Promise<MeniData | null> {
  if (!(await isOwner(slug))) return null;
  const seating = await getStandaloneSeating(slug);
  return seating?.meni ?? null;
}

export async function saveMeniAction(slug: string, meni: MeniData) {
  if (!(await isOwner(slug))) return { error: "Niste prijavljeni" };
  await setStandaloneMeni(slug, meni);
  return { ok: true };
}

/* ── Audio ──────────────────────────────────────────────────── */

export async function loadAudioMessagesAction(slug: string): Promise<{
  messages: AudioMessage[];
  paidForAudio: boolean;
} | null> {
  if (!(await isOwner(slug))) return null;
  const seating = await getStandaloneSeating(slug);
  if (!seating) return null;
  if (!seating.paid_for_audio) return { messages: [], paidForAudio: false };
  try {
    const messages = await getAudioMessages(slug);
    return { messages, paidForAudio: true };
  } catch {
    return { messages: [], paidForAudio: true };
  }
}

export async function refreshAudioMessagesAction(slug: string): Promise<{
  success: boolean;
  messages?: AudioMessage[];
}> {
  if (!(await isOwner(slug))) return { success: false };
  try {
    const messages = await getAudioMessages(slug);
    return { success: true, messages };
  } catch {
    return { success: false };
  }
}

export async function deleteAudioMsgAction(
  slug: string,
  id: string,
  blobUrl: string,
): Promise<{ success: boolean }> {
  if (!(await isOwner(slug))) return { success: false };
  const seating = await getStandaloneSeating(slug);
  if (!seating?.paid_for_audio) return { success: false };
  try {
    try {
      await del(blobUrl);
    } catch {
      /* blob may be gone */
    }
    await dbDeleteAudio(id);
    return { success: true };
  } catch {
    return { success: false };
  }
}

/* ── Gallery ────────────────────────────────────────────────── */

export async function loadGalleryAction(
  slug: string,
  skip = 0,
  limit = 60,
): Promise<{
  photos: GalleryPhoto[];
  total: number;
  paidForGallery: boolean;
  canAccess: boolean;
  phase: GalleryPhase;
} | null> {
  if (!(await isOwner(slug))) return null;
  const seating = await getStandaloneSeating(slug);
  if (!seating) return null;

  const paidForGallery = seating.paid_for_gallery ?? false;
  const extra = seating.gallery_extra_days ?? 0;
  const phase = galleryPhase(seating.eventDate, extra);
  const canAccess = canCoupleAccess(seating.eventDate, extra);

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
  slug: string,
  id: string,
): Promise<{ success: boolean }> {
  if (!(await isOwner(slug))) return { success: false };
  const seating = await getStandaloneSeating(slug);
  if (!seating?.paid_for_gallery) return { success: false };
  try {
    const photo = await getGalleryPhoto(id);
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
