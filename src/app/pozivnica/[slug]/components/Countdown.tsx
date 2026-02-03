"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "./ThemeProvider";

interface CountdownProps {
  targetDate: string;
}

interface TimeBlockProps {
  value: number;
  label: string;
}

const TimeBlock: React.FC<TimeBlockProps> = ({ value, label }) => (
  <div className="flex flex-col items-center">
    {/* Number container */}
    <div className="relative">
      <div
        className="w-[72px] h-[88px] sm:w-28 sm:h-32 flex items-center justify-center backdrop-blur-sm transition-all duration-500"
        style={{
          backgroundColor: "rgba(255,255,255,0.8)",
          borderRadius: "var(--theme-radius)",
          boxShadow: "var(--theme-shadow)",
          border: "1px solid var(--theme-border)",
        }}
      >
        <span
          className="text-3xl sm:text-6xl font-serif tabular-nums"
          style={{ color: "var(--theme-text)" }}
        >
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      {/* Decorative corner accents */}
      <div
        className="absolute -top-1 -left-1 w-2 h-2 sm:w-3 sm:h-3"
        style={{
          borderTop: "1px solid var(--theme-border)",
          borderLeft: "1px solid var(--theme-border)",
        }}
      />
      <div
        className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3"
        style={{
          borderTop: "1px solid var(--theme-border)",
          borderRight: "1px solid var(--theme-border)",
        }}
      />
      <div
        className="absolute -bottom-1 -left-1 w-2 h-2 sm:w-3 sm:h-3"
        style={{
          borderBottom: "1px solid var(--theme-border)",
          borderLeft: "1px solid var(--theme-border)",
        }}
      />
      <div
        className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3"
        style={{
          borderBottom: "1px solid var(--theme-border)",
          borderRight: "1px solid var(--theme-border)",
        }}
      />
    </div>
    {/* Label */}
    <span
      className="mt-3 sm:mt-4 text-[9px] sm:text-xs font-elegant uppercase tracking-[0.2em] sm:tracking-[0.3em]"
      style={{ color: "var(--theme-text-muted)" }}
    >
      {label}
    </span>
  </div>
);

// Separator dots for desktop
const Separator = () => (
  <div className="hidden sm:flex flex-col items-center gap-2 opacity-30 my-auto pb-4 mx-4 sm:mx-6">
    <div
      className="w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: "var(--theme-primary)" }}
    />
    <div
      className="w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: "var(--theme-primary)" }}
    />
  </div>
);

// Calculate time difference helper
function calculateTimeLeft(targetDate: string) {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
  };
}

export const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const { t } = useTheme();
  // Initialize with calculated value using lazy initializer
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  const updateTime = useCallback(() => {
    setTimeLeft(calculateTimeLeft(targetDate));
  }, [targetDate]);

  useEffect(() => {
    // Update every second
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, [updateTime]);

  const timeData = [
    { value: timeLeft.days, label: t.days },
    { value: timeLeft.hours, label: t.hours },
    { value: timeLeft.minutes, label: t.minutes },
    { value: timeLeft.seconds, label: t.seconds },
  ];

  // coutdown layout
  return (
    <div className="py-6 sm:py-8">
      {/* Mobile: 2x2 grid */}
      <div className="grid grid-cols-2 gap-4 sm:hidden max-w-[200px] mx-auto">
        {timeData.map((item) => (
          <TimeBlock key={item.label} value={item.value} label={item.label} />
        ))}
      </div>

      {/* Desktop: horizontal with separators */}
      <div className="hidden sm:flex justify-center items-start">
        <TimeBlock value={timeData[0].value} label={timeData[0].label} />
        <Separator />
        <TimeBlock value={timeData[1].value} label={timeData[1].label} />
        <Separator />
        <TimeBlock value={timeData[2].value} label={timeData[2].label} />
        <Separator />
        <TimeBlock value={timeData[3].value} label={timeData[3].label} />
      </div>
    </div>
  );
};
