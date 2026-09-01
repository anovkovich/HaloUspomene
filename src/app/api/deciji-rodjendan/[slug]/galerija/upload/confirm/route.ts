import { NextRequest } from "next/server";
import { handleGalleryConfirm } from "@/lib/gallery/handlers";
import { resolveBirthdayGallery } from "@/lib/gallery/birthday-resolver";

/** POST /api/deciji-rodjendan/[slug]/galerija/upload/confirm */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return handleGalleryConfirm(req, slug, resolveBirthdayGallery);
}
