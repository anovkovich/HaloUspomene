import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import { signBypassToken, COUNTRY_CONFIGS, type BypassCountry } from "@/lib/bypass-token";



export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { country?: string; note?: string; product?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const country = body.country as BypassCountry | undefined;
  if (!country || !(country in COUNTRY_CONFIGS)) {
    return NextResponse.json({ error: "Nepoznata zemlja." }, { status: 400 });
  }

  // Destination form. The signed token is path-independent (it only attests
  // country); this just picks which create page the link opens. Defaults to the
  // wedding invitation for backward compatibility.
  const PRODUCT_PATHS: Record<string, string> = {
    pozivnica: "/napravi-pozivnicu",
    deciji: "/napravi-deciju-pozivnicu",
    punoletstvo: "/napravi-punoletstvo",
    raspored: "/raspored-sedenja",
    galerija: "/qr-galerija-slika-sa-vencanja",
  };
  const product = body.product ?? "pozivnica";
  const path = PRODUCT_PATHS[product];
  if (!path) {
    return NextResponse.json({ error: "Nepoznat proizvod." }, { status: 400 });
  }

  const { token, tokenId } = await signBypassToken(country, {
    note: body.note?.trim() || undefined,
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    new URL(req.url).origin;
  const url = `${siteUrl}${path}?bypass=${encodeURIComponent(token)}`;

  return NextResponse.json({ url, token, tokenId, country, product });
}
