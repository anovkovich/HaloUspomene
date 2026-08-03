import { NextRequest, NextResponse } from "next/server";
import {
  addStandaloneGuest,
  getStandaloneSeating,
} from "@/lib/standalone-seating";
import { isPastSubmitDeadline } from "@/lib/rsvp-deadline";
import { addRSVPResponse } from "@/lib/rsvp";
import { verifyRecaptcha, RecaptchaError } from "@/lib/recaptcha";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public RSVP endpoint for standalone seating events. Guests scan a QR
// printed on a paper invitation and self-confirm.
//
// Every reply — attending or not — is logged to `rsvp_responses`, the same
// collection the wedding invitations use, so the organizer sees who declined
// instead of silently losing them. Attendees are ALSO appended to
// `standalone_seatings.guests` (no merge on duplicate name; the owner reviews
// duplicates in /gosti). Decliners deliberately never touch `guests[]`: that
// array is the seating chart's source of truth and `StandaloneRasporedRoot`
// treats every entry in it as attending.
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

  // The deadline belongs to the invitation add-on, so it binds only when that
  // add-on is sold — otherwise filling the admin modal for a customer who never
  // bought it would silently start rejecting replies on their QR-pano flow.
  // Seatings that predate the add-on have no deadline at all.
  if (
    isPastSubmitDeadline(
      seating.invitation?.submitUntil,
      seating.paid_for_invitation,
    )
  ) {
    return NextResponse.json(
      { error: "Rok za potvrdu dolaska je istekao." },
      { status: 410 },
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
  const details = body.message?.trim() || "";
  const guestCount =
    attending === "Da"
      ? Math.max(1, Math.floor(Number(body.guestCount) || 1))
      : 0;

  // Full reply log, decliners included.
  await addRSVPResponse(slug, { name, attending, guestCount, details });

  if (attending === "Ne") {
    return NextResponse.json({ success: true, recorded: true });
  }

  // Tag the guest so the owner can spot RSVP-originated entries at a glance
  // alongside ones they added manually or imported from Excel.
  const guest = await addStandaloneGuest(slug, {
    name,
    guestCount,
    category: "RSVP",
  });

  return NextResponse.json({ success: true, recorded: true, id: guest.id });
}
