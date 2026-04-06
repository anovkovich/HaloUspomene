"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarEvent {
  type: "wedding" | "birthday" | "rental";
  label: string;
  isDraft?: boolean;
}

interface BirthdayItem {
  event_date: string;
  child_name: string;
}

interface RentalItem {
  rental_date: string;
  contact_name: string;
}

interface AdminCalendarProps {
  couples: Array<{
    event_date: string;
    couple_names: { full_display: string };
    slug: string;
    draft?: boolean;
  }>;
}

const MONTHS = [
  "Januar", "Februar", "Mart", "April", "Maj", "Jun",
  "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
];
const DAYS = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];
const DOT_COLORS = {
  wedding: "#d4af37",
  birthday: "#4ade80",
  rental: "#AE343F",
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function buildCalendarCells(year: number, month: number): (number | null)[] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function AdminCalendar({ couples }: AdminCalendarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [birthdays, setBirthdays] = useState<BirthdayItem[]>([]);
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isExpanded || !mounted || hasFetched.current) return;
    hasFetched.current = true;
    setLoadingExtra(true);

    Promise.all([
      fetch("/api/admin/birthdays")
        .then((r) => (r.status === 401 ? [] : r.json()))
        .catch(() => []),
      fetch("/api/admin/phone-rentals")
        .then((r) => (r.status === 401 ? [] : r.json()))
        .catch(() => []),
    ]).then(([bdays, rnts]) => {
      setBirthdays(Array.isArray(bdays) ? bdays : []);
      setRentals(Array.isArray(rnts) ? rnts : []);
      setLoadingExtra(false);
    });
  }, [isExpanded, mounted]);

  const eventMap = useMemo((): Record<string, CalendarEvent[]> => {
    const map: Record<string, CalendarEvent[]> = {};
    const add = (dateKey: string, event: CalendarEvent) => {
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(event);
    };

    // Couples → YELLOW dots
    for (const c of couples) {
      if (!c.event_date) continue;
      const key = c.event_date.slice(0, 10);
      add(key, { type: "wedding", label: c.couple_names.full_display, isDraft: c.draft });
    }

    // Birthdays → LIGHT GREEN dots
    for (const b of birthdays) {
      if (!b.event_date) continue;
      add(b.event_date.slice(0, 10), { type: "birthday", label: b.child_name });
    }

    // Rentals → RED dots
    for (const r of rentals) {
      if (!r.rental_date) continue;
      add(r.rental_date.slice(0, 10), { type: "rental", label: r.contact_name });
    }

    return map;
  }, [couples, birthdays, rentals]);

  const cells = buildCalendarCells(viewYear, viewMonth);
  const today = new Date();
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  if (!mounted) return null;

  return (
    <div className="mb-4">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
      >
        <Calendar size={13} />
        <span>Kalendar</span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Calendar Panel - Collapse/Expand */}
      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 mt-2 space-y-3">
            {/* Header - Month Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
              >
                <ChevronLeft size={14} />
              </button>

              <div className="text-sm font-medium text-white flex items-center gap-2">
                {MONTHS[viewMonth]} {viewYear}
                {loadingExtra && <span className="text-[10px] text-white/30 animate-pulse">Učitavanje...</span>}
              </div>

              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-white/10">
              {DAYS.map((day, i) => (
                <div key={day} className={`text-center text-[10px] font-medium text-white/40 py-2 border-r border-white/10 ${i === 6 ? "border-r-0" : ""}`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border border-white/10 rounded-lg overflow-hidden">
              {cells.map((day, idx) => {
                const dateKey = day ? toDateKey(viewYear, viewMonth, day) : "";
                const events = dateKey ? eventMap[dateKey] || [] : [];
                const isToday = isCurrentMonth && day === today.getDate();
                const MAX_DOTS = 3;
                const visible = events.slice(0, MAX_DOTS);
                const overflow = Math.max(0, events.length - MAX_DOTS);
                const rowIndex = Math.floor(idx / 7);
                const showTooltipAbove = rowIndex > 1;

                return (
                  <div
                    key={idx}
                    className={`relative min-h-[52px] p-1 flex flex-col group border-b border-white/10 ${idx % 7 !== 6 ? "border-r border-white/10" : ""}
                      ${isToday ? "bg-white/10" : ""}
                      ${events.length > 0 ? "hover:bg-white/5 cursor-default" : ""}
                    `}
                  >
                    {/* Tooltip */}
                    {events.length > 0 && (
                      <div
                        className={`absolute ${showTooltipAbove ? "bottom-full mb-1" : "top-full mt-1"}
                          left-1/2 -translate-x-1/2 z-20 hidden group-hover:block pointer-events-none w-max max-w-[180px]`}
                      >
                        <div className="bg-[#2a2a2a] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white/80 shadow-xl space-y-0.5">
                          {events.map((e, i) => (
                            <div key={i} className="flex items-center gap-1.5 truncate">
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: DOT_COLORS[e.type],
                                  opacity: e.isDraft ? 0.4 : 1,
                                }}
                              />
                              <span className={e.isDraft ? "opacity-50" : ""}>{e.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Day Number */}
                    {day && (
                      <>
                        <span
                          className={`text-[11px] font-medium leading-none
                            ${isToday ? "text-[#AE343F]" : "text-white/50"}`}
                        >
                          {day}
                        </span>

                        {/* Dot Row */}
                        {events.length > 0 && (
                          <div className="mt-auto flex items-center gap-0.5 flex-wrap">
                            {visible.map((e, i) => (
                              <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  backgroundColor: DOT_COLORS[e.type],
                                  opacity: e.isDraft ? 0.4 : 1,
                                }}
                              />
                            ))}
                            {overflow > 0 && <span className="text-[9px] text-white/30">+{overflow}</span>}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-[10px] text-white/40">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DOT_COLORS.wedding }} />
                Venčanje
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DOT_COLORS.birthday }} />
                Rođendan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DOT_COLORS.rental }} />
                Telefon
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
