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
import type { TableData, TableType, SeatAssignment } from "../types";
import { BRIDE_GUEST_ID, GROOM_GUEST_ID } from "../types";
import {
  computeBoundingBox,
  computeLayoutStats,
  normalizeTablesToOrigin,
  rectFor,
  WALL_DEFAULT_W,
  WALL_DEFAULT_H,
} from "../geometry";
import { nameMatchesQuery } from "../lookup";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import LoadHallSchemeModal from "./LoadHallSchemeModal";
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
  Search,
  Heart,
  Link2,
  Sparkles,
  Pencil,
  LayoutDashboard,
  Monitor,
} from "lucide-react";
import GuestSidebar from "./GuestSidebar";
import type { GuestGroup } from "@/lib/seating/guest-groups";
import MemberNamesModal from "./MemberNamesModal";
import TableNode from "./TableNode";
import Toolbar from "./Toolbar";
import AddTablePanel from "./AddTablePanel";
import UpgradeModal from "./UpgradeModal";
import CursorGuestBadge from "./CursorGuestBadge";
import SeatGuestPicker, { type SeatAnchor } from "./SeatGuestPicker";
import SeatSearchButton from "./SeatSearchButton";
import { beginSeatDrag, type SeatRef } from "./seatDrag";
import MobileTableCard from "./MobileTableCard";
import MobileSeatSheet from "./MobileSeatSheet";
import MobileLayoutScreen from "./MobileLayoutScreen";
import { generateAndDownloadPDF } from "../pdf/generatePDF";

// Desktop infinite-canvas constants (module scope so effects need no deps).
/** Marks the one-time explainer about per-person names as already shown. Kept
 *  in localStorage, so it is per browser rather than per event — the same host
 *  usually arranges one wedding and does not need the lesson twice. */
const MEMBER_NAMES_HINT_KEY = "halo_seating_member_names_hint";

/** Cursor-badge invitation shown over a free seat when nobody is picked up. */
const EMPTY_SEAT_CTA = "Klikni da postaviš gosta na ovo mesto";

/** Srpska paukalna promena uz broj: 2-4 osobe, inace osoba (5, 11-14, 25...). */
function osobaLabel(n: number): string {
  const d = n % 10;
  const dd = n % 100;
  return d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? "osobe" : "osoba";
}

const WORLD_W = 12000;
const WORLD_H = 9000;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.5;

type RasporedActions = {
  save: (
    slug: string,
    json: string,
  ) => Promise<{ success: boolean; error?: string }>;
  load: (slug: string) => Promise<string | null>;
  checkPaid: (slug: string) => Promise<boolean>;
};

interface Props {
  attending: RSVPEntry[];
  slug: string;
  /** Display name shown in the toolbar (couple names, honoree name, event name). */
  coupleNames: string;
  paidForRaspored: boolean;
  /** save/load/checkPaid server actions specific to the consumer route. */
  actions: RasporedActions;
  /** Back-link target, forwarded to Toolbar. */
  backHref?: string;
  /** When true, the editor hides all "← Nazad" affordances (toolbar + mobile bar).
   *  Used by standalone routes where there's no parent portal to return to. */
  hideBackButton?: boolean;
  /** Optional sticky CTA rendered at the top of the GuestSidebar. Used by
   *  standalone routes to surface the "Lista gostiju" link without a back button. */
  sidebarTopAction?: { label: string; href: string };
  /** Optional secondary CTA below the top action. Standalone uses it to link
   *  the owner portal (audio/gallery/planner). */
  sidebarSecondaryAction?: { label: string; href: string };
  /** One menu entry per welcome-sign design this product offers. Weddings and
   *  events list two; birthdays list one. Each entry downloads a single file,
   *  so a click never trips the browser's multiple-download prompt. */
  welcomeSigns: { label: string; run: () => void | Promise<unknown> }[];
  /** Full URL for the guest-seat-lookup page (used in QR + copy link). */
  guestLookupUrl?: string;
  /** When true, hide wedding-only elements (Mladenački sto) from the add-table UI. */
  hideWeddingOnlyElements?: boolean;
  /** When true, hide the Specijalni elementi dropdown (music, dance floor, entrance) entirely
   *  and expose a standalone "Jednostran sto" button for non-wedding events. */
  hideDecorations?: boolean;
  /** Optional CSS variable overrides for the editor's color palette. Defaults to
   *  a luxury-gold scheme that suits both wedding and birthday flows. Standalone
   *  routes pass HALO Uspomene brand variables here. */
  themeVarsOverride?: React.CSSProperties;
  /** When provided, the Toolbar download menu shows an extra "Zatraži dizajn QR panoa"
   *  item that invokes this callback. Used by standalone routes — wedding/birthday
   *  flows handle pano design out-of-band. */
  onRequestPanoDesign?: () => void;
  /** When provided, the Toolbar download menu shows an extra "Preuzmi QR za RSVP"
   *  item. Generates a QR linking to the standalone /rsvp/dogadjaj-{slug} page
   *  so guests can self-RSVP from a printed invitation. */
  onDownloadRsvpQR?: () => void;
  /** Admin hall-scheme mode: the editor draws a venue template, not an event.
   *  Hides every guest surface and the download menu, and unlocks the hall
   *  outline in the add panel. Callers pass `attending: []` alongside it. */
  templateMode?: boolean;
  /** When true, the add panel offers "Učitaj šemu sale" — the venue scheme
   *  library. Desktop only; the mobile card list has no entry point. */
  enableHallSchemes?: boolean;
  /** Celine from the couple's Lista zvanica, offered as extra guest filters
   *  below the category options. Only the wedding flow has an invitee list. */
  guestGroups?: GuestGroup[];
  /** rsvp id -> celina id, for those same celine. */
  guestGroupByGuestId?: Record<string, string>;
}

function createTable(
  type: TableType,
  label: string,
  seats: number,
  pos: { x: number; y: number },
  bridal?: boolean,
): TableData {
  const assignments: (SeatAssignment | null)[] = Array(seats).fill(null);
  if (bridal) {
    // The couple sits in the middle of their own table, already placed — that
    // is the whole point of picking Mladenački sto over a plain head table.
    // Even seat counts have no true centre, so the pair straddles it.
    const mid = Math.floor(seats / 2);
    const left = Math.max(0, mid - 1);
    assignments[left] = {
      guestId: BRIDE_GUEST_ID,
      guestName: "Mlada",
      locked: true,
    };
    assignments[Math.min(seats - 1, left + 1)] = {
      guestId: GROOM_GUEST_ID,
      guestName: "Mladoženja",
      locked: true,
    };
  }
  return {
    id: `table-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    seats,
    x: pos.x,
    y: pos.y,
    label,
    assignments,
    ...(bridal ? { bridal: true } : {}),
  };
}

export default function RasporedClient({
  attending,
  slug,
  coupleNames,
  paidForRaspored: initialPaid,
  actions,
  backHref,
  hideBackButton,
  sidebarTopAction,
  sidebarSecondaryAction,
  welcomeSigns,
  guestLookupUrl,
  hideWeddingOnlyElements,
  hideDecorations,
  themeVarsOverride,
  onRequestPanoDesign,
  onDownloadRsvpQR,
  templateMode = false,
  enableHallSchemes = false,
  guestGroups,
  guestGroupByGuestId,
}: Props) {
  const saveRaspored = actions.save;
  const loadRaspored = actions.load;
  const checkPaidStatus = actions.checkPaid;
  const resolvedLookupUrl =
    guestLookupUrl ?? `https://halouspomene.rs/pozivnica/${slug}/gde-sedim/`;
  const [tables, setTables] = useState<TableData[]>([]);
  // Per-party individual member names, keyed by RSVP id. When present, placing
  // a party fills seats with these names instead of the party label.
  const [members, setMembers] = useState<Record<string, string[]>>({});
  const [memberModalGuest, setMemberModalGuest] = useState<RSVPEntry | null>(
    null,
  );
  const [selectedGuest, setSelectedGuest] = useState<RSVPEntry | null>(null);
  // Guest-list category filter + name search, held here rather than inside
  // GuestSidebar so the editor can read and reset them.
  const [guestFilter, setGuestFilter] = useState("");
  const [guestSearch, setGuestSearch] = useState("");
  const [hoverSeat, setHoverSeat] = useState<SeatAssignment | null>(null);
  const [hoverHint, setHoverHint] = useState<string | null>(null);
  // Guest picker over a free seat: opened by CLICKING one while no guest is
  // picked up in the sidebar (hovering only shows the CTA badge).
  const [seatPicker, setSeatPicker] = useState<{
    tableId: string;
    seatIndex: number;
    tableLabel: string;
    anchor: SeatAnchor;
  } | null>(null);
  // Declared this early because the canvas wheel/pan effects below list it as
  // a dependency — a panned canvas invalidates the panel's viewport anchor.
  const closeSeatPicker = useCallback(() => setSeatPicker(null), []);

  // "Where did I seat them?" search over the canvas — distinct from the sidebar
  // search, which picks somebody to place.
  const [seatSearchOpen, setSeatSearchOpen] = useState(false);
  const [seatQuery, setSeatQuery] = useState("");
  const [seatMatchIndex, setSeatMatchIndex] = useState(0);
  // A seat drag silences the cursor badge: every seat the ghost passes over
  // would otherwise fire mouseenter and put "Skloni: X" back on screen, which
  // is both wrong (you are moving, not removing) and a render per seat crossed.
  const [seatDragging, setSeatDragging] = useState(false);
  const seatDraggingRef = useRef(false);

  const handleSeatHover = useCallback((a: SeatAssignment | null) => {
    if (seatDraggingRef.current) return;
    setHoverSeat(a);
  }, []);

  const handleElementHover = useCallback((hint: string | null) => {
    if (seatDraggingRef.current) return;
    setHoverHint(hint);
  }, []);
  /** One-shot guard for the per-person-names explainer (see MEMBER_NAMES_HINT_KEY). */
  const memberNamesHintDone = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, startSave] = useTransition();
  const initialLoadDone = useRef(false);
  const [paidForRaspored, setPaidForRaspored] = useState(initialPaid);

  // Mobile mode (null = not yet detected)
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [mobileSeatTarget, setMobileSeatTarget] = useState<{
    tableId: string;
    seatIndex: number;
    tableLabel: string;
    assignment: import("../types").SeatAssignment | null;
  } | null>(null);
  const [showMobileAddTable, setShowMobileAddTable] = useState(false);
  const [showMobileGuests, setShowMobileGuests] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLayoutScreen, setShowLayoutScreen] = useState(false);
  const [mobileGuestSearch, setMobileGuestSearch] = useState("");
  /** Label of whatever download is currently running, or null when idle. */
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const pdfLoading = busyLabel !== null;
  const [showHallSchemes, setShowHallSchemes] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirmDialog({
    variant: "light",
  });

  // Desktop PWA mode (legacy, kept for tablet/desktop PWA)
  const [isPWADesktop, setIsPWADesktop] = useState(false);
  const [zoom, setZoom] = useState(0.3);
  const [sheetTable, setSheetTable] = useState<TableData | null>(null);
  const [showGuestPanel, setShowGuestPanel] = useState(false);
  const [showPWAMenu, setShowPWAMenu] = useState(false);
  const [sheetGuest, setSheetGuest] = useState<RSVPEntry | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Desktop infinite canvas: cursor-anchored zoom (Ctrl+wheel) + space-drag
  //    pan over a large world. Separate from the PWA `zoom` above.
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  // Refs mirror the live values so the native (non-passive) wheel listener and
  // window pan listeners read fresh state without re-subscribing each render.
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const panStart = useRef<{
    mouseX: number;
    mouseY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const setCanvasZoomSynced = useCallback((z: number) => {
    zoomRef.current = z;
    setCanvasZoom(z);
  }, []);
  const setPanSynced = useCallback((p: { x: number; y: number }) => {
    panRef.current = p;
    setPan(p);
  }, []);

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
    setIsMobile(mobile);
    if (!mobile) {
      // Check if PWA on larger screen (tablet/desktop)
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone ===
          true;
      if (standalone && window.innerWidth < 1024) {
        setIsPWADesktop(true);
        setZoom(Math.min(window.innerWidth / 1700, 0.35));
      }
    }
  }, []);

  // Desktop canvas: Ctrl/⌘+wheel zooms toward the cursor; a plain wheel pans.
  // Attached natively (non-passive) so preventDefault stops the browser's own
  // page zoom. Only active on the regular desktop canvas.
  useEffect(() => {
    if (isMobile !== false || isPWADesktop) return;
    const el = canvasRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // The picker is anchored to a viewport rect that panning/zooming
      // invalidates — and a pending open would land at the stale spot.
      closeSeatPicker();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey) {
        const z = zoomRef.current;
        const factor = Math.exp(-e.deltaY * 0.0015);
        const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * factor));
        if (nz === z) return;
        // Keep the world point under the cursor fixed while zooming.
        const worldX = (cx - panRef.current.x) / z;
        const worldY = (cy - panRef.current.y) / z;
        setPanSynced({ x: cx - worldX * nz, y: cy - worldY * nz });
        setCanvasZoomSynced(nz);
      } else {
        setPanSynced({
          x: panRef.current.x - e.deltaX,
          y: panRef.current.y - e.deltaY,
        });
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [
    isMobile,
    isPWADesktop,
    setPanSynced,
    setCanvasZoomSynced,
    closeSeatPicker,
  ]);

  // Hold Space to pan the canvas with a grab cursor (desktop only).
  useEffect(() => {
    if (isMobile !== false || isPWADesktop) return;
    const isTypingTarget = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      const tag = el?.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTypingTarget(e.target)) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceHeld(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isMobile, isPWADesktop]);

  // Drive the active space-pan drag via window listeners for smoothness.
  useEffect(() => {
    if (!isPanning) return;
    const onMove = (e: MouseEvent) => {
      const s = panStart.current;
      if (!s) return;
      setPanSynced({
        x: s.panX + (e.clientX - s.mouseX),
        y: s.panY + (e.clientY - s.mouseY),
      });
    };
    const onUp = () => {
      panStart.current = null;
      setIsPanning(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isPanning, setPanSynced]);

  const handleCanvasPanStart = (e: React.MouseEvent) => {
    if (!spaceHeld) return;
    e.preventDefault();
    closeSeatPicker();
    panStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
    setIsPanning(true);
  };

  // Load seating layout from MongoDB on mount
  useEffect(() => {
    let cancelled = false;
    if (slug) {
      loadRaspored(slug).then((json) => {
        if (cancelled) return;
        try {
          if (json) {
            const parsed = JSON.parse(json);
            if (Array.isArray(parsed)) {
              // Legacy format: bare TableData[]
              setTables(parsed);
            } else {
              setTables(Array.isArray(parsed?.tables) ? parsed.tables : []);
              setMembers(
                parsed?.members && typeof parsed.members === "object"
                  ? parsed.members
                  : {},
              );
            }
          }
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
  }, [tables, members, hydrated]);

  // Block tab close when unsaved
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Seats the editor placed itself (the couple on a bridal table) are skipped:
  // they answer to no RSVP, and counting them would eat the free tier's single
  // allowed assignment and skew the sidebar's raspoređeno tally.
  const assignedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const table of tables)
      for (const seat of table.assignments)
        if (seat && !seat.locked)
          counts[seat.guestId] = (counts[seat.guestId] || 0) + 1;
    return counts;
  }, [tables]);

  // A party whose seats are all taken simply drops out of hand. Deliberately
  // NOT auto-advancing to the next guest: jumping the selection on its own is
  // disorienting mid-table, and the owner asked for it to stay off.
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

  // The individual name to seat next for a party: the first entered member name
  // not already placed, or the party label when no names were entered.
  const pickMemberName = useCallback(
    (tbls: TableData[], guestId: string, fallback: string): string => {
      const names = (members[guestId] ?? [])
        .map((n) => n.trim())
        .filter(Boolean);
      if (names.length === 0) return fallback;
      const placed = new Set<string>();
      for (const t of tbls)
        for (const s of t.assignments)
          if (s && s.guestId === guestId) placed.add(s.guestName);
      return names.find((n) => !placed.has(n)) ?? fallback;
    },
    [members],
  );

  // Always spawn at the top-left of the currently visible canvas, stacking each
  // new item a few px down-right of the last so they pile in the same corner.
  const findSpawnPosition = useCallback(() => {
    const z = zoomRef.current || 1;
    const baseX = -panRef.current.x / z + 40;
    const baseY = -panRef.current.y / z + 40;
    const step = (tables.length % 8) * 16;
    return { x: baseX + step, y: baseY + step };
  }, [tables.length]);

  const addTable = async (
    type: TableType,
    label?: string,
    seats?: number,
    bridal?: boolean,
  ) => {
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
      type === "circle" ? 12 : type === "single-sided" ? 6 : 10;
    // The numbered "Sto N" series counts only round + rectangular tables;
    // special elements (single-sided, decorations) are excluded.
    const defaultLabel =
      type === "single-sided"
        ? `Jednostran sto ${
            tables.filter((t) => t.type === "single-sided").length + 1
          }`
        : `Sto ${
            tables.filter(
              (t) => t.type === "circle" || t.type === "rectangular",
            ).length + 1
          }`;
    const pos = findSpawnPosition();
    setTables((prev) => [
      ...prev,
      createTable(
        type,
        label ?? defaultLabel,
        seats ?? defaultSeats,
        pos,
        bridal,
      ),
    ]);
  };

  const addDecoration = (
    label: string,
    decorationType: TableData["decorationType"],
  ) => {
    const pos = findSpawnPosition();
    // A hall outline is nearly always drawn around tables that already exist,
    // so wrap them instead of dropping a default box in the corner.
    let wall: Pick<TableData, "x" | "y" | "decoWidth" | "decoHeight"> | null =
      null;
    if (decorationType === "wall") {
      const drawn = tables.filter((t) => t.type !== "decoration");
      if (drawn.length > 0) {
        const PAD = 60;
        const bbox = computeBoundingBox(drawn);
        wall = {
          x: bbox.minX - PAD,
          y: bbox.minY - PAD,
          decoWidth: Math.round(bbox.width + PAD * 2),
          decoHeight: Math.round(bbox.height + PAD * 2),
        };
      } else {
        wall = {
          x: pos.x,
          y: pos.y,
          decoWidth: WALL_DEFAULT_W,
          decoHeight: WALL_DEFAULT_H,
        };
      }
    }
    setTables((prev) => [
      ...prev,
      {
        id: `deco-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "decoration",
        seats: 0,
        x: wall?.x ?? pos.x,
        y: wall?.y ?? pos.y,
        label,
        assignments: [],
        decorationType,
        ...(wall
          ? { decoWidth: wall.decoWidth, decoHeight: wall.decoHeight }
          : {}),
      },
    ]);
  };

  const updateTable = (id: string, changes: Partial<TableData>) =>
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...changes } : t)),
    );

  const deleteTable = (id: string) => {
    // Clear any hover state — the hovered delete button unmounts with the table,
    // so its mouseleave never fires and the cursor badge hint would stick.
    setHoverHint(null);
    setHoverSeat(null);
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSeatClick = async (tableId: string, seatIndex: number) => {
    const targetTable = tables.find((t) => t.id === tableId);
    const existing = targetTable?.assignments[seatIndex] ?? null;
    // The couple cannot be cleared off their own table — only moved.
    if (existing?.locked) return;
    const isRemoving = !!existing;
    // Free seat with nobody picked up: the click only opens the guest picker
    // (routed through `handleEmptySeatHover`), so there is nothing to assign.
    if (!isRemoving && !selectedGuest) return;
    if (isRemoving) closeSeatPicker();
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
    setTables((prev) => {
      // Resolve the individual name before mutating, scanning the whole layout.
      const memberName = selectedGuest
        ? pickMemberName(prev, selectedGuest.id, selectedGuest.name)
        : "";
      // A click that changes nothing must hand back the very same array — the
      // dirty-tracking effect watches `tables` by identity, and a fresh array
      // would arm Sačuvaj and the leave-page warning over a no-op.
      let changed = false;
      const next = prev.map((t) => {
        if (t.id !== tableId) return t;
        const seat = t.assignments[seatIndex];
        if (seat) {
          const a = [...t.assignments];
          a[seatIndex] = null;
          changed = true;
          return { ...t, assignments: a };
        }
        if (!selectedGuest) return t;
        const total = parseInt(selectedGuest.guestCount) || 1;
        if ((assignedCounts[selectedGuest.id] || 0) >= total) return t;
        const a = [...t.assignments];
        const assignment: SeatAssignment = {
          guestId: selectedGuest.id,
          guestName: memberName,
        };
        a[seatIndex] = assignment;
        changed = true;
        return { ...t, assignments: a };
      });
      return changed ? next : prev;
    });
  };

  /**
   * Seats one specific guest on one specific free seat — the hover picker's
   * path, where no guest is picked up in the sidebar. Same paid gate and same
   * member-name resolution as a normal seat click.
   */
  const assignGuestToSeat = async (
    tableId: string,
    seatIndex: number,
    guest: RSVPEntry,
  ) => {
    const target = tables.find((t) => t.id === tableId);
    if (!target || target.assignments[seatIndex]) return;
    const total = parseInt(guest.guestCount) || 1;
    const already = assignedCounts[guest.id] || 0;
    if (already >= total) return;

    if (!paidForRaspored && totalAssigned >= 1) {
      const paid = await recheckPaid();
      if (!paid) {
        setShowUpgradeModal(true);
        return;
      }
    }

    setTables((prev) => {
      const memberName = pickMemberName(prev, guest.id, guest.name);
      let changed = false;
      const next = prev.map((t) => {
        if (t.id !== tableId) return t;
        if (t.assignments[seatIndex]) return t;
        const a = [...t.assignments];
        a[seatIndex] = { guestId: guest.id, guestName: memberName };
        changed = true;
        return { ...t, assignments: a };
      });
      return changed ? next : prev;
    });

    // A party with people left to seat becomes the active selection, so the
    // remaining seats are one click each from here on.
    if (already + 1 < total) setSelectedGuest(guest);
  };

  /**
   * Free seat, nobody picked up in the sidebar. Hovering only invites — the
   * cursor badge says what a click would do — because a full panel thrown up
   * on hover covers the very seats you were aiming for. The click itself
   * (`immediate`) is what opens the picker.
   */
  const handleEmptySeatHover = useCallback(
    (
      tableId: string,
      seatIndex: number,
      el: HTMLElement | null,
      immediate?: boolean,
    ) => {
      if (el === null) {
        setHoverHint(null);
        return;
      }
      if (!immediate) {
        if (!seatDraggingRef.current) setHoverHint(EMPTY_SEAT_CTA);
        return;
      }
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;
      const r = el.getBoundingClientRect();
      setHoverHint(null);
      // Clicking the seat the panel already belongs to closes it again.
      setSeatPicker((prev) =>
        prev && prev.tableId === tableId && prev.seatIndex === seatIndex
          ? null
          : {
              tableId,
              seatIndex,
              tableLabel: table.label,
              anchor: {
                left: r.left,
                right: r.right,
                top: r.top,
                bottom: r.bottom,
              },
            },
      );
    },
    [tables],
  );

  /**
   * Sidebar selection. The first time the host picks a party that covers more
   * than one person, explain that each seat can carry its own name — otherwise
   * all of that party's seats read the same and nobody discovers the feature.
   */
  const handleSelectGuest = (guest: RSVPEntry | null) => {
    closeSeatPicker();
    setSelectedGuest(guest);
    if (!guest) return;
    const count = parseInt(guest.guestCount) || 1;
    if (count <= 1) return;
    if ((members[guest.id] ?? []).some((n) => n.trim())) return;
    // A party already seated in full loses its selection right away (see the
    // auto-advance effect), so an invitation to name its people reads as noise.
    if ((assignedCounts[guest.id] || 0) >= count) return;
    if (memberNamesHintDone.current) return;
    memberNamesHintDone.current = true;
    try {
      if (localStorage.getItem(MEMBER_NAMES_HINT_KEY)) return;
      localStorage.setItem(MEMBER_NAMES_HINT_KEY, "1");
    } catch {
      // Private mode / blocked storage: show the hint once this session only.
    }
    void (async () => {
      const open = await confirm({
        title: "Više osoba na jednoj zvanici",
        message: `Zvanica ${guest.name} pokriva ${count} ${osobaLabel(count)}, pa sva njena mesta nose isti naziv.\n\nAko želiš da svako mesto ima svoje ime, klikni na ikonicu sa dve figure levo od naziva zvanice i upiši imena. Posle toga se pri raspoređivanju popunjava ime po ime, a ta imena idu i u PDF i u pretragu Gde sedim.`,
        confirmLabel: "Unesi imena sada",
        cancelLabel: "Kasnije",
      });
      if (open) setMemberModalGuest(guest);
    })();
  };

  const handlePickSeatGuest = async (guest: RSVPEntry) => {
    if (!seatPicker) return;
    const { tableId, seatIndex } = seatPicker;
    closeSeatPicker();
    await assignGuestToSeat(tableId, seatIndex, guest);
  };

  const handleStartOver = () => {
    setTables([]);
    setMembers({});
    setSelectedGuest(null);
    setHoverHint(null);
    setHoverSeat(null);
    setIsDirty(false);
    startSave(async () => {
      await saveRaspored(slug, JSON.stringify({ tables: [], members: {} }));
    });
  };

  /**
   * Replaces the current layout with a venue hall scheme.
   *
   * Table ids are regenerated so a second load can't collide with the first,
   * and every seat comes in empty — the scheme carries furniture, not people.
   * `members` is keyed by RSVP id and has nothing to do with tables, so it
   * survives untouched. Nothing is persisted until the user presses Sačuvaj.
   */
  const loadHallScheme = async (templateTables: TableData[]) => {
    // A scheme is always bigger than the free tier's two-tables-per-type, so it
    // has to pass the same gate `addTable` uses — otherwise an unpaid couple
    // could load a finished venue layout and print it (PDF is never gated).
    if (!paidForRaspored) {
      const paid = await recheckPaid();
      if (!paid) {
        setShowHallSchemes(false);
        setShowUpgradeModal(true);
        return;
      }
    }

    if (tables.length > 0) {
      const ok = await confirm({
        title: "Zameniti postojeći raspored?",
        message:
          "Učitavanje šeme briše sve trenutne stolove i gostima poništava mesta.\nLista gostiju i potvrde dolaska ostaju sačuvani.",
        danger: true,
        confirmLabel: "Učitaj šemu",
      });
      if (!ok) return;
    }

    const stamp = Date.now();
    const fresh = normalizeTablesToOrigin(
      templateTables.map((t, i) => ({
        ...t,
        id: `table-${stamp}-${i.toString(36)}`,
        assignments: Array(Math.max(0, t.seats)).fill(null),
      })),
    );

    setTables(fresh);
    setSelectedGuest(null);
    setHoverSeat(null);
    setHoverHint(null);
    setShowHallSchemes(false);

    // Frame the scheme so it lands visible instead of wherever the user
    // happened to be panned to.
    const el = canvasRef.current;
    if (el && fresh.length > 0) {
      const bbox = computeBoundingBox(fresh);
      const PAD = 80;
      const vw = el.clientWidth || 1200;
      const vh = el.clientHeight || 800;
      const z = Math.max(
        MIN_ZOOM,
        Math.min(
          MAX_ZOOM,
          Math.min(vw / (bbox.width + PAD * 2), vh / (bbox.height + PAD * 2)),
        ),
      );
      setCanvasZoomSynced(z);
      setPanSynced({
        x: vw / 2 - (bbox.minX + bbox.width / 2) * z,
        y: vh / 2 - (bbox.minY + bbox.height / 2) * z,
      });
    }
  };

  const handleSave = (tablesToSave?: TableData[]) => {
    setSaveError("");
    const data = tablesToSave ?? tables;
    startSave(async () => {
      const result = await saveRaspored(
        slug,
        JSON.stringify({ tables: data, members }),
      );
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

  // Save individual member names for a party (from the names modal). Also
  // relabels any seats already placed for that party, in entry order, so the
  // canvas / PDF / lookup stay consistent.
  const handleSaveMembers = (guestId: string, names: string[]) => {
    const cleaned = names.map((n) => n.trim());
    const namedList = cleaned.filter(Boolean);
    const partyName = attending.find((g) => g.id === guestId)?.name ?? "";
    setMembers((prev) => {
      if (namedList.length === 0) {
        const next = { ...prev };
        delete next[guestId];
        return next;
      }
      return { ...prev, [guestId]: cleaned };
    });
    setTables((prev) => {
      let idx = 0;
      return prev.map((t) => ({
        ...t,
        assignments: t.assignments.map((s) => {
          if (s && s.guestId === guestId) {
            const newName =
              namedList.length === 0
                ? partyName
                : namedList[idx] ?? partyName;
            idx++;
            return { ...s, guestName: newName };
          }
          return s;
        }),
      }));
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
    setTables((prev) => {
      const memberName = pickMemberName(prev, guest.id, guest.name);
      return prev.map((t) => {
        if (t.id !== tableId) return t;
        if (t.assignments[seatIndex]?.locked) return t;
        const a = [...t.assignments];
        a[seatIndex] = { guestId: guest.id, guestName: memberName };
        return { ...t, assignments: a };
      });
    });
  };

  // Mobile: remove assignment
  const handleMobileRemove = (tableId: string, seatIndex: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        if (t.assignments[seatIndex]?.locked) return t;
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

  /** Template-mode toolbar figures. The mobile/PWA canvas is a fixed 1600×1100
   *  with schemes normalised to (80,80), so anything past ~1440×940 will spill
   *  off a phone — worth flagging while the admin is still drawing. */
  const layoutStats = useMemo(() => {
    const { tableCount, totalSeats } = computeLayoutStats(tables);
    const bbox = computeBoundingBox(tables);
    return {
      tableCount,
      totalSeats,
      width: bbox.width,
      height: bbox.height,
      fitsMobile: bbox.width <= 1440 && bbox.height <= 940,
    };
  }, [tables]);

  /** Hall outlines are painted first so tables always sit on top of them.
   *  Both are `position: absolute` with no z-index of their own, so DOM order
   *  is what decides — sorting here rather than styling keeps it simple. */
  /**
   * Drop of a dragged seat. A free target moves the occupant, an occupied one
   * swaps the two — nobody is ever left standing, and a swap is the only way to
   * rearrange a table that is already full.
   *
   * The whole `SeatAssignment` object travels, so per-person names and the
   * locked flag follow their owner. Nothing about a move changes who is seated,
   * only where, so `assignedCounts` is untouched and the paid gate does not
   * apply — the server still re-verifies `paid_for_raspored` on save.
   */
  const moveSeatAssignment = useCallback((src: SeatRef, dst: SeatRef) => {
    setTables((prev) => {
      if (src.tableId === dst.tableId && src.seatIndex === dst.seatIndex)
        return prev;
      const srcTable = prev.find((t) => t.id === src.tableId);
      const dstTable = prev.find((t) => t.id === dst.tableId);
      if (!srcTable || !dstTable) return prev;
      const moving = srcTable.assignments[src.seatIndex];
      if (!moving) return prev;
      const displaced = dstTable.assignments[dst.seatIndex] ?? null;
      // A locked occupant may be rearranged but never pushed off its table.
      if (displaced?.locked && dst.tableId !== src.tableId) return prev;
      return prev.map((t) => {
        if (t.id !== src.tableId && t.id !== dst.tableId) return t;
        const a = [...t.assignments];
        // Same-table moves need both writes to land in the one clone.
        if (t.id === src.tableId) a[src.seatIndex] = displaced;
        if (t.id === dst.tableId) a[dst.seatIndex] = moving;
        return { ...t, assignments: a };
      });
    });
  }, []);

  const handleSeatDragStart = useCallback(
    (e: React.PointerEvent, source: SeatRef, assignment: SeatAssignment) => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      beginSeatDrag(e, {
        seatEl: e.currentTarget as HTMLElement,
        source,
        assignment,
        canvasEl,
        zoomRef,
        panRef,
        // The couple stay at their own table. Both directions are refused up
        // front rather than at drop time, so the ghost never promises a swap
        // the mutation would then decline: dragging a locked occupant offers
        // only its own table, and dragging anybody else offers a locked seat
        // only when the swap keeps that occupant on the same table.
        canDropOn: (t) => {
          if (assignment.locked) return t.tableId === source.tableId;
          if (t.tableId === source.tableId) return true;
          const occupant = tables.find((x) => x.id === t.tableId)?.assignments[
            t.seatIndex
          ];
          return !occupant?.locked;
        },
        onDragStart: () => {
          seatDraggingRef.current = true;
          setSeatDragging(true);
          setHoverSeat(null);
          setHoverHint(null);
          closeSeatPicker();
        },
        onDragEnd: () => {
          seatDraggingRef.current = false;
          setSeatDragging(false);
          setHoverSeat(null);
          setHoverHint(null);
        },
        onDrop: moveSeatAssignment,
      });
    },
    [tables, closeSeatPicker, moveSeatAssignment],
  );

  // ── Seat search: find an already-seated guest and light up their seat ──────
  // A seat carries either the party label or the individual member name, so the
  // query is tried against both that and the party it belongs to — otherwise
  // searching the zvanica holder would miss seats labelled with member names.
  const seatMatches = useMemo(() => {
    const q = seatQuery.trim();
    if (!q) return [] as { tableId: string; seatIndex: number; cx: number; cy: number }[];
    const partyName = new Map(attending.map((g) => [g.id, g.name]));
    const out: { tableId: string; seatIndex: number; cx: number; cy: number }[] = [];
    for (const t of tables) {
      const r = rectFor(t);
      t.assignments.forEach((a, i) => {
        if (!a) return;
        const party = partyName.get(a.guestId);
        if (
          nameMatchesQuery(a.guestName, q) ||
          (party && nameMatchesQuery(party, q))
        )
          out.push({
            tableId: t.id,
            seatIndex: i,
            cx: r.x + r.w / 2,
            cy: r.y + r.h / 2,
          });
      });
    }
    return out;
  }, [seatQuery, tables, attending]);

  const highlightedSeats = useMemo(
    () => new Set(seatMatches.map((m) => `${m.tableId}:${m.seatIndex}`)),
    [seatMatches],
  );
  /** Stable signature, so dragging a table around does not re-frame the canvas. */
  const seatMatchKey = highlightedSeats.size
    ? [...highlightedSeats].join("|")
    : "";
  const lastFramedMatchKey = useRef("");

  /** Centres the canvas on a match without zooming further out than readable. */
  const frameSeatMatch = useCallback(
    (match: { cx: number; cy: number } | undefined) => {
      const el = canvasRef.current;
      if (!el || !match) return;
      const z = Math.min(MAX_ZOOM, Math.max(0.6, zoomRef.current));
      setCanvasZoomSynced(z);
      setPanSynced({
        x: el.clientWidth / 2 - match.cx * z,
        y: el.clientHeight / 2 - match.cy * z,
      });
    },
    [setPanSynced, setCanvasZoomSynced],
  );

  useEffect(() => {
    if (!seatMatchKey) {
      lastFramedMatchKey.current = "";
      return;
    }
    if (seatMatchKey === lastFramedMatchKey.current) return;
    lastFramedMatchKey.current = seatMatchKey;
    setSeatMatchIndex(0);
    frameSeatMatch(seatMatches[0]);
  }, [seatMatchKey, seatMatches, frameSeatMatch]);

  const focusNextSeatMatch = () => {
    if (seatMatches.length === 0) return;
    const next = (seatMatchIndex + 1) % seatMatches.length;
    setSeatMatchIndex(next);
    frameSeatMatch(seatMatches[next]);
  };

  const canvasTables = useMemo(() => {
    const isWall = (t: TableData) =>
      t.type === "decoration" && t.decorationType === "wall";
    if (!tables.some(isWall)) return tables;
    return [...tables.filter(isWall), ...tables.filter((t) => !isWall(t))];
  }, [tables]);

  const defaultThemeVars = {
    backgroundColor: "var(--theme-background)",
    "--theme-primary": "#d4af37",
    "--theme-primary-light": "rgba(212,175,55,0.25)",
    "--theme-primary-muted": "rgba(212,175,55,0.15)",
    "--theme-background": "#FAFAF5",
    "--theme-surface": "#F5F4DC",
    "--theme-surface-alt": "#F0EFCF",
    "--theme-text": "#232323",
    "--theme-text-muted": "rgba(35,35,35,0.92)",
    "--theme-text-light": "rgba(35,35,35,0.78)",
    "--theme-border": "rgba(35,35,35,0.32)",
    "--theme-border-light": "rgba(35,35,35,0.2)",
  } as React.CSSProperties;

  const themeVars: React.CSSProperties = themeVarsOverride
    ? { ...defaultThemeVars, ...themeVarsOverride }
    : defaultThemeVars;

  // ══════════════════════════════════════════════════════════════════════════
  // LOADING — wait for layout detection before rendering anything
  // ══════════════════════════════════════════════════════════════════════════
  if (isMobile === null) {
    return (
      <div
        className="flex items-center justify-center h-dvh"
        style={themeVars}
      >
        <div className="flex flex-col items-center gap-3">
          <span
            className="loading loading-spinner loading-md"
            style={{ color: "var(--theme-primary)" }}
          />
          <span
            className="font-raleway text-sm"
            style={{ color: "var(--theme-text-light)" }}
          >
            Učitavanje...
          </span>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ══════════════════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div className="flex flex-col h-dvh" style={themeVars}>
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
          {!hideBackButton && (
            <a
              href={backHref ?? "/moje-vencanje"}
              className="w-8 h-8 flex items-center justify-center rounded-full shrink-0"
              style={{ color: "var(--theme-text)" }}
            >
              <ArrowLeft size={18} />
            </a>
          )}
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
                      setBusyLabel("Pripremam PDF...");
                      try {
                        await generateAndDownloadPDF(tables, attending, coupleNames, slug, resolvedLookupUrl);
                      } finally {
                        setBusyLabel(null);
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
                  {welcomeSigns.map((sign) => (
                    <button
                      key={sign.label}
                      onClick={async () => {
                        setShowMobileMenu(false);
                        setBusyLabel("Pripremam QR pano...");
                        try {
                          await sign.run();
                        } catch (err) {
                          console.error("QR pano PDF failed:", err);
                          showToast("Greška pri generisanju QR pano PDF-a");
                        } finally {
                          setBusyLabel(null);
                        }
                      }}
                      disabled={pdfLoading}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium active:bg-black/5 disabled:opacity-40"
                      style={{ color: "var(--theme-text)" }}
                    >
                      <Heart size={16} style={{ color: "var(--theme-primary)" }} />
                      {sign.label}
                    </button>
                  ))}
                  {/* Pano group: QR pano PDF + samo QR + Zatraži dizajn — no internal dividers */}
                  <button
                    onClick={async () => {
                      if (isDirty) { showToast("Sačuvaj pre preuzimanja"); setShowMobileMenu(false); return; }
                      const QRCode = (await import("qrcode")).default;
                      const dataUrl = await QRCode.toDataURL(resolvedLookupUrl, { width: 1200, margin: 2, color: { dark: "#232323", light: "#ffffff" } });
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
                    Preuzmi samo QR za pano
                  </button>
                  {onRequestPanoDesign && (
                    <button
                      onClick={() => {
                        onRequestPanoDesign();
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium active:bg-black/5"
                      style={{ color: "var(--theme-text)" }}
                    >
                      <Sparkles size={16} style={{ color: "var(--theme-primary)" }} />
                      Zatraži dizajn QR panoa
                    </button>
                  )}
                  {onDownloadRsvpQR && (
                    <>
                      <div className="h-px" style={{ backgroundColor: "var(--theme-border-light)" }} />
                      <button
                        onClick={() => {
                          onDownloadRsvpQR();
                          setShowMobileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium active:bg-black/5"
                        style={{ color: "var(--theme-text)" }}
                      >
                        <QrCode size={16} style={{ color: "var(--theme-primary)" }} />
                        QR za potvrdu dolaska
                      </button>
                    </>
                  )}
                  <div className="h-px" style={{ backgroundColor: "var(--theme-border-light)" }} />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resolvedLookupUrl).then(() => {
                        showToast("Link kopiran!");
                      });
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium active:bg-black/5"
                    style={{ color: "var(--theme-text)" }}
                  >
                    <Link2 size={16} style={{ color: "var(--theme-primary)" }} />
                    Kopiraj link Gde sedim
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

        {/* ── "Prva pomoć" traka ──
            Telefon nema bočnu traku, filtere ni platno — služi za sitne popravke
            na licu mesta. Traka stoji uvek (nema zatvaranja), da par ne pomisli
            da je ovo ceo alat i ne odustane od rasporeda na pola. */}
        <div
          className="shrink-0 flex items-start gap-2 px-4 py-2"
          style={{
            backgroundColor: "color-mix(in srgb, var(--theme-primary) 12%, var(--theme-surface))",
            borderBottom: "1px solid var(--theme-border-light)",
          }}
        >
          <Monitor
            size={14}
            className="shrink-0 mt-0.5"
            style={{ color: "var(--theme-primary)" }}
          />
          <p
            className="font-raleway text-[11px] leading-snug"
            style={{ color: "var(--theme-text)" }}
          >
            <span className="font-bold uppercase tracking-wide">
              Verzija za prvu pomoć
            </span>
            <br />
            <span style={{ color: "var(--theme-text-light)" }}>
              Na telefonu menjate stolove i mesta u hodu. Za pun alat — crtanje
              sale, pomeranje stolova i pregled cele šeme — otvorite raspored na
              računaru.
            </span>
          </p>
        </div>

        {/* ── Scrollable table cards ── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{
            paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))",
            backgroundImage:
              "radial-gradient(circle, rgba(35,35,35,0.12) 0.9px, transparent 0.9px)",
            backgroundSize: "24px 24px",
          }}
        >
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

          {/* Guest list — a hall template has no guests */}
          {!templateMode && (
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
          )}
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
                  { type: "rectangular" as const, label: "Pravougaoni sto", desc: "10 mesta", seats: 10 },
                  ...(hideWeddingOnlyElements
                    ? []
                    : [
                        {
                          type: "single-sided" as const,
                          label: "Mladenački sto",
                          desc: "6 mesta",
                          seats: 6,
                        },
                      ]),
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
                  Gosti
                </h3>
                <button onClick={() => setShowMobileGuests(false)} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ color: "var(--theme-text-light)" }}>
                  <X size={18} />
                </button>
              </div>
              {/* Top action — surfaces the consumer route's full guest-management
                  link (same target as the desktop GuestSidebar topAction). Only
                  standalone routes provide this; couple flow leaves it undefined. */}
              {sidebarTopAction && (
                <a
                  href={sidebarTopAction.href}
                  className="mx-5 mb-3 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-raleway font-semibold text-white transition-opacity active:opacity-80 shrink-0"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                >
                  <Pencil size={13} />
                  {sidebarTopAction.label}
                </a>
              )}
              {sidebarSecondaryAction && (
                <a
                  href={sidebarSecondaryAction.href}
                  className="mx-5 mb-3 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-raleway font-semibold transition-opacity active:opacity-80 shrink-0"
                  style={{
                    border: "1px solid var(--theme-primary)",
                    color: "var(--theme-primary)",
                  }}
                >
                  <LayoutDashboard size={13} />
                  {sidebarSecondaryAction.label}
                </a>
              )}
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
      {!isPWADesktop && !templateMode && (
        <GuestSidebar
          attending={attending}
          selectedGuest={selectedGuest}
          onSelectGuest={handleSelectGuest}
          assignedCounts={assignedCounts}
          onStartOver={handleStartOver}
          topAction={sidebarTopAction}
          secondaryAction={sidebarSecondaryAction}
          members={members}
          onEditMembers={setMemberModalGuest}
          filter={guestFilter}
          onFilterChange={setGuestFilter}
          search={guestSearch}
          onSearchChange={setGuestSearch}
          groups={guestGroups}
          groupByGuestId={guestGroupByGuestId}
        />
      )}

      {memberModalGuest && (
        <MemberNamesModal
          guest={memberModalGuest}
          initialNames={members[memberModalGuest.id] ?? []}
          onSave={(names) => handleSaveMembers(memberModalGuest.id, names)}
          onClose={() => setMemberModalGuest(null)}
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
            backHref={backHref}
            hideBackButton={hideBackButton}
            welcomeSigns={welcomeSigns}
            guestLookupUrl={resolvedLookupUrl}
            onSave={() => handleSave()}
            onDownloadPDF={() =>
              generateAndDownloadPDF(tables, attending, coupleNames, slug, resolvedLookupUrl)
            }
            onRequestPanoDesign={onRequestPanoDesign}
            onDownloadRsvpQR={onDownloadRsvpQR}
            templateMode={templateMode}
            templateStats={templateMode ? layoutStats : undefined}
          />
        )}

        <div className="flex-1 relative overflow-hidden">
          {!isPWADesktop && (
            <AddTablePanel
              onAddTable={addTable}
              onAddDecoration={addDecoration}
              totalSeats={totalSeats}
              occupiedSeats={occupiedSeats}
              hideWeddingOnlyElements={hideWeddingOnlyElements}
              hideDecorations={hideDecorations}
              templateMode={templateMode}
              onLoadHallScheme={
                enableHallSchemes ? () => setShowHallSchemes(true) : undefined
              }
              trailing={
                templateMode ? undefined : (
                  <SeatSearchButton
                    value={seatQuery}
                    onChange={setSeatQuery}
                    matchCount={seatMatches.length}
                    matchIndex={seatMatchIndex}
                    onNext={focusNextSeatMatch}
                    open={seatSearchOpen}
                    onOpenChange={setSeatSearchOpen}
                  />
                )
              }
            />
          )}

          {/* Scrollable canvas */}
          <div
            ref={canvasRef}
            className={`absolute inset-0 ${
              isPWADesktop ? "overflow-auto" : "overflow-hidden"
            }`}
            style={{
              ...(isPWADesktop
                ? {
                    backgroundImage:
                      "radial-gradient(circle, rgba(35,35,35,0.13) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }
                : {
                    // Infinite dot grid painted on the (untransformed) viewport
                    // so it fills the screen in every direction and still pans/
                    // zooms in lock-step with the world.
                    backgroundColor: "var(--theme-background)",
                    backgroundImage:
                      "radial-gradient(circle, rgba(35,35,35,0.13) 1px, transparent 1px)",
                    backgroundSize: `${28 * canvasZoom}px ${28 * canvasZoom}px`,
                    backgroundPosition: `${pan.x}px ${pan.y}px`,
                  }),
              touchAction: isPWADesktop ? "pan-x pan-y" : undefined,
              cursor: !isPWADesktop && spaceHeld
                ? isPanning
                  ? "grabbing"
                  : "grab"
                : undefined,
            }}
            onMouseDown={!isPWADesktop ? handleCanvasPanStart : undefined}
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
                    canvasTables.map((table) => (
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
                  width: WORLD_W,
                  height: WORLD_H,
                  position: "absolute",
                  left: 0,
                  top: 0,
                  transformOrigin: "0 0",
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${canvasZoom})`,
                  // While space-panning, let the viewport capture the drag.
                  pointerEvents: spaceHeld ? "none" : "auto",
                }}
              >
                {hydrated &&
                  canvasTables.map((table) => (
                    <TableNode
                      key={table.id}
                      table={table}
                      selectedGuest={selectedGuest}
                      onSeatClick={handleSeatClick}
                      onSeatHover={handleSeatHover}
                      highlightedSeats={highlightedSeats}
                      onSeatDragStart={
                        templateMode ? undefined : handleSeatDragStart
                      }
                      onEmptySeatHover={
                        // Only when nothing is picked up — with a guest in hand
                        // a free seat is a one-click drop, not a menu.
                        !templateMode && !selectedGuest && attending.length > 0
                          ? handleEmptySeatHover
                          : undefined
                      }
                      onElementHover={handleElementHover}
                      onUpdate={updateTable}
                      onDelete={deleteTable}
                      scale={canvasZoom}
                    />
                  ))}

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
                {busyLabel}
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
                    setBusyLabel("Pripremam PDF...");
                    try {
                      await generateAndDownloadPDF(tables, attending, coupleNames, slug, resolvedLookupUrl);
                    } finally {
                      setBusyLabel(null);
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
                {welcomeSigns.map((sign) => (
                  <button
                    key={sign.label}
                    onClick={async () => {
                      setShowPWAMenu(false);
                      setBusyLabel("Pripremam QR pano...");
                      try {
                        await sign.run();
                      } catch (err) {
                        console.error("QR pano PDF failed:", err);
                        showToast("Greška pri generisanju QR pano PDF-a");
                      } finally {
                        setBusyLabel(null);
                      }
                    }}
                    disabled={pdfLoading}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium hover:bg-black/5 disabled:opacity-50"
                    style={{ color: "var(--theme-text)" }}
                  >
                    <Heart size={16} style={{ color: "var(--theme-primary)" }} />
                    {sign.label}
                  </button>
                ))}
                {/* Pano group: QR pano PDF + samo QR + Zatraži dizajn — no internal dividers */}
                <button
                  onClick={async () => {
                    const QRCode = (await import("qrcode")).default;
                    const dataUrl = await QRCode.toDataURL(resolvedLookupUrl, { width: 1200, margin: 2, color: { dark: "#232323", light: "#ffffff" } });
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
                  Preuzmi samo QR za pano
                </button>
                {onRequestPanoDesign && (
                  <button
                    onClick={() => {
                      onRequestPanoDesign();
                      setShowPWAMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium hover:bg-black/5"
                    style={{ color: "var(--theme-text)" }}
                  >
                    <Sparkles size={16} style={{ color: "var(--theme-primary)" }} />
                    Zatraži dizajn QR panoa
                  </button>
                )}
                {onDownloadRsvpQR && (
                  <>
                    <div className="h-px" style={{ backgroundColor: "var(--theme-border-light)" }} />
                    <button
                      onClick={() => {
                        onDownloadRsvpQR();
                        setShowPWAMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium hover:bg-black/5"
                      style={{ color: "var(--theme-text)" }}
                    >
                      <QrCode size={16} style={{ color: "var(--theme-primary)" }} />
                      QR za potvrdu dolaska
                    </button>
                  </>
                )}
                <div className="h-px" style={{ backgroundColor: "var(--theme-border-light)" }} />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resolvedLookupUrl).then(() => {
                      showToast("Link kopiran!");
                    });
                    setShowPWAMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-raleway font-medium hover:bg-black/5"
                  style={{ color: "var(--theme-text)" }}
                >
                  <Link2 size={16} style={{ color: "var(--theme-primary)" }} />
                  Kopiraj link Gde sedim
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
                  topAction={sidebarTopAction}
                  secondaryAction={sidebarSecondaryAction}
                  filter={guestFilter}
                  onFilterChange={setGuestFilter}
                  search={guestSearch}
                  onSearchChange={setGuestSearch}
                  groups={guestGroups}
                  groupByGuestId={guestGroupByGuestId}
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

      {!isPWADesktop && !seatDragging && (
        <CursorGuestBadge
          selectedGuest={selectedGuest}
          hoverSeat={hoverSeat}
          hint={hoverHint}
          selectedLabel={
            selectedGuest
              ? pickMemberName(tables, selectedGuest.id, selectedGuest.name)
              : null
          }
          containerRef={canvasRef}
        />
      )}

      {!isPWADesktop && !selectedGuest && seatPicker && (
        <SeatGuestPicker
          anchor={seatPicker.anchor}
          seatLabel={`${seatPicker.tableLabel} · mesto ${seatPicker.seatIndex + 1}`}
          attending={attending}
          assignedCounts={assignedCounts}
          members={members}
          onPick={handlePickSeatGuest}
          onClose={closeSeatPicker}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}

      {showHallSchemes && (
        <LoadHallSchemeModal
          onClose={() => setShowHallSchemes(false)}
          onLoad={loadHallScheme}
        />
      )}

      {confirmDialog}
    </div>
  );
}
