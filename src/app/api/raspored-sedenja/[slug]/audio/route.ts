import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { put } from "@vercel/blob";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import { addAudioMessage, getAudioMessages } from "@/lib/audio";

/**
 * Standalone seating audio guest book. Parallels the couple route at
 * `/api/pozivnica/[slug]/audio` but gates on the `standalone_seatings` record
 * instead of a couple. Same slug-keyed `audio_messages` store + Vercel Blob.
 */

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

// GET — Admin-only: fetch audio messages for a slug.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const cookie = req.cookies.get("admin_token");
  if (!cookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await jwtVerify(cookie.value, secret);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const messages = await getAudioMessages(slug);
  return NextResponse.json(messages);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const seating = await getStandaloneSeating(slug);
  if (!seating) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!seating.active) {
    return NextResponse.json({ error: "Nije aktivno." }, { status: 403 });
  }
  if (!seating.paid_for_audio) {
    return NextResponse.json(
      { error: "Audio guest book not enabled" },
      { status: 403 },
    );
  }
  if (!seating.eventDate) {
    return NextResponse.json(
      { error: "Recording only available on the event day" },
      { status: 403 },
    );
  }

  // Date gate: only allow on the event day + the day after (same as couples).
  const now = new Date();
  const eventDate = new Date(seating.eventDate);
  eventDate.setHours(0, 0, 0, 0);
  const dayAfter = new Date(eventDate);
  dayAfter.setDate(dayAfter.getDate() + 1);
  dayAfter.setHours(23, 59, 59, 999);

  if (now < eventDate || now > dayAfter) {
    return NextResponse.json(
      { error: "Recording only available on the event day" },
      { status: 403 },
    );
  }

  // Cap at 100 recordings per slug.
  const existing = await getAudioMessages(slug);
  if (existing.length >= 100) {
    return NextResponse.json(
      { error: "Maximum recordings reached" },
      { status: 429 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const audioBlob = formData.get("audioBlob") as File | null;
  const guestName = (formData.get("guestName") as string)?.trim();
  const durationMs = parseInt(formData.get("durationMs") as string) || 0;

  if (!audioBlob) {
    return NextResponse.json({ error: "Audio file required" }, { status: 400 });
  }
  if (!guestName) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  if (audioBlob.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const timestamp = Date.now();
  const pathname = `audio/${slug}/${timestamp}.webm`;

  let blob;
  try {
    blob = await put(pathname, audioBlob, { access: "public" });
  } catch (err) {
    console.error("Vercel Blob upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed — BLOB_READ_WRITE_TOKEN may not be configured" },
      { status: 500 },
    );
  }

  const id = await addAudioMessage(slug, {
    guestName,
    blobUrl: blob.url,
    blobPathname: blob.pathname,
    durationMs,
  });

  return NextResponse.json({ success: true, id });
}
