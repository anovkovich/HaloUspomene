"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";

/**
 * The sort picker that sits next to an admin list's heading.
 *
 * Extracted from the Pozivnice tab once all five lists wanted it. It was
 * briefly argued that only Pozivnice needs a picker — the smaller tabs sort
 * fine without one — but a sort with no visible control gives the admin no way
 * to tell whether the list is ordered at all, or how. The control IS the
 * feedback.
 */
export type AdminSortMode = "newest" | "event_proximity";

export const ADMIN_SORT_OPTIONS: {
  id: AdminSortMode;
  label: string;
}[] = [
  { id: "event_proximity", label: "Po datumu" },
  { id: "newest", label: "Najnovije" },
];

export default function SortMenu({
  value,
  onChange,
  /** Overrides the agenda option's label, e.g. "Po datumu venčanja". */
  dateLabel,
}: {
  value: AdminSortMode;
  onChange: (mode: AdminSortMode) => void;
  dateLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const options = ADMIN_SORT_OPTIONS.map((o) =>
    o.id === "event_proximity" && dateLabel ? { ...o, label: dateLabel } : o,
  );
  const current =
    options.find((o) => o.id === value)?.label ?? options[0].label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-white/45 hover:text-white/80 transition-colors cursor-pointer"
      >
        <ArrowUpDown size={11} />
        <span className="whitespace-nowrap">{current}</span>
        <ChevronDown
          size={11}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-20 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-1 w-max min-w-[150px]">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {value === opt.id ? (
                <Check size={12} className="text-[#AE343F]" />
              ) : (
                <span className="w-3" />
              )}
              <span className="whitespace-nowrap">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
