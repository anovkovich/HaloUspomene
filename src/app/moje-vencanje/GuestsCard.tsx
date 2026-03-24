"use client";

import React, { useState, useMemo, useTransition, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
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
  ExternalLink,
  AlertTriangle,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";
import type { RSVPEntry } from "@/lib/rsvp";
import { triggerHaptic } from "@/lib/haptics";
import {
  loadGuestsAction,
  refreshGuestsAction,
  addManualGuestAction,
  updateGuestCategoryAction,
  updateGuestCountAction,
  deleteGuestAction,
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
  { value: "Mladozenjini", label: "Mladoženjini" },
  { value: "Zajednicki", label: "Zajednički" },
] as const;

function useLongPress(callback: () => void, ms = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didFire = useRef(false);

  const start = useCallback(() => {
    didFire.current = false;
    timerRef.current = setTimeout(() => {
      didFire.current = true;
      triggerHaptic();
      callback();
    }, ms);
  }, [callback, ms]);

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      if (!didFire.current) {
        didFire.current = true;
        callback();
      }
    },
  };
}

function ResponseCard({
  entry,
  category,
  onCategoryChange,
  onEdit,
}: {
  entry: RSVPEntry;
  category?: string;
  onCategoryChange?: (id: string, cat: string) => void;
  onEdit?: (entry: RSVPEntry) => void;
}) {
  const isAttending = entry.attending === "Da";
  const guestCount = parseInt(entry.guestCount) || 1;
  const longPress = useLongPress(() => onEdit?.(entry));

  return (
    <div className="relative p-4 bg-white rounded-xl border border-[#232323]/8 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.03)]">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-[1.5px] ${
                isAttending
                  ? "bg-[#AE343F]/10 border-[#AE343F]"
                  : "bg-[#232323]/5 border-[#232323]/15"
              }`}
            >
              {isAttending ? (
                <Check size={10} className="text-[#AE343F]" strokeWidth={2.5} />
              ) : (
                <X size={10} className="text-[#232323]/30" strokeWidth={2.5} />
              )}
            </div>
            <p className="text-sm font-medium text-[#232323] leading-tight">
              {entry.name}
            </p>
          </div>
          {isAttending ? (
            <span
              className="flex items-center gap-1.5 text-xs font-medium rounded-full bg-[#AE343F]/8 text-[#AE343F] px-2.5 py-1 shrink-0 select-none touch-none cursor-pointer active:scale-95 transition-transform"
              {...longPress}
            >
              <Users size={11} />
              {guestCount} {getPersonLabel(guestCount)}
            </span>
          ) : (
            <span className="flex items-center text-xs font-medium rounded-full bg-[#232323]/5 text-[#232323]/40 px-2.5 py-1 shrink-0">
              Neće doći
            </span>
          )}
        </div>

        {isAttending && (
          <div className="flex gap-1">
            {CATEGORIES.map((cat) => {
              const active = category === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() =>
                    onCategoryChange?.(entry.id, active ? "" : cat.value)
                  }
                  className={`text-xs font-medium px-2 py-1 rounded transition-all cursor-pointer ${
                    active
                      ? "bg-[#AE343F] text-white border border-[#AE343F]"
                      : "bg-[#F5F4DC]/50 text-[#232323]/40 border border-[#232323]/8 hover:border-[#232323]/15"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}

        {entry.details && entry.details !== "-" && (
          <p className="text-sm text-[#232323]/50 flex items-start gap-1.5 leading-relaxed">
            <MessageSquare size={13} className="flex-shrink-0 mt-0.5 text-[#232323]/25" />
            {entry.details}
          </p>
        )}

        {entry.timestamp && (
          <p className="text-xs text-[#232323]/25">
            {formatTimestamp(entry.timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}

function EditGuestModal({
  entry,
  onClose,
  onSave,
  onDelete,
}: {
  entry: RSVPEntry;
  onClose: () => void;
  onSave: (id: string, count: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [count, setCount] = useState(parseInt(entry.guestCount) || 1);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    if (count === 0) {
      if (!confirmDelete) {
        setConfirmDelete(true);
        return;
      }
      setSaving(true);
      await onDelete(entry.id);
      setSaving(false);
      onClose();
      return;
    }
    setSaving(true);
    await onSave(entry.id, count);
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-lg text-[#232323]">Izmeni gosta</h3>
          <button
            onClick={onClose}
            className="text-[#232323]/30 hover:text-[#232323]/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm font-medium text-[#232323] mb-4">{entry.name}</p>

        {/* Count editor */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setCount((c) => Math.max(0, c - 1))}
            className="w-11 h-11 flex items-center justify-center text-lg bg-[#F5F4DC] rounded-xl border border-[#232323]/10 text-[#232323]/60 hover:text-[#232323] cursor-pointer transition-colors"
          >
            −
          </button>
          <span className="text-3xl font-serif text-[#232323] w-10 text-center tabular-nums">
            {count}
          </span>
          <button
            onClick={() => {
              setCount((c) => c + 1);
              setConfirmDelete(false);
            }}
            className="w-11 h-11 flex items-center justify-center text-lg bg-[#F5F4DC] rounded-xl border border-[#232323]/10 text-[#232323]/60 hover:text-[#232323] cursor-pointer transition-colors"
          >
            +
          </button>
        </div>

        <p className="text-center text-xs text-[#232323]/30 mb-5">
          {count === 0
            ? "Gost će biti obrisan"
            : `${count} ${getPersonLabel(count)}`}
        </p>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 ${
            count === 0
              ? confirmDelete
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
              : "bg-[#AE343F] hover:bg-[#8A2A32] text-white"
          }`}
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : count === 0 ? (
            confirmDelete ? (
              <>
                <Trash2 size={14} />
                Kliknite ponovo za brisanje
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Obriši gosta
              </>
            )
          ) : (
            <>
              <Check size={14} />
              Sačuvaj
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface Props {
  slug: string;
  draft?: boolean;
}

export default function GuestsCard({ slug, draft }: Props) {
  const [attending, setAttending] = useState<RSVPEntry[]>([]);
  const [notAttending, setNotAttending] = useState<RSVPEntry[]>([]);
  const [totalGuests, setTotalGuests] = useState(0);
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewFilter, setViewFilter] = useState<"all" | "attending" | "not-attending" | "notes">("all");
  const [isRefreshing, startRefresh] = useTransition();
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [guestError, setGuestError] = useState("");
  const [guestSuccess, setGuestSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RSVPEntry | null>(null);

  useEffect(() => {
    loadGuestsAction().then((result) => {
      if (result) {
        setAttending(result.attending);
        setNotAttending(result.notAttending);
        setTotalGuests(result.totalGuests);
        setEventDate(result.eventDate);
        setCategories(
          Object.fromEntries(result.attending.map((e) => [e.id, e.category])),
        );
      }
      setLoading(false);
    });
  }, []);

  const expiryBanner = useMemo(() => {
    if (!eventDate) return null;
    const now = new Date();
    const ed = new Date(eventDate);
    if (now <= ed) return null;
    const expiryDate = new Date(ed);
    expiryDate.setDate(expiryDate.getDate() + 5);
    const daysLeft = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    const expiryStr = expiryDate.toLocaleDateString("sr-RS", {
      day: "numeric",
      month: "long",
    });
    if (daysLeft > 0) {
      return {
        urgent: false,
        text: `Pristup portalu je aktivan još ${daysLeft} ${daysLeft === 1 ? "dan" : "dana"} (do ${expiryStr}).`,
      };
    }
    return {
      urgent: true,
      text: "Rok od 5 dana od venčanja je istekao. Vaši podaci mogu biti obrisani.",
    };
  }, [eventDate]);

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (draft) {
      toast("Dostupno nakon kreiranja pozivnice — naš tim će vas kontaktirati");
      return;
    }
    if (!guestName.trim()) return;
    setGuestError("");
    startTransition(async () => {
      const result = await addManualGuestAction(guestName.trim(), guestCount);
      if (result.success) {
        setAttending((prev) => [
          ...prev,
          {
            id: result.id ?? "",
            timestamp: new Date().toISOString(),
            name: guestName.trim(),
            attending: "Da",
            guestCount: String(guestCount),
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

  const handleCategoryChange = (id: string, cat: string) => {
    if (!id) return;
    setCategories((prev) => ({ ...prev, [id]: cat }));
    updateGuestCategoryAction(id, cat);
  };

  const handleEditSave = async (id: string, count: number) => {
    await updateGuestCountAction(id, count);
    setAttending((prev) =>
      prev.map((e) => (e.id === id ? { ...e, guestCount: String(count) } : e)),
    );
    setTotalGuests(
      (prev) => {
        const old = attending.find((e) => e.id === id);
        const oldCount = old ? parseInt(old.guestCount) || 1 : 0;
        return prev - oldCount + count;
      },
    );
    toast("Broj gostiju ažuriran");
  };

  const handleEditDelete = async (id: string) => {
    await deleteGuestAction(id);
    const entry = attending.find((e) => e.id === id) || notAttending.find((e) => e.id === id);
    if (entry?.attending === "Da") {
      setAttending((prev) => prev.filter((e) => e.id !== id));
      setTotalGuests((prev) => prev - (parseInt(entry.guestCount) || 1));
    } else {
      setNotAttending((prev) => prev.filter((e) => e.id !== id));
    }
    toast("Gost obrisan");
  };

  const handleRefresh = () => {
    startRefresh(async () => {
      const result = await refreshGuestsAction();
      if (result.success && result.attending && result.notAttending) {
        setAttending(result.attending);
        setNotAttending(result.notAttending);
        setCategories(
          Object.fromEntries(
            result.attending.map((e) => [e.id, e.category]),
          ),
        );
        setTotalGuests(result.totalGuests ?? 0);
      }
    });
  };

  const q = query.toLowerCase().trim();
  const hasCategorized = Object.values(categories).some((c) => c !== "");

  const sumGuests = (filter: (e: RSVPEntry) => boolean) =>
    attending
      .filter(filter)
      .reduce((s, e) => s + (parseInt(e.guestCount) || 1), 0);

  const catCounts = {
    Mladini: sumGuests((e) => categories[e.id] === "Mladini"),
    Mladozenjini: sumGuests((e) => categories[e.id] === "Mladozenjini"),
    Zajednicki: sumGuests((e) => categories[e.id] === "Zajednicki"),
    none: sumGuests((e) => !categories[e.id]),
  };

  // Combine all responses and filter
  const allResponses = [...attending, ...notAttending].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  const filteredResponses = allResponses.filter((r) => {
    const matchesText =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.details.toLowerCase().includes(q);
    const isAttending = r.attending === "Da";
    const matchesCat =
      !categoryFilter || !isAttending ||
      (categoryFilter === "__none__"
        ? !categories[r.id]
        : categories[r.id] === categoryFilter);
    const matchesView =
      viewFilter === "all" ||
      (viewFilter === "attending" && isAttending) ||
      (viewFilter === "not-attending" && !isAttending) ||
      (viewFilter === "notes" && r.details && r.details !== "-" && r.details.trim() !== "");
    return matchesText && matchesCat && matchesView;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#232323]/10 p-6 shadow-sm">
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-[#AE343F]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#232323]/10 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-[#232323]">Gosti</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg transition-colors hover:bg-[#232323]/5 cursor-pointer disabled:opacity-40"
          >
            <RefreshCw
              size={14}
              className={`text-[#232323]/40 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Expiry banner */}
      {expiryBanner && !bannerDismissed && (
        <div
          className={`flex items-start gap-3 px-4 py-3 rounded-xl mb-4 text-sm ${
            expiryBanner.urgent
              ? "bg-[#AE343F]/8 border border-[#AE343F]/20"
              : "bg-[#d4af37]/8 border border-[#d4af37]/20"
          }`}
        >
          <AlertTriangle
            size={15}
            className={`flex-shrink-0 mt-0.5 ${
              expiryBanner.urgent ? "text-[#AE343F]" : "text-[#d4af37]"
            }`}
          />
          <p className="flex-1 text-[#232323]/60 leading-relaxed">
            {expiryBanner.text}
          </p>
          <button
            onClick={() => setBannerDismissed(true)}
            className="flex-shrink-0 text-[#232323]/20 hover:text-[#232323]/40 transition-opacity cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Empty state */}
      {attending.length === 0 && notAttending.length === 0 && (
        <div className="text-center py-12 mb-4 bg-[#F5F4DC]/30 rounded-xl border border-[#232323]/5">
          <Users size={32} className="mx-auto mb-3 text-[#AE343F]/20" />
          <p className="text-sm text-[#232323]/40">Još uvek nema potvrda</p>
        </div>
      )}

      {/* Stats */}
      {(attending.length > 0 || notAttending.length > 0) && (
        <div className="mb-6 space-y-3">
          {/* Compact summary row */}
          <div className="flex items-center justify-between px-1 mb-1">
            <button
              onClick={() => setCategoryFilter("")}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                categoryFilter === "" ? "text-[#AE343F]" : "text-[#232323]/50 hover:text-[#232323]"
              }`}
            >
              {totalGuests} gostiju
            </button>
            <div className="flex items-center gap-3 text-xs text-[#232323]/35">
              <span>{attending.length} potvrđenih</span>
              <span>·</span>
              <span>{notAttending.length} odbijanja</span>
            </div>
          </div>

          {/* Category breakdown */}
          <AnimatePresence>
            {hasCategorized && (
              <motion.div
                className="grid grid-cols-4 gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                {[
                  { label: "Mladini", value: catCounts.Mladini, key: "Mladini" },
                  { label: "Mladoženjini", value: catCounts.Mladozenjini, key: "Mladozenjini" },
                  { label: "Zajednički", value: catCounts.Zajednicki, key: "Zajednicki" },
                  { label: "Ostali", value: catCounts.none, key: "__none__" },
                ].map((item, i) => {
                  const active = categoryFilter === item.key;
                  return (
                    <motion.button
                      key={item.key}
                      onClick={() =>
                        setCategoryFilter(active ? "" : item.key)
                      }
                      className={`text-center py-2.5 px-1 rounded-xl transition-all cursor-pointer ${
                        active
                          ? "bg-[#AE343F]/5 border border-[#AE343F]/20"
                          : "bg-white border border-[#232323]/8"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.07 }}
                    >
                      <p
                        className={`font-serif text-lg mb-0.5 ${
                          active ? "text-[#AE343F]" : "text-[#232323]"
                        }`}
                      >
                        {item.value}
                      </p>
                      <p className="text-[10px] text-[#232323]/35 leading-tight">
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
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#232323]/25"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pretraži..."
          className="w-full bg-white pl-10 pr-10 py-2.5 text-sm rounded-lg border border-[#232323]/10 placeholder:text-[#232323]/25 outline-none focus:border-[#AE343F] transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#232323]/25 hover:text-[#232323]/50 cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Add guest — accordion */}
      <div className="mb-4 rounded-xl border border-[#232323]/5 overflow-hidden">
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[#232323]/40 hover:text-[#232323]/60 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <UserPlus size={12} />
            Dodaj potvrdu ručno
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform ${showAddForm ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3">
                <form onSubmit={handleAddGuest} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ime i prezime"
                    className="flex-1 bg-white px-3 py-2.5 text-sm rounded-lg border border-[#232323]/10 placeholder:text-[#232323]/25 outline-none focus:border-[#AE343F] transition-colors min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                    className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-base bg-white rounded-lg border border-[#232323]/10 text-[#232323]/40 hover:text-[#232323]/60 cursor-pointer transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm w-5 text-center text-[#232323] shrink-0">
                    {guestCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuestCount((c) => c + 1)}
                    className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-base bg-white rounded-lg border border-[#232323]/10 text-[#232323]/40 hover:text-[#232323]/60 cursor-pointer transition-colors"
                  >
                    +
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-[#AE343F] rounded-lg text-white cursor-pointer hover:bg-[#932d35] transition-colors"
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
                      className="mt-2 text-xs text-red-500"
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
                      className="mt-2 text-xs text-[#AE343F] flex items-center gap-1.5"
                    >
                      <Check size={12} strokeWidth={2.5} />
                      Gost je uspešno dodat!
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {([
          { key: "all", label: "Svi", count: attending.length + notAttending.length },
          { key: "attending", label: "Dolaze", count: attending.length },
          { key: "not-attending", label: "Ne dolaze", count: notAttending.length },
          { key: "notes", label: "Sa napomenom", count: null },
        ] as const).map((f) => {
          const active = viewFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setViewFilter(active && f.key !== "all" ? "all" : f.key)}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                active
                  ? "bg-[#AE343F]/8 border border-[#AE343F]/20 text-[#AE343F]"
                  : "bg-[#F5F4DC]/50 border border-[#232323]/8 text-[#232323]/35 hover:text-[#232323]/50"
              }`}
            >
              {f.key === "notes" && <MessageSquare size={10} />}
              {f.label}
              {f.count !== null && (
                <span className={`text-[10px] ${active ? "text-[#AE343F]/60" : "text-[#232323]/20"}`}>
                  {f.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Response list */}
      {filteredResponses.length > 0 ? (
        <div className="space-y-2">
          {filteredResponses.map((entry) => (
            <ResponseCard
              key={entry.id}
              entry={entry}
              category={entry.attending === "Da" ? categories[entry.id] ?? "" : undefined}
              onCategoryChange={entry.attending === "Da" ? handleCategoryChange : undefined}
              onEdit={(e) => setEditingEntry(e)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-[#F5F4DC]/30 rounded-xl border border-[#232323]/5">
          <p className="text-sm text-[#232323]/35">
            {q ? `Nema rezultata za „${query}"` : "Nema gostiju za ovaj filter"}
          </p>
        </div>
      )}

      {editingEntry && (
        <EditGuestModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleEditSave}
          onDelete={handleEditDelete}
        />
      )}
    </div>
  );
}
