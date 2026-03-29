"use client";

import { useState } from "react";
import {
  Trash2,
  Plus,
  Minus,
  RotateCw,
} from "lucide-react";
import type { TableData, SeatAssignment } from "./types";

const SEAT_SIZE = 36;
const CIRCLE_TABLE_R = 58;
const SEAT_ORBIT_R = CIRCLE_TABLE_R + 20;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Seat({
  index,
  assignment,
  onTap,
}: {
  index: number;
  assignment: SeatAssignment | null;
  onTap: () => void;
}) {
  return (
    <button
      onClick={onTap}
      className="rounded-full flex items-center justify-center transition-all active:scale-95"
      style={{
        width: SEAT_SIZE,
        height: SEAT_SIZE,
        flexShrink: 0,
        backgroundColor: assignment
          ? "var(--theme-primary)"
          : "var(--theme-background)",
        border: assignment
          ? "2px solid var(--theme-primary)"
          : "2px dashed color-mix(in srgb, var(--theme-primary) 30%, transparent)",
        color: assignment ? "white" : "var(--theme-text-light)",
        fontSize: assignment ? 10 : 11,
        fontFamily: "var(--font-raleway, sans-serif)",
        fontWeight: 700,
      }}
    >
      {assignment ? getInitials(assignment.guestName) : index + 1}
    </button>
  );
}

interface Props {
  table: TableData;
  onSeatTap: (tableId: string, seatIndex: number) => void;
  onUpdate: (id: string, changes: Partial<TableData>) => void;
  onDelete: (id: string) => void;
}

export default function MobileTableCard({
  table,
  onSeatTap,
  onUpdate,
  onDelete,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [labelInput, setLabelInput] = useState(table.label);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Skip decoration tables on mobile
  if (table.type === "decoration") return null;

  const isRotated = table.type === "rectangular" && !!table.rotated;
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

  const filledCount = table.assignments.filter(Boolean).length;

  // ── Header ──
  const header = (
    <div
      className="flex items-center gap-1.5 px-3 py-2 rounded-t-xl"
      style={{ backgroundColor: "var(--theme-primary)", color: "white" }}
    >
      {/* Label */}
      {isEditing ? (
        <input
          autoFocus
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          onBlur={handleLabelSave}
          onKeyDown={(e) => e.key === "Enter" && handleLabelSave()}
          className="text-xs font-raleway font-semibold bg-transparent outline-none border-b border-white/50 text-white flex-1 min-w-0"
        />
      ) : (
        <span
          className="text-xs font-raleway font-semibold truncate flex-1"
          onClick={() => {
            setLabelInput(table.label);
            setIsEditing(true);
          }}
        >
          {table.label}
        </span>
      )}

      {/* Filled indicator */}
      <span className="text-[10px] font-raleway opacity-70 shrink-0">
        {filledCount}/{table.seats}
      </span>

      <div className="w-px h-3 bg-white/30 shrink-0" />

      {/* Seat controls */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => changeSeats(-1)}
          className="w-6 h-6 flex items-center justify-center rounded active:bg-white/20"
        >
          <Minus size={11} />
        </button>
        <span className="text-[10px] font-raleway w-4 text-center">
          {table.seats}
        </span>
        <button
          onClick={() => changeSeats(1)}
          className="w-6 h-6 flex items-center justify-center rounded active:bg-white/20"
        >
          <Plus size={11} />
        </button>
      </div>

      {/* Rotate (rectangular only) */}
      {table.type === "rectangular" && (
        <button
          onClick={() => onUpdate(table.id, { rotated: !table.rotated })}
          className="w-6 h-6 flex items-center justify-center rounded active:bg-white/20"
          style={{ opacity: isRotated ? 1 : 0.6 }}
        >
          <RotateCw size={11} />
        </button>
      )}

      {/* Delete */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="w-6 h-6 flex items-center justify-center rounded active:bg-white/20"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );

  // ── Circle layout ──
  const circleLayout = () => {
    const cardW = (SEAT_ORBIT_R + SEAT_SIZE / 2 + 8) * 2;
    return (
      <div className="relative mx-auto" style={{ width: cardW, height: cardW }}>
        {/* Center table */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: CIRCLE_TABLE_R * 2,
            height: CIRCLE_TABLE_R * 2,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(35,35,35,0.04)",
            border: "3px solid rgba(35,35,35,0.15)",
          }}
        />
        {/* Seats in orbit */}
        {table.assignments.map((a, i) => {
          const angle = (2 * Math.PI * i) / table.seats - Math.PI / 2;
          const cx = cardW / 2;
          const cy = cardW / 2;
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
                index={i}
                assignment={a}
                onTap={() => onSeatTap(table.id, i)}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // ── Rectangular landscape layout ──
  const rectLandscapeLayout = () => (
    <div className="overflow-x-auto px-3 pt-3 pb-4">
      <div className="inline-flex flex-col items-center min-w-full">
        <div className="flex gap-1.5 justify-center mb-2">
          {table.assignments.slice(0, seatsPerRow).map((a, i) => (
            <Seat
              key={i}
              index={i}
              assignment={a}
              onTap={() => onSeatTap(table.id, i)}
            />
          ))}
        </div>
        <div
          className="rounded"
          style={{
            width: Math.max(140, seatsPerRow * (SEAT_SIZE + 6) - 6),
            height: 48,
            backgroundColor: "rgba(35,35,35,0.04)",
            border: "3px solid rgba(35,35,35,0.15)",
          }}
        />
        <div className="flex gap-1.5 justify-center mt-2">
          {table.assignments.slice(seatsPerRow).map((a, i) => (
            <Seat
              key={seatsPerRow + i}
              index={seatsPerRow + i}
              assignment={a}
              onTap={() => onSeatTap(table.id, seatsPerRow + i)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // ── Rectangular portrait (rotated) layout ──
  const rectPortraitLayout = () => (
    <div className="flex items-start justify-center gap-2 px-3 pt-3 pb-4">
      {/* Left column */}
      <div className="flex flex-col gap-1.5">
        {table.assignments.slice(0, seatsPerRow).map((a, i) => (
          <Seat
            key={i}
            index={i}
            assignment={a}
            onTap={() => onSeatTap(table.id, i)}
          />
        ))}
      </div>
      {/* Table surface */}
      <div
        className="rounded"
        style={{
          width: 56,
          minHeight: seatsPerRow * (SEAT_SIZE + 6) - 6,
          backgroundColor: "rgba(35,35,35,0.04)",
          border: "3px solid rgba(35,35,35,0.15)",
        }}
      />
      {/* Right column */}
      <div className="flex flex-col gap-1.5">
        {table.assignments.slice(seatsPerRow).map((a, i) => (
          <Seat
            key={seatsPerRow + i}
            index={seatsPerRow + i}
            assignment={a}
            onTap={() => onSeatTap(table.id, seatsPerRow + i)}
          />
        ))}
      </div>
    </div>
  );

  // ── Single-sided layout ──
  const singleSidedLayout = () => (
    <div className="overflow-x-auto px-3 pt-3 pb-4">
      <div className="inline-flex flex-col items-center min-w-full">
        <div className="flex gap-1.5 justify-center mb-2">
          {table.assignments.map((a, i) => (
            <Seat
              key={i}
              index={i}
              assignment={a}
              onTap={() => onSeatTap(table.id, i)}
            />
          ))}
        </div>
        <div
          className="rounded"
          style={{
            width: Math.max(140, table.seats * (SEAT_SIZE + 6) - 6),
            height: 48,
            backgroundColor: "rgba(35,35,35,0.04)",
            border: "3px solid rgba(35,35,35,0.15)",
          }}
        />
      </div>
    </div>
  );

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--theme-background)",
        border: "1px solid var(--theme-border)",
      }}
    >
      {header}

      {table.type === "circle" && circleLayout()}
      {table.type === "rectangular" && !isRotated && rectLandscapeLayout()}
      {table.type === "rectangular" && isRotated && rectPortraitLayout()}
      {table.type === "single-sided" && singleSidedLayout()}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{
            backgroundColor: "color-mix(in srgb, #ef4444 8%, var(--theme-background))",
            borderTop: "1px solid var(--theme-border-light)",
          }}
        >
          <span
            className="text-xs font-raleway"
            style={{ color: "var(--theme-text-muted)" }}
          >
            Obriši {table.label}?
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-xs font-raleway font-medium px-3 py-1 rounded-lg"
              style={{ color: "var(--theme-text-light)" }}
            >
              Ne
            </button>
            <button
              onClick={() => onDelete(table.id)}
              className="text-xs font-raleway font-medium px-3 py-1 rounded-lg text-white"
              style={{ backgroundColor: "#ef4444" }}
            >
              Da, obriši
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
