/**
 * Google reCAPTCHA v3 server-side verification.
 *
 * Site key is public (NEXT_PUBLIC_RECAPTCHA_SITE_KEY) and used by the client
 * loader. Secret key (RECAPTCHA_SECRET_KEY) is server-only and used here.
 *
 * Threshold: 0.5 is Google's recommended default. Below this we reject hard;
 * the client should show "Provera neuspešna, osvežite stranicu i pokušajte ponovo."
 */

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const DEFAULT_THRESHOLD = 0.5;

export type RecaptchaAction =
  | "verify_send"
  | "create_invitation"
  | "create_birthday"
  | "create_punoletstvo"
  | "rsvp"
  | "contact"
  | "quickstart";

export class RecaptchaError extends Error {
  constructor(
    message: string,
    public code:
      | "missing_token"
      | "missing_secret"
      | "low_score"
      | "action_mismatch"
      | "google_rejected"
      | "network",
  ) {
    super(message);
    this.name = "RecaptchaError";
  }
}

interface GoogleResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export async function verifyRecaptcha(
  token: string | undefined | null,
  expectedAction: RecaptchaAction,
  options: { threshold?: number; remoteIp?: string } = {},
): Promise<{ score: number }> {
  if (!token) {
    throw new RecaptchaError("reCAPTCHA token missing", "missing_token");
  }
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    throw new RecaptchaError("RECAPTCHA_SECRET_KEY not configured", "missing_secret");
  }

  const body = new URLSearchParams({ secret, response: token });
  if (options.remoteIp) body.set("remoteip", options.remoteIp);

  let data: GoogleResponse;
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });
    data = (await res.json()) as GoogleResponse;
  } catch {
    throw new RecaptchaError("reCAPTCHA network error", "network");
  }

  if (!data.success) {
    const errorCodes = (data["error-codes"] || []).join(", ") || "unknown";
    if (process.env.NODE_ENV !== "production") {
      console.error("[recaptcha] google rejected:", errorCodes, data);
    }
    throw new RecaptchaError(
      `reCAPTCHA rejected: ${errorCodes}`,
      "google_rejected",
    );
  }
  if (data.action && data.action !== expectedAction) {
    throw new RecaptchaError(
      `Action mismatch: got ${data.action}, expected ${expectedAction}`,
      "action_mismatch",
    );
  }
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;
  const score = data.score ?? 0;
  if (score < threshold) {
    throw new RecaptchaError(
      `reCAPTCHA score ${score} below ${threshold}`,
      "low_score",
    );
  }

  return { score };
}
