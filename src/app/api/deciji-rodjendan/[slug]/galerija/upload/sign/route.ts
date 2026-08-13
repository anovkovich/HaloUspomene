import { NextRequest } from "next/server";
import { handleGallerySign } from "@/lib/gallery/handlers";
import { resolveBirthdayGallery } from "@/lib/gallery/birthday-resolver";

/** POST /api/deciji-rodjendan/[slug]/galerija/upload/sign — presigned R2 PUT.
 *  Serves punoletstvo too; both products share `birthday_events`. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return handleGallerySign(req, slug, resolveBirthdayGallery);
}
