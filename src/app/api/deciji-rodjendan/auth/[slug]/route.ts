import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getBirthdayData } from "@/data/rodjendani";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const data = await getBirthdayData(slug);

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // No password required — issue token without checking
  if (!data.admin_password) {
    const token = await new SignJWT({ slug, scope: "birthday" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(`auth_birthday_${slug}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: `/deciji-rodjendan/${slug}`,
      maxAge: 8 * 60 * 60,
    });
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };

  if (!password || password !== data.admin_password) {
    return NextResponse.json({ error: "Pogrešna lozinka" }, { status: 401 });
  }

  const token = await new SignJWT({ slug, scope: "birthday" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(`auth_birthday_${slug}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/deciji-rodjendan/${slug}`,
    maxAge: 8 * 60 * 60,
  });
  return response;
}
