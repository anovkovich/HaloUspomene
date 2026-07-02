import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getAllPhoneRentals, createPhoneRental } from "@/lib/phone-rentals";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await jwtVerify(token, JWT_SECRET);
    const rentals = await getAllPhoneRentals();
    return NextResponse.json(rentals);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await jwtVerify(token, JWT_SECRET);
    const body = await req.json();
    const rental = await createPhoneRental(body);
    return NextResponse.json(rental);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
