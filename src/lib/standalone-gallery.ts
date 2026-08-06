import type { WeddingData } from "@/app/pozivnica/[slug]/types";
import { generateUniqueSlug } from "./slug";
import { upsertCouple } from "./couples";
import { generateGalleryKey } from "./gallery-key";

/**
 * Standalone QR photo gallery sold without an invitation. Unlike the seating
 * product it has no collection of its own — the buyer is a `couples` record
 * carrying `standalone_gallery: true`, because every piece of gallery
 * infrastructure (photo metadata, R2 keys, the lifecycle cron, the payments
 * adapter, the guest page, the delete cascade) is already keyed on a couple slug.
 */

/** Password format must stay `${First}${4 digits}`: the portal login at
 *  POST /api/moje-vencanje/auth/[slug] compares it verbatim to potvrde_password. */
export function generateGalleryPassword(firstName: string): string {
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${firstName}${digits}`;
}

export interface GalleryCoupleInput {
  /** Full client name as typed — one or more words. */
  name: string;
  /** Already normalized to E.164 ("+381…"); the lifecycle SMS is skipped without the leading +. */
  phoneE164: string;
  /** ISO date (YYYY-MM-DD). Empty means the record never enters the lifecycle. */
  eventDate?: string;
  password: string;
  paidForGallery: boolean;
}

/** The canonical standalone-gallery document. Shared by the self-serve signup
 *  and the admin create so the two record shapes cannot drift apart. */
export function buildStandaloneGalleryCoupleData(
  input: GalleryCoupleInput
): WeddingData {
  const name = input.name.trim();
  return {
    couple_names: { bride: name, groom: "", full_display: name },
    potvrde_password: input.password,
    standalone_gallery: true,
    // Minted up front so every share surface has it; `ensureGalleryKey` only
    // has to cover couples that predate the field.
    gallery_key: generateGalleryKey(),
    draft: true,
    theme: "classic_rose",
    event_date: input.eventDate ? `${input.eventDate}T16:00:00` : "",
    submit_until: "",
    locations: [],
    timeline: [],
    countdown_enabled: false,
    map_enabled: false,
    paid_for_raspored: false,
    paid_for_audio: false,
    paid_for_audio_USB: "",
    paid_for_pdf: false,
    paid_for_gallery: input.paidForGallery,
    receipt_valid: false,
    custom_discount: 0,
    contact_phone: input.phoneE164,
  };
}

/** Splits a typed name the same way the self-serve signup does, so both paths
 *  produce the same slug shape ("Marija" → marija-galerija, "Marija Jovanović"
 *  → marija-jovanovic). */
export function galleryNameParts(name: string): { first: string; rest: string } {
  const [first, ...rest] = name.trim().split(/\s+/);
  return { first, rest: rest.join(" ") || "galerija" };
}

/**
 * Admin-side create. Persists with a plain `upsertCouple` — deliberately NOT
 * `quickRegisterCouple`, which sets the portal auth cookies on the *caller's*
 * browser and would therefore log the admin in as this client.
 *
 * Throws `InvalidSlugInputError` when the name has no usable letters.
 */
export async function createStandaloneGalleryCouple(input: {
  name: string;
  phoneE164: string;
  eventDate: string;
}): Promise<{ slug: string; password: string; galleryKey?: string }> {
  const { first, rest } = galleryNameParts(input.name);
  const slug = await generateUniqueSlug(first, rest);
  const password = generateGalleryPassword(first);

  const data = buildStandaloneGalleryCoupleData({
    name: input.name,
    phoneE164: input.phoneE164,
    eventDate: input.eventDate,
    password,
    // Admin creates the record once the client has paid, so it goes live
    // immediately; the row toggle can turn it back off.
    paidForGallery: true,
  });
  await upsertCouple(slug, data);

  return { slug, password, galleryKey: data.gallery_key };
}
