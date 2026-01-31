"use client";

import React, { useState, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  placeholder?: string;
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
  placeholder = "Izaberite datum"
}) => {
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
    return day === 0 ? 6 : day - 1; // Convert to Monday-first
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
      const dateStr = newDate.toISOString().split('T')[0];
      onChange(dateStr);
      setIsOpen(false);
    }
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Days of the month
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
          className={`w-10 h-10 rounded-full text-sm font-medium transition-all
            ${isDisabled
              ? "text-white/20 cursor-not-allowed"
              : "hover:bg-[#AE343F] hover:text-white cursor-pointer"
            }
            ${isSelected
              ? "bg-[#AE343F] text-white shadow-lg shadow-[#AE343F]/30"
              : ""
            }
            ${isToday && !isSelected
              ? "ring-2 ring-[#AE343F]/50 text-[#AE343F]"
              : ""
            }
            ${!isDisabled && !isSelected ? "text-white/70" : ""}
          `}
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
        className="w-full flex items-center justify-between bg-transparent border-b border-white/10 py-4 px-1 text-left text-lg focus:outline-none focus:border-[#AE343F] transition-colors group"
      >
        <span className={value ? "text-[#F5F4DC]" : "text-white/20"}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar
          size={20}
          className="text-[#AE343F] group-hover:scale-110 transition-transform"
        />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Calendar */}
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-4 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={!canGoPrev()}
                className={`p-2 rounded-full transition-colors ${
                  canGoPrev()
                    ? "hover:bg-white/10 text-white"
                    : "text-white/20 cursor-not-allowed"
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              <h3 className="text-white font-semibold">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h3>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div
                  key={day}
                  className="w-10 h-8 flex items-center justify-center text-xs font-bold text-[#AE343F] uppercase"
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
            <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const todayStr = today.toISOString().split('T')[0];
                  onChange(todayStr);
                  setIsOpen(false);
                }}
                className="flex-1 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Danas
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextWeek = new Date(today);
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  onChange(nextWeek.toISOString().split('T')[0]);
                  setIsOpen(false);
                }}
                className="flex-1 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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
