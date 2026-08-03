import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import { getAllBirthdays, upsertBirthday } from "@/lib/birthday";



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
