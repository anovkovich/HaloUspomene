import { NextRequest, NextResponse } from "next/server";
import { getBirthdayData } from "@/lib/birthday";
import { getGalleryPhoto } from "@/lib/gallery";
import { hasEventSession } from "@/lib/seating/action-auth";

/**
 * GET /api/deciji-rodjendan/[slug]/galerija/download?id=<photoId>
 *
 * Same-origin download proxy (streams the R2 object with Content-Disposition:
 * attachment) for the owner portal — guests never download the whole gallery.
 *
 * Auth goes through `hasEventSession`, which checks the `slug` CLAIM and not
 * just the signature: every token this app mints shares `JWT_SECRET`, so a bare
 * `jwtVerify` would accept one client's cookie for another client's photos.
 * `auth_birthday_${slug}` covers punoletstvo too — its login sets both cookies.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (!(await hasEventSession(`auth_birthday_${slug}`, slug))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const b = await getBirthdayData(slug);
  if (!b?.paid_for_gallery) {
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
