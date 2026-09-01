import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import { deleteVendorPromo, setPromoNote } from "@/lib/vendor-promos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Edits the note (for a friend code: whose it is). Only this one field is
 *  patchable — percent/maxUses are frozen once a code is out in the wild, since
 *  changing them after a checkout froze its discount would mis-price the order. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const { code } = await params;
  const updated = await setPromoNote(decodeURIComponent(code), body.note ?? "");
  if (!updated)
    return NextResponse.json({ error: "Nije pronađeno." }, { status: 404 });
  return NextResponse.json({ ok: true });
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
