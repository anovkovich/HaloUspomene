"use server";

import { headers } from "next/headers";
import {
  createPhoneRental,
  countOccupied,
  getFullDates,
  getPhoneUnits,
} from "@/lib/phone-rentals";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";
import {
  resolvePhoneAuthorization,
  PhoneAuthError,
} from "@/lib/phone-verification";

export type CreateRentalResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Dates with no phone left — the form greys them out before the buyer picks
 *  one. Only dates leave the server; see getFullDates(). */
export async function loadFullDates(): Promise<string[]> {
  return getFullDates();
}

/**
 * Self-serve retro-phone reservation. Creates the `phone_rentals` row unpaid and
 * hands back its id; the buyer then pays at /placanje/telefon/[id]/ and the LS
 * webhook flips `paid`.
 *
 * The capacity check here is the authoritative one — the client only greys out
 * dates for a nicer form. It is re-checked at nothing later, so it must run
 * AFTER the phone is verified (an unverified visitor must not be able to burn
 * a date) and immediately BEFORE the insert.
 */
export async function createTelefonRental(input: {
  name: string;
  phone: string; // local part; the form prepends the calling code
  date: string; // ISO YYYY-MM-DD
  city: string;
  dobrodoslica?: boolean;
  recaptchaToken: string;
  phoneTrustToken?: string;
  /** Foreign-customer bypass link — skips SMS when present + valid. */
  bypassToken?: string;
}): Promise<CreateRentalResult> {
  const name = input.name.trim();
  if (name.length < 2) return { ok: false, error: "Unesite ime i prezime." };

  const date = (input.date || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, error: "Izaberite datum događaja." };
  }
  if (date < new Date().toISOString().slice(0, 10)) {
    return { ok: false, error: "Datum je u prošlosti." };
  }

  const city = input.city.trim();
  if (city.length < 2) {
    return { ok: false, error: "Unesite grad isporuke." };
  }

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  try {
    await verifyRecaptcha(input.recaptchaToken, "create_telefon", {
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
    if (err instanceof PhoneAuthError) return { ok: false, error: err.message };
    throw err;
  }

  // Capacity is per WEEKEND, not per day — a phone that leaves for Friday is not
  // back for Saturday. countOccupied() counts the whole Wed→Tue block.
  if ((await countOccupied(date)) >= (await getPhoneUnits())) {
    return {
      ok: false,
      error:
        "Za taj vikend su svi telefoni već rezervisani. Pišite nam — javićemo vam prvi slobodan termin.",
    };
  }

  const rental = await createPhoneRental({
    contact_name: name,
    rental_date: date,
    phone: phoneE164,
    city,
    // `city` stays the untouched record of what the buyer typed; `notes` is
    // seeded from it and is ours to edit — it is where the shipping details end
    // up (street, courier, who receives the phone).
    notes: `Lokacija (klijent): ${city}`,
    dobrodoslica: input.dobrodoslica || undefined,
    source: "self",
    paid: false,
  });

  return { ok: true, id: rental.id };
}
