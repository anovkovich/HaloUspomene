import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getBirthdayData } from "@/lib/birthday";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const data = await getBirthdayData(slug);

  if (!data || data.type !== "eighteenth") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Helper: build the auth response with BOTH cookies — punoletstvo session
  // for the portal, plus the deciji-rodjendan birthday cookie so the shared
  // /deciji-rodjendan/{slug}/raspored-sedenja editor (which the punoletstvo
  // portal links to) doesn't trigger a second login.
  async function buildAuthedResponse(): Promise<NextResponse> {
    const punoletstvoToken = await new SignJWT({ slug, scope: "punoletstvo" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);

    const birthdayToken = await new SignJWT({ slug, scope: "birthday" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(`auth_punoletstvo_${slug}`, punoletstvoToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: `/punoletstvo/${slug}`,
      maxAge: 8 * 60 * 60,
    });
    response.cookies.set(`auth_birthday_${slug}`, birthdayToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: `/deciji-rodjendan/${slug}`,
      maxAge: 8 * 60 * 60,
    });
    return response;
  }

  // No password required — issue tokens without checking
  if (!data.admin_password) {
    return buildAuthedResponse();
  }

  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };

  if (!password || password !== data.admin_password) {
    return NextResponse.json({ error: "Pogrešna lozinka" }, { status: 401 });
  }

  return buildAuthedResponse();
}
