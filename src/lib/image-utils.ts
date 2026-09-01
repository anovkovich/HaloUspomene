/**
 * Client-side image pipeline for gallery uploads.
 *
 *   HEIC/HEIF  → JPEG (via heic2any / libheif WASM, so non-Safari browsers can
 *                display iPhone photos)
 *   any image  → downscaled JPEG (max 2560px longest side, q0.85) so we store
 *                ~0.5-1MB instead of the phone's 5-10MB originals
 *
 * Everything ends up as a JPEG File ready to PUT to R2. CPU-heavy (decode +
 * resize) — callers should show a "processing" state and run it sequentially.
 */

const MAX_DIMENSION = 2560; // longest side, px
const JPEG_QUALITY = 0.85;

const HEIC_MIMES = new Set(["image/heic", "image/heif"]);

export function isHeic(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (
    HEIC_MIMES.has(file.type.toLowerCase()) || ext === "heic" || ext === "heif"
  );
}

async function heicToJpeg(file: File): Promise<Blob> {
  // heic2any ships no types — import loosely.
  const mod = (await import("heic2any")) as unknown as {
    default: (opts: {
      blob: Blob;
      toType?: string;
      quality?: number;
    }) => Promise<Blob | Blob[]>;
  };
  const out = await mod.default({
    blob: file,
    toType: "image/jpeg",
    quality: JPEG_QUALITY,
  });
  return Array.isArray(out) ? out[0] : out;
}

async function downscaleToJpeg(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    throw new Error("canvas 2d context unavailable");
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

/**
 * Convert (if HEIC) + downscale to a JPEG File. Throws if the image can't be
 * decoded — callers should catch per-file and skip with a message.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  const source: Blob = isHeic(file) ? await heicToJpeg(file) : file;
  const resized = await downscaleToJpeg(source);
  const name = file.name.replace(/\.[^.]+$/, "") || "fotografija";
  return new File([resized], `${name}.jpg`, { type: "image/jpeg" });
}
