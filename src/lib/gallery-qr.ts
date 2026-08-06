/**
 * QR PNG pointing at the PUBLIC guest gallery page. Client-side only — the
 * `qrcode` package is imported dynamically so it stays out of the admin bundle.
 *
 * The production domain is hardcoded on purpose: this PNG gets printed on
 * thank-you cards and table signs, so a preview-deployment host would put a
 * dead URL in the client's hands.
 */
const GALLERY_QR_ORIGIN = "https://halouspomene.rs";

/** Public URL guests land on after scanning. Deliberately key-less: a printed
 *  QR must stay bound to the event day + the day after. */
export function galleryGuestUrl(slug: string): string {
  return `${GALLERY_QR_ORIGIN}/pozivnica/${slug}/galerija/`;
}

/** The link the couple forwards to guests. The `?k=` key additionally opens the
 *  upload window before the event — see `src/lib/gallery-key.ts`. */
export function galleryShareUrl(slug: string, key?: string | null): string {
  const base = galleryGuestUrl(slug);
  return key ? `${base}?k=${encodeURIComponent(key)}` : base;
}

/** Lucide "camera", 24×24 viewBox — body outline plus the lens circle. */
const CAMERA_BODY =
  "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z";

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * QR with a small camera badge punched into the middle, so a printed code reads
 * as "photos" at a glance instead of as an anonymous square.
 *
 * Error correction is forced to level H (~30% of the code recoverable). The
 * badge covers 22% of the width, i.e. under 5% of the area — an order of
 * magnitude inside what H tolerates, so scanning is unaffected.
 */
export async function galleryQrDataUrl(
  url: string,
  size = 1024
): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, url, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#232323", light: "#ffffff" },
  });

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");

  const s = canvas.width;
  const badge = s * 0.22;
  const bx = (s - badge) / 2;
  const by = (s - badge) / 2;

  // White plate so the glyph never sits on modules and stays legible.
  ctx.fillStyle = "#ffffff";
  roundedRect(ctx, bx, by, badge, badge, badge * 0.2);
  ctx.fill();

  // Camera drawn from the 24×24 lucide viewBox, scaled into the plate with padding.
  const pad = badge * 0.2;
  const glyph = badge - pad * 2;
  const scale = glyph / 24;

  ctx.save();
  ctx.translate(bx + pad, by + pad);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "#AE343F";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke(new Path2D(CAMERA_BODY));
  ctx.beginPath();
  ctx.arc(12, 13, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  return canvas.toDataURL("image/png");
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function downloadGalleryQR(slug: string): Promise<void> {
  try {
    const dataUrl = await galleryQrDataUrl(galleryGuestUrl(slug), 1024);
    triggerDownload(dataUrl, `galerija-qr-${slug}.png`);
  } catch {
    alert("Greška pri generisanju QR koda");
  }
}
