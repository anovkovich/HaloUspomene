import { NextRequest } from "next/server";
import { handleGalleryRename } from "@/lib/gallery/handlers";
import { resolveBirthdayGallery } from "@/lib/gallery/birthday-resolver";

/** POST /api/deciji-rodjendan/[slug]/galerija/rename */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return handleGalleryRename(req, slug, resolveBirthdayGallery);
}
