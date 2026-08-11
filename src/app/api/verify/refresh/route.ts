/**
 * Silent trust-token refresh.
 *
 * The long wizards (/napravi-pozivnicu, /napravi-deciju-pozivnicu,
 * /napravi-punoletstvo) verify the phone on an early step and submit much
 * later; the trust token can age out in between. Instead of asking an already
 * verified user for a second SMS code, the client calls this right before
 * submit and gets a fresh token for the SAME number.
 *
 * NEVER sends an SMS. A token is issued only for a number already sitting in
 * `verified_phones` (30-day cache) — exactly the guarantee the `alreadyVerified`
 * branch of /api/verify/send already gives, so this opens no new door. reCAPTCHA
 * gates it; there is deliberately no send-rate-limit here because nothing is
 * sent and nothing is charged.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";
import {
  normalizePhone,
  isPhoneRecentlyVerified,
  signTrustToken,
} from "@/lib/phone-verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function POST(req: NextRequest) {
  let body: { phone?: string; recaptchaToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const ip = clientIp(req);

  try {
    await verifyRecaptcha(body.recaptchaToken, "verify_refresh", {
      remoteIp: ip,
    });
  } catch (err) {
    if (err instanceof RecaptchaError) {
      console.error("[verify/refresh] reCAPTCHA failed:", err.code, err.message);
      return NextResponse.json(
        { error: "Provera neuspešna. Osvežite stranicu i pokušajte ponovo." },
        { status: 403 },
      );
    }
    throw err;
  }

  const phoneE164 = normalizePhone(body.phone);
  if (!phoneE164) {
    return NextResponse.json(
      { error: "Unesite važeći broj telefona." },
      { status: 400 },
    );
  }

  if (!(await isPhoneRecentlyVerified(phoneE164))) {
    return NextResponse.json(
      { error: "Verifikujte broj telefona ponovo." },
      { status: 403 },
    );
  }

  return NextResponse.json({ trustToken: await signTrustToken(phoneE164) });
}
