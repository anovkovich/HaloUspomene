import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

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
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const client = await clientPromise;
    await client
      .db("halouspomene")
      .collection("custom_receipts")
      .deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
}
