// Dragging a seated guest from one seat to another.
//
// Built the same way as `beginNodeDrag` in TableNode: raw pointer events, the
// moving element written straight to the DOM per frame, and exactly one React
// update at the end. Per-frame setState is what made table dragging lag once a
// layout had many tables, and a hall plan has far more seats than tables.
//
// Hit-testing uses a snapshot of every seat's centre taken once at drag start,
// stored in WORLD coordinates. The cursor is re-projected through the live
// pan/zoom refs each move, so panning or zooming mid-drag needs no invalidation.
// Snapping is by nearest centre within a screen-constant radius, because at the
// minimum zoom a seat is only a few pixels wide and demanding a direct hit
// would make the interaction unusable.

import type { SeatAssignment } from "../types";

export interface SeatRef {
  tableId: string;
  seatIndex: number;
}

/** Pointer travel, in screen px, before a press becomes a drag instead of a click. */
const DRAG_THRESHOLD = 4;
/** Snap radius in screen px — kept constant so low zoom stays usable. */
const SNAP_SCREEN_PX = 18;

interface SeatEntry extends SeatRef {
  el: HTMLElement;
  /** Seat centre in canvas-world coordinates. */
  cx: number;
  cy: number;
  occupied: boolean;
}

// A completed drag is followed by a `click` on the source seat, which would
// otherwise run the click-to-remove path. The flag is timestamped so a stale
// one can never swallow an unrelated click later.
let dragClickAt = 0;

/** True once, right after a drag, so the seat's click handler can bail out. */
export function consumeDragClick(): boolean {
  if (dragClickAt && Date.now() - dragClickAt < 400) {
    dragClickAt = 0;
    return true;
  }
  return false;
}

function buildSeatIndex(
  canvasEl: HTMLElement,
  canvasRect: DOMRect,
  pan: { x: number; y: number },
  zoom: number,
): SeatEntry[] {
  const out: SeatEntry[] = [];
  for (const el of canvasEl.querySelectorAll<HTMLElement>("[data-seat]")) {
    const tableId = el.dataset.tableId;
    const seatIndex = el.dataset.seatIndex;
    if (!tableId || seatIndex === undefined) continue;
    const r = el.getBoundingClientRect();
    out.push({
      el,
      tableId,
      seatIndex: Number(seatIndex),
      cx: (r.left + r.width / 2 - canvasRect.left - pan.x) / zoom,
      cy: (r.top + r.height / 2 - canvasRect.top - pan.y) / zoom,
      occupied: el.dataset.seatOccupied === "1",
    });
  }
  return out;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** The chip that follows the cursor. Plain DOM — it must never cost a render. */
function createGhost(parent: HTMLElement, assignment: SeatAssignment) {
  const node = document.createElement("div");
  node.style.cssText = [
    "position:fixed",
    "left:0",
    "top:0",
    "z-index:9999",
    "pointer-events:none",
    "display:flex",
    "align-items:center",
    "gap:8px",
    "padding:6px 12px 6px 6px",
    "border-radius:999px",
    "background:var(--theme-surface)",
    "border:1px solid var(--theme-primary)",
    "box-shadow:0 6px 22px rgba(0,0,0,0.18)",
    "font-family:var(--font-raleway), system-ui, sans-serif",
    "white-space:nowrap",
    "opacity:0",
  ].join(";");

  const dot = document.createElement("span");
  dot.textContent = initials(assignment.guestName);
  dot.style.cssText = [
    "width:26px",
    "height:26px",
    "border-radius:999px",
    "background:var(--theme-primary)",
    "color:#fff",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "font-size:9px",
    "font-weight:700",
  ].join(";");

  const text = document.createElement("span");
  text.style.cssText = "display:flex;flex-direction:column;line-height:1.2";
  const name = document.createElement("span");
  name.textContent = assignment.guestName;
  name.style.cssText =
    "font-size:12px;font-weight:600;color:var(--theme-text)";
  const action = document.createElement("span");
  action.style.cssText =
    "font-size:10px;color:var(--theme-text-light)";
  text.append(name, action);
  node.append(dot, text);
  parent.appendChild(node);

  return {
    node,
    moveTo(x: number, y: number) {
      node.style.opacity = "1";
      node.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
    },
    setAction(label: string) {
      if (action.textContent !== label) action.textContent = label;
    },
    destroy() {
      node.remove();
    },
  };
}

export interface BeginSeatDragOptions {
  seatEl: HTMLElement;
  source: SeatRef;
  assignment: SeatAssignment;
  canvasEl: HTMLElement;
  zoomRef: { current: number };
  panRef: { current: { x: number; y: number } };
  /** Restricts valid drop targets. Used to keep the couple at their own table. */
  canDropOn?: (target: SeatRef) => boolean;
  /** Fired once, when the press turns into a real drag. */
  onDragStart: () => void;
  /** Fired once when a real drag finishes, however it ends (drop, cancel, Esc). */
  onDragEnd?: () => void;
  /** Fired once on a valid drop. The only React update of the whole gesture. */
  onDrop: (source: SeatRef, target: SeatRef) => void;
}

/**
 * Call from a seat's `pointerdown`. Does nothing visible until the pointer has
 * travelled past the threshold, so an ordinary click still reaches `onClick`.
 */
export function beginSeatDrag(
  e: React.PointerEvent,
  opts: BeginSeatDragOptions,
) {
  const {
    seatEl,
    source,
    assignment,
    canvasEl,
    zoomRef,
    panRef,
    canDropOn,
    onDragStart,
    onDragEnd,
    onDrop,
  } = opts;
  if (e.button !== 0 || e.pointerType === "touch") return;

  const pointerId = e.pointerId;
  const startX = e.clientX;
  const startY = e.clientY;

  let started = false;
  let entries: SeatEntry[] = [];
  let canvasRect: DOMRect | null = null;
  let ghost: ReturnType<typeof createGhost> | null = null;
  let target: SeatEntry | null = null;
  const sourceStyle = seatEl.style.cssText;

  const highlight = (entry: SeatEntry | null) => {
    if (target === entry) return;
    if (target) {
      target.el.style.outline = "";
      target.el.style.outlineOffset = "";
    }
    target = entry;
    if (target) {
      target.el.style.outline = "3px solid var(--theme-primary)";
      target.el.style.outlineOffset = "2px";
    }
  };

  const start = () => {
    started = true;
    canvasRect = canvasEl.getBoundingClientRect();
    entries = buildSeatIndex(
      canvasEl,
      canvasRect,
      panRef.current,
      zoomRef.current,
    ).filter(
      (en) =>
        !(en.tableId === source.tableId && en.seatIndex === source.seatIndex) &&
        (!canDropOn || canDropOn(en)),
    );
    ghost = createGhost(canvasEl, assignment);
    seatEl.style.opacity = "0.35";
    onDragStart();
  };

  const onMove = (ev: PointerEvent) => {
    if (!started) {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD)
        return;
      try {
        seatEl.setPointerCapture(pointerId);
      } catch {
        // Capture can be refused if the pointer already went away; the window
        // listeners below still carry the drag to completion.
      }
      start();
    }
    if (!canvasRect) return;

    const zoom = zoomRef.current || 1;
    const wx = (ev.clientX - canvasRect.left - panRef.current.x) / zoom;
    const wy = (ev.clientY - canvasRect.top - panRef.current.y) / zoom;
    const tolerance = Math.max(19, SNAP_SCREEN_PX / zoom);

    let best: SeatEntry | null = null;
    let bestDist = Infinity;
    for (const en of entries) {
      const d = Math.hypot(en.cx - wx, en.cy - wy);
      if (d < bestDist && d <= tolerance) {
        best = en;
        bestDist = d;
      }
    }
    highlight(best);

    ghost?.moveTo(ev.clientX, ev.clientY);
    ghost?.setAction(
      best
        ? best.occupied
          ? "Zameni mesta"
          : "Premesti ovde"
        : "Pusti da otkažeš",
    );
  };

  const cleanup = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onCancel);
    window.removeEventListener("keydown", onKey);
    highlight(null);
    ghost?.destroy();
    ghost = null;
    if (started) {
      seatEl.style.cssText = sourceStyle;
      dragClickAt = Date.now();
      try {
        seatEl.releasePointerCapture(pointerId);
      } catch {
        // Already released when the pointer left the window.
      }
      onDragEnd?.();
    }
  };

  const onUp = () => {
    const dropOn = target;
    const wasDragging = started;
    cleanup();
    if (wasDragging && dropOn)
      onDrop(source, {
        tableId: dropOn.tableId,
        seatIndex: dropOn.seatIndex,
      });
  };

  const onCancel = () => cleanup();
  const onKey = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") cleanup();
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);
  window.addEventListener("keydown", onKey);
}
