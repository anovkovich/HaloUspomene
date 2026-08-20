"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { seatsLabel, tablesLabel } from "../labels";

interface Props {
  coupleNames: string;
  /** Live figures for the header read-out. Undefined in template mode, which
   *  shows its own scheme statistics instead. */
  stats?: {
    tableCount: number;
    totalSeats: number;
    occupiedSeats: number;
    /** Parties from the guest list that still have somebody without a seat. */
    unassignedGuests: number;
  };
  /** Back-link target. Each consumer route supplies its own. */
  backHref?: string;
  /** When true, hide the "← Nazad" link entirely. Used by standalone routes
   *  where there's no parent portal to return to. */
  hideBackButton?: boolean;
  /** Admin hall-scheme mode: swaps the guest figures for scheme statistics. */
  templateMode?: boolean;
  /** Table + seat counters shown in template mode, plus the scheme's overall
   *  size so the admin can see whether it fits the mobile canvas. */
  templateStats?: {
    tableCount: number;
    totalSeats: number;
    width: number;
    height: number;
    fitsMobile: boolean;
  };
}

/** One figure in the header read-out: quiet label, loud number. */
function Stat({
  label,
  value,
  hint,
  muted,
}: {
  label: string;
  value: string;
  hint?: string;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center leading-none">
      <span
        className="font-raleway text-[9px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--theme-text-light)" }}
      >
        {label}
      </span>
      <span className="mt-1 flex items-baseline justify-center gap-1">
        <span
          className="font-raleway text-sm font-bold tabular-nums"
          style={{
            color: muted ? "var(--theme-text-light)" : "var(--theme-primary)",
          }}
        >
          {value}
        </span>
        {hint && (
          <span
            className="font-raleway text-[10px]"
            style={{ color: "var(--theme-text-light)" }}
          >
            {hint}
          </span>
        )}
      </span>
    </div>
  );
}

export default function Toolbar({
  coupleNames,
  stats,
  backHref = "/moje-vencanje?tab=guests",
  hideBackButton = false,
  templateMode = false,
  templateStats,
}: Props) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 border-b shrink-0"
      style={{
        borderColor: "var(--theme-border-light)",
        backgroundColor: "var(--theme-surface)",
      }}
    >
      {!hideBackButton && (
        <>
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-xs font-raleway transition-opacity hover:opacity-60"
            style={{ color: "var(--theme-text-light)" }}
          >
            <ArrowLeft size={13} />
            Nazad
          </Link>

          <div
            className="h-4 w-px"
            style={{ backgroundColor: "var(--theme-border-light)" }}
          />
        </>
      )}

      <p
        className="font-script text-lg leading-none"
        style={{ color: "var(--theme-primary)" }}
      >
        {coupleNames}
      </p>

      <p
        className="font-raleway text-xs uppercase tracking-widest hidden sm:block"
        style={{ color: "var(--theme-text-light)" }}
      >
        {templateMode ? "— Šema sale" : "— Raspored sedenja"}
      </p>

      <div className="flex-1" />

      {/* Where Preuzmi/Sačuvaj used to sit. The actions moved down to the
          canvas edge, and the space went to the numbers that actually answer
          "how far along am I" — free seats alone never did. */}
      {stats && !templateMode && (
        <div className="flex items-stretch gap-5 pr-1">
          <Stat label="Stolova" value={String(stats.tableCount)} />
          <Stat
            label="Raspoređeno"
            value={`${stats.occupiedSeats} / ${stats.totalSeats}`}
            hint={
              stats.totalSeats
                ? `${Math.round((stats.occupiedSeats / stats.totalSeats) * 100)}%`
                : undefined
            }
          />
          <Stat
            label="Preostalo"
            value={String(stats.unassignedGuests)}
            hint={stats.unassignedGuests === 0 ? "sve raspoređeno" : "zvanica"}
            muted={stats.unassignedGuests === 0}
          />
        </div>
      )}

      {templateMode && templateStats && (
        <p
          className="font-raleway text-xs hidden sm:block"
          style={{ color: "var(--theme-text-light)" }}
        >
          {tablesLabel(templateStats.tableCount)} ·{" "}
          {seatsLabel(templateStats.totalSeats)}
          {templateStats.tableCount > 0 && (
            <>
              {" · "}
              <span
                title={
                  templateStats.fitsMobile
                    ? "Šema staje na ekran telefona"
                    : "Šema je šira od telefonskog platna — klijenti na telefonu je neće videti celu"
                }
                style={{
                  color: templateStats.fitsMobile ? undefined : "#c0392b",
                }}
              >
                {Math.round(templateStats.width)}×
                {Math.round(templateStats.height)}{" "}
                {templateStats.fitsMobile ? "✓" : "⚠"}
              </span>
            </>
          )}
        </p>
      )}

    </div>
  );
}
