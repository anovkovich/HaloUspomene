"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Users,
  MessageSquare,
  Search,
  UserPlus,
  Loader2,
  RefreshCw,
  LayoutDashboard,
} from "lucide-react";
import type { RSVPEntry } from "@/lib/google-sheets";
import type { Entry_IDs } from "../types";
import {
  addManualGuest,
  updateGuestCategory,
  refreshResponses,
} from "./actions";

function getPersonLabel(count: number): string {
  if (count === 1) return "osoba";
  if (count < 5) return "osobe";
  return "osoba";
}

function formatTimestamp(ts: string): string {
  if (!ts) return "";
  const date = new Date(ts);
  if (isNaN(date.getTime())) return ts;
  return date.toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CATEGORIES = [
  { value: "Mladini", label: "Mladini" },
  { value: "Mladozenjini", label: "Mladoženjenini" },
  { value: "Zajednicki", label: "Zajednički" },
] as const;

function ResponseCard({
  entry,
  category,
  onCategoryChange,
}: {
  entry: RSVPEntry;
  category?: string;
  onCategoryChange?: (rowIndex: number, cat: string) => void;
}) {
  const isAttending = entry.attending === "Da";
  const guestCount = parseInt(entry.plusOnes) || 1;

  return (
    <div
      className="relative p-5 sm:p-6 transition-all duration-300"
      style={{
        backgroundColor: "var(--theme-background)",
        borderRadius: "var(--theme-radius)",
        border: "1px solid var(--theme-border-light)",
        boxShadow: "var(--theme-shadow)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5"
          style={{
            backgroundColor: isAttending
              ? "var(--theme-primary-muted)"
              : "rgba(0,0,0,0.05)",
            border: `2px solid ${isAttending ? "var(--theme-primary)" : "var(--theme-border)"}`,
          }}
        >
          {isAttending ? (
            <Check
              size={16}
              style={{ color: "var(--theme-primary)" }}
              strokeWidth={2.5}
            />
          ) : (
            <X
              size={16}
              style={{ color: "var(--theme-text-light)" }}
              strokeWidth={2.5}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row: name + badge */}
          <div className="flex items-start justify-between gap-2">
            <p
              className="text-base font-medium leading-tight"
              style={{ color: "var(--theme-text)" }}
            >
              {entry.name}
            </p>
            {isAttending ? (
              <span
                className="flex items-center gap-1.5 text-xs font-raleway font-medium rounded-full flex-shrink-0 leading-none"
                style={{
                  backgroundColor: "var(--theme-primary-muted)",
                  color: "var(--theme-primary)",
                  padding: "0.25rem 0.75rem 0.25rem calc(0.75rem - 0.15em)",
                }}
              >
                <Users size={11} />
                <span className="mt-px">
                  {guestCount} {getPersonLabel(guestCount)}
                </span>
              </span>
            ) : (
              <span
                className="flex items-center text-xs font-raleway font-medium rounded-full flex-shrink-0 leading-none"
                style={{
                  backgroundColor: "rgba(0,0,0,0.04)",
                  color: "var(--theme-text-light)",
                  padding: "0.25rem 0.75rem 0.25rem calc(0.75rem - 0.15em)",
                }}
              >
                <span className="mt-px">Neće doći</span>
              </span>
            )}
          </div>

          {/* Category toggle — below name, attending only */}
          {isAttending && (
            <div className="flex gap-1 mt-2">
              {CATEGORIES.map((cat) => {
                const active = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() =>
                      onCategoryChange?.(
                        entry.rowIndex,
                        active ? "" : cat.value,
                      )
                    }
                    className="text-xs font-raleway font-medium px-2 py-1 rounded transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: active
                        ? "var(--theme-primary)"
                        : "var(--theme-surface)",
                      color: active ? "white" : "var(--theme-text-light)",
                      border: `1px solid ${active ? "var(--theme-primary)" : "var(--theme-border-light)"}`,
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}

          {entry.details && entry.details !== "-" && (
            <p
              className="mt-2 text-sm leading-relaxed flex items-start gap-1.5"
              style={{ color: "var(--theme-text-muted)" }}
            >
              <MessageSquare
                size={13}
                className="flex-shrink-0 mt-0.5"
                style={{ color: "var(--theme-text-light)" }}
              />
              {entry.details}
            </p>
          )}

          {entry.timestamp && (
            <p
              className="mt-2 text-xs font-raleway opacity-60"
              style={{ color: "var(--theme-text-light)" }}
            >
              {formatTimestamp(entry.timestamp)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface PotvrdeClientProps {
  attending: RSVPEntry[];
  notAttending: RSVPEntry[];
  totalGuests: number;
  formUrl: string;
  entry_IDs: Entry_IDs;
  spreadsheetId: string;
  slug: string;
}

export default function PotvrdeClient({
  attending: initialAttending,
  notAttending,
  totalGuests: initialTotalGuests,
  formUrl,
  entry_IDs,
  spreadsheetId,
  slug,
}: PotvrdeClientProps) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); // "" = all
  const [attending, setAttending] = useState(initialAttending);
  const [totalGuests, setTotalGuests] = useState(initialTotalGuests);
  const [showNotAttending, setShowNotAttending] = useState(true);
  const [onlyWithNotes, setOnlyWithNotes] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [guestError, setGuestError] = useState("");
  const [guestSuccess, setGuestSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<Record<number, string>>(() =>
    Object.fromEntries(initialAttending.map((e) => [e.rowIndex, e.category])),
  );

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setGuestError("");
    startTransition(async () => {
      const result = await addManualGuest(
        formUrl,
        entry_IDs,
        guestName.trim(),
        guestCount,
      );
      if (result.success) {
        setAttending((prev) => [
          ...prev,
          {
            rowIndex: -1,
            timestamp: new Date().toLocaleString("sr-RS"),
            name: guestName.trim(),
            attending: "Da",
            plusOnes: String(guestCount),
            details: "",
            category: "",
          },
        ]);
        setTotalGuests((prev) => prev + guestCount);
        setGuestName("");
        setGuestCount(1);
        setGuestSuccess(true);
        setTimeout(() => setGuestSuccess(false), 2500);
      } else {
        setGuestError(result.error ?? "Greška pri dodavanju");
      }
    });
  };

  const handleCategoryChange = (rowIndex: number, cat: string) => {
    if (rowIndex === -1) return;
    setCategories((prev) => ({ ...prev, [rowIndex]: cat }));
    updateGuestCategory(spreadsheetId, rowIndex, cat);
  };

  const handleRefresh = () => {
    startRefresh(async () => {
      const result = await refreshResponses(spreadsheetId);
      if (result.success && result.attending && result.notAttending) {
        setAttending(result.attending);
        setCategories(
          Object.fromEntries(
            result.attending.map((e) => [e.rowIndex, e.category]),
          ),
        );
        setTotalGuests(result.totalGuests ?? 0);
      }
    });
  };

  const q = query.toLowerCase().trim();

  const hasCategorized = Object.values(categories).some((c) => c !== "");

  // Category guest sums (sum of plusOnes per category, ignoring text filter)
  const sumGuests = (filter: (e: RSVPEntry) => boolean) =>
    attending
      .filter(filter)
      .reduce((s, e) => s + (parseInt(e.plusOnes) || 1), 0);

  const catCounts = {
    Mladini: sumGuests((e) => categories[e.rowIndex] === "Mladini"),
    Mladozenjini: sumGuests((e) => categories[e.rowIndex] === "Mladozenjini"),
    Zajednicki: sumGuests((e) => categories[e.rowIndex] === "Zajednicki"),
    none: sumGuests((e) => !categories[e.rowIndex]),
  };

  const filteredAttending = attending.filter((r) => {
    const matchesText =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.details.toLowerCase().includes(q);
    const matchesCat =
      !categoryFilter ||
      (categoryFilter === "__none__"
        ? !categories[r.rowIndex]
        : categories[r.rowIndex] === categoryFilter);
    const matchesNotes =
      !onlyWithNotes ||
      (r.details && r.details !== "-" && r.details.trim() !== "");
    return matchesText && matchesCat && matchesNotes;
  });

  const filteredNotAttending = q
    ? notAttending.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.details.toLowerCase().includes(q),
      )
    : notAttending;

  const allResponses = [...attending, ...notAttending];

  return (
    <>
      {/* Toolbar: refresh + seating chart link */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <Link
          href={`/pozivnica/${slug}/raspored-sedenja`}
          className="flex items-center gap-2 text-xs font-raleway font-medium px-3 py-2 rounded transition-opacity hover:opacity-80"
          style={{
            backgroundColor: "var(--theme-primary)",
            color: "white",
          }}
        >
          <LayoutDashboard size={13} />
          Raspored sedenja
        </Link>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-xs font-raleway font-medium px-3 py-2 rounded cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{
            backgroundColor: "var(--theme-surface)",
            border: "1px solid var(--theme-border-light)",
            color: "var(--theme-text-light)",
          }}
        >
          <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Osvežavam..." : "Osveži listu"}
        </button>
      </div>

      {/* Stats */}
      {allResponses.length > 0 && (
        <div className="mb-8 space-y-3">
          {/* Small: confirmed + declined */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Potvrđenih odgovora",
                value: attending.length,
                primary: true,
              },
              {
                label: "Odbijanja",
                value: notAttending.length,
                primary: false,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center py-4 px-3"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderRadius: "var(--theme-radius)",
                  border: "1px solid var(--theme-border-light)",
                }}
              >
                <p
                  className="font-serif text-3xl mb-1"
                  style={{
                    color: stat.primary
                      ? "var(--theme-primary)"
                      : "var(--theme-text-muted)",
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="font-raleway text-xs"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Big: total guests — acts as "Svi" filter */}
          <button
            onClick={() => setCategoryFilter("")}
            className="w-full text-center py-6 px-4 transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor:
                categoryFilter === ""
                  ? "var(--theme-primary-muted)"
                  : "var(--theme-surface)",
              borderRadius: "var(--theme-radius)",
              border: `1px solid ${categoryFilter === "" ? "var(--theme-primary)" : "var(--theme-border-light)"}`,
            }}
          >
            <p
              className="font-serif text-5xl sm:text-6xl mb-1"
              style={{ color: "var(--theme-primary)" }}
            >
              {totalGuests}
            </p>
            <p
              className="font-raleway text-xs tracking-wide"
              style={{ color: "var(--theme-text-light)" }}
            >
              Ukupno gostiju
            </p>
          </button>

          {/* Category breakdown boxes — each is a clickable filter */}
          <AnimatePresence>
            {hasCategorized && (
              <motion.div
                className="grid grid-cols-4 gap-2 pt-1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {[
                  {
                    label: "Mladini",
                    value: catCounts.Mladini,
                    key: "Mladini",
                  },
                  {
                    label: "Mladoženjini",
                    value: catCounts.Mladozenjini,
                    key: "Mladozenjini",
                  },
                  {
                    label: "Zajednički",
                    value: catCounts.Zajednicki,
                    key: "Zajednicki",
                  },
                  {
                    label: "Nekategorisani",
                    value: catCounts.none,
                    key: "__none__",
                  },
                ].map((item, i) => {
                  const active = categoryFilter === item.key;
                  return (
                    <motion.button
                      key={item.key}
                      onClick={() => setCategoryFilter(active ? "" : item.key)}
                      className="text-center py-3 px-1 transition-all duration-200 cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: i * 0.07,
                        ease: "easeOut",
                      }}
                      style={{
                        backgroundColor: active
                          ? "var(--theme-primary-muted)"
                          : "var(--theme-surface)",
                        borderRadius: "var(--theme-radius)",
                        border: `1px solid ${active ? "var(--theme-primary)" : "var(--theme-border-light)"}`,
                      }}
                    >
                      <p
                        className="font-serif text-xl mb-1"
                        style={{
                          color: active
                            ? "var(--theme-primary)"
                            : "var(--theme-text)",
                        }}
                      >
                        {item.value}
                      </p>
                      <p
                        className="font-raleway text-[11px] leading-tight"
                        style={{ color: "var(--theme-text-light)" }}
                      >
                        {item.label}
                      </p>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--theme-text-light)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pretraži..."
          className="w-full bg-transparent pl-11 pr-10 py-3 text-sm placeholder:opacity-40 outline-none transition-colors duration-300"
          style={{
            color: "var(--theme-text)",
            backgroundColor: "var(--theme-surface)",
            borderRadius: "var(--theme-radius)",
            border: "1px solid var(--theme-border-light)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--theme-primary)")}
          onBlur={(e) =>
            (e.target.style.borderColor = "var(--theme-border-light)")
          }
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-60"
            style={{ color: "var(--theme-text-light)" }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Inline add guest form */}
      <div
        className="mb-8 p-4"
        style={{
          backgroundColor: "var(--theme-surface)",
          borderRadius: "var(--theme-radius)",
          border: "1px solid var(--theme-border-light)",
        }}
      >
        <p
          className="font-raleway text-xs font-medium mb-3"
          style={{ color: "var(--theme-text-light)" }}
        >
          Dodaj potvrdu ručno
        </p>
        <form onSubmit={handleAddGuest} className="flex items-center gap-2">
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Ime i prezime"
            className="flex-1 bg-transparent px-3 py-2.5 text-sm placeholder:opacity-40 outline-none transition-colors duration-300 min-w-0"
            style={{
              color: "var(--theme-text)",
              backgroundColor: "var(--theme-background)",
              borderRadius: "var(--theme-radius)",
              border: "1px solid var(--theme-border-light)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--theme-primary)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--theme-border-light)")
            }
          />
          <button
            type="button"
            onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-base transition-opacity hover:opacity-60 cursor-pointer"
            style={{
              backgroundColor: "var(--theme-background)",
              borderRadius: "var(--theme-radius)",
              border: "1px solid var(--theme-border-light)",
              color: "var(--theme-text-light)",
            }}
          >
            −
          </button>
          <span
            className="font-raleway text-base w-6 text-center flex-shrink-0"
            style={{ color: "var(--theme-text)" }}
          >
            {guestCount}
          </span>
          <button
            type="button"
            onClick={() => setGuestCount((c) => c + 1)}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-base transition-opacity hover:opacity-60 cursor-pointer"
            style={{
              backgroundColor: "var(--theme-background)",
              borderRadius: "var(--theme-radius)",
              border: "1px solid var(--theme-border-light)",
              color: "var(--theme-text-light)",
            }}
          >
            +
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center transition-opacity hover:opacity-80 cursor-pointer"
            style={{
              backgroundColor: "var(--theme-primary)",
              borderRadius: "var(--theme-radius)",
              color: "white",
            }}
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <UserPlus size={14} />
            )}
          </button>
        </form>
        <AnimatePresence>
          {guestError && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs"
              style={{ color: "#c0392b" }}
            >
              {guestError}
            </motion.p>
          )}
          {guestSuccess && (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs flex items-center gap-1.5"
              style={{ color: "var(--theme-primary)" }}
            >
              <Check size={12} strokeWidth={2.5} />
              Gost je uspešno dodat!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Attending */}
      {attending.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Check
              size={14}
              style={{ color: "var(--theme-primary)" }}
              strokeWidth={2.5}
            />
            <h2
              className="font-raleway text-xs font-medium tracking-wide pt-1"
              style={{ color: "var(--theme-primary)" }}
            >
              Dolaze · {filteredAttending.length} / {attending.length}
            </h2>
            <button
              onClick={() => setOnlyWithNotes((v) => !v)}
              className="ml-auto flex items-center gap-1.5 text-xs font-raleway font-medium px-2.5 py-1 rounded cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: onlyWithNotes
                  ? "var(--theme-primary-muted)"
                  : "var(--theme-surface)",
                border: `1px solid ${onlyWithNotes ? "var(--theme-primary)" : "var(--theme-border-light)"}`,
                color: onlyWithNotes
                  ? "var(--theme-primary)"
                  : "var(--theme-text-light)",
              }}
            >
              <MessageSquare size={11} />
              {onlyWithNotes ? "Sve potvrde" : "Samo sa napomenom"}
            </button>
          </div>
          {filteredAttending.length === 0 && onlyWithNotes && !q ? (
            <div
              className="text-center py-10"
              style={{
                backgroundColor: "var(--theme-surface)",
                borderRadius: "var(--theme-radius)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <p
                className="text-sm font-raleway"
                style={{ color: "var(--theme-text-muted)" }}
              >
                Niko od gostiju nije ostavio napomenu.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAttending.map((entry, i) => (
                <ResponseCard
                  key={i}
                  entry={entry}
                  category={categories[entry.rowIndex] ?? ""}
                  onCategoryChange={handleCategoryChange}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Not attending */}
      {filteredNotAttending.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <X
              size={14}
              style={{ color: "var(--theme-text-light)" }}
              strokeWidth={2.5}
            />
            <h2
              className="font-raleway text-xs font-medium tracking-wide leading-none pt-1"
              style={{ color: "var(--theme-text-light)" }}
            >
              Ne dolaze · {filteredNotAttending.length}
            </h2>
            <button
              onClick={() => setShowNotAttending((v) => !v)}
              className="ml-auto text-xs font-raleway font-medium px-2.5 py-1 rounded cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
                color: "var(--theme-text-light)",
              }}
            >
              {showNotAttending
                ? "Skloni one koji ne dolaze"
                : "Prikaži one koji ne dolaze"}
            </button>
          </div>
          <AnimatePresence>
            {showNotAttending && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {filteredNotAttending.map((entry, i) => (
                  <ResponseCard key={i} entry={entry} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* No results */}
      {q &&
        filteredAttending.length === 0 &&
        filteredNotAttending.length === 0 && (
          <div
            className="text-center py-12"
            style={{
              backgroundColor: "var(--theme-surface)",
              borderRadius: "var(--theme-radius)",
              border: "1px solid var(--theme-border-light)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--theme-text-muted)" }}>
              Nema rezultata za „{query}"
            </p>
          </div>
        )}
    </>
  );
}
