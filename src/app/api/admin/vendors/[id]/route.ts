import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { upsertVendor, deleteVendor, patchVendor, getVendorById } from "@/lib/vendors";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const vendor = await getVendorById(id);
  if (!vendor)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(vendor);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  await upsertVendor(id, data);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const updates = await req.json();
  await patchVendor(id, updates);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteVendor(id);
  return NextResponse.json({ ok: true });
}
