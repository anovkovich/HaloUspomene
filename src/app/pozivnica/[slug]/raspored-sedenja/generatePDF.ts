import type { RSVPEntry } from "@/lib/google-sheets";
import type { TableData } from "./types";

export async function generateAndDownloadPDF(
  tables: TableData[],
  attending: RSVPEntry[],
  coupleNames: string,
) {
  // ── Floor plan SVG ────────────────────────────────────────────────────────
  const SEAT_SZ = 30, ORBIT_R = 68, HEADER_H = 28, SURFACE_H = 60, SEAT_ZONE = SEAT_SZ + 10;
  type Rect = { x: number; y: number; w: number; h: number };

  const rectFor = (t: TableData): Rect => {
    if (t.type === "circle") { const d = (ORBIT_R + SEAT_SZ / 2 + 6) * 2; return { x: t.x, y: t.y, w: d, h: d }; }
    if (t.type === "decoration") {
      if (t.decorationType === "entrance") return { x: t.x + 32, y: t.y + 32, w: 150, h: 36 };
      return { x: t.x, y: t.y, w: t.decoWidth ?? 160, h: (t.decoHeight ?? 80) + HEADER_H };
    }
    const spr = t.type === "rectangular" ? t.seats / 2 : t.seats;
    const long = Math.max(160, spr * (SEAT_SZ + 6) - 6 + 32);
    if (t.type === "rectangular") {
      if (t.rotated) return { x: t.x, y: t.y, w: SURFACE_H + SEAT_ZONE * 2, h: long };
      return { x: t.x, y: t.y, w: long, h: SURFACE_H + SEAT_ZONE * 2 };
    }
    return { x: t.x, y: t.y, w: long, h: SURFACE_H + SEAT_ZONE };
  };

  const rects = tables.map(rectFor);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const r of rects) { minX = Math.min(minX, r.x); minY = Math.min(minY, r.y); maxX = Math.max(maxX, r.x + r.w); maxY = Math.max(maxY, r.y + r.h); }
  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 400; maxY = 300; }

  const PAD = 24, sc = Math.min(1, 640 / (maxX - minX + PAD * 2));
  const svgW = Math.round((maxX - minX + PAD * 2) * sc);
  const svgH = Math.round((maxY - minY + PAD * 2) * sc);
  const fx = (x: number) => ((x - minX + PAD) * sc).toFixed(1);
  const fy = (y: number) => ((y - minY + PAD) * sc).toFixed(1);
  const fs = (v: number) => (v * sc).toFixed(1);
  const fcx = (r: Rect) => ((r.x - minX + PAD + r.w / 2) * sc).toFixed(1);
  const fcy = (r: Rect) => ((r.y - minY + PAD + r.h / 2) * sc).toFixed(1);

  const shapes = tables.map((t, i) => {
    const r = rects[i], cx = fcx(r), cy = fcy(r);

    if (t.type === "circle") {
      const outerR = fs(r.w / 2), innerR = (r.w / 2 * sc * 0.58).toFixed(1);
      const lY = ((r.y - minY + PAD + r.h / 2 + 4) * sc).toFixed(1);
      const sz = Math.max(7, Math.round(11 * sc));
      return `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="#efefef" stroke="#bbb" stroke-width="1" stroke-dasharray="3,3"/>\n<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#e0e0e0" stroke="#555" stroke-width="2"/>\n<text x="${cx}" y="${lY}" text-anchor="middle" font-size="${sz}" font-family="Arial" fill="#222" font-weight="700">${t.label}</text>`;
    }

    if (t.type === "decoration") {
      const sz = Math.max(7, Math.round(9 * sc));
      if (t.decorationType === "entrance") {
        const arrow = t.entranceDirection === "down" ? "↓" : t.entranceDirection === "left" ? "←" : t.entranceDirection === "right" ? "→" : "↑";
        return `<rect x="${fx(r.x)}" y="${fy(r.y)}" width="${fs(r.w)}" height="${fs(r.h)}" rx="4" fill="#f0f0f0" stroke="#888" stroke-width="1.5" stroke-dasharray="5,4"/>\n<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="${sz}" font-family="Arial" fill="#333">${arrow} ${t.label}</text>`;
      }
      const icon = t.decorationType === "music" ? "♪" : "♫";
      return `<rect x="${fx(r.x)}" y="${fy(r.y)}" width="${fs(r.w)}" height="${fs(r.h)}" rx="4" fill="#f0f0f0" stroke="#888" stroke-width="1.5" stroke-dasharray="5,4"/>\n<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="${sz}" font-family="Arial" fill="#333">${icon} ${t.label}</text>`;
    }

    let iW: number, iH: number, iXoff: number, iYoff: number;
    if (t.rotated) {
      iW = SURFACE_H; iH = r.h;
      iXoff = (r.w - SURFACE_H) / 2; iYoff = 0;
    } else {
      iW = r.w; iH = SURFACE_H;
      iXoff = 0; iYoff = (r.h - SURFACE_H) / 2;
    }
    const iX = (r.x - minX + PAD + iXoff) * sc;
    const iY = (r.y - minY + PAD + iYoff) * sc;
    const innerRx = (4 * sc).toFixed(1);
    const sz = Math.max(7, Math.round(10 * sc));
    const zrx = "4";
    let zones = "";
    if (t.rotated) {
      const zW = (SEAT_ZONE * sc).toFixed(1), zH = (iH * sc).toFixed(1);
      const zLX = ((r.x - minX + PAD + iXoff - SEAT_ZONE) * sc).toFixed(1);
      const zRX = ((r.x - minX + PAD + iXoff + SURFACE_H) * sc).toFixed(1);
      zones += `<rect x="${zLX}" y="${iY.toFixed(1)}" width="${zW}" height="${zH}" rx="${zrx}" fill="#efefef" stroke="#bbb" stroke-width="1" stroke-dasharray="3,3"/>`;
      zones += `<rect x="${zRX}" y="${iY.toFixed(1)}" width="${zW}" height="${zH}" rx="${zrx}" fill="#efefef" stroke="#bbb" stroke-width="1" stroke-dasharray="3,3"/>`;
    } else {
      const zW = (iW * sc).toFixed(1), zH = (SEAT_ZONE * sc).toFixed(1);
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
  const guestMap = Object.fromEntries(attending.map((g) => [g.rowIndex, g]));
  const seatingTables = tables
    .filter((t) => t.type !== "decoration")
    .map((table) => {
      const guestSeats: Record<number, { name: string; here: number; total: number }> = {};
      for (const seat of table.assignments) {
        if (!seat) continue;
        const g = guestMap[seat.guestRowIndex];
        if (!guestSeats[seat.guestRowIndex])
          guestSeats[seat.guestRowIndex] = { name: seat.guestName, here: 0, total: parseInt(g?.plusOnes || "1") || 1 };
        guestSeats[seat.guestRowIndex].here++;
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
    img.onload = () => { ctx.drawImage(img, 0, 0, svgW, svgH); URL.revokeObjectURL(url); resolve(canvas.toDataURL("image/png")); };
    img.src = url;
  });

  // ── Build PDF ──────────────────────────────────────────────────────────────
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PW = 210, MARGIN = 15, CW = PW - MARGIN * 2;
  let y = MARGIN;

  doc.setFontSize(28);
  doc.setTextColor(35, 35, 35);
  doc.text(coupleNames, PW / 2, y + 10, { align: "center" });
  y += 17;

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
  const imgWmm = svgW * pxToMm, imgHmm = svgH * pxToMm;
  const maxH = 297 - MARGIN - y - 10;
  const fitScale = Math.min(CW / imgWmm, maxH / imgHmm, 1);
  const fW = imgWmm * fitScale, fH = imgHmm * fitScale;
  doc.addImage(svgImgData, "PNG", MARGIN + (CW - fW) / 2, y, fW, fH);

  // ── Guest list page ────────────────────────────────────────────────────────
  doc.addPage();
  y = MARGIN;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("RASPORED GOSTIJU PO STOLOVIMA", MARGIN, y);
  y += 9;

  const COL_GAP = 5, COL_W = (CW - COL_GAP) / 2;
  const col1X = MARGIN, col2X = MARGIN + COL_W + COL_GAP;
  let colY = [y, y], col = 0;
  const PAGE_H = 297;

  for (const table of seatingTables) {
    const blockH = 7 + table.guests.length * 6 + 3;
    if (colY[col] + blockH > PAGE_H - MARGIN) {
      if (col === 0 && colY[1] + blockH <= PAGE_H - MARGIN) {
        col = 1;
      } else {
        doc.addPage();
        colY = [MARGIN, MARGIN];
        col = 0;
      }
    }
    const x = col === 0 ? col1X : col2X;
    let by = colY[col];

    doc.setFontSize(11);
    doc.setTextColor(35, 35, 35);
    doc.setFont("helvetica", "bold");
    doc.text(table.label.toUpperCase(), x, by);
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.2);
    doc.line(x, by + 1.5, x + COL_W, by + 1.5);
    by += 6.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const g of table.guests) {
      doc.setTextColor(35, 35, 35);
      doc.text(g.name, x, by);
      doc.setTextColor(160, 160, 160);
      doc.text(`${g.here}/${g.total}`, x + COL_W, by, { align: "right" });
      doc.setDrawColor(245, 245, 245);
      doc.line(x, by + 1, x + COL_W, by + 1);
      by += 6;
    }
    colY[col] = by + 3;
    col = colY[0] <= colY[1] ? 0 : 1;
  }

  doc.save(`raspored-sedenja-${coupleNames.replace(/[\s/\\]+/g, "-")}.pdf`);
}
