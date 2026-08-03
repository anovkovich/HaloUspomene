import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import { deleteVendorPromo } from "@/lib/vendor-promos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";



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
