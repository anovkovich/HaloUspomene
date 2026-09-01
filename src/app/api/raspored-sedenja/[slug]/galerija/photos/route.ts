import { NextRequest, NextResponse } from "next/server";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import { getGalleryPhotos, getGalleryPhotoCount } from "@/lib/gallery";

/**
 * GET /api/raspored-sedenja/[slug]/galerija/photos?skip=0&limit=48
 *
 * Standalone-seating twin of the couple gallery photos route. Public list of
 * approved photos, newest first.
 */

const DEFAULT_LIMIT = 48;
const MAX_LIMIT = 100;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const seating = await getStandaloneSeating(slug);
  if (!seating || !seating.active || !seating.paid_for_gallery) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const skip = Math.max(0, Number(url.searchParams.get("skip")) || 0);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(url.searchParams.get("limit")) || DEFAULT_LIMIT),
  );

  const [photos, total] = await Promise.all([
    getGalleryPhotos(slug, { limit, skip }),
    getGalleryPhotoCount(slug),
  ]);

  return NextResponse.json({
    photos,
    total,
    hasMore: skip + photos.length < total,
  });
}
