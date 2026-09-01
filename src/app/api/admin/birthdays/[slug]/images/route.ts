import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import { put, del } from "@vercel/blob";
import { getBirthdayData, patchBirthday } from "@/lib/birthday";
import { optimizeToWebp } from "@/lib/image-optimize";

export const runtime = "nodejs";

// Mirrors /api/admin/couples/[slug]/images for birthday_events records.
// Blob pathname stays `images/${slug}/…` — the same namespace the wedding
// route uses, which is safe because slugs are unique across products.

const MAX_IMAGES = 3;

/** Both product routes read from birthday_events, so revalidate each. */
function revalidateBirthdayPaths(slug: string) {
  revalidatePath(`/deciji-rodjendan/${slug}`);
  revalidatePath(`/punoletstvo/${slug}`);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const birthday = await getBirthdayData(slug);
  if (!birthday)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  // "gallery" (default) appends to images[]; "emblem" replaces the hero seal.
  // The emblem is a look override, not the paid gallery, so it isn't gated.
  const slot = formData.get("slot") === "emblem" ? "emblem" : "gallery";
  const currentImages = birthday.images ?? [];

  if (slot === "gallery") {
    if (!birthday.paid_for_images)
      return NextResponse.json({ error: "Images not enabled" }, { status: 403 });
    if (currentImages.length >= MAX_IMAGES)
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES} images reached` },
        { status: 429 },
      );
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
  // WebP keeps the alpha channel, so the cut-out emblem survives the re-encode
  // — it just gets a tighter cap than a gallery photo, since it renders small.
  const optimized = await optimizeToWebp(
    await file.arrayBuffer(),
    { contentType: file.type, extension: ext },
    slot === "emblem" ? { maxSide: 800, quality: 88 } : undefined,
  );
  const prefix = slot === "emblem" ? "emblem" : "images";
  const pathname = `${prefix}/${slug}/${Date.now()}.${optimized.extension}`;

  let blob;
  try {
    blob = await put(pathname, optimized.buffer, {
      access: "public",
      contentType: optimized.contentType,
    });
  } catch (err) {
    console.error("Vercel Blob upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  if (slot === "emblem") {
    // Replacing the emblem — drop the previous one so blobs don't pile up.
    if (birthday.hero_emblem_url) {
      await del(birthday.hero_emblem_url).catch(() => {});
    }
    await patchBirthday(slug, { hero_emblem_url: blob.url });
  } else {
    await patchBirthday(slug, {
      images: [...currentImages, { url: blob.url, pathname: blob.pathname }],
    });
  }
  revalidateBirthdayPaths(slug);

  return NextResponse.json({
    ok: true,
    url: blob.url,
    pathname: blob.pathname,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const { url, pathname, slot } = (await req.json()) as {
    url?: string;
    pathname?: string;
    slot?: string;
  };

  const birthday = await getBirthdayData(slug);
  if (!birthday)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isEmblem = slot === "emblem";
  const targetUrl = isEmblem ? birthday.hero_emblem_url : url;

  if (!isEmblem && (!url || !pathname))
    return NextResponse.json(
      { error: "url and pathname required" },
      { status: 400 },
    );

  // Blob may already be gone — dropping the DB reference is what matters.
  if (targetUrl) {
    try {
      await del(targetUrl);
    } catch {
      /* continue */
    }
  }

  if (isEmblem) {
    await patchBirthday(slug, { hero_emblem_url: "" });
  } else {
    await patchBirthday(slug, {
      images: (birthday.images ?? []).filter((img) => img.pathname !== pathname),
    });
  }
  revalidateBirthdayPaths(slug);

  return NextResponse.json({ ok: true });
}
