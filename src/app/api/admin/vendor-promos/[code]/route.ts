import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { deleteVendorPromo } from "@/lib/vendor-promos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await params;
  const deleted = await deleteVendorPromo(decodeURIComponent(code));
  if (!deleted)
    return NextResponse.json({ error: "Nije pronađeno." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
