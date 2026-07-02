import { NextRequest, NextResponse } from "next/server";
import { getWeddingData } from "@/lib/couples";
import { getUploadUrl, galleryKey, publicUrl, isR2Configured } from "@/lib/r2";
import { canGuestUpload } from "@/lib/gallery-lifecycle";

/**
 * POST /api/pozivnica/[slug]/galerija/upload/sign
 *
 * Returns a presigned PUT URL so the guest's browser can upload a photo
 * directly to R2. Gates on `paid_for_gallery`. Metadata is saved separately
 * by /upload/confirm after the PUT succeeds.
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
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "Galerija trenutno nije dostupna." },
      { status: 503 }
    );
  }

  const weddingData = await getWeddingData(slug);
  if (!weddingData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!weddingData.paid_for_gallery) {
    return NextResponse.json(
      { error: "Galerija nije aktivirana." },
      { status: 403 }
    );
  }
  if (!canGuestUpload(weddingData.event_date)) {
    return NextResponse.json(
      { error: "Dodavanje fotografija je moguće samo na dan venčanja i dan posle." },
      { status: 403 }
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
      { status: 415 }
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
    console.error("gallery sign failed:", err);
    return NextResponse.json(
      { error: "Greška pri pripremi otpremanja." },
      { status: 500 }
    );
  }
}
