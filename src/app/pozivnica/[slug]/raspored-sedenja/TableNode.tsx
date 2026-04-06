"use client";

import { useRef, useState } from "react";
import Draggable from "react-draggable";
import {
  Trash2,
  Plus,
  Minus,
  RotateCw,
  Music,
  DoorOpen,
  Crown,
  Disc3,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  GripVertical,
} from "lucide-react";
import type { RSVPEntry } from "@/lib/rsvp";
import type {
  TableData,
  SeatAssignment,
  DecorationType,
  EntranceDirection,
} from "./types";

const SEAT_SIZE = 30;
const CIRCLE_TABLE_R = 52;
const SEAT_ORBIT_R = CIRCLE_TABLE_R + 16;

// Defaults for resizable zones
const DECO_DEFAULT_W = 160;
const DECO_DEFAULT_H = 80;
const DECO_STEP = 20;
const DECO_MIN_W = 100;
const DECO_MAX_W = 500;
const DECO_MIN_H = 60;
const DECO_MAX_H = 400;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Seat({
  assignment,
  onClick,
  isSelecting,
}: {
  assignment: SeatAssignment | null;
  onClick: () => void;
  isSelecting: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={
        assignment
          ? `${assignment.guestName} — klikni za uklanjanje`
          : isSelecting
            ? "Dodeli mesto"
            : ""
      }
      className="rounded-full flex items-center justify-center transition-all"
      style={{
        width: SEAT_SIZE,
        height: SEAT_SIZE,
        flexShrink: 0,
        backgroundColor: assignment
          ? "var(--theme-primary)"
          : isSelecting
            ? "color-mix(in srgb, var(--theme-primary) 15%, transparent)"
            : "var(--theme-background)",
        border: assignment
          ? "2px solid var(--theme-primary)"
          : isSelecting
            ? "2px dashed var(--theme-primary)"
            : "2px solid color-mix(in srgb, var(--theme-primary) 25%, transparent)",
        color: assignment ? "white" : "var(--theme-text-light)",
        cursor: assignment || isSelecting ? "pointer" : "default",
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
  return <Crown {...s} />;
}

// ── ARROW BUTTON (outside EntranceDecoration to avoid "component created during render") ──
function ArrowBtn({
  d,
  dir,
  icon: Icon,
  onSetDir,
}: {
  d: EntranceDirection;
  dir: EntranceDirection | undefined;
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
  onSetDir: (d: EntranceDirection) => void;
}) {
  const color = dir === d
    ? "var(--theme-primary)"
    : "color-mix(in srgb, var(--theme-primary) 30%, transparent)";
  const label = d === "up" ? "gore" : d === "down" ? "dole" : d === "left" ? "levo" : "desno";
  return (
    <button
      onClick={() => onSetDir(d)}
      className="flex items-center justify-center transition-all hover:opacity-80"
      style={{ width: 28, height: 28, color }}
      title={`Ulaz ${label}`}
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
}: {
  table: TableData;
  onUpdate: (id: string, changes: Partial<TableData>) => void;
  onDelete: (id: string) => void;
}) {
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
          "color-mix(in srgb, var(--theme-primary) 2%, var(--theme-background))",
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
          title="Dupli klik za preimenovanje"
        >
          {table.label}
        </span>
      )}

      <button
        onClick={() => onDelete(table.id)}
        className="flex items-center justify-center w-5 h-5 rounded hover:opacity-60 transition-opacity"
        style={{ color: "var(--theme-primary)" }}
      >
        <Trash2 size={11} />
      </button>
    </div>
  );

  return (
    <Draggable
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
      defaultPosition={{ x: table.x, y: table.y }}
      onStop={(_, data) => onUpdate(table.id, { x: data.x, y: data.y })}
      cancel="button, input"
    >
      <div
        ref={nodeRef}
        className="absolute cursor-grab active:cursor-grabbing"
        style={{ userSelect: "none" }}
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
          <ArrowBtn d="up" dir={dir} icon={ArrowUp} onSetDir={setDir} />
          <div />
          {/* row 2 */}
          <ArrowBtn d="left" dir={dir} icon={ArrowLeft} onSetDir={setDir} />
          {box}
          <ArrowBtn d="right" dir={dir} icon={ArrowRight} onSetDir={setDir} />
          {/* row 3 */}
          <div />
          <ArrowBtn d="down" dir={dir} icon={ArrowDown} onSetDir={setDir} />
          <div />
        </div>
      </div>
    </Draggable>
  );
}

// ── RESIZABLE ZONE (music, dancing) ─────────────────────────────────────────
function ResizableZone({
  table,
  onUpdate,
  onDelete,
}: {
  table: TableData;
  onUpdate: (id: string, changes: Partial<TableData>) => void;
  onDelete: (id: string) => void;
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
          dragStart.current.w + (ev.clientX - dragStart.current.mouseX),
        ),
      );
      const newH = Math.max(
        DECO_MIN_H,
        Math.min(
          DECO_MAX_H,
          dragStart.current.h + (ev.clientY - dragStart.current.mouseY),
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
    <Draggable
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
      defaultPosition={{ x: table.x, y: table.y }}
      onStop={(_, data) => onUpdate(table.id, { x: data.x, y: data.y })}
      cancel="button, input, .resize-handle"
    >
      <div
        ref={nodeRef}
        className="absolute cursor-grab active:cursor-grabbing"
        style={{ userSelect: "none", width: w }}
      >
        {/* Box — single dashed border, icon + label + delete */}
        <div
          className="relative flex flex-col rounded-lg overflow-hidden"
          style={{
            width: w,
            height: h + 40, // 40px header
            border: "2px dashed var(--theme-primary)",
            backgroundColor:
              "color-mix(in srgb, var(--theme-primary) 2%, var(--theme-background))",
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
                title="Dupli klik za preimenovanje"
              >
                {table.label}
              </span>
            )}

            <button
              onClick={() => onDelete(table.id)}
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
    </Draggable>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
interface Props {
  table: TableData;
  selectedGuest: RSVPEntry | null;
  onSeatClick: (tableId: string, seatIndex: number) => void;
  onUpdate: (id: string, changes: Partial<TableData>) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
  onTap?: (table: TableData) => void;
}

export default function TableNode({
  table,
  selectedGuest,
  onSeatClick,
  onUpdate,
  onDelete,
  readOnly,
  onTap,
}: Props) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [labelInput, setLabelInput] = useState(table.label);
  const isSelecting = readOnly ? false : !!selectedGuest;
  const seatClick = readOnly ? () => {} : onSeatClick;

  // ── Route to specialised decoration components ───────────────────────────
  if (table.type === "decoration") {
    if (readOnly) {
      // Simple positioned label for decorations in read-only mode
      const dw = table.decorationType === "entrance" ? 140 : (table.decoWidth ?? DECO_DEFAULT_W);
      return (
        <div className="absolute" style={{ left: table.x, top: table.y, userSelect: "none" }}>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded"
            style={{
              backgroundColor: "color-mix(in srgb, var(--theme-primary) 2%, var(--theme-background))",
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
        />
      );
    }
    return (
      <ResizableZone table={table} onUpdate={onUpdate} onDelete={onDelete} />
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
      next = Math.max(8, Math.min(12, table.seats + delta));
    } else {
      next = Math.max(4, Math.min(20, table.seats + delta * 2));
    }
    const newAssignments: (SeatAssignment | null)[] = Array(next).fill(null);
    for (let i = 0; i < Math.min(table.assignments.length, next); i++) {
      newAssignments[i] = table.assignments[i];
    }
    onUpdate(table.id, { seats: next, assignments: newAssignments });
  };

  const isRotated = table.type === "rectangular" && !!table.rotated;

  const landscapeWidth = Math.max(160, seatsPerRow * (SEAT_SIZE + 6) - 6 + 32);
  // Portrait width = landscape total height:
  //   header(28) + pt-2(8) + seats(30) + gap(8) + surface-h10(40) + gap(8) + seats(30) + pb-3(12) = 164
  const LANDSCAPE_HEIGHT = 28 + 8 + SEAT_SIZE + 8 + 40 + 8 + SEAT_SIZE + 12;

  const cardWidth =
    table.type === "circle"
      ? (SEAT_ORBIT_R + SEAT_SIZE / 2 + 6) * 2
      : table.type === "single-sided"
        ? Math.max(160, table.seats * (SEAT_SIZE + 6) - 6 + 32)
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
      title="Dupli klik za preimenovanje"
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
      title="Pomeri sto"
    >
      <GripVertical size={12} />
    </span>
  );

  const rotateBtn =
    table.type === "rectangular" ? (
      <button
        onClick={() => onUpdate(table.id, { rotated: !table.rotated })}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20"
        title="Rotiraj sto"
        style={{ opacity: isRotated ? 1 : 0.6 }}
      >
        <RotateCw size={9} />
      </button>
    ) : null;

  const deleteBtn = (
    <button
      onClick={() => onDelete(table.id)}
      className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20"
    >
      <Trash2 size={9} />
    </button>
  );

  // Landscape rectangular: [− count +] [label] [↻] [🗑]
  // Portrait rectangular: row1 [− count + ↻ 🗑], row2 [label]
  // All others: [label] [− count +] [🗑]
  const header =
    table.type === "rectangular" ? (
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
              {rotateBtn}
              {deleteBtn}
            </div>
          </div>
        )}
      </div>
    ) : (
      // Circle / single-sided: count first, then name
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
    <Draggable
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
      defaultPosition={{ x: table.x, y: table.y }}
      onStop={(_, data) => onUpdate(table.id, { x: data.x, y: data.y })}
      handle=".drag-handle"
      cancel="button, input"
      disabled={readOnly}
    >
      <div
        ref={nodeRef}
        className="absolute table-node-card"
        style={{
          width: cardWidth,
          userSelect: "none",
          borderRadius: 8,
          transition: "background-color 150ms",
          cursor: readOnly ? "pointer" : undefined,
        }}
        onClick={readOnly && onTap ? () => onTap(table) : undefined}
        onMouseEnter={readOnly ? undefined : (e) => {
          e.currentTarget.style.backgroundColor = "rgba(35,35,35,0.04)";
          e.currentTarget.querySelectorAll<HTMLElement>(".table-header").forEach(el => el.style.opacity = "1");
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
                <Seat
                  key={i}
                  assignment={a}
                  onClick={() => seatClick(table.id, i)}
                  isSelecting={isSelecting}
                />
              ))}
            </div>
            <div
              className="h-15 rounded"
              style={{
                backgroundColor:
                  "rgba(35,35,35,0.04)",
                border: "3px solid rgba(35,35,35,0.15)",
              }}
            />
            <div className="flex gap-1.5 justify-center mt-2">
              {table.assignments.slice(seatsPerRow).map((a, i) => (
                <Seat
                  key={seatsPerRow + i}
                  assignment={a}
                  onClick={() => seatClick(table.id, seatsPerRow + i)}
                  isSelecting={isSelecting}
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
                <Seat
                  key={i}
                  assignment={a}
                  onClick={() => seatClick(table.id, i)}
                  isSelecting={isSelecting}
                />
              ))}
            </div>
            {/* Table surface — fixed 40px wide, matching landscape h-10 thickness */}
            <div
              className="rounded"
              style={{
                width: 60,
                minHeight: seatsPerRow * (SEAT_SIZE + 6) - 6,
                backgroundColor:
                  "rgba(35,35,35,0.04)",
                border: "3px solid rgba(35,35,35,0.15)",
              }}
            />
            {/* Right column */}
            <div className="flex flex-col gap-1.5">
              {table.assignments.slice(seatsPerRow).map((a, i) => (
                <Seat
                  key={seatsPerRow + i}
                  assignment={a}
                  onClick={() => seatClick(table.id, seatsPerRow + i)}
                  isSelecting={isSelecting}
                />
              ))}
            </div>
          </div>
        )}

        {/* SINGLE-SIDED */}
        {table.type === "single-sided" && (
          <div className="px-3 pt-2 pb-3">
            <div className="flex gap-1.5 justify-center mb-2">
              {table.assignments.map((a, i) => (
                <Seat
                  key={i}
                  assignment={a}
                  onClick={() => seatClick(table.id, i)}
                  isSelecting={isSelecting}
                />
              ))}
            </div>
            <div
              className="h-15 rounded"
              style={{
                backgroundColor:
                  "rgba(35,35,35,0.04)",
                border: "3px solid rgba(35,35,35,0.15)",
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
              className="absolute rounded-full"
              style={{
                width: CIRCLE_TABLE_R * 2,
                height: CIRCLE_TABLE_R * 2,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor:
                  "rgba(35,35,35,0.04)",
                border: "3px solid rgba(35,35,35,0.15)",
              }}
            />
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
                  <Seat
                    assignment={a}
                    onClick={() => seatClick(table.id, i)}
                    isSelecting={isSelecting}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Draggable>
  );
}
