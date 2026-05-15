/**
 * Bypass tokens — signed JWTs that let a user fill /napravi-pozivnicu without
 * passing the Serbia-only SMS verification step.
 *
 * Admin generates one of these for a specific foreign customer (BA/HR/ME/...),
 * sends the resulting URL via WhatsApp/email, and the customer opens it. The
 * form reads the token, swaps the phone prefix to the bypass country, hides the
 * SMS verification UI, and includes the token in the submit payload. The create
 * API re-verifies the token server-side as an alternative to phone_trust_token.
 *
 * Signed with JWT_SECRET (same secret used elsewhere in auth) — no extra env
 * var needed.
 */

import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret",
);
const ISSUER = "halouspomene-bypass";
const AUDIENCE = "halouspomene-form";
const DEFAULT_TTL = "24h";

export type BypassCountry = "BA" | "HR" | "ME" | "RS";

export interface CountryConfig {
  code: BypassCountry;
  callingCode: string; // "+387"
  label: string; // "Bosna i Hercegovina"
  // Mobile numbers without the calling code (national-significant length).
  // BA: 8 digits (6X XXX XXX), HR: 8-9, ME: 8, RS: 8-9. Range is generous on
  // purpose — SMS delivery is no longer the validator in bypass mode, so we
  // only sanity-check input length.
  minLocalDigits: number;
  maxLocalDigits: number;
}

export const COUNTRY_CONFIGS: Record<BypassCountry, CountryConfig> = {
  RS: {
    code: "RS",
    callingCode: "+381",
    label: "Srbija",
    minLocalDigits: 8,
    maxLocalDigits: 9,
  },
  BA: {
    code: "BA",
    callingCode: "+387",
    label: "Bosna i Hercegovina",
    minLocalDigits: 8,
    maxLocalDigits: 8,
  },
  HR: {
    code: "HR",
    callingCode: "+385",
    label: "Hrvatska",
    minLocalDigits: 8,
    maxLocalDigits: 9,
  },
  ME: {
    code: "ME",
    callingCode: "+382",
    label: "Crna Gora",
    minLocalDigits: 8,
    maxLocalDigits: 8,
  },
};

export interface BypassPayload {
  country: BypassCountry;
  tokenId: string;
  note?: string; // optional, e.g. customer name — for audit only
}

/**
 * Issue a fresh bypass JWT. Defaults to a 24-hour TTL.
 */
export async function signBypassToken(
  country: BypassCountry,
  options: { note?: string; ttl?: string } = {},
): Promise<{ token: string; tokenId: string }> {
  const tokenId = randomUUID();
  const token = await new SignJWT({
    country,
    tokenId,
    ...(options.note ? { note: options.note } : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(options.ttl || DEFAULT_TTL)
    .sign(SECRET);
  return { token, tokenId };
}

/**
 * Verify a bypass JWT. Throws on invalid/expired/malformed token.
 */
export async function verifyBypassToken(
  token: string | undefined | null,
): Promise<BypassPayload> {
  if (!token) throw new Error("Bypass token missing");
  const { payload } = await jwtVerify(token, SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  const country = payload.country;
  const tokenId = payload.tokenId;
  if (
    typeof country !== "string" ||
    !(country in COUNTRY_CONFIGS) ||
    typeof tokenId !== "string"
  ) {
    throw new Error("Bypass token payload malformed");
  }
  return {
    country: country as BypassCountry,
    tokenId,
    note: typeof payload.note === "string" ? payload.note : undefined,
  };
}
