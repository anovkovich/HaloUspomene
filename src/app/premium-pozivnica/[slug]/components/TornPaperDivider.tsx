"use client";

import { useId, useMemo } from "react";

interface TornPaperDividerProps {
  /** Color of the paper sheet (the side that's torn). */
  color: string;
  /** Which edge of the divider is jagged. */
  edge: "top" | "bottom";
  /** Height of the divider strip in pixels. */
  height?: number;
  /** Deterministic seed for the jagged path. */
  seed?: number;
  /** Number of horizontal segments — more = finer tear. */
  segments?: number;
  /** Strength of the drop-shadow under the torn edge. */
  shadow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a torn-paper edge path. The shape mixes three scales:
 *   • fine grain (every segment) — gives the paper texture
 *   • mid bumps (occasional) — broader humps
 *   • deep spikes (rare) — sharp tears that pull the eye
 * Adjacent points are connected with quadratic Béziers so the cuts look
 * fibrous instead of mechanical, but the control points sit on the random
 * points themselves so the silhouette still reads as torn (not wavy).
 */
function buildTornPath(
  seed: number,
  width: number,
  height: number,
  segments: number,
  edge: "top" | "bottom",
) {
  const rand = mulberry32(seed);

  const points: Array<[number, number]> = [];
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const fine = rand() * 0.18 * height;
    const midRoll = rand() < 0.35 ? rand() * 0.28 * height : 0;
    const deepSpike = rand() < 0.08 ? rand() * 0.55 * height : 0;
    const y = fine + midRoll + deepSpike;
    points.push([x, Math.min(height - 1, y)]);
  }

  // Smooth the polyline with mid-point quadratic curves.
  // Control points = the original points; curve passes through midpoints.
  let d = "";
  if (edge === "top") {
    // Jagged at top, solid at bottom.
    d = `M 0,${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const mx = (points[i - 1][0] + points[i][0]) / 2;
      const my = (points[i - 1][1] + points[i][1]) / 2;
      d += ` Q ${points[i - 1][0]},${points[i - 1][1]} ${mx},${my}`;
    }
    d += ` L ${width},${points[points.length - 1][1]}`;
    d += ` L ${width},${height} L 0,${height} Z`;
  } else {
    // edge === "bottom": solid at top, jagged at bottom (mirror Y).
    d = `M 0,0 L ${width},0`;
    d += ` L ${width},${height - points[points.length - 1][1]}`;
    for (let i = points.length - 1; i > 0; i--) {
      const mx = (points[i][0] + points[i - 1][0]) / 2;
      const my = height - (points[i][1] + points[i - 1][1]) / 2;
      d += ` Q ${points[i][0]},${height - points[i][1]} ${mx},${my}`;
    }
    d += ` L 0,${height - points[0][1]} Z`;
  }
  return d;
}

export default function TornPaperDivider({
  color,
  edge,
  height = 36,
  seed = 42,
  segments = 80,
  shadow = true,
  className,
  style,
}: TornPaperDividerProps) {
  const filterId = useId().replace(/:/g, "");
  const w = 1200;

  const pathD = useMemo(
    () => buildTornPath(seed, w, height, segments, edge),
    [edge, height, seed, segments],
  );

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: `${height}px`,
        // Allow the inner shadow to spill a tiny bit past the SVG box.
        overflow: "visible",
        ...style,
      }}
      aria-hidden
    >
      {shadow && (
        <defs>
          <filter
            id={`torn-shadow-${filterId}`}
            x="-2%"
            y="-50%"
            width="104%"
            height="200%"
          >
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" />
            <feOffset dx="0" dy={edge === "top" ? 1.5 : -1.5} result="off" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.45" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <path
        d={pathD}
        fill={color}
        filter={shadow ? `url(#torn-shadow-${filterId})` : undefined}
      />
    </svg>
  );
}
