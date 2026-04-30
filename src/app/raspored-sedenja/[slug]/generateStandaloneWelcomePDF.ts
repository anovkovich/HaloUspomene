import jsPDF from "jspdf";
import QRCode from "qrcode";

// HALO Uspomene brand palette
const PRIMARY: [number, number, number] = [174, 52, 63]; // #AE343F
const TEXT: [number, number, number] = [35, 35, 35]; // #232323
const TEXT_MUTED: [number, number, number] = [60, 60, 60];
const TEXT_LIGHT: [number, number, number] = [120, 120, 120];

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
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export interface StandaloneWelcomePDFInput {
  slug: string;
  eventName: string;
}

/** B1 portrait welcome sign for standalone events.
 *  Mirrors the wedding generateWelcomePDF layout but with HALO Uspomene
 *  brand colors and "Dobrodošli na {eventName}" as the headline. */
export async function generateStandaloneWelcomePDF(
  input: StandaloneWelcomePDFInput,
): Promise<void> {
  const { slug, eventName } = input;

  const W = 707;
  const H = 1000;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [W, H],
  });
  const cx = W / 2;

  const [scriptB64, serifB64, sansB64] = await Promise.all([
    loadFont(`/fonts/invitation/GreatVibes-Regular.ttf`),
    loadFont(`/fonts/invitation/CormorantGaramond-Regular.ttf`),
    loadFont(`/fonts/invitation/JosefinSans-Regular.ttf`),
  ]);
  doc.addFileToVFS("Script.ttf", scriptB64);
  doc.addFont("Script.ttf", "Script", "normal");
  doc.addFileToVFS("Serif.ttf", serifB64);
  doc.addFont("Serif.ttf", "Serif", "normal");
  doc.addFileToVFS("Sans.ttf", sansB64);
  doc.addFont("Sans.ttf", "Sans", "normal");

  const centerText = (
    txt: string,
    y: number,
    size: number,
    font: string,
    color: [number, number, number],
  ) => {
    doc.setFont(font);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(txt, cx, y, { align: "center" });
  };

  // ── Decorative border + corner Ls ───────────────────────────────────────
  const margin = 36;
  const frameC = blend(PRIMARY, 0.18);
  doc.setDrawColor(...frameC);
  doc.setLineWidth(1.6);
  doc.roundedRect(margin, margin, W - margin * 2, H - margin * 2, 8, 8, "S");

  const innerMargin = margin + 12;
  const innerC = blend(PRIMARY, 0.28);
  doc.setDrawColor(...innerC);
  doc.setLineWidth(0.8);
  doc.roundedRect(
    innerMargin,
    innerMargin,
    W - innerMargin * 2,
    H - innerMargin * 2,
    4,
    4,
    "S",
  );

  const cm = margin + 28;
  const cl = 38;
  const cornerC = blend(PRIMARY, 0.38);
  doc.setDrawColor(...cornerC);
  doc.setLineWidth(1.6);
  doc.line(cm, cm, cm + cl, cm);
  doc.line(cm, cm, cm, cm + cl);
  doc.line(W - cm, cm, W - cm - cl, cm);
  doc.line(W - cm, cm, W - cm, cm + cl);
  doc.line(cm, H - cm, cm + cl, H - cm);
  doc.line(cm, H - cm, cm, H - cm - cl);
  doc.line(W - cm, H - cm, W - cm - cl, H - cm);
  doc.line(W - cm, H - cm, W - cm, H - cm - cl);

  // ── Content ─────────────────────────────────────────────────────────────

  let y = 240;

  // "Dobrodošli na" — calligraphy
  centerText("Dobrodošli na", y, 96, "Script", TEXT);
  y += 50;

  // Event name — extra large, primary color
  let nameSize = 140;
  doc.setFont("Script");
  while (nameSize > 64) {
    doc.setFontSize(nameSize);
    if (doc.getTextWidth(eventName) <= W - innerMargin * 2 - 40) break;
    nameSize -= 6;
  }
  centerText(eventName, y, nameSize, "Script", PRIMARY);
  y += nameSize * 0.32 + 30;

  // Divider
  const lineW = 110;
  doc.setDrawColor(...blend(PRIMARY, 0.35));
  doc.setLineWidth(0.8);
  doc.line(cx - lineW - 4, y, cx - 4, y);
  doc.line(cx + 4, y, cx + lineW + 4, y);

  // Small diamond marker
  doc.setFillColor(...blend(PRIMARY, 0.55));
  doc.triangle(cx - 4, y, cx + 4, y, cx, y - 6, "F");
  doc.triangle(cx - 4, y, cx + 4, y, cx, y + 6, "F");
  y += 30;

  // Body lines
  const qrSize = 280;
  const footerReserve = 220;
  const bodyToQrGap = 32;
  const line1Size = 38;
  const line2Size = 60;
  const line1Height = line1Size * 0.55;
  const line2Height = line2Size * 0.42;
  const interLineGap = 8;
  const bodyBlockHeight = line1Height + interLineGap + line2Height;
  const minBodyY =
    H - footerReserve - qrSize - bodyToQrGap - bodyBlockHeight;
  if (y < minBodyY) y = minBodyY;

  doc.setFont("Sans", "normal");
  doc.setFontSize(line1Size);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Skenirajte QR kod i", cx, y, { align: "center" });
  y += line1Height + interLineGap;

  doc.setFontSize(line2Size);
  doc.setTextColor(...TEXT);
  doc.text("pronađite svoje mesto", cx, y, { align: "center" });
  y += line2Height + bodyToQrGap;

  // QR code
  try {
    const qrUrl = `https://halouspomene.rs/raspored-sedenja/${slug}/gde-sedim/`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 1600,
      margin: 1,
      color: { dark: "#232323", light: "#ffffff" },
    });
    doc.addImage(qrDataUrl, "PNG", cx - qrSize / 2, y, qrSize, qrSize);

    doc.setDrawColor(...blend(PRIMARY, 0.22));
    doc.setLineWidth(0.6);
    doc.roundedRect(
      cx - qrSize / 2 - 8,
      y - 8,
      qrSize + 16,
      qrSize + 16,
      4,
      4,
      "S",
    );
  } catch {
    // QR failed — still produce the rest of the sign.
  }

  // Footer
  centerText("halouspomene.rs", H - 52, 18, "Sans", TEXT_LIGHT);

  const safeName = eventName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
  doc.save(`dobrodosli-${safeName || slug}-B1.pdf`);
}
