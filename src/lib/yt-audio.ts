/**
 * YouTube audio extraction with automatic fallback:
 *   1. loader.to  — free REST API, no binary needed, ~3-5s typical
 *   2. yt-dlp     — local/server binary, always up-to-date, ~5-10s warm
 *
 * Routes import getYouTubeAudio() and don't need to know which path ran.
 */

import { getYtAudioInfo, YtDlpError } from "@/lib/ytdlp";

export interface YtAudioResult {
  title: string;
  duration: number; // seconds — 0 when unknown (loader.to doesn't return it)
  audioUrl: string;
  mimeType: string;
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

// ── public entry point ───────────────────────────────────────────────────────

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
