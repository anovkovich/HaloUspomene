import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import clientPromise from "@/lib/mongodb";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await jwtVerify(token, JWT_SECRET);

    const body = await req.json();
    const { contact_name, receipt_valid } = body;

    if (!contact_name) {
      return NextResponse.json({ error: "contact_name required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("halouspomene");
    const col = db.collection("phone_rentals");

    const result = await col.findOneAndUpdate(
      { contact_name },
      { $set: { receipt_valid } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
