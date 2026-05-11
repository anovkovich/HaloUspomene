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
import { parsePhoneNumberFromString } from "libphonenumber-js";
import clientPromise from "./mongodb";

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
  defaultCountry: "RS" = "RS",
): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  let candidate: string;
  if (trimmed.startsWith("+")) {
    candidate = trimmed;
  } else {
    // Tolerate user-entered local prefixes: "381...", "00381...", "0XX..."
    const localDigits = trimmed
      .replace(/\D/g, "")
      .replace(/^00381/, "")
      .replace(/^381/, "")
      .replace(/^0+/, "");
    candidate = `+381${localDigits}`;
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
