import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { patchPhoneRental, deletePhoneRental } from "@/lib/phone-rentals";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await jwtVerify(token, JWT_SECRET);
    const { id } = await params;
    const body = await req.json();
    const updated = await patchPhoneRental(id, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await jwtVerify(token, JWT_SECRET);
    const { id } = await params;
    const deleted = await deletePhoneRental(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
