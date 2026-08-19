"use client";

import { useEffect, useRef } from "react";
import { Search, X, ChevronRight } from "lucide-react";

interface Props {
  /** Controlled query — the editor owns it because it also drives the highlight. */
  value: string;
  onChange: (v: string) => void;
  /** How many seats the current query matches. */
  matchCount: number;
  /** 0-based position within the matches the canvas is currently framing. */
  matchIndex: number;
  /** Frame the next match (wraps around). */
  onNext: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Icon button in the add-table strip that finds an already-seated guest.
 *
 * Collapsed it is just a magnifier; clicking expands an input in place, so the
 * strip does not grow a permanent search field it rarely needs. Distinct from
 * the sidebar search, which picks somebody to *place* — this one answers
 * "where did I put them?" and highlights the seat on the canvas.
 */
export default function SeatSearchButton({
  value,
  onChange,
  matchCount,
  matchIndex,
  onNext,
  open,
  onOpenChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = () => {
    onChange("");
    onOpenChange(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        title="Pronađi gosta u rasporedu"
        aria-label="Pronađi gosta u rasporedu"
        className="flex items-center justify-center px-2.5 rounded shadow-sm transition-opacity hover:opacity-80 self-stretch cursor-pointer"
        style={{
          backgroundColor: "var(--theme-surface)",
          border: "1px solid var(--theme-border-light)",
          color: "var(--theme-text-light)",
        }}
      >
        <Search size={14} />
      </button>
    );
  }

  const hasQuery = value.trim().length > 0;

  return (
    <div
      className="flex items-center gap-1.5 pl-2.5 pr-1.5 rounded shadow-sm self-stretch"
      style={{
        backgroundColor: "var(--theme-surface)",
        border: `1px solid ${
          hasQuery && matchCount === 0
            ? "#ef4444"
            : "var(--theme-border-light)"
        }`,
      }}
    >
      <Search size={14} style={{ color: "var(--theme-text-light)" }} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matchCount > 0) {
            e.preventDefault();
            onNext();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            close();
          }
        }}
        placeholder="Pronađi gosta..."
        className="text-xs font-raleway bg-transparent outline-none"
        style={{ color: "var(--theme-text)", width: 150 }}
      />

      {hasQuery && (
        <span
          className="text-[10px] font-raleway tabular-nums whitespace-nowrap"
          style={{
            color: matchCount ? "var(--theme-text-light)" : "#ef4444",
          }}
        >
          {matchCount ? `${matchIndex + 1}/${matchCount}` : "0"}
        </span>
      )}

      {matchCount > 1 && (
        <button
          onClick={onNext}
          title="Sledeće mesto"
          aria-label="Sledeće mesto"
          className="flex items-center justify-center w-5 h-5 rounded transition-opacity hover:opacity-60 cursor-pointer"
          style={{ color: "var(--theme-primary)" }}
        >
          <ChevronRight size={13} />
        </button>
      )}

      <button
        onClick={close}
        title="Zatvori pretragu"
        aria-label="Zatvori pretragu"
        className="flex items-center justify-center w-5 h-5 rounded transition-opacity hover:opacity-60 cursor-pointer"
        style={{ color: "var(--theme-text-light)" }}
      >
        <X size={13} />
      </button>
    </div>
  );
}
