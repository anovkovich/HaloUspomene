import { NextRequest, NextResponse } from "next/server";
import { getUploadUrl, galleryKey, publicUrl, isR2Configured } from "@/lib/r2";
import {
  addGalleryPhoto,
  getGalleryPhotos,
  getGalleryPhotoCount,
  getGalleryPhotoCountByIp,
  getGalleryPhotoCountByUploader,
  renameGalleryUploader,
} from "@/lib/gallery";
import { canGuestUpload } from "@/lib/gallery-lifecycle";

/**
 * Product-agnostic bodies for the guest-facing QR gallery routes.
 *
 * `gallery_photos` has always been keyed by a bare slug, so the storage layer
 * never cared which product a gallery belonged to — only the route wrappers
 * did, and they were copy-pasted per product. This module holds the body once;
 * a route supplies a `GalleryResolver` that answers "does this slug have a live
 * gallery, and when is its event".
 *
 * NOTE: the two older route trees (`/api/pozivnica/[slug]/galerija/*` and
 * `/api/raspored-sedenja/[slug]/galerija/*`) still carry their own inlined
 * copies. They serve live galleries holding real customer photos, so they were
 * deliberately left alone when this module was introduced for the birthday
 * products — migrating them is a separate, separately-testable change.
 */

export interface GalleryEntity {
  /** ISO date of the event; drives the upload / access / purge windows. */
  eventDate: string;
  /** Gallery add-on paid AND the product itself published. */
  enabled: boolean;
}

export type GalleryResolver = (slug: string) => Promise<GalleryEntity | null>;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

const ALLOWED_MIME = new Set(Object.keys(MIME_TO_EXT));

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PHOTOS_PER_SLUG = 3000; // abuse guard (300 guests x ~10 photos)
const MAX_PHOTOS_PER_UPLOADER = 50;
const MAX_PHOTOS_PER_IP = 500;

const DEFAULT_LIMIT = 48;
const MAX_LIMIT = 100;

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/** Shared preamble: R2 up, gallery exists and is paid, upload window open. */
async function gateForUpload(
  slug: string,
  resolve: GalleryResolver,
): Promise<{ error: NextResponse } | { ok: true }> {
  if (!isR2Configured()) {
    return {
      error: NextResponse.json(
        { error: "Galerija trenutno nije dostupna." },
        { status: 503 },
      ),
    };
  }
  const entity = await resolve(slug);
  if (!entity) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  if (!entity.enabled) {
    return {
      error: NextResponse.json(
        { error: "Galerija nije aktivirana." },
        { status: 403 },
      ),
    };
  }
  if (!canGuestUpload(entity.eventDate)) {
    return {
      error: NextResponse.json(
        {
          error:
            "Dodavanje fotografija je moguće samo na dan proslave i dan posle.",
        },
        { status: 403 },
      ),
    };
  }
  return { ok: true };
}

/** POST …/galerija/upload/sign — presigned R2 PUT URL. */
export async function handleGallerySign(
  req: NextRequest,
  slug: string,
  resolve: GalleryResolver,
): Promise<NextResponse> {
  const gate = await gateForUpload(slug, resolve);
  if ("error" in gate) return gate.error;

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
    return NextResponse.json({ uploadUrl, key, publicUrl: publicUrl(key) });
  } catch (err) {
    console.error("gallery sign failed:", slug, err);
    return NextResponse.json(
      { error: "Greška pri pripremi otpremanja." },
      { status: 500 },
    );
  }
}

/** POST …/galerija/upload/confirm — persist metadata after the browser PUT. */
export async function handleGalleryConfirm(
  req: NextRequest,
  slug: string,
  resolve: GalleryResolver,
): Promise<NextResponse> {
  const gate = await gateForUpload(slug, resolve);
  if ("error" in gate) return gate.error;

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

  if ((await getGalleryPhotoCount(slug)) >= MAX_PHOTOS_PER_SLUG) {
    return NextResponse.json({ error: "Galerija je puna." }, { status: 429 });
  }

  if (uploaderId) {
    const deviceCount = await getGalleryPhotoCountByUploader(slug, uploaderId);
    if (deviceCount >= MAX_PHOTOS_PER_UPLOADER) {
      return NextResponse.json(
        {
          error: `Dostigli ste maksimum od ${MAX_PHOTOS_PER_UPLOADER} fotografija.`,
        },
        { status: 429 },
      );
    }
  }

  const ip = clientIp(req);
  if (ip !== "unknown") {
    if ((await getGalleryPhotoCountByIp(slug, ip)) >= MAX_PHOTOS_PER_IP) {
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

/** GET …/galerija/photos?skip=&limit= — public list of approved photos. */
export async function handleGalleryPhotos(
  req: NextRequest,
  slug: string,
  resolve: GalleryResolver,
): Promise<NextResponse> {
  const entity = await resolve(slug);
  if (!entity || !entity.enabled) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sp = req.nextUrl.searchParams;
  const skip = Math.max(0, Number(sp.get("skip")) || 0);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(sp.get("limit")) || DEFAULT_LIMIT),
  );

  const [photos, total] = await Promise.all([
    getGalleryPhotos(slug, { skip, limit }),
    getGalleryPhotoCount(slug),
  ]);

  return NextResponse.json({ photos, total });
}

/** POST …/galerija/rename — a returning guest renames THEIR OWN photos. */
export async function handleGalleryRename(
  req: NextRequest,
  slug: string,
  resolve: GalleryResolver,
): Promise<NextResponse> {
  const gate = await gateForUpload(slug, resolve);
  if ("error" in gate) return gate.error;

  let body: { uploaderId?: string; guestName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const uploaderId = (body.uploaderId || "").trim().slice(0, 64);
  const guestName = (body.guestName || "").trim();
  // Scoped to the caller's own uploaderId — a random token only their device
  // holds — so it cannot rename anyone else's photos.
  if (!uploaderId) {
    return NextResponse.json({ error: "Nedostaje uploaderId" }, { status: 400 });
  }
  if (!guestName || guestName.length > 60) {
    return NextResponse.json({ error: "Unesite ime." }, { status: 400 });
  }

  const updated = await renameGalleryUploader(slug, uploaderId, guestName);
  return NextResponse.json({ success: true, updated });
}
