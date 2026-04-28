import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";
import { ensurePhoneVerified, normalizePhone } from "@/lib/phone-verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEB3FORMS_KEY =
  process.env.WEB3FORMS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

interface ContactPayload {
  name: string;
  phone: string;
  date: string;
  location: string;
  howHeardAbout?: string;
  acceptedTerms: boolean;
  phoneTrustToken: string;
  recaptchaToken: string;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  if (!WEB3FORMS_KEY) {
    return NextResponse.json(
      { error: "Forma trenutno nije dostupna." },
      { status: 500 },
    );
  }

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

  const { name, date, location, howHeardAbout, acceptedTerms } = body;
  if (!name || !date || !location) {
    return NextResponse.json(
      { error: "Popunite sva obavezna polja." },
      { status: 400 },
    );
  }

  const formattedDate = new Date(date).toLocaleDateString("sr-Latn-RS", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const w3 = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `Retro Telefon - Nova rezervacija - ${name} - ${formattedDate}`,
      from_name: "HALO Uspomene",
      name,
      telefon: phoneE164,
      datum_dogadjaja: formattedDate,
      lokacija: location,
      kako_je_cuo: howHeardAbout || "Nije navedeno",
      paket: "Audio Guest Book",
      opsti_uslovi: acceptedTerms ? "Prihvaćeni" : "Nisu prihvaćeni",
    }),
  });
  const data = (await w3.json().catch(() => ({}))) as { success?: boolean; message?: string };

  if (!data.success) {
    return NextResponse.json(
      { error: data.message || "Slanje nije uspelo. Pokušajte ponovo." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
