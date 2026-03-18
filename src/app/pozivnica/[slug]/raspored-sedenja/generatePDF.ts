import type { RSVPEntry } from "@/lib/rsvp";
import type { TableData } from "./types";

export async function generateAndDownloadPDF(
  tables: TableData[],
  attending: RSVPEntry[],
  coupleNames: string,
  slug: string,
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
  const guestMap = Object.fromEntries(attending.map((g) => [g.id, g]));
  const seatingTables = tables
    .filter((t) => t.type !== "decoration")
    .sort((a, b) => {
      const special = (l: string) => l.toLowerCase().includes("mladen") ? -1 : 0;
      const sa = special(a.label), sb = special(b.label);
      if (sa !== sb) return sa - sb;
      return a.label.localeCompare(b.label, "sr");
    })
    .map((table) => {
      const guestSeats: Record<string, { name: string; here: number; total: number }> = {};
      for (const seat of table.assignments) {
        if (!seat) continue;
        const g = guestMap[seat.guestId];
        if (!guestSeats[seat.guestId])
          guestSeats[seat.guestId] = { name: seat.guestName, here: 0, total: parseInt(g?.guestCount || "1") || 1 };
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
  y += fH + 8;

  // ── QR code for /gde-sedim ─────────────────────────────────────────────────
  try {
    const QRCode = await import("qrcode");
    const qrUrl = `https://halouspomene.rs/pozivnica/${slug}/gde-sedim`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 512, margin: 1, color: { dark: "#232323", light: "#ffffff" } });
    const qrSizeInline = 28; // mm — when it fits on page 1
    const qrSizePage  = 50; // mm — when it gets its own last page
    const remainingH = 297 - MARGIN - y;
    if (remainingH >= qrSizeInline + 12) {
      // Fits on the hall-schema page
      const qrX = PW / 2 - qrSizeInline / 2;
      doc.addImage(qrDataUrl, "PNG", qrX, y, qrSizeInline, qrSizeInline);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text("Skenirajte za pregled rasporeda sedenja", PW / 2, y + qrSizeInline + 4, { align: "center" });
    } else {
      // Doesn't fit — add as the very last page
      doc.addPage();
      const qrX = PW / 2 - qrSizePage / 2;
      const qrY = 297 / 2 - qrSizePage / 2 - 10;
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSizePage, qrSizePage);
      doc.setFontSize(9);
      doc.setTextColor(160, 160, 160);
      doc.text("Skenirajte za pregled rasporeda sedenja", PW / 2, qrY + qrSizePage + 6, { align: "center" });
    }
  } catch {
    // QR generation is non-critical — skip silently
  }

  // ── Guest list pages via SVG rendering ────────────────────────────────────
  // SVG→canvas→PNG so the browser font engine handles all Unicode (diacritics)
  const escXml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const GW = 1160; // SVG px width, maps to CW mm in PDF
  const GSCALE = GW / CW; // px per mm
  const gmm = (n: number) => Math.round(n * GSCALE);
  const gpt = (n: number) => Math.round(n * GSCALE * 0.353); // pt → SVG px

  const G_colGap = gmm(5);
  const G = {
    rowH: gmm(6), labelH: gmm(8.5), gap: gmm(3),
    colGap: G_colGap, colW: Math.floor((GW - G_colGap) / 2),
    pageH: gmm(267), titleH: gmm(10),
    fsTitle: gpt(9), fsLabel: gpt(11), fsGuest: gpt(10),
  };

  const svgImg = (svg: string, w: number, h: number): Promise<string> =>
    new Promise(resolve => {
      const c = document.createElement("canvas");
      c.width = w * 2; c.height = h * 2;
      const ctx = c.getContext("2d")!;
      ctx.scale(2, 2); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
      const img = new Image();
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
      img.onload = () => { ctx.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url); resolve(c.toDataURL("image/png")); };
      img.src = url;
    });

  type GBlock = { x: number; y: number; t: { label: string; guests: { name: string; here: number; total: number }[] } };
  const gPages: GBlock[][] = [];
  let gPage: GBlock[] = [];
  let gColY = [G.titleH, G.titleH];

  for (const t of seatingTables) {
    const bh = G.labelH + t.guests.length * G.rowH + G.gap;
    let c = gColY[0] <= gColY[1] ? 0 : 1;
    if (gColY[c] + bh > G.pageH) {
      const oc = 1 - c;
      if (gColY[oc] + bh <= G.pageH) { c = oc; }
      else { gPages.push(gPage); gPage = []; gColY = [0, 0]; c = 0; }
    }
    gPage.push({ x: c === 0 ? 0 : G.colW + G.colGap, y: gColY[c], t });
    gColY[c] += bh;
  }
  if (gPage.length) gPages.push(gPage);

  for (let pi = 0; pi < gPages.length; pi++) {
    const blocks = gPages[pi];
    const maxY = Math.max(...blocks.map(b => b.y + G.labelH + b.t.guests.length * G.rowH + G.gap));
    const svgH = Math.max(100, maxY);

    let inner = "";
    if (pi === 0) {
      inner += `<text x="0" y="${Math.round(G.titleH * 0.72)}" font-size="${G.fsTitle}" font-family="Arial,sans-serif" fill="#aaa" letter-spacing="3">${escXml("RASPORED GOSTIJU PO STOLOVIMA")}</text>`;
    }

    for (const { x, y: by, t } of blocks) {
      inner += `<text x="${x}" y="${by + Math.round(G.labelH * 0.72)}" font-size="${G.fsLabel}" font-family="Arial,sans-serif" fill="#232323" font-weight="700">${escXml(t.label.toUpperCase())}</text>`;
      inner += `<line x1="${x}" y1="${by + G.labelH}" x2="${x + G.colW}" y2="${by + G.labelH}" stroke="#ddd" stroke-width="1.5"/>`;
      let gy = by + G.labelH;
      for (const g of t.guests) {
        const ty = gy + Math.round(G.rowH * 0.68);
        inner += `<text x="${x + 3}" y="${ty}" font-size="${G.fsGuest}" font-family="Arial,sans-serif" fill="#232323">${escXml(g.name)}</text>`;
        inner += `<text x="${x + G.colW - 3}" y="${ty}" font-size="${G.fsGuest}" font-family="Arial,sans-serif" fill="#aaa" text-anchor="end">${g.here}/${g.total}</text>`;
        gy += G.rowH;
        inner += `<line x1="${x}" y1="${gy}" x2="${x + G.colW}" y2="${gy}" stroke="#f0f0f0" stroke-width="1"/>`;
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${GW}" height="${svgH}">${inner}</svg>`;
    const gImgData = await svgImg(svg, GW, svgH);
    doc.addPage();
    doc.addImage(gImgData, "PNG", MARGIN, MARGIN, CW, svgH / GSCALE);
  }

  // ── Alphabetical guest index page ──────────────────────────────────────────
  // Build flat list: guest name → table label(s)
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
    // Reuse same SVG helpers (GW, GSCALE, gmm, gpt, G, svgImg, escXml)
    type ABlock = { x: number; y: number; g: { name: string; tables: string } };
    const aPages: ABlock[][] = [];
    let aPage: ABlock[] = [];
    let aColY = [G.titleH, G.titleH];
    let aCol = 0; // always fill col 0 first, then col 1

    for (const g of allGuests) {
      const bh = G.rowH;
      if (aColY[aCol] + bh > G.pageH) {
        if (aCol === 0) {
          aCol = 1; // switch to second column
        } else {
          aPages.push(aPage); aPage = []; aColY = [0, 0]; aCol = 0;
        }
      }
      const c = aCol;
      aPage.push({ x: c === 0 ? 0 : G.colW + G.colGap, y: aColY[c], g });
      aColY[c] += bh;
    }
    if (aPage.length) aPages.push(aPage);

    for (let pi = 0; pi < aPages.length; pi++) {
      const blocks = aPages[pi];
      const maxY = Math.max(...blocks.map(b => b.y + G.rowH));
      const svgH = Math.max(100, maxY);

      let inner = "";
      if (pi === 0) {
        inner += `<text x="0" y="${Math.round(G.titleH * 0.72)}" font-size="${G.fsTitle}" font-family="Arial,sans-serif" fill="#aaa" letter-spacing="3">${escXml("ABECEDNI SPISAK GOSTIJU")}</text>`;
      }

      for (const { x, y: by, g } of blocks) {
        const ty = by + Math.round(G.rowH * 0.68);
        inner += `<text x="${x + 3}" y="${ty}" font-size="${G.fsGuest}" font-family="Arial,sans-serif" fill="#232323">${escXml(g.name)}</text>`;
        inner += `<text x="${x + G.colW - 3}" y="${ty}" font-size="${G.fsGuest}" font-family="Arial,sans-serif" fill="#aaa" text-anchor="end">${escXml(g.tables)}</text>`;
        inner += `<line x1="${x}" y1="${by + G.rowH}" x2="${x + G.colW}" y2="${by + G.rowH}" stroke="#f0f0f0" stroke-width="1"/>`;
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${GW}" height="${svgH}">${inner}</svg>`;
      const aImgData = await svgImg(svg, GW, svgH);
      doc.addPage();
      doc.addImage(aImgData, "PNG", MARGIN, MARGIN, CW, svgH / GSCALE);
    }
  }

  doc.save(`raspored-sedenja-${coupleNames.replace(/[\s/\\]+/g, "-")}.pdf`);
}
