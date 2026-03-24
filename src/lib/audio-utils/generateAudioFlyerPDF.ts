import jsPDF from "jspdf";
import QRCode from "qrcode";

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

const SCRIPT_FONT_FILES: Record<string, string> = {
  "great-vibes": "GreatVibes-Regular.ttf",
  "dancing-script": "DancingScript-Regular.ttf",
  "alex-brush": "AlexBrush-Regular.ttf",
  parisienne: "Parisienne-Regular.ttf",
  allura: "Allura-Regular.ttf",
  "marck-script": "MarckScript-Regular.ttf",
  caveat: "Caveat-Regular.ttf",
  "bad-script": "BadScript-Regular.ttf",
};

async function loadFont(path: string): Promise<string> {
  const res = await fetch(path);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function generateAudioFlyerPDF(
  slug: string,
  coupleNames: string,
  primaryColor: string,
  useCyrillic: boolean,
  scriptFont?: string,
): Promise<void> {
  const primary = hexToRgb(primaryColor);
  const primaryLight = blendColor(primary, 0.08);

  // A6: 105 x 148 mm
  const W = 105;
  const H = 148;
  const doc = new jsPDF({
    format: [W, H],
    orientation: "portrait",
    unit: "mm",
  });
  const cx = W / 2;

  // Load fonts
  const scriptFile = SCRIPT_FONT_FILES[scriptFont ?? "great-vibes"] ?? "GreatVibes-Regular.ttf";
  const [serifB64, sansB64, scriptB64] = await Promise.all([
    loadFont("/fonts/invitation/CormorantGaramond-Regular.ttf"),
    loadFont("/fonts/invitation/JosefinSans-Regular.ttf"),
    loadFont(`/fonts/invitation/${scriptFile}`),
  ]);

  doc.addFileToVFS("Serif.ttf", serifB64);
  doc.addFont("Serif.ttf", "Serif", "normal");
  doc.addFileToVFS("Sans.ttf", sansB64);
  doc.addFont("Sans.ttf", "Sans", "normal");
  doc.addFileToVFS("Script.ttf", scriptB64);
  doc.addFont("Script.ttf", "Script", "normal");

  const bodyFont = useCyrillic ? "Serif" : "Sans";

  // ── Helpers ──────────────────────────────────────────────────────────
  const drawHeartIcon = (hx: number, hy: number, r: number) => {
    const c = blendColor(primary, 0.5);
    doc.setFillColor(...c);
    doc.setDrawColor(...c);
    doc.circle(hx - r * 0.5, hy, r * 0.55, "F");
    doc.circle(hx + r * 0.5, hy, r * 0.55, "F");
    doc.triangle(
      hx - r * 1.0, hy + r * 0.1,
      hx + r * 1.0, hy + r * 0.1,
      hx, hy + r * 1.5,
      "F",
    );
  };

  const drawHeartDivider = (divY: number) => {
    const lineW = 18;
    const c = blendColor(primary, 0.3);
    doc.setDrawColor(...c);
    doc.setLineWidth(0.2);
    doc.line(cx - lineW - 5, divY, cx - 4, divY);
    doc.line(cx + 4, divY, cx + lineW + 5, divY);
    drawHeartIcon(cx, divY - 0.6, 1.5);
  };

  // ── Background ────────────────────────────────────────────────────────
  doc.setFillColor(...primaryLight);
  doc.rect(0, 0, W, H, "F");

  // ── Top decoration ────────────────────────────────────────────────────
  drawHeartDivider(14);

  // ── Couple names ──────────────────────────────────────────────────────
  doc.setFont("Script");
  doc.setFontSize(20);
  doc.setTextColor(35, 35, 35);
  doc.text(coupleNames, cx, 26, { align: "center" });

  // ── Thank you message ─────────────────────────────────────────────────
  doc.setFont(bodyFont);
  doc.setFontSize(9.5);
  doc.setTextColor(100, 100, 100);

  const thankYou = useCyrillic
    ? "Хвала вам што сте део нашег посебног дана!"
    : "Hvala vam što ste deo našeg posebnog dana!";
  doc.text(thankYou, cx, 33, { align: "center" });

  // ── Divider ───────────────────────────────────────────────────────────
  doc.setDrawColor(...blendColor(primary, 0.3));
  doc.setLineWidth(0.3);
  doc.line(cx - 15, 37, cx + 15, 37);

  // ── Main message ──────────────────────────────────────────────────────
  doc.setFont("Serif");
  doc.setFontSize(13);
  doc.setTextColor(35, 35, 35);

  const title = useCyrillic
    ? "Оставите нам аудио поруку"
    : "Ostavite nam audio poruku";
  doc.text(title, cx, 45, { align: "center" });

  doc.setFont(bodyFont);
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);

  const lines = useCyrillic
    ? [
        "Скенирајте QR код испод и снимите кратку",
        "поруку, честитку или испричајте анегдоту —",
        "директно са вашег телефона. Без апликације!",
      ]
    : [
        "Skenirajte QR kod ispod i snimite kratku",
        "poruku, čestitku ili ispričajte anegdotu —",
        "direktno sa vašeg telefona. Bez aplikacije!",
      ];

  let y = 52;
  for (const line of lines) {
    doc.text(line, cx, y, { align: "center" });
    y += 4.5;
  }

  // ── QR Code ───────────────────────────────────────────────────────────
  const url = `https://halouspomene.rs/pozivnica/${slug}/audio-knjiga/`;
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 1,
    color: { dark: "#232323", light: "#ffffff" },
  });

  const qrSize = 42;
  const qrX = cx - qrSize / 2;
  const qrY = 72;

  // White bg for QR
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 3, 3, "F");
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // ── URL below QR ──────────────────────────────────────────────────────
  doc.setFont(bodyFont);
  doc.setFontSize(6);
  doc.setTextColor(160, 160, 160);
  doc.text(url, cx, qrY + qrSize + 5, { align: "center" });

  // ── Bottom message ────────────────────────────────────────────────────
  doc.setFont("Serif");
  doc.setFontSize(10);
  doc.setTextColor(...primary);

  const bottom = useCyrillic
    ? "Ваш глас је најлепша успомена"
    : "Vaš glas je najlepša uspomena";
  doc.text(bottom, cx, H - 16, { align: "center" });

  // ── Bottom decoration ──────────────────────────────────────────────────
  drawHeartDivider(H - 10);

  // ── Branding ──────────────────────────────────────────────────────────
  doc.setFont(bodyFont);
  doc.setFontSize(6);
  doc.setTextColor(160, 160, 160);
  doc.text("halouspomene.rs", cx, H - 5, { align: "center" });

  // ── Save ──────────────────────────────────────────────────────────────
  doc.save(`audio-flyer-${slug}.pdf`);
}
