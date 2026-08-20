"use client";

import { Hand, Maximize2, Minus, Plus } from "lucide-react";

interface Props {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  /** Zoom around the middle of the viewport, not the cursor. */
  onZoomChange: (z: number) => void;
  /** Frame the whole layout. Disabled when the canvas is empty. */
  onZoomToFit: () => void;
  canFit: boolean;
  /** Sticky pan mode — the same grab-and-drag as holding Space. */
  panMode: boolean;
  onPanModeChange: (on: boolean) => void;
  /** The seat-search control, handed in so this bar owns no editor state. */
  searchSlot?: React.ReactNode;
}

/**
 * Canvas tools, bottom-left. Desktop only — none of it applies to the phone
 * layout, which has no free canvas to pan and no cursor to change.
 *
 * Deliberately the same floating-bar language as the add-table strip at the
 * top: white pill, gold in the icons, hover as a faint accent wash. Two bars in
 * two corners doing two different jobs, reading as one system.
 */
export default function CanvasControls({
  zoom,
  minZoom,
  maxZoom,
  onZoomChange,
  onZoomToFit,
  canFit,
  panMode,
  onPanModeChange,
  searchSlot,
}: Props) {
  const pct = Math.round(zoom * 100);
  const step = (dir: 1 | -1) => {
    // Multiplicative, so a step feels the same size at 30% as at 200%.
    const next = dir === 1 ? zoom * 1.2 : zoom / 1.2;
    onZoomChange(Math.min(maxZoom, Math.max(minZoom, next)));
  };

  const iconBtn =
    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed";
  const wash = "color-mix(in srgb, var(--theme-primary) 12%, transparent)";
  const hover = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      if (!e.currentTarget.hasAttribute("disabled"))
        e.currentTarget.style.backgroundColor = wash;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor = "transparent";
    },
  };
  const divider = (
    <span
      className="self-stretch my-1"
      style={{
        width: 1,
        backgroundColor:
          "color-mix(in srgb, var(--theme-primary) 22%, transparent)",
      }}
    />
  );

  return (
    <div
      className="absolute z-10 hidden lg:flex flex-row items-stretch gap-0.5 p-1 rounded-xl"
      style={{
        bottom: 12,
        left: 12,
        backgroundColor: "color-mix(in srgb, var(--theme-surface) 88%, #ffffff)",
        border:
          "1px solid color-mix(in srgb, var(--theme-primary) 22%, transparent)",
        boxShadow:
          "0 1px 2px rgba(35,35,35,0.06), 0 10px 24px -12px rgba(35,35,35,0.3)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Pan mode — a sticky version of holding Space, for people who never
          discover the shortcut. */}
      <button
        onClick={() => onPanModeChange(!panMode)}
        title={
          panMode
            ? "Isključi pomeranje platna"
            : "Pomeraj platno (isto što i držanje razmaknice)"
        }
        aria-label="Pomeranje platna"
        aria-pressed={panMode}
        className={iconBtn}
        style={{
          backgroundColor: panMode ? "var(--theme-primary)" : "transparent",
          color: panMode ? "#ffffff" : "var(--theme-primary)",
        }}
        {...(panMode ? {} : hover)}
      >
        <Hand size={15} />
      </button>

      {searchSlot}

      {divider}

      <button
        onClick={() => step(-1)}
        disabled={zoom <= minZoom + 0.001}
        title="Udalji"
        aria-label="Udalji"
        className={iconBtn}
        style={{ color: "var(--theme-primary)" }}
        {...hover}
      >
        <Minus size={15} />
      </button>

      <input
        type="range"
        min={Math.round(minZoom * 100)}
        max={Math.round(maxZoom * 100)}
        value={pct}
        onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
        aria-label="Uvećanje"
        className="self-center cursor-pointer"
        style={{
          width: 108,
          accentColor: "var(--theme-primary)",
        }}
      />

      <button
        onClick={() => step(1)}
        disabled={zoom >= maxZoom - 0.001}
        title="Približi"
        aria-label="Približi"
        className={iconBtn}
        style={{ color: "var(--theme-primary)" }}
        {...hover}
      >
        <Plus size={15} />
      </button>

      {/* Click the number to snap back to 100% — the usual escape hatch after
          zooming somewhere odd. */}
      <button
        onClick={() => onZoomChange(1)}
        title="Vrati na 100%"
        aria-label="Vrati uvećanje na 100%"
        className="px-2 rounded-lg text-xs font-raleway font-semibold tabular-nums transition-colors cursor-pointer"
        style={{ color: "var(--theme-text)", minWidth: 52 }}
        {...hover}
      >
        {pct}%
      </button>

      {divider}

      <button
        onClick={onZoomToFit}
        disabled={!canFit}
        title="Uklopi ceo raspored u ekran"
        aria-label="Uklopi ceo raspored u ekran"
        className={iconBtn}
        style={{ color: "var(--theme-primary)" }}
        {...hover}
      >
        <Maximize2 size={15} />
      </button>
    </div>
  );
}
