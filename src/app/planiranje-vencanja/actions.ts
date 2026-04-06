"use server";

import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { getWeddingData, upsertCouple } from "@/lib/couples";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret",
);
function slugify(bride: string, groom: string): string {
  return `${bride}-${groom}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/đ/g, "dj")
    .replace(/ž/g, "z")
    .replace(/č/g, "c")
    .replace(/ć/g, "c")
    .replace(/š/g, "s")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function resolveSlug(bride: string, groom: string): Promise<string> {
  const base = slugify(bride, groom);
  let candidate = base;
  let i = 2;

  while (await getWeddingData(candidate)) {
    candidate = `${base}-${i}`;
    i++;
  }

  return candidate;
}

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
}): Promise<SignupResult> {
  const bride = formData.bride.trim();
  const groom = formData.groom.trim();
  const password = formData.password.trim();
  const phone = formData.phone.trim().replace(/^\+?381/, "");
  const instagram = formData.instagram.trim().replace(/^@/, "");

  // Validation
  if (!bride || bride.length < 2)
    return { ok: false, error: "Ime mlade mora imati najmanje 2 karaktera" };
  if (!groom || groom.length < 2)
    return {
      ok: false,
      error: "Ime mladoženje mora imati najmanje 2 karaktera",
    };
  if (!phone && !instagram)
    return {
      ok: false,
      error: "Unesite broj telefona ili Instagram nalog",
    };
  if (phone && !/^0?6\d{7,8}$/.test(phone))
    return {
      ok: false,
      error: "Unesite validan srpski broj telefona (06X XXX XXXX)",
    };
  if (!password || password.length < 4)
    return { ok: false, error: "Lozinka mora imati najmanje 4 karaktera" };

  // Generate unique slug
  const slug = await resolveSlug(bride, groom);

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

  return { ok: true, slug };
}
