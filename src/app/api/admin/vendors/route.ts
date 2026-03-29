import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getAllVendors, upsertVendor } from "@/lib/vendors";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function isAdmin(req: NextRequest) {
  const cookie = req.cookies.get("admin_token");
  if (!cookie) return false;
  try {
    await jwtVerify(cookie.value, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const vendors = await getAllVendors();
  return NextResponse.json(vendors);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, name, category, city } = body;

  if (!id || !name || !category || !city) {
    return NextResponse.json(
      { error: "id, name, category, and city are required" },
      { status: 400 },
    );
  }

  await upsertVendor(id, body);
  return NextResponse.json({ ok: true, id });
}
