import jsPDF from "jspdf";
import QRCode from "qrcode";
import type {
  BirthdayThemeType,
  BirthdayType,
} from "@/app/deciji-rodjendan/[slug]/types";
import { BIRTHDAY_THEME_CONFIGS } from "@/app/deciji-rodjendan/[slug]/constants";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function blendColor(
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

export interface BirthdayWelcomePDFInput {
  slug: string;
  /** Display name of the honoree — child_name for "child", honoree_name for "eighteenth". */
  honoreeName: string;
  age: number;
  type: BirthdayType; // "child" | "eighteenth"
  theme: BirthdayThemeType;
}

/**
 * B1 portrait (707 x 1000 mm) welcome sign for birthdays (child + punoletstvo).
 * QR points to /deciji-rodjendan/[slug]/gde-sedim/.
 *
 * Layout:
 *   - decorative border + corner L decorations in theme primary
 *   - "{name} proslavlja {age}. rođendan" (or "punoletstvo") — big display font
 *   - "dobrodošli!" — slightly smaller, same font
 *   - heart divider
 *   - two-line body: "Molimo Vas skenirajte QR kod i" + "pronađite svoje mesto sedenja"
 *   - large centered QR
 *   - halouspomene.rs footer
 */
export async function generateBirthdayWelcomePDF(
  input: BirthdayWelcomePDFInput,
): Promise<void> {
  const { slug, honoreeName, age, type, theme } = input;

  const themeConfig = BIRTHDAY_THEME_CONFIGS[theme] ?? BIRTHDAY_THEME_CONFIGS.neutral_circus;
  const primary = hexToRgb(themeConfig.colors.primary);
  const text = hexToRgb(themeConfig.colors.text);
  const textMuted = hexToRgb(themeConfig.colors.textMuted);
  const textLight = hexToRgb(themeConfig.colors.textLight);

  const W = 707;
  const H = 1000;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [W, H],
  });
  const cx = W / 2;

  // Load fonts. Fredoka-SemiBold handles both Latin diacritics and Cyrillic
  // (covers "č", "ć", "đ", "š", "ž" and serbian cyrillic for future use).
  // Serif/Sans fallbacks from the invitation font set for the body text.
  const [displayB64, serifB64, sansB64] = await Promise.all([
    loadFont(`/fonts/birthday/Fredoka-SemiBold.ttf`),
    loadFont(`/fonts/invitation/CormorantGaramond-Regular.ttf`),
    loadFont(`/fonts/invitation/JosefinSans-Regular.ttf`),
  ]);
  doc.addFileToVFS("Display.ttf", displayB64);
  doc.addFont("Display.ttf", "Display", "normal");
  doc.addFileToVFS("Serif.ttf", serifB64);
  doc.addFont("Serif.ttf", "Serif", "normal");
  doc.addFileToVFS("Sans.ttf", sansB64);
  doc.addFont("Sans.ttf", "Sans", "normal");

  // Josefin Sans doesn't cover full Latin-extended — fall back to Serif for
  // body lines if needed. Fredoka SemiBold should handle common diacritics.
  const bodyFont = "Sans";

  // ── Helpers ─────────────────────────────────────────────────────────────

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

  const drawHeartIcon = (hx: number, hy: number, r: number) => {
    const c = blendColor(primary, 0.55);
    doc.setFillColor(...c);
    doc.setDrawColor(...c);
    doc.circle(hx - r * 0.5, hy, r * 0.55, "F");
    doc.circle(hx + r * 0.5, hy, r * 0.55, "F");
    doc.triangle(
      hx - r * 1.0,
      hy + r * 0.1,
      hx + r * 1.0,
      hy + r * 0.1,
      hx,
      hy + r * 1.5,
      "F",
    );
  };

  const drawHeartDivider = (y: number) => {
    const lineW = 110;
    const c = blendColor(primary, 0.35);
    doc.setDrawColor(...c);
    doc.setLineWidth(0.8);
    doc.line(cx - lineW - 28, y, cx - 22, y);
    doc.line(cx + 22, y, cx + lineW + 28, y);
    drawHeartIcon(cx, y - 3, 8);
  };

  // ── Decorative border + corner Ls ───────────────────────────────────────

  const margin = 36;
  const frameC = blendColor(primary, 0.18);
  doc.setDrawColor(...frameC);
  doc.setLineWidth(1.6);
  doc.roundedRect(margin, margin, W - margin * 2, H - margin * 2, 8, 8, "S");

  const innerMargin = margin + 12;
  const innerC = blendColor(primary, 0.28);
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
  const cornerC = blendColor(primary, 0.38);
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

  let y = 220;

  // Headline: "{name} proslavlja {age}. rođendan/punoletstvo"
  const eventWord = type === "eighteenth" ? "punoletstvo" : "rođendan";
  const headline = `${honoreeName} proslavlja ${age}. ${eventWord}`;

  // Auto-fit — long names/Cyrillic shouldn't overflow the inner frame.
  let headlineSize = 118;
  doc.setFont("Display");
  while (headlineSize > 64) {
    doc.setFontSize(headlineSize);
    if (doc.getTextWidth(headline) <= W - innerMargin * 2 - 60) break;
    headlineSize -= 4;
  }
  centerText(headline, y, headlineSize, "Display", primary);
  y += headlineSize * 0.4 + 24;

  // Second line: "dobrodošli!" — slightly smaller, charcoal text
  const subLine = "dobrodošli!";
  const subSize = Math.round(headlineSize * 0.7);
  centerText(subLine, y, subSize, "Display", text);
  y += subSize * 0.42 + 28;

  // Heart divider — visual break before the instruction/QR block.
  drawHeartDivider(y);
  y += 24;

  // Body + QR are anchored to the bottom portion of the page.
  const qrSize = 280;
  const footerReserve = 220;
  const bodyToQrGap = 28;
  const line1Size = 38;
  const line2Size = 60;
  const line1Height = line1Size * 0.55;
  const line2Height = line2Size * 0.42;
  const interLineGap = 8;
  const bodyBlockHeight = line1Height + interLineGap + line2Height;
  const minBodyY =
    H - footerReserve - qrSize - bodyToQrGap - bodyBlockHeight;
  if (y < minBodyY) y = minBodyY;

  // Line 1 — smaller, muted
  doc.setFont(bodyFont, "normal");
  doc.setFontSize(line1Size);
  doc.setTextColor(...textMuted);
  doc.text("Molimo Vas skenirajte QR kod i", cx, y, { align: "center" });
  y += line1Height + interLineGap;

  // Line 2 — bigger, charcoal text
  doc.setFontSize(line2Size);
  doc.setTextColor(...text);
  doc.text("pronađite svoje mesto sedenja", cx, y, { align: "center" });
  y += line2Height + bodyToQrGap;

  // QR code — points at the birthday seat-lookup page.
  const qrY = y;
  try {
    const qrUrl = `https://halouspomene.rs/deciji-rodjendan/${slug}/gde-sedim/`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 1600,
      margin: 1,
      color: { dark: themeConfig.colors.text, light: "#ffffff" },
    });
    doc.addImage(qrDataUrl, "PNG", cx - qrSize / 2, qrY, qrSize, qrSize);

    // Subtle frame around the QR
    doc.setDrawColor(...blendColor(primary, 0.22));
    doc.setLineWidth(0.6);
    doc.roundedRect(
      cx - qrSize / 2 - 8,
      qrY - 8,
      qrSize + 16,
      qrSize + 16,
      4,
      4,
      "S",
    );
  } catch {
    // QR failed — still produce the rest of the sign.
  }

  centerText("halouspomene.rs", H - 52, 18, "Sans", textLight);

  const safeName = honoreeName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
  const fileLabel = type === "eighteenth" ? "punoletstvo" : "rodjendan";
  doc.save(
    `dobrodosli-${safeName || slug}-${fileLabel}-B1.pdf`,
  );
}
