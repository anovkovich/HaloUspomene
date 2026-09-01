"use client";

import { useEffect, useState } from "react";
import { Search, X, Building2, ArrowLeft } from "lucide-react";
import type { HallTemplate, HallVenueSummary } from "@/lib/hall-venues";
import type { TableData } from "../types";
import {
  searchHallVenuesAction,
  loadHallTemplateAction,
} from "../hall-actions";
import SchemePreview from "./SchemePreview";
import { seatsLabel, tablesLabel } from "../labels";

interface Props {
  onClose: () => void;
  /** Called with the template's tables once the user confirms the load. */
  onLoad: (tables: TableData[]) => void;
}

type Selected = {
  venue: HallVenueSummary;
  hallId: string;
  hallName: string;
};

export default function LoadHallSchemeModal({ onClose, onLoad }: Props) {
  const [query, setQuery] = useState("");
  const [venues, setVenues] = useState<HallVenueSummary[]>([]);
  const [searching, setSearching] = useState(true);
  const [sessionLost, setSessionLost] = useState(false);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [template, setTemplate] = useState<HallTemplate | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Debounced search; the empty query returns the full list so the picker is
  // useful before anyone types.
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      setSearching(true);
      const res = await searchHallVenuesAction(query);
      if (!cancelled) {
        setSessionLost(!res.ok);
        setVenues(res.venues);
        setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  async function selectHall(venue: HallVenueSummary, hallId: string, hallName: string) {
    setSelected({ venue, hallId, hallName });
    setLoadingTemplate(true);
    setTemplate(null);
    const hall = await loadHallTemplateAction(venue.slug, hallId);
    setTemplate(hall);
    setLoadingTemplate(false);
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          maxHeight: "85vh",
          backgroundColor: "var(--theme-surface)",
          border: "1px solid var(--theme-border-light)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--theme-border-light)" }}
        >
          {selected && (
            <button
              onClick={() => {
                setSelected(null);
                setTemplate(null);
              }}
              className="hover:opacity-60 transition-opacity"
              style={{ color: "var(--theme-text-light)" }}
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-raleway font-semibold"
              style={{ color: "var(--theme-text)" }}
            >
              {selected ? selected.hallName : "Učitaj šemu sale"}
            </p>
            <p
              className="text-[11px] font-raleway mt-0.5 truncate"
              style={{ color: "var(--theme-text-light)" }}
            >
              {selected
                ? `${selected.venue.name} · ${selected.venue.city}`
                : "Nađite svoju salu i preuzmite gotov raspored stolova."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-60 transition-opacity"
            style={{ color: "var(--theme-text-light)" }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        {!selected ? (
          <>
            <div className="px-5 py-3 shrink-0">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--theme-text-light)" }}
                />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pretražite po gradu ili nazivu sale…"
                  className="w-full text-sm font-raleway rounded-lg pl-9 pr-3 py-2 outline-none"
                  style={{
                    backgroundColor: "var(--theme-background)",
                    border: "1px solid var(--theme-border-light)",
                    color: "var(--theme-text)",
                  }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {searching ? (
                <p
                  className="text-xs font-raleway py-6 text-center"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Tražim...
                </p>
              ) : venues.length === 0 ? (
                <div className="py-10 text-center">
                  <Building2
                    size={24}
                    className="mx-auto mb-3"
                    style={{ color: "var(--theme-text-light)", opacity: 0.5 }}
                  />
                  <p
                    className="text-xs font-raleway"
                    style={{ color: "var(--theme-text-light)" }}
                  >
                    {sessionLost
                      ? "Sesija je istekla. Osvežite stranicu i prijavite se ponovo."
                      : "Nema sale pod tim nazivom. Javite nam koja je vaša sala pa je unesemo."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {venues.map((v) => (
                    <div key={v.slug}>
                      <p
                        className="text-xs font-raleway font-semibold mb-1.5"
                        style={{ color: "var(--theme-text)" }}
                      >
                        {v.name}
                        <span
                          className="font-normal ml-1.5"
                          style={{ color: "var(--theme-text-light)" }}
                        >
                          {v.city}
                        </span>
                      </p>
                      <div className="space-y-1">
                        {v.halls.map((h) => (
                          <button
                            key={h.id}
                            onClick={() => selectHall(v, h.id, h.name)}
                            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:opacity-80"
                            style={{
                              backgroundColor: "var(--theme-background)",
                              border: "1px solid var(--theme-border-light)",
                            }}
                          >
                            <span
                              className="text-xs font-raleway"
                              style={{ color: "var(--theme-text)" }}
                            >
                              {h.name}
                            </span>
                            <span
                              className="text-[11px] font-raleway shrink-0"
                              style={{ color: "var(--theme-text-light)" }}
                            >
                              {tablesLabel(h.tableCount)} · {seatsLabel(h.totalSeats)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loadingTemplate ? (
                <p
                  className="text-xs font-raleway py-10 text-center"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Učitavam šemu...
                </p>
              ) : !template ? (
                <p
                  className="text-xs font-raleway py-10 text-center"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Šema trenutno nije dostupna.
                </p>
              ) : (
                <>
                  <SchemePreview tables={template.tables} height={220} />
                  <p
                    className="text-[11px] font-raleway mt-3"
                    style={{ color: "var(--theme-text-light)" }}
                  >
                    {tablesLabel(template.tableCount)} ·{" "}
                    {seatsLabel(template.totalSeats)}.
                    Stolove možete pomerati i menjati i posle učitavanja.
                  </p>
                </>
              )}
            </div>

            <div
              className="flex gap-2 px-5 py-4 shrink-0"
              style={{ borderTop: "1px solid var(--theme-border-light)" }}
            >
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg text-xs font-raleway font-medium transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "var(--theme-background)",
                  border: "1px solid var(--theme-border-light)",
                  color: "var(--theme-text)",
                }}
              >
                Otkaži
              </button>
              <button
                onClick={() => template && onLoad(template.tables)}
                disabled={!template || template.tables.length === 0}
                className="flex-1 py-2 rounded-lg text-xs font-raleway font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-30"
                style={{ backgroundColor: "var(--theme-primary)" }}
              >
                Učitaj ovu šemu
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
