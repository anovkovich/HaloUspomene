import { NextRequest } from "next/server";
import { buildICS, parseLocalDate, type CalendarEvent } from "@/lib/calendar";

// Generated per-request from query params; never cache.
export const dynamic = "force-dynamic";

/**
 * Serves a single-event `.ics` file with the correct headers. Reached from the
 * "Apple / Outlook" option in AddToCalendar. Delivering the file from a real
 * URL (not a `data:` URI) is what makes "add to calendar" work on iOS Safari,
 * which opens the Calendar "Add Event" sheet on tap.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const start = parseLocalDate(sp.get("start") ?? "");
  if (!start) {
    return new Response("Missing or invalid 'start'", { status: 400 });
  }

  const endRaw = sp.get("end");
  const event: CalendarEvent = {
    title: (sp.get("title") ?? "Događaj").slice(0, 300),
    description: sp.get("desc")?.slice(0, 1000) || undefined,
    location: sp.get("loc")?.slice(0, 500) || undefined,
    start,
    end: endRaw ? parseLocalDate(endRaw) ?? undefined : undefined,
    allDay: sp.get("allday") === "1",
  };

  const ics = buildICS(event);
  const name =
    (sp.get("name") ?? "dogadjaj").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60) ||
    "dogadjaj";

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
