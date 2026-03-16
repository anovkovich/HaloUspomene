"use client";

import { useRef, useEffect, useState } from "react";
import {
  RectangleHorizontal,
  Circle,
  Sparkles,
  ChevronDown,
  Crown,
  Music,
  DoorOpen,
  Disc3,
} from "lucide-react";
import type { TableType } from "./types";
import type { TableData } from "./types";

interface Props {
  onAddTable: (type: TableType, label?: string, seats?: number) => void;
  onAddDecoration: (label: string, decorationType: TableData["decorationType"]) => void;
}

export default function AddTablePanel({ onAddTable, onAddDecoration }: Props) {
  const [specialOpen, setSpecialOpen] = useState(false);
  const specialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (specialRef.current && !specialRef.current.contains(e.target as Node)) {
        setSpecialOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const btnStyle = {
    backgroundColor: "var(--theme-primary)",
    color: "white",
  };

  const specialItems = [
    {
      icon: <Crown size={13} />,
      label: "Mladenački sto",
      action: () => { onAddTable("single-sided", "Mladenački sto", 6); setSpecialOpen(false); },
    },
    {
      icon: <Music size={13} />,
      label: "Mesto za muziku",
      action: () => { onAddDecoration("Mesto za muziku", "music"); setSpecialOpen(false); },
    },
    {
      icon: <Disc3 size={13} />,
      label: "Plesni podium",
      action: () => { onAddDecoration("Plesni podium", "dancing"); setSpecialOpen(false); },
    },
    {
      icon: <DoorOpen size={13} />,
      label: "Ulaz",
      action: () => { onAddDecoration("Ulaz", "entrance"); setSpecialOpen(false); },
    },
  ];

  return (
    <div
      className="absolute z-10 flex flex-row gap-1.5"
      style={{ top: 12, left: 12 }}
    >
      <button
        onClick={() => onAddTable("rectangular")}
        className="flex items-center gap-2 px-3 py-2 rounded text-xs font-raleway font-medium transition-opacity hover:opacity-80 shadow-sm"
        style={btnStyle}
      >
        <RectangleHorizontal size={13} />
        Pravougaoni sto
      </button>

      <button
        onClick={() => onAddTable("circle")}
        className="flex items-center gap-2 px-3 py-2 rounded text-xs font-raleway font-medium transition-opacity hover:opacity-80 shadow-sm"
        style={btnStyle}
      >
        <Circle size={13} />
        Okrugli sto
      </button>

      <div ref={specialRef} className="relative">
        <button
          onClick={() => setSpecialOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded text-xs font-raleway font-medium transition-opacity hover:opacity-80 shadow-sm"
          style={btnStyle}
        >
          <Sparkles size={13} />
          Specijalni elementi
          <ChevronDown
            size={11}
            className="ml-auto transition-transform"
            style={{ transform: specialOpen ? "rotate(180deg)" : "none" }}
          />
        </button>

        {specialOpen && (
          <div
            className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden shadow-lg z-20 w-full"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1px solid var(--theme-border-light)",
              minWidth: 180,
            }}
          >
            {specialItems.map((item, idx, arr) => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-raleway text-left transition-colors hover:opacity-70"
                style={{
                  color: "var(--theme-text)",
                  borderBottom: idx < arr.length - 1 ? "1px solid var(--theme-border-light)" : "none",
                }}
              >
                <span style={{ color: "var(--theme-primary)" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
