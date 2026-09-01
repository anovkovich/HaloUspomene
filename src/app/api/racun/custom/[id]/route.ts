import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const client = await clientPromise;
    const doc = await client
      .db("halouspomene")
      .collection("custom_receipts")
      .findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ valid: !!doc });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
