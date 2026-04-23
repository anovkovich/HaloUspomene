import jsPDF from "jspdf";
import QRCode from "qrcode";
import type { ScriptFontType, ThemeType } from "../types";
import { THEME_CONFIGS } from "../constants";

const SCRIPT_FONT_FILES: Record<ScriptFontType, string> = {
  "great-vibes": "GreatVibes-Regular.ttf",
  "dancing-script": "DancingScript-Regular.ttf",
  "alex-brush": "AlexBrush-Regular.ttf",
  parisienne: "Parisienne-Regular.ttf",
  allura: "Allura-Regular.ttf",
  "marck-script": "MarckScript-Regular.ttf",
  caveat: "Caveat-Regular.ttf",
  "bad-script": "BadScript-Regular.ttf",
};

// Script fonts with full Cyrillic coverage.
const CYRILLIC_SCRIPT_FONTS: ScriptFontType[] = [
  "marck-script",
  "caveat",
  "bad-script",
];

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

async function svgToDataUrl(
  svgUrl: string,
  tintColor: string,
  width: number,
  height: number,
): Promise<string> {
  const res = await fetch(svgUrl);
  const svgText = await res.text();
  const tinted = svgText.replace(/stroke="[^"]*"/, `stroke="${tintColor}"`);
  const blob = new Blob([tinted], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = url;
  });
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

export interface WelcomePDFInput {
  slug: string;
  coupleDisplay: string; // e.g. "Marija & Petar"
  theme: ThemeType;
  scriptFont?: ScriptFontType;
  useCyrillic?: boolean;
}

/**
 * B1 portrait (707 x 1000 mm) welcome sign with QR code to /gde-sedim.
 * Layout (top → bottom):
 *   - decorative border + corners
 *   - flower ornament
 *   - "Dobrodošli na naše venčanje!" (script font, calligraphy)
 *   - couple names (script font, extra large)
 *   - heart divider
 *   - "Molimo vas skenirajte QR kod ..." (body font)
 *   - large QR code centered
 *   - halouspomene.rs footer
 */
export async function generateWelcomePDF(
  input: WelcomePDFInput,
): Promise<void> {
  const { slug, coupleDisplay, theme, scriptFont, useCyrillic } = input;

  const themeConfig = THEME_CONFIGS[theme] ?? THEME_CONFIGS.classic_rose;
  const primary = hexToRgb(themeConfig.colors.primary);
  const text = hexToRgb(themeConfig.colors.text);
  const textMuted = hexToRgb(themeConfig.colors.textMuted);
  const textLight = hexToRgb(themeConfig.colors.textLight);

  // B1 portrait — 707 x 1000 mm
  const W = 707;
  const H = 1000;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [W, H],
  });
  const cx = W / 2;

  // Pick a Cyrillic-safe script font if needed.
  const requestedScript = scriptFont ?? "great-vibes";
  const effectiveScript: ScriptFontType =
    useCyrillic && !CYRILLIC_SCRIPT_FONTS.includes(requestedScript)
      ? "marck-script"
      : requestedScript;
  const scriptFile = SCRIPT_FONT_FILES[effectiveScript];

  const [scriptB64, serifB64, sansB64] = await Promise.all([
    loadFont(`/fonts/invitation/${scriptFile}`),
    loadFont(`/fonts/invitation/CormorantGaramond-Regular.ttf`),
    loadFont(`/fonts/invitation/JosefinSans-Regular.ttf`),
  ]);
  doc.addFileToVFS("Script.ttf", scriptB64);
  doc.addFont("Script.ttf", "Script", "normal");
  doc.addFileToVFS("Serif.ttf", serifB64);
  doc.addFont("Serif.ttf", "Serif", "normal");
  doc.addFileToVFS("Sans.ttf", sansB64);
  doc.addFont("Sans.ttf", "Sans", "normal");

  // Josefin Sans has no Cyrillic — fall back to serif for body text.
  const bodyFont = useCyrillic ? "Serif" : "Sans";

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

  // Corner L-shapes
  const cm = margin + 28;
  const cl = 38;
  const cornerC = blendColor(primary, 0.38);
  doc.setDrawColor(...cornerC);
  doc.setLineWidth(1.6);
  // Top-left
  doc.line(cm, cm, cm + cl, cm);
  doc.line(cm, cm, cm, cm + cl);
  // Top-right
  doc.line(W - cm, cm, W - cm - cl, cm);
  doc.line(W - cm, cm, W - cm, cm + cl);
  // Bottom-left
  doc.line(cm, H - cm, cm + cl, H - cm);
  doc.line(cm, H - cm, cm, H - cm - cl);
  // Bottom-right
  doc.line(W - cm, H - cm, W - cm - cl, H - cm);
  doc.line(W - cm, H - cm, W - cm, H - cm - cl);

  // ── Content ─────────────────────────────────────────────────────────────

  let y = 140;

  // Flower ornament at the top
  try {
    const flowerW = 380;
    const flowerH = Math.round(flowerW * (232 / 842));
    const flowerDataUrl = await svgToDataUrl(
      "/flower-divider.svg",
      themeConfig.colors.primary,
      flowerW * 3,
      flowerH * 3,
    );
    doc.addImage(
      flowerDataUrl,
      "PNG",
      cx - flowerW / 2,
      y,
      flowerW,
      flowerH,
    );
    y += flowerH + 36;
  } catch {
    y += 16;
  }

  // "Dobrodošli na naše venčanje!" — calligraphy
  const welcomeText = useCyrillic
    ? "Добродошли на наше венчање!"
    : "Dobrodošli na naše venčanje!";
  // Auto-fit so long Cyrillic never overflows.
  let welcomeSize = 96;
  doc.setFont("Script");
  while (welcomeSize > 56) {
    doc.setFontSize(welcomeSize);
    if (doc.getTextWidth(welcomeText) <= W - innerMargin * 2 - 60) break;
    welcomeSize -= 4;
  }
  centerText(welcomeText, y, welcomeSize, "Script", text);
  y += welcomeSize * 0.45 + 22;

  // Heart divider — sits between the welcome line and the couple names
  drawHeartDivider(y);
  y += 34;

  // Couple names — even bigger, script
  let nameSize = 160;
  doc.setFont("Script");
  while (nameSize > 80) {
    doc.setFontSize(nameSize);
    if (doc.getTextWidth(coupleDisplay) <= W - innerMargin * 2 - 40) break;
    nameSize -= 6;
  }
  centerText(coupleDisplay, y, nameSize, "Script", primary);
  y += nameSize * 0.5 + 24;

  // Body instruction
  const body = useCyrillic
    ? "Молимо вас скенирајте QR код и пронађите своје место седења"
    : "Molimo vas skenirajte QR kod i pronađite svoje mesto sedenja";
  doc.setFont(bodyFont, "normal");
  doc.setFontSize(36);
  doc.setTextColor(...textMuted);
  const bodyLines = doc.splitTextToSize(body, W - innerMargin * 2 - 80);
  doc.text(bodyLines, cx, y, { align: "center" });
  y += bodyLines.length * 18 + 32;

  // QR code — centered, anchored so footer has room.
  const qrSize = 280;
  const footerReserve = 90;
  const qrY = Math.max(y, H - footerReserve - qrSize);

  try {
    const qrUrl = `https://halouspomene.rs/pozivnica/${slug}/gde-sedim/`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 1600,
      margin: 1,
      color: { dark: themeConfig.colors.text, light: "#ffffff" },
    });
    doc.addImage(
      qrDataUrl,
      "PNG",
      cx - qrSize / 2,
      qrY,
      qrSize,
      qrSize,
    );

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

  // Footer: halouspomene.rs
  centerText("halouspomene.rs", H - 52, 18, "Sans", textLight);

  // Save
  const safeName = coupleDisplay
    .replace(/\s*&\s*/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
  doc.save(`dobrodosli-${safeName || slug}-B1.pdf`);
}
