import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getBirthdayData, patchBirthday } from "@/lib/birthday";

/** Same cap as the portal action and the wedding product: 3 polaroids. */
export const MAX_INVITATION_IMAGES = 3;

/**
 * Public counterpart of the admin `/api/admin/birthdays/[slug]/images` route,
 * shared by both proslava products (rodjendan + punoletstvo — one collection,
 * two routes). The builders call it right after create to push the photos the
 * client picked in the "Fotografije" step into Vercel Blob; at that moment no
 * session cookie exists yet, so the gate is the record itself:
 * `paid_for_images` must be on (the create route sets it from the step) and the
 * 3-photo cap must not be reached. Deliberately mirrors the wedding
 * `/api/pozivnica/[slug]/images-upload` posture.
 */
export async function handleBirthdayImageUpload(
  req: NextRequest,
  slug: string,
): Promise<NextResponse> {
  const b = await getBirthdayData(slug);
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!b.paid_for_images)
    return NextResponse.json({ error: "Images not enabled" }, { status: 403 });

  const current = b.images ?? [];
  if (current.length >= MAX_INVITATION_IMAGES)
    return NextResponse.json(
      { error: `Maximum ${MAX_INVITATION_IMAGES} images reached` },
      { status: 429 },
    );

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("image");
  if (!(file instanceof File))
    return NextResponse.json({ error: "Image file required" }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  let blob;
  try {
    blob = await put(`images/${slug}/${Date.now()}.${ext}`, file, {
      access: "public",
      contentType: file.type,
    });
  } catch (err) {
    console.error("Vercel Blob upload failed:", slug, err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  await patchBirthday(slug, {
    images: [...current, { url: blob.url, pathname: blob.pathname }],
  });

  return NextResponse.json({
    ok: true,
    url: blob.url,
    pathname: blob.pathname,
  });
}
