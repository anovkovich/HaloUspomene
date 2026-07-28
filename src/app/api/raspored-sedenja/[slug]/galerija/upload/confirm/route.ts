import { NextRequest, NextResponse } from "next/server";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import { publicUrl, isR2Configured } from "@/lib/r2";
import {
  addGalleryPhoto,
  getGalleryPhotoCount,
  getGalleryPhotoCountByIp,
  getGalleryPhotoCountByUploader,
} from "@/lib/gallery";
import { canGuestUpload } from "@/lib/gallery-lifecycle";

/**
 * POST /api/raspored-sedenja/[slug]/galerija/upload/confirm
 *
 * Standalone-seating twin of the couple confirm route. Persists metadata after
 * the browser PUTs the file to R2. Same caps + slug-prefix key ownership check.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PHOTOS_PER_SLUG = 2000;
const MAX_PHOTOS_PER_UPLOADER = 50;
const MAX_PHOTOS_PER_IP = 500;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!isR2Configured()) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  const seating = await getStandaloneSeating(slug);
  if (!seating) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!seating.active || !seating.paid_for_gallery) {
    return NextResponse.json({ error: "Nije aktivirano." }, { status: 403 });
  }
  if (!canGuestUpload(seating.eventDate)) {
    return NextResponse.json(
      { error: "Prozor za dodavanje fotografija je zatvoren." },
      { status: 403 },
    );
  }

  let body: {
    key?: string;
    guestName?: string;
    caption?: string;
    fileSize?: number;
    mimeType?: string;
    uploaderId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const key = (body.key || "").trim();
  const guestName = (body.guestName || "").trim();
  const caption = (body.caption || "").trim().slice(0, 200);
  const fileSize = Number(body.fileSize) || 0;
  const mimeType = (body.mimeType || "").toLowerCase();
  const uploaderId = (body.uploaderId || "").trim().slice(0, 64) || undefined;

  // Key must belong to this slug's prefix (prevents cross-slug injection).
  if (!key.startsWith(`gallery/${slug}/`)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }
  if (!guestName || guestName.length > 60) {
    return NextResponse.json({ error: "Unesite ime." }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(mimeType)) {
    return NextResponse.json({ error: "Nepodržan format." }, { status: 415 });
  }
  if (fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Fotografija je prevelika (maks. 10 MB)." },
      { status: 413 },
    );
  }

  const count = await getGalleryPhotoCount(slug);
  if (count >= MAX_PHOTOS_PER_SLUG) {
    return NextResponse.json({ error: "Galerija je puna." }, { status: 429 });
  }

  if (uploaderId) {
    const deviceCount = await getGalleryPhotoCountByUploader(slug, uploaderId);
    if (deviceCount >= MAX_PHOTOS_PER_UPLOADER) {
      return NextResponse.json(
        { error: `Dostigli ste maksimum od ${MAX_PHOTOS_PER_UPLOADER} fotografija.` },
        { status: 429 },
      );
    }
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown";
  if (ip !== "unknown") {
    const ipCount = await getGalleryPhotoCountByIp(slug, ip);
    if (ipCount >= MAX_PHOTOS_PER_IP) {
      return NextResponse.json(
        { error: "Previše fotografija sa ove mreže." },
        { status: 429 },
      );
    }
  }

  const id = await addGalleryPhoto(slug, {
    key,
    url: publicUrl(key), // reconstructed server-side, never trust client url
    guestName,
    caption,
    fileSize,
    mimeType,
    ip,
    uploaderId,
  });

  return NextResponse.json({ success: true, id });
}
