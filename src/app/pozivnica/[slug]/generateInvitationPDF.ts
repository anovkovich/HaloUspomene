import jsPDF from "jspdf";
import QRCode from "qrcode";
import { WeddingData, ScriptFontType } from "./types";
import { THEME_CONFIGS } from "./constants";

const MONTHS_LATIN = [
  "januar",
  "februar",
  "mart",
  "april",
  "maj",
  "jun",
  "jul",
  "avgust",
  "septembar",
  "oktobar",
  "novembar",
  "decembar",
];
const MONTHS_CYRILLIC = [
  "јануар",
  "фебруар",
  "март",
  "април",
  "мај",
  "јун",
  "јул",
  "август",
  "септембар",
  "октобар",
  "новембар",
  "децембар",
];

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

function formatDate(iso: string, cyrillic: boolean): string {
  const d = new Date(iso);
  const months = cyrillic ? MONTHS_CYRILLIC : MONTHS_LATIN;
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}.`;
}

function formatDeadline(iso: string, cyrillic: boolean): string {
  const d = new Date(iso);
  const months = cyrillic ? MONTHS_CYRILLIC : MONTHS_LATIN;
  return `${d.getDate().toString().padStart(2, "0")}. ${months[d.getMonth()]} ${d.getFullYear()}.`;
}

async function svgToDataUrl(
  svgUrl: string,
  tintColor: string,
  width: number,
  height: number,
): Promise<string> {
  const res = await fetch(svgUrl);
  const svgText = await res.text();
  // Set stroke color to theme primary
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

export async function generateInvitationPDF(
  data: WeddingData,
  slug: string,
  isPaid: boolean,
  useCyrillic: boolean,
): Promise<void> {
  const theme = THEME_CONFIGS[data.theme] ?? THEME_CONFIGS.classic_rose;
  const primary = hexToRgb(theme.colors.primary);
  const primaryLight = blendColor(primary, 0.15);
  const text = hexToRgb(theme.colors.text);
  const textMuted = hexToRgb(theme.colors.textMuted);
  const textLight = hexToRgb(theme.colors.textLight);

  // A5: 148 x 210 mm
  const W = 148;
  const H = 210;
  const doc = new jsPDF({ format: "a5", orientation: "portrait", unit: "mm" });
  const cx = W / 2;

  // Load fonts
  const scriptFontKey = data.scriptFont ?? "great-vibes";
  const scriptFile =
    SCRIPT_FONT_FILES[scriptFontKey] ?? "GreatVibes-Regular.ttf";

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

  // Body font: Josefin Sans doesn't support Cyrillic, use Serif instead
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

  const drawLine = (y: number, w: number, opacity: number) => {
    const c = blendColor(primary, opacity);
    doc.setDrawColor(...c);
    doc.setLineWidth(0.3);
    doc.line(cx - w / 2, y, cx + w / 2, y);
  };

  const drawDoubleLine = (y: number, w: number) => {
    const c = blendColor(primary, 0.3);
    doc.setDrawColor(...c);
    doc.setLineWidth(0.2);
    doc.line(cx - w / 2, y, cx + w / 2, y);
    doc.line(cx - w / 2, y + 1.2, cx + w / 2, y + 1.2);
  };

  const drawHeartIcon = (hx: number, hy: number, r: number) => {
    // Heart = two filled circles + a triangle
    const c = blendColor(primary, 0.5);
    doc.setFillColor(...c);
    doc.setDrawColor(...c);
    // Two circles for the top bumps
    doc.circle(hx - r * 0.5, hy, r * 0.55, "F");
    doc.circle(hx + r * 0.5, hy, r * 0.55, "F");
    // Triangle for the bottom point
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
    const lineW = 26;
    const c = blendColor(primary, 0.3);
    doc.setDrawColor(...c);
    doc.setLineWidth(0.2);
    doc.line(cx - lineW - 7, y, cx - 5, y);
    doc.line(cx + 5, y, cx + lineW + 7, y);
    drawHeartIcon(cx, y - 0.8, 2);
  };

  // ── PAGE 1: Main Invitation ─────────────────────────────────────────────

  // Subtle border frame
  const margin = 8;
  const frameC = blendColor(primary, 0.12);
  doc.setDrawColor(...frameC);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, margin, W - margin * 2, H - margin * 2, 2, 2, "S");

  // Inner decorative corners (small L-shapes)
  const cm = 13;
  const cl = 8;
  const cornerC = blendColor(primary, 0.2);
  doc.setDrawColor(...cornerC);
  doc.setLineWidth(0.3);
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

  let y = 18;

  // Flower ornament above names
  try {
    const flowerW = 80;
    const flowerH = Math.round(flowerW * (232 / 842));
    const flowerDataUrl = await svgToDataUrl(
      "/flower-divider.svg",
      theme.colors.primary,
      flowerW * 3,
      flowerH * 3,
    );
    doc.addImage(flowerDataUrl, "PNG", cx - flowerW / 2, y, flowerW, flowerH);
    y += flowerH + 14;
  } catch {
    drawDoubleLine(y, 55);
    y += 18;
  }

  // Couple names (auto-size for long names)
  const nameText = data.couple_names.full_display;
  let nameSize = 38;
  doc.setFont("Script");
  while (nameSize > 20) {
    doc.setFontSize(nameSize);
    const nameW = doc.getTextWidth(nameText);
    if (nameW <= W - 28) break;
    nameSize -= 4;
  }
  centerText(nameText, y, nameSize, "Script", text);
  y += 8;

  // Double line below names
  drawDoubleLine(y, 55);
  y += 10;

  // Date
  centerText(
    formatDate(data.event_date, useCyrillic),
    y,
    16,
    "Serif",
    textMuted,
  );
  y += 10;

  // Tagline
  if (data.tagline) {
    doc.setFont("Serif", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...textMuted);
    const lines = doc.splitTextToSize(data.tagline, W - 40);
    doc.text(lines, cx, y, { align: "center" });
    y += lines.length * 4.5 + 5;
  }

  // Divider with heart
  drawHeartDivider(y);
  y += 10;

  // Venue info
  const hall =
    data.locations.find((l) => l.type === "hall") ?? data.locations[0];
  if (hall) {
    centerText(hall.name, y, 14, "Serif", text);
    y += 7;
    centerText(hall.address, y, 11, bodyFont, textMuted);
    y += 6;
    centerText(hall.time + "h", y, 11, bodyFont, textMuted);
    y += 10;
  }

  // Divider with heart
  drawHeartDivider(y);
  y += 10;

  // RSVP deadline
  const deadlineLabel = useCyrillic
    ? "Потврдите долазак до"
    : "Potvrdite dolazak do";
  centerText(deadlineLabel, y, 11, bodyFont, textMuted);
  y += 6;
  centerText(
    formatDeadline(data.submit_until, useCyrillic),
    y,
    13,
    "Serif",
    text,
  );
  y += 10;

  // QR Code
  try {
    const qrUrl = `https://halouspomene.rs/pozivnica/${slug}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 1,
      color: { dark: theme.colors.text, light: "#00000000" },
    });
    const qrSize = 24;
    doc.addImage(qrDataUrl, "PNG", cx - qrSize / 2, y, qrSize, qrSize);
    y += qrSize + 3.5;
    const scanLabel = useCyrillic
      ? "Скенирајте за потврду"
      : "Skenirajte za potvrdu";
    centerText(scanLabel, y, 9, bodyFont, textLight);
  } catch {
    // QR generation failed, skip
  }

  // Watermark (free version only)
  if (!isPaid) {
    centerText("halouspomene.rs", H - 12, 7, "Sans", [190, 185, 175]);
  }

  // ── PAGE 2: Timeline ────────────────────────────────────────────────────

  if (data.timeline.length > 0) {
    doc.addPage("a5", "portrait");

    // Same border frame
    doc.setDrawColor(...frameC);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, margin, W - margin * 2, H - margin * 2, 2, 2, "S");

    // Corner decorations
    doc.setDrawColor(...cornerC);
    doc.setLineWidth(0.3);
    doc.line(cm, cm, cm + cl, cm);
    doc.line(cm, cm, cm, cm + cl);
    doc.line(W - cm, cm, W - cm - cl, cm);
    doc.line(W - cm, cm, W - cm, cm + cl);
    doc.line(cm, H - cm, cm + cl, H - cm);
    doc.line(cm, H - cm, cm, H - cm - cl);
    doc.line(W - cm, H - cm, W - cm - cl, H - cm);
    doc.line(W - cm, H - cm, W - cm, H - cm - cl);

    let ty = 28;

    // Title
    const protocolLabel = useCyrillic ? "Протокол" : "Protokol";
    centerText(protocolLabel, ty, 28, "Script", primary);
    ty += 9;

    const planLabel = useCyrillic ? "План нашег дана" : "Plan našeg dana";
    centerText(planLabel, ty, 13, bodyFont, textMuted);
    ty += 6;

    // Decorative line under title
    drawDoubleLine(ty, 40);
    ty += 14;

    // Timeline items — centered layout
    for (const item of data.timeline) {
      if (ty > H - 28) break;

      // Small dot separator between items
      if (ty < H - 35) {
        doc.setFillColor(...primaryLight);
        doc.circle(cx, ty, 0.6, "F");
        ty += 6;
      }

      // Time badge
      centerText(item.time, ty, 12, bodyFont, primary);
      ty += 6;

      // Title
      centerText(item.title, ty, 14, "Serif", text);
      ty += 6;

      // Description
      if (item.description) {
        doc.setFont(bodyFont);
        doc.setFontSize(11);
        doc.setTextColor(...textMuted);
        const descLines = doc.splitTextToSize(item.description, W - 44);
        doc.text(descLines, cx, ty, { align: "center" });
        ty += descLines.length * 3.5;
      }

      ty += 3;
    }

    // Watermark
    if (!isPaid) {
      centerText("halouspomene.rs", H - 12, 7, "Sans", [190, 185, 175]);
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  doc.save(`pozivnica-${slug}.pdf`);
}
