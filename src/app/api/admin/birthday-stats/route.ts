import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getAllBirthdays } from "@/lib/birthday";
import { getBirthdayRSVP } from "@/lib/birthday-rsvp";
import { loadSeatingLayout } from "@/lib/seating";

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

interface BirthdayStats {
  rsvp: { attending: number; declined: number; totalGuests: number } | null;
  seating: { totalSeats: number; assignedSeats: number } | null;
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const birthdays = await getAllBirthdays();
  const stats: Record<string, BirthdayStats> = {};

  await Promise.all(
    birthdays.map(async (b) => {
      const entry: BirthdayStats = { rsvp: null, seating: null };

      try {
        const responses = await getBirthdayRSVP(b.slug);
        const attending = responses.filter((r) => r.attending === "Da");
        const declined = responses.filter((r) => r.attending === "Ne");
        const totalGuests = attending.reduce(
          (sum, r) => sum + (parseInt(r.guestCount) || 1),
          0,
        );
        entry.rsvp = {
          attending: attending.length,
          declined: declined.length,
          totalGuests,
        };
      } catch {
        // leave null
      }

      try {
        const tables = await loadSeatingLayout(b.slug);
        if (tables) {
          let totalSeats = 0;
          let assignedSeats = 0;
          for (const t of tables) {
            if (t.type === "decoration") continue;
            totalSeats += t.seats;
            assignedSeats += t.assignments.filter(Boolean).length;
          }
          entry.seating = { totalSeats, assignedSeats };
        }
      } catch {
        // leave null
      }

      stats[b.slug] = entry;
    }),
  );

  return NextResponse.json(stats);
}
