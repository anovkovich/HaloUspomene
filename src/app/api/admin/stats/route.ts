import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getAllCouples } from "@/lib/couples";
import { getRSVPResponses } from "@/lib/rsvp";
import { loadSeatingLayout } from "@/lib/seating";
import { getAudioMessageCount } from "@/lib/audio";

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

export interface CoupleStats {
  rsvp: {
    attending: number;
    declined: number;
    totalGuests: number;
  } | null;
  seating: {
    totalSeats: number;
    assignedSeats: number;
  } | null;
  audio: {
    messageCount: number;
  } | null;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const couples = await getAllCouples();
  const statsMap: Record<string, CoupleStats> = {};

  await Promise.allSettled(
    couples.map(async (couple) => {
      const stats: CoupleStats = { rsvp: null, seating: null, audio: null };

      // RSVP stats (from MongoDB)
      try {
        const responses = await getRSVPResponses(couple.slug);
        const attending = responses.filter((r) => r.attending === "Da");
        const declined = responses.filter((r) => r.attending === "Ne");
        const totalGuests = attending.reduce(
          (sum, r) => sum + (Number(r.guestCount) || 1),
          0,
        );
        stats.rsvp = {
          attending: attending.length,
          declined: declined.length,
          totalGuests,
        };
      } catch {
        // leave null
      }

      // Seating stats (from MongoDB)
      try {
        const tables = await loadSeatingLayout(couple.slug);
        if (tables) {
          let totalSeats = 0;
          let assignedSeats = 0;
          for (const t of tables) {
            if (t.type === "decoration") continue;
            totalSeats += t.seats;
            assignedSeats += t.assignments.filter(Boolean).length;
          }
          stats.seating = { totalSeats, assignedSeats };
        }
      } catch {
        // leave null
      }

      // Audio stats
      try {
        const messageCount = await getAudioMessageCount(couple.slug);
        if (messageCount > 0) {
          stats.audio = { messageCount };
        }
      } catch {
        // leave null
      }

      statsMap[couple.slug] = stats;
    }),
  );

  return NextResponse.json(statsMap);
}
