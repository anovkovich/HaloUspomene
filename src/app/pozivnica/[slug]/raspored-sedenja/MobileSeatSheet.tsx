"use client";

import { useState, useMemo } from "react";
import { Search, X, UserMinus } from "lucide-react";
import type { RSVPEntry } from "@/lib/rsvp";
import type { TableData, SeatAssignment } from "./types";

interface SeatTarget {
  tableId: string;
  seatIndex: number;
  tableLabel: string;
  assignment: SeatAssignment | null;
}

interface Props {
  target: SeatTarget;
  attending: RSVPEntry[];
  tables: TableData[];
  assignedCounts: Record<string, number>;
  onAssign: (tableId: string, seatIndex: number, guest: RSVPEntry) => void;
  onRemove: (tableId: string, seatIndex: number) => void;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Mladini: "#AE343F",
  Mladozenjini: "#2563eb",
  Zajednicki: "#7c3aed",
  Nekategorisani: "#6b7280",
};

export default function MobileSeatSheet({
  target,
  attending,
  tables,
  assignedCounts,
  onAssign,
  onRemove,
  onClose,
}: Props) {
  const [search, setSearch] = useState("");

  // If seat is assigned, show the assigned guest info
  if (target.assignment) {
    const guest = attending.find(
      (g) => g.id === target.assignment!.guestId,
    );
    const guestTables = tables
      .map((t) => ({
        label: t.label,
        seats: t.assignments
          .map((a, i) =>
            a?.guestId === target.assignment!.guestId ? i + 1 : null,
          )
          .filter((s): s is number => s !== null),
      }))
      .filter((t) => t.seats.length > 0);

    return (
      <div
        className="fixed inset-0 z-[60] flex items-end justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-t-2xl shadow-2xl"
          style={{
            backgroundColor: "var(--theme-surface)",
            paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div
              className="w-10 h-1 rounded-full"
              style={{ backgroundColor: "var(--theme-border)" }}
            />
          </div>

          <div className="px-5 pb-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  className="font-raleway font-semibold text-base"
                  style={{ color: "var(--theme-text)" }}
                >
                  {target.assignment.guestName}
                </h3>
                <p
                  className="text-xs font-raleway mt-0.5"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Mesto {target.seatIndex + 1} — {target.tableLabel}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ color: "var(--theme-text-light)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Where they're seated */}
            {guestTables.length > 0 && (
              <div className="space-y-2 mb-4">
                {guestTables.map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ backgroundColor: "var(--theme-background)" }}
                  >
                    <span
                      className="text-sm font-raleway font-medium"
                      style={{ color: "var(--theme-text)" }}
                    >
                      {t.label}
                    </span>
                    <span
                      className="text-xs font-raleway"
                      style={{ color: "var(--theme-text-light)" }}
                    >
                      {t.seats.length === 1
                        ? `Mesto ${t.seats[0]}`
                        : `Mesta ${t.seats.join(", ")}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Assignment status */}
            {guest && (
              <p
                className="text-xs font-raleway mb-4"
                style={{ color: "var(--theme-text-light)" }}
              >
                {assignedCounts[guest.id] || 0} / {guest.guestCount} mesta
                raspoređeno
              </p>
            )}

            {/* Remove button */}
            <button
              onClick={() => {
                onRemove(target.tableId, target.seatIndex);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-raleway font-medium text-white active:opacity-80"
              style={{ backgroundColor: "#ef4444" }}
            >
              <UserMinus size={16} />
              Ukloni sa mesta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty seat — show guest picker, unseated first
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = attending.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q)) return false;
      return true;
    });
    // Sort: unseated (has remaining seats) first, fully assigned last
    return list.sort((a, b) => {
      const aFull = (assignedCounts[a.id] || 0) >= (parseInt(a.guestCount) || 1) ? 1 : 0;
      const bFull = (assignedCounts[b.id] || 0) >= (parseInt(b.guestCount) || 1) ? 1 : 0;
      return aFull - bFull;
    });
  }, [attending, search, assignedCounts]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl shadow-2xl flex flex-col"
        style={{
          backgroundColor: "var(--theme-surface)",
          maxHeight: "75vh",
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: "var(--theme-border)" }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 shrink-0">
          <div>
            <h3
              className="font-raleway font-semibold text-sm"
              style={{ color: "var(--theme-text)" }}
            >
              Dodeli mesto {target.seatIndex + 1}
            </h3>
            <p
              className="text-xs font-raleway mt-0.5"
              style={{ color: "var(--theme-text-light)" }}
            >
              {target.tableLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ color: "var(--theme-text-light)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3 shrink-0">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--theme-text-light)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži goste..."
              className="w-full pl-9 pr-4 py-2.5 text-sm font-raleway rounded-lg outline-none"
              style={{
                backgroundColor: "var(--theme-background)",
                border: "1px solid var(--theme-border-light)",
                color: "var(--theme-text)",
              }}
            />
          </div>
        </div>

        {/* Guest list */}
        <div className="flex-1 overflow-y-auto px-5">
          {filtered.length === 0 ? (
            <p
              className="text-sm font-raleway text-center py-8"
              style={{ color: "var(--theme-text-light)" }}
            >
              Nema rezultata
            </p>
          ) : (
            <div className="space-y-1 pb-3">
              {filtered.map((guest) => {
                const total = parseInt(guest.guestCount) || 1;
                const assigned = assignedCounts[guest.id] || 0;
                const isFull = assigned >= total;

                return (
                  <button
                    key={guest.id}
                    disabled={isFull}
                    onClick={() => {
                      onAssign(target.tableId, target.seatIndex, guest);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-left transition-colors active:bg-black/5 disabled:opacity-40"
                    style={{
                      borderBottom: "1px solid var(--theme-border-light)",
                    }}
                  >
                    {/* Initials circle */}
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-raleway font-bold shrink-0"
                      style={{
                        backgroundColor: isFull
                          ? "var(--theme-primary)"
                          : "color-mix(in srgb, var(--theme-primary) 15%, var(--theme-background))",
                        color: isFull
                          ? "white"
                          : "var(--theme-primary)",
                      }}
                    >
                      {guest.name
                        .trim()
                        .split(/\s+/)
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>

                    {/* Name + category */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-raleway font-medium truncate"
                        style={{ color: "var(--theme-text)" }}
                      >
                        {guest.name}
                      </p>
                      {guest.category && (
                        <span
                          className="text-[10px] font-raleway font-medium"
                          style={{
                            color:
                              CATEGORY_COLORS[guest.category] ||
                              "var(--theme-text-light)",
                          }}
                        >
                          {guest.category}
                        </span>
                      )}
                    </div>

                    {/* Assignment count */}
                    <span
                      className="text-xs font-raleway shrink-0"
                      style={{
                        color: isFull
                          ? "var(--theme-primary)"
                          : "var(--theme-text-light)",
                      }}
                    >
                      {assigned}/{total}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
