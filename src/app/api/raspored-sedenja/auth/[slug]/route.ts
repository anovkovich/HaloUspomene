import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import {
  isStandaloneActive,
  verifyStandalonePassword,
} from "@/lib/standalone-seating";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

const SESSION_DAYS = 120;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Treat disabled or non-existent records as 404 — never reveal which case it is
  // so brute-force probing can't enumerate valid slugs.
  const active = await isStandaloneActive(slug);
  if (!active) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Pogrešna lozinka" }, { status: 401 });
  }

  const ok = await verifyStandalonePassword(slug, password.trim());
  if (!ok) {
    return NextResponse.json({ error: "Pogrešna lozinka" }, { status: 401 });
  }

  const token = await new SignJWT({ slug, scope: "seating" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret);

  const response = NextResponse.json({ ok: true });
  // Path: "/" so the cookie also reaches /api/raspored-sedenja/{slug}/* routes
  // (e.g. import). The cookie name carries the slug so different sessions don't
  // collide; the API routes verify the JWT against the URL slug independently.
  response.cookies.set(`auth_seating_${slug}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return response;
}
