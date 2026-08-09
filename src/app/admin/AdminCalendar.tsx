"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  weekendKey,
  occupies,
  type PhoneRental,
} from "@/lib/phone-rentals-shared";

/**
 * Retro-phone availability calendar. NOT a general company calendar: the whole
 * grid answers one question — "do I still have a phone for this weekend?".
 *
 * Capacity is the primary visual layer (one filled segment per phone out, red
 * wash when the weekend is sold out). Weddings and birthdays survive only as
 * faint dots, because they explain WHY a weekend is busy without competing with
 * the answer. Rentals are deliberately NOT dots — they are the segments.
 */

interface BirthdayItem {
  event_date: string;
  child_name: string;
}

interface AdminCalendarProps {
  /** Owned by PhoneAdminTab so adding a rental updates the grid immediately —
   *  a second fetch in here would show stale capacity right after a booking. */
  rentals: PhoneRental[];
  units: number;
  /** When `rentals` was fetched. Payment holds expire against a clock, and
   *  reading `Date.now()` during render is impure — so occupancy is evaluated
   *  as of the load, and refreshes when the list does. */
  now: number;
  couples: Array<{
    event_date: string;
    couple_names: { full_display: string };
    slug: string;
    draft?: boolean;
  }>;
  /** Clicking a weekend with room prefills the form above. */
  onPickDate?: (date: string) => void;
}

const MONTHS = [
  "Januar", "Februar", "Mart", "April", "Maj", "Jun",
  "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar",
];
const DAYS = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];
const WEDDING_COLOR = "#d4af37";
const BIRTHDAY_COLOR = "#4ade80";
const PHONE_COLOR = "#AE343F";
const DAY_MS = 86_400_000;

/** Grid cells for the month, padded to whole weeks with the neighbouring
 *  months' real dates — a weekend split across a month boundary must never be
 *  amputated, or the panel would hide capacity that is genuinely gone. */
function buildCells(year: number, month: number): { date: string; day: number; outside: boolean }[] {
  const first = Date.UTC(year, month, 1);
  const dow = new Date(first).getUTCDay();
  const lead = dow === 0 ? 6 : dow - 1; // Monday-first
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const total = Math.ceil((lead + daysInMonth) / 7) * 7;

  return Array.from({ length: total }, (_, i) => {
    const ms = first + (i - lead) * DAY_MS;
    const d = new Date(ms);
    return {
      date: d.toISOString().slice(0, 10),
      day: d.getUTCDate(),
      outside: d.getUTCMonth() !== month,
    };
  });
}

function dayLabel(date: string): string {
  return new Date(date + "T12:00:00Z").toLocaleDateString("sr-RS", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function AdminCalendar({
  rentals,
  units,
  now,
  couples,
  onPickDate,
}: AdminCalendarProps) {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());
  const [birthdays, setBirthdays] = useState<BirthdayItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/birthdays")
      .then((r) => (r.ok ? r.json() : []))
      .then((b) => setBirthdays(Array.isArray(b) ? b : []))
      .catch(() => {});
  }, []);

  /** Rentals grouped by capacity weekend, using the SAME occupancy rule the
   *  server enforces — an expired unpaid hold is not occupancy, and showing it
   *  as one would have the panel refuse a date the public checkout still sells. */
  const perWeekend = useMemo(() => {
    const map = new Map<string, { rental: PhoneRental; held: boolean }[]>();
    for (const r of rentals) {
      if (!occupies(r, now)) continue;
      const key = weekendKey(r.rental_date);
      const held = r.source === "self" && !r.paid;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ rental: r, held });
    }
    return map;
  }, [rentals, now]);

  const context = useMemo(() => {
    const map = new Map<string, { label: string; type: "wedding" | "birthday"; draft?: boolean }[]>();
    const add = (d: string, v: { label: string; type: "wedding" | "birthday"; draft?: boolean }) => {
      const k = d.slice(0, 10);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(v);
    };
    for (const c of couples) {
      if (c.event_date) add(c.event_date, { label: c.couple_names.full_display, type: "wedding", draft: c.draft });
    }
    for (const b of birthdays) {
      if (b.event_date) add(b.event_date, { label: b.child_name, type: "birthday" });
    }
    return map;
  }, [couples, birthdays]);

  const cells = buildCells(viewYear, viewMonth);

  /** Weekend counts for the displayed month + the first free weekend from today
   *  on, which is the number a sales call actually needs. */
  const summary = useMemo(() => {
    const keys = [...new Set(cells.map((c) => weekendKey(c.date)))];
    let free = 0, partial = 0, full = 0;
    for (const k of keys) {
      const n = perWeekend.get(k)?.length ?? 0;
      if (n === 0) free++;
      else if (n >= units) full++;
      else partial++;
    }
    // Scan forward past the month edge — the next opening is often in the next.
    let next: string | null = null;
    for (let i = 0; i < 120; i++) {
      const d = new Date(Date.parse(todayKey + "T00:00:00Z") + i * DAY_MS)
        .toISOString().slice(0, 10);
      const k = weekendKey(d);
      if ((perWeekend.get(k)?.length ?? 0) < units) { next = k; break; }
    }
    return { free, partial, full, next };
  }, [cells, perWeekend, units, todayKey]);

  function shiftMonth(delta: number) {
    const m = viewMonth + delta;
    setViewYear(viewYear + Math.floor(m / 12));
    setViewMonth(((m % 12) + 12) % 12);
  }

  const isCurrentView =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-white/80">
          Zauzetost telefona
        </h3>
        <div className="flex items-center gap-1">
          {!isCurrentView && (
            <button
              onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }}
              className="text-[10px] text-white/40 hover:text-white/80 px-2 py-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
            >
              Danas
            </button>
          )}
          <button
            onClick={() => shiftMonth(-1)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white cursor-pointer"
            aria-label="Prethodni mesec"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-medium text-white min-w-[100px] text-center">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={() => shiftMonth(1)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white cursor-pointer"
            aria-label="Sledeći mesec"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <p className="text-[11px] text-white/45 mt-1.5">
        Vikendi ovog meseca: <span className="text-white/70">{summary.free} slobodnih</span>
        {summary.partial > 0 && <> · {summary.partial} delimično</>}
        {summary.full > 0 && <> · <span className="text-[#e39aa2]">{summary.full} punih</span></>}
        {summary.next && (
          <> · prvi slobodan: <span className="text-white/70">{dayLabel(summary.next)}</span></>
        )}
      </p>

      <div className="grid grid-cols-7 mt-3">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-[10px] font-medium py-1.5 ${
              i >= 4 ? "text-white/55 bg-white/[0.04]" : "text-white/35"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border border-white/10 rounded-lg overflow-hidden">
        {cells.map((cell, idx) => {
          const key = weekendKey(cell.date);
          const booked = perWeekend.get(key) ?? [];
          const isFull = booked.length >= units;
          const isToday = cell.date === todayKey;
          const ctx = context.get(cell.date) ?? [];
          const dow = idx % 7; // 0 = Mon … 6 = Sun
          const isWeekendCol = dow >= 4;
          // The bar is drawn once per weekend, on its Saturday cell, so the
          // three-day block reads as one unit of capacity rather than three.
          const showBar = dow === 5;
          const rowAbove = Math.floor(idx / 7) > 1;

          return (
            <div
              key={cell.date}
              onClick={() => !isFull && onPickDate?.(cell.date)}
              className={`relative min-h-[46px] p-1 flex flex-col group border-b border-white/10
                ${dow !== 6 ? "border-r border-white/10" : ""}
                ${isWeekendCol ? "bg-white/[0.04]" : ""}
                ${isFull ? "bg-[#AE343F]/15" : ""}
                ${!isFull && onPickDate ? "cursor-pointer hover:bg-white/10" : ""}`}
            >
              <div className="flex items-start justify-between gap-1">
                <span
                  className={`text-[11px] font-medium leading-none ${
                    cell.outside ? "text-white/20" : isToday ? "text-white" : "text-white/50"
                  } ${isToday ? "ring-1 ring-white/60 rounded px-1 -mx-0.5" : ""}`}
                >
                  {cell.day}
                </span>
                {ctx.length > 0 && (
                  <span className="flex items-center gap-0.5 flex-wrap justify-end max-w-[28px]">
                    {ctx.slice(0, 3).map((e, i) => (
                      <span
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{
                          backgroundColor: e.type === "wedding" ? WEDDING_COLOR : BIRTHDAY_COLOR,
                          opacity: e.draft ? 0.25 : 0.45,
                        }}
                      />
                    ))}
                    {ctx.length > 3 && (
                      <span className="text-[8px] text-white/25 leading-none">+{ctx.length - 3}</span>
                    )}
                  </span>
                )}
              </div>

              {showBar && (
                <div className="mt-auto flex items-center gap-[3px]">
                  {Array.from({ length: units }, (_, i) => {
                    const slot = booked[i];
                    return (
                      <span
                        key={i}
                        className="h-[4px] flex-1 rounded-full"
                        style={
                          slot
                            ? slot.held
                              ? { backgroundColor: PHONE_COLOR, opacity: 0.5, outline: `1px dashed ${PHONE_COLOR}` }
                              : { backgroundColor: PHONE_COLOR }
                            : { backgroundColor: "rgba(255,255,255,0.06)", outline: "1px solid rgba(255,255,255,0.18)" }
                        }
                      />
                    );
                  })}
                </div>
              )}

              {(booked.length > 0 || ctx.length > 0) && (
                <div
                  className={`absolute ${rowAbove ? "bottom-full mb-1" : "top-full mt-1"}
                    left-1/2 -translate-x-1/2 z-20 hidden group-hover:block pointer-events-none w-max max-w-[230px]`}
                >
                  <div className="bg-[#2a2a2a] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white/80 shadow-xl space-y-1">
                    <div className={isFull ? "text-[#e39aa2]" : "text-white/60"}>
                      {dayLabel(cell.date)} — {booked.length}/{units}
                      {isFull ? " (PUNO)" : " zauzeto"}
                    </div>
                    {booked.map(({ rental, held }) => (
                      <div key={rental.id} className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: PHONE_COLOR, opacity: held ? 0.5 : 1 }}
                        />
                        <span>
                          {rental.contact_name}
                          {held && <span className="text-white/40"> — čeka uplatu</span>}
                        </span>
                      </div>
                    ))}
                    {ctx.length > 0 && (
                      <div className="pt-1 border-t border-white/10 text-white/45">
                        {ctx.map((e) => e.label).join(" · ")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-[10px] text-white/40 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-[4px] rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)", outline: "1px solid rgba(255,255,255,0.18)" }} />
          slobodan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-[4px] rounded-full" style={{ backgroundColor: PHONE_COLOR }} />
          zauzet
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-[4px] rounded-full" style={{ backgroundColor: PHONE_COLOR, opacity: 0.5, outline: `1px dashed ${PHONE_COLOR}` }} />
          čeka uplatu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: "rgba(174,52,63,0.15)" }} />
          vikend pun
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: WEDDING_COLOR, opacity: 0.45 }} />
          venčanje
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BIRTHDAY_COLOR, opacity: 0.45 }} />
          rođendan
        </span>
      </div>
    </div>
  );
}
