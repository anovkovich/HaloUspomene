/**
 * Client-side helper: swap an aging phone trust token for a fresh one right
 * before a long wizard submits.
 *
 * Why: the wizards ask for SMS verification on an early step and create the
 * invitation minutes-to-hours later. The trust token has a short TTL by design
 * (it is a one-shot proof, not a session), so a slow but perfectly legitimate
 * user used to hit "Verifikujte broj telefona pre slanja." on the last screen.
 *
 * /api/verify/refresh never sends an SMS — it only re-signs a token for a number
 * already in the 30-day `verified_phones` cache. If anything goes wrong (offline,
 * reCAPTCHA hiccup, cache expired) we return the token we already had: the submit
 * then behaves exactly as it does today, never worse.
 *
 * Client-only — do NOT import `@/lib/phone-verification` here, it pulls in MongoDB.
 */

export async function refreshPhoneTrustToken(input: {
  /** Primary phone in E.164, e.g. "+38161234567". */
  phoneE164: string;
  /** Token currently held in form state; returned unchanged on any failure. */
  currentToken: string;
  executeRecaptcha: (action: string) => Promise<string>;
}): Promise<string> {
  const { phoneE164, currentToken, executeRecaptcha } = input;
  if (!phoneE164) return currentToken;

  try {
    const recaptchaToken = await executeRecaptcha("verify_refresh");
    const res = await fetch("/api/verify/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneE164, recaptchaToken }),
    });
    if (!res.ok) return currentToken;
    const data = (await res.json().catch(() => ({}))) as { trustToken?: string };
    return data.trustToken || currentToken;
  } catch {
    return currentToken;
  }
}
