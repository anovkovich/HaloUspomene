import jsPDF from "jspdf";
import QRCode from "qrcode";

/**
 * Generic A6 "thank-you" flyer with a QR code — ready to print. Used by the
 * standalone owner portal for the gallery / audio guest-book QR cards. Neutral
 * HALO-branded design (no wedding-specific hearts) so it fits any event type.
 *
 * Mirrors the structure of `generateAudioFlyerPDF` but takes the copy + URL as
 * arguments instead of hard-coding the wedding audio-book variant.
 */

const PRIMARY: [number, number, number] = [174, 52, 63]; // #AE343F
const TEXT: [number, number, number] = [35, 35, 35];
const TEXT_MUTED: [number, number, number] = [120, 120, 120];
const TEXT_FAINT: [number, number, number] = [160, 160, 160];

function blend(
  color: [number, number, number],
  opacity: number,
): [number, number, number] {
  return [
    Math.round(color[0] * opacity + 255 * (1 - opacity)),
    Math.round(color[1] * opacity + 255 * (1 - opacity)),
    Math.round(color[2] * opacity + 255 * (1 - opacity)),
  ];
}

async function loadFont(path: string): Promise<string> {
  const res = await fetch(path);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export interface QrFlyerInput {
  /** Event name in the script headline (e.g. "Maja & Ostoja"). */
  eventName: string;
  /** Absolute URL the QR encodes. */
  url: string;
  /** Big serif line under the name (e.g. "Podelite fotografije"). */
  title: string;
  /** 1–3 short instruction lines below the title. */
  lines: string[];
  /** Optional thank-you sentence under the event name (wraps automatically). */
  thankYou?: string;
  /** Optional primary-colored tagline near the bottom. */
  bottom?: string;
  /** Saved file name (without path). */
  filename: string;
}

export async function generateQrFlyerPDF(input: QrFlyerInput): Promise<void> {
  const { eventName, url, title, lines, thankYou, bottom, filename } = input;

  // A6: 105 x 148 mm
  const W = 105;
  const H = 148;
  const doc = new jsPDF({
    format: [W, H],
    orientation: "portrait",
    unit: "mm",
    compress: true,
  });
  const cx = W / 2;

  const [serifB64, sansB64, scriptB64] = await Promise.all([
    loadFont("/fonts/invitation/CormorantGaramond-Regular.ttf"),
    loadFont("/fonts/invitation/JosefinSans-Regular.ttf"),
    loadFont("/fonts/invitation/GreatVibes-Regular.ttf"),
  ]);
  doc.addFileToVFS("Serif.ttf", serifB64);
  doc.addFont("Serif.ttf", "Serif", "normal");
  doc.addFileToVFS("Sans.ttf", sansB64);
  doc.addFont("Sans.ttf", "Sans", "normal");
  doc.addFileToVFS("Script.ttf", scriptB64);
  doc.addFont("Script.ttf", "Script", "normal");

  // Neutral diamond divider (no wedding hearts).
  const drawDivider = (divY: number) => {
    const lineW = 18;
    doc.setDrawColor(...blend(PRIMARY, 0.3));
    doc.setLineWidth(0.2);
    doc.line(cx - lineW - 5, divY, cx - 4, divY);
    doc.line(cx + 4, divY, cx + lineW + 5, divY);
    doc.setFillColor(...blend(PRIMARY, 0.5));
    doc.triangle(cx - 2, divY, cx + 2, divY, cx, divY - 2, "F");
    doc.triangle(cx - 2, divY, cx + 2, divY, cx, divY + 2, "F");
  };

  // Clean white background with an elegant border frame (no pink tint).
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");
  const m = 5;
  doc.setDrawColor(...blend(PRIMARY, 0.28));
  doc.setLineWidth(0.5);
  doc.roundedRect(m, m, W - m * 2, H - m * 2, 3, 3, "S");
  doc.setDrawColor(...blend(PRIMARY, 0.16));
  doc.setLineWidth(0.2);
  doc.roundedRect(m + 2, m + 2, W - (m + 2) * 2, H - (m + 2) * 2, 2, 2, "S");

  drawDivider(16);

  // Event name
  doc.setFont("Script");
  doc.setFontSize(20);
  doc.setTextColor(...TEXT);
  doc.text(eventName, cx, 28, { align: "center" });

  let y = 35;

  // Thank-you line (wraps)
  if (thankYou) {
    doc.setFont("Serif");
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT_MUTED);
    const tyLines = doc.splitTextToSize(thankYou, W - 26) as string[];
    for (const line of tyLines) {
      doc.text(line, cx, y, { align: "center" });
      y += 4.4;
    }
    y += 1.5;
  }

  // Divider line
  doc.setDrawColor(...blend(PRIMARY, 0.3));
  doc.setLineWidth(0.3);
  doc.line(cx - 15, y, cx + 15, y);
  y += 8;

  // Title
  doc.setFont("Serif");
  doc.setFontSize(14);
  doc.setTextColor(...TEXT);
  doc.text(title, cx, y, { align: "center" });
  y += 7;

  // Instruction lines
  doc.setFont("Sans");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  for (const line of lines.slice(0, 3)) {
    doc.text(line, cx, y, { align: "center" });
    y += 4.5;
  }
  y += 4;

  // QR code (a touch smaller)
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 600,
    margin: 1,
    color: { dark: "#232323", light: "#ffffff" },
  });
  const qrSize = 38;
  const qrX = cx - qrSize / 2;
  const qrY = y;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 3, 3, "F");
  doc.setDrawColor(...blend(PRIMARY, 0.2));
  doc.setLineWidth(0.3);
  doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 3, 3, "S");
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // URL below QR
  doc.setFont("Sans");
  doc.setFontSize(5.5);
  doc.setTextColor(...TEXT_FAINT);
  doc.text(url, cx, qrY + qrSize + 5, { align: "center" });

  // Bottom tagline
  if (bottom) {
    doc.setFont("Serif");
    doc.setFontSize(10);
    doc.setTextColor(...PRIMARY);
    doc.text(bottom, cx, H - 16, { align: "center" });
  }

  drawDivider(H - 10);

  // Branding
  doc.setFont("Sans");
  doc.setFontSize(6);
  doc.setTextColor(...TEXT_FAINT);
  doc.text("halouspomene.rs", cx, H - 5, { align: "center" });

  doc.save(filename);
}
