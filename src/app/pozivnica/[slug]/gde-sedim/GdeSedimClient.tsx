"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Armchair } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { GuestLookupEntry, GuestTableEntry } from "./page";
import type { TableData } from "@/lib/seating";
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

  const isFocused = showDropdown && query.length > 0;

  return (
    <div>
      {/* Search box */}
      <div className="relative">
        <label
          htmlFor="guest-search"
          className="block font-raleway text-[11px] uppercase tracking-[0.2em] mb-3 text-center"
          style={{ color: "var(--theme-text-light)" }}
        >
          Unesite vaše ime
        </label>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
            style={{
              color: isFocused
                ? "var(--theme-primary)"
                : "var(--theme-text-light)",
            }}
          />
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
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl font-raleway text-base outline-none transition-all"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: `1.5px solid ${isFocused ? "var(--theme-primary)" : "var(--theme-border)"}`,
              color: "var(--theme-text)",
              boxShadow: isFocused
                ? "0 0 0 4px var(--theme-primary-muted), 0 4px 16px rgba(0,0,0,0.04)"
                : "0 1px 3px rgba(0,0,0,0.04)",
            }}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-2 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1px solid var(--theme-border)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
            }}
          >
            {suggestions.map((entry, i) => (
              <button
                key={entry.guestName}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(entry);
                }}
                className="w-full text-left px-5 py-3 font-raleway text-sm transition-colors"
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

      {/* Animated result card — wraps in motion so the hall map smoothly
          slides up/down when the card mounts/unmounts. Outer div animates
          height + opacity + margin so there's no leftover spacing during exit. */}
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            key="result-card"
            initial={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              marginTop: "2rem",
              marginBottom: 0,
            }}
            exit={{
              opacity: 0,
              height: 0,
              marginTop: 0,
              marginBottom: 0,
            }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border)",
                boxShadow:
                  "0 20px 48px -16px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.04)",
              }}
            >
          {/* Top accent strip */}
          <div
            className="h-[3px] w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--theme-primary) 50%, transparent 100%)",
            }}
          />

          <div className="px-6 py-8 sm:px-10 sm:py-10 text-center space-y-5">
            {/* Guest name in script */}
            <div>
              <p
                className="font-raleway text-[10px] uppercase tracking-[0.25em] mb-2"
                style={{ color: "var(--theme-text-light)" }}
              >
                Dobrodošli
              </p>
              <p
                className="font-script text-3xl sm:text-4xl leading-tight"
                style={{ color: "var(--theme-primary)" }}
              >
                {selected.guestName}
              </p>
            </div>

            {/* Ornamental divider */}
            <div className="flex items-center justify-center gap-3">
              <div
                className="h-px w-12"
                style={{ backgroundColor: "var(--theme-border)" }}
              />
              <Armchair
                size={14}
                style={{ color: "var(--theme-primary)", opacity: 0.7 }}
              />
              <div
                className="h-px w-12"
                style={{ backgroundColor: "var(--theme-border)" }}
              />
            </div>

            {/* Table info */}
            <div className="space-y-2">
              <p
                className="font-raleway text-[10px] uppercase tracking-[0.25em]"
                style={{ color: "var(--theme-text-light)" }}
              >
                {selected.tables.length === 1
                  ? "Vaše mesto"
                  : "Vaša mesta"}
              </p>

              {selected.tables.length === 1 ? (
                <>
                  <p
                    className="font-script text-5xl sm:text-6xl leading-none"
                    style={{ color: "var(--theme-text)" }}
                  >
                    {selected.tables[0].tableLabel}
                  </p>
                  <p
                    className="font-raleway text-xs pt-2"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {selected.tables[0].occupiedCount} od{" "}
                    {selected.tables[0].seatCount} mesta popunjeno
                  </p>
                </>
              ) : (
                <div className="space-y-3 pt-2">
                  {selected.tables.map((t: GuestTableEntry) => (
                    <div
                      key={t.tableId}
                      className="flex items-baseline justify-center gap-3"
                    >
                      <span
                        className="font-script text-3xl sm:text-4xl"
                        style={{ color: "var(--theme-text)" }}
                      >
                        {t.tableLabel}
                      </span>
                      <span
                        className="font-raleway text-xs"
                        style={{ color: "var(--theme-text-muted)" }}
                      >
                        ({t.assignedSeats}{" "}
                        {t.assignedSeats === 1 ? "mesto" : "mesta"})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom accent strip */}
          <div
            className="h-[3px] w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--theme-primary) 50%, transparent 100%)",
              opacity: 0.4,
            }}
          />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hall map — fixed top margin so it always sits 32px below the
          previous element (search input, or the result card when present). */}
      {tables.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="h-px w-8"
              style={{ backgroundColor: "var(--theme-border)" }}
            />
            <p
              className="font-raleway text-[10px] uppercase tracking-[0.25em]"
              style={{ color: "var(--theme-text-light)" }}
            >
              Plan sale
            </p>
            <div
              className="h-px w-8"
              style={{ backgroundColor: "var(--theme-border)" }}
            />
          </div>
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
