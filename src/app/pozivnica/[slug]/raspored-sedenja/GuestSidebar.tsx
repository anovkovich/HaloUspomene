"use client";

import { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import type { RSVPEntry } from "@/lib/rsvp";

const FILTER_OPTIONS = [
  { value: "", label: "Svi gosti" },
  { value: "Mladini", label: "Mladini" },
  { value: "Mladozenjini", label: "Mladoženjini" },
  { value: "Zajednicki", label: "Zajednički" },
  { value: "Nekategorisani", label: "Nekategorisani" },
];

interface Props {
  attending: RSVPEntry[];
  selectedGuest: RSVPEntry | null;
  onSelectGuest: (guest: RSVPEntry | null) => void;
  assignedCounts: Record<string, number>;
  onStartOver: () => void;
}

export default function GuestSidebar({
  attending,
  selectedGuest,
  onSelectGuest,
  assignedCounts,
  onStartOver,
}: Props) {
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const categoryFiltered = attending.filter((g) => {
    if (filter === "") return true;
    if (filter === "Nekategorisani") return !g.category;
    return g.category === filter;
  });

  const filtered = search.trim()
    ? categoryFiltered.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase()),
      )
    : categoryFiltered;

  // Unassigned / partially assigned first, fully assigned at bottom
  const sorted = [...filtered].sort((a, b) => {
    const aFull = (assignedCounts[a.id] || 0) >= (parseInt(a.guestCount) || 1);
    const bFull = (assignedCounts[b.id] || 0) >= (parseInt(b.guestCount) || 1);
    if (aFull === bFull) return 0;
    return aFull ? 1 : -1;
  });

  const totalPersons = attending.reduce(
    (s, g) => s + (parseInt(g.guestCount) || 1),
    0,
  );
  const totalAssigned = Object.values(assignedCounts).reduce(
    (s, n) => s + n,
    0,
  );

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: 240,
        minWidth: 240,
        borderRight: "1px solid var(--theme-border-light)",
        backgroundColor: "var(--theme-surface)",
      }}
    >
      {/* Header stats */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: "var(--theme-border-light)" }}
      >
        <p
          className="font-raleway text-xs font-medium uppercase tracking-wider mb-0.5"
          style={{ color: "var(--theme-text-light)" }}
        >
          Gosti
        </p>
        <p
          className="font-raleway text-sm"
          style={{ color: "var(--theme-text)" }}
        >
          <span style={{ color: "var(--theme-primary)", fontWeight: 600 }}>
            {totalAssigned}
          </span>
          <span style={{ color: "var(--theme-text-muted)" }}>
            {" "}
            / {totalPersons} raspoređeno
          </span>
        </p>
      </div>

      {/* Filters */}
      <div
        className="px-3 py-2 border-b flex flex-col gap-1.5"
        style={{ borderColor: "var(--theme-border-light)" }}
      >
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full text-xs font-raleway px-2 py-1.5 rounded outline-none"
          style={{
            backgroundColor: "var(--theme-background)",
            border: "1px solid var(--theme-border-light)",
            color: "var(--theme-text)",
          }}
        >
          {FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži..."
            className="w-full text-xs font-raleway px-2 py-1.5 rounded outline-none"
            style={{
              backgroundColor: "var(--theme-background)",
              border: "1px solid var(--theme-border-light)",
              color: "var(--theme-text)",
              paddingRight: search ? "1.5rem" : undefined,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
              style={{ color: "var(--theme-text-light)" }}
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Guest list */}
      <div className="flex-1 overflow-y-auto p-2">
        {sorted.length === 0 && (
          <p
            className="text-xs font-raleway text-center py-6"
            style={{ color: "var(--theme-text-light)" }}
          >
            Nema gostiju
          </p>
        )}

        {sorted.map((guest) => {
          const total = parseInt(guest.guestCount) || 1;
          const assigned = assignedCounts[guest.id] || 0;
          const isSelected = selectedGuest?.id === guest.id;
          const isFullyAssigned = assigned >= total;

          return (
            <button
              key={guest.id}
              onClick={() => onSelectGuest(isSelected ? null : guest)}
              className="w-full text-left px-3 py-2 rounded-lg mb-1 transition-all"
              style={{
                backgroundColor: isSelected
                  ? "var(--theme-primary)"
                  : "transparent",
                color: isSelected ? "white" : "var(--theme-text)",
                opacity: isFullyAssigned && !isSelected ? 0.45 : 1,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-xs font-raleway font-medium truncate"
                  style={{ minWidth: 0 }}
                >
                  {guest.name}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {isFullyAssigned ? (
                    <Check
                      size={11}
                      style={{
                        color: isSelected
                          ? "rgba(255,255,255,0.8)"
                          : "var(--theme-primary)",
                      }}
                    />
                  ) : null}
                  <span
                    className="text-[10px] font-raleway tabular-nums"
                    style={{
                      color: isSelected
                        ? "rgba(255,255,255,0.75)"
                        : "var(--theme-text-light)",
                    }}
                  >
                    {assigned}/{total}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Deselect hint */}
      {selectedGuest && (
        <div
          className="px-4 py-2 border-t text-center"
          style={{ borderColor: "var(--theme-border-light)" }}
        >
          <p
            className="text-[10px] font-raleway"
            style={{ color: "var(--theme-text-light)" }}
          >
            Klikni na mesto za dodelu
            <br />
            <button
              onClick={() => onSelectGuest(null)}
              className="underline mt-0.5"
              style={{ color: "var(--theme-primary)" }}
            >
              Otkaži izbor
            </button>
          </p>
        </div>
      )}

      {/* Start over */}
      <div
        className="px-3 py-3 border-t"
        style={{ borderColor: "var(--theme-border-light)" }}
      >
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-raleway font-medium transition-colors hover:bg-red-50 cursor-pointer"
            style={{ color: "var(--theme-text-light)" }}
          >
            <RotateCcw size={12} />
            Počni ispočetka
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-raleway text-center text-red-500 font-medium">
              Obrisati sve stolove i raspored?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-raleway font-medium border cursor-pointer transition-colors hover:bg-black/5"
                style={{
                  borderColor: "var(--theme-border-light)",
                  color: "var(--theme-text-light)",
                }}
              >
                Otkaži
              </button>
              <button
                onClick={() => {
                  onStartOver();
                  setConfirmReset(false);
                }}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-raleway font-medium bg-red-500 text-white cursor-pointer transition-colors hover:bg-red-600"
              >
                Obriši sve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
