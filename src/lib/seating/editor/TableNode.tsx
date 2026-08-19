"use client";

import { useRef, useState } from "react";
import {
  Trash2,
  Plus,
  Minus,
  RotateCw,
  FlipVertical2,
  FlipHorizontal2,
  Music,
  DoorOpen,
  Crown,
  Disc3,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  CakeSlice,
  UtensilsCrossed,
} from "lucide-react";
import type { RSVPEntry } from "@/lib/rsvp";
import type {
  TableData,
  SeatAssignment,
  DecorationType,
  EntranceDirection,
} from "../types";
import { WALL_DEFAULT_W, WALL_DEFAULT_H } from "../geometry";
import { consumeDragClick, type SeatRef } from "./seatDrag";

const SEAT_SIZE = 30;
const CIRCLE_TABLE_R = 52;
const SEAT_ORBIT_R = CIRCLE_TABLE_R + 16;

// Monotonic z-index handed out to the most-recently hovered/dragged table so it
// renders above the others. Done via direct DOM (no React state) — raising a
// table must not re-render the whole canvas, otherwise dragging lags badly once
// there are many tables.
let TABLE_Z_SEQ = 10;

/**
 * Drag a positioned node by writing its `transform` straight to the DOM on each
 * pointer move (no React re-render per frame) and committing the final position
 * once on release. The pointer delta is divided by `scale` so the node tracks
 * the cursor exactly under the canvas's zoom. Drags that start on an interactive
 * child (matched by `ignore`) are skipped so seats/buttons/inputs keep working.
 */
function beginNodeDrag(
  e: React.PointerEvent,
  opts: {
    node: HTMLElement | null;
    baseX: number;
    baseY: number;
    scale: number;
    ignore: string;
    onCommit: (x: number, y: number) => void;
    onStart?: () => void;
  },
) {
  const { node, baseX, baseY, scale, ignore, onCommit, onStart } = opts;
  if (e.button !== 0) return;
  if ((e.target as HTMLElement).closest(ignore)) return;
  // No preventDefault: the cards set `userSelect: none` already, and calling it
  // on pointerdown would suppress the compatibility dblclick used to rename a
  // table. Drag starts only after the move threshold below.
  onStart?.();
  const startX = e.clientX;
  const startY = e.clientY;
  const s = scale || 1;
  let moved = false;
  let curX = baseX;
  let curY = baseY;
  const onMove = (ev: PointerEvent) => {
    if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 3)
      return;
    moved = true;
    curX = baseX + (ev.clientX - startX) / s;
    curY = baseY + (ev.clientY - startY) / s;
    if (node) node.style.transform = `translate(${curX}px, ${curY}px)`;
  };
  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (moved) onCommit(curX, curY);
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

// Defaults for resizable zones
const DECO_DEFAULT_W = 160;
const DECO_DEFAULT_H = 80;
const DECO_MIN_W = 100;
const DECO_MAX_W = 500;
const DECO_MIN_H = 60;
const DECO_MAX_H = 400;

// Hall outline. Far larger bounds than a decoration zone — this rectangle has to
// fit a whole hall's worth of tables inside it.
const WALL_MIN_W = 200;
const WALL_MAX_W = 6000;
const WALL_MIN_H = 200;
const WALL_MAX_H = 4500;
/** Thickness of the invisible grab strips laid over the wall's edges. */
const WALL_GRIP = 14;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Seat({
  assignment,
  onClick,
  onHover,
  isSelecting,
  highlighted,
  tableId,
  seatIndex,
  onDragStart,
  onEmptyHover,
}: {
  assignment: SeatAssignment | null;
  onClick: () => void;
  onHover?: (a: SeatAssignment | null) => void;
  isSelecting: boolean;
  /** Lit up by the seat-search: this seat holds somebody the query matched. */
  highlighted?: boolean;
  /** Identity written to the DOM so the drag hit-test can find this seat. */
  tableId: string;
  seatIndex: number;
  /** Starts a move-drag. Only provided for seats that hold somebody. */
  onDragStart?: (e: React.PointerEvent) => void;
  /** Fires only for a FREE seat: the seat button on enter, null on leave, and
   *  with `immediate` on click. The editor uses it to anchor the hover
   *  guest-picker. Undefined when the picker is unavailable (read-only,
   *  template mode, a guest already picked up). */
  onEmptyHover?: (el: HTMLElement | null, immediate?: boolean) => void;
}) {
  return (
    <button
      data-seat
      data-table-id={tableId}
      data-seat-index={seatIndex}
      data-seat-occupied={assignment ? "1" : "0"}
      onPointerDown={assignment && onDragStart ? onDragStart : undefined}
      onClick={(e) => {
        // A drag ends with a click on the seat it started from; that click must
        // not fall through to the remove path.
        if (consumeDragClick()) return;
        // Clicking a free seat with nobody picked up opens the picker at once,
        // instead of waiting out the hover-intent delay.
        if (!assignment && onEmptyHover) onEmptyHover(e.currentTarget, true);
        onClick();
      }}
      onMouseEnter={(e) => {
        onHover?.(assignment);
        if (!assignment) onEmptyHover?.(e.currentTarget);
      }}
      onMouseLeave={() => {
        onHover?.(null);
        if (!assignment) onEmptyHover?.(null);
      }}
      className="rounded-full flex items-center justify-center transition-all"
      style={{
        width: SEAT_SIZE,
        height: SEAT_SIZE,
        flexShrink: 0,
        backgroundColor: assignment
          ? "var(--theme-primary)"
          : isSelecting
            ? "color-mix(in srgb, var(--theme-primary) 22%, transparent)"
            : "#FFFFFF",
        border: assignment
          ? "2px solid var(--theme-primary)"
          : isSelecting
            ? "2px dashed var(--theme-primary)"
            : "2px solid color-mix(in srgb, var(--theme-primary) 60%, transparent)",
        color: assignment ? "white" : "var(--theme-text-light)",
        // Search hit: a ring outside the seat, so it reads even at low zoom
        // where the seat itself is only a few pixels across.
        outline: highlighted ? "3px solid #16a34a" : undefined,
        outlineOffset: highlighted ? 2 : undefined,
        boxShadow: highlighted ? "0 0 0 6px rgba(22,163,74,0.25)" : undefined,
        cursor: assignment
          ? onDragStart
            ? "grab"
            : "pointer"
          : isSelecting || onEmptyHover
            ? "pointer"
            : "default",
        fontSize: 9,
        fontFamily: "var(--font-raleway, sans-serif)",
        fontWeight: 700,
      }}
    >
      {assignment ? getInitials(assignment.guestName) : ""}
    </button>
  );
}

function DecoIcon({ type }: { type?: DecorationType }) {
  const s = {
    size: 15,
    style: { opacity: 0.7, color: "var(--theme-primary)" },
  };
  if (type === "music") return <Music {...s} />;
  if (type === "dancing") return <Disc3 {...s} />;
  if (type === "entrance") return <DoorOpen {...s} />;
  if (type === "sweets") return <CakeSlice {...s} />;
  if (type === "buffet") return <UtensilsCrossed {...s} />;
  return <Crown {...s} />;
}

// ── ARROW BUTTON (outside EntranceDecoration to avoid "component created during render") ──
function ArrowBtn({
  d,
  dir,
  icon: Icon,
  onSetDir,
  onElementHover,
  restoreHint,
}: {
  d: EntranceDirection;
  dir: EntranceDirection | undefined;
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
  onSetDir: (d: EntranceDirection) => void;
  onElementHover?: (hint: string | null) => void;
  /** Hint to restore on mouseLeave — used so the badge falls back to the
   *  parent decoration's "Pomeri element" instead of clearing entirely. */
  restoreHint?: string | null;
}) {
  const color = dir === d
    ? "var(--theme-primary)"
    : "color-mix(in srgb, var(--theme-primary) 55%, transparent)";
  const label = d === "up" ? "gore" : d === "down" ? "dole" : d === "left" ? "levo" : "desno";
  return (
    <button
      onClick={() => onSetDir(d)}
      onMouseEnter={() => onElementHover?.(`Ulaz ${label}`)}
      onMouseLeave={() => onElementHover?.(restoreHint ?? null)}
      className="flex items-center justify-center transition-all hover:opacity-80"
      style={{ width: 28, height: 28, color }}
    >
      <Icon size={22} style={{ strokeWidth: dir === d ? 2.5 : 1.5 }} />
    </button>
  );
}

// ── ENTRANCE ELEMENT ─────────────────────────────────────────────────────────
function EntranceDecoration({
  table,
  onUpdate,
  onDelete,
  onElementHover,
  scale = 1,
}: {
  table: TableData;
  onUpdate: (id: string, changes: Partial<TableData>) => void;
  onDelete: (id: string) => void;
  onElementHover?: (hint: string | null) => void;
  scale?: number;
}) {
  const wrapperHint = "Pomeri element";
  const restoreWrapperHint = () => onElementHover?.(wrapperHint);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [labelInput, setLabelInput] = useState(table.label);

  const dir = table.entranceDirection;

  const setDir = (d: EntranceDirection) => {
    onUpdate(table.id, { entranceDirection: dir === d ? undefined : d });
  };

  const handleLabelSave = () => {
    setIsEditing(false);
    const trimmed = labelInput.trim();
    if (trimmed) onUpdate(table.id, { label: trimmed });
    else setLabelInput(table.label);
  };


  // Center box
  const box = (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--theme-primary) 10%, var(--theme-background))",
        border: "2px dashed var(--theme-primary)",
        minWidth: 140,
      }}
    >
      <DecoIcon type="entrance" />

      {isEditing ? (
        <input
          autoFocus
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          onBlur={handleLabelSave}
          onKeyDown={(e) => e.key === "Enter" && handleLabelSave()}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-raleway font-semibold bg-transparent outline-none flex-1 min-w-0"
          style={{
            color: "var(--theme-primary)",
            borderBottom: "1px solid var(--theme-primary)",
          }}
        />
      ) : (
        <span
          className="text-xs font-raleway font-semibold flex-1 cursor-text"
          style={{ color: "var(--theme-primary)" }}
          onDoubleClick={() => {
            setLabelInput(table.label);
            setIsEditing(true);
          }}
          onMouseEnter={() => onElementHover?.("Dupli klik za preimenovanje")}
          onMouseLeave={restoreWrapperHint}
        >
          {table.label}
        </span>
      )}

      <button
        onClick={() => onDelete(table.id)}
        onMouseEnter={() => onElementHover?.("Obriši element")}
        onMouseLeave={restoreWrapperHint}
        className="flex items-center justify-center w-5 h-5 rounded hover:opacity-60 transition-opacity"
        style={{ color: "var(--theme-primary)" }}
      >
        <Trash2 size={11} />
      </button>
    </div>
  );

  return (
    <div
      ref={nodeRef}
      className="absolute cursor-grab active:cursor-grabbing"
      style={{
        userSelect: "none",
        transform: `translate(${table.x}px, ${table.y}px)`,
      }}
      onPointerDown={(e) =>
        beginNodeDrag(e, {
          node: nodeRef.current,
          baseX: table.x,
          baseY: table.y,
          scale,
          ignore: "button, input",
          onCommit: (x, y) => onUpdate(table.id, { x, y }),
        })
      }
      onMouseEnter={() => onElementHover?.(wrapperHint)}
      onMouseLeave={() => onElementHover?.(null)}
    >
      {/* 3×3 grid: arrows + center box */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "28px auto 28px",
            gridTemplateRows: "28px auto 28px",
            alignItems: "center",
            justifyItems: "center",
            gap: 4,
          }}
        >
          {/* row 1 */}
          <div />
          <ArrowBtn d="up" dir={dir} icon={ArrowUp} onSetDir={setDir} onElementHover={onElementHover} restoreHint={wrapperHint} />
          <div />
          {/* row 2 */}
          <ArrowBtn d="left" dir={dir} icon={ArrowLeft} onSetDir={setDir} onElementHover={onElementHover} restoreHint={wrapperHint} />
          {box}
          <ArrowBtn d="right" dir={dir} icon={ArrowRight} onSetDir={setDir} onElementHover={onElementHover} restoreHint={wrapperHint} />
          {/* row 3 */}
          <div />
          <ArrowBtn d="down" dir={dir} icon={ArrowDown} onSetDir={setDir} onElementHover={onElementHover} restoreHint={wrapperHint} />
          <div />
        </div>
    </div>
  );
}

// ── RESIZABLE ZONE (music, dancing) ─────────────────────────────────────────
function ResizableZone({
  table,
  onUpdate,
  onDelete,
  onElementHover,
  scale = 1,
}: {
  table: TableData;
  onUpdate: (id: string, changes: Partial<TableData>) => void;
  onDelete: (id: string) => void;
  onElementHover?: (hint: string | null) => void;
  scale?: number;
}) {
  const wrapperHint = "Pomeri element";
  const restoreWrapperHint = () => onElementHover?.(wrapperHint);
  const labelHintProps = onElementHover
    ? {
        onMouseEnter: () => onElementHover("Dupli klik za preimenovanje"),
        onMouseLeave: restoreWrapperHint,
      }
    : {};
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [labelInput, setLabelInput] = useState(table.label);
  const dragStart = useRef<{
    mouseX: number;
    mouseY: number;
    w: number;
    h: number;
  } | null>(null);

  const w = table.decoWidth ?? DECO_DEFAULT_W;
  const h = table.decoHeight ?? DECO_DEFAULT_H;

  const handleLabelSave = () => {
    setIsEditing(false);
    const trimmed = labelInput.trim();
    if (trimmed) onUpdate(table.id, { label: trimmed });
    else setLabelInput(table.label);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, w, h };

    const onMove = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      const newW = Math.max(
        DECO_MIN_W,
        Math.min(
          DECO_MAX_W,
          dragStart.current.w +
            (ev.clientX - dragStart.current.mouseX) / scale,
        ),
      );
      const newH = Math.max(
        DECO_MIN_H,
        Math.min(
          DECO_MAX_H,
          dragStart.current.h +
            (ev.clientY - dragStart.current.mouseY) / scale,
        ),
      );
      onUpdate(table.id, {
        decoWidth: Math.round(newW),
        decoHeight: Math.round(newH),
      });
    };

    const onUp = () => {
      dragStart.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={nodeRef}
      className="absolute cursor-grab active:cursor-grabbing"
      style={{
        userSelect: "none",
        width: w,
        transform: `translate(${table.x}px, ${table.y}px)`,
      }}
      onPointerDown={(e) =>
        beginNodeDrag(e, {
          node: nodeRef.current,
          baseX: table.x,
          baseY: table.y,
          scale,
          ignore: "button, input, .resize-handle",
          onCommit: (x, y) => onUpdate(table.id, { x, y }),
        })
      }
      onMouseEnter={() => onElementHover?.(wrapperHint)}
      onMouseLeave={() => onElementHover?.(null)}
    >
      {/* Box — single dashed border, icon + label + delete */}
        <div
          className="relative flex flex-col rounded-lg overflow-hidden"
          style={{
            width: w,
            height: h + 40, // 40px header
            border: "2px dashed var(--theme-primary)",
            backgroundColor:
              "color-mix(in srgb, var(--theme-primary) 10%, var(--theme-background))",
          }}
        >
          {/* Header row */}
          <div className="flex items-center gap-2 px-3 py-2 shrink-0">
            <DecoIcon type={table.decorationType} />

            {isEditing ? (
              <input
                autoFocus
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onBlur={handleLabelSave}
                onKeyDown={(e) => e.key === "Enter" && handleLabelSave()}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-raleway font-semibold bg-transparent outline-none flex-1 min-w-0"
                style={{
                  color: "var(--theme-primary)",
                  borderBottom: "1px solid var(--theme-primary)",
                }}
              />
            ) : (
              <span
                className="text-xs font-raleway font-semibold flex-1 cursor-text"
                style={{ color: "var(--theme-primary)" }}
                onDoubleClick={() => {
                  setLabelInput(table.label);
                  setIsEditing(true);
                }}
                {...labelHintProps}
                    >
                {table.label}
              </span>
            )}

            <button
              onClick={() => onDelete(table.id)}
              onMouseEnter={() => onElementHover?.("Obriši element")}
              onMouseLeave={restoreWrapperHint}
              className="w-5 h-5 flex items-center justify-center rounded hover:opacity-60 transition-opacity"
              style={{ color: "var(--theme-primary)" }}
            >
              <Trash2 size={11} />
            </button>
          </div>

          {/* Resize handle — bottom-right corner */}
          <div
            className="resize-handle absolute bottom-0 right-0 w-4 h-4"
            onMouseDown={handleResizeMouseDown}
            style={{ cursor: "nwse-resize" }}
          >
            {/* Three diagonal lines (classic resize indicator) */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                opacity: 0.45,
                color: "var(--theme-primary)",
              }}
            >
              <line
                x1="4"
                y1="12"
                x2="12"
                y2="4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="8"
                y1="12"
                x2="12"
                y2="8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="12"
                x2="12"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
    </div>
  );
}

// ── HALL OUTLINE (wall) ─────────────────────────────────────────────────────
/**
 * The hall perimeter: a border-only rectangle that tables sit inside.
 *
 * Its whole area would otherwise swallow every click meant for a table inside
 * it, so the wrapper is `pointerEvents: "none"` and only the four edge strips,
 * the corner resize handle and the label chip take pointer events back. The
 * node also never bumps `TABLE_Z_SEQ` — the outline must stay behind the tables.
 */
function WallOutline({
  table,
  onUpdate,
  onDelete,
  onElementHover,
  scale = 1,
  readOnly,
}: {
  table: TableData;
  onUpdate: (id: string, changes: Partial<TableData>) => void;
  onDelete: (id: string) => void;
  onElementHover?: (hint: string | null) => void;
  scale?: number;
  readOnly?: boolean;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [labelInput, setLabelInput] = useState(table.label);
  const dragStart = useRef<{
    mouseX: number;
    mouseY: number;
    w: number;
    h: number;
  } | null>(null);

  const w = table.decoWidth ?? WALL_DEFAULT_W;
  const h = table.decoHeight ?? WALL_DEFAULT_H;
  const border = "3px solid color-mix(in srgb, var(--theme-text) 45%, transparent)";

  const handleLabelSave = () => {
    setIsEditing(false);
    const trimmed = labelInput.trim();
    if (trimmed) onUpdate(table.id, { label: trimmed });
    else setLabelInput(table.label);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, w, h };

    const onMove = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      const newW = Math.max(
        WALL_MIN_W,
        Math.min(
          WALL_MAX_W,
          dragStart.current.w + (ev.clientX - dragStart.current.mouseX) / scale,
        ),
      );
      const newH = Math.max(
        WALL_MIN_H,
        Math.min(
          WALL_MAX_H,
          dragStart.current.h + (ev.clientY - dragStart.current.mouseY) / scale,
        ),
      );
      onUpdate(table.id, {
        decoWidth: Math.round(newW),
        decoHeight: Math.round(newH),
      });
    };

    const onUp = () => {
      dragStart.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // The frame itself is inert; only the strips below accept the pointer.
  const frame = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        border,
        borderRadius: 6,
        pointerEvents: "none",
      }}
    />
  );

  if (readOnly) {
    return (
      <div
        className="absolute"
        style={{
          left: table.x,
          top: table.y,
          width: w,
          height: h,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {frame}
      </div>
    );
  }

  const startDrag = (e: React.PointerEvent) =>
    beginNodeDrag(e, {
      node: nodeRef.current,
      baseX: table.x,
      baseY: table.y,
      scale,
      ignore: "button, input, .resize-handle",
      onCommit: (x, y) => onUpdate(table.id, { x, y }),
    });

  const edges: React.CSSProperties[] = [
    { left: 0, top: -WALL_GRIP / 2, width: w, height: WALL_GRIP },
    { left: 0, top: h - WALL_GRIP / 2, width: w, height: WALL_GRIP },
    { left: -WALL_GRIP / 2, top: 0, width: WALL_GRIP, height: h },
    { left: w - WALL_GRIP / 2, top: 0, width: WALL_GRIP, height: h },
  ];

  return (
    <div
      ref={nodeRef}
      className="absolute"
      style={{
        userSelect: "none",
        width: w,
        height: h,
        // Keep the outline below every table. Tables use z-index auto until they
        // are hovered, at which point they jump to TABLE_Z_SEQ (10 and up).
        zIndex: 0,
        transform: `translate(${table.x}px, ${table.y}px)`,
        // Interior clicks must reach the tables inside the hall.
        pointerEvents: "none",
      }}
    >
      {frame}

      {edges.map((pos, i) => (
        <div
          key={i}
          className="absolute cursor-grab active:cursor-grabbing"
          style={{ ...pos, pointerEvents: "auto" }}
          onPointerDown={startDrag}
          onMouseEnter={() => onElementHover?.("Pomeri zidove sale")}
          onMouseLeave={() => onElementHover?.(null)}
        />
      ))}

      {/* Label chip — sits above the top edge so it never covers a table */}
      <div
        className="absolute flex items-center gap-1.5 px-2 py-1 rounded"
        style={{
          left: 0,
          top: -30,
          pointerEvents: "auto",
          backgroundColor: "var(--theme-surface)",
          border: "1px solid var(--theme-border-light)",
        }}
      >
        {isEditing ? (
          <input
            autoFocus
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onBlur={handleLabelSave}
            onKeyDown={(e) => e.key === "Enter" && handleLabelSave()}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] font-raleway font-semibold bg-transparent outline-none w-28"
            style={{
              color: "var(--theme-text)",
              borderBottom: "1px solid var(--theme-primary)",
            }}
          />
        ) : (
          <span
            className="text-[11px] font-raleway font-semibold cursor-text"
            style={{ color: "var(--theme-text-light)" }}
            onDoubleClick={() => {
              setLabelInput(table.label);
              setIsEditing(true);
            }}
            onMouseEnter={() =>
              onElementHover?.("Dupli klik za preimenovanje")
            }
            onMouseLeave={() => onElementHover?.(null)}
          >
            {table.label}
          </span>
        )}
        <span
          className="text-[10px] font-raleway"
          style={{ color: "var(--theme-text-light)", opacity: 0.7 }}
        >
          {Math.round(w)}×{Math.round(h)}
        </span>
        <button
          onClick={() => onDelete(table.id)}
          onMouseEnter={() => onElementHover?.("Obriši zidove")}
          onMouseLeave={() => onElementHover?.(null)}
          className="w-4 h-4 flex items-center justify-center rounded hover:opacity-60 transition-opacity"
          style={{ color: "var(--theme-primary)" }}
        >
          <Trash2 size={10} />
        </button>
      </div>

      {/* Resize handle — bottom-right corner, after the edges so it wins */}
      <div
        className="resize-handle absolute"
        onMouseDown={handleResizeMouseDown}
        onMouseEnter={() => onElementHover?.("Promeni veličinu sale")}
        onMouseLeave={() => onElementHover?.(null)}
        style={{
          left: w - 18,
          top: h - 18,
          width: 22,
          height: 22,
          pointerEvents: "auto",
          cursor: "nwse-resize",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          style={{
            position: "absolute",
            bottom: 2,
            right: 2,
            opacity: 0.5,
            color: "var(--theme-text)",
          }}
        >
          <line x1="4" y1="12" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="12" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
interface Props {
  table: TableData;
  selectedGuest: RSVPEntry | null;
  onSeatClick: (tableId: string, seatIndex: number) => void;
  onSeatHover?: (assignment: SeatAssignment | null) => void;
  /** `"{tableId}:{seatIndex}"` keys the seat-search is currently highlighting. */
  highlightedSeats?: ReadonlySet<string>;
  /** Starts a move-drag from an occupied seat. Omitted where dragging is off. */
  onSeatDragStart?: (
    e: React.PointerEvent,
    source: SeatRef,
    assignment: SeatAssignment,
  ) => void;
  /** Pointer entered (`el`) or left (`null`) a FREE seat. Anchors the hover
   *  guest-picker; the editor passes it only while no guest is picked up. */
  onEmptySeatHover?: (
    tableId: string,
    seatIndex: number,
    el: HTMLElement | null,
    immediate?: boolean,
  ) => void;
  /** Replaces the cursor badge primary line with the given hint while hovering
   *  non-seat interactive elements (grab handle, rotate, label, entrance arrow). */
  onElementHover?: (hint: string | null) => void;
  onUpdate: (id: string, changes: Partial<TableData>) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
  onTap?: (table: TableData) => void;
  /** Canvas zoom; passed to react-draggable so drag tracks the cursor 1:1. */
  scale?: number;
}

export default function TableNode({
  table,
  selectedGuest,
  onSeatClick,
  onSeatHover,
  highlightedSeats,
  onSeatDragStart,
  onEmptySeatHover,
  onElementHover,
  onUpdate,
  onDelete,
  readOnly,
  onTap,
  scale = 1,
}: Props) {
  const nodeRef = useRef<HTMLDivElement>(null);
  // Bring this table above the others by bumping its z-index directly on the
  // DOM node — no setState, so hovering/grabbing a table never re-renders the
  // rest of the canvas.
  const raiseSelf = () => {
    if (nodeRef.current) nodeRef.current.style.zIndex = String(++TABLE_Z_SEQ);
  };
  const [isEditing, setIsEditing] = useState(false);
  const [labelInput, setLabelInput] = useState(table.label);
  const isSelecting = readOnly ? false : !!selectedGuest;
  const seatClick = readOnly ? () => {} : onSeatClick;
  const seatHover = readOnly ? undefined : onSeatHover;
  const emptySeatHover = readOnly ? undefined : onEmptySeatHover;
  const elementHover = readOnly ? undefined : onElementHover;
  /** Every seat layout below repeats the same four props; only the index moves. */
  const seatDragStart = readOnly ? undefined : onSeatDragStart;
  const seatProps = (i: number) => ({
    tableId: table.id,
    seatIndex: i,
    onClick: () => seatClick(table.id, i),
    onHover: seatHover,
    isSelecting,
    highlighted: highlightedSeats?.has(`${table.id}:${i}`),
    onDragStart: seatDragStart
      ? (e: React.PointerEvent) => {
          const a = table.assignments[i];
          if (a) seatDragStart(e, { tableId: table.id, seatIndex: i }, a);
        }
      : undefined,
    onEmptyHover: emptySeatHover
      ? (el: HTMLElement | null, immediate?: boolean) =>
          emptySeatHover(table.id, i, el, immediate)
      : undefined,
  });
  const labelHintProps = elementHover
    ? {
        onMouseEnter: () => elementHover("Dupli klik za preimenovanje"),
        onMouseLeave: () => elementHover(null),
      }
    : {};

  // ── Route to specialised decoration components ───────────────────────────
  if (table.type === "decoration") {
    // The hall outline handles its own read-only rendering — it must stay a
    // border-only rectangle, never collapse to a label chip like the zones do.
    if (table.decorationType === "wall") {
      return (
        <WallOutline
          table={table}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onElementHover={elementHover}
          scale={scale}
          readOnly={readOnly}
        />
      );
    }
    if (readOnly) {
      // Simple positioned label for decorations in read-only mode
      const dw = table.decorationType === "entrance" ? 140 : (table.decoWidth ?? DECO_DEFAULT_W);
      return (
        <div className="absolute" style={{ left: table.x, top: table.y, userSelect: "none" }}>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded"
            style={{
              backgroundColor: "color-mix(in srgb, var(--theme-primary) 10%, var(--theme-background))",
              border: "2px dashed var(--theme-primary)",
              width: dw,
            }}
          >
            <DecoIcon type={table.decorationType} />
            <span className="text-xs font-raleway font-semibold" style={{ color: "var(--theme-primary)" }}>
              {table.label}
            </span>
          </div>
        </div>
      );
    }
    if (table.decorationType === "entrance") {
      return (
        <EntranceDecoration
          table={table}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onElementHover={elementHover}
          scale={scale}
        />
      );
    }
    return (
      <ResizableZone table={table} onUpdate={onUpdate} onDelete={onDelete} onElementHover={elementHover} scale={scale} />
    );
  }

  // ── Seating tables ────────────────────────────────────────────────────────
  const seatsPerRow =
    table.type === "rectangular" ? table.seats / 2 : table.seats;

  const handleLabelSave = () => {
    setIsEditing(false);
    const trimmed = labelInput.trim();
    if (trimmed) onUpdate(table.id, { label: trimmed });
    else setLabelInput(table.label);
  };

  const changeSeats = (delta: 1 | -1) => {
    let next: number;
    if (table.type === "circle") {
      next = Math.max(8, Math.min(14, table.seats + delta));
    } else if (table.type === "single-sided") {
      next = Math.max(2, Math.min(12, table.seats + delta));
    } else {
      next = Math.max(4, Math.min(20, table.seats + delta * 2));
    }
    let newAssignments: (SeatAssignment | null)[];
    if (next >= table.assignments.length) {
      // Growing: keep everyone in place, pad with empty seats.
      newAssignments = [
        ...table.assignments,
        ...Array(next - table.assignments.length).fill(null),
      ];
    } else {
      // Shrinking: drop empty seats first (from the end), and only remove
      // assigned guests if there aren't enough empty seats to remove.
      newAssignments = [...table.assignments];
      let toRemove = newAssignments.length - next;
      for (let i = newAssignments.length - 1; i >= 0 && toRemove > 0; i--) {
        if (newAssignments[i] === null) {
          newAssignments.splice(i, 1);
          toRemove--;
        }
      }
      while (toRemove > 0) {
        newAssignments.pop();
        toRemove--;
      }
    }
    onUpdate(table.id, { seats: next, assignments: newAssignments });
  };

  const isRotated =
    (table.type === "rectangular" || table.type === "single-sided") &&
    !!table.rotated;

  const landscapeWidth = Math.max(160, seatsPerRow * (SEAT_SIZE + 6) - 6 + 32);
  // Portrait width = landscape total height:
  //   header(28) + pt-2(8) + seats(30) + gap(8) + surface-h10(40) + gap(8) + seats(30) + pb-3(12) = 164
  const LANDSCAPE_HEIGHT = 28 + 8 + SEAT_SIZE + 8 + 40 + 8 + SEAT_SIZE + 12;

  const cardWidth =
    table.type === "circle"
      ? (SEAT_ORBIT_R + SEAT_SIZE / 2 + 6) * 2
      : table.type === "single-sided"
        ? isRotated
          ? SEAT_SIZE + 8 + 60 + 16 // seat column + gap + surface + px-2*2
          : Math.max(160, table.seats * (SEAT_SIZE + 6) - 6 + 32)
        : isRotated
          ? LANDSCAPE_HEIGHT
          : landscapeWidth;

  const labelEl = isEditing ? (
    <input
      autoFocus
      value={labelInput}
      onChange={(e) => setLabelInput(e.target.value)}
      onBlur={handleLabelSave}
      onKeyDown={(e) => e.key === "Enter" && handleLabelSave()}
      onClick={(e) => e.stopPropagation()}
      className="text-xs font-raleway font-medium bg-transparent outline-none border-b border-white/50 text-white flex-1 min-w-0"
    />
  ) : (
    <span
      className="text-xs font-raleway font-medium truncate flex-1 cursor-text"
      onDoubleClick={() => {
        setLabelInput(table.label);
        setIsEditing(true);
      }}
      {...labelHintProps}
    >
      {table.label}
    </span>
  );

  const seatControls = (
    <div className="flex items-center gap-0.5 shrink-0">
      <button
        onClick={() => changeSeats(-1)}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20"
      >
        <Minus size={9} />
      </button>
      <span className="text-[10px] font-raleway w-4 text-center">
        {table.seats}
      </span>
      <button
        onClick={() => changeSeats(1)}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20"
      >
        <Plus size={9} />
      </button>
    </div>
  );

  const grabHandle = (
    <span
      className="shrink-0 flex items-center opacity-60 hover:opacity-100 transition-opacity"
      style={{ cursor: "grab" }}
      onMouseEnter={() => elementHover?.("Pomeri sto")}
      onMouseLeave={() => elementHover?.(null)}
    >
      <GripVertical size={12} />
    </span>
  );

  const rotateBtn =
    table.type === "rectangular" || table.type === "single-sided" ? (
      <button
        onClick={() => onUpdate(table.id, { rotated: !table.rotated })}
        onMouseEnter={() => elementHover?.("Rotiraj sto")}
        onMouseLeave={() => elementHover?.(null)}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20"
        style={{ opacity: isRotated ? 1 : 0.6 }}
      >
        <RotateCw size={9} />
      </button>
    ) : null;

  // Single-sided: flip the seats to the opposite side of the table surface.
  const flipBtn =
    table.type === "single-sided" ? (
      <button
        onClick={() => onUpdate(table.id, { flipped: !table.flipped })}
        onMouseEnter={() => elementHover?.("Promeni stranu stolica")}
        onMouseLeave={() => elementHover?.(null)}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20"
        style={{ opacity: table.flipped ? 1 : 0.6 }}
      >
        {isRotated ? (
          <FlipHorizontal2 size={9} />
        ) : (
          <FlipVertical2 size={9} />
        )}
      </button>
    ) : null;

  const deleteBtn = (
    <button
      onClick={() => onDelete(table.id)}
      onMouseEnter={() => elementHover?.("Obriši sto")}
      onMouseLeave={() => elementHover?.(null)}
      className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20"
    >
      <Trash2 size={9} />
    </button>
  );

  // Table name shown in the middle of the table surface (circle/rectangular).
  const centerName = (
    <span
      className="font-raleway font-semibold truncate text-center px-1"
      style={{
        color: "rgba(35,35,35,0.6)",
        fontSize: 12,
        maxWidth: "92%",
        pointerEvents: "none",
      }}
    >
      {table.label}
    </span>
  );

  // Landscape rectangular: [− count +] [label] [↻] [🗑]
  // Portrait rectangular: row1 [− count + ↻ 🗑], row2 [label]
  // All others: [label] [− count +] [🗑]
  const header =
    table.type === "rectangular" || table.type === "single-sided" ? (
      <div
        className="drag-handle rounded-t-lg cursor-grab active:cursor-grabbing table-header transition-opacity duration-150"
        style={{ backgroundColor: "#8a8a8a", color: "white", opacity: 0 }}
      >
        {isRotated ? (
          // Portrait: two rows
          <>
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-1.5">
                {grabHandle}
                {seatControls}
              </div>
              <div className="flex items-center gap-0.5">
                {flipBtn}
                {rotateBtn}
                {deleteBtn}
              </div>
            </div>
            <div className="flex items-center px-2 pb-1">{labelEl}</div>
          </>
        ) : (
          // Landscape: single row, controls first
          <div className="flex items-center gap-1.5 px-2 py-1">
            {grabHandle}
            {seatControls}
            <div className="w-px h-3 bg-white/30 shrink-0" />
            {labelEl}
            <div className="flex items-center gap-0.5 shrink-0 ml-auto">
              {flipBtn}
              {rotateBtn}
              {deleteBtn}
            </div>
          </div>
        )}
      </div>
    ) : (
      // Circle: count first, then name
      <div
        className="drag-handle flex items-center gap-1.5 px-2 py-1 rounded-t-lg cursor-grab active:cursor-grabbing table-header transition-opacity duration-150"
        style={{ backgroundColor: "#8a8a8a", color: "white", opacity: 0 }}
      >
        {grabHandle}
        {seatControls}
        <div className="w-px h-3 bg-white/30 shrink-0" />
        {labelEl}
        <div className="flex items-center gap-0.5 shrink-0 ml-auto">
          {deleteBtn}
        </div>
      </div>
    );

  return (
      <div
        ref={nodeRef}
        className="absolute table-node-card"
        style={{
          width: cardWidth,
          userSelect: "none",
          borderRadius: 8,
          transition: "background-color 150ms",
          transform: `translate(${table.x}px, ${table.y}px)`,
          // Whole body is draggable (seats/buttons are excluded via the drag
          // helper's `ignore`), so a table buried under another can be grabbed
          // by its center.
          cursor: readOnly ? "pointer" : "grab",
        }}
        onPointerDown={
          readOnly
            ? undefined
            : (e) =>
                beginNodeDrag(e, {
                  node: nodeRef.current,
                  baseX: table.x,
                  baseY: table.y,
                  scale,
                  ignore: "button, input",
                  onCommit: (x, y) => onUpdate(table.id, { x, y }),
                  onStart: raiseSelf,
                })
        }
        onClick={readOnly && onTap ? () => onTap(table) : undefined}
        onMouseEnter={readOnly ? undefined : (e) => {
          e.currentTarget.style.backgroundColor = "rgba(35,35,35,0.09)";
          e.currentTarget.querySelectorAll<HTMLElement>(".table-header").forEach(el => el.style.opacity = "1");
          // Pointing at a table raises it above the others — so a table buried
          // under another pops to the top (header + frame) the moment you hover
          // its visible part. Pure DOM, no re-render.
          raiseSelf();
        }}
        onMouseLeave={readOnly ? undefined : (e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.querySelectorAll<HTMLElement>(".table-header").forEach(el => el.style.opacity = "0");
        }}
      >
        {readOnly ? (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-t-lg"
            style={{ backgroundColor: "#8a8a8a", color: "white" }}
          >
            <span className="text-xs font-raleway font-medium truncate flex-1">{table.label}</span>
            <span className="text-[10px] font-raleway opacity-70">{table.assignments.filter(Boolean).length}/{table.seats}</span>
          </div>
        ) : header}

        {/* RECTANGULAR — landscape */}
        {table.type === "rectangular" && !isRotated && (
          <div className="px-3 pt-2 pb-3">
            <div className="flex gap-1.5 justify-center mb-2">
              {table.assignments.slice(0, seatsPerRow).map((a, i) => (
                <Seat key={i} assignment={a} {...seatProps(i)} />
              ))}
            </div>
            <div
              className="h-15 rounded flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor:
                  "rgba(35,35,35,0.09)",
                border: "3px solid rgba(35,35,35,0.45)",
              }}
            >
              {centerName}
            </div>
            <div className="flex gap-1.5 justify-center mt-2">
              {table.assignments.slice(seatsPerRow).map((a, i) => (
                <Seat
                  key={seatsPerRow + i}
                  assignment={a}
                  {...seatProps(seatsPerRow + i)}
                />
              ))}
            </div>
          </div>
        )}

        {/* RECTANGULAR — portrait (rotated 90°) */}
        {table.type === "rectangular" && isRotated && (
          <div className="flex items-start justify-center gap-2 px-2 pt-2 pb-2">
            {/* Left column */}
            <div className="flex flex-col gap-1.5">
              {table.assignments.slice(0, seatsPerRow).map((a, i) => (
                <Seat key={i} assignment={a} {...seatProps(i)} />
              ))}
            </div>
            {/* Table surface — fixed 40px wide, matching landscape h-10 thickness */}
            <div
              className="rounded flex items-center justify-center overflow-hidden"
              style={{
                width: 60,
                minHeight: seatsPerRow * (SEAT_SIZE + 6) - 6,
                backgroundColor:
                  "rgba(35,35,35,0.09)",
                border: "3px solid rgba(35,35,35,0.45)",
              }}
            >
              <span
                className="font-raleway font-semibold text-center px-1"
                style={{
                  color: "rgba(35,35,35,0.6)",
                  fontSize: 11,
                  pointerEvents: "none",
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  maxHeight: "92%",
                  overflow: "hidden",
                }}
              >
                {table.label}
              </span>
            </div>
            {/* Right column */}
            <div className="flex flex-col gap-1.5">
              {table.assignments.slice(seatsPerRow).map((a, i) => (
                <Seat
                  key={seatsPerRow + i}
                  assignment={a}
                  {...seatProps(seatsPerRow + i)}
                />
              ))}
            </div>
          </div>
        )}

        {/* SINGLE-SIDED */}
        {table.type === "single-sided" && !isRotated && (
          <div
            className={`px-3 pt-2 pb-3 flex flex-col ${
              table.flipped ? "flex-col-reverse" : ""
            }`}
          >
            <div
              className={`flex gap-1.5 justify-center ${
                table.flipped ? "mt-2" : "mb-2"
              }`}
            >
              {table.assignments.map((a, i) => (
                <Seat key={i} assignment={a} {...seatProps(i)} />
              ))}
            </div>
            <div
              className="h-15 rounded"
              style={{
                backgroundColor:
                  "rgba(35,35,35,0.09)",
                border: "3px solid rgba(35,35,35,0.45)",
              }}
            />
          </div>
        )}

        {/* SINGLE-SIDED — portrait (rotated 90°): one seat column + surface */}
        {table.type === "single-sided" && isRotated && (
          <div
            className={`flex items-start justify-center gap-2 px-2 pt-2 pb-2 ${
              table.flipped ? "flex-row-reverse" : ""
            }`}
          >
            <div className="flex flex-col gap-1.5">
              {table.assignments.map((a, i) => (
                <Seat key={i} assignment={a} {...seatProps(i)} />
              ))}
            </div>
            <div
              className="rounded"
              style={{
                width: 60,
                minHeight: table.seats * (SEAT_SIZE + 6) - 6,
                backgroundColor: "rgba(35,35,35,0.09)",
                border: "3px solid rgba(35,35,35,0.45)",
              }}
            />
          </div>
        )}

        {/* CIRCLE */}
        {table.type === "circle" && (
          <div
            className="relative"
            style={{ width: cardWidth, height: cardWidth }}
          >
            <div
              className="absolute rounded-full flex items-center justify-center overflow-hidden"
              style={{
                width: CIRCLE_TABLE_R * 2,
                height: CIRCLE_TABLE_R * 2,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor:
                  "rgba(35,35,35,0.09)",
                border: "3px solid rgba(35,35,35,0.45)",
              }}
            >
              {centerName}
            </div>
            {table.assignments.map((a, i) => {
              const angle = (2 * Math.PI * i) / table.seats - Math.PI / 2;
              const cx = cardWidth / 2,
                cy = cardWidth / 2;
              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: cx + SEAT_ORBIT_R * Math.cos(angle) - SEAT_SIZE / 2,
                    top: cy + SEAT_ORBIT_R * Math.sin(angle) - SEAT_SIZE / 2,
                  }}
                >
                  <Seat assignment={a} {...seatProps(i)} />
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
}
