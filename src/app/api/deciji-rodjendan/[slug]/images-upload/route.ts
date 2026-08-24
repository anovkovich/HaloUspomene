import { NextRequest } from "next/server";
import { handleBirthdayImageUpload } from "@/lib/proslava/images-upload";

// Thin route — the logic is shared with the other proslava product.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return handleBirthdayImageUpload(req, slug);
}
