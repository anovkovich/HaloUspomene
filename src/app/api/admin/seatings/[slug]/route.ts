import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  deleteStandaloneSeating,
  setStandaloneActive,
  getStandaloneSeating,
  patchStandaloneReceipt,
} from "@/lib/standalone-seating";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    active?: boolean;
    receipt_valid?: boolean;
    receipt_created?: string;
    custom_discount?: number;
  };

  const existing = await getStandaloneSeating(slug);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (typeof body.active === "boolean") {
    await setStandaloneActive(slug, body.active);
  }

  const receiptChanges: {
    receipt_valid?: boolean;
    receipt_created?: string;
    custom_discount?: number;
  } = {};
  if (typeof body.receipt_valid === "boolean")
    receiptChanges.receipt_valid = body.receipt_valid;
  if (typeof body.receipt_created === "string")
    receiptChanges.receipt_created = body.receipt_created;
  if (typeof body.custom_discount === "number")
    receiptChanges.custom_discount = body.custom_discount;
  if (Object.keys(receiptChanges).length > 0) {
    await patchStandaloneReceipt(slug, receiptChanges);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  await deleteStandaloneSeating(slug);
  return NextResponse.json({ ok: true });
}
