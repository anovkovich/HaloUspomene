import sharp from "sharp";

/**
 * Server-side image optimization for uploaded photos — the same trick the
 * vendor-logo and premium-illustration routes have always used, pulled into
 * one place so every upload path gets it.
 *
 * NOT a replacement for `src/lib/image-utils.ts`: that one runs in the browser
 * and does what sharp cannot here — decode iPhone HEIC (Vercel's sharp build
 * has no libheif) and shrink the file BEFORE it crosses the ~4.5MB request-body
 * limit. The two stack: browser downscales and de-HEICs, server re-encodes to
 * WebP for storage.
 */

export interface OptimizedImage {
  buffer: Buffer;
  contentType: string;
  extension: string;
  /** false when sharp failed and the original bytes are being passed through. */
  optimized: boolean;
}

interface Options {
  /** Longest side, px. Never enlarges. */
  maxSide?: number;
  quality?: number;
}

/**
 * Re-encodes to WebP (alpha preserved) and caps the longest side. Falls back to
 * the original bytes if sharp throws — a slightly fat photo beats a failed
 * upload, which is how `whiten-bg` has always handled it.
 */
export async function optimizeToWebp(
  input: ArrayBuffer,
  fallback: { contentType: string; extension: string },
  { maxSide = 1400, quality = 82 }: Options = {},
): Promise<OptimizedImage> {
  const original = Buffer.from(input);
  try {
    const buffer = await sharp(original)
      // Phone photos carry their orientation in EXIF, and sharp drops metadata
      // on re-encode — without this a portrait shot lands sideways.
      .rotate()
      .resize({
        width: maxSide,
        height: maxSide,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 4, alphaQuality: 95 })
      .toBuffer();
    return {
      buffer,
      contentType: "image/webp",
      extension: "webp",
      optimized: true,
    };
  } catch (err) {
    console.error("sharp optimization failed, storing original:", err);
    return {
      buffer: original,
      contentType: fallback.contentType || "application/octet-stream",
      extension: fallback.extension || "jpg",
      optimized: false,
    };
  }
}
