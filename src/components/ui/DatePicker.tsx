"use client";

import React, { useState, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  placeholder?: string;
  variant?: "dark" | "light";
}

const MONTHS = [
  "Januar", "Februar", "Mart", "April", "Maj", "Jun",
  "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
];

const DAYS = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  placeholder = "Izaberite datum",
  variant = "dark"
}) => {
  const isLight = variant === "light";
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDateObj = minDate ? new Date(minDate) : today;
  minDateObj.setHours(0, 0, 0, 0);

  // Colors based on variant
  const colors = isLight
    ? {
        accent: "#d4af37",
        accentHover: "#b8972f",
        text: "#1a1a1a",
        textMuted: "#78716c",
        textPlaceholder: "#a8a29e",
        bg: "#faf9f6",
        bgDropdown: "#ffffff",
        border: "#e7e5e4",
        borderFocus: "#d4af37",
      }
    : {
        accent: "#AE343F",
        accentHover: "#8A2A32",
        text: "#F5F4DC",
        textMuted: "rgba(255,255,255,0.6)",
        textPlaceholder: "rgba(255,255,255,0.2)",
        bg: "transparent",
        bgDropdown: "#1a1a1a",
        border: "rgba(255,255,255,0.1)",
        borderFocus: "#AE343F",
      };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getDate()}. ${MONTHS[date.getMonth()]} ${date.getFullYear()}.`;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (newDate >= minDateObj) {
      const dateStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
      onChange(dateStr);
      setIsOpen(false);
    }
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0, 0, 0, 0);
      const isDisabled = currentDate < minDateObj;
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;
      const isToday =
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      days.push(
        <button
          key={day}
          type="button"
          disabled={isDisabled}
          onClick={() => handleDateClick(day)}
          className="w-10 h-10 rounded-full text-sm font-medium transition-all"
          style={{
            color: isDisabled
              ? isLight ? "#d6d3d1" : "rgba(255,255,255,0.2)"
              : isSelected
                ? "#fff"
                : isLight ? "#1a1a1a" : "rgba(255,255,255,0.7)",
            backgroundColor: isSelected ? colors.accent : "transparent",
            boxShadow: isSelected ? `0 4px 12px ${colors.accent}40` : "none",
            cursor: isDisabled ? "not-allowed" : "pointer",
            outline: isToday && !isSelected ? `2px solid ${colors.accent}50` : "none",
          }}
          onMouseEnter={(e) => {
            if (!isDisabled && !isSelected) {
              e.currentTarget.style.backgroundColor = colors.accent;
              e.currentTarget.style.color = "#fff";
            }
          }}
          onMouseLeave={(e) => {
            if (!isDisabled && !isSelected) {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = isLight ? "#1a1a1a" : "rgba(255,255,255,0.7)";
            }
          }}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const canGoPrev = () => {
    const prevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0);
    return prevMonth >= minDateObj;
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Display Input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between py-3 px-4 text-left focus:outline-none transition-all group ${
          isLight
            ? "bg-[#faf9f6] border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
            : "bg-transparent border-b border-white/10 focus:border-[#AE343F]"
        }`}
      >
        <span style={{ color: value ? colors.text : colors.textPlaceholder }}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar
          size={20}
          style={{ color: colors.accent }}
          className="group-hover:scale-110 transition-transform"
        />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl shadow-2xl p-4"
            style={{
              backgroundColor: colors.bgDropdown,
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={!canGoPrev()}
                className="p-2 rounded-full transition-colors"
                style={{
                  color: canGoPrev() ? colors.text : colors.textPlaceholder,
                  cursor: canGoPrev() ? "pointer" : "not-allowed",
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <h3 className="font-semibold" style={{ color: colors.text }}>
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h3>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-full transition-colors"
                style={{ color: colors.text }}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div
                  key={day}
                  className="w-10 h-8 flex items-center justify-center text-xs font-bold uppercase"
                  style={{ color: colors.accent }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            {/* Quick Actions */}
            <div
              className="mt-4 pt-4 flex gap-2"
              style={{ borderTop: `1px solid ${colors.border}` }}
            >
              <button
                type="button"
                onClick={() => {
                  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  onChange(todayStr);
                  setIsOpen(false);
                }}
                className="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: colors.textMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.text;
                  e.currentTarget.style.backgroundColor = isLight ? "#f5f5f4" : "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.textMuted;
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Danas
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextWeek = new Date(today);
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  onChange(`${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`);
                  setIsOpen(false);
                }}
                className="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: colors.textMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.text;
                  e.currentTarget.style.backgroundColor = isLight ? "#f5f5f4" : "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.textMuted;
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Za nedelju dana
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DatePicker;
