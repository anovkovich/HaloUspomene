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

// Region quick-picks + "INT" catch-all. INT means the customer types their full
// number INCLUDING their own country calling code (callingCode is just "+"), so
// a single option covers every remaining country (Austria, Australia, …) with
// zero per-country metadata. Safe because bypass mode never validates by
// country — the signed admin link authorizes the submission and the number is
// only soft-checked (≥6 digits).
export type BypassCountry = "BA" | "HR" | "ME" | "RS" | "MK" | "SI" | "INT";

export interface CountryConfig {
  code: BypassCountry;
  callingCode: string; // "+387" (region) or "+" (INT — customer types the rest)
  label: string; // "Bosna i Hercegovina"
  // Mobile numbers without the calling code (national-significant length).
  // Range is generous on purpose — SMS delivery is no longer the validator in
  // bypass mode, so we only sanity-check input length. INT spans the full E.164
  // range since the customer's own country code is part of what they type.
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
  MK: {
    code: "MK",
    callingCode: "+389",
    label: "Severna Makedonija",
    minLocalDigits: 8,
    maxLocalDigits: 8,
  },
  SI: {
    code: "SI",
    callingCode: "+386",
    label: "Slovenija",
    minLocalDigits: 8,
    maxLocalDigits: 8,
  },
  INT: {
    code: "INT",
    callingCode: "+",
    label: "Druga zemlja (međunarodni broj)",
    minLocalDigits: 6,
    maxLocalDigits: 15, // E.164 maximum, incl. the customer's own country code
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
 * Client-facing shape of a resolved bypass link — everything a create form
 * needs to render the no-SMS phone input with the right country prefix.
 */
export interface BypassInfo {
  token: string;
  country: BypassCountry;
  callingCode: string; // "+387"
  countryLabel: string; // "Bosna i Hercegovina"
}

/**
 * Verify a `?bypass=` URL param and shape it for the client forms. Returns
 * undefined on a missing/invalid/expired token, so the page just renders the
 * normal SMS form. Call this from every create page's server component.
 */
export async function resolveBypassInfo(
  token: string | undefined | null,
): Promise<BypassInfo | undefined> {
  if (!token) return undefined;
  try {
    const payload = await verifyBypassToken(token);
    const cfg = COUNTRY_CONFIGS[payload.country];
    return {
      token,
      country: payload.country,
      callingCode: cfg.callingCode,
      countryLabel: cfg.label,
    };
  } catch {
    return undefined;
  }
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
