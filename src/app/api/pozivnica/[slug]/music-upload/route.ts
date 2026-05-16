import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getWeddingData, patchCouple } from "@/lib/couples";

// Audio uploads can be larger and slower than image uploads — give the
// function a bit more headroom.
export const maxDuration = 30;
export const runtime = "nodejs";

// Public counterpart for the lead-gen form. Called once at submit time with
// the Blob we previously fetched via /api/pozivnica/music-fetch. Gated by
// the couple's `paid_for_music` flag (set by the create route from the
// extras checkbox). Cap is single-file: a couple has at most one background
// track at a time.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const weddingData = await getWeddingData(slug);
  if (!weddingData)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!weddingData.paid_for_music)
    return NextResponse.json(
      { error: "Background music not enabled" },
      { status: 403 },
    );
  if (weddingData.music_url) {
    return NextResponse.json(
      { error: "Music already uploaded" },
      { status: 409 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("audio") as File | null;
  if (!file)
    return NextResponse.json({ error: "Audio file required" }, { status: 400 });

  if (!file.type.startsWith("audio/"))
    return NextResponse.json(
      { error: "File must be an audio file" },
      { status: 400 },
    );

  // 10MB ceiling. A 6-min AAC at 192kbps is ~8.5MB; this gives a small buffer
  // for slightly higher bitrates without letting users push arbitrary blobs.
  if (file.size > 10 * 1024 * 1024)
    return NextResponse.json(
      { error: "File too large (max 10MB)" },
      { status: 413 },
    );

  const titleField = String(formData.get("title") || "").trim();
  const sourceUrlField = String(formData.get("source_url") || "").trim();

  // Derive extension from MIME type rather than file.name — the Blob the
  // client builds from a ReadableStream loses the original filename and
  // browsers default it to "blob".
  const ext = file.type.includes("mp4")
    ? "m4a"
    : file.type.includes("mpeg")
      ? "mp3"
      : file.type.includes("webm")
        ? "webm"
        : "audio";
  const pathname = `music/${slug}/song.${ext}`;

  let blob;
  try {
    blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });
  } catch (err) {
    console.error("Vercel Blob music upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  await patchCouple(slug, {
    music_url: blob.url,
    music_pathname: blob.pathname,
    music_title: titleField || undefined,
    music_source_url: sourceUrlField || undefined,
  });

  return NextResponse.json({
    ok: true,
    url: blob.url,
    pathname: blob.pathname,
  });
}
