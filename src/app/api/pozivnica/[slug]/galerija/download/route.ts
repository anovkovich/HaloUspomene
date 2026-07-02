import { NextRequest, NextResponse } from "next/server";
import { getWeddingData } from "@/lib/couples";
import { getGalleryPhoto } from "@/lib/gallery";

/**
 * GET /api/pozivnica/[slug]/galerija/download?id=<photoId>
 *
 * Same-origin download proxy: streams the R2 object back with a
 * Content-Disposition: attachment header. Avoids browser CORS entirely (a
 * direct fetch to the public r2.dev URL is cross-origin and can be blocked)
 * and forces a real download instead of opening the image — works on iOS too.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const weddingData = await getWeddingData(slug);
  if (!weddingData?.paid_for_gallery) {
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
