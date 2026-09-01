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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // No password required — issue token without checking
  if (!weddingData.potvrde_password) {
    const token = await new SignJWT({ slug })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(`auth_${slug}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: `/pozivnica/${slug}`,
      maxAge: 8 * 60 * 60,
    });
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };

  if (!password || password !== weddingData.potvrde_password) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await new SignJWT({ slug })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(`auth_${slug}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/pozivnica/${slug}`,
    maxAge: 8 * 60 * 60,
  });
  return response;
}
