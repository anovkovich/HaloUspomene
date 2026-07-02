"use client";

import { useState } from "react";
import { Check, X, RotateCcw, Pencil, Users } from "lucide-react";
import type { RSVPEntry } from "@/lib/rsvp";

// Wedding category values are stored without diacritics in the DB ("Mladozenjini"),
// but displayed with them ("Mladoženjini"). This map only enriches labels for the
// known wedding values; unknown categories (standalone events, custom imports)
// fall through and use the raw value as label.
const WEDDING_CATEGORY_LABELS: Record<string, string> = {
  Mladini: "Mladini",
  Mladozenjini: "Mladoženjini",
  Zajednicki: "Zajednički",
};

/** Whether a guest passes the sidebar's category + search filter. Exported so
 *  the editor's auto-advance picks the next guest from the *visible* list. */
export function guestMatchesFilter(
  g: RSVPEntry,
  filter: string,
  search: string,
): boolean {
  if (filter === "Nekategorisani") {
    if (g.category) return false;
  } else if (filter) {
    if (g.category !== filter) return false;
  }
  const q = search.trim();
  if (q) {
    const norm = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (!norm(g.name).includes(norm(q))) return false;
  }
  return true;
}

interface Props {
  attending: RSVPEntry[];
  selectedGuest: RSVPEntry | null;
  onSelectGuest: (guest: RSVPEntry | null) => void;
  assignedCounts: Record<string, number>;
  onStartOver: () => void;
  /** Optional sticky CTA at the top of the sidebar (e.g. "Lista gostiju" link
   *  for standalone routes that have no toolbar back button). */
  topAction?: { label: string; href: string };
  /** Per-party member names, keyed by RSVP id — drives the "names entered"
   *  indicator on the per-guest button. */
  members?: Record<string, string[]>;
  /** Open the modal to enter individual names for everyone on a party. */
  onEditMembers?: (guest: RSVPEntry) => void;
  /** Category filter — controlled by the parent so auto-advance shares it. */
  filter: string;
  onFilterChange: (v: string) => void;
  /** Name search — controlled by the parent for the same reason. */
  search: string;
  onSearchChange: (v: string) => void;
}

export default function GuestSidebar({
  attending,
  selectedGuest,
  onSelectGuest,
  assignedCounts,
  onStartOver,
  topAction,
  members,
  onEditMembers,
  filter,
  onFilterChange,
  search,
  onSearchChange,
}: Props) {
  const [confirmReset, setConfirmReset] = useState(false);

  // Birthday RSVPs don't carry wedding-side categories (Mladini/Mladoženjini/…),
  // so the filter becomes noise — hide it entirely when no guest has one.
  const hasCategorizedGuests = attending.some((g) => !!g.category);
  const hasUncategorized = attending.some((g) => !g.category);

  // Build filter options from the actual category values present on the guest
  // list. This adapts to whatever the consumer route provides (wedding sides,
  // birthday categories, standalone imports like VIP/Govornici/Sponzori) without
  // showing hardcoded options that don't apply.
  const categoryValues = Array.from(
    new Set(
      attending
        .map((g) => g.category)
        .filter((c): c is string => typeof c === "string" && c.length > 0),
    ),
  ).sort();

  const filterOptions: { value: string; label: string }[] = [
    { value: "", label: "Svi gosti" },
    ...categoryValues.map((cat) => ({
      value: cat,
      label: WEDDING_CATEGORY_LABELS[cat] ?? cat,
    })),
    ...(hasUncategorized
      ? [{ value: "Nekategorisani", label: "Nekategorisani" }]
      : []),
  ];

  const filtered = attending.filter((g) =>
    guestMatchesFilter(g, filter, search),
  );

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
      {/* Optional top CTA — used by standalone routes for "Lista gostiju" */}
      {topAction && (
        <a
          href={topAction.href}
          className="flex items-center justify-center gap-1.5 mx-3 mt-3 px-3 py-2 rounded-lg text-xs font-raleway font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--theme-primary)" }}
        >
          <Pencil size={12} />
          {topAction.label}
        </a>
      )}

      {/* Header stats */}
      <div
        className="px-4 py-3 border-b"
        style={{
          borderColor: "var(--theme-border-light)",
          marginTop: topAction ? "0.75rem" : 0,
        }}
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
        {hasCategorizedGuests && (
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full text-xs font-raleway px-2 py-1.5 rounded outline-none"
            style={{
              backgroundColor: "var(--theme-background)",
              border: "1px solid var(--theme-border-light)",
              color: "var(--theme-text)",
            }}
          >
            {filterOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
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
              onClick={() => onSearchChange("")}
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

          const hasNames = (members?.[guest.id] ?? []).some(
            (n) => n && n.trim(),
          );

          return (
            <div
              key={guest.id}
              onClick={() => onSelectGuest(isSelected ? null : guest)}
              className="w-full text-left px-3 py-2 rounded-lg mb-1 transition-all cursor-pointer"
              style={{
                backgroundColor: isSelected
                  ? "var(--theme-primary)"
                  : "transparent",
                color: isSelected ? "white" : "var(--theme-text)",
                opacity: isFullyAssigned && !isSelected ? 0.45 : 1,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {onEditMembers && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditMembers(guest);
                      }}
                      title="Unesi imena gostiju na ovoj zvanici"
                      className="shrink-0 flex items-center justify-center w-5 h-5 rounded transition-colors cursor-pointer"
                      style={{
                        color: isSelected
                          ? "rgba(255,255,255,0.9)"
                          : hasNames
                            ? "var(--theme-primary)"
                            : "var(--theme-text-light)",
                        backgroundColor: isSelected
                          ? "rgba(255,255,255,0.18)"
                          : hasNames
                            ? "var(--theme-primary-light, rgba(212,175,55,0.18))"
                            : "transparent",
                      }}
                    >
                      <Users size={12} />
                    </button>
                  )}
                  <span
                    className="text-xs font-raleway font-medium truncate"
                    style={{ minWidth: 0 }}
                  >
                    {guest.name}
                  </span>
                </div>

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
            </div>
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
