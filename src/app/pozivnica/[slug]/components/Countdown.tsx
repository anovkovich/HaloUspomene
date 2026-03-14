"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "./ThemeProvider";

interface CountdownProps {
  targetDate: string;
  inverted?: boolean;
}

interface TimeBlockProps {
  value: number;
  label: string;
  inverted?: boolean;
}

const TimeBlock: React.FC<TimeBlockProps> = ({ value, label, inverted }) => (
  <div className="flex flex-col items-center px-5 sm:px-7 py-5 sm:py-6"
    style={{
      backgroundColor: inverted ? "rgba(255,255,255,0.12)" : "var(--theme-surface)",
      borderTop: inverted ? "2px solid rgba(255,255,255,0.35)" : "2px solid color-mix(in srgb, var(--theme-primary) 45%, transparent)",
    }}
  >
    <span
      className="text-[64px] sm:text-[88px] lg:text-[108px] font-serif tabular-nums leading-none"
      style={{ color: inverted ? "rgba(255,255,255,0.95)" : "var(--theme-primary)" }}
    >
      {value.toString().padStart(2, "0")}
    </span>
    <span
      className="mt-3 text-[8px] sm:text-[9px] font-elegant uppercase tracking-[0.55em]"
      style={{ color: inverted ? "rgba(255,255,255,0.5)" : "var(--theme-text-light)" }}
    >
      {label}
    </span>
  </div>
);

const Separator = () => (
  <div className="self-center mx-1 sm:mx-2">
    <span
      className="text-2xl sm:text-3xl font-serif"
      style={{ color: "rgba(255,255,255,0.35)" }}
    >
      ·
    </span>
  </div>
);

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

export const Countdown: React.FC<CountdownProps> = ({ targetDate, inverted }) => {
  const { t } = useTheme();
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  const updateTime = useCallback(() => {
    setTimeLeft(calculateTimeLeft(targetDate));
  }, [targetDate]);

  useEffect(() => {
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [updateTime]);

  const timeData = [
    { value: timeLeft.days, label: t.days },
    { value: timeLeft.hours, label: t.hours },
    { value: timeLeft.minutes, label: t.minutes },
    { value: timeLeft.seconds, label: t.seconds },
  ];

  return (
    <div className="py-4 sm:py-6">
      {/* Mobile: 2x2 grid */}
      <div className="grid grid-cols-2 gap-3 sm:hidden max-w-[300px] mx-auto">
        {timeData.map((item) => (
          <TimeBlock key={item.label} value={item.value} label={item.label} inverted={inverted} />
        ))}
      </div>

      {/* Desktop: horizontal */}
      <div className="hidden sm:flex justify-center items-center gap-3 lg:gap-4">
        {timeData.map((item, i) => (
          <React.Fragment key={item.label}>
            <TimeBlock value={item.value} label={item.label} inverted={inverted} />
            {i < timeData.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
