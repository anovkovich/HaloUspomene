import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import { getAllVendors, upsertVendor } from "@/lib/vendors";



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
