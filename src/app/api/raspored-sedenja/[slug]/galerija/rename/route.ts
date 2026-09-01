import { NextRequest, NextResponse } from "next/server";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import { renameGalleryUploader } from "@/lib/gallery";
import { canGuestUpload } from "@/lib/gallery-lifecycle";

/**
 * POST /api/raspored-sedenja/[slug]/galerija/rename
 *
 * Standalone-seating twin of the couple gallery rename route. A returning guest
 * changed their name — update all of THEIR photos (scoped to their uploaderId).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const seating = await getStandaloneSeating(slug);
  if (!seating || !seating.active || !seating.paid_for_gallery) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canGuestUpload(seating.eventDate)) {
    return NextResponse.json({ error: "Zatvoreno." }, { status: 403 });
  }

  let body: { uploaderId?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const uploaderId = (body.uploaderId || "").trim().slice(0, 64);
  const name = (body.name || "").trim().slice(0, 60);
  if (!uploaderId || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const updated = await renameGalleryUploader(slug, uploaderId, name);
  return NextResponse.json({ success: true, updated });
}
