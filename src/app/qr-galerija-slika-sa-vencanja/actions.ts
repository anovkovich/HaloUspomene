"use server";

import { headers } from "next/headers";
import { generateUniqueSlug, InvalidSlugInputError } from "@/lib/slug";
import {
  buildStandaloneGalleryCoupleData,
  galleryNameParts,
  generateGalleryPassword,
} from "@/lib/standalone-gallery";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";
import {
  resolvePhoneAuthorization,
  PhoneAuthError,
} from "@/lib/phone-verification";
import { quickRegisterCouple } from "@/lib/quick-register";

export type CreateGalleryResult =
  | { ok: true; slug: string; password: string }
  | { ok: false; error: string };

// Self-serve standalone QR photo gallery. Reuses the same QuickRegister
// mechanism as the planner signup — a proper, portal-ready couple record with
// auto-login — then leaves `paid_for_gallery: false` until the buyer pays at
// /placanje/galerija/[slug]. (The gallery guest page gates on `paid_for_gallery`,
// not `draft`, so it works day-one after activation.)
export async function createGalleryCouple(input: {
  name: string;
  phone: string; // "+381..."
  eventDate?: string; // ISO date (YYYY-MM-DD)
  recaptchaToken: string;
  phoneTrustToken?: string;
  /** Foreign-customer bypass link — skips SMS when present + valid. */
  bypassToken?: string;
}): Promise<CreateGalleryResult> {
  const name = input.name.trim();
  if (!name || name.length < 2) {
    return { ok: false, error: "Unesite ime." };
  }

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  try {
    await verifyRecaptcha(input.recaptchaToken, "create_gallery", {
      remoteIp: ip,
    });
  } catch (err) {
    if (err instanceof RecaptchaError) {
      return {
        ok: false,
        error: "Provera neuspešna. Osvežite stranicu i pokušajte ponovo.",
      };
    }
    throw err;
  }

  let phoneE164: string;
  try {
    ({ phoneE164 } = await resolvePhoneAuthorization({
      rawPhone: input.phone,
      bypassToken: input.bypassToken,
      phoneTrustToken: input.phoneTrustToken,
    }));
  } catch (err) {
    if (err instanceof PhoneAuthError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }

  const { first, rest } = galleryNameParts(name);
  let slug: string;
  try {
    slug = await generateUniqueSlug(first, rest);
  } catch (err) {
    if (err instanceof InvalidSlugInputError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }

  const autoPassword = generateGalleryPassword(first);

  const coupleData = buildStandaloneGalleryCoupleData({
    name,
    phoneE164,
    eventDate: input.eventDate,
    password: autoPassword,
    paidForGallery: false,
  });

  // Persist + auto-login to the portal (shared QuickRegister mechanism).
  await quickRegisterCouple(slug, coupleData);

  return { ok: true, slug, password: autoPassword };
}
