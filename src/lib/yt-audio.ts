/**
 * YouTube audio extraction with automatic fallback:
 *   1. loader.to  — free REST API, no binary needed, ~3-5s typical
 *   2. yt-dlp     — local/server binary, always up-to-date, ~5-10s warm
 *
 * Routes import getYouTubeAudio() and don't need to know which path ran.
 */

import {
  getYtAudioInfo,
  downloadYtAudio,
  hasYtCookies,
  YtDlpError,
} from "@/lib/ytdlp";

export interface YtAudioResult {
  title: string;
  duration: number; // seconds — 0 when unknown (loader.to doesn't return it)
  audioUrl: string;
  mimeType: string;
}

export interface YtAudioBytes {
  title: string;
  buffer: Buffer;
  mimeType: string;
  ext: string;
  duration: number; // 0 when unknown (loader.to path)
}

// Re-export so routes can keep a single import for error handling
export { YtDlpError };

// ── loader.to ───────────────────────────────────────────────────────────────

async function viaLoaderTo(youtubeUrl: string): Promise<YtAudioResult> {
  const initRes = await fetch(
    `https://loader.to/ajax/download.php?format=m4a&url=${encodeURIComponent(youtubeUrl)}`,
    { signal: AbortSignal.timeout(12_000) },
  );
  if (!initRes.ok) throw new Error(`loader.to init HTTP ${initRes.status}`);

  const init: {
    success: boolean;
    id?: string;
    title?: string;
    info?: { title?: string };
    progress_url?: string;
  } = await initRes.json();

  if (!init.success || !init.id) throw new Error("loader.to: no job id");

  const title =
    init.title || init.info?.title || "Nepoznata pesma";
  const progressUrl =
    init.progress_url ||
    `https://p.savenow.to/api/progress?id=${init.id}`;

  // Poll up to ~21s (7 × 3s). loader.to typically finishes in 1-2 polls.
  for (let i = 0; i < 7; i++) {
    await new Promise((r) => setTimeout(r, 3_000));
    let prog: { download_url?: string | null };
    try {
      const progRes = await fetch(progressUrl, {
        signal: AbortSignal.timeout(8_000),
      });
      if (!progRes.ok) continue;
      prog = await progRes.json();
    } catch {
      continue;
    }
    if (prog.download_url) {
      return {
        title,
        duration: 0,
        audioUrl: prog.download_url,
        mimeType: "audio/mp4",
      };
    }
  }

  throw new Error("loader.to: timed out waiting for download URL");
}

// Download the actual audio bytes via loader.to (extraction happens on their
// servers, so it bypasses YouTube's bot wall against OUR IP).
async function bytesViaLoaderTo(youtubeUrl: string): Promise<YtAudioBytes> {
  const { title, audioUrl, mimeType } = await viaLoaderTo(youtubeUrl);
  const res = await fetch(audioUrl, { signal: AbortSignal.timeout(45_000) });
  if (!res.ok) throw new Error(`loader.to file download HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength < 2048)
    throw new Error("loader.to returned an empty/too-small file");
  const ext = mimeType.includes("mp4")
    ? "m4a"
    : mimeType.includes("webm")
      ? "webm"
      : "mp3";
  return { title, buffer, mimeType, ext, duration: 0 };
}

async function bytesViaYtDlp(
  youtubeUrl: string,
  timeoutMs?: number,
): Promise<YtAudioBytes> {
  const r = await downloadYtAudio(youtubeUrl, { timeoutMs });
  return {
    title: r.title,
    buffer: r.buffer,
    mimeType: r.mimeType,
    ext: r.ext,
    duration: r.duration,
  };
}

// ── public entry points ──────────────────────────────────────────────────────

export async function getYouTubeAudio(
  youtubeUrl: string,
): Promise<YtAudioResult> {
  // Primary: loader.to
  try {
    const result = await viaLoaderTo(youtubeUrl);
    return result;
  } catch (err) {
    console.warn(
      "[yt-audio] loader.to failed, trying yt-dlp:",
      (err as Error).message,
    );
  }

  // Fallback: yt-dlp (throws YtDlpError with typed codes)
  const info = await getYtAudioInfo(youtubeUrl);
  return { ...info };
}

/**
 * Downloads the audio bytes for a YouTube URL, resilient to YouTube's
 * datacenter-IP bot wall:
 *   - With cookies configured (YTDLP_COOKIES): prefer yt-dlp (fast, reliable,
 *     enforces duration/live rules), fall back to loader.to.
 *   - Without cookies: prefer loader.to (off-server extraction, dodges the bot
 *     wall), fall back to yt-dlp with a short timeout so the whole request fits
 *     inside the route's 60s budget.
 * Throws the LAST error (a typed YtDlpError when yt-dlp ran last) so callers can
 * map it to a user-facing message.
 */
export async function downloadYouTubeAudioBytes(
  youtubeUrl: string,
): Promise<YtAudioBytes> {
  const attempts: Array<() => Promise<YtAudioBytes>> = hasYtCookies()
    ? [() => bytesViaYtDlp(youtubeUrl), () => bytesViaLoaderTo(youtubeUrl)]
    : [() => bytesViaLoaderTo(youtubeUrl), () => bytesViaYtDlp(youtubeUrl, 22_000)];

  let lastErr: unknown;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (err) {
      lastErr = err;
      console.warn("[yt-audio] download attempt failed:", (err as Error).message);
    }
  }
  throw lastErr;
}
