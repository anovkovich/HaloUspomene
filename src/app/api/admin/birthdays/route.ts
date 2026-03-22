import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getAllBirthdays, upsertBirthday } from "@/lib/birthday";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function isAdmin(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get("admin_token");
  if (!cookie) return false;
  try {
    await jwtVerify(cookie.value, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const birthdays = await getAllBirthdays();
  return NextResponse.json(birthdays);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.slug || !body.data) {
    return NextResponse.json({ error: "slug and data required" }, { status: 400 });
  }

  await upsertBirthday(body.slug, body.data);
  return NextResponse.json({ ok: true });
}
