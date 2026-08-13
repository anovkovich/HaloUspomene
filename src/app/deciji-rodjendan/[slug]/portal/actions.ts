"use server";

import {
  addManualGuestCore,
  updateGuestCountCore,
  deleteGuestCore,
  loadGalleryCore,
  deleteGalleryPhotoCore,
  loadMeniCore,
  saveMeniCore,
  uploadInvitationImageCore,
  deleteInvitationImageCore,
  type ActionResult,
} from "@/lib/proslava/portal-actions-core";
import type { MeniData } from "@/app/pozivnica/[slug]/types";

// Thin binders over the shared core — server actions must be exported per
// route, so only the cookie name differs between this file and the
// punoletstvo one.
const COOKIE = (slug: string) => `auth_birthday_${slug}`;

export async function addBirthdayManualGuestAction(
  slug: string,
  name: string,
  guestCount: number,
): Promise<ActionResult> {
  return addManualGuestCore(COOKIE(slug), slug, name, guestCount);
}

export async function updateBirthdayGuestCountAction(
  slug: string,
  id: string,
  guestCount: number,
): Promise<ActionResult> {
  return updateGuestCountCore(COOKIE(slug), slug, id, guestCount);
}

export async function deleteBirthdayGuestAction(
  slug: string,
  id: string,
): Promise<ActionResult> {
  return deleteGuestCore(COOKIE(slug), slug, id);
}

export async function loadBirthdayGalleryAction(
  slug: string,
  skip = 0,
  limit = 60,
) {
  return loadGalleryCore(COOKIE(slug), slug, skip, limit);
}

export async function deleteBirthdayGalleryPhotoAction(slug: string, id: string) {
  return deleteGalleryPhotoCore(COOKIE(slug), slug, id);
}

export async function loadBirthdayMeniAction(slug: string) {
  return loadMeniCore(COOKIE(slug), slug);
}

export async function saveBirthdayMeniAction(slug: string, meni: MeniData) {
  return saveMeniCore(COOKIE(slug), slug, meni);
}

export async function uploadBirthdayImageAction(slug: string, form: FormData) {
  return uploadInvitationImageCore(COOKIE(slug), slug, form);
}

export async function deleteBirthdayImageAction(slug: string, url: string) {
  return deleteInvitationImageCore(COOKIE(slug), slug, url);
}
