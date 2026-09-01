import { NextRequest, NextResponse } from "next/server";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import { getUploadUrl, galleryKey, publicUrl, isR2Configured } from "@/lib/r2";
import { canGuestUpload } from "@/lib/gallery-lifecycle";

/**
 * POST /api/raspored-sedenja/[slug]/galerija/upload/sign
 *
 * Standalone-seating twin of the couple gallery sign route. Presigned R2 PUT
 * URL; gates on the seating's `paid_for_gallery` + upload window.
 */

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "Galerija trenutno nije dostupna." },
      { status: 503 },
    );
  }

  const seating = await getStandaloneSeating(slug);
  if (!seating) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!seating.active || !seating.paid_for_gallery) {
    return NextResponse.json(
      { error: "Galerija nije aktivirana." },
      { status: 403 },
    );
  }
  if (!canGuestUpload(seating.eventDate)) {
    return NextResponse.json(
      { error: "Dodavanje fotografija je moguće samo na dan događaja i dan posle." },
      { status: 403 },
    );
  }

  let body: { fileType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const fileType = (body.fileType || "").toLowerCase();
  const ext = MIME_TO_EXT[fileType];
  if (!ext) {
    return NextResponse.json(
      { error: "Nepodržan format. Dozvoljeni: JPG, PNG, WebP, HEIC." },
      { status: 415 },
    );
  }

  const key = galleryKey(slug, ext);

  try {
    const uploadUrl = await getUploadUrl(key, fileType);
    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl: publicUrl(key),
    });
  } catch (err) {
    console.error("standalone gallery sign failed:", err);
    return NextResponse.json(
      { error: "Greška pri pripremi otpremanja." },
      { status: 500 },
    );
  }
}
