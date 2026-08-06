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

export async function downloadGalleryQR(slug: string): Promise<void> {
  try {
    const QRCode = (await import("qrcode")).default;
    const dataUrl = await QRCode.toDataURL(galleryGuestUrl(slug), {
      width: 1024,
      margin: 2,
      color: { dark: "#232323", light: "#ffffff" },
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `galerija-qr-${slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    alert("Greška pri generisanju QR koda");
  }
}
