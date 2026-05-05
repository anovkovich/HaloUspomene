import { NextRequest, NextResponse } from "next/server";
import {
  addStandaloneGuest,
  getStandaloneSeating,
} from "@/lib/standalone-seating";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public RSVP endpoint for standalone seating events. Guests scan a QR
// printed on a paper invitation and self-confirm — the new guest is
// appended to standalone_seatings.guests with no merge on duplicate name
// (the owner reviews duplicates in /gosti and decides what to do).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const seating = await getStandaloneSeating(slug);
  if (!seating) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!seating.active) {
    return NextResponse.json(
      { error: "RSVP nije aktivan." },
      { status: 403 },
    );
  }

  let body: {
    name?: string;
    attending?: string;
    guestCount?: number;
    message?: string;
    recaptcha_token?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

  try {
    await verifyRecaptcha(body.recaptcha_token, "rsvp", { remoteIp: ip });
  } catch (err) {
    if (err instanceof RecaptchaError) {
      return NextResponse.json(
        { error: "Provera neuspešna. Osvežite stranicu i pokušajte ponovo." },
        { status: 403 },
      );
    }
    throw err;
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Ime je obavezno." }, { status: 400 });
  }

  const attending = body.attending === "Ne" ? "Ne" : "Da";

  // Decliners are not stored — standalone seatings track only confirmed
  // attendees (the owner enters guests, no separate rsvp_responses table).
  if (attending === "Ne") {
    return NextResponse.json({ success: true, recorded: false });
  }

  const guestCount = Math.max(1, Math.floor(Number(body.guestCount) || 1));

  // Tag the guest so the owner can spot RSVP-originated entries at a glance
  // alongside ones they added manually or imported from Excel.
  const guest = await addStandaloneGuest(slug, {
    name,
    guestCount,
    category: "RSVP",
  });

  return NextResponse.json({ success: true, recorded: true, id: guest.id });
}
