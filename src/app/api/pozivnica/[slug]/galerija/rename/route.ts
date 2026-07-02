import { NextRequest, NextResponse } from "next/server";
import { getWeddingData } from "@/lib/couples";
import { renameGalleryUploader } from "@/lib/gallery";
import { canGuestUpload } from "@/lib/gallery-lifecycle";

/**
 * POST /api/pozivnica/[slug]/galerija/rename
 *
 * A returning guest changed their name in the upload form — update the name on
 * all of THEIR photos. Scoped to the caller's own uploaderId (a random token
 * only their device holds), so it can't rename anyone else's photos.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const weddingData = await getWeddingData(slug);
  if (!weddingData?.paid_for_gallery) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canGuestUpload(weddingData.event_date)) {
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
