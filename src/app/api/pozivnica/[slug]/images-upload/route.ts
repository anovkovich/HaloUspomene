import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getWeddingData, patchCouple } from "@/lib/couples";

// Public counterpart of the admin /api/admin/couples/[slug]/images endpoint.
// Called from the lead-gen form (/napravi-pozivnicu) right after couple
// creation to push the user-selected files into Vercel Blob. The couple must
// already have `paid_for_images: true` (set by the create route from the form
// checkbox); cap is derived per-tier (3 classic, 2 Fountain).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const weddingData = await getWeddingData(slug);
  if (!weddingData)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!weddingData.paid_for_images)
    return NextResponse.json(
      { error: "Images not enabled" },
      { status: 403 },
    );

  const isFountain =
    weddingData.premium === true && weddingData.premium_theme === "fountain";
  const cap = isFountain ? 2 : 3;

  const currentImages = weddingData.images ?? [];
  if (currentImages.length >= cap)
    return NextResponse.json(
      { error: `Maximum ${cap} images reached` },
      { status: 429 },
    );

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("image") as File | null;
  if (!file)
    return NextResponse.json({ error: "Image file required" }, { status: 400 });

  if (!file.type.startsWith("image/"))
    return NextResponse.json(
      { error: "File must be an image" },
      { status: 400 },
    );

  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json(
      { error: "File too large (max 5MB)" },
      { status: 413 },
    );

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const pathname = `images/${slug}/${timestamp}.${ext}`;

  let blob;
  try {
    blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });
  } catch (err) {
    console.error("Vercel Blob upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const updatedImages = [
    ...currentImages,
    { url: blob.url, pathname: blob.pathname },
  ];
  await patchCouple(slug, { images: updatedImages });

  return NextResponse.json({
    ok: true,
    url: blob.url,
    pathname: blob.pathname,
  });
}
