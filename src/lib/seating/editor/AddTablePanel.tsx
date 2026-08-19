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
  Minus,
  Frame,
  Building2,
  CakeSlice,
  UtensilsCrossed,
} from "lucide-react";
import type { TableType, TableData } from "../types";

interface Props {
  onAddTable: (
    type: TableType,
    label?: string,
    seats?: number,
    /** Marks the wedding party's own table, which seats the couple by itself. */
    bridal?: boolean,
  ) => void;
  onAddDecoration: (
    label: string,
    decorationType: TableData["decorationType"],
  ) => void;
  totalSeats: number;
  occupiedSeats: number;
  /** When true, hide wedding-only items (e.g. "Mladenački sto"). */
  hideWeddingOnlyElements?: boolean;
  /** When true, hide the entire "Specijalni elementi" dropdown and instead expose
   *  a standalone "Jednostran sto" button. Used by non-wedding event organizers. */
  hideDecorations?: boolean;
  /** Admin hall-scheme mode: adds the hall-outline button. Couples get walls
   *  only through a loaded scheme, so the button stays out of their editor. */
  templateMode?: boolean;
  /** When provided, shows the "Učitaj šemu sale" button that opens the venue
   *  scheme picker. Omitted in the admin template editor. */
  onLoadHallScheme?: () => void;
  /** Rendered at the end of the strip. The editor puts the seat-search button
   *  there, which needs editor state this panel has no business holding. */
  trailing?: React.ReactNode;
}

export default function AddTablePanel({
  onAddTable,
  onAddDecoration,
  totalSeats,
  occupiedSeats,
  hideWeddingOnlyElements,
  hideDecorations,
  templateMode,
  onLoadHallScheme,
  trailing,
}: Props) {
  const [specialOpen, setSpecialOpen] = useState(false);
  const specialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        specialRef.current &&
        !specialRef.current.contains(e.target as Node)
      ) {
        setSpecialOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // One floating bar instead of a row of loose blocks, and the accent lives in
  // the icons rather than in five solid fills — with everything gold nothing
  // reads as more important than anything else.
  const btnClass =
    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-raleway font-medium transition-colors cursor-pointer";
  const btnStyle = { color: "var(--theme-text)" } as React.CSSProperties;
  const iconStyle = { color: "var(--theme-primary)" } as React.CSSProperties;
  const hoverProps = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor =
        "color-mix(in srgb, var(--theme-primary) 12%, transparent)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor = "transparent";
    },
  };

  const weddingOnly = hideWeddingOnlyElements
    ? []
    : [
        {
          icon: <Crown size={13} />,
          label: "Mladenački sto",
          action: () => {
            onAddTable("single-sided", "Mladenački sto", 6, true);
            setSpecialOpen(false);
          },
        },
      ];

  const hallOutline = templateMode
    ? [
        {
          icon: <Frame size={13} />,
          label: "Zidovi sale",
          action: () => {
            onAddDecoration("Sala", "wall");
            setSpecialOpen(false);
          },
        },
      ]
    : [];

  const specialItems = [
    ...hallOutline,
    ...weddingOnly,
    {
      icon: <Music size={13} />,
      label: "Mesto za muziku",
      action: () => {
        onAddDecoration("Mesto za muziku", "music");
        setSpecialOpen(false);
      },
    },
    {
      icon: <Disc3 size={13} />,
      label: "Plesni podijum",
      action: () => {
        onAddDecoration("Plesni podijum", "dancing");
        setSpecialOpen(false);
      },
    },
    {
      icon: <CakeSlice size={13} />,
      label: "Slatki sto",
      action: () => {
        onAddDecoration("Slatki sto", "sweets");
        setSpecialOpen(false);
      },
    },
    {
      icon: <UtensilsCrossed size={13} />,
      label: "Švedski sto",
      action: () => {
        onAddDecoration("Švedski sto", "buffet");
        setSpecialOpen(false);
      },
    },
    {
      icon: <DoorOpen size={13} />,
      label: "Ulaz",
      action: () => {
        onAddDecoration("Ulaz", "entrance");
        setSpecialOpen(false);
      },
    },
  ];

  return (
    <div
      className="absolute z-10 flex flex-row items-stretch gap-0.5 p-1 rounded-xl"
      style={{
        top: 12,
        left: 12,
        backgroundColor: "color-mix(in srgb, var(--theme-surface) 88%, #ffffff)",
        border: "1px solid color-mix(in srgb, var(--theme-primary) 22%, transparent)",
        boxShadow:
          "0 1px 2px rgba(35,35,35,0.06), 0 10px 24px -12px rgba(35,35,35,0.3)",
        backdropFilter: "blur(8px)",
      }}
    >
      <button
        onClick={() => onAddTable("rectangular")}
        className={btnClass}
        style={btnStyle}
        {...hoverProps}
      >
        <RectangleHorizontal size={13} style={iconStyle} />
        Pravougaoni sto
      </button>

      <button
        onClick={() => onAddTable("circle")}
        className={btnClass}
        style={btnStyle}
        {...hoverProps}
      >
        <Circle size={13} style={iconStyle} />
        Okrugli sto
      </button>

      {hideDecorations ? (
        <button
          onClick={() => onAddTable("single-sided", undefined, 6)}
          className={btnClass}
          style={btnStyle}
          {...hoverProps}
        >
          <Minus size={13} style={iconStyle} />
          Jednostran sto
        </button>
      ) : (
        <div ref={specialRef} className="relative">
          <button
            onClick={() => setSpecialOpen((v) => !v)}
            className={`${btnClass} w-full`}
            style={{
              ...btnStyle,
              backgroundColor: specialOpen
                ? "color-mix(in srgb, var(--theme-primary) 14%, transparent)"
                : "transparent",
            }}
            {...(specialOpen ? {} : hoverProps)}
          >
            <Sparkles size={13} style={iconStyle} />
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
                    borderBottom:
                      idx < arr.length - 1
                        ? "1px solid var(--theme-border-light)"
                        : "none",
                  }}
                >
                  <span style={{ color: "var(--theme-primary)" }}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {onLoadHallScheme && (
        <button
          onClick={onLoadHallScheme}
          className={btnClass}
          style={btnStyle}
          {...hoverProps}
        >
          <Building2 size={13} style={iconStyle} />
          Učitaj šemu sale
        </button>
      )}

      {/* Free-seat counter is meaningless for a hall template — the toolbar
          already reports table and seat totals there. */}
      {totalSeats > 0 && !templateMode && (
        <div
          className="flex items-center pl-3 pr-3 ml-1 text-xs font-raleway self-stretch"
          style={{
            borderLeft:
              "1px solid color-mix(in srgb, var(--theme-primary) 22%, transparent)",
            color: "var(--theme-text-light)",
          }}
        >
          Slobodnih mesta:&nbsp;
          <span
            className="tabular-nums"
            style={{ color: "var(--theme-primary)", fontWeight: 700 }}
          >
            {totalSeats - occupiedSeats}
          </span>
          <span style={{ opacity: 0.55 }}>&nbsp;/&nbsp;{totalSeats}</span>
        </div>
      )}

      {trailing}
    </div>
  );
}
