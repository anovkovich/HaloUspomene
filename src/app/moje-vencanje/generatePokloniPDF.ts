import jsPDF from "jspdf";
import type { GiftEntry } from "./types";

const SCRIPT_FONT_FILES: Record<string, string> = {
  "great-vibes": "GreatVibesHU-Regular.ttf",
  "dancing-script": "DancingScript-Regular.ttf",
  "alex-brush": "AlexBrush-Regular.ttf",
  parisienne: "Parisienne-Regular.ttf",
  allura: "Allura-Regular.ttf",
  "cormorant-garamond": "CormorantGaramond-Regular.ttf",
  "poiret-one": "PoiretOne-Regular.ttf",
  "marck-script": "MarckScript-Regular.ttf",
  caveat: "Caveat-Regular.ttf",
  "bad-script": "BadScript-Regular.ttf",
  jasminum: "Jasminum-Regular.ttf",
};

async function loadFont(path: string): Promise<string> {
  const res = await fetch(path);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function formatAmount(g: GiftEntry): string {
  if (g.kind === "note") return g.note ?? "";
  return `${(g.amount ?? 0).toLocaleString("sr-RS")} ${g.currency ?? ""}`.trim();
}

export async function generatePokloniPDF(params: {
  slug: string;
  coupleDisplay: string;
  scriptFont?: string;
  useCyrillic: boolean;
  eventDate: string;
  gifts: GiftEntry[];
  totalRSD: number;
  noteCount: number;
}): Promise<void> {
  const { slug, coupleDisplay, scriptFont, useCyrillic, eventDate, gifts, totalRSD, noteCount } = params;

  const W = 210;
  const H = 297;
  const marginX = 22;
  const doc = new jsPDF({ format: "a4", orientation: "portrait", unit: "mm", compress: true });
  const cx = W / 2;

  const scriptFile = SCRIPT_FONT_FILES[scriptFont ?? "great-vibes"] ?? "GreatVibesHU-Regular.ttf";
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

  // Cyrillic has no glyphs in the Sans (JosefinSans) font — same rule as
  // every other PDF generator in this app (see reference_pdf_fonts memory).
  const bodyFont = useCyrillic ? "Serif" : "Sans";

  const primary: [number, number, number] = [174, 52, 63]; // #AE343F
  const gold: [number, number, number] = [212, 175, 55]; // #d4af37

  const dateStr = (() => {
    const d = new Date(eventDate);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(useCyrillic ? "sr-RS" : "sr-Latn-RS", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  })();

  const t = {
    title: useCyrillic ? "Поклони" : "Pokloni",
    colName: useCyrillic ? "Гост" : "Gost",
    colValue: useCyrillic ? "Вредност" : "Vrednost",
    total: useCyrillic ? "Укупно" : "Ukupno",
    notes: (n: number) =>
      useCyrillic
        ? `+ ${n} описних поклона (нису урачунати у суму)`
        : `+ ${n} opisnih poklona (nisu uračunati u sumu)`,
    generated: useCyrillic ? "Generisano" : "Generisano",
  };

  let page = 1;
  const drawHeader = () => {
    doc.setFillColor(250, 250, 245);
    doc.rect(0, 0, W, H, "F");
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.line(marginX, 14, W - marginX, 14);

    doc.setFont("Script");
    doc.setFontSize(26);
    doc.setTextColor(35, 35, 35);
    doc.text(coupleDisplay, cx, 26, { align: "center" });

    doc.setFont("Serif");
    doc.setFontSize(13);
    doc.setTextColor(...primary);
    doc.text(t.title, cx, 34, { align: "center" });

    if (dateStr) {
      doc.setFont(bodyFont);
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(dateStr, cx, 40, { align: "center" });
    }

    doc.setDrawColor(...gold);
    doc.setLineWidth(0.2);
    doc.line(marginX, 45, W - marginX, 45);

    doc.setFont(bodyFont);
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(t.colName, marginX, 53);
    doc.text(t.colValue, W - marginX, 53, { align: "right" });
    doc.setDrawColor(220, 216, 200);
    doc.setLineWidth(0.15);
    doc.line(marginX, 55, W - marginX, 55);

    return 62;
  };

  const drawFooter = () => {
    doc.setFont(bodyFont);
    doc.setFontSize(7);
    doc.setTextColor(170, 170, 170);
    doc.text("halouspomene.rs", cx, H - 10, { align: "center" });
    doc.text(String(page), W - marginX, H - 10, { align: "right" });
  };

  let y = drawHeader();
  const rowHeight = 8;
  const bottomLimit = H - 20;

  doc.setFont(bodyFont);
  doc.setFontSize(10.5);

  for (const g of gifts) {
    if (y > bottomLimit) {
      drawFooter();
      doc.addPage();
      page += 1;
      y = drawHeader();
      doc.setFont(bodyFont);
      doc.setFontSize(10.5);
    }
    doc.setTextColor(35, 35, 35);
    doc.text(g.name || "—", marginX, y, { maxWidth: 95 });
    doc.setTextColor(80, 80, 80);
    doc.text(formatAmount(g) || "—", W - marginX, y, { align: "right", maxWidth: 70 });
    y += rowHeight;
  }

  if (gifts.length === 0) {
    doc.setFont(bodyFont);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(useCyrillic ? "Још нема унетих поклона." : "Još nema unetih poklona.", cx, y, { align: "center" });
    y += rowHeight;
  }

  if (y > bottomLimit - 20) {
    drawFooter();
    doc.addPage();
    page += 1;
    y = drawHeader();
  }

  y += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.4);
  doc.line(marginX, y, W - marginX, y);
  y += 10;

  doc.setFont("Serif");
  doc.setFontSize(14);
  doc.setTextColor(...primary);
  doc.text(t.total, marginX, y);
  doc.text(`${Math.round(totalRSD).toLocaleString("sr-RS")} din`, W - marginX, y, { align: "right" });

  if (noteCount > 0) {
    y += 7;
    doc.setFont(bodyFont);
    doc.setFontSize(8.5);
    doc.setTextColor(140, 140, 140);
    doc.text(t.notes(noteCount), W - marginX, y, { align: "right" });
  }

  drawFooter();
  doc.save(`pokloni-${slug}.pdf`);
}