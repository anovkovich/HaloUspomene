import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
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

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const client = await clientPromise;
    const docs = await client
      .db("halouspomene")
      .collection("custom_receipts")
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    return NextResponse.json(
      docs.map((d) => ({ ...d, id: d._id.toString(), _id: undefined }))
    );
  } catch (e) {
    console.error("custom_receipts GET:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { par, datum, items, ba } = await req.json();
    if (!par || !items?.length)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const client = await clientPromise;
    const result = await client
      .db("halouspomene")
      .collection("custom_receipts")
      .insertOne({ par, datum: datum || null, items, ba: ba ?? 0, created_at: new Date() });
    return NextResponse.json({ id: result.insertedId.toString() });
  } catch (e) {
    console.error("custom_receipts POST:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
