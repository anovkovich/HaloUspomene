"use client";

import type { TableData } from "../types";
import { rectFor, computeBoundingBox } from "../geometry";

interface Props {
  tables: TableData[];
  /** Rendered height of the preview box in px. */
  height?: number;
}

const PAD = 40;

/**
 * Read-only thumbnail of a hall scheme, used in the "Učitaj šemu sale" picker.
 *
 * Deliberately schematic — table outlines and the hall walls only, no seats or
 * labels. Its job is to let someone recognise their venue at a glance.
 */
export default function SchemePreview({ tables, height = 200 }: Props) {
  if (tables.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center rounded-lg text-xs font-raleway"
        style={{
          height,
          backgroundColor: "var(--theme-background)",
          border: "1px dashed var(--theme-border-light)",
          color: "var(--theme-text-light)",
        }}
      >
        Šema je još prazna
      </div>
    );
  }

  const bbox = computeBoundingBox(tables);
  const isWall = (t: TableData) =>
    t.type === "decoration" && t.decorationType === "wall";
  const ordered = [...tables.filter(isWall), ...tables.filter((t) => !isWall(t))];

  return (
    <div
      className="w-full rounded-lg overflow-hidden"
      style={{
        height,
        backgroundColor: "var(--theme-background)",
        border: "1px solid var(--theme-border-light)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`${bbox.minX - PAD} ${bbox.minY - PAD} ${bbox.width + PAD * 2} ${bbox.height + PAD * 2}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >
        {ordered.map((t) => {
          const r = rectFor(t);

          if (isWall(t)) {
            return (
              <rect
                key={t.id}
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                rx={8}
                fill="none"
                stroke="#c9c9c9"
                strokeWidth={4}
              />
            );
          }

          if (t.type === "decoration") {
            return (
              <rect
                key={t.id}
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                rx={6}
                fill="#f2f2f2"
                stroke="#c4c4c4"
                strokeWidth={2}
                strokeDasharray="8,6"
              />
            );
          }

          if (t.type === "circle") {
            return (
              <circle
                key={t.id}
                cx={r.x + r.w / 2}
                cy={r.y + r.h / 2}
                r={(r.w / 2) * 0.62}
                fill="var(--theme-primary-muted, #e6e6e6)"
                stroke="var(--theme-primary, #666)"
                strokeWidth={3}
              />
            );
          }

          return (
            <rect
              key={t.id}
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              rx={6}
              fill="var(--theme-primary-muted, #e6e6e6)"
              stroke="var(--theme-primary, #666)"
              strokeWidth={3}
            />
          );
        })}
      </svg>
    </div>
  );
}
