"use client";

import type { TableData } from "../raspored-sedenja/types";
import { rectFor, computeBoundingBox, SURFACE_H, SEAT_ZONE } from "../raspored-sedenja/geometry";

interface Props {
  tables: TableData[];
  highlightTableIds: string[];
}

const PAD = 32;

export default function HallMap({ tables, highlightTableIds }: Props) {
  if (tables.length === 0) return null;

  const bbox = computeBoundingBox(tables);
  const vbX = bbox.minX - PAD;
  const vbY = bbox.minY - PAD;
  const vbW = bbox.width + PAD * 2;
  const vbH = bbox.height + PAD * 2;

  const elements: React.ReactNode[] = [];

  tables.forEach((t) => {
    const r = rectFor(t);
    const isHighlight = highlightTableIds.includes(t.id);

    if (t.type === "decoration") {
      elements.push(
        <g key={t.id} opacity={0.45}>
          <rect
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            rx={5}
            fill="#f5f5f5"
            stroke="#ccc"
            strokeWidth={1}
            strokeDasharray="5,4"
          />
          <text
            x={r.x + r.w / 2}
            y={r.y + r.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill="#aaa"
            fontFamily="sans-serif"
          >
            {t.label}
          </text>
        </g>,
      );
      return;
    }

    if (t.type === "circle") {
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const outerR = r.w / 2;
      const innerR = outerR * 0.58;

      elements.push(
        <g key={t.id}>
          {/* Outer zone (seats) */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR}
            fill={isHighlight ? "rgba(174,52,63,0.12)" : "#efefef"}
            stroke={isHighlight ? "var(--theme-primary)" : "#bbb"}
            strokeWidth={isHighlight ? 2 : 1}
            strokeDasharray={isHighlight ? undefined : "3,3"}
          />
          {/* Inner surface */}
          <circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill={isHighlight ? "rgba(174,52,63,0.2)" : "#e0e0e0"}
            stroke={isHighlight ? "var(--theme-primary)" : "#555"}
            strokeWidth={isHighlight ? 2 : 1.5}
          />
          {/* Label */}
          <text
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={13}
            fontWeight="700"
            fontFamily="sans-serif"
            fill={isHighlight ? "var(--theme-primary)" : "#222"}
          >
            {t.label}
          </text>
          {/* "Vi ste ovde" badge */}
          {isHighlight && (
            <text
              x={cx}
              y={r.y + r.h + 14}
              textAnchor="middle"
              fontSize={11}
              fontWeight="700"
              fontFamily="sans-serif"
              fill="var(--theme-primary)"
            >
              Vi ste ovde
            </text>
          )}
        </g>,
      );
      return;
    }

    // rectangular or single-sided
    let iW: number, iH: number, iXoff: number, iYoff: number;
    if (t.rotated) {
      iW = SURFACE_H; iH = r.h;
      iXoff = (r.w - SURFACE_H) / 2; iYoff = 0;
    } else {
      iW = r.w; iH = SURFACE_H;
      iXoff = 0; iYoff = (r.h - SURFACE_H) / 2;
    }

    const iX = r.x + iXoff;
    const iY = r.y + iYoff;

    // Seat zones
    const seatZoneElems: React.ReactNode[] = [];
    if (t.rotated) {
      // Left zone
      seatZoneElems.push(
        <rect
          key="zl"
          x={iX - SEAT_ZONE}
          y={iY}
          width={SEAT_ZONE}
          height={iH}
          rx={4}
          fill={isHighlight ? "rgba(174,52,63,0.1)" : "#efefef"}
          stroke={isHighlight ? "var(--theme-primary)" : "#bbb"}
          strokeWidth={isHighlight ? 1.5 : 1}
          strokeDasharray={isHighlight ? undefined : "3,3"}
        />,
      );
      // Right zone
      seatZoneElems.push(
        <rect
          key="zr"
          x={iX + SURFACE_H}
          y={iY}
          width={SEAT_ZONE}
          height={iH}
          rx={4}
          fill={isHighlight ? "rgba(174,52,63,0.1)" : "#efefef"}
          stroke={isHighlight ? "var(--theme-primary)" : "#bbb"}
          strokeWidth={isHighlight ? 1.5 : 1}
          strokeDasharray={isHighlight ? undefined : "3,3"}
        />,
      );
    } else {
      // Top zone
      seatZoneElems.push(
        <rect
          key="zt"
          x={iX}
          y={iY - SEAT_ZONE}
          width={iW}
          height={SEAT_ZONE}
          rx={4}
          fill={isHighlight ? "rgba(174,52,63,0.1)" : "#efefef"}
          stroke={isHighlight ? "var(--theme-primary)" : "#bbb"}
          strokeWidth={isHighlight ? 1.5 : 1}
          strokeDasharray={isHighlight ? undefined : "3,3"}
        />,
      );
      // Bottom zone (rectangular only)
      if (t.type === "rectangular") {
        seatZoneElems.push(
          <rect
            key="zb"
            x={iX}
            y={iY + SURFACE_H}
            width={iW}
            height={SEAT_ZONE}
            rx={4}
            fill={isHighlight ? "rgba(174,52,63,0.1)" : "#efefef"}
            stroke={isHighlight ? "var(--theme-primary)" : "#bbb"}
            strokeWidth={isHighlight ? 1.5 : 1}
            strokeDasharray={isHighlight ? undefined : "3,3"}
          />,
        );
      }
    }

    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;

    elements.push(
      <g key={t.id}>
        {seatZoneElems}
        {/* Table surface */}
        <rect
          x={iX}
          y={iY}
          width={iW}
          height={iH}
          rx={5}
          fill={isHighlight ? "rgba(174,52,63,0.22)" : "#e0e0e0"}
          stroke={isHighlight ? "var(--theme-primary)" : "#555"}
          strokeWidth={isHighlight ? 2 : 1.5}
        />
        {/* Label */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fontWeight="700"
          fontFamily="sans-serif"
          fill={isHighlight ? "var(--theme-primary)" : "#222"}
        >
          {t.label}
        </text>
        {/* "Vi ste ovde" badge */}
        {isHighlight && (
          <text
            x={cx}
            y={r.y + r.h + 14}
            textAnchor="middle"
            fontSize={11}
            fontWeight="700"
            fontFamily="sans-serif"
            fill="var(--theme-primary)"
          >
            Vi ste ovde
          </text>
        )}
      </g>,
    );
  });

  return (
    <div
      className="w-full overflow-auto rounded-xl"
      style={{
        maxHeight: "60vh",
        backgroundColor: "var(--theme-surface)",
        border: "1px solid var(--theme-border-light)",
      }}
    >
      <svg
        width="100%"
        height="auto"
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", minWidth: 280 }}
      >
        {elements}
      </svg>
    </div>
  );
}
