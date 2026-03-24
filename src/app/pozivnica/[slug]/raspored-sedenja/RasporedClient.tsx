"use client";

import {
  useState,
  useEffect,
  useMemo,
  useTransition,
  useRef,
  useCallback,
} from "react";
import type { RSVPEntry } from "@/lib/rsvp";
import type { TableData, TableType, SeatAssignment } from "./types";
import {
  Menu,
  ZoomIn,
  ZoomOut,
  FileDown,
  QrCode,
  Users,
  X,
} from "lucide-react";
import GuestSidebar from "./GuestSidebar";
import TableNode from "./TableNode";
import Toolbar from "./Toolbar";
import AddTablePanel from "./AddTablePanel";
import UpgradeModal from "./UpgradeModal";
import { saveRaspored, loadRaspored, checkPaidStatus } from "./actions";
import { generateAndDownloadPDF } from "./generatePDF";

interface Props {
  attending: RSVPEntry[];
  slug: string;
  coupleNames: string;
  paidForRaspored: boolean;
}

function createTable(
  type: TableType,
  label: string,
  seats: number,
  offset: number,
): TableData {
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
  paidForRaspored: initialPaid,
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
  const [paidForRaspored, setPaidForRaspored] = useState(initialPaid);
  const [toast, setToast] = useState<string | null>(null);

  // PWA mobile mode
  const [isPWAMobile, setIsPWAMobile] = useState(false);
  const [zoom, setZoom] = useState(0.3);
  const [sheetTable, setSheetTable] = useState<TableData | null>(null);
  const [showGuestPanel, setShowGuestPanel] = useState(false);
  const [showPWAMenu, setShowPWAMenu] = useState(false);
  const [sheetGuest, setSheetGuest] = useState<RSVPEntry | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        pinchRef.current = { dist, zoom };
      }
    },
    [zoom],
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const scale = dist / pinchRef.current.dist;
      setZoom(
        Math.max(
          0.15,
          Math.min(1, +(pinchRef.current.zoom * scale).toFixed(2)),
        ),
      );
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    pinchRef.current = null;
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Always check paid status from DB on gated actions
  const recheckPaid = async (): Promise<boolean> => {
    const fresh = await checkPaidStatus(slug);
    setPaidForRaspored(fresh);
    return fresh;
  };

  // Show mobile warning once per session (skip in PWA)
  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    const mobile = window.innerWidth < 1024;
    if (standalone && mobile) {
      setIsPWAMobile(true);
      setZoom(Math.min(window.innerWidth / 1700, 0.35));
    } else if (mobile) {
      setIsMobileWarning(true);
    }
  }, []);

  // Load seating layout from MongoDB on mount
  useEffect(() => {
    let cancelled = false;
    if (slug) {
      loadRaspored(slug).then((json) => {
        if (cancelled) return;
        try {
          if (json) setTables(JSON.parse(json));
        } catch {
          /* ignore malformed JSON */
        }
        setHydrated(true);
      });
    } else {
      setHydrated(true);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark dirty when tables change after initial load
  useEffect(() => {
    if (!hydrated) return;
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      return;
    }
    setIsDirty(true);
  }, [tables, hydrated]);

  // Block tab close when unsaved
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const assignedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const table of tables)
      for (const seat of table.assignments)
        if (seat) counts[seat.guestId] = (counts[seat.guestId] || 0) + 1;
    return counts;
  }, [tables]);

  useEffect(() => {
    if (!selectedGuest) return;
    const total = parseInt(selectedGuest.guestCount) || 1;
    if ((assignedCounts[selectedGuest.id] || 0) >= total)
      setSelectedGuest(null);
  }, [assignedCounts, selectedGuest]);

  const totalAssigned = useMemo(
    () => Object.values(assignedCounts).reduce((s, n) => s + n, 0),
    [assignedCounts],
  );

  const addTable = async (type: TableType, label?: string, seats?: number) => {
    if (
      (type === "rectangular" || type === "circle") &&
      tables.filter((t) => t.type === type).length >= 2
    ) {
      const paid = await recheckPaid();
      if (!paid) {
        setShowUpgradeModal(true);
        return;
      }
    }
    const defaultSeats =
      type === "circle" ? 12 : type === "single-sided" ? 6 : 8;
    const idx = tables.length;
    setTables((prev) => [
      ...prev,
      createTable(type, label ?? `Sto ${idx + 1}`, seats ?? defaultSeats, idx),
    ]);
  };

  const addDecoration = (
    label: string,
    decorationType: TableData["decorationType"],
  ) => {
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
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...changes } : t)),
    );

  const deleteTable = (id: string) =>
    setTables((prev) => prev.filter((t) => t.id !== id));

  const handleSeatClick = async (tableId: string, seatIndex: number) => {
    const targetTable = tables.find((t) => t.id === tableId);
    const isRemoving = !!targetTable?.assignments[seatIndex];
    if (
      !isRemoving &&
      selectedGuest &&
      !paidForRaspored &&
      totalAssigned >= 1
    ) {
      const paid = await recheckPaid();
      if (!paid) {
        setShowUpgradeModal(true);
        return;
      }
    }
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const seat = t.assignments[seatIndex];
        if (seat) {
          const a = [...t.assignments];
          a[seatIndex] = null;
          return { ...t, assignments: a };
        }
        if (!selectedGuest) return t;
        const total = parseInt(selectedGuest.guestCount) || 1;
        if ((assignedCounts[selectedGuest.id] || 0) >= total) return t;
        const a = [...t.assignments];
        const assignment: SeatAssignment = {
          guestId: selectedGuest.id,
          guestName: selectedGuest.name,
        };
        a[seatIndex] = assignment;
        return { ...t, assignments: a };
      }),
    );
  };

  const handleStartOver = () => {
    setTables([]);
    setSelectedGuest(null);
    setIsDirty(false);
    startSave(async () => {
      await saveRaspored(slug, JSON.stringify([]));
    });
  };

  const handleSave = () => {
    setSaveError("");
    startSave(async () => {
      const result = await saveRaspored(slug, JSON.stringify(tables));
      if (result.success) {
        setIsDirty(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        showToast(result.error ?? "Greška pri čuvanju");
      }
    });
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        backgroundColor: "var(--theme-background)",
        // Override couple theme with HaloUspomene brand colors
        "--theme-primary": "#d4af37",
        "--theme-primary-light": "rgba(212,175,55,0.15)",
        "--theme-primary-muted": "rgba(212,175,55,0.08)",
        "--theme-background": "#FAFAF5",
        "--theme-surface": "#F5F4DC",
        "--theme-surface-alt": "#F0EFCF",
        "--theme-text": "#232323",
        "--theme-text-muted": "rgba(35,35,35,0.5)",
        "--theme-text-light": "rgba(35,35,35,0.4)",
        "--theme-border": "rgba(35,35,35,0.12)",
        "--theme-border-light": "rgba(35,35,35,0.06)",
      } as React.CSSProperties}
    >
      {isMobileWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-7 flex flex-col items-center gap-4 text-center shadow-2xl"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1px solid var(--theme-border-light)",
            }}
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
              Raspored sedenja je interaktivna alatka koja najboije funkcioniše
              na laptopu ili desktop računaru. Preporučujemo da je otvorite sa
              većeg uređaja.
            </p>
            <a
              href="/moje-vencanje?tab=guests"
              className="mt-1 w-full py-2.5 rounded-xl font-raleway text-sm font-medium transition-opacity hover:opacity-80 text-center"
              style={{
                backgroundColor: "var(--theme-primary)",
                color: "white",
              }}
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
      {!isPWAMobile && (
        <GuestSidebar
          attending={attending}
          selectedGuest={selectedGuest}
          onSelectGuest={setSelectedGuest}
          assignedCounts={assignedCounts}
          onStartOver={handleStartOver}
        />
      )}

      <div className="flex flex-col flex-1 min-w-0">
        {!isPWAMobile && (
          <Toolbar
            slug={slug}
            coupleNames={coupleNames}
            tables={tables}
            isDirty={isDirty}
            isSaving={isSaving}
            saveSuccess={saveSuccess}
            saveError={saveError}
            paidForRaspored={paidForRaspored}
            onSave={handleSave}
            onDownloadPDF={() =>
              generateAndDownloadPDF(tables, attending, coupleNames, slug)
            }
          />
        )}

        <div className="flex-1 relative overflow-hidden">
          {!isPWAMobile && (
            <AddTablePanel
              onAddTable={addTable}
              onAddDecoration={addDecoration}
              totalSeats={tables.reduce(
                (s, t) => s + (t.type !== "decoration" ? t.seats : 0),
                0,
              )}
              occupiedSeats={tables.reduce(
                (s, t) => s + t.assignments.filter(Boolean).length,
                0,
              )}
            />
          )}

          {/* Scrollable canvas */}
          <div
            ref={canvasRef}
            className="absolute inset-0 overflow-auto"
            style={{
              backgroundImage:
                "radial-gradient(circle, color-mix(in srgb, var(--theme-border) 50%, transparent) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              touchAction: isPWAMobile ? "pan-x pan-y" : undefined,
            }}
            onTouchStart={isPWAMobile ? handleTouchStart : undefined}
            onTouchMove={isPWAMobile ? handleTouchMove : undefined}
            onTouchEnd={isPWAMobile ? handleTouchEnd : undefined}
          >
            {isPWAMobile ? (
              <div
                style={{
                  width: 1600 * zoom,
                  height: 1100 * zoom,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "0 0",
                    width: 1600,
                    height: 1100,
                    position: "absolute",
                  }}
                >
                  {hydrated &&
                    tables.map((table) => (
                      <TableNode
                        key={table.id}
                        table={table}
                        selectedGuest={null}
                        onSeatClick={() => {}}
                        onUpdate={() => {}}
                        onDelete={() => {}}
                        readOnly
                        onTap={setSheetTable}
                      />
                    ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  minWidth: 1600,
                  minHeight: 1100,
                  position: "relative",
                }}
              >
                {hydrated &&
                  tables.map((table) => (
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
                    <p
                      className="font-raleway text-sm"
                      style={{ color: "var(--theme-text-light)" }}
                    >
                      Dodaj stolove koristeći dugmad levo gore
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PWA Mobile Overlays ── */}
      {isPWAMobile && (
        <>
          {/* Hamburger menu button */}
          <button
            onClick={() => setShowPWAMenu((v) => !v)}
            className="fixed right-3 z-[55] w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{
              top: "calc(0.75rem + env(safe-area-inset-top, 0px))",
              backgroundColor: "var(--theme-surface)",
              border: "1px solid var(--theme-border-light)",
            }}
          >
            <Menu size={18} style={{ color: "var(--theme-text)" }} />
          </button>

          {/* Zoom controls */}
          <div
            className="fixed bottom-[6rem] right-3 z-[55] flex flex-col items-center gap-1 rounded-xl p-1 shadow-lg"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1px solid var(--theme-border-light)",
            }}
          >
            <button
              onClick={() => setZoom((z) => Math.min(1, +(z + 0.1).toFixed(1)))}
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            >
              <ZoomIn size={18} style={{ color: "var(--theme-text)" }} />
            </button>
            <span
              className="text-[10px] font-raleway font-medium"
              style={{ color: "var(--theme-text-light)" }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() =>
                setZoom((z) => Math.max(0.15, +(z - 0.1).toFixed(1)))
              }
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            >
              <ZoomOut size={18} style={{ color: "var(--theme-text)" }} />
            </button>
          </div>

          {/* PDF loading indicator */}
          {pdfLoading && (
            <div
              className="fixed left-1/2 -translate-x-1/2 z-[55] flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
              style={{
                top: "calc(3.5rem + env(safe-area-inset-top, 0px))",
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <span
                className="loading loading-spinner loading-xs"
                style={{ color: "var(--theme-primary)" }}
              />
              <span
                className="text-xs font-raleway font-medium"
                style={{ color: "var(--theme-text)" }}
              >
                Pripremam PDF...
              </span>
            </div>
          )}

          {/* Hamburger dropdown */}
          {showPWAMenu && (
            <div
              className="fixed inset-0 z-[56]"
              onClick={() => setShowPWAMenu(false)}
            >
              <div
                className="absolute right-3 rounded-xl shadow-xl overflow-hidden"
                style={{
                  top: "calc(3.5rem + env(safe-area-inset-top, 0px))",
                  backgroundColor: "var(--theme-surface)",
                  border: "1px solid var(--theme-border-light)",
                  minWidth: 200,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={async () => {
                    setShowPWAMenu(false);
                    setPdfLoading(true);
                    try {
                      await generateAndDownloadPDF(
                        tables,
                        attending,
                        coupleNames,
                        slug,
                      );
                    } finally {
                      setPdfLoading(false);
                    }
                  }}
                  disabled={pdfLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium hover:bg-black/5 disabled:opacity-50"
                  style={{ color: "var(--theme-text)" }}
                >
                  {pdfLoading ? (
                    <span
                      className="loading loading-spinner loading-xs"
                      style={{ color: "var(--theme-primary)" }}
                    />
                  ) : (
                    <FileDown
                      size={16}
                      style={{ color: "var(--theme-primary)" }}
                    />
                  )}
                  {pdfLoading ? "Pripremam PDF..." : "Preuzmi PDF raspored"}
                </button>
                <div
                  className="h-px"
                  style={{ backgroundColor: "var(--theme-border-light)" }}
                />
                <button
                  onClick={async () => {
                    const QRCode = (await import("qrcode")).default;
                    const url = `https://halouspomene.rs/pozivnica/${slug}/gde-sedim/`;
                    const dataUrl = await QRCode.toDataURL(url, {
                      width: 1200,
                      margin: 2,
                      color: { dark: "#232323", light: "#ffffff" },
                    });
                    const a = document.createElement("a");
                    a.href = dataUrl;
                    a.download = `gde-sedim-qr-${slug}.png`;
                    a.click();
                    setShowPWAMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium hover:bg-black/5"
                  style={{ color: "var(--theme-text)" }}
                >
                  <QrCode size={16} style={{ color: "var(--theme-primary)" }} />
                  Preuzmi QR kod
                </button>
                <div
                  className="h-px"
                  style={{ backgroundColor: "var(--theme-border-light)" }}
                />
                <button
                  onClick={() => {
                    setShowGuestPanel(true);
                    setShowPWAMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium hover:bg-black/5"
                  style={{ color: "var(--theme-text)" }}
                >
                  <Users size={16} style={{ color: "var(--theme-primary)" }} />
                  Lista gostiju
                </button>
              </div>
            </div>
          )}

          {/* Guest panel (slide-in) */}
          {showGuestPanel && (
            <div
              className="fixed inset-0 z-[57]"
              onClick={() => setShowGuestPanel(false)}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-72 shadow-2xl overflow-y-auto"
                style={{ backgroundColor: "var(--theme-background)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowGuestPanel(false)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  <X size={16} />
                </button>
                <GuestSidebar
                  attending={attending}
                  selectedGuest={null}
                  onSelectGuest={(g) => {
                    setSheetGuest(g);
                    setShowGuestPanel(false);
                  }}
                  assignedCounts={assignedCounts}
                  onStartOver={handleStartOver}
                />
              </div>
            </div>
          )}

          {/* Table bottom sheet */}
          {sheetTable && sheetTable.type !== "decoration" && (
            <div
              className="fixed inset-0 z-[58] flex items-end justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
              onClick={() => setSheetTable(null)}
            >
              <div
                className="w-full max-w-md rounded-t-2xl p-5 shadow-2xl"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  paddingBottom:
                    "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="w-10 h-1 rounded-full mx-auto mb-4"
                  style={{ backgroundColor: "var(--theme-border)" }}
                />
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="font-raleway font-semibold text-base"
                    style={{ color: "var(--theme-text)" }}
                  >
                    {sheetTable.label}
                  </h3>
                  <span
                    className="text-xs font-raleway"
                    style={{ color: "var(--theme-text-light)" }}
                  >
                    {sheetTable.assignments.filter(Boolean).length} /{" "}
                    {sheetTable.seats} mesta
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sheetTable.assignments.map((seat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-1.5"
                      style={{
                        borderBottom: "1px solid var(--theme-border-light)",
                      }}
                    >
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-raleway font-bold shrink-0"
                        style={{
                          backgroundColor: seat
                            ? "var(--theme-primary)"
                            : "var(--theme-background)",
                          color: seat ? "white" : "var(--theme-text-light)",
                          border: seat
                            ? "none"
                            : "1px dashed var(--theme-border)",
                        }}
                      >
                        {seat
                          ? seat.guestName
                              .trim()
                              .split(/\s+/)
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : i + 1}
                      </span>
                      <span
                        className="text-sm font-raleway"
                        style={{
                          color: seat
                            ? "var(--theme-text)"
                            : "var(--theme-text-light)",
                        }}
                      >
                        {seat ? seat.guestName : "Prazno mesto"}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setSheetTable(null)}
                  className="w-full mt-4 py-2.5 rounded-lg text-sm font-raleway font-medium"
                  style={{
                    backgroundColor: "var(--theme-background)",
                    color: "var(--theme-text-light)",
                  }}
                >
                  Zatvori
                </button>
              </div>
            </div>
          )}
          {/* Guest info bottom sheet */}
          {sheetGuest &&
            (() => {
              const guestTables = tables
                .map((t) => ({
                  label: t.label,
                  seats: t.assignments
                    .map((a, i) =>
                      a?.guestId === sheetGuest.id ? i + 1 : null,
                    )
                    .filter((s): s is number => s !== null),
                }))
                .filter((t) => t.seats.length > 0);
              const total = parseInt(sheetGuest.guestCount) || 1;
              const assigned = assignedCounts[sheetGuest.id] || 0;

              return (
                <div
                  className="fixed inset-0 z-[58] flex items-end justify-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                  onClick={() => setSheetGuest(null)}
                >
                  <div
                    className="w-full max-w-md rounded-t-2xl p-5 shadow-2xl"
                    style={{
                      backgroundColor: "var(--theme-surface)",
                      paddingBottom:
                        "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="w-10 h-1 rounded-full mx-auto mb-4"
                      style={{ backgroundColor: "var(--theme-border)" }}
                    />
                    <h3
                      className="font-raleway font-semibold text-base mb-1"
                      style={{ color: "var(--theme-text)" }}
                    >
                      {sheetGuest.name}
                    </h3>
                    <p
                      className="text-xs font-raleway mb-4"
                      style={{ color: "var(--theme-text-light)" }}
                    >
                      {assigned} / {total} mesta raspoređeno
                    </p>
                    {guestTables.length > 0 ? (
                      <div className="space-y-2">
                        {guestTables.map((t) => (
                          <div
                            key={t.label}
                            className="flex items-center justify-between py-2 px-3 rounded-lg"
                            style={{
                              backgroundColor: "var(--theme-background)",
                            }}
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
                    ) : (
                      <p
                        className="text-sm font-raleway text-center py-4"
                        style={{ color: "var(--theme-text-light)" }}
                      >
                        Nije raspoređen/a
                      </p>
                    )}
                    {assigned < total && (
                      <div
                        className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs font-raleway"
                        style={{
                          backgroundColor:
                            "color-mix(in srgb, var(--theme-primary) 8%, var(--theme-background))",
                          color: "var(--theme-text-muted)",
                        }}
                      >
                        <span className="shrink-0 mt-px">💻</span>
                        <span>
                          Raspored sedenja možete menjati samo na računaru.
                          Otvorite ovu stranicu na laptopu ili desktop računaru.
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => setSheetGuest(null)}
                      className="w-full mt-4 py-2.5 rounded-lg text-sm font-raleway font-medium"
                      style={{
                        backgroundColor: "var(--theme-background)",
                        color: "var(--theme-text-light)",
                      }}
                    >
                      Zatvori
                    </button>
                  </div>
                </div>
              );
            })()}
        </>
      )}

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-raleway font-medium animate-[fade-in-up_0.3s_ease-out]"
          style={{
            backgroundColor: "var(--theme-text)",
            color: "var(--theme-background)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
