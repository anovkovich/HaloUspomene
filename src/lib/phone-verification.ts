/**
 * Phone verification primitives:
 * - libphonenumber-js validation + E.164 normalization (defaults to Serbia)
 * - JWT trust tokens (jose) signaling "this phone was verified, accept it for 15 min"
 * - Mongo helpers for verification_sessions, verified_phones
 *
 * Rate limit policy: 3 sends / IP / 10 minutes.
 * Verified-phones cache: 30 days. A re-verification within that window
 * short-circuits the OTP flow and returns a fresh trust token immediately.
 */

import { SignJWT, jwtVerify } from "jose";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import clientPromise from "./mongodb";
import { verifyBypassToken, type BypassCountry } from "./bypass-token";

const TRUST_SECRET_RAW =
  process.env.PHONE_VERIFY_JWT_SECRET || process.env.JWT_SECRET || "dev-secret";
const TRUST_SECRET = new TextEncoder().encode(TRUST_SECRET_RAW);
const TRUST_TTL = "15m";

const TRUST_ISSUER = "halouspomene-phone-verify";
const TRUST_AUDIENCE = "halouspomene-form";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
// Matches Infobip pinTimeToLive (5m). After this window Infobip rejects the
// PIN as expired anyway, so keeping the Mongo session record longer would only
// delay cleanup. Run scripts/migrate-verification-ttl.mjs once to update the
// existing TTL index when this value changes.
const SESSION_TTL_SECONDS = 5 * 60;
const VERIFIED_TTL_SECONDS = 30 * 24 * 60 * 60;

const DB_NAME = "halouspomene";

export interface VerificationSession {
  pinId: string;
  phone: string;
  ip: string;
  createdAt: Date;
}

export interface VerifiedPhone {
  phone: string;
  verifiedAt: Date;
  ip: string;
}

// ---------- Phone normalization ----------

// Per-country calling-code prefix for local-number fallback. Used when input
// arrives without a leading "+" — we assume the user typed it in the format
// they're used to (e.g. "061..." for RS, "061..." for BA).
const COUNTRY_CALLING_CODE: Record<CountryCode, string> = {
  RS: "381",
  BA: "387",
  HR: "385",
  ME: "382",
} as Partial<Record<CountryCode, string>> as Record<CountryCode, string>;

/**
 * Normalize a user-entered phone (e.g. "61 234 5678", "061234567", "+38161234567")
 * into E.164 (e.g. "+38161234567"). Returns null if the number is not a
 * plausible length for the given country.
 *
 * Uses libphonenumber-js's `isPossible()` (length-only check) instead of
 * the stricter `isValid()` (format-pattern match), because libphonenumber-js
 * metadata lags real-world Serbian numbering plans and rejects legitimate
 * 9-digit mobile numbers like 06XX XXX XXXX. SMS delivery is the real
 * validation step — the metadata pattern check is the wrong gate here.
 */
export function normalizePhone(
  input: string | undefined | null,
  defaultCountry: CountryCode = "RS",
): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const callingCode = COUNTRY_CALLING_CODE[defaultCountry] || "381";

  let candidate: string;
  if (trimmed.startsWith("+")) {
    candidate = trimmed;
  } else {
    // Tolerate user-entered local prefixes for the chosen country: bare digits,
    // "00<cc>...", "<cc>...", or leading "0XX" (national trunk prefix).
    const localDigits = trimmed
      .replace(/\D/g, "")
      .replace(new RegExp(`^00${callingCode}`), "")
      .replace(new RegExp(`^${callingCode}`), "")
      .replace(/^0+/, "");
    candidate = `+${callingCode}${localDigits}`;
  }
  const parsed = parsePhoneNumberFromString(candidate, defaultCountry);
  if (!parsed || !parsed.isPossible()) return null;
  return parsed.number;
}

// ---------- Trust token ----------

export async function signTrustToken(phoneE164: string): Promise<string> {
  return new SignJWT({ phone: phoneE164, scope: "phone_verified" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(TRUST_ISSUER)
    .setAudience(TRUST_AUDIENCE)
    .setExpirationTime(TRUST_TTL)
    .sign(TRUST_SECRET);
}

export async function verifyTrustToken(
  token: string | undefined | null,
  expectedPhoneE164?: string,
): Promise<{ phone: string }> {
  if (!token) throw new Error("Trust token missing");
  const { payload } = await jwtVerify(token, TRUST_SECRET, {
    issuer: TRUST_ISSUER,
    audience: TRUST_AUDIENCE,
  });
  const phone = typeof payload.phone === "string" ? payload.phone : null;
  if (!phone) throw new Error("Trust token missing phone claim");
  if (expectedPhoneE164 && phone !== expectedPhoneE164) {
    throw new Error("Trust token phone does not match submitted phone");
  }
  return { phone };
}

/**
 * Void-returning wrapper around verifyTrustToken for API-route guards that
 * only care whether the trust token is valid, not its payload.
 */
export async function ensurePhoneVerified(
  token: string | undefined | null,
  expectedPhoneE164: string,
): Promise<void> {
  await verifyTrustToken(token, expectedPhoneE164);
}

// ---------- Combined create-endpoint authorization ----------

/** Thrown by `resolvePhoneAuthorization` — carries the HTTP status + a
 *  ready-to-show Serbian message. API routes map it to NextResponse; server
 *  actions map it to `{ ok: false, error }`. */
export class PhoneAuthError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "PhoneAuthError";
  }
}

export interface PhoneAuthResult {
  /** E.164 number to persist / use downstream. */
  phoneE164: string;
  /** Country attested by the bypass token, or "RS" for the SMS path. */
  phoneCountry: BypassCountry;
  /** true = verified via SMS; false = accepted via admin bypass link. */
  phoneVerified: boolean;
  /** Bypass token id (for audit), or null on the SMS path. */
  bypassTokenId: string | null;
}

/**
 * Single authorization gate shared by every create endpoint (pozivnica,
 * deciji-rodjendan, punoletstvo, raspored, qr galerija). Two paths:
 *
 *   1. Bypass token — a signed link the admin issues to a foreign customer.
 *      Skips SMS entirely; the number is soft-accepted (≥6 digits) since the
 *      signed token, not SMS delivery, is the authorization. Admin can fix a
 *      malformed number by hand later.
 *   2. SMS trust token (default, Serbian numbers) — the number is normalized
 *      (RS) and must have passed OTP (`ensurePhoneVerified`).
 *
 * Throws `PhoneAuthError` (status + Serbian message) on any failure; the caller
 * never has to re-derive messages. `rawPhone` may be a single number or a
 * comma-separated list — only the first entry is authorized (the primary).
 */
export async function resolvePhoneAuthorization(input: {
  rawPhone: string | undefined | null;
  bypassToken?: string | null;
  phoneTrustToken?: string | null;
}): Promise<PhoneAuthResult> {
  const primaryRaw = String(input.rawPhone || "").split(",")[0]?.trim() || "";

  let bypassCountry: BypassCountry | null = null;
  let bypassTokenId: string | null = null;
  if (input.bypassToken) {
    try {
      const payload = await verifyBypassToken(input.bypassToken);
      bypassCountry = payload.country;
      bypassTokenId = payload.tokenId;
    } catch {
      throw new PhoneAuthError(403, "Bypass link nije važeći ili je istekao.");
    }
  }

  // "INT" isn't a libphonenumber country — the customer typed their own country
  // code into the number (it arrives with a leading "+"), so parsing keys off
  // that, not a default country. Fall back to RS for the parse hint; the soft
  // check below is the real acceptance gate for international numbers.
  const normCountry: CountryCode =
    bypassCountry && bypassCountry !== "INT" ? bypassCountry : "RS";
  let phoneE164 = normalizePhone(primaryRaw, normCountry);
  // Bypass mode: don't gate on libphonenumber's strict length check — accept a
  // typed value with a soft "at least 6 digits" sanity check.
  if (!phoneE164 && bypassTokenId && primaryRaw) {
    const digits = primaryRaw.replace(/\D/g, "");
    if (digits.length >= 6) {
      phoneE164 = primaryRaw.startsWith("+") ? primaryRaw : `+${digits}`;
    }
  }
  if (!phoneE164) {
    throw new PhoneAuthError(400, "Unesite važeći kontakt telefon.");
  }

  // The SMS gate stays MANDATORY whenever there is no valid bypass token — a
  // foreign link never weakens the domestic path.
  if (!bypassTokenId) {
    try {
      await ensurePhoneVerified(input.phoneTrustToken, phoneE164);
    } catch {
      throw new PhoneAuthError(403, "Verifikujte broj telefona pre slanja.");
    }
  }

  return {
    phoneE164,
    phoneCountry: bypassCountry || "RS",
    phoneVerified: !bypassTokenId,
    bypassTokenId,
  };
}

// ---------- Mongo helpers ----------

let indexesEnsured = false;
async function db() {
  const client = await clientPromise;
  const database = client.db(DB_NAME);
  if (!indexesEnsured) {
    indexesEnsured = true;
    await Promise.all([
      database
        .collection<VerificationSession>("verification_sessions")
        .createIndex({ createdAt: 1 }, { expireAfterSeconds: SESSION_TTL_SECONDS })
        .catch(() => {}),
      database
        .collection<VerificationSession>("verification_sessions")
        .createIndex({ pinId: 1 }, { unique: true })
        .catch(() => {}),
      database
        .collection<VerificationSession>("verification_sessions")
        .createIndex({ ip: 1, createdAt: -1 })
        .catch(() => {}),
      database
        .collection<VerifiedPhone>("verified_phones")
        .createIndex({ verifiedAt: 1 }, { expireAfterSeconds: VERIFIED_TTL_SECONDS })
        .catch(() => {}),
      database
        .collection<VerifiedPhone>("verified_phones")
        .createIndex({ phone: 1 }, { unique: true })
        .catch(() => {}),
    ]);
  }
  return database;
}

/**
 * Returns true if the given IP has hit the per-IP send limit.
 * Counts attempts (verification_sessions) created within the rate-limit window.
 */
export async function isRateLimited(ip: string): Promise<boolean> {
  const database = await db();
  const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const count = await database
    .collection<VerificationSession>("verification_sessions")
    .countDocuments({ ip, createdAt: { $gte: cutoff } });
  return count >= RATE_LIMIT_MAX;
}

export async function recordSession(
  pinId: string,
  phoneE164: string,
  ip: string,
): Promise<void> {
  const database = await db();
  await database.collection<VerificationSession>("verification_sessions").insertOne({
    pinId,
    phone: phoneE164,
    ip,
    createdAt: new Date(),
  });
}

export async function getSession(
  pinId: string,
): Promise<VerificationSession | null> {
  const database = await db();
  return database
    .collection<VerificationSession>("verification_sessions")
    .findOne({ pinId });
}

export async function markPhoneVerified(
  phoneE164: string,
  ip: string,
): Promise<void> {
  const database = await db();
  await database
    .collection<VerifiedPhone>("verified_phones")
    .updateOne(
      { phone: phoneE164 },
      { $set: { phone: phoneE164, verifiedAt: new Date(), ip } },
      { upsert: true },
    );
}

export async function isPhoneRecentlyVerified(phoneE164: string): Promise<boolean> {
  const database = await db();
  const found = await database
    .collection<VerifiedPhone>("verified_phones")
    .findOne({ phone: phoneE164 });
  return !!found;
}
