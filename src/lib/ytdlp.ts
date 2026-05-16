import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, readFile, unlink, access, constants } from "node:fs/promises";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import path from "node:path";

const execFileAsync = promisify(execFile);

// Platform-specific binary name and download URL
const IS_WINDOWS = process.platform === "win32";
const BINARY_NAME = IS_WINDOWS ? "yt-dlp.exe" : "yt-dlp";
const YTDLP_PATH = path.join(tmpdir(), BINARY_NAME);

function getDownloadUrl(): string {
  switch (process.platform) {
    case "win32":
      return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
    case "darwin":
      return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos";
    default:
      return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";
  }
}

// Singleton promise — one download per process, not per request.
// Reset to null on failure so the next request can retry.
let ensurePromise: Promise<void> | null = null;

async function ensureYtDlp(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      try {
        await access(YTDLP_PATH, constants.X_OK);
        return; // already present and executable
      } catch {
        // not present — download from GitHub releases
      }

      const r = await fetch(getDownloadUrl(), {
        redirect: "follow",
        signal: AbortSignal.timeout(40_000),
      });
      if (!r.ok) throw new Error(`yt-dlp GitHub download returned HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      // mode 0o755 is ignored on Windows but harmless
      await writeFile(YTDLP_PATH, buf, { mode: 0o755 });
    })().catch((err) => {
      ensurePromise = null; // allow retry on next request
      throw err;
    });
  }
  return ensurePromise;
}

export interface YtAudioInfo {
  title: string;
  duration: number; // seconds
  audioUrl: string;
  mimeType: string;
}

export class YtDlpError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "LIVE"
      | "DURATION"
      | "NO_URL"
      | "PRIVATE"
      | "AGE"
      | "UNAVAILABLE"
      | "UNKNOWN",
    public readonly extra?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "YtDlpError";
  }
}

// TV player client doesn't require a PO token for regular public videos.
// Fallback to "default" if TV fails so we cover edge-case videos.
const EXTRACTOR_ARGS = "youtube:player_client=tv,default";

export interface YtDownloadResult {
  title: string;
  duration: number;
  buffer: Buffer;
  mimeType: string;
  ext: string;
}

// Downloads audio directly to disk, reads it into a Buffer, then cleans up.
// Bypasses CDN entirely — no server-to-server streaming from third-party CDNs.
export async function downloadYtAudio(youtubeUrl: string): Promise<YtDownloadResult> {
  await ensureYtDlp();

  const id = randomBytes(8).toString("hex");
  const outTemplate = path.join(tmpdir(), `yt-${id}.%(ext)s`);

  let stdout: string;
  let stderr = "";
  try {
    ({ stdout, stderr } = await execFileAsync(
      YTDLP_PATH,
      [
        "--no-playlist",
        "-f",
        "bestaudio[ext=m4a]/bestaudio[acodec=aac]/bestaudio",
        "--extractor-args",
        EXTRACTOR_ARGS,
        "--print",
        "%(title)s\t%(duration)s\t%(is_live)s",
        "--print",
        "after_move:%(filepath)s",
        "-o",
        outTemplate,
        youtubeUrl,
      ],
      { timeout: 50_000 },
    ));
  } catch (err) {
    const raw =
      (err as NodeJS.ErrnoException & { stderr?: string }).stderr ?? stderr ?? "";
    if (raw.includes("Private video")) throw new YtDlpError("Private", "PRIVATE");
    if (raw.includes("age-restricted") || raw.includes("age restricted"))
      throw new YtDlpError("Age restricted", "AGE");
    if (raw.includes("not available") || raw.includes("unavailable"))
      throw new YtDlpError("Unavailable", "UNAVAILABLE");
    console.error("yt-dlp download error:", raw.slice(0, 500));
    throw new YtDlpError(`yt-dlp failed: ${raw.slice(0, 300)}`, "UNKNOWN");
  }

  const lines = stdout.trim().split("\n").filter((l) => l.trim());
  const metaLine = lines[0] ?? "";
  const filePath = lines[lines.length - 1]?.trim() ?? "";

  const [rawTitle, durationStr, isLiveStr] = metaLine.split("\t");

  if (isLiveStr === "True") throw new YtDlpError("Live stream", "LIVE");

  const duration = Math.round(parseFloat(durationStr) || 0);
  if (duration === 0 || duration > 360) {
    throw new YtDlpError(`Duration ${duration}s`, "DURATION", { duration });
  }

  const ext = path.extname(filePath).slice(1) || "m4a";
  const mimeType =
    ext === "m4a" ? "audio/mp4" : ext === "webm" ? "audio/webm" : "audio/mpeg";

  let buffer: Buffer;
  try {
    buffer = await readFile(filePath);
  } catch {
    console.error("yt-dlp output file missing, filepath:", filePath, "stdout:", stdout.slice(0, 300));
    throw new YtDlpError("Downloaded file not found", "NO_URL");
  } finally {
    unlink(filePath).catch(() => {});
  }

  return {
    title: rawTitle || "Nepoznata pesma",
    duration,
    buffer,
    mimeType,
    ext,
  };
}

export async function getYtAudioInfo(youtubeUrl: string): Promise<YtAudioInfo> {
  await ensureYtDlp();

  let stdout: string;
  let stderr = "";
  try {
    ({ stdout, stderr } = await execFileAsync(
      YTDLP_PATH,
      [
        "--no-playlist",
        "--print",
        "%(title)s\t%(duration)s\t%(is_live)s\t%(url)s\t%(ext)s",
        "-f",
        "bestaudio[ext=m4a]/bestaudio[acodec=aac]/bestaudio",
        "--extractor-args",
        EXTRACTOR_ARGS,
        youtubeUrl,
      ],
      { timeout: 30_000 },
    ));
  } catch (err) {
    const raw =
      (err as NodeJS.ErrnoException & { stderr?: string }).stderr ?? stderr ?? "";
    if (raw.includes("Private video")) throw new YtDlpError("Private", "PRIVATE");
    if (raw.includes("age-restricted") || raw.includes("age restricted"))
      throw new YtDlpError("Age restricted", "AGE");
    if (raw.includes("not available") || raw.includes("unavailable"))
      throw new YtDlpError("Unavailable", "UNAVAILABLE");
    console.error("yt-dlp execFile error:", raw.slice(0, 500));
    throw new YtDlpError(`yt-dlp failed: ${raw.slice(0, 300)}`, "UNKNOWN");
  }

  const parts = stdout.trim().split("\t");
  const [rawTitle, durationStr, isLiveStr, audioUrl, ext] = parts;

  if (isLiveStr === "True") throw new YtDlpError("Live stream", "LIVE");

  const duration = Math.round(parseFloat(durationStr) || 0);
  if (duration === 0 || duration > 360) {
    throw new YtDlpError(`Duration ${duration}s`, "DURATION", { duration });
  }

  if (!audioUrl?.startsWith("http")) {
    console.error("yt-dlp no URL. stderr:", stderr.slice(0, 500));
    throw new YtDlpError("No audio URL returned by yt-dlp", "NO_URL");
  }

  const mimeType =
    ext === "m4a" ? "audio/mp4" : ext === "webm" ? "audio/webm" : "audio/mpeg";

  return {
    title: rawTitle || "Nepoznata pesma",
    duration,
    audioUrl,
    mimeType,
  };
}
