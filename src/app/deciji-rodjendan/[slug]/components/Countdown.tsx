"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  eventDate: string;
}

function calcTimeLeft(eventDate: string) {
  const diff = new Date(eventDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function BirthdayCountdown({ eventDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft(eventDate));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft(eventDate)), 1000);
    return () => clearInterval(timer);
  }, [eventDate]);

  const units = [
    { value: timeLeft.days, label: "Dana" },
    { value: timeLeft.hours, label: "Sati" },
    { value: timeLeft.minutes, label: "Minuta" },
    { value: timeLeft.seconds, label: "Sekundi" },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      {units.map((unit, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "2px solid var(--theme-border-light)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <span
              className="text-2xl sm:text-3xl font-bold"
              style={{
                color: "var(--theme-primary)",
                fontFamily: "var(--theme-display-font)",
              }}
            >
              {String(unit.value).padStart(2, "0")}
            </span>
          </div>
          <span
            className="text-[10px] sm:text-xs mt-2 font-medium uppercase tracking-wider"
            style={{ color: "var(--theme-text-light)" }}
          >
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
