import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import {
  MAX_UPLOAD_IMAGES,
  resolveUploadTarget,
  saveUploadImages,
} from "@/lib/upload-link-product";
import { recordUploadLinkUpload } from "@/lib/upload-links";
import { optimizeToWebp } from "@/lib/image-optimize";

export const runtime = "nodejs";

// Public, token-authenticated twin of /api/admin/{couples,birthdays}/[slug]/images.
// The token IS the credential — there is no cookie here — so every handler
// re-resolves the product from the token and never trusts a slug from the body.
//
// 4MB cap (the admin routes allow 5MB): Vercel rejects a request body over
// ~4.5MB before it reaches this handler, and the client downscales to
// ~0.5-1MB anyway, so a lower cap turns an opaque platform 413 into our own
// Serbian error message.
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const target = await resolveUploadTarget(token);
  if (!target)
    return NextResponse.json({ error: "Link nije važeći" }, { status: 404 });
  if (!target.enabled)
    return NextResponse.json(
      { error: "Galerija nije uključena" },
      { status: 403 },
    );
  if (target.images.length >= MAX_UPLOAD_IMAGES)
    return NextResponse.json(
      { error: `Maksimalno ${MAX_UPLOAD_IMAGES} slike` },
      { status: 429 },
    );

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev" }, { status: 400 });
  }

  const file = formData.get("image") as File | null;
  if (!file)
    return NextResponse.json({ error: "Slika je obavezna" }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json(
      { error: "Fajl mora biti slika" },
      { status: 400 },
    );
  if (file.size > MAX_BYTES)
    return NextResponse.json(
      { error: "Slika je prevelika (najviše 4MB)" },
      { status: 413 },
    );

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const optimized = await optimizeToWebp(await file.arrayBuffer(), {
    contentType: file.type,
    extension: ext,
  });
  const pathname = `images/${target.link.slug}/${Date.now()}.${optimized.extension}`;

  let blob;
  try {
    blob = await put(pathname, optimized.buffer, {
      access: "public",
      contentType: optimized.contentType,
    });
  } catch (err) {
    console.error("Vercel Blob upload failed:", err);
    return NextResponse.json({ error: "Otpremanje nije uspelo" }, { status: 500 });
  }

  const images = [
    ...target.images,
    { url: blob.url, pathname: blob.pathname },
  ];
  await saveUploadImages(target.link, images);
  await recordUploadLinkUpload(token).catch(() => {});

  return NextResponse.json({ ok: true, images });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const target = await resolveUploadTarget(token);
  if (!target)
    return NextResponse.json({ error: "Link nije važeći" }, { status: 404 });

  const { pathname } = (await req.json().catch(() => ({}))) as {
    pathname?: string;
  };
  if (!pathname)
    return NextResponse.json({ error: "pathname je obavezan" }, { status: 400 });

  // Only a photo that currently belongs to THIS product can be deleted — the
  // pathname from the body never reaches the blob store unmatched.
  const victim = target.images.find((img) => img.pathname === pathname);
  if (!victim)
    return NextResponse.json({ error: "Slika ne postoji" }, { status: 404 });

  try {
    await del(victim.url);
  } catch {
    /* blob may already be gone — dropping the DB reference is what matters */
  }

  const images = target.images.filter((img) => img.pathname !== pathname);
  await saveUploadImages(target.link, images);

  return NextResponse.json({ ok: true, images });
}
