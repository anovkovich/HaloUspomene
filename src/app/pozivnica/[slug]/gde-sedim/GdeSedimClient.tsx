"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { Search, Armchair } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  GuestLookupEntry,
  GuestTableEntry,
} from "@/lib/seating/lookup";
import { normalizeName, searchGuestLookup } from "@/lib/seating/lookup";
import type { TableData } from "@/lib/seating";
import HallMap from "./HallMap";

interface Props {
  guestLookup: GuestLookupEntry[];
  tables: TableData[];
  /** When true, render the BA/HR/ME ijekavica variant of all copy
   *  ("mjesto" instead of "mesto", etc.). */
  ijekavica?: boolean;
  /** Controlled selected guest. When provided (with onSelectChange), the guest
   *  hub owns the selection so the "Plan sale" tab can highlight the same
   *  table. Omit for standalone (uncontrolled) use. */
  selected?: GuestLookupEntry | null;
  onSelectChange?: (entry: GuestLookupEntry | null) => void;
  /** When false, the inline hall map is not rendered — the hub shows the map
   *  in its own "Plan sale" tab instead. Defaults to true (standalone page). */
  showMap?: boolean;
  /** Called with the ids of the completely-free tables when a searched name is
   *  NOT in the plan (loose-seating custom: leave empty tables for arrivals).
   *  The hub uses it to highlight those tables on its "Plan sale" tab. */
  onFreeTablesChange?: (tableIds: string[]) => void;
  /** Optional extra block rendered at the bottom of the found-guest card.
   *  Used by the standalone hostess mode to add a check-in control, so the
   *  guest-facing lookup keeps working exactly as before for everyone else —
   *  this component stays free of any check-in logic or imports. */
  renderExtra?: (entry: GuestLookupEntry) => React.ReactNode;
}

export default function GdeSedimClient({
  guestLookup,
  tables,
  ijekavica = false,
  selected: controlledSelected,
  onSelectChange,
  showMap = true,
  onFreeTablesChange,
  renderExtra,
}: Props) {
  // All BA/HR/ME-aware copy in one place \u2014 keeps the JSX below readable
  // and avoids 6+ inline ternaries. Named `tr` not `t` to avoid shadowing
  // the existing iterator variable in `.map((t: GuestTableEntry) => ...)`.
  const tr = ijekavica
    ? {
        enterYourName: "Unesite ime i prona\u0111ite svoje mjesto",
        yourSeatSingular: "Va\u0161e mjesto",
        yourSeatPlural: "Va\u0161a mjesta",
        welcome: "Smjestite se i u\u017eivajte \u2014 hvala \u0161to ste tu",
        seatUnit: (n: number) => (n === 1 ? "mjesto" : "mjesta"),
        partyHeading: "Mjesta za zvanicu",
        notFoundTitle: "Dobro do\u0161li!",
        notAssigned:
          "Va\u0161e mjesto nije raspore\u0111eno za konkretan sto.",
        takeFree:
          "Slobodno zauzmite mjesto za neki od slobodnih stolova:",
        noFree:
          "Molimo obratite se doma\u0107inima za va\u0161e mjesto.",
        freeTablesLabel: "Slobodni stolovi",
        seatsUnit: (n: number) => (n === 1 ? "mjesto" : "mjesta"),
      }
    : {
        enterYourName: "Unesite ime i prona\u0111ite svoje mesto",
        yourSeatSingular: "Va\u0161e mesto",
        yourSeatPlural: "Va\u0161a mesta",
        welcome: "Smestite se i u\u017eivajte \u2014 hvala \u0161to ste tu",
        seatUnit: (n: number) => (n === 1 ? "mesto" : "mesta"),
        partyHeading: "Mesta za zvanicu",
        notFoundTitle: "Dobro do\u0161li!",
        notAssigned:
          "Va\u0161e mesto nije raspore\u0111eno za konkretan sto.",
        takeFree:
          "Slobodno zauzmite mesto za neki od slobodnih stolova:",
        noFree:
          "Molimo obratite se doma\u0107inima za va\u0161e mesto.",
        freeTablesLabel: "Slobodni stolovi",
        seatsUnit: (n: number) => (n === 1 ? "mesto" : "mesta"),
      };

  const [query, setQuery] = useState("");
  const [internalSelected, setInternalSelected] =
    useState<GuestLookupEntry | null>(null);
  // Controlled when the hub passes onSelectChange; otherwise self-managed.
  const selected =
    controlledSelected !== undefined ? controlledSelected : internalSelected;
  const setSelected = (entry: GuestLookupEntry | null) => {
    if (onSelectChange) onSelectChange(entry);
    else setInternalSelected(entry);
  };
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Script- and order-insensitive: "Ognjen Ikovic", "ikovic ognjen" and
  // "Огњен" all find the same guest (see @/lib/seating/lookup).
  const suggestions = useMemo(
    () => (query.length === 0 ? [] : searchGuestLookup(guestLookup, query, 8)),
    [guestLookup, query],
  );

  // Completely-free tables (no one seated) — offered when a searched name isn't
  // in the plan, for events that leave empty tables for guests to fill in.
  const freeTables = useMemo(
    () =>
      tables
        .filter(
          (t) =>
            t.type !== "decoration" &&
            t.seats > 0 &&
            t.assignments.filter(Boolean).length === 0,
        )
        .map((t) => ({ id: t.id, label: t.label, seats: t.seats })),
    [tables],
  );

  // "Not found" once the guest has typed enough and nothing matches.
  const notFound = query.trim().length >= 2 && suggestions.length === 0;

  // Tell the hub which tables to highlight on its "Plan sale" tab (free tables
  // when unmatched; cleared otherwise so a matched guest's tables take over).
  useEffect(() => {
    onFreeTablesChange?.(notFound ? freeTables.map((f) => f.id) : []);
  }, [notFound, freeTables, onFreeTablesChange]);

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
          {tr.enterYourName}
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
              // Suggestions change with every keystroke — keep the keyboard
              // highlight from pointing at a stale row.
              setActiveIndex(-1);
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
                key={`${entry.guestName}-${i}`}
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
                {entry.partyName &&
                  normalizeName(entry.partyName) !==
                    normalizeName(entry.guestName) && (
                    <span
                      className="block text-xs mt-0.5"
                      style={{ color: "var(--theme-text-light)" }}
                    >
                      {tr.partyHeading} {entry.partyName}
                    </span>
                  )}
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
                  ? tr.yourSeatSingular
                  : tr.yourSeatPlural}
              </p>

              {selected.tables.length === 1 ? (
                <>
                  <p
                    className="font-script text-5xl sm:text-6xl leading-none"
                    style={{ color: "var(--theme-text)" }}
                  >
                    {selected.tables[0].tableLabel}
                  </p>
                  {selected.tables[0].assignedSeats > 1 && (
                    <p
                      className="font-raleway text-xs"
                      style={{ color: "var(--theme-text-muted)" }}
                    >
                      ({selected.tables[0].assignedSeats}{" "}
                      {tr.seatUnit(selected.tables[0].assignedSeats)})
                    </p>
                  )}
                  <p
                    className="font-raleway text-xs pt-2"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {tr.welcome}
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
                        ({t.assignedSeats} {tr.seatUnit(t.assignedSeats)})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Party ("zvanica") breakdown — when the couple named the members
                of a family, whoever searches sees where everyone from that
                invitation sits. Rows are styled alike: the searched guest is
                already named at the top of the card. */}
            {selected.partyMembers && selected.partyMembers.length > 1 && (
              <div className="pt-3">
                <p
                  className="font-raleway text-[10px] uppercase tracking-[0.25em] mb-3"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  {tr.partyHeading}
                  {selected.partyName ? ` ${selected.partyName}` : ""}
                </p>
                <div className="space-y-1.5 max-w-xs mx-auto text-left">
                  {selected.partyMembers.map((m, i) => (
                    <div
                      key={`${m.name}-${m.tableId}-${i}`}
                      className="flex items-baseline justify-between gap-3 px-3 py-1.5"
                    >
                      <span
                        className="font-raleway text-sm"
                        style={{ color: "var(--theme-text-muted)" }}
                      >
                        {m.name}
                      </span>
                      <span
                        className="font-raleway text-sm whitespace-nowrap"
                        style={{ color: "var(--theme-primary)" }}
                      >
                        {m.tableLabel}
                        {m.assignedSeats > 1
                          ? ` (${m.assignedSeats} ${tr.seatUnit(m.assignedSeats)})`
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {renderExtra && (
              <div className="pt-4">{renderExtra(selected)}</div>
            )}
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

      {/* Not-found → free-tables card. Shown when a typed name isn't in the
          plan (loose-seating custom). Welcomes the guest and lists the tables
          that are completely empty. */}
      <AnimatePresence initial={false}>
        {notFound && !selected && (
          <motion.div
            key="notfound-card"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: "2rem" }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
              <div
                className="h-[3px] w-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, var(--theme-primary) 50%, transparent 100%)",
                }}
              />
              <div className="px-6 py-8 sm:px-10 sm:py-10 text-center space-y-5">
                <div>
                  <p
                    className="font-script text-3xl sm:text-4xl leading-tight"
                    style={{ color: "var(--theme-primary)" }}
                  >
                    {tr.notFoundTitle}
                  </p>
                </div>

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

                <p
                  className="font-raleway text-sm leading-relaxed"
                  style={{ color: "var(--theme-text-muted)" }}
                >
                  {tr.notAssigned}
                </p>

                {freeTables.length > 0 ? (
                  <>
                    <p
                      className="font-raleway text-sm leading-relaxed"
                      style={{ color: "var(--theme-text-muted)" }}
                    >
                      {tr.takeFree}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 pt-1">
                      {freeTables.map((f) => (
                        <span
                          key={f.id}
                          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5"
                          style={{
                            backgroundColor: "var(--theme-primary-muted)",
                            border: "1px solid var(--theme-border)",
                            color: "var(--theme-text)",
                          }}
                        >
                          <Armchair
                            size={13}
                            style={{ color: "var(--theme-primary)" }}
                          />
                          <span className="font-raleway text-sm font-medium">
                            {f.label}
                          </span>
                          <span
                            className="font-raleway text-xs"
                            style={{ color: "var(--theme-text-light)" }}
                          >
                            ({f.seats} {tr.seatsUnit(f.seats)})
                          </span>
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p
                    className="font-raleway text-sm leading-relaxed"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {tr.noFree}
                  </p>
                )}
              </div>
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

      {/* Placeholder illustration — the page is just a label and one input
          until a name is typed, which left the screen looking broken. Shown
          only when there is nothing else to fill it: no result card, and no
          hall map underneath (the hub tab hides the map, and a standalone page
          without tables has none). */}
      <AnimatePresence initial={false}>
        {!selected && (!showMap || tables.length === 0) && (
          <motion.div
            key="seating-placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col items-center"
            style={{ overflow: "hidden" }}
            aria-hidden="true"
          >
            <Image
              src="/images/gde-sedim.webp"
              alt=""
              width={520}
              height={416}
              priority={false}
              className="w-full max-w-[420px] h-auto select-none pointer-events-none"
              style={{ opacity: 0.9 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hall map — fixed top margin so it always sits 32px below the
          previous element (search input, or the result card when present).
          Hidden when the hub renders the map in its own "Plan sale" tab. */}
      {showMap && tables.length > 0 && (
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
                : notFound
                  ? freeTables.map((f) => f.id)
                  : []
            }
          />
        </div>
      )}
    </div>
  );
}
