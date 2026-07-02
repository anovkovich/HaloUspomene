import { NextRequest, NextResponse } from "next/server";
import { getYouTubeAudio, YtDlpError } from "@/lib/yt-audio";

// Increased from 30s — yt-dlp cold-start (binary download) can take ~15s.
export const maxDuration = 60;
export const runtime = "nodejs";

const ipMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000;

function isYouTubeUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com\/(watch\?|shorts\/|live\/|embed\/)|youtu\.be\/)/.test(
    url,
  );
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const entry = ipMap.get(ip);
  if (entry && now < entry.resetAt && entry.count >= RATE_LIMIT) {
    return NextResponse.json(
      { error: "Previše pokušaja. Pokušajte ponovo za sat vremena." },
      { status: 429 },
    );
  }
  if (!entry || now >= entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
  } else {
    entry.count++;
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = body.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "Nalepi YouTube link." }, { status: 400 });
  }
  if (!isYouTubeUrl(url)) {
    return NextResponse.json(
      { error: "Link nije validan YouTube URL." },
      { status: 400 },
    );
  }

  let info: Awaited<ReturnType<typeof getYouTubeAudio>>;
  try {
    info = await getYouTubeAudio(url);
  } catch (err) {
    if (err instanceof YtDlpError) {
      switch (err.code) {
        case "LIVE":
          return NextResponse.json(
            { error: "Live stream-ove nije moguće preuzeti." },
            { status: 422 },
          );
        case "DURATION": {
          const dur = (err.extra?.duration as number) ?? 0;
          return NextResponse.json(
            {
              error: `Pesma je duža od 6 minuta (${Math.ceil(dur / 60)} min). Izaberite kraću.`,
            },
            { status: 413 },
          );
        }
        case "PRIVATE":
          return NextResponse.json(
            { error: "Video je privatan i ne može se preuzeti." },
            { status: 422 },
          );
        case "AGE":
          return NextResponse.json(
            { error: "Video je uzrasno ograničen i ne može se preuzeti." },
            { status: 422 },
          );
        case "UNAVAILABLE":
          return NextResponse.json(
            { error: "Video nije dostupan." },
            { status: 422 },
          );
        default:
          console.error("yt-dlp unknown error:", err.message);
          return NextResponse.json(
            {
              error:
                "Ne možemo da preuzmemo ovu pesmu. Probajte drugi link ili kontaktirajte podršku.",
            },
            { status: 502 },
          );
      }
    }
    console.error("music-fetch unexpected error:", err);
    return NextResponse.json(
      { error: "Interna greška servera." },
      { status: 500 },
    );
  }

  // Proxy the YouTube CDN audio stream to the browser.
  // The signed CDN URL is valid from the same server IP that yt-dlp used.
  let audioRes: Response;
  try {
    audioRes = await fetch(info.audioUrl, { signal: AbortSignal.timeout(25_000) });
    if (!audioRes.ok || !audioRes.body) {
      throw new Error(`CDN returned ${audioRes.status}`);
    }
  } catch (err) {
    console.error("Audio CDN proxy failed:", err);
    return NextResponse.json(
      { error: "Greška pri preuzimanju audio stream-a." },
      { status: 502 },
    );
  }

  // X-Music-Title is Base64-UTF8 because HTTP headers are ASCII-only
  // and YouTube titles routinely contain Cyrillic / emoji / accented chars.
  const titleB64 = Buffer.from(info.title, "utf-8").toString("base64");

  return new Response(audioRes.body, {
    headers: {
      "Content-Type": info.mimeType,
      "Cache-Control": "no-store",
      "X-Music-Title": titleB64,
      "X-Music-Duration": String(info.duration),
    },
  });
}
