"use server";

import { headers } from "next/headers";
import { generateUniqueSlug, InvalidSlugInputError } from "@/lib/slug";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";
import {
  ensurePhoneVerified,
  normalizePhone,
} from "@/lib/phone-verification";
import { quickRegisterCouple } from "@/lib/quick-register";
import { sendExistingAccountCredentials } from "@/lib/planer/credentials-sms";

export type SignupResult =
  | { ok: true; slug: string }
  /** The verified number already has a planner account. One phone = one
   *  account, so nothing is created; the credentials go back by SMS instead. */
  | { ok: false; existing: true; sms: "sent" | "throttled" | "unavailable" }
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

  // One phone = one planner account. Runs only AFTER the number is verified, so
  // this can never be used to probe which numbers are registered, and the
  // credentials can only travel to a number whose owner just proved control of
  // it. An SMS failure still blocks the duplicate — the account state matters
  // more than the delivery.
  const recovery = await sendExistingAccountCredentials(phoneE164);
  if (recovery.status !== "no-account") {
    return { ok: false, existing: true, sms: recovery.status };
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
    // The E.164 form, not a hand-built "+381" + input: the same string the
    // one-account-per-phone lookup compares against, so every account created
    // here stays findable. Hand-concatenating kept a typed leading zero and
    // produced "+3810...", which no lookup would ever match.
    contact_phone: phoneE164,
    contact_instagram: instagram ? `@${instagram}` : "",
  } as WeddingData & { contact_phone: string; contact_instagram: string };

  // Persist + auto-login to the portal (shared QuickRegister mechanism).
  await quickRegisterCouple(slug, coupleData);

  return { ok: true, slug };
}
