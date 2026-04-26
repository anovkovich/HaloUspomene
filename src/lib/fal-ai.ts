/**
 * AI image generation via Pollinations.ai (free endpoint).
 * Generates paper-craft style couple illustrations from text descriptions.
 */

export type AIGenerationErrorKind =
  | "rate_limit"
  | "service_unavailable"
  | "timeout"
  | "invalid_response"
  | "unknown";

export class AIGenerationError extends Error {
  kind: AIGenerationErrorKind;
  status?: number;
  constructor(kind: AIGenerationErrorKind, message: string, status?: number) {
    super(message);
    this.name = "AIGenerationError";
    this.kind = kind;
    this.status = status;
  }
}

/**
 * Build the sculpted cream-and-gold couple illustration prompt.
 *
 * Aesthetic: a hybrid between layered paper-cut and soft painterly
 * relief — cream and ivory tones with warm golden glow, soft sculpted
 * depth (not harsh cut edges), romantic and luminous. The couple
 * description is placed first with a strict "must match" instruction
 * so the model prioritises the user's features over style modifiers.
 *
 * Background is anchored to pure white so the downstream whiten-bg
 * (birefnet) step can cleanly remove it for a transparent RGBA PNG.
 */
function buildPaperCraftPrompt(coupleDescription: string): string {
  return [
    // Subject first — strict match on the user's description
    `European white wedding couple: ${coupleDescription}`,
    `bride and groom MUST accurately match the description above (hair color, hairstyle, dress, suit, beard)`,
    `fair skin, European Caucasian features`,
    `full body, centered, gentle romantic embrace`,
    // Style — layered cream paper sculpture / bas-relief
    `cream paper sculpture illustration, layered cream and ivory paper bas-relief art`,
    `couple as a cut paper foreground element placed on a simple stacked cream paper base, clean organic cut edges`,
    `delicate pencil and fine ink surface line details on dress folds, hair strands, and features`,
    `warm cream, ivory monochrome palette with subtle pale gold highlights`,
    `soft drop shadows between paper layers, visible paper thickness`,
    `stylized 2D paper art illustration, NOT photorealistic, NOT 3D render, NOT CGI, NOT photograph, NOT realistic faces`,
    // Demographic constraint
    `NOT Black people, NOT African, NOT dark skin tones`,
    // Background anchor for birefnet removal
    `isolated on pure solid white background #ffffff, no text, no extra people`,
  ].join(", ");
}

const RETRY_DELAYS_MS = [1500, 3000]; // 3 attempts total: try, wait 1.5s, try, wait 3s, try
const FETCH_TIMEOUT_MS = 90_000;

function classifyResponse(
  status: number,
  contentType: string | null,
): AIGenerationErrorKind | null {
  if (status === 429) return "rate_limit";
  if (status >= 500 && status <= 599) return "service_unavailable";
  if (status >= 200 && status < 300) {
    if (!contentType?.startsWith("image")) return "invalid_response";
    return null; // success
  }
  return "invalid_response";
}

async function attemptPollinations(
  pollinationsUrl: string,
): Promise<{ ok: true } | { ok: false; kind: AIGenerationErrorKind; status?: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(pollinationsUrl, {
      redirect: "follow",
      signal: controller.signal,
    });
    const kind = classifyResponse(res.status, res.headers.get("content-type"));
    if (kind === null) return { ok: true };
    return { ok: false, kind, status: res.status };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, kind: "timeout" };
    }
    return { ok: false, kind: "service_unavailable" };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generate a styled illustration using Pollinations.ai with retry + backoff.
 * Pollinations is a free, frequently-overloaded public endpoint, so transient
 * 429/5xx/timeout failures are common — retry a couple of times before
 * surfacing a typed error to the caller.
 */
export async function generateCoupleIllustration(
  coupleDescription: string,
): Promise<{ url: string }> {
  const prompt = buildPaperCraftPrompt(coupleDescription);
  const seed = Math.floor(Math.random() * 10000);
  const safePrompt = encodeURIComponent(prompt);
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${safePrompt}?nologo=true&seed=${seed}&width=1024&height=1024`;

  let lastFail: { kind: AIGenerationErrorKind; status?: number } = {
    kind: "unknown",
  };

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const result = await attemptPollinations(pollinationsUrl);
    if (result.ok) return { url: pollinationsUrl };
    lastFail = result;
    // Don't retry on invalid_response (likely a permanent issue with the prompt
    // or upstream config) — only retry transient failures.
    if (result.kind === "invalid_response") break;
    if (attempt < RETRY_DELAYS_MS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
    }
  }

  throw new AIGenerationError(
    lastFail.kind,
    `Pollinations failed: ${lastFail.kind}${lastFail.status ? ` (HTTP ${lastFail.status})` : ""}`,
    lastFail.status,
  );
}
