"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Users } from "lucide-react";
import type { RSVPEntry } from "@/lib/rsvp";

/** Viewport rect of the hovered seat — the panel hangs off it. */
export interface SeatAnchor {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface Props {
  anchor: SeatAnchor;
  /** Human label of the seat, e.g. "Sto 3 · mesto 5". */
  seatLabel: string;
  attending: RSVPEntry[];
  assignedCounts: Record<string, number>;
  /** Per-party member names, to flag parties whose seats will carry real names. */
  members: Record<string, string[]>;
  onPick: (guest: RSVPEntry) => void;
  /** Pointer entered the panel — the editor cancels its pending close. */
  onKeepOpen: () => void;
  onClose: () => void;
}

const PANEL_W = 268;
const PANEL_MAX_H = 300;

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Hover picker for a free seat, shown when no guest is currently picked up in
 * the sidebar. Lets the host search the guest list and drop somebody straight
 * onto that seat, instead of the select-then-click round trip.
 *
 * Positioned `fixed` from the seat's viewport rect, so the canvas zoom never
 * scales the panel. The 8px approach gap is part of the panel's own hover area,
 * otherwise the pointer would leave the seat and close it before arriving.
 */
export default function SeatGuestPicker({
  anchor,
  seatLabel,
  attending,
  assignedCounts,
  members,
  onPick,
  onKeepOpen,
  onClose,
}: Props) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the search box so the panel is usable straight from the keyboard —
  // but never yank the caret out of a field the host is already typing in
  // (e.g. the sidebar search) just because the cursor drifted over a seat.
  useEffect(() => {
    const active = document.activeElement as HTMLElement | null;
    const tag = active?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || active?.isContentEditable)
      return;
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const guests = useMemo(() => {
    const q = norm(search.trim());
    const free = (g: RSVPEntry) =>
      (assignedCounts[g.id] || 0) < (parseInt(g.guestCount) || 1);
    return attending
      .filter((g) => !q || norm(g.name).includes(q))
      .sort((a, b) => Number(free(b)) - Number(free(a)));
  }, [attending, assignedCounts, search]);

  // Hang below the seat when there is room, above it otherwise. Anchoring the
  // flipped case to `bottom` lets the panel keep its natural height.
  const below =
    typeof window === "undefined" ||
    anchor.bottom + PANEL_MAX_H + 16 <= window.innerHeight;
  const vw = typeof window === "undefined" ? 1200 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const centerX = (anchor.left + anchor.right) / 2;
  const left = Math.max(8, Math.min(centerX - PANEL_W / 2, vw - PANEL_W - 8));

  return (
    <div
      style={{
        position: "fixed",
        left,
        ...(below ? { top: anchor.bottom } : { bottom: vh - anchor.top }),
        width: PANEL_W,
        zIndex: 9998,
        // Transparent bridge over the gap between seat and panel.
        paddingTop: below ? 8 : 0,
        paddingBottom: below ? 0 : 8,
      }}
      onMouseEnter={onKeepOpen}
      onMouseLeave={onClose}
    >
      <div
        className="rounded-xl shadow-xl overflow-hidden"
        style={{
          backgroundColor: "var(--theme-surface)",
          border: "1px solid var(--theme-border)",
        }}
      >
        <div
          className="px-3 pt-2.5 pb-2"
          style={{ borderBottom: "1px solid var(--theme-border-light)" }}
        >
          <p
            className="font-raleway text-[10px] font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--theme-text-light)" }}
          >
            {seatLabel}
          </p>
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2 top-1/2 -translate-y-1/2"
              style={{ color: "var(--theme-text-light)" }}
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži goste..."
              className="w-full pl-7 pr-2 py-1.5 text-xs font-raleway rounded outline-none"
              style={{
                backgroundColor: "var(--theme-background)",
                border: "1px solid var(--theme-border-light)",
                color: "var(--theme-text)",
              }}
            />
          </div>
        </div>

        <div className="overflow-y-auto p-1" style={{ maxHeight: 216 }}>
          {guests.length === 0 && (
            <p
              className="text-xs font-raleway text-center py-5"
              style={{ color: "var(--theme-text-light)" }}
            >
              Nema rezultata
            </p>
          )}
          {guests.map((g) => {
            const total = parseInt(g.guestCount) || 1;
            const assigned = assignedCounts[g.id] || 0;
            const isFull = assigned >= total;
            const hasNames = (members[g.id] ?? []).some((n) => n && n.trim());
            return (
              <button
                key={g.id}
                type="button"
                disabled={isFull}
                onClick={() => onPick(g)}
                className="w-full flex items-center gap-1.5 text-left px-2 py-1.5 rounded-lg transition-colors enabled:hover:bg-black/5 disabled:cursor-not-allowed"
                style={{
                  color: "var(--theme-text)",
                  opacity: isFull ? 0.4 : 1,
                }}
              >
                {hasNames && (
                  <Users
                    size={11}
                    className="shrink-0"
                    style={{ color: "var(--theme-primary)" }}
                  />
                )}
                <span className="flex-1 min-w-0 truncate text-xs font-raleway font-medium">
                  {g.name}
                </span>
                <span
                  className="shrink-0 text-[10px] font-raleway tabular-nums"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  {assigned}/{total}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
