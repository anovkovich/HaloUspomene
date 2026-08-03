import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  createHallVenue,
  listHallVenues,
  listHallVenueCities,
} from "@/lib/hall-venues";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function isAdmin(req: NextRequest) {
  const cookie = req.cookies.get("admin_token");
  if (!cookie) return false;
  try {
    // Role claim required, not just a valid signature: every token we issue
    // (couple sessions, phone-verification trust tokens) is signed with the
    // same key and must not reach admin data.
    const { payload } = await jwtVerify(cookie.value, secret);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [venues, cities] = await Promise.all([
    listHallVenues(),
    listHallVenueCities(),
  ]);
  return NextResponse.json({ venues, cities });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as {
      name?: string;
      city?: string;
      address?: string;
      firstHallName?: string;
    };

    const name = (body.name ?? "").trim();
    const city = (body.city ?? "").trim();
    if (name.length < 2)
      return NextResponse.json(
        { error: "Naziv sale je obavezan (min 2 karaktera)" },
        { status: 400 },
      );
    if (city.length < 2)
      return NextResponse.json(
        { error: "Grad je obavezan (min 2 karaktera)" },
        { status: 400 },
      );

    const venue = await createHallVenue({
      name,
      city,
      address: body.address,
      firstHallName: body.firstHallName,
    });
    return NextResponse.json(venue);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Greška pri kreiranju" },
      { status: 500 },
    );
  }
}
