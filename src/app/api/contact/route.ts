import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";
import { ensurePhoneVerified, normalizePhone } from "@/lib/phone-verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ContactPayload {
  phone: string;
  phoneTrustToken: string;
  recaptchaToken: string;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

// Verification-only endpoint. Web3Forms is called from the client because
// Cloudflare in front of api.web3forms.com blocks server-side requests from
// Vercel. Client-side submission is the only path that reliably delivers.
export async function POST(req: NextRequest) {
  let body: Partial<ContactPayload>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const ip = clientIp(req);

  try {
    await verifyRecaptcha(body.recaptchaToken, "contact", { remoteIp: ip });
  } catch (err) {
    if (err instanceof RecaptchaError) {
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

  try {
    await ensurePhoneVerified(body.phoneTrustToken, phoneE164);
  } catch {
    return NextResponse.json(
      { error: "Telefon nije verifikovan. Verifikujte broj i pokušajte ponovo." },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true });
}
