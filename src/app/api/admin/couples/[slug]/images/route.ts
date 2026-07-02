import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { put, del } from "@vercel/blob";
import { getWeddingData, patchCouple } from "@/lib/couples";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function isAdmin(req: NextRequest) {
  const cookie = req.cookies.get("admin_token");
  if (!cookie) return false;
  try {
    await jwtVerify(cookie.value, secret);
    return true;
  } catch {
    return false;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const weddingData = await getWeddingData(slug);
  if (!weddingData)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!weddingData.paid_for_images)
    return NextResponse.json({ error: "Images not enabled" }, { status: 403 });

  // Enforce 3-image cap
  const currentImages = weddingData.images ?? [];
  if (currentImages.length >= 3)
    return NextResponse.json(
      { error: "Maximum 3 images reached" },
      { status: 429 }
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

  // Validate MIME type
  if (!file.type.startsWith("image/"))
    return NextResponse.json(
      { error: "File must be an image" },
      { status: 400 }
    );

  // Validate size ≤ 5MB
  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json(
      { error: "File too large (max 5MB)" },
      { status: 413 }
    );

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const pathname = `images/${slug}/${timestamp}.${ext}`;

  let blob;
  try {
    blob = await put(pathname, file, { access: "public" });
  } catch (err) {
    console.error("Vercel Blob upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  // Append to images array
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const { url, pathname } = (await req.json()) as {
    url: string;
    pathname: string;
  };

  if (!url || !pathname)
    return NextResponse.json(
      { error: "url and pathname required" },
      { status: 400 }
    );

  // Delete from Vercel Blob — swallow errors (blob may already be gone)
  try {
    await del(url);
  } catch {
    /* continue */
  }

  // Remove from couple document
  const weddingData = await getWeddingData(slug);
  if (!weddingData)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updatedImages = (weddingData.images ?? []).filter(
    (img) => img.pathname !== pathname
  );
  await patchCouple(slug, { images: updatedImages });

  return NextResponse.json({ ok: true });
}
