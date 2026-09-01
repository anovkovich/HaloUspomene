import { NextRequest } from "next/server";
import { handleGalleryPhotos } from "@/lib/gallery/handlers";
import { resolveBirthdayGallery } from "@/lib/gallery/birthday-resolver";

/** GET /api/deciji-rodjendan/[slug]/galerija/photos?skip=&limit= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return handleGalleryPhotos(req, slug, resolveBirthdayGallery);
}
