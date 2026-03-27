"use client";

import {
  useState,
  useEffect,
  useMemo,
  useTransition,
  useRef,
  useCallback,
} from "react";
import { toast } from "sonner";
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
  ArrowLeft,
  Save,
  MoreVertical,
  Plus,
  RotateCw,
  Search,
} from "lucide-react";
import GuestSidebar from "./GuestSidebar";
import TableNode from "./TableNode";
import Toolbar from "./Toolbar";
import AddTablePanel from "./AddTablePanel";
import UpgradeModal from "./UpgradeModal";
import MobileTableCard from "./MobileTableCard";
import MobileSeatSheet from "./MobileSeatSheet";
import MobileLayoutScreen from "./MobileLayoutScreen";
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

  // Mobile mode
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSeatTarget, setMobileSeatTarget] = useState<{
    tableId: string;
    seatIndex: number;
    tableLabel: string;
    assignment: import("./types").SeatAssignment | null;
  } | null>(null);
  const [showMobileAddTable, setShowMobileAddTable] = useState(false);
  const [showMobileGuests, setShowMobileGuests] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLayoutScreen, setShowLayoutScreen] = useState(false);
  const [mobileGuestSearch, setMobileGuestSearch] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  // Desktop PWA mode (legacy, kept for tablet/desktop PWA)
  const [isPWADesktop, setIsPWADesktop] = useState(false);
  const [zoom, setZoom] = useState(0.3);
  const [sheetTable, setSheetTable] = useState<TableData | null>(null);
  const [showGuestPanel, setShowGuestPanel] = useState(false);
  const [showPWAMenu, setShowPWAMenu] = useState(false);
  const [sheetGuest, setSheetGuest] = useState<RSVPEntry | null>(null);
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
    toast(msg);
  };

  // Always check paid status from DB on gated actions
  const recheckPaid = async (): Promise<boolean> => {
    const fresh = await checkPaidStatus(slug);
    setPaidForRaspored(fresh);
    return fresh;
  };

  // Detect mobile vs desktop
  useEffect(() => {
    const mobile = window.innerWidth < 768;
    if (mobile) {
      setIsMobile(true);
    } else {
      // Check if PWA on larger screen (tablet/desktop)
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      if (standalone && window.innerWidth < 1024) {
        setIsPWADesktop(true);
        setZoom(Math.min(window.innerWidth / 1700, 0.35));
      }
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

  const handleSave = (tablesToSave?: TableData[]) => {
    setSaveError("");
    const data = tablesToSave ?? tables;
    startSave(async () => {
      const result = await saveRaspored(slug, JSON.stringify(data));
      if (result.success) {
        if (tablesToSave) setTables(tablesToSave);
        setIsDirty(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        showToast(result.error ?? "Greška pri čuvanju");
      }
    });
  };

  // Mobile: tap seat handler — opens the seat sheet
  const handleMobileSeatTap = (tableId: string, seatIndex: number) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    setMobileSeatTarget({
      tableId,
      seatIndex,
      tableLabel: table.label,
      assignment: table.assignments[seatIndex],
    });
  };

  // Mobile: assign guest to seat from the sheet
  const handleMobileAssign = async (
    tableId: string,
    seatIndex: number,
    guest: RSVPEntry,
  ) => {
    // Check paid status for 2nd+ assignment
    if (!paidForRaspored && totalAssigned >= 1) {
      const paid = await recheckPaid();
      if (!paid) {
        setShowUpgradeModal(true);
        return;
      }
    }
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const a = [...t.assignments];
        a[seatIndex] = { guestId: guest.id, guestName: guest.name };
        return { ...t, assignments: a };
      }),
    );
  };

  // Mobile: remove assignment
  const handleMobileRemove = (tableId: string, seatIndex: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const a = [...t.assignments];
        a[seatIndex] = null;
        return { ...t, assignments: a };
      }),
    );
  };

  // Mobile: save via layout screen
  const handleMobileSave = () => {
    if (tables.filter((t) => t.type !== "decoration").length === 0) {
      // No tables to arrange — save directly
      handleSave();
      return;
    }
    setShowLayoutScreen(true);
  };

  const handleLayoutSave = (updatedTables: TableData[]) => {
    setShowLayoutScreen(false);
    handleSave(updatedTables);
  };

  const totalSeats = tables.reduce(
    (s, t) => s + (t.type !== "decoration" ? t.seats : 0),
    0,
  );
  const occupiedSeats = tables.reduce(
    (s, t) => s + t.assignments.filter(Boolean).length,
    0,
  );
  const unassignedGuests = attending.filter(
    (g) => (assignedCounts[g.id] || 0) < (parseInt(g.guestCount) || 1),
  ).length;

  const themeVars = {
    backgroundColor: "var(--theme-background)",
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
  } as React.CSSProperties;

  // ══════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ══════════════════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen" style={themeVars}>
        {/* ── Sticky top bar ── */}
        <div
          className="shrink-0 flex items-center gap-2 px-3"
          style={{
            paddingTop: "calc(0.5rem + env(safe-area-inset-top, 0px))",
            paddingBottom: "0.5rem",
            backgroundColor: "var(--theme-surface)",
            borderBottom: "1px solid var(--theme-border-light)",
          }}
        >
          <a
            href="/moje-vencanje"
            className="w-8 h-8 flex items-center justify-center rounded-full shrink-0"
            style={{ color: "var(--theme-text)" }}
          >
            <ArrowLeft size={18} />
          </a>
          <span
            className="flex-1 text-sm font-raleway font-semibold truncate"
            style={{ color: "var(--theme-text)" }}
          >
            {coupleNames}
          </span>

          {/* Save */}
          <button
            onClick={handleMobileSave}
            disabled={!isDirty || isSaving}
            className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-raleway font-semibold text-white transition-opacity disabled:opacity-40 active:opacity-80"
            style={{ backgroundColor: saveSuccess ? "#16a34a" : "var(--theme-primary)" }}
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-xs" style={{ color: "white" }} />
            ) : (
              <Save size={14} />
            )}
            {saveSuccess ? "Sačuvano" : "Sačuvaj"}
          </button>

          {/* Overflow menu */}
          <div className="relative">
            <button
              onClick={() => setShowMobileMenu((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{ color: "var(--theme-text)" }}
            >
              <MoreVertical size={18} />
            </button>
            {showMobileMenu && (
              <div
                className="fixed inset-0 z-[50]"
                onClick={() => setShowMobileMenu(false)}
              >
                <div
                  className="absolute right-3 rounded-xl shadow-xl overflow-hidden"
                  style={{
                    top: "calc(3rem + env(safe-area-inset-top, 0px))",
                    backgroundColor: "var(--theme-surface)",
                    border: "1px solid var(--theme-border-light)",
                    minWidth: 200,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={async () => {
                      setShowMobileMenu(false);
                      if (isDirty) { showToast("Sačuvaj pre preuzimanja"); return; }
                      setPdfLoading(true);
                      try {
                        await generateAndDownloadPDF(tables, attending, coupleNames, slug);
                      } finally {
                        setPdfLoading(false);
                      }
                    }}
                    disabled={pdfLoading || isDirty}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium active:bg-black/5 disabled:opacity-40"
                    style={{ color: "var(--theme-text)" }}
                  >
                    <FileDown size={16} style={{ color: "var(--theme-primary)" }} />
                    {pdfLoading ? "Pripremam PDF..." : "Preuzmi PDF"}
                  </button>
                  <div className="h-px" style={{ backgroundColor: "var(--theme-border-light)" }} />
                  <button
                    onClick={async () => {
                      if (isDirty) { showToast("Sačuvaj pre preuzimanja"); setShowMobileMenu(false); return; }
                      const QRCode = (await import("qrcode")).default;
                      const url = `https://halouspomene.rs/pozivnica/${slug}/gde-sedim/`;
                      const dataUrl = await QRCode.toDataURL(url, { width: 1200, margin: 2, color: { dark: "#232323", light: "#ffffff" } });
                      const a = document.createElement("a");
                      a.href = dataUrl;
                      a.download = `gde-sedim-qr-${slug}.png`;
                      a.click();
                      setShowMobileMenu(false);
                    }}
                    disabled={isDirty}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium active:bg-black/5 disabled:opacity-40"
                    style={{ color: "var(--theme-text)" }}
                  >
                    <QrCode size={16} style={{ color: "var(--theme-primary)" }} />
                    Preuzmi QR kod
                  </button>
                  <div className="h-px" style={{ backgroundColor: "var(--theme-border-light)" }} />
                  <button
                    onClick={() => {
                      handleStartOver();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium active:bg-black/5"
                    style={{ color: "#ef4444" }}
                  >
                    <X size={16} />
                    Počni ispočetka
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Scrollable table cards ── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{
            paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))",
            backgroundImage:
              "radial-gradient(circle, color-mix(in srgb, var(--theme-border) 35%, transparent) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          {hydrated && tables.filter((t) => t.type !== "decoration").length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p
                className="font-raleway text-sm text-center"
                style={{ color: "var(--theme-text-light)" }}
              >
                Dodaj stolove koristeći dugme ispod
              </p>
            </div>
          )}

          <div className="space-y-4 max-w-md mx-auto">
            {hydrated &&
              tables
                .filter((t) => t.type !== "decoration")
                .map((table) => (
                  <MobileTableCard
                    key={table.id}
                    table={table}
                    onSeatTap={handleMobileSeatTap}
                    onUpdate={updateTable}
                    onDelete={deleteTable}
                  />
                ))}
          </div>
        </div>

        {/* ── Fixed bottom bar ── */}
        <div
          className="shrink-0 flex items-center gap-3 px-4"
          style={{
            paddingTop: "0.625rem",
            paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom, 0px))",
            backgroundColor: "var(--theme-surface)",
            borderTop: "1px solid var(--theme-border-light)",
          }}
        >
          {/* Add table */}
          <button
            onClick={() => setShowMobileAddTable(true)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-raleway font-semibold text-white active:opacity-80"
            style={{ backgroundColor: "var(--theme-primary)" }}
          >
            <Plus size={16} />
            Dodaj sto
          </button>

          {/* Seat counter */}
          <span
            className="flex-1 text-center text-[11px] font-raleway font-medium"
            style={{ color: "var(--theme-text-light)" }}
          >
            {occupiedSeats}/{totalSeats} mesta
          </span>

          {/* Guest list */}
          <button
            onClick={() => setShowMobileGuests(true)}
            className="relative flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-raleway font-semibold active:opacity-80"
            style={{
              backgroundColor: "var(--theme-background)",
              border: "1px solid var(--theme-border)",
              color: "var(--theme-text)",
            }}
          >
            <Users size={15} />
            Gosti
            {unassignedGuests > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ backgroundColor: "#ef4444" }}
              >
                {unassignedGuests}
              </span>
            )}
          </button>
        </div>

        {/* ── Add Table Type Picker Sheet ── */}
        {showMobileAddTable && (
          <div
            className="fixed inset-0 z-[58] flex items-end justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setShowMobileAddTable(false)}
          >
            <div
              className="w-full max-w-md rounded-t-2xl shadow-2xl"
              style={{
                backgroundColor: "var(--theme-surface)",
                paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "var(--theme-border)" }} />
              </div>
              <h3 className="px-5 pb-3 font-raleway font-semibold text-sm" style={{ color: "var(--theme-text)" }}>
                Dodaj sto
              </h3>
              <div className="px-5 space-y-2 pb-2">
                {[
                  { type: "circle" as const, label: "Okrugli sto", desc: "12 mesta", seats: 12 },
                  { type: "rectangular" as const, label: "Pravougaoni sto", desc: "8 mesta", seats: 8 },
                  { type: "single-sided" as const, label: "Mladenački sto", desc: "6 mesta", seats: 6 },
                ].map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => {
                      addTable(opt.type, undefined, opt.seats);
                      setShowMobileAddTable(false);
                    }}
                    className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-left active:bg-black/5"
                    style={{
                      backgroundColor: "var(--theme-background)",
                      border: "1px solid var(--theme-border-light)",
                    }}
                  >
                    <div>
                      <p className="text-sm font-raleway font-medium" style={{ color: "var(--theme-text)" }}>
                        {opt.label}
                      </p>
                      <p className="text-[11px] font-raleway mt-0.5" style={{ color: "var(--theme-text-light)" }}>
                        {opt.desc}
                      </p>
                    </div>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--theme-primary) 10%, var(--theme-background))",
                      }}
                    >
                      {opt.type === "circle" ? (
                        <div className="w-6 h-6 rounded-full" style={{ border: "2px solid var(--theme-primary)" }} />
                      ) : opt.type === "single-sided" ? (
                        <div className="w-7 h-3 rounded-sm" style={{ border: "2px solid var(--theme-primary)", borderBottom: "none" }} />
                      ) : (
                        <div className="w-7 h-4 rounded-sm" style={{ border: "2px solid var(--theme-primary)" }} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile Guest List Sheet ── */}
        {showMobileGuests && (
          <div
            className="fixed inset-0 z-[58] flex items-end justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setShowMobileGuests(false)}
          >
            <div
              className="w-full max-w-md rounded-t-2xl shadow-2xl flex flex-col"
              style={{
                backgroundColor: "var(--theme-surface)",
                maxHeight: "80vh",
                paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-2 shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "var(--theme-border)" }} />
              </div>
              <div className="flex items-center justify-between px-5 pb-3 shrink-0">
                <h3 className="font-raleway font-semibold text-sm" style={{ color: "var(--theme-text)" }}>
                  Lista gostiju
                </h3>
                <button onClick={() => setShowMobileGuests(false)} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ color: "var(--theme-text-light)" }}>
                  <X size={18} />
                </button>
              </div>
              {/* Search */}
              <div className="px-5 pb-3 shrink-0">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--theme-text-light)" }} />
                  <input
                    type="text"
                    value={mobileGuestSearch}
                    onChange={(e) => setMobileGuestSearch(e.target.value)}
                    placeholder="Pretraži goste..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm font-raleway rounded-lg outline-none"
                    style={{ backgroundColor: "var(--theme-background)", border: "1px solid var(--theme-border-light)", color: "var(--theme-text)" }}
                  />
                </div>
              </div>
              {/* List */}
              <div className="flex-1 overflow-y-auto px-5">
                {attending
                  .filter((g) => !mobileGuestSearch || g.name.toLowerCase().includes(mobileGuestSearch.toLowerCase()))
                  .map((guest) => {
                    const total = parseInt(guest.guestCount) || 1;
                    const assigned = assignedCounts[guest.id] || 0;
                    const isFull = assigned >= total;
                    return (
                      <div
                        key={guest.id}
                        className="flex items-center gap-3 py-2.5"
                        style={{ borderBottom: "1px solid var(--theme-border-light)" }}
                      >
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-raleway font-bold shrink-0"
                          style={{
                            backgroundColor: isFull ? "var(--theme-primary)" : "color-mix(in srgb, var(--theme-primary) 15%, var(--theme-background))",
                            color: isFull ? "white" : "var(--theme-primary)",
                          }}
                        >
                          {guest.name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-raleway font-medium truncate" style={{ color: "var(--theme-text)" }}>
                            {guest.name}
                          </p>
                          {guest.category && (
                            <span className="text-[10px] font-raleway" style={{ color: "var(--theme-text-light)" }}>
                              {guest.category}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-raleway shrink-0" style={{ color: isFull ? "var(--theme-primary)" : "var(--theme-text-light)" }}>
                          {assigned}/{total}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ── Seat assignment sheet ── */}
        {mobileSeatTarget && (
          <MobileSeatSheet
            target={mobileSeatTarget}
            attending={attending}
            tables={tables}
            assignedCounts={assignedCounts}
            onAssign={handleMobileAssign}
            onRemove={handleMobileRemove}
            onClose={() => setMobileSeatTarget(null)}
          />
        )}

        {/* ── Layout screen (pre-save) ── */}
        {showLayoutScreen && (
          <MobileLayoutScreen
            tables={tables}
            onSave={handleLayoutSave}
            onCancel={() => setShowLayoutScreen(false)}
            isSaving={isSaving}
          />
        )}

        {/* ── Upgrade modal ── */}
        {showUpgradeModal && (
          <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT (unchanged)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen overflow-hidden" style={themeVars}>
      {!isPWADesktop && (
        <GuestSidebar
          attending={attending}
          selectedGuest={selectedGuest}
          onSelectGuest={setSelectedGuest}
          assignedCounts={assignedCounts}
          onStartOver={handleStartOver}
        />
      )}

      <div className="flex flex-col flex-1 min-w-0">
        {!isPWADesktop && (
          <Toolbar
            slug={slug}
            coupleNames={coupleNames}
            tables={tables}
            isDirty={isDirty}
            isSaving={isSaving}
            saveSuccess={saveSuccess}
            saveError={saveError}
            paidForRaspored={paidForRaspored}
            onSave={() => handleSave()}
            onDownloadPDF={() =>
              generateAndDownloadPDF(tables, attending, coupleNames, slug)
            }
          />
        )}

        <div className="flex-1 relative overflow-hidden">
          {!isPWADesktop && (
            <AddTablePanel
              onAddTable={addTable}
              onAddDecoration={addDecoration}
              totalSeats={totalSeats}
              occupiedSeats={occupiedSeats}
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
              touchAction: isPWADesktop ? "pan-x pan-y" : undefined,
            }}
            onTouchStart={isPWADesktop ? handleTouchStart : undefined}
            onTouchMove={isPWADesktop ? handleTouchMove : undefined}
            onTouchEnd={isPWADesktop ? handleTouchEnd : undefined}
          >
            {isPWADesktop ? (
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

      {/* ── PWA Desktop Overlays ── */}
      {isPWADesktop && (
        <>
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
              onClick={() => setZoom((z) => Math.max(0.15, +(z - 0.1).toFixed(1)))}
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            >
              <ZoomOut size={18} style={{ color: "var(--theme-text)" }} />
            </button>
          </div>

          {pdfLoading && (
            <div
              className="fixed left-1/2 -translate-x-1/2 z-[55] flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
              style={{
                top: "calc(3.5rem + env(safe-area-inset-top, 0px))",
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <span className="loading loading-spinner loading-xs" style={{ color: "var(--theme-primary)" }} />
              <span className="text-xs font-raleway font-medium" style={{ color: "var(--theme-text)" }}>
                Pripremam PDF...
              </span>
            </div>
          )}

          {showPWAMenu && (
            <div className="fixed inset-0 z-[56]" onClick={() => setShowPWAMenu(false)}>
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
                      await generateAndDownloadPDF(tables, attending, coupleNames, slug);
                    } finally {
                      setPdfLoading(false);
                    }
                  }}
                  disabled={pdfLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium hover:bg-black/5 disabled:opacity-50"
                  style={{ color: "var(--theme-text)" }}
                >
                  <FileDown size={16} style={{ color: "var(--theme-primary)" }} />
                  {pdfLoading ? "Pripremam PDF..." : "Preuzmi PDF raspored"}
                </button>
                <div className="h-px" style={{ backgroundColor: "var(--theme-border-light)" }} />
                <button
                  onClick={async () => {
                    const QRCode = (await import("qrcode")).default;
                    const url = `https://halouspomene.rs/pozivnica/${slug}/gde-sedim/`;
                    const dataUrl = await QRCode.toDataURL(url, { width: 1200, margin: 2, color: { dark: "#232323", light: "#ffffff" } });
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
                <div className="h-px" style={{ backgroundColor: "var(--theme-border-light)" }} />
                <button
                  onClick={() => { setShowGuestPanel(true); setShowPWAMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium hover:bg-black/5"
                  style={{ color: "var(--theme-text)" }}
                >
                  <Users size={16} style={{ color: "var(--theme-primary)" }} />
                  Lista gostiju
                </button>
              </div>
            </div>
          )}

          {showGuestPanel && (
            <div className="fixed inset-0 z-[57]" onClick={() => setShowGuestPanel(false)}>
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
                  onSelectGuest={(g) => { setSheetGuest(g); setShowGuestPanel(false); }}
                  assignedCounts={assignedCounts}
                  onStartOver={handleStartOver}
                />
              </div>
            </div>
          )}

          {sheetTable && sheetTable.type !== "decoration" && (
            <div
              className="fixed inset-0 z-[58] flex items-end justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
              onClick={() => setSheetTable(null)}
            >
              <div
                className="w-full max-w-md rounded-t-2xl p-5 shadow-2xl"
                style={{ backgroundColor: "var(--theme-surface)", paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: "var(--theme-border)" }} />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-raleway font-semibold text-base" style={{ color: "var(--theme-text)" }}>{sheetTable.label}</h3>
                  <span className="text-xs font-raleway" style={{ color: "var(--theme-text-light)" }}>
                    {sheetTable.assignments.filter(Boolean).length} / {sheetTable.seats} mesta
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sheetTable.assignments.map((seat, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5" style={{ borderBottom: "1px solid var(--theme-border-light)" }}>
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-raleway font-bold shrink-0"
                        style={{
                          backgroundColor: seat ? "var(--theme-primary)" : "var(--theme-background)",
                          color: seat ? "white" : "var(--theme-text-light)",
                          border: seat ? "none" : "1px dashed var(--theme-border)",
                        }}
                      >
                        {seat ? seat.guestName.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() : i + 1}
                      </span>
                      <span className="text-sm font-raleway" style={{ color: seat ? "var(--theme-text)" : "var(--theme-text-light)" }}>
                        {seat ? seat.guestName : "Prazno mesto"}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setSheetTable(null)}
                  className="w-full mt-4 py-2.5 rounded-lg text-sm font-raleway font-medium"
                  style={{ backgroundColor: "var(--theme-background)", color: "var(--theme-text-light)" }}
                >
                  Zatvori
                </button>
              </div>
            </div>
          )}

          {sheetGuest && (() => {
            const guestTables = tables.map((t) => ({ label: t.label, seats: t.assignments.map((a, i) => a?.guestId === sheetGuest.id ? i + 1 : null).filter((s): s is number => s !== null) })).filter((t) => t.seats.length > 0);
            const total = parseInt(sheetGuest.guestCount) || 1;
            const assigned = assignedCounts[sheetGuest.id] || 0;
            return (
              <div className="fixed inset-0 z-[58] flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={() => setSheetGuest(null)}>
                <div className="w-full max-w-md rounded-t-2xl p-5 shadow-2xl" style={{ backgroundColor: "var(--theme-surface)", paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }} onClick={(e) => e.stopPropagation()}>
                  <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: "var(--theme-border)" }} />
                  <h3 className="font-raleway font-semibold text-base mb-1" style={{ color: "var(--theme-text)" }}>{sheetGuest.name}</h3>
                  <p className="text-xs font-raleway mb-4" style={{ color: "var(--theme-text-light)" }}>{assigned} / {total} mesta raspoređeno</p>
                  {guestTables.length > 0 ? (
                    <div className="space-y-2">{guestTables.map((t) => (
                      <div key={t.label} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ backgroundColor: "var(--theme-background)" }}>
                        <span className="text-sm font-raleway font-medium" style={{ color: "var(--theme-text)" }}>{t.label}</span>
                        <span className="text-xs font-raleway" style={{ color: "var(--theme-text-light)" }}>{t.seats.length === 1 ? `Mesto ${t.seats[0]}` : `Mesta ${t.seats.join(", ")}`}</span>
                      </div>
                    ))}</div>
                  ) : (
                    <p className="text-sm font-raleway text-center py-4" style={{ color: "var(--theme-text-light)" }}>Nije raspoređen/a</p>
                  )}
                  <button onClick={() => setSheetGuest(null)} className="w-full mt-4 py-2.5 rounded-lg text-sm font-raleway font-medium" style={{ backgroundColor: "var(--theme-background)", color: "var(--theme-text-light)" }}>Zatvori</button>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}
