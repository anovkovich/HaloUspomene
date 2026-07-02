"use server";

import { cookies, headers } from "next/headers";
import { SignJWT } from "jose";
import { upsertCouple } from "@/lib/couples";
import { generateUniqueSlug, InvalidSlugInputError } from "@/lib/slug";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";
import {
  ensurePhoneVerified,
  normalizePhone,
} from "@/lib/phone-verification";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret",
);

export type SignupResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

export async function signupAction(formData: {
  bride: string;
  groom: string;
  eventDate: string;
  phone: string;
  instagram: string;
  password: string;
  recaptchaToken: string;
  phoneTrustToken?: string;
}): Promise<SignupResult> {
  const bride = formData.bride.trim();
  const groom = formData.groom.trim();
  const password = formData.password.trim();
  const phone = formData.phone.trim().replace(/^\+?381/, "");
  const instagram = formData.instagram.trim().replace(/^@/, "");

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  try {
    await verifyRecaptcha(formData.recaptchaToken, "quickstart", { remoteIp: ip });
  } catch (err) {
    if (err instanceof RecaptchaError) {
      return {
        ok: false,
        error: "Provera neuspešna. Osvežite stranicu i pokušajte ponovo.",
      };
    }
    throw err;
  }

  // Validation
  if (!bride || bride.length < 2)
    return { ok: false, error: "Ime mlade mora imati najmanje 2 karaktera" };
  if (!groom || groom.length < 2)
    return {
      ok: false,
      error: "Ime mladoženje mora imati najmanje 2 karaktera",
    };
  if (!phone)
    return {
      ok: false,
      error: "Unesite broj telefona",
    };
  if (!/^0?6\d{7,8}$/.test(phone))
    return {
      ok: false,
      error: "Unesite validan srpski broj telefona (06X XXX XXXX)",
    };
  if (!password || password.length < 4)
    return { ok: false, error: "Lozinka mora imati najmanje 4 karaktera" };

  {
    const phoneE164 = normalizePhone(phone);
    if (!phoneE164) {
      return { ok: false, error: "Broj telefona nije ispravan." };
    }
    try {
      await ensurePhoneVerified(formData.phoneTrustToken, phoneE164);
    } catch {
      return {
        ok: false,
        error: "Verifikujte broj telefona pre kreiranja naloga.",
      };
    }
  }

  // Generate unique slug — transliterates Cyrillic, throws if names produce
  // an empty slug (e.g. emoji-only input).
  let slug: string;
  try {
    slug = await generateUniqueSlug(bride, groom);
  } catch (err) {
    if (err instanceof InvalidSlugInputError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }

  // Create couple document
  const coupleData: WeddingData = {
    couple_names: {
      bride,
      groom,
      full_display: `${bride} & ${groom}`,
    },
    potvrde_password: password,
    draft: true,
    theme: "classic_rose",
    event_date: formData.eventDate
      ? `${formData.eventDate}T16:00:00`
      : "",
    submit_until: "",
    locations: [],
    timeline: [],
    countdown_enabled: false,
    map_enabled: false,
    paid_for_raspored: false,
    paid_for_audio: false,
    paid_for_audio_USB: "",
    paid_for_pdf: false,
    receipt_valid: false,
    custom_discount: 0,
    // Contact info stored on the document for admin visibility
    contact_phone: phone ? `+381${phone}` : "",
    contact_instagram: instagram ? `@${instagram}` : "",
  } as WeddingData & { contact_phone: string; contact_instagram: string };

  await upsertCouple(slug, coupleData);

  // Set auth cookies (same pattern as /api/moje-vencanje/auth/[slug])
  const token = await new SignJWT({ slug, scope: "portal" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("480d")
    .sign(secret);

  const jar = await cookies();

  jar.set("moje_vencanje_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 480 * 24 * 60 * 60,
  });

  jar.set("moje_vencanje_slug", slug, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 480 * 24 * 60 * 60,
  });

  // Also set the pozivnica auth cookie — required by middleware to access
  // /pozivnica/[slug]/raspored-sedenja and similar. Mirrors the behavior of
  // /api/moje-vencanje/auth/[slug] so a draft couple who paid for raspored
  // doesn't have to log in twice.
  const pozivnicaToken = await new SignJWT({ slug })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("480d")
    .sign(secret);

  jar.set(`auth_${slug}`, pozivnicaToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/pozivnica/${slug}`,
    maxAge: 480 * 24 * 60 * 60,
  });

  return { ok: true, slug };
}
