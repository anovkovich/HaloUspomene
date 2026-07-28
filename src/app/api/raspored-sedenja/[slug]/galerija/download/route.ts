import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import { getGalleryPhoto } from "@/lib/gallery";

/**
 * GET /api/raspored-sedenja/[slug]/galerija/download?id=<photoId>
 *
 * Same-origin download proxy (streams the R2 object with Content-Disposition:
 * attachment) for the owner portal. Owner-only: requires the `auth_seating_*`
 * PIN cookie — guests never download the full gallery.
 */

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function isOwner(req: NextRequest, slug: string): Promise<boolean> {
  const cookie = req.cookies.get(`auth_seating_${slug}`);
  if (!cookie) return false;
  try {
    await jwtVerify(cookie.value, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (!(await isOwner(req, slug))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seating = await getStandaloneSeating(slug);
  if (!seating?.paid_for_gallery) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const photo = await getGalleryPhoto(id);
  if (!photo || photo.slug !== slug) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(photo.url); // server-side, no CORS
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }

  const safe = (photo.guestName || "gost").replace(/[^a-zA-Z0-9-]+/g, "-");
  const ext = (photo.mimeType.split("/")[1] || "jpg").replace("jpeg", "jpg");

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": photo.mimeType || "image/jpeg",
      "Content-Disposition": `attachment; filename="${safe}-${id.slice(-6)}.${ext}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
