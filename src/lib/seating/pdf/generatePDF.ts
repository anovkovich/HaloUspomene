import type { RSVPEntry } from "@/lib/rsvp";
import type { TableData } from "../types";

async function loadFont(path: string): Promise<string> {
  const res = await fetch(path);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function generateAndDownloadPDF(
  tables: TableData[],
  attending: RSVPEntry[],
  coupleNames: string,
  slug: string,
) {
  // ── Floor plan SVG ────────────────────────────────────────────────────────
  const SEAT_SZ = 30,
    ORBIT_R = 68,
    HEADER_H = 28,
    SURFACE_H = 60,
    SEAT_ZONE = SEAT_SZ + 10;
  type Rect = { x: number; y: number; w: number; h: number };

  const rectFor = (t: TableData): Rect => {
    if (t.type === "circle") {
      const d = (ORBIT_R + SEAT_SZ / 2 + 6) * 2;
      return { x: t.x, y: t.y, w: d, h: d };
    }
    if (t.type === "decoration") {
      if (t.decorationType === "entrance")
        return { x: t.x + 32, y: t.y + 32, w: 150, h: 36 };
      return {
        x: t.x,
        y: t.y,
        w: t.decoWidth ?? 160,
        h: (t.decoHeight ?? 80) + HEADER_H,
      };
    }
    const spr = t.type === "rectangular" ? t.seats / 2 : t.seats;
    const long = Math.max(160, spr * (SEAT_SZ + 6) - 6 + 32);
    if (t.type === "rectangular") {
      if (t.rotated)
        return { x: t.x, y: t.y, w: SURFACE_H + SEAT_ZONE * 2, h: long };
      return { x: t.x, y: t.y, w: long, h: SURFACE_H + SEAT_ZONE * 2 };
    }
    return { x: t.x, y: t.y, w: long, h: SURFACE_H + SEAT_ZONE };
  };

  const rects = tables.map(rectFor);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.w);
    maxY = Math.max(maxY, r.y + r.h);
  }
  if (!isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 400;
    maxY = 300;
  }

  const PAD = 24,
    sc = Math.min(1, 640 / (maxX - minX + PAD * 2));
  const svgW = Math.round((maxX - minX + PAD * 2) * sc);
  const svgH = Math.round((maxY - minY + PAD * 2) * sc);
  const fx = (x: number) => ((x - minX + PAD) * sc).toFixed(1);
  const fy = (y: number) => ((y - minY + PAD) * sc).toFixed(1);
  const fs = (v: number) => (v * sc).toFixed(1);
  const fcx = (r: Rect) => ((r.x - minX + PAD + r.w / 2) * sc).toFixed(1);
  const fcy = (r: Rect) => ((r.y - minY + PAD + r.h / 2) * sc).toFixed(1);

  const shapes = tables.map((t, i) => {
    const r = rects[i],
      cx = fcx(r),
      cy = fcy(r);

    if (t.type === "circle") {
      const outerR = fs(r.w / 2),
        innerR = ((r.w / 2) * sc * 0.58).toFixed(1);
      const lY = ((r.y - minY + PAD + r.h / 2 + 4) * sc).toFixed(1);
      const sz = Math.max(7, Math.round(11 * sc));
      return `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="#efefef" stroke="#bbb" stroke-width="1" stroke-dasharray="3,3"/>\n<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#e0e0e0" stroke="#555" stroke-width="2"/>\n<text x="${cx}" y="${lY}" text-anchor="middle" font-size="${sz}" font-family="Arial" fill="#222" font-weight="700">${t.label}</text>`;
    }

    if (t.type === "decoration") {
      const sz = Math.max(7, Math.round(9 * sc));
      if (t.decorationType === "entrance") {
        const arrow =
          t.entranceDirection === "down"
            ? "↓"
            : t.entranceDirection === "left"
              ? "←"
              : t.entranceDirection === "right"
                ? "→"
                : "↑";
        return `<rect x="${fx(r.x)}" y="${fy(r.y)}" width="${fs(r.w)}" height="${fs(r.h)}" rx="4" fill="#f0f0f0" stroke="#888" stroke-width="1.5" stroke-dasharray="5,4"/>\n<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="${sz}" font-family="Arial" fill="#333">${arrow} ${t.label}</text>`;
      }
      const icon = t.decorationType === "music" ? "♪" : "♫";
      return `<rect x="${fx(r.x)}" y="${fy(r.y)}" width="${fs(r.w)}" height="${fs(r.h)}" rx="4" fill="#f0f0f0" stroke="#888" stroke-width="1.5" stroke-dasharray="5,4"/>\n<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="${sz}" font-family="Arial" fill="#333">${icon} ${t.label}</text>`;
    }

    let iW: number, iH: number, iXoff: number, iYoff: number;
    if (t.rotated) {
      iW = SURFACE_H;
      iH = r.h;
      iXoff = (r.w - SURFACE_H) / 2;
      iYoff = 0;
    } else {
      iW = r.w;
      iH = SURFACE_H;
      iXoff = 0;
      iYoff = (r.h - SURFACE_H) / 2;
    }
    const iX = (r.x - minX + PAD + iXoff) * sc;
    const iY = (r.y - minY + PAD + iYoff) * sc;
    const innerRx = (4 * sc).toFixed(1);
    const sz = Math.max(7, Math.round(10 * sc));
    const zrx = "4";
    let zones = "";
    if (t.rotated) {
      const zW = (SEAT_ZONE * sc).toFixed(1),
        zH = (iH * sc).toFixed(1);
      const zLX = ((r.x - minX + PAD + iXoff - SEAT_ZONE) * sc).toFixed(1);
      const zRX = ((r.x - minX + PAD + iXoff + SURFACE_H) * sc).toFixed(1);
      zones += `<rect x="${zLX}" y="${iY.toFixed(1)}" width="${zW}" height="${zH}" rx="${zrx}" fill="#efefef" stroke="#bbb" stroke-width="1" stroke-dasharray="3,3"/>`;
      zones += `<rect x="${zRX}" y="${iY.toFixed(1)}" width="${zW}" height="${zH}" rx="${zrx}" fill="#efefef" stroke="#bbb" stroke-width="1" stroke-dasharray="3,3"/>`;
    } else {
      const zW = (iW * sc).toFixed(1),
        zH = (SEAT_ZONE * sc).toFixed(1);
      const zX = iX.toFixed(1);
      const topZY = ((r.y - minY + PAD + iYoff - SEAT_ZONE) * sc).toFixed(1);
      zones += `<rect x="${zX}" y="${topZY}" width="${zW}" height="${zH}" rx="${zrx}" fill="#efefef" stroke="#bbb" stroke-width="1" stroke-dasharray="3,3"/>`;
      if (t.type === "rectangular") {
        const botZY = ((r.y - minY + PAD + iYoff + SURFACE_H) * sc).toFixed(1);
        zones += `<rect x="${zX}" y="${botZY}" width="${zW}" height="${zH}" rx="${zrx}" fill="#efefef" stroke="#bbb" stroke-width="1" stroke-dasharray="3,3"/>`;
      }
    }
    return `${zones}\n<rect x="${iX.toFixed(1)}" y="${iY.toFixed(1)}" width="${(iW * sc).toFixed(1)}" height="${(iH * sc).toFixed(1)}" rx="${innerRx}" fill="#e0e0e0" stroke="#555" stroke-width="2"/>\n<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="${sz}" font-family="Arial" fill="#222" font-weight="700">${t.label}</text>`;
  });

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" style="background:#fff">${shapes.join("\n")}</svg>`;

  // ── Guest list data ────────────────────────────────────────────────────────
  const guestMap = Object.fromEntries(attending.map((g) => [g.id, g]));
  const seatingTables = tables
    .filter((t) => t.type !== "decoration")
    .sort((a, b) => {
      const special = (l: string) =>
        l.toLowerCase().includes("mladen") ? -1 : 0;
      const sa = special(a.label),
        sb = special(b.label);
      if (sa !== sb) return sa - sb;
      return a.label.localeCompare(b.label, "sr");
    })
    .map((table) => {
      const guestSeats: Record<
        string,
        { name: string; here: number; total: number }
      > = {};
      for (const seat of table.assignments) {
        if (!seat) continue;
        const g = guestMap[seat.guestId];
        if (!guestSeats[seat.guestId])
          guestSeats[seat.guestId] = {
            name: seat.guestName,
            here: 0,
            total: parseInt(g?.guestCount || "1") || 1,
          };
        guestSeats[seat.guestId].here++;
      }
      return { label: table.label, guests: Object.values(guestSeats) };
    })
    .filter((t) => t.guests.length > 0);

  // ── SVG → PNG via canvas ───────────────────────────────────────────────────
  const svgImgData = await new Promise<string>((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = svgW * 2;
    canvas.height = svgH * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, svgW, svgH);
    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, svgW, svgH);
      URL.revokeObjectURL(url);
      // JPEG (white bg, high quality) keeps the file tiny vs. lossless PNG
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.src = url;
  });

  // ── Build PDF ──────────────────────────────────────────────────────────────
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });

  // Load fonts for Cyrillic support
  const [serifB64, sansB64] = await Promise.all([
    loadFont("/fonts/invitation/CormorantGaramond-Regular.ttf"),
    loadFont("/fonts/invitation/JosefinSans-Regular.ttf"),
  ]);
  doc.addFileToVFS("Serif.ttf", serifB64);
  doc.addFont("Serif.ttf", "Serif", "normal");
  doc.addFileToVFS("Sans.ttf", sansB64);
  doc.addFont("Sans.ttf", "Sans", "normal");

  const PW = 210,
    MARGIN = 15,
    CW = PW - MARGIN * 2;
  let y = MARGIN;

  doc.setFont("Serif");
  doc.setFontSize(28);
  doc.setTextColor(35, 35, 35);
  doc.text(coupleNames, PW / 2, y + 10, { align: "center" });
  y += 17;

  doc.setFont("Sans");
  doc.setFontSize(10);
  doc.setTextColor(160, 160, 160);
  doc.text("RASPORED SEDENJA", PW / 2, y + 4, { align: "center" });
  y += 12;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.25);
  doc.line(MARGIN, y, PW - MARGIN, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(195, 195, 195);
  doc.text("PLAN SALE", MARGIN, y);
  y += 7;

  const pxToMm = 25.4 / 96;
  const imgWmm = svgW * pxToMm,
    imgHmm = svgH * pxToMm;
  const maxH = 297 - MARGIN - y - 10;
  const fitScale = Math.min(CW / imgWmm, maxH / imgHmm, 1);
  const fW = imgWmm * fitScale,
    fH = imgHmm * fitScale;
  doc.addImage(svgImgData, "JPEG", MARGIN + (CW - fW) / 2, y, fW, fH);
  y += fH + 8;

  // ── QR code for /gde-sedim ─────────────────────────────────────────────────
  try {
    const QRCode = await import("qrcode");
    const qrUrl = `https://halouspomene.rs/pozivnica/${slug}/gde-sedim`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 512,
      margin: 1,
      color: { dark: "#232323", light: "#ffffff" },
    });
    const qrSizeInline = 28; // mm — when it fits on page 1
    const qrSizePage = 50; // mm — when it gets its own last page
    const remainingH = 297 - MARGIN - y;
    if (remainingH >= qrSizeInline + 12) {
      // Fits on the hall-schema page
      const qrX = PW / 2 - qrSizeInline / 2;
      doc.addImage(qrDataUrl, "PNG", qrX, y, qrSizeInline, qrSizeInline);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(
        "QR kod za goste za brz pronalazak mesta",
        PW / 2,
        y + qrSizeInline + 4,
        { align: "center" },
      );
    } else {
      // Doesn't fit — add as the very last page
      doc.addPage();
      const qrX = PW / 2 - qrSizePage / 2;
      const qrY = 297 / 2 - qrSizePage / 2 - 10;
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSizePage, qrSizePage);
      doc.setFontSize(9);
      doc.setTextColor(160, 160, 160);
      doc.text(
        "QR kod za goste za brz pronalazak mesta",
        PW / 2,
        qrY + qrSizePage + 6,
        { align: "center" },
      );
    }
  } catch {
    // QR generation is non-critical — skip silently
  }

  // ── Guest list + index pages, rendered as NATIVE PDF TEXT ──────────────────
  // No rasterization: the Serif font (Cormorant Garamond) covers Serbian Latin
  // diacritics AND Cyrillic, so guest names of either script render correctly
  // while keeping the file tiny (vector text instead of full-page bitmaps).
  const COL_GAP = 6; // mm between the two columns
  const COL_W = (CW - COL_GAP) / 2;
  const ROW_H = 6; // mm per guest row
  const LABEL_H = 9; // mm for a table label + its divider
  const BLOCK_GAP = 4; // mm after each table block
  const TITLE_H = 10; // mm reserved for a page title
  const USABLE_H = 297 - MARGIN * 2; // content height available per page
  const colX = (c: number) => MARGIN + (c === 0 ? 0 : COL_W + COL_GAP);

  const pageTitle = (label: string) => {
    doc.setFont("Sans");
    doc.setFontSize(9);
    doc.setTextColor(170, 170, 170);
    doc.text(label, MARGIN, MARGIN + 6, { charSpace: 0.8 });
  };

  // ── Per-table guest lists ──────────────────────────────────────────────────
  type GBlock = {
    c: number;
    y: number;
    t: { label: string; guests: { name: string; here: number; total: number }[] };
  };
  const gPages: GBlock[][] = [];
  let gPage: GBlock[] = [];
  let gColY = [TITLE_H, TITLE_H];

  for (const t of seatingTables) {
    const bh = LABEL_H + t.guests.length * ROW_H + BLOCK_GAP;
    let c = gColY[0] <= gColY[1] ? 0 : 1;
    if (gColY[c] + bh > USABLE_H) {
      const oc = 1 - c;
      if (gColY[oc] + bh <= USABLE_H) {
        c = oc;
      } else {
        gPages.push(gPage);
        gPage = [];
        gColY = [0, 0];
        c = 0;
      }
    }
    gPage.push({ c, y: gColY[c], t });
    gColY[c] += bh;
  }
  if (gPage.length) gPages.push(gPage);

  for (let pi = 0; pi < gPages.length; pi++) {
    doc.addPage();
    if (pi === 0) pageTitle("RASPORED GOSTIJU PO STOLOVIMA");

    for (const { c, y: by, t } of gPages[pi]) {
      const x = colX(c);
      const top = MARGIN + by;
      // Table label
      doc.setFont("Serif");
      doc.setFontSize(13);
      doc.setTextColor(35, 35, 35);
      doc.text(t.label.toUpperCase(), x, top + LABEL_H * 0.62);
      // Divider under label
      doc.setDrawColor(221, 221, 221);
      doc.setLineWidth(0.4);
      doc.line(x, top + LABEL_H, x + COL_W, top + LABEL_H);
      // Guest rows
      doc.setFontSize(10.5);
      let gy = top + LABEL_H;
      for (const g of t.guests) {
        const ty = gy + ROW_H * 0.68;
        doc.setTextColor(35, 35, 35);
        doc.text(g.name, x + 1, ty);
        doc.setTextColor(170, 170, 170);
        doc.text(`${g.here}/${g.total}`, x + COL_W - 1, ty, { align: "right" });
        gy += ROW_H;
        doc.setDrawColor(240, 240, 240);
        doc.setLineWidth(0.2);
        doc.line(x, gy, x + COL_W, gy);
      }
    }
  }

  // ── Alphabetical guest index ───────────────────────────────────────────────
  const guestTableMap: Record<string, Set<string>> = {};
  for (const t of seatingTables) {
    for (const g of t.guests) {
      if (!guestTableMap[g.name]) guestTableMap[g.name] = new Set();
      guestTableMap[g.name].add(t.label);
    }
  }
  const allGuests = Object.entries(guestTableMap)
    .map(([name, tableSet]) => ({ name, tables: [...tableSet].join(", ") }))
    .sort((a, b) => a.name.localeCompare(b.name, "sr"));

  if (allGuests.length > 0) {
    type ABlock = { c: number; y: number; g: { name: string; tables: string } };
    const aPages: ABlock[][] = [];
    let aPage: ABlock[] = [];
    let aColY = [TITLE_H, TITLE_H];
    let aCol = 0; // fill column 0, then column 1, then a new page

    for (const g of allGuests) {
      if (aColY[aCol] + ROW_H > USABLE_H) {
        if (aCol === 0) {
          aCol = 1;
        } else {
          aPages.push(aPage);
          aPage = [];
          aColY = [0, 0];
          aCol = 0;
        }
      }
      aPage.push({ c: aCol, y: aColY[aCol], g });
      aColY[aCol] += ROW_H;
    }
    if (aPage.length) aPages.push(aPage);

    for (let pi = 0; pi < aPages.length; pi++) {
      doc.addPage();
      if (pi === 0) pageTitle("ABECEDNI SPISAK GOSTIJU");

      doc.setFont("Serif");
      doc.setFontSize(10.5);
      for (const { c, y: by, g } of aPages[pi]) {
        const x = colX(c);
        const ty = MARGIN + by + ROW_H * 0.68;
        doc.setTextColor(35, 35, 35);
        doc.text(g.name, x + 1, ty);
        doc.setTextColor(170, 170, 170);
        doc.text(g.tables, x + COL_W - 1, ty, { align: "right" });
        doc.setDrawColor(240, 240, 240);
        doc.setLineWidth(0.2);
        doc.line(x, MARGIN + by + ROW_H, x + COL_W, MARGIN + by + ROW_H);
      }
    }
  }

  doc.save(`raspored-sedenja-${coupleNames.replace(/[\s/\\]+/g, "-")}.pdf`);
}
