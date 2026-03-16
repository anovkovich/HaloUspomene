"use client";

import { useState, useEffect, useMemo, useTransition, useRef } from "react";
import type { RSVPEntry } from "@/lib/google-sheets";
import type { TableData, TableType, SeatAssignment } from "./types";
import GuestSidebar from "./GuestSidebar";
import TableNode from "./TableNode";
import Toolbar from "./Toolbar";
import AddTablePanel from "./AddTablePanel";
import UpgradeModal from "./UpgradeModal";
import { saveRaspored, loadRaspored } from "./actions";
import { generateAndDownloadPDF } from "./generatePDF";

interface Props {
  attending: RSVPEntry[];
  slug: string;
  coupleNames: string;
  spreadsheetId?: string;
  paidForRaspored: boolean;
}

function createTable(type: TableType, label: string, seats: number, offset: number): TableData {
  return {
    id: `table-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    seats,
    x: 40 + (offset % 4) * 250,
    y: 40 + Math.floor(offset / 4) * 290,
    label,
    assignments: Array(seats).fill(null),
  };
}

export default function RasporedClient({
  attending,
  slug,
  coupleNames,
  spreadsheetId,
  paidForRaspored,
}: Props) {
  const [isMobileWarning, setIsMobileWarning] = useState(false);
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<RSVPEntry | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, startSave] = useTransition();
  const initialLoadDone = useRef(false);

  // Show mobile warning once per session
  useEffect(() => {
    if (window.innerWidth < 1024) setIsMobileWarning(true);
  }, []);

  // Load from Google Sheets on mount (Sheets is the single source of truth)
  useEffect(() => {
    let cancelled = false;
    if (spreadsheetId) {
      loadRaspored(spreadsheetId).then((json) => {
        if (cancelled) return;
        try {
          if (json) setTables(JSON.parse(json));
        } catch { /* ignore malformed JSON */ }
        setHydrated(true);
      });
    } else {
      setHydrated(true);
    }
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark dirty when tables change after initial load
  useEffect(() => {
    if (!hydrated) return;
    if (!initialLoadDone.current) { initialLoadDone.current = true; return; }
    setIsDirty(true);
  }, [tables, hydrated]);

  // Block tab close when unsaved
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const assignedCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const table of tables)
      for (const seat of table.assignments)
        if (seat) counts[seat.guestRowIndex] = (counts[seat.guestRowIndex] || 0) + 1;
    return counts;
  }, [tables]);

  useEffect(() => {
    if (!selectedGuest) return;
    const total = parseInt(selectedGuest.plusOnes) || 1;
    if ((assignedCounts[selectedGuest.rowIndex] || 0) >= total) setSelectedGuest(null);
  }, [assignedCounts, selectedGuest]);

  const totalAssigned = useMemo(
    () => Object.values(assignedCounts).reduce((s, n) => s + n, 0),
    [assignedCounts],
  );

  const addTable = (type: TableType, label?: string, seats?: number) => {
    if (!paidForRaspored && (type === "rectangular" || type === "circle")) {
      if (tables.filter((t) => t.type === type).length >= 2) {
        setShowUpgradeModal(true);
        return;
      }
    }
    const defaultSeats = type === "circle" ? 12 : type === "single-sided" ? 6 : 8;
    const idx = tables.length;
    setTables((prev) => [...prev, createTable(type, label ?? `Sto ${idx + 1}`, seats ?? defaultSeats, idx)]);
  };

  const addDecoration = (label: string, decorationType: TableData["decorationType"]) => {
    const idx = tables.length;
    setTables((prev) => [
      ...prev,
      {
        id: `deco-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "decoration",
        seats: 0,
        x: 40 + (idx % 4) * 200,
        y: 40 + Math.floor(idx / 4) * 120,
        label,
        assignments: [],
        decorationType,
      },
    ]);
  };

  const updateTable = (id: string, changes: Partial<TableData>) =>
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));

  const deleteTable = (id: string) =>
    setTables((prev) => prev.filter((t) => t.id !== id));

  const handleSeatClick = (tableId: string, seatIndex: number) => {
    const targetTable = tables.find((t) => t.id === tableId);
    const isRemoving = !!targetTable?.assignments[seatIndex];
    if (!isRemoving && selectedGuest && !paidForRaspored && totalAssigned >= 1) {
      setShowUpgradeModal(true);
      return;
    }
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const seat = t.assignments[seatIndex];
        if (seat) {
          const a = [...t.assignments]; a[seatIndex] = null; return { ...t, assignments: a };
        }
        if (!selectedGuest) return t;
        const total = parseInt(selectedGuest.plusOnes) || 1;
        if ((assignedCounts[selectedGuest.rowIndex] || 0) >= total) return t;
        const a = [...t.assignments];
        const assignment: SeatAssignment = { guestRowIndex: selectedGuest.rowIndex, guestName: selectedGuest.name };
        a[seatIndex] = assignment;
        return { ...t, assignments: a };
      }),
    );
  };

  const handleSave = () => {
    if (!spreadsheetId) return;
    setSaveError("");
    startSave(async () => {
      const result = await saveRaspored(spreadsheetId, JSON.stringify(tables));
      if (result.success) {
        setIsDirty(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        setSaveError(result.error ?? "Greška");
        setTimeout(() => setSaveError(""), 3000);
      }
    });
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--theme-background)" }}>

      {isMobileWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-7 flex flex-col items-center gap-4 text-center shadow-2xl"
            style={{ backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border-light)" }}
          >
            <div className="text-4xl">💻</div>
            <h2
              className="font-raleway font-semibold text-base leading-snug"
              style={{ color: "var(--theme-text)" }}
            >
              Ova stranica je optimizovana za računar
            </h2>
            <p
              className="font-raleway text-sm leading-relaxed"
              style={{ color: "var(--theme-text-light)" }}
            >
              Raspored sedenja je interaktivna alatka koja najboije funkcioniše na laptopu ili desktop računaru. Preporučujemo da je otvorite sa većeg uređaja.
            </p>
            <a
              href={`/pozivnica/${slug}/potvrde`}
              className="mt-1 w-full py-2.5 rounded-xl font-raleway text-sm font-medium transition-opacity hover:opacity-80 text-center"
              style={{ backgroundColor: "var(--theme-primary)", color: "white" }}
            >
              Vrati se na pregled potvrda
            </a>
            <button
              onClick={() => setIsMobileWarning(false)}
              className="font-raleway text-xs transition-opacity hover:opacity-60"
              style={{ color: "var(--theme-text-light)" }}
            >
              Svejedno nastavi
            </button>
          </div>
        </div>
      )}
      <GuestSidebar
        attending={attending}
        selectedGuest={selectedGuest}
        onSelectGuest={setSelectedGuest}
        assignedCounts={assignedCounts}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Toolbar
          slug={slug}
          coupleNames={coupleNames}
          spreadsheetId={spreadsheetId}
          tables={tables}
          isDirty={isDirty}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
          saveError={saveError}
          onSave={handleSave}
          onDownloadPDF={() => generateAndDownloadPDF(tables, attending, coupleNames)}
        />

        <div className="flex-1 relative overflow-hidden">
          <AddTablePanel
            onAddTable={addTable}
            onAddDecoration={addDecoration}
            totalSeats={tables.reduce((s, t) => s + (t.type !== "decoration" ? t.seats : 0), 0)}
            occupiedSeats={tables.reduce((s, t) => s + t.assignments.filter(Boolean).length, 0)}
          />

          {/* Scrollable canvas */}
          <div
            className="absolute inset-0 overflow-auto"
            style={{
              backgroundImage: "radial-gradient(circle, color-mix(in srgb, var(--theme-border) 50%, transparent) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          >
            <div style={{ minWidth: 1600, minHeight: 1100, position: "relative" }}>
              {hydrated && tables.map((table) => (
                <TableNode
                  key={table.id}
                  table={table}
                  selectedGuest={selectedGuest}
                  onSeatClick={handleSeatClick}
                  onUpdate={updateTable}
                  onDelete={deleteTable}
                />
              ))}

              {hydrated && tables.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="font-raleway text-sm" style={{ color: "var(--theme-text-light)" }}>
                    Dodaj stolove koristeći dugmad levo gore
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
    </div>
  );
}
