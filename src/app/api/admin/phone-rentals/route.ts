import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getAllPhoneRentals, createPhoneRental } from "@/lib/phone-rentals";


export async function GET(req: NextRequest) {
  try {
    if (!(await isAdminRequest(req)))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const rentals = await getAllPhoneRentals();
    return NextResponse.json(rentals);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminRequest(req)))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const rental = await createPhoneRental(body);
    return NextResponse.json(rental);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
