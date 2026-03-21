import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getWeddingData } from "@/data/pozivnice";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) {
    return NextResponse.json({ error: "Pozivnica nije pronađena" }, { status: 404 });
  }

  if (!weddingData.potvrde_password) {
    return NextResponse.json(
      { error: "Lozinka nije podešena za ovu pozivnicu" },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };

  if (!password || password !== weddingData.potvrde_password) {
    return NextResponse.json({ error: "Pogrešna lozinka" }, { status: 401 });
  }

  const token = await new SignJWT({ slug, scope: "portal" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret);

  const response = NextResponse.json({
    ok: true,
    couple: {
      bride: weddingData.couple_names.bride,
      groom: weddingData.couple_names.groom,
      eventDate: weddingData.event_date,
    },
  });

  response.cookies.set("moje_vencanje_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });

  response.cookies.set("moje_vencanje_slug", slug, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  // Also set the pozivnica auth cookie so user doesn't need to re-login for portal/potvrde/raspored
  const pozivnicaToken = await new SignJWT({ slug })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret);

  response.cookies.set(`auth_${slug}`, pozivnicaToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/pozivnica/${slug}`,
    maxAge: 8 * 60 * 60,
  });

  return response;
}
