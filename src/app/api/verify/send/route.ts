import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";
import { sendVerificationCode, InfobipError } from "@/lib/infobip";
import {
  normalizePhone,
  isRateLimited,
  recordSession,
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
    await verifyRecaptcha(body.recaptchaToken, "verify_send", { remoteIp: ip });
  } catch (err) {
    if (err instanceof RecaptchaError) {
      console.error("[verify/send] reCAPTCHA failed:", err.code, err.message);
      return NextResponse.json(
        {
          error: "Provera neuspešna. Osvežite stranicu i pokušajte ponovo.",
          ...(process.env.NODE_ENV !== "production"
            ? { _debug: { code: err.code, message: err.message } }
            : {}),
        },
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

  if (await isPhoneRecentlyVerified(phoneE164)) {
    const trustToken = await signTrustToken(phoneE164);
    return NextResponse.json({ alreadyVerified: true, trustToken });
  }

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Previše pokušaja. Sačekajte 10 minuta." },
      { status: 429 },
    );
  }

  let pinId: string;
  try {
    pinId = await sendVerificationCode(phoneE164);
  } catch (err) {
    if (err instanceof InfobipError) {
      const status = err.code === "invalid_phone" ? 400 : 502;
      const msg =
        err.code === "invalid_phone"
          ? "Broj telefona nije ispravan."
          : err.code === "rate_limit"
            ? "Previše pokušaja na ovom broju. Pokušajte kasnije."
            : "Slanje SMS-a trenutno nije moguće.";
      return NextResponse.json({ error: msg }, { status });
    }
    throw err;
  }

  await recordSession(pinId, phoneE164, ip);
  return NextResponse.json({ pinId });
}
