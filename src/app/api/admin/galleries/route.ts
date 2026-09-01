import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import { createStandaloneGalleryCouple } from "@/lib/standalone-gallery";
import { InvalidSlugInputError } from "@/lib/slug";

/**
 * Admin-created standalone QR gallery client.
 *
 * POST only — the tab reads its list from the couples the admin page already
 * fetches, and toggles/extend/delete all go through /api/admin/couples/[slug],
 * whose delete cascade already cleans up gallery photos and R2 objects.
 */

/** Serbian mobile numbers are typed either as +381… or as 06X…; the gallery
 *  lifecycle SMS is skipped unless the stored value starts with a +. */
function toE164(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.startsWith("+")
    ? trimmed.replace(/[^\d+]/g, "")
    : `+381${trimmed.replace(/\D/g, "").replace(/^0/, "")}`;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { name, phone, eventDate } = body as {
    name?: string;
    phone?: string;
    eventDate?: string;
  };

  if (!name || name.trim().length < 2) {
    return NextResponse.json(
      { error: "Ime klijenta je obavezno (min 2 karaktera)" },
      { status: 400 }
    );
  }

  // Required, unlike the self-serve form: the whole lifecycle (upload window,
  // access cutoff, purge) is computed from event_date, so a dateless record
  // would never enter it.
  if (!eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate.trim())) {
    return NextResponse.json(
      { error: "Datum događaja je obavezan" },
      { status: 400 }
    );
  }

  // Required for the same reason: without a phone the client never gets the
  // "last day of access" and "about to be deleted" SMS.
  const phoneE164 = toE164(phone ?? "");
  if (!/^\+\d{9,15}$/.test(phoneE164)) {
    return NextResponse.json(
      { error: "Telefon klijenta je obavezan i mora biti ispravan" },
      { status: 400 }
    );
  }

  try {
    const created = await createStandaloneGalleryCouple({
      name: name.trim(),
      phoneE164,
      eventDate: eventDate.trim(),
    });
    return NextResponse.json(created);
  } catch (err) {
    if (err instanceof InvalidSlugInputError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
