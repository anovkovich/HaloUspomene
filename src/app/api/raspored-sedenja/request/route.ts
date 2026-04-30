import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";
import { ensurePhoneVerified, normalizePhone } from "@/lib/phone-verification";
import { createStandaloneSeating } from "@/lib/standalone-seating";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestPayload {
  name: string;
  phone: string;
  eventName: string;
  eventDate?: string;
  phoneTrustToken: string;
  recaptchaToken: string;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

// Public endpoint for the /raspored-sedenja landing page contact form.
// Verifies recaptcha + phone trust token, then auto-creates a standalone
// seating record with an auto-generated slug + 6-digit PIN. Returns the
// credentials so the client can include them in the admin notification email.
export async function POST(req: NextRequest) {
  let body: Partial<RequestPayload>;
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
      {
        error:
          "Telefon nije verifikovan. Verifikujte broj i pokušajte ponovo.",
      },
      { status: 403 },
    );
  }

  const name = (body.name ?? "").trim();
  const eventName = (body.eventName ?? "").trim();
  if (!name || !eventName) {
    return NextResponse.json(
      { error: "Popunite ime i tip eventa." },
      { status: 400 },
    );
  }
  if (eventName.length < 3) {
    return NextResponse.json(
      { error: "Ime eventa mora imati najmanje 3 karaktera." },
      { status: 400 },
    );
  }

  const seating = await createStandaloneSeating({
    ownerName: name,
    ownerPhone: phoneE164,
    eventName,
    eventDate: body.eventDate,
  });

  return NextResponse.json({
    ok: true,
    slug: seating.slug,
    password: seating.password,
  });
}
