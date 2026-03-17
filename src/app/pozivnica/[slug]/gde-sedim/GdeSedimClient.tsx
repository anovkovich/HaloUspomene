"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { GuestLookupEntry, GuestTableEntry } from "./page";
import type { TableData } from "../raspored-sedenja/types";
import HallMap from "./HallMap";

interface Props {
  guestLookup: GuestLookupEntry[];
  tables: TableData[];
}

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function GdeSedimClient({ guestLookup, tables }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GuestLookupEntry | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // One entry per unique guest name — no duplicates possible
  const suggestions = useMemo(
    () =>
      query.length === 0
        ? []
        : guestLookup
            .filter((e) => normalize(e.guestName).includes(normalize(query)))
            .slice(0, 8),
    [guestLookup, query],
  );

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(entry: GuestLookupEntry) {
    setSelected(entry);
    setQuery("");
    setShowDropdown(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = activeIndex >= 0 ? activeIndex : 0;
      if (suggestions[idx]) handleSelect(suggestions[idx]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  }

  // Empty state — no seating data published yet
  if (guestLookup.length === 0) {
    return (
      <div
        className="text-center py-14 px-6 rounded-xl"
        style={{
          backgroundColor: "var(--theme-surface)",
          border: "1px solid var(--theme-border-light)",
        }}
      >
        <p
          className="font-raleway text-base mb-2"
          style={{ color: "var(--theme-text-muted)" }}
        >
          Raspored sedenja još uvek nije objavljen
        </p>
        <p className="text-sm" style={{ color: "var(--theme-text-light)" }}>
          Proverite ponovo nešto bliže datumu venčanja.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search box */}
      <div className="relative">
        <label
          htmlFor="guest-search"
          className="block font-raleway text-sm mb-2"
          style={{ color: "var(--theme-text-muted)" }}
        >
          Unesite vaše ime ili ime na koje je prijavljen dolazak
        </label>

        <div className="relative">
          <input
            ref={inputRef}
            id="guest-search"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Ime i prezime…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
              if (selected) setSelected(null);
            }}
            onFocus={() => {
              if (query.length > 0) setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 rounded-xl font-raleway text-base outline-none transition-shadow"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1.5px solid var(--theme-border)",
              color: "var(--theme-text)",
            }}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 rounded-xl overflow-hidden shadow-lg"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1px solid var(--theme-border)",
            }}
          >
            {suggestions.map((entry, i) => (
              <button
                key={entry.guestName}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(entry);
                }}
                className="w-full text-left px-4 py-3 font-raleway text-sm transition-colors"
                style={{
                  backgroundColor:
                    i === activeIndex
                      ? "var(--theme-primary-muted)"
                      : "transparent",
                  color: "var(--theme-text)",
                  borderBottom:
                    i < suggestions.length - 1
                      ? "1px solid var(--theme-border-light)"
                      : "none",
                }}
              >
                {entry.guestName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result card */}
      {selected && (
        <div
          className="rounded-xl p-6 space-y-3"
          style={{
            backgroundColor: "var(--theme-surface)",
            border: "1.5px solid var(--theme-border)",
          }}
        >
          <p
            className="font-raleway text-sm uppercase tracking-wider"
            style={{ color: "var(--theme-text-light)" }}
          >
            {selected.tables.length === 1
              ? "Vaše mesto je za stolom:"
              : "Vaša mesta su za stolovima:"}
          </p>

          {selected.tables.length === 1 ? (
            // Single table — simple display
            <>
              <p
                className="font-raleway text-3xl font-bold leading-tight"
                style={{ color: "var(--theme-primary)" }}
              >
                {selected.tables[0].tableLabel}
              </p>
              <p
                className="font-raleway text-sm"
                style={{ color: "var(--theme-text-muted)" }}
              >
                {selected.tables[0].occupiedCount} od{" "}
                {selected.tables[0].seatCount} mesta popunjeno
              </p>
            </>
          ) : (
            // Multiple tables — list each with seat count
            <div className="space-y-2">
              {selected.tables.map((t: GuestTableEntry) => (
                <div key={t.tableId} className="flex items-baseline gap-3">
                  <span
                    className="font-raleway text-2xl font-bold"
                    style={{ color: "var(--theme-primary)" }}
                  >
                    {t.tableLabel}
                  </span>
                  <span
                    className="font-raleway text-sm"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {t.assignedSeats}{" "}
                    {t.assignedSeats === 1
                      ? "mesto"
                      : t.assignedSeats < 5
                        ? "mesta"
                        : "mesta"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* <div
            className="pt-3 mt-3 font-raleway text-xs leading-relaxed"
            style={{
              borderTop: "1px solid var(--theme-border-light)",
              color: "var(--theme-text-light)",
            }}
          >
            Notes if needed...
          </div> */}
        </div>
      )}

      {/* Hall map */}
      {tables.length > 0 && (
        <div>
          <p
            className="font-raleway text-xs uppercase tracking-wider mb-3"
            style={{ color: "var(--theme-text-light)" }}
          >
            Plan sale
          </p>
          <HallMap
            tables={tables}
            highlightTableIds={
              selected
                ? selected.tables.map((t: GuestTableEntry) => t.tableId)
                : []
            }
          />
        </div>
      )}
    </div>
  );
}
