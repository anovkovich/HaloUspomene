import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  createStandaloneSeating,
  listStandaloneSeatings,
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

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const seatings = await listStandaloneSeatings();
  return NextResponse.json(seatings);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { ownerName, ownerPhone, eventName, eventDate } = body as {
    ownerName?: string;
    ownerPhone?: string;
    eventName?: string;
    eventDate?: string;
  };

  if (!ownerName || ownerName.trim().length < 2) {
    return NextResponse.json(
      { error: "Ime klijenta je obavezno" },
      { status: 400 },
    );
  }
  if (!ownerPhone || ownerPhone.trim().length < 6) {
    return NextResponse.json(
      { error: "Broj telefona klijenta je obavezan" },
      { status: 400 },
    );
  }
  if (!eventName || eventName.trim().length < 3) {
    return NextResponse.json(
      { error: "Ime eventa je obavezno (min 3 karaktera)" },
      { status: 400 },
    );
  }

  const seating = await createStandaloneSeating({
    ownerName,
    ownerPhone,
    eventName,
    eventDate,
  });
  return NextResponse.json(seating);
}
