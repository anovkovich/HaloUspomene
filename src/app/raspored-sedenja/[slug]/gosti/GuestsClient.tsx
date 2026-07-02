"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Upload,
  FileSpreadsheet,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Check,
  Minus,
} from "lucide-react";
import type { StandaloneGuest } from "@/lib/standalone-seating";
import {
  addGuestAction,
  updateGuestAction,
  removeGuestAction,
  replaceAllGuestsAction,
} from "./actions";

interface ParsedRow {
  rowIndex: number;
  name: string;
  guestCount: number;
  category?: string;
  warnings: string[];
}

interface ParseResult {
  rows: ParsedRow[];
  totalRows: number;
  totalGuests: number;
}

interface Props {
  slug: string;
  eventName: string;
  initialGuests: StandaloneGuest[];
}

export default function GuestsClient({
  slug,
  eventName,
  initialGuests,
}: Props) {
  const router = useRouter();
  const [guests, setGuests] = useState<StandaloneGuest[]>(initialGuests);
  const [, startTransition] = useTransition();

  // Manual add form
  const [addName, setAddName] = useState("");
  const [addCount, setAddCount] = useState(1);
  const [addCategory, setAddCategory] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit modal
  const [editGuest, setEditGuest] = useState<StandaloneGuest | null>(null);
  const [editName, setEditName] = useState("");
  const [editCount, setEditCount] = useState(1);
  const [editCategory, setEditCategory] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Excel import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [previewRows, setPreviewRows] = useState<ParseResult | null>(null);
  const [committing, setCommitting] = useState(false);

  const totalGuestCount = guests.reduce((s, g) => s + g.guestCount, 0);

  // Detect duplicates by normalized name (case-insensitive, trimmed). Display
  // order clusters duplicate-name groups together while preserving the
  // original order of unique entries (group ordered by first appearance).
  const { displayGuests, dupKeys } = useMemo(() => {
    const norm = (s: string) => s.trim().toLowerCase();
    const groups = new Map<string, StandaloneGuest[]>();
    const order: string[] = [];
    for (const g of guests) {
      const key = norm(g.name);
      if (!groups.has(key)) {
        groups.set(key, []);
        order.push(key);
      }
      groups.get(key)!.push(g);
    }
    const display: StandaloneGuest[] = [];
    const dups = new Set<string>();
    for (const key of order) {
      const items = groups.get(key)!;
      display.push(...items);
      if (items.length > 1) dups.add(key);
    }
    return { displayGuests: display, dupKeys: dups };
  }, [guests]);

  function openEdit(g: StandaloneGuest) {
    setEditGuest(g);
    setEditName(g.name);
    setEditCount(g.guestCount);
    setEditCategory(g.category ?? "");
    setConfirmDelete(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    startTransition(async () => {
      const res = await addGuestAction(
        slug,
        addName.trim(),
        addCount,
        addCategory.trim() || undefined,
      );
      setAdding(false);
      if (!res.success || !res.guest) {
        setAddError(res.error ?? "Greška pri dodavanju");
        return;
      }
      setGuests((prev) => [...prev, res.guest!]);
      setAddName("");
      setAddCount(1);
      setAddCategory("");
    });
  }

  async function handleEditSave() {
    if (!editGuest) return;
    setEditSaving(true);
    const res = await updateGuestAction(slug, editGuest.id, {
      name: editName,
      guestCount: editCount,
      category: editCategory,
    });
    setEditSaving(false);
    if (!res.success) {
      alert(res.error ?? "Greška pri čuvanju");
      return;
    }
    setGuests((prev) =>
      prev.map((g) =>
        g.id === editGuest.id
          ? {
              ...g,
              name: editName.trim(),
              guestCount: Math.max(1, Math.floor(editCount) || 1),
              category: editCategory.trim() || undefined,
            }
          : g,
      ),
    );
    setEditGuest(null);
  }

  async function handleEditDelete() {
    if (!editGuest) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setEditSaving(true);
    const res = await removeGuestAction(slug, editGuest.id);
    setEditSaving(false);
    if (!res.success) {
      alert(res.error ?? "Greška pri brisanju");
      return;
    }
    setGuests((prev) => prev.filter((g) => g.id !== editGuest.id));
    setEditGuest(null);
    setConfirmDelete(false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError("");

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/raspored-sedenja/${slug}/import`, {
      method: "POST",
      body: fd,
    });
    setImporting(false);
    e.target.value = ""; // allow re-uploading same file

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setImportError(err.error ?? "Greška pri uvozu");
      return;
    }
    const data = (await res.json()) as ParseResult;
    setPreviewRows(data);
  }

  async function handleConfirmImport() {
    if (!previewRows) return;
    setCommitting(true);
    const res = await replaceAllGuestsAction(
      slug,
      previewRows.rows.map((r) => ({
        name: r.name,
        guestCount: r.guestCount,
        category: r.category,
      })),
    );
    setCommitting(false);
    if (!res.success) {
      alert(res.error ?? "Greška pri uvozu");
      return;
    }
    setPreviewRows(null);
    // Reload server data to reflect new guests
    router.refresh();
    window.location.reload();
  }

  return (
    <div
      className="min-h-screen px-4 py-6 sm:py-10"
      style={{ backgroundColor: "#FAFAF5" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 min-w-0">
            <h1
              className="font-script text-3xl sm:text-4xl truncate"
              style={{ color: "#AE343F" }}
            >
              {eventName}
            </h1>
            <p
              className="text-[11px] uppercase tracking-widest mt-0.5"
              style={{ color: "rgba(35,35,35,0.5)" }}
            >
              Lista gostiju
            </p>
          </div>
          <a
            href={`/raspored-sedenja/${slug}`}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg text-white"
            style={{ backgroundColor: "#AE343F" }}
          >
            Otvori alat za raspored
            <ArrowRight size={13} />
          </a>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div
            className="rounded-xl px-4 py-3"
            style={{
              backgroundColor: "#F5F4DC",
              border: "1px solid rgba(35,35,35,0.08)",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-wider mb-0.5"
              style={{ color: "rgba(35,35,35,0.5)" }}
            >
              Stavke (imena)
            </p>
            <p className="text-lg font-semibold" style={{ color: "#232323" }}>
              {guests.length}
            </p>
          </div>
          <div
            className="rounded-xl px-4 py-3"
            style={{
              backgroundColor: "#F5F4DC",
              border: "1px solid rgba(35,35,35,0.08)",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-wider mb-0.5"
              style={{ color: "rgba(35,35,35,0.5)" }}
            >
              Ukupno gostiju
            </p>
            <p className="text-lg font-semibold" style={{ color: "#AE343F" }}>
              {totalGuestCount}
            </p>
          </div>
        </div>

        {/* Excel import */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid rgba(35,35,35,0.08)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "rgba(174,52,63,0.1)" }}
            >
              <FileSpreadsheet size={18} style={{ color: "#AE343F" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "#232323" }}
              >
                Uvezi iz Excel/CSV
              </p>
              <p
                className="text-xs leading-relaxed mb-2"
                style={{ color: "rgba(35,35,35,0.55)" }}
              >
                Format: 3 kolone — A: ime, B: broj gostiju (prazno = 1), C:
                kategorija (opciono). Header red je dozvoljen i biva
                preskočen automatski.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50 cursor-pointer"
                style={{
                  backgroundColor: "rgba(174,52,63,0.1)",
                  color: "#AE343F",
                }}
              >
                <Upload size={12} />
                {importing ? "Učitavam..." : "Izaberi fajl"}
              </button>
              {importError && (
                <p className="text-xs mt-2" style={{ color: "#c0392b" }}>
                  {importError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Manual add form */}
        <form
          onSubmit={handleAdd}
          className="rounded-2xl p-4 mb-5"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid rgba(35,35,35,0.08)",
          }}
        >
          <p
            className="text-[10px] uppercase tracking-widest font-semibold mb-3"
            style={{ color: "rgba(35,35,35,0.5)" }}
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
                backgroundColor: "#F5F4DC",
                border: "1px solid rgba(35,35,35,0.12)",
                color: "#232323",
              }}
            />
            <input
              type="text"
              value={addCategory}
              onChange={(e) => setAddCategory(e.target.value)}
              placeholder="Kategorija (opciono)"
              className="px-3 py-2 rounded-lg text-sm outline-none sm:w-48"
              style={{
                backgroundColor: "#F5F4DC",
                border: "1px solid rgba(35,35,35,0.12)",
                color: "#232323",
              }}
            />
            <div
              className="flex items-center rounded-lg overflow-hidden"
              style={{
                backgroundColor: "#F5F4DC",
                border: "1px solid rgba(35,35,35,0.12)",
              }}
            >
              <button
                type="button"
                onClick={() => setAddCount((n) => Math.max(1, n - 1))}
                className="px-3 py-2 hover:opacity-60 transition-opacity"
                style={{ color: "rgba(35,35,35,0.6)" }}
                aria-label="Manje"
              >
                <Minus size={14} />
              </button>
              <span
                className="px-3 py-2 text-sm font-bold min-w-[44px] text-center tabular-nums"
                style={{ color: "#232323" }}
              >
                {addCount}
              </span>
              <button
                type="button"
                onClick={() => setAddCount((n) => n + 1)}
                className="px-3 py-2 hover:opacity-60 transition-opacity"
                style={{ color: "rgba(35,35,35,0.6)" }}
                aria-label="Više"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              type="submit"
              disabled={!addName.trim() || adding}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-40 cursor-pointer"
              style={{ backgroundColor: "#AE343F" }}
            >
              {adding ? "Dodajem..." : "Dodaj"}
            </button>
          </div>
          {addError && (
            <p className="text-xs mt-2" style={{ color: "#c0392b" }}>
              {addError}
            </p>
          )}
        </form>

        {/* Guest list */}
        {guests.length === 0 ? (
          <div
            className="rounded-2xl py-14 px-6 text-center"
            style={{
              backgroundColor: "#ffffff",
              border: "1px dashed rgba(35,35,35,0.15)",
            }}
          >
            <Users
              size={28}
              className="mx-auto mb-3"
              style={{ color: "rgba(35,35,35,0.3)" }}
            />
            <p className="text-sm" style={{ color: "rgba(35,35,35,0.6)" }}>
              Još nema gostiju.
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "rgba(35,35,35,0.4)" }}
            >
              Uvezi iz Excel-a ili dodaj ručno gore.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayGuests.map((g) => {
              const isDup = dupKeys.has(g.name.trim().toLowerCase());
              return (
                <div
                  key={g.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                  style={{
                    backgroundColor: isDup
                      ? "rgba(212,175,55,0.10)"
                      : "#ffffff",
                    border: isDup
                      ? "1px solid rgba(212,175,55,0.45)"
                      : "1px solid rgba(35,35,35,0.08)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "#232323" }}
                      >
                        {g.name}
                      </p>
                      {isDup && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold flex items-center gap-1 shrink-0"
                          style={{
                            backgroundColor: "rgba(212,175,55,0.22)",
                            color: "#a87a00",
                          }}
                          title="Više stavki sa istim imenom — proverite duplikate"
                        >
                          <AlertTriangle size={9} />
                          Duplikat
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span
                        className="text-xs"
                        style={{ color: "rgba(35,35,35,0.55)" }}
                      >
                        {g.guestCount} {g.guestCount === 1 ? "osoba" : "osoba"}
                      </span>
                      {g.category && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                          style={{
                            backgroundColor: "rgba(174,52,63,0.08)",
                            color: "#AE343F",
                          }}
                        >
                          {g.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(g)}
                    className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                    style={{ color: "rgba(35,35,35,0.5)" }}
                    title="Uredi"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA on mobile */}
        {guests.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <a
              href={`/raspored-sedenja/${slug}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor: "#AE343F" }}
            >
              Otvori alat za raspored
              <ArrowRight size={14} />
            </a>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editGuest && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
          onClick={() => setEditGuest(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl p-5"
            style={{ backgroundColor: "#ffffff" }}
          >
            <h3 className="text-base font-semibold mb-4" style={{ color: "#232323" }}>
              Uredi gosta
            </h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-2"
              style={{
                backgroundColor: "#F5F4DC",
                border: "1px solid rgba(35,35,35,0.12)",
                color: "#232323",
              }}
              placeholder="Ime gosta"
            />
            <input
              type="text"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-2"
              style={{
                backgroundColor: "#F5F4DC",
                border: "1px solid rgba(35,35,35,0.12)",
                color: "#232323",
              }}
              placeholder="Kategorija (opciono)"
            />
            <div
              className="flex items-center rounded-lg overflow-hidden mb-4"
              style={{
                backgroundColor: "#F5F4DC",
                border: "1px solid rgba(35,35,35,0.12)",
              }}
            >
              <button
                type="button"
                onClick={() => setEditCount((n) => Math.max(1, n - 1))}
                className="px-4 py-2 hover:opacity-60"
                style={{ color: "rgba(35,35,35,0.6)" }}
              >
                <Minus size={14} />
              </button>
              <span
                className="flex-1 text-center text-sm font-bold tabular-nums"
                style={{ color: "#232323" }}
              >
                {editCount}{" "}
                <span
                  className="text-xs font-normal"
                  style={{ color: "rgba(35,35,35,0.5)" }}
                >
                  {editCount === 1 ? "osoba" : "osoba"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setEditCount((n) => n + 1)}
                className="px-4 py-2 hover:opacity-60"
                style={{ color: "rgba(35,35,35,0.6)" }}
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditGuest(null)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: "#F5F4DC",
                  color: "rgba(35,35,35,0.7)",
                }}
              >
                Otkaži
              </button>
              <button
                onClick={handleEditDelete}
                disabled={editSaving}
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
                style={{
                  backgroundColor: confirmDelete ? "#c0392b" : "rgba(192,57,43,0.1)",
                  color: confirmDelete ? "white" : "#c0392b",
                }}
              >
                {confirmDelete ? "Potvrdi brisanje" : <Trash2 size={14} />}
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving || !editName.trim()}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
                style={{ backgroundColor: "#AE343F" }}
              >
                {editSaving ? "Čuvam..." : "Sačuvaj"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel preview modal */}
      {previewRows && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !committing && setPreviewRows(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl flex flex-col max-h-[85vh]"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="px-5 py-4 border-b border-black/5">
              <h3 className="text-base font-semibold" style={{ color: "#232323" }}>
                Pregled uvoza
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "rgba(35,35,35,0.55)" }}>
                {previewRows.totalRows} stavki, {previewRows.totalGuests} ukupno
                gostiju
              </p>
            </div>

            {guests.length > 0 && (
              <div className="mx-5 mt-3 rounded-lg p-3 flex items-start gap-2"
                style={{
                  backgroundColor: "rgba(212,175,55,0.12)",
                  border: "1px solid rgba(212,175,55,0.3)",
                }}
              >
                <AlertTriangle size={14} style={{ color: "#a87a00" }} className="shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed" style={{ color: "#a87a00" }}>
                  Trenutno imate <strong>{guests.length}</strong> postojećih gostiju.
                  Potvrda uvoza će <strong>zameniti svih</strong> sa novim spiskom.
                </p>
              </div>
            )}

            <div className="overflow-auto flex-1 px-5 py-3">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-[10px] uppercase tracking-wider"
                    style={{ color: "rgba(35,35,35,0.45)" }}
                  >
                    <th className="text-left pb-2 pr-2">#</th>
                    <th className="text-left pb-2 pr-2">Ime</th>
                    <th className="text-left pb-2 pr-2">Broj</th>
                    <th className="text-left pb-2 pr-2">Kategorija</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.rows.map((r) => (
                    <tr
                      key={r.rowIndex}
                      className="border-t border-black/5"
                    >
                      <td
                        className="py-1.5 pr-2 text-xs tabular-nums"
                        style={{ color: "rgba(35,35,35,0.4)" }}
                      >
                        {r.rowIndex}
                      </td>
                      <td className="py-1.5 pr-2" style={{ color: "#232323" }}>
                        {r.name}
                        {r.warnings.length > 0 && (
                          <span
                            className="ml-2 text-[10px]"
                            style={{ color: "#a87a00" }}
                          >
                            ⚠ {r.warnings.join(", ")}
                          </span>
                        )}
                      </td>
                      <td
                        className="py-1.5 pr-2 tabular-nums"
                        style={{ color: "rgba(35,35,35,0.7)" }}
                      >
                        {r.guestCount}
                      </td>
                      <td
                        className="py-1.5 pr-2"
                        style={{ color: "rgba(35,35,35,0.55)" }}
                      >
                        {r.category ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-4 border-t border-black/5 flex justify-end gap-2">
              <button
                onClick={() => setPreviewRows(null)}
                disabled={committing}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: "#F5F4DC",
                  color: "rgba(35,35,35,0.7)",
                }}
              >
                Otkaži
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={committing}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-1.5 disabled:opacity-50"
                style={{ backgroundColor: "#AE343F" }}
              >
                {committing ? (
                  "Uvozim..."
                ) : (
                  <>
                    <Check size={13} />
                    Potvrdi uvoz
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
