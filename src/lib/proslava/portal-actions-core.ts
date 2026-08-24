import {
  addBirthdayRSVP,
  updateBirthdayRSVPGuestCount,
  deleteBirthdayRSVP,
} from "@/lib/birthday-rsvp";
import { getBirthdayData, patchBirthday } from "@/lib/birthday";
import type { MeniData, MeniItem } from "@/app/pozivnica/[slug]/types";
import {
  getGalleryPhotos,
  getGalleryPhotoCount,
  getGalleryPhoto,
  deleteGalleryPhoto as dbDeleteGalleryPhoto,
  type GalleryPhoto,
} from "@/lib/gallery";
import { deleteObject as r2Delete } from "@/lib/r2";
import {
  galleryPhase,
  canCoupleAccess,
  type GalleryPhase,
} from "@/lib/gallery-lifecycle";
import { hasEventSession } from "@/lib/seating/action-auth";
import { MAX_INVITATION_IMAGES } from "@/lib/proslava/images-upload";
import { computeExtendedDeadline } from "@/lib/rsvp-deadline";
import { put, del as blobDel } from "@vercel/blob";
import { revalidatePath } from "next/cache";

/** Both product routes render from `birthday_events`, so bust each. */
function revalidateBirthdayPaths(slug: string) {
  revalidatePath(`/deciji-rodjendan/${slug}`);
  revalidatePath(`/punoletstvo/${slug}`);
}

/**
 * Guest-list mutations shared by the punoletstvo and dečiji-rođendan portals.
 *
 * Both products live in `birthday_events` and their portals are the same screen,
 * but each route tree mints its own cookie (`auth_punoletstvo_${slug}` vs
 * `auth_birthday_${slug}`). So the logic lives here once and each route keeps a
 * thin `"use server"` binder that passes its own cookie name — server actions
 * must be statically exported per route, which rules out sharing the action
 * itself.
 *
 * Authorization goes through `hasEventSession`, which checks the `slug` CLAIM
 * rather than just the signature. Everything this app signs shares `JWT_SECRET`
 * — including the trust token the public SMS flow hands to any visitor — so a
 * bare `jwtVerify` would accept a token anyone can obtain.
 */

export type ActionResult = { success: boolean; id?: string; error?: string };

const NOT_AUTHED: ActionResult = { success: false, error: "Niste prijavljeni" };

export async function addManualGuestCore(
  cookieName: string,
  slug: string,
  name: string,
  guestCount: number,
): Promise<ActionResult> {
  if (!(await hasEventSession(cookieName, slug))) return NOT_AUTHED;

  const cleanName = name.trim();
  if (!cleanName) return { success: false, error: "Unesite ime gosta" };
  const cleanCount = Math.max(1, Math.floor(guestCount || 1));

  try {
    const id = await addBirthdayRSVP(slug, {
      name: cleanName,
      attending: "Da",
      guestCount: cleanCount,
      message: "",
    });
    return { success: true, id };
  } catch {
    return { success: false, error: "Greška pri dodavanju gosta" };
  }
}

export async function updateGuestCountCore(
  cookieName: string,
  slug: string,
  id: string,
  guestCount: number,
): Promise<ActionResult> {
  if (!(await hasEventSession(cookieName, slug))) return NOT_AUTHED;
  if (!id) return { success: false, error: "Nedostaje ID" };

  const cleanCount = Math.max(1, Math.floor(guestCount || 1));
  try {
    await updateBirthdayRSVPGuestCount(id, cleanCount);
    return { success: true };
  } catch {
    return { success: false, error: "Greška pri čuvanju" };
  }
}

export async function deleteGuestCore(
  cookieName: string,
  slug: string,
  id: string,
): Promise<ActionResult> {
  if (!(await hasEventSession(cookieName, slug))) return NOT_AUTHED;
  if (!id) return { success: false, error: "Nedostaje ID" };

  try {
    await deleteBirthdayRSVP(id);
    return { success: true };
  } catch {
    return { success: false, error: "Greška pri brisanju" };
  }
}

/* ── QR galerija ─────────────────────────────────────────────────────────── */

export interface GalleryLoadResult {
  photos: GalleryPhoto[];
  total: number;
  paidForGallery: boolean;
  canAccess: boolean;
  phase: GalleryPhase;
}

/** Owner view of the album. Shape matches the wedding `loadGalleryAction` so
 *  `GalleryCard` can be dropped in with this injected. */
export async function loadGalleryCore(
  cookieName: string,
  slug: string,
  skip = 0,
  limit = 60,
): Promise<GalleryLoadResult | null> {
  if (!(await hasEventSession(cookieName, slug))) return null;
  const b = await getBirthdayData(slug);
  if (!b) return null;

  const paidForGallery = b.paid_for_gallery ?? false;
  const extra =
    (b as { gallery_extra_days?: number }).gallery_extra_days ?? 0;
  const phase = galleryPhase(b.event_date, extra);
  const canAccess = canCoupleAccess(b.event_date, extra);

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

export async function deleteGalleryPhotoCore(
  cookieName: string,
  slug: string,
  id: string,
): Promise<{ success: boolean }> {
  if (!(await hasEventSession(cookieName, slug))) return { success: false };
  const b = await getBirthdayData(slug);
  if (!b?.paid_for_gallery) return { success: false };
  try {
    const photo = await getGalleryPhoto(id);
    // Ownership check — an id alone must not delete another event's photo.
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

/* ── Meni ────────────────────────────────────────────────────────────────── */

/** Menu lives on the event document (not `wedding_portal`), so guests can read
 *  it from the hub without a second lookup. */
export async function loadMeniCore(
  cookieName: string,
  slug: string,
): Promise<MeniData | null> {
  if (!(await hasEventSession(cookieName, slug))) return null;
  const b = await getBirthdayData(slug);
  return b?.meni ?? null;
}

const MAX_MENI_ITEMS = 60;

/** Server actions are a public HTTP surface: the argument is whatever the
 *  caller posts, not whatever the TS signature claims. Normalize before it
 *  reaches the event document, so a malformed payload cannot park junk (or a
 *  large blob) in a record the guest hub renders. */
function sanitizeMeni(input: unknown): MeniData {
  const src = (input ?? {}) as Partial<MeniData>;
  const group = (items: unknown): MeniItem[] =>
    (Array.isArray(items) ? items : [])
      .slice(0, MAX_MENI_ITEMS)
      .map((raw) => {
        const i = (raw ?? {}) as Partial<MeniItem>;
        return {
          id: String(i.id ?? "").slice(0, 64),
          kategorija: String(i.kategorija ?? "ostalo").slice(0, 32),
          naziv: String(i.naziv ?? "").slice(0, 120),
          opis: i.opis ? String(i.opis).slice(0, 240) : undefined,
        };
      })
      .filter((i) => i.naziv !== "");
  return { food: group(src.food), drinks: group(src.drinks) };
}

export async function saveMeniCore(
  cookieName: string,
  slug: string,
  meni: MeniData,
): Promise<{ error: string; ok?: undefined } | { ok: boolean; error?: undefined }> {
  // Union shape mirrors the wedding `saveMeniAction` exactly — MeniCard's
  // injected-action prop is typed against it.
  if (!(await hasEventSession(cookieName, slug)))
    return { error: "Niste prijavljeni" };
  await patchBirthday(slug, { meni: sanitizeMeni(meni) });
  return { ok: true };
}

/* ── Slike na pozivnici (paid_for_images) ────────────────────────────────── */

/** Client-side twin of the admin image upload, so a 600-din purchase actually
 *  fulfils itself instead of queueing manual work for us.
 *
 *  Deliberately gallery-slot only: `hero_emblem_url` is a bespoke look override
 *  we set by hand, not something the buyer picks. */
export async function uploadInvitationImageCore(
  cookieName: string,
  slug: string,
  form: FormData,
): Promise<{ ok: boolean; url?: string; pathname?: string; error?: string }> {
  if (!(await hasEventSession(cookieName, slug)))
    return { ok: false, error: "Niste prijavljeni" };

  const b = await getBirthdayData(slug);
  if (!b) return { ok: false, error: "Nije pronađeno" };
  if (!b.paid_for_images)
    return { ok: false, error: "Galerija slika nije aktivirana" };

  const current = b.images ?? [];
  if (current.length >= MAX_INVITATION_IMAGES)
    return {
      ok: false,
      error: `Najviše ${MAX_INVITATION_IMAGES} fotografije.`,
    };

  const file = form.get("image");
  if (!(file instanceof File)) return { ok: false, error: "Izaberite sliku" };
  if (!file.type.startsWith("image/"))
    return { ok: false, error: "Fajl mora biti slika" };
  if (file.size > 5 * 1024 * 1024)
    return { ok: false, error: "Slika je prevelika (maks. 5 MB)" };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  let blob;
  try {
    blob = await put(`images/${slug}/${Date.now()}.${ext}`, file, {
      access: "public",
    });
  } catch (err) {
    console.error("blob upload failed:", slug, err);
    return { ok: false, error: "Otpremanje nije uspelo" };
  }

  await patchBirthday(slug, {
    images: [...current, { url: blob.url, pathname: blob.pathname }],
  });
  revalidateBirthdayPaths(slug);
  return { ok: true, url: blob.url, pathname: blob.pathname };
}

export async function deleteInvitationImageCore(
  cookieName: string,
  slug: string,
  url: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await hasEventSession(cookieName, slug)))
    return { ok: false, error: "Niste prijavljeni" };
  const b = await getBirthdayData(slug);
  if (!b) return { ok: false, error: "Nije pronađeno" };

  // Only remove an image that actually belongs to this event.
  const current = b.images ?? [];
  if (!current.some((i) => i.url === url))
    return { ok: false, error: "Slika nije pronađena" };

  try {
    await blobDel(url);
  } catch {
    /* blob may already be gone — dropping the reference is what matters */
  }
  await patchBirthday(slug, { images: current.filter((i) => i.url !== url) });
  revalidateBirthdayPaths(slug);
  return { ok: true };
}

/* ── Rok za potvrde dolaska ──────────────────────────────────────────────── */

/** Pushes `submit_until` back. The date math lives in `@/lib/rsvp-deadline`
 *  (pure); this only does auth, load, persist and cache-bust.
 *
 *  Revalidating BOTH product routes matters: the invitation is cached, and
 *  without it guests keep seeing a closed RSVP form until the next window. */
export async function extendDeadlineCore(
  cookieName: string,
  slug: string,
  days: number,
): Promise<
  { ok: true; submitUntil: string; capped: boolean } | { ok: false; error: string }
> {
  if (!(await hasEventSession(cookieName, slug)))
    return { ok: false, error: "Niste prijavljeni" };

  const b = await getBirthdayData(slug);
  if (!b) return { ok: false, error: "Proslava nije pronađena" };

  const result = computeExtendedDeadline({
    currentSubmitUntil: b.submit_until,
    eventDate: b.event_date,
    days,
  });
  if (!result.ok) return result;

  await patchBirthday(slug, { submit_until: result.submitUntil });
  revalidateBirthdayPaths(slug);
  return result;
}
