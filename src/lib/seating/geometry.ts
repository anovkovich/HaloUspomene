/**
 * Pure geometry helpers for table layout.
 * No browser APIs, no jsPDF — safe to import from server components and client components alike.
 */

import type { TableData } from "./types";

export const SEAT_SZ = 30;
export const ORBIT_R = 68;
export const HEADER_H = 28;
export const SURFACE_H = 60;
export const SEAT_ZONE = SEAT_SZ + 10;

/** Hall-outline (`decorationType: "wall"`) defaults, shared by every renderer. */
export const WALL_DEFAULT_W = 1400;
export const WALL_DEFAULT_H = 950;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Returns the bounding rectangle for a table in canvas coordinates. */
export function rectFor(t: TableData): Rect {
  if (t.type === "circle") {
    const d = (ORBIT_R + SEAT_SZ / 2 + 6) * 2;
    return { x: t.x, y: t.y, w: d, h: d };
  }

  if (t.type === "decoration") {
    if (t.decorationType === "entrance") {
      return { x: t.x + 32, y: t.y + 32, w: 150, h: 36 };
    }
    // The hall outline has no header strip, so its height is the raw value.
    if (t.decorationType === "wall") {
      return {
        x: t.x,
        y: t.y,
        w: t.decoWidth ?? WALL_DEFAULT_W,
        h: t.decoHeight ?? WALL_DEFAULT_H,
      };
    }
    return { x: t.x, y: t.y, w: t.decoWidth ?? 160, h: (t.decoHeight ?? 80) + HEADER_H };
  }

  // rectangular or single-sided
  const spr = t.type === "rectangular" ? t.seats / 2 : t.seats;
  const long = Math.max(160, spr * (SEAT_SZ + 6) - 6 + 32);

  if (t.type === "rectangular") {
    if (t.rotated) return { x: t.x, y: t.y, w: SURFACE_H + SEAT_ZONE * 2, h: long };
    return { x: t.x, y: t.y, w: long, h: SURFACE_H + SEAT_ZONE * 2 };
  }

  // single-sided (one seat row) — also obeys rotation like the rectangular table
  if (t.rotated) return { x: t.x, y: t.y, w: SURFACE_H + SEAT_ZONE, h: long };
  return { x: t.x, y: t.y, w: long, h: SURFACE_H + SEAT_ZONE };
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

/** Computes the bounding box over all tables. Falls back to a 400×300 area when there are no tables. */
export function computeBoundingBox(tables: TableData[]): BoundingBox {
  if (tables.length === 0) {
    return { minX: 0, minY: 0, maxX: 400, maxY: 300, width: 400, height: 300 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const t of tables) {
    const r = rectFor(t);
    if (r.x < minX) minX = r.x;
    if (r.y < minY) minY = r.y;
    if (r.x + r.w > maxX) maxX = r.x + r.w;
    if (r.y + r.h > maxY) maxY = r.y + r.h;
  }

  if (!isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 400, maxY: 300, width: 400, height: 300 };
  }

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export interface LayoutStats {
  /** Real tables only — decorations (music, dance floor, entrance, walls) never count. */
  tableCount: number;
  totalSeats: number;
}

/** Table + seat totals for a layout. Mirrors the count used by the admin
 *  seatings endpoint, so hall templates and live layouts report the same way. */
export function computeLayoutStats(tables: TableData[]): LayoutStats {
  let tableCount = 0;
  let totalSeats = 0;
  for (const t of tables) {
    if (t.type === "decoration") continue;
    tableCount += 1;
    totalSeats += t.seats;
  }
  return { tableCount, totalSeats };
}

/**
 * Shifts a whole layout so its bounding box starts at (`originX`, `originY`).
 *
 * The desktop editor draws into a 12000×9000 world while the mobile and
 * PWA canvases are a fixed 1600×1100 — a layout parked far out in the desktop
 * world would land off-screen everywhere else. Normalising on save (and again
 * on load) keeps a saved hall scheme usable in every canvas mode.
 */
export function normalizeTablesToOrigin(
  tables: TableData[],
  originX = 80,
  originY = 80
): TableData[] {
  if (tables.length === 0) return tables;
  const { minX, minY } = computeBoundingBox(tables);
  const dx = originX - minX;
  const dy = originY - minY;
  if (dx === 0 && dy === 0) return tables;
  return tables.map((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
}
