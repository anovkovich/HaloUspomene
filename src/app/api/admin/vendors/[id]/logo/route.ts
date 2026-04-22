import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { put, del } from "@vercel/blob";
import { getVendorById, patchVendor } from "@/lib/vendors";

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const vendor = await getVendorById(id);
  if (!vendor)
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json(
      { error: "File must be an image" },
      { status: 400 },
    );
  if (file.size > 2 * 1024 * 1024)
    return NextResponse.json(
      { error: "Image must be under 2MB" },
      { status: 400 },
    );

  // Delete the existing logo if one exists, to avoid orphaned blobs.
  if (vendor.logoUrl) {
    try {
      await del(vendor.logoUrl);
    } catch {
      // Non-fatal; proceed to upload the new one.
    }
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const pathname = `vendors/${id}/logo-${Date.now()}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
  });

  await patchVendor(id, { logoUrl: blob.url });

  return NextResponse.json({ url: blob.url });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const vendor = await getVendorById(id);
  if (!vendor)
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  if (vendor.logoUrl) {
    try {
      await del(vendor.logoUrl);
    } catch {
      // Non-fatal; clear the DB field regardless so the admin UI recovers.
    }
  }

  await patchVendor(id, { logoUrl: undefined });
  return NextResponse.json({ ok: true });
}
