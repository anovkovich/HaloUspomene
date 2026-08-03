import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import clientPromise from "@/lib/mongodb";



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
