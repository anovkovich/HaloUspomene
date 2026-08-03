import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import {
  createHallVenue,
  listHallVenues,
  listHallVenueCities,
} from "@/lib/hall-venues";



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
