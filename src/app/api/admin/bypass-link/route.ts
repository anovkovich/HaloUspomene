import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { signBypassToken, COUNTRY_CONFIGS, type BypassCountry } from "@/lib/bypass-token";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function isAdmin(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get("admin_token");
  if (!cookie) return false;
  try {
    await jwtVerify(cookie.value, secret);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { country?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const country = body.country as BypassCountry | undefined;
  if (!country || !(country in COUNTRY_CONFIGS)) {
    return NextResponse.json({ error: "Nepoznata zemlja." }, { status: 400 });
  }

  const { token, tokenId } = await signBypassToken(country, {
    note: body.note?.trim() || undefined,
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    new URL(req.url).origin;
  const url = `${siteUrl}/napravi-pozivnicu?bypass=${encodeURIComponent(token)}`;

  return NextResponse.json({ url, token, tokenId, country });
}
