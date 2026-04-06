"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import type { TableData } from "./types";

// Desktop canvas & geometry constants (from TableNode.tsx)
const CANVAS_W = 1600;
const CANVAS_H = 1100;
const SEAT_SIZE = 30;
const SEAT_ORBIT_R = 68;

/** Compute the desktop bounding-box width/height for a table */
function desktopSize(t: TableData): { w: number; h: number } {
  if (t.type === "circle") {
    const d = (SEAT_ORBIT_R + SEAT_SIZE / 2 + 6) * 2; // ~178
    return { w: d, h: d };
  }
  const seatsPerRow = t.type === "rectangular" ? t.seats / 2 : t.seats;
  const rowW = Math.max(160, seatsPerRow * (SEAT_SIZE + 6) - 6 + 32);
  const rowH = 28 + 8 + SEAT_SIZE + 8 + 40 + 8 + SEAT_SIZE + 12; // ~164
  if (t.type === "rectangular" && t.rotated) return { w: rowH, h: rowW };
  if (t.type === "single-sided") return { w: rowW, h: 28 + 8 + SEAT_SIZE + 8 + 40 + 12 }; // ~126
  return { w: rowW, h: rowH };
}

interface Props {
  tables: TableData[];
  onSave: (tables: TableData[]) => void;
  onCancel: () => void;
  isSaving: boolean;
}

interface DragState {
  tableId: string;
  startX: number;
  startY: number;
  startPosX: number;
  startPosY: number;
}

export default function MobileLayoutScreen({
  tables,
  onSave,
  onCancel,
  isSaving,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  // Positions stored in desktop coordinate space (0..1600, 0..1100)
  const [desktopPositions, setDesktopPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [scale, setScale] = useState(0.22);
  const [ready, setReady] = useState(false);

  const seatingTables = tables.filter((t) => t.type !== "decoration");

  // Width-based scale: fill container width, scroll vertically if needed
  const virtualW = CANVAS_W * scale;
  const virtualH = CANVAS_H * scale;

  // Initialize: measure container, compute scale, seed positions
  useEffect(() => {
    if (!containerRef.current) return;
    const cw = containerRef.current.getBoundingClientRect().width - 16; // 8px padding each side
    const s = cw / CANVAS_W;
    setScale(s);

    const initial: Record<string, { x: number; y: number }> = {};
    const hasPositions = seatingTables.some((t) => t.x > 250 || t.y > 290);

    seatingTables.forEach((t, i) => {
      if (hasPositions) {
        initial[t.id] = { x: t.x, y: t.y };
      } else {
        const cols = 3;
        const gapX = CANVAS_W / (cols + 1);
        const gapY = 250;
        initial[t.id] = {
          x: gapX * ((i % cols) + 1) - 80,
          y: gapY * Math.floor(i / cols) + 60,
        };
      }
    });

    setDesktopPositions(initial);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, tableId: string) => {
      const touch = e.touches[0];
      const pos = desktopPositions[tableId];
      if (!pos) return;
      dragRef.current = {
        tableId,
        startX: touch.clientX,
        startY: touch.clientY,
        startPosX: pos.x,
        startPosY: pos.y,
      };
    },
    [desktopPositions],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!dragRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      // Convert screen px delta to desktop coordinate delta
      const dx = (touch.clientX - dragRef.current.startX) / scale;
      const dy = (touch.clientY - dragRef.current.startY) / scale;

      const x = Math.max(0, Math.min(CANVAS_W - 40, dragRef.current.startPosX + dx));
      const y = Math.max(0, Math.min(CANVAS_H - 40, dragRef.current.startPosY + dy));

      setDesktopPositions((prev) => ({
        ...prev,
        [dragRef.current!.tableId]: { x, y },
      }));
    },
    [scale],
  );

  const handleTouchEnd = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleSave = () => {
    const updated = tables.map((t) => {
      const pos = desktopPositions[t.id];
      if (!pos) return t;
      return { ...t, x: Math.round(pos.x), y: Math.round(pos.y) };
    });
    onSave(updated);
  };

  const getShape = (table: TableData) => {
    const pos = desktopPositions[table.id] ?? { x: 50, y: 50 };
    const filled = table.assignments.filter(Boolean).length;
    const label = table.label.length > 8 ? table.label.slice(0, 7) + "…" : table.label;

    // Scale desktop bounding box to screen
    const ds = desktopSize(table);
    const screenW = ds.w * scale;
    const screenH = ds.h * scale;
    // Minimum legible size
    const minW = 44;
    const minH = 24;
    const w = Math.max(minW, screenW);
    const h = Math.max(minH, screenH);

    const screenX = pos.x * scale;
    const screenY = pos.y * scale;

    const isCircle = table.type === "circle";

    return (
      <div
        key={table.id}
        style={{
          position: "absolute",
          left: screenX,
          top: screenY,
          width: w,
          height: h,
          touchAction: "none",
        }}
        className="active:scale-105 transition-transform"
        onTouchStart={(e) => handleTouchStart(e, table.id)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`w-full h-full flex flex-col items-center justify-center ${isCircle ? "rounded-full" : "rounded"}`}
          style={{
            backgroundColor: "color-mix(in srgb, var(--theme-primary) 12%, var(--theme-background))",
            border: "1.5px solid var(--theme-primary)",
          }}
        >
          <span
            className="font-raleway font-bold leading-tight truncate px-1"
            style={{ color: "var(--theme-primary)", fontSize: Math.max(7, Math.min(9, w / 7)) }}
          >
            {label}
          </span>
          <span
            className="font-raleway"
            style={{ color: "var(--theme-text-light)", fontSize: Math.max(6, Math.min(8, w / 8)) }}
          >
            {filled}/{table.seats}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[65] flex flex-col"
      style={{ backgroundColor: "var(--theme-background)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{
          paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid var(--theme-border-light)",
          backgroundColor: "var(--theme-surface)",
        }}
      >
        <div>
          <h2 className="font-raleway font-semibold text-sm" style={{ color: "var(--theme-text)" }}>
            Rasporedi stolove po sali
          </h2>
          <p className="text-[11px] font-raleway mt-0.5" style={{ color: "var(--theme-text-light)" }}>
            Prevuci stolove na željene pozicije
          </p>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ color: "var(--theme-text-light)" }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Canvas — width-fills, scrolls vertically */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto px-2"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--theme-border) 50%, transparent) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {ready && (
          <div
            className="relative mx-auto"
            style={{
              width: virtualW,
              height: virtualH,
              border: "1px dashed var(--theme-border)",
              borderRadius: 8,
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            {seatingTables.map(getShape)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="shrink-0 px-4"
        style={{
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--theme-border-light)",
          backgroundColor: "var(--theme-surface)",
        }}
      >
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 rounded-xl font-raleway text-sm font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--theme-primary)" }}
        >
          {isSaving ? (
            <>
              <span className="loading loading-spinner loading-xs" style={{ color: "white" }} />
              Čuvam...
            </>
          ) : (
            "Sačuvaj raspored"
          )}
        </button>
      </div>
    </div>
  );
}
