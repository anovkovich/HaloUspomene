"use client";

import {
  useState,
  useRef,
  useCallback,
  useTransition,
} from "react";
import {
  Check,
  X,
  Users,
  MessageSquare,
  RefreshCw,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Minus,
} from "lucide-react";
import type { BirthdayRSVPEntry } from "@/lib/birthday-rsvp";
import {
  addPunoletstvoManualGuestAction,
  updatePunoletstvoGuestCountAction,
  deletePunoletstvoGuestAction,
} from "./actions";

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

function useLongPress(callback: () => void, ms = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didFire = useRef(false);

  const start = useCallback(() => {
    didFire.current = false;
    timerRef.current = setTimeout(() => {
      didFire.current = true;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          (navigator as Navigator & { vibrate?: (p: number) => void }).vibrate?.(
            20,
          );
        } catch {
          /* noop */
        }
      }
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

interface Props {
  responses: BirthdayRSVPEntry[];
  slug: string;
  displayName: string;
}

export default function PunoletstvoPortalClient({
  responses: initial,
  slug,
}: Props) {
  const [responses, setResponses] = useState<BirthdayRSVPEntry[]>(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [, startTransition] = useTransition();

  // Manual add form state
  const [addName, setAddName] = useState("");
  const [addCount, setAddCount] = useState(1);
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit modal state — count of 0 morphs the primary button into a
  // delete-with-double-confirm flow (mirrors the wedding GuestsCard pattern).
  const [editEntry, setEditEntry] = useState<BirthdayRSVPEntry | null>(null);
  const [editCount, setEditCount] = useState(1);
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    window.location.reload();
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      setAddError("Unesite ime gosta");
      return;
    }
    setAddError("");
    setAdding(true);
    startTransition(async () => {
      const result = await addPunoletstvoManualGuestAction(
        slug,
        addName.trim(),
        addCount,
      );
      if (result.success) {
        setResponses((prev) => [
          ...prev,
          {
            id: result.id ?? "",
            timestamp: new Date().toISOString(),
            name: addName.trim(),
            attending: "Da",
            guestCount: String(addCount),
            message: "",
          },
        ]);
        setAddName("");
        setAddCount(1);
      } else {
        setAddError(result.error ?? "Greška pri dodavanju");
      }
      setAdding(false);
    });
  };

  const openEdit = (entry: BirthdayRSVPEntry) => {
    setEditEntry(entry);
    setEditCount(parseInt(entry.guestCount) || 1);
    setEditError("");
    setConfirmDelete(false);
  };

  const handleEditSave = async () => {
    if (!editEntry) return;
    const n = Math.max(0, Math.floor(editCount));

    // Count dropped to 0 → delete flow with double-confirm
    if (n === 0) {
      if (!confirmDelete) {
        setConfirmDelete(true);
        return;
      }
      setEditSaving(true);
      setEditError("");
      const result = await deletePunoletstvoGuestAction(slug, editEntry.id);
      setEditSaving(false);
      if (result.success) {
        setResponses((prev) => prev.filter((e) => e.id !== editEntry.id));
        setEditEntry(null);
      } else {
        setEditError(result.error ?? "Greška pri brisanju");
      }
      return;
    }

    setEditSaving(true);
    setEditError("");
    const result = await updatePunoletstvoGuestCountAction(slug, editEntry.id, n);
    setEditSaving(false);
    if (result.success) {
      setResponses((prev) =>
        prev.map((e) =>
          e.id === editEntry.id ? { ...e, guestCount: String(n) } : e,
        ),
      );
      setEditEntry(null);
    } else {
      setEditError(result.error ?? "Greška pri čuvanju");
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: "var(--theme-text)" }}>
          Prijave ({responses.length})
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor: "var(--theme-surface)",
            color: "var(--theme-primary)",
            border: "1px solid var(--theme-border-light)",
          }}
        >
          {refreshing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          Osveži
        </button>
      </div>

      {/* Manual add form */}
      <form
        onSubmit={handleAddGuest}
        className="mb-4 p-4 rounded-2xl space-y-3"
        style={{
          backgroundColor: "var(--theme-surface)",
          border: "1px solid var(--theme-border-light)",
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--theme-text-muted)" }}
        >
          Dodaj gosta ručno
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="Ime gosta"
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: "var(--theme-background)",
              border: "1px solid var(--theme-border-light)",
              color: "var(--theme-text)",
            }}
          />
          <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{
              backgroundColor: "var(--theme-background)",
              border: "1px solid var(--theme-border-light)",
            }}
          >
            <button
              type="button"
              onClick={() => setAddCount((n) => Math.max(1, n - 1))}
              className="px-3 py-2 transition-colors hover:opacity-70 cursor-pointer"
              style={{ color: "var(--theme-text-muted)" }}
              aria-label="Manje gostiju"
            >
              <Minus size={14} />
            </button>
            <span
              className="px-3 py-2 text-sm font-bold min-w-[44px] text-center"
              style={{ color: "var(--theme-text)" }}
            >
              {addCount}
            </span>
            <button
              type="button"
              onClick={() => setAddCount((n) => n + 1)}
              className="px-3 py-2 transition-colors hover:opacity-70 cursor-pointer"
              style={{ color: "var(--theme-text-muted)" }}
              aria-label="Više gostiju"
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            type="submit"
            disabled={adding || !addName.trim()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer"
            style={{ backgroundColor: "var(--theme-primary)" }}
          >
            {adding ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Dodaj
          </button>
        </div>
        {addError && (
          <p className="text-xs text-red-500">{addError}</p>
        )}
      </form>

      {/* Response list */}
      {responses.length === 0 ? (
        <div
          className="p-8 rounded-2xl text-center"
          style={{
            backgroundColor: "var(--theme-surface)",
            border: "1px solid var(--theme-border-light)",
          }}
        >
          <p style={{ color: "var(--theme-text-muted)" }}>
            Još nema prijava. Podelite link pozivnice sa gostima!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {responses.map((entry) => (
            <ResponseCard key={entry.id} entry={entry} onEdit={openEdit} />
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !editSaving && setEditEntry(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "var(--theme-surface)" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "var(--theme-text-muted)" }}
            >
              Uredi prijavu
            </p>
            <p
              className="text-lg font-bold mb-4"
              style={{ color: "var(--theme-text)" }}
            >
              {editEntry.name}
            </p>

            <label
              className="text-xs"
              style={{ color: "var(--theme-text-muted)" }}
            >
              Broj gostiju
            </label>
            <div
              className="flex items-center rounded-lg overflow-hidden mt-1 mb-2"
              style={{
                backgroundColor: "var(--theme-background)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <button
                type="button"
                onClick={() => setEditCount((n) => Math.max(0, n - 1))}
                className="px-4 py-2 transition-colors hover:opacity-70 cursor-pointer"
                style={{ color: "var(--theme-text-muted)" }}
              >
                <Minus size={16} />
              </button>
              <span
                className="flex-1 py-2 text-center text-lg font-bold tabular-nums"
                style={{ color: "var(--theme-text)" }}
              >
                {editCount}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditCount((n) => n + 1);
                  setConfirmDelete(false);
                }}
                className="px-4 py-2 transition-colors hover:opacity-70 cursor-pointer"
                style={{ color: "var(--theme-text-muted)" }}
              >
                <Plus size={16} />
              </button>
            </div>

            <p
              className="text-center text-xs mb-4"
              style={{ color: "var(--theme-text-muted)" }}
            >
              {editCount === 0
                ? "Gost će biti obrisan"
                : `${editCount} ${editCount === 1 ? "osoba" : "osobe"}`}
            </p>

            {editError && (
              <p className="text-xs text-red-500 mb-3">{editError}</p>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditEntry(null)}
                disabled={editSaving}
                className="px-3 py-2 text-sm transition-opacity hover:opacity-70 cursor-pointer"
                style={{ color: "var(--theme-text-muted)" }}
              >
                Otkaži
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                disabled={editSaving}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer ${
                  editCount === 0
                    ? confirmDelete
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                    : "text-white hover:opacity-90"
                }`}
                style={
                  editCount === 0
                    ? undefined
                    : { backgroundColor: "var(--theme-primary)" }
                }
              >
                {editSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : editCount === 0 ? (
                  <>
                    <Trash2 size={14} />
                    {confirmDelete ? "Kliknite ponovo za brisanje" : "Obriši gosta"}
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Sačuvaj
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResponseCard({
  entry,
  onEdit,
}: {
  entry: BirthdayRSVPEntry;
  onEdit: (entry: BirthdayRSVPEntry) => void;
}) {
  const isAttending = entry.attending === "Da";
  const guestCount = parseInt(entry.guestCount) || 1;
  const longPress = useLongPress(() => onEdit(entry));

  return (
    <div
      className="relative p-4 sm:p-5 rounded-2xl transition-all select-none"
      style={{
        backgroundColor: "var(--theme-surface)",
        border: "1px solid var(--theme-border-light)",
        boxShadow: "var(--theme-shadow)",
      }}
      {...longPress}
      title="Zadrži ili desni klik za izmenu"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(entry);
        }}
        className="absolute top-2 right-2 p-1.5 rounded-full opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
        style={{ color: "var(--theme-text-muted)" }}
        aria-label="Izmeni"
      >
        <Pencil size={12} />
      </button>

      <div className="flex items-start justify-between gap-3 pr-6">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: isAttending
                ? "var(--theme-primary-muted)"
                : "rgba(0,0,0,0.05)",
            }}
          >
            {isAttending ? (
              <Check size={14} style={{ color: "var(--theme-primary)" }} />
            ) : (
              <X size={14} style={{ color: "var(--theme-text-light)" }} />
            )}
          </div>

          <div className="min-w-0">
            <p
              className="font-bold text-sm truncate"
              style={{ color: "var(--theme-text)" }}
            >
              {entry.name}
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--theme-text-light)" }}
            >
              {formatTimestamp(entry.timestamp)}
            </p>
          </div>
        </div>

        {isAttending && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
            style={{
              backgroundColor: "var(--theme-primary-muted)",
              color: "var(--theme-primary)",
            }}
          >
            <Users size={12} />
            <span className="text-xs font-bold">{guestCount}</span>
          </div>
        )}
      </div>

      {entry.message && (
        <div className="mt-3 flex items-start gap-2 pr-6">
          <MessageSquare
            size={12}
            className="mt-0.5 flex-shrink-0"
            style={{ color: "var(--theme-text-light)" }}
          />
          <p
            className="text-sm italic"
            style={{ color: "var(--theme-text-muted)" }}
          >
            {entry.message}
          </p>
        </div>
      )}
    </div>
  );
}
