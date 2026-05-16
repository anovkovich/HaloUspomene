import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { put, del } from "@vercel/blob";
import { getWeddingData, patchCouple, unsetCoupleFields } from "@/lib/couples";
import { downloadYtAudio, YtDlpError } from "@/lib/ytdlp";

export const maxDuration = 60;
export const runtime = "nodejs";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

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

function isYouTubeUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com\/(watch\?|shorts\/|live\/|embed\/)|youtu\.be\/)/.test(
    url,
  );
}

function mimeToExt(mime: string): string {
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("webm")) return "webm";
  return "mp3";
}

// POST accepts two payload shapes:
//   1. application/json { url }  — YouTube link, resolved via loader.to → yt-dlp
//   2. multipart/form-data { audio }  — direct file upload
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const weddingData = await getWeddingData(slug);
  if (!weddingData)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!weddingData.paid_for_music)
    return NextResponse.json(
      { error: "Background music not enabled — toggle paid_for_music first" },
      { status: 403 },
    );

  const contentType = req.headers.get("content-type") || "";

  // ── YouTube link path ────────────────────────────────────────────────────
  if (contentType.startsWith("application/json")) {
    let body: { url?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const url = body.url?.trim();
    if (!url || !isYouTubeUrl(url)) {
      return NextResponse.json(
        { error: "Validan YouTube link je obavezan." },
        { status: 400 },
      );
    }

    // Download audio to disk via yt-dlp, read into buffer.
    // Bypasses third-party CDN streaming which drops connections server-to-server.
    let ytResult: Awaited<ReturnType<typeof downloadYtAudio>>;
    try {
      ytResult = await downloadYtAudio(url);
    } catch (err) {
      if (err instanceof YtDlpError) {
        const msgs: Record<string, string> = {
          LIVE: "Live stream-ove nije moguće preuzeti.",
          DURATION: "Pesma je preduga (max 6 minuta).",
          PRIVATE: "Video je privatan.",
          AGE: "Video je uzrasno ograničen.",
          UNAVAILABLE: "Video nije dostupan.",
          NO_URL: "Ne možemo da preuzmemo ovaj video.",
          UNKNOWN: "Ne možemo da preuzmemo ovaj video.",
        };
        return NextResponse.json(
          { error: msgs[err.code] ?? "Ne možemo da preuzmemo ovaj video.", detail: err.message },
          { status: 502 },
        );
      }
      return NextResponse.json(
        { error: "Interna greška servera.", detail: String(err) },
        { status: 500 },
      );
    }

    if (ytResult.buffer.byteLength > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: `Audio prelazi limit od ${Math.round(MAX_AUDIO_BYTES / 1024 / 1024)}MB.` },
        { status: 413 },
      );
    }

    if (weddingData.music_pathname) {
      try {
        await del(weddingData.music_url || weddingData.music_pathname);
      } catch {
        /* swallow */
      }
    }

    const pathname = `music/${slug}/song.${ytResult.ext}`;
    let blob;
    try {
      blob = await put(pathname, ytResult.buffer, {
        access: "public",
        contentType: ytResult.mimeType,
        allowOverwrite: true,
      });
    } catch (err) {
      console.error("admin music blob put (yt) failed:", err);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    await patchCouple(slug, {
      music_url: blob.url,
      music_pathname: blob.pathname,
      music_title: ytResult.title || undefined,
      music_source_url: url,
    });

    return NextResponse.json({
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      title: ytResult.title,
    });
  }

  // ── Direct file upload path ───────────────────────────────────────────────
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
    return NextResponse.json({ error: "File must be audio" }, { status: 400 });
  if (file.size > MAX_AUDIO_BYTES)
    return NextResponse.json(
      { error: "File too large (max 10MB)" },
      { status: 413 },
    );

  const audioBuffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type;
  const title = String(formData.get("title") || "").trim();
  const sourceUrl = String(formData.get("source_url") || "").trim();
  const dotIdx = file.name.lastIndexOf(".");
  const extension =
    dotIdx > -1
      ? file.name.slice(dotIdx + 1).toLowerCase()
      : mimeToExt(mimeType);

  if (weddingData.music_pathname) {
    try {
      await del(weddingData.music_url || weddingData.music_pathname);
    } catch {
      /* swallow */
    }
  }

  const pathname = `music/${slug}/song.${extension}`;
  let blob;
  try {
    blob = await put(pathname, audioBuffer, {
      access: "public",
      contentType: mimeType,
      allowOverwrite: true,
    });
  } catch (err) {
    console.error("admin music blob put (file) failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  await patchCouple(slug, {
    music_url: blob.url,
    music_pathname: blob.pathname,
    music_title: title || undefined,
    music_source_url: sourceUrl || undefined,
  });

  return NextResponse.json({
    ok: true,
    url: blob.url,
    pathname: blob.pathname,
    title,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const weddingData = await getWeddingData(slug);
  if (!weddingData)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (weddingData.music_url) {
    try {
      await del(weddingData.music_url);
    } catch {
      /* continue */
    }
  }

  await unsetCoupleFields(slug, [
    "music_url",
    "music_pathname",
    "music_title",
    "music_source_url",
  ]);

  return NextResponse.json({ ok: true });
}
