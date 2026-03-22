import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getAllBirthdays } from "@/lib/birthday";
import { getBirthdayRSVP } from "@/lib/birthday-rsvp";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function isAdmin(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get("admin_token");
  if (!cookie) return false;
  try {
    await jwtVerify(cookie.value, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const birthdays = await getAllBirthdays();
  const stats: Record<string, {
    rsvp: { attending: number; declined: number; totalGuests: number } | null;
  }> = {};

  await Promise.all(
    birthdays.map(async (b) => {
      try {
        const responses = await getBirthdayRSVP(b.slug);
        const attending = responses.filter((r) => r.attending === "Da");
        const declined = responses.filter((r) => r.attending === "Ne");
        const totalGuests = attending.reduce(
          (sum, r) => sum + (parseInt(r.guestCount) || 1),
          0,
        );
        stats[b.slug] = {
          rsvp: { attending: attending.length, declined: declined.length, totalGuests },
        };
      } catch {
        stats[b.slug] = { rsvp: null };
      }
    }),
  );

  return NextResponse.json(stats);
}
