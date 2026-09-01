import { NextRequest, NextResponse } from "next/server";
import { verifyCode, InfobipError } from "@/lib/infobip";
import {
  getSession,
  markPhoneVerified,
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
  let body: { pinId?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const { pinId, code } = body;
  if (!pinId || !code) {
    return NextResponse.json(
      { error: "Unesite kod sa SMS-a." },
      { status: 400 },
    );
  }

  const session = await getSession(pinId);
  if (!session) {
    return NextResponse.json(
      { error: "Sesija je istekla. Pošaljite kod ponovo." },
      { status: 410 },
    );
  }

  let ok: boolean;
  try {
    ok = await verifyCode(pinId, code);
  } catch (err) {
    if (err instanceof InfobipError) {
      return NextResponse.json(
        { error: "Provera koda trenutno nije moguća." },
        { status: 502 },
      );
    }
    throw err;
  }

  if (!ok) {
    return NextResponse.json(
      { error: "Pogrešan kod. Pokušajte ponovo." },
      { status: 401 },
    );
  }

  await markPhoneVerified(session.phone, clientIp(req));
  const trustToken = await signTrustToken(session.phone);
  return NextResponse.json({ trustToken });
}
