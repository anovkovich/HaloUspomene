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
    return { x: t.x, y: t.y, w: t.decoWidth ?? 160, h: (t.decoHeight ?? 80) + HEADER_H };
  }

  // rectangular or single-sided
  const spr = t.type === "rectangular" ? t.seats / 2 : t.seats;
  const long = Math.max(160, spr * (SEAT_SZ + 6) - 6 + 32);

  if (t.type === "rectangular") {
    if (t.rotated) return { x: t.x, y: t.y, w: SURFACE_H + SEAT_ZONE * 2, h: long };
    return { x: t.x, y: t.y, w: long, h: SURFACE_H + SEAT_ZONE * 2 };
  }

  // single-sided
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
