/**
 * Helpers for the admin notification e-mail the creation wizards send via
 * Web3Forms after a successful create.
 *
 * The mail carries the whole create payload as "JSON podaci" so admin can
 * eyeball/replay what the customer submitted — but that payload also carries
 * live credentials (reCAPTCHA token, phone trust token, bypass token). Those
 * are authorization material, never data, so they are stripped before the JSON
 * leaves the browser.
 */

const SECRET_PAYLOAD_KEYS = new Set([
  "recaptcha_token",
  "phone_trust_token",
  "bypass_token",
]);

/** Pretty-printed create payload with all authorization tokens removed. */
export function redactPayloadForEmail(payload: unknown): string {
  return JSON.stringify(
    payload,
    (k, v) => (SECRET_PAYLOAD_KEYS.has(k) ? undefined : v),
    2,
  );
}
