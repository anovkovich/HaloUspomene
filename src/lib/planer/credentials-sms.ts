import { sendSms } from "@/lib/infobip";
import {
  findCoupleByPhone,
  markCredentialsSmsSent,
  type CouplePhoneMatch,
} from "@/lib/couples";

/**
 * Credential recovery for the quick-register flow.
 *
 * One phone = one planner account. When somebody who already has an account
 * fills the signup form again — the usual reason being a forgotten password —
 * we do not create a second couple. We SMS their existing slug and password
 * back to the number they just verified.
 *
 * The safety gate is the verification itself: `signupAction` only reaches this
 * after `ensurePhoneVerified`, so credentials can only ever travel to a number
 * whose owner proved control of it in the last hour. Nobody can probe which
 * numbers have accounts without first passing an OTP on that number.
 */

/** Repeat sends inside this window are refused — the message already went out,
 *  and a double form submit must not bill us for a second SMS. */
const RESEND_COOLDOWN_MS = 10 * 60 * 1000;

export type CredentialsSmsResult =
  | { status: "sent"; slug: string }
  | { status: "throttled"; slug: string }
  /** Account exists but carries no password (legacy/admin record) — nothing to
   *  send, and registering a duplicate is still wrong. Needs a human. */
  | { status: "unavailable"; slug: string }
  | { status: "no-account" };

/**
 * Diacritic-free with ASCII punctuation, same rule as `plannerReminderSms`: a
 * single `č` or an em-dash flips the encoding from GSM-7 (160 chars) to UCS-2
 * (70), tripling the cost of every send.
 *
 * Unlike the reminder SMS this one does carry a URL. The reminder can afford to
 * say "open your portal" because its reader knows where it is; this reader has
 * just told us they cannot get in, so the address is the point of the message.
 */
export function credentialsSms(slug: string, password: string): string {
  return (
    `HaloUspomene planer - nalog: ${slug}, lozinka: ${password}. ` +
    `Prijava: halouspomene.rs/moje-vencanje`
  );
}

function isThrottled(match: CouplePhoneMatch, now: Date): boolean {
  if (!match.credentialsSmsAt) return false;
  return now.getTime() - new Date(match.credentialsSmsAt).getTime() <
    RESEND_COOLDOWN_MS;
}

/**
 * Looks up the account on `phoneE164` and, if there is one, texts its
 * credentials back. Returns "no-account" when the number is free, which is the
 * caller's signal to go ahead and register.
 *
 * A failed send is deliberately NOT fatal: the caller must still refuse to
 * create a duplicate account, so the account state stays correct even when
 * Infobip is down. The stamp is written only after a send actually succeeds,
 * so a failure leaves the cooldown untouched and the next attempt can retry.
 */
export async function sendExistingAccountCredentials(
  phoneE164: string,
  now: Date = new Date(),
): Promise<CredentialsSmsResult> {
  const match = await findCoupleByPhone(phoneE164);
  if (!match) return { status: "no-account" };
  if (isThrottled(match, now)) return { status: "throttled", slug: match.slug };
  if (!match.password) return { status: "unavailable", slug: match.slug };

  try {
    await sendSms(phoneE164, credentialsSms(match.slug, match.password));
  } catch (err) {
    console.error("credentials SMS failed for", match.slug, err);
    return { status: "unavailable", slug: match.slug };
  }
  await markCredentialsSmsSent(match.slug);
  return { status: "sent", slug: match.slug };
}
