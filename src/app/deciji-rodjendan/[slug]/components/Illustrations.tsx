"use client";

import React from "react";

// ─── Shared positioning helper ──────────────────────────────────────────────

interface FloatProps {
  x: string;
  y: string;
  size?: number;
  delay?: number;
  duration?: number;
  opacity?: number;
  rotate?: number;
  className?: string;
}

function Float({
  x,
  y,
  size = 40,
  delay = 0,
  duration = 6,
  opacity = 0.5,
  rotate = 0,
  className = "animate-float",
  children,
}: FloatProps & { children: React.ReactNode }) {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        opacity,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Universal SVGs ─────────────────────────────────────────────────────────

export function Balloon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 64" fill="none" width="100%" height="100%">
      <ellipse cx="20" cy="22" rx="16" ry="21" fill={color} />
      <ellipse cx="20" cy="22" rx="16" ry="21" fill="white" opacity="0.15" />
      <ellipse cx="14" cy="15" rx="5" ry="7" fill="white" opacity="0.25" />
      <polygon points="17,43 23,43 20,48" fill={color} opacity="0.8" />
      <path
        d="M20 48 Q18 54 20 60 Q22 54 20 48"
        stroke={color}
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

function StarSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} width="100%" height="100%">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

function Sparkle({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} width="100%" height="100%">
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
    </svg>
  );
}

function Circle({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <circle cx="12" cy="12" r="10" fill={color} />
    </svg>
  );
}

function Heart({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} width="100%" height="100%">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function Diamond({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} width="100%" height="100%">
      <polygon points="12,2 22,12 12,22 2,12" />
    </svg>
  );
}

function ConfettiRect({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 12 6" width="100%" height="100%">
      <rect x="1" y="1" width="10" height="4" rx="2" fill={color} />
    </svg>
  );
}

// ─── Theme-specific SVGs ────────────────────────────────────────────────────

function Rocket({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" width="100%" height="100%">
      <path
        d="M20 4 C20 4 28 12 28 24 L24 28 L16 28 L12 24 C12 12 20 4 20 4Z"
        fill={color}
      />
      <circle cx="20" cy="18" r="3" fill="white" opacity="0.8" />
      <path d="M12 24 L8 30 L14 28Z" fill={color} opacity="0.6" />
      <path d="M28 24 L32 30 L26 28Z" fill={color} opacity="0.6" />
      <path d="M17 28 L16 36 L20 32 L24 36 L23 28" fill={color} opacity="0.5" />
    </svg>
  );
}

function Planet({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" width="100%" height="100%">
      <circle cx="20" cy="20" r="12" fill={color} />
      <circle cx="20" cy="20" r="12" fill="white" opacity="0.1" />
      <ellipse
        cx="20"
        cy="20"
        rx="18"
        ry="5"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
        transform="rotate(-20 20 20)"
      />
      <circle cx="16" cy="16" r="2" fill="white" opacity="0.2" />
      <circle cx="24" cy="22" r="1.5" fill="white" opacity="0.15" />
    </svg>
  );
}

function Moon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
      <path
        d="M22 16a10 10 0 01-10 10A10 10 0 0112 6a10 10 0 0010 10z"
        fill={color}
      />
      <circle cx="15" cy="12" r="1" fill="white" opacity="0.3" />
      <circle cx="19" cy="18" r="1.5" fill="white" opacity="0.2" />
    </svg>
  );
}

function Cloud({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 28" fill="none" width="100%" height="100%">
      <ellipse cx="24" cy="18" rx="16" ry="9" fill={color} />
      <ellipse cx="16" cy="14" rx="10" ry="8" fill={color} />
      <ellipse cx="32" cy="14" rx="10" ry="8" fill={color} />
      <ellipse cx="24" cy="10" rx="8" ry="7" fill={color} />
    </svg>
  );
}

function Butterfly({ color, color2 }: { color: string; color2: string }) {
  return (
    <svg viewBox="0 0 40 32" fill="none" width="100%" height="100%">
      <ellipse cx="12" cy="10" rx="10" ry="8" fill={color} opacity="0.8" />
      <ellipse cx="28" cy="10" rx="10" ry="8" fill={color} opacity="0.8" />
      <ellipse cx="12" cy="22" rx="7" ry="6" fill={color2} opacity="0.7" />
      <ellipse cx="28" cy="22" rx="7" ry="6" fill={color2} opacity="0.7" />
      <rect
        x="19"
        y="4"
        width="2"
        height="24"
        rx="1"
        fill={color}
        opacity="0.6"
      />
      <circle cx="12" cy="10" r="3" fill="white" opacity="0.3" />
      <circle cx="28" cy="10" r="3" fill="white" opacity="0.3" />
    </svg>
  );
}

function MagicWand({ color, color2 }: { color: string; color2: string }) {
  return (
    <svg viewBox="0 0 40 52" fill="none" width="100%" height="100%">
      {/* Stick — diagonal line from star to bottom-right */}
      <line
        x1="20"
        y1="22"
        x2="34"
        y2="50"
        stroke={color2}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Star on top of stick — rotated ~18deg */}
      <g transform="rotate(47 20 16)">
        <polygon
          points="20,2 23,13 34,13 25.5,19.5 28.5,30 20,24 11.5,30 14.5,19.5 6,13 17,13"
          fill={color}
        />
        <polygon
          points="20,2 23,13 34,13 25.5,19.5 28.5,30 20,24 11.5,30 14.5,19.5 6,13 17,13"
          fill="white"
          opacity="0.2"
        />
      </g>
      {/* Sparkle dots around star */}
      <circle cx="6" cy="6" r="1.5" fill={color} opacity="0.5" />
      <circle cx="34" cy="5" r="1" fill={color} opacity="0.4" />
      <circle cx="3" cy="18" r="1" fill={color2} opacity="0.4" />
      <circle cx="37" cy="16" r="1.5" fill={color2} opacity="0.3" />
    </svg>
  );
}

function Flower({ color, color2 }: { color: string; color2: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" width="100%" height="100%">
      <circle cx="18" cy="10" r="6" fill={color} opacity="0.7" />
      <circle cx="10" cy="16" r="6" fill={color} opacity="0.6" />
      <circle cx="26" cy="16" r="6" fill={color} opacity="0.6" />
      <circle cx="12" cy="24" r="6" fill={color} opacity="0.7" />
      <circle cx="24" cy="24" r="6" fill={color} opacity="0.7" />
      <circle cx="18" cy="18" r="5" fill={color2} />
    </svg>
  );
}

function Crown({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 32" fill="none" width="100%" height="100%">
      <path d="M4 26 L4 12 L12 18 L20 6 L28 18 L36 12 L36 26Z" fill={color} />
      <circle cx="4" cy="12" r="2.5" fill={color} />
      <circle cx="20" cy="6" r="2.5" fill={color} />
      <circle cx="36" cy="12" r="2.5" fill={color} />
      <rect
        x="4"
        y="24"
        width="32"
        height="4"
        rx="1"
        fill={color}
        opacity="0.8"
      />
      <circle cx="12" cy="22" r="1.5" fill="white" opacity="0.4" />
      <circle cx="20" cy="22" r="1.5" fill="white" opacity="0.4" />
      <circle cx="28" cy="22" r="1.5" fill="white" opacity="0.4" />
    </svg>
  );
}

function Cake({ color, color2 }: { color: string; color2: string }) {
  return (
    <svg viewBox="0 0 40 44" fill="none" width="100%" height="100%">
      <rect x="6" y="20" width="28" height="18" rx="4" fill={color} />
      <rect
        x="6"
        y="20"
        width="28"
        height="6"
        rx="2"
        fill={color2}
        opacity="0.5"
      />
      <rect x="18" y="10" width="4" height="12" rx="1" fill={color2} />
      <ellipse cx="20" cy="8" rx="4" ry="5" fill={color} opacity="0.8" />
      <ellipse cx="20" cy="6" rx="2" ry="2" fill="white" opacity="0.4" />
      <path
        d="M6 32 Q13 36 20 32 Q27 28 34 32"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
      />
    </svg>
  );
}

function Elephant({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 44 36" fill="none" width="100%" height="100%">
      <ellipse cx="24" cy="20" rx="14" ry="12" fill={color} />
      <circle cx="12" cy="14" r="10" fill={color} />
      <circle cx="8" cy="14" r="7" fill={color} opacity="0.8" />
      <path d="M4 18 Q2 24 4 30 Q6 28 6 24" fill={color} opacity="0.7" />
      <circle cx="10" cy="12" r="2" fill="white" opacity="0.8" />
      <circle cx="10" cy="12" r="1" fill={color} opacity="0.9" />
      <rect
        x="18"
        y="30"
        width="4"
        height="6"
        rx="2"
        fill={color}
        opacity="0.7"
      />
      <rect
        x="28"
        y="30"
        width="4"
        height="6"
        rx="2"
        fill={color}
        opacity="0.7"
      />
    </svg>
  );
}

function Leaf({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 28 36" fill="none" width="100%" height="100%">
      <path d="M14 4 Q26 12 24 28 Q14 24 4 28 Q2 12 14 4Z" fill={color} />
      <path d="M14 8 L14 28" stroke="white" strokeWidth="1" opacity="0.3" />
      <path d="M14 14 L8 20" stroke="white" strokeWidth="0.8" opacity="0.2" />
      <path d="M14 18 L20 22" stroke="white" strokeWidth="0.8" opacity="0.2" />
    </svg>
  );
}

function Monkey({ color, color2 }: { color: string; color2: string }) {
  return (
    <svg viewBox="0 0 44 48" fill="none" width="100%" height="100%">
      {/* Ears */}
      <circle cx="8" cy="16" r="7" fill={color} />
      <circle cx="36" cy="16" r="7" fill={color} />
      <circle cx="8" cy="16" r="4" fill={color2} opacity="0.5" />
      <circle cx="36" cy="16" r="4" fill={color2} opacity="0.5" />
      {/* Head */}
      <circle cx="22" cy="18" r="14" fill={color} />
      {/* Face area */}
      <ellipse cx="22" cy="22" rx="9" ry="8" fill={color2} opacity="0.35" />
      {/* Eyes */}
      <ellipse cx="17" cy="16" rx="3" ry="3.5" fill="white" opacity="0.9" />
      <ellipse cx="27" cy="16" rx="3" ry="3.5" fill="white" opacity="0.9" />
      <circle cx="17.5" cy="16.5" r="1.8" fill={color2} />
      <circle cx="27.5" cy="16.5" r="1.8" fill={color2} />
      <circle cx="18" cy="15.8" r="0.6" fill="white" />
      <circle cx="28" cy="15.8" r="0.6" fill="white" />
      {/* Nose */}
      <ellipse cx="22" cy="22" rx="4" ry="3" fill={color2} opacity="0.4" />
      <circle cx="20.5" cy="21.5" r="1" fill={color2} opacity="0.6" />
      <circle cx="23.5" cy="21.5" r="1" fill={color2} opacity="0.6" />
      {/* Smile */}
      <path d="M19 25 Q22 28 25 25" stroke={color2} strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* Tail — curly */}
      <path d="M30 30 Q38 30 38 38 Q38 44 32 44 Q28 44 28 40" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}

function Lion({ color, color2 }: { color: string; color2: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" width="100%" height="100%">
      {/* Mane — spiky rays around head */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <ellipse
          key={angle}
          cx="22"
          cy="6"
          rx="4"
          ry="7"
          fill={color2}
          opacity="0.5"
          transform={`rotate(${angle} 22 22)`}
        />
      ))}
      {/* Face */}
      <circle cx="22" cy="22" r="13" fill={color} />
      {/* Ears */}
      <circle cx="12" cy="12" r="4" fill={color} />
      <circle cx="32" cy="12" r="4" fill={color} />
      <circle cx="12" cy="12" r="2" fill={color2} opacity="0.4" />
      <circle cx="32" cy="12" r="2" fill={color2} opacity="0.4" />
      {/* Eyes */}
      <ellipse cx="17" cy="20" rx="2.5" ry="3" fill="white" opacity="0.9" />
      <ellipse cx="27" cy="20" rx="2.5" ry="3" fill="white" opacity="0.9" />
      <circle cx="17" cy="20.5" r="1.5" fill={color2} />
      <circle cx="27" cy="20.5" r="1.5" fill={color2} />
      <circle cx="17.5" cy="20" r="0.6" fill="white" />
      <circle cx="27.5" cy="20" r="0.6" fill="white" />
      {/* Nose */}
      <ellipse cx="22" cy="26" rx="3" ry="2" fill={color2} opacity="0.5" />
      <ellipse cx="22" cy="25.5" rx="1.5" ry="1" fill={color2} opacity="0.7" />
      {/* Mouth */}
      <path d="M20 27.5 Q22 30 24 27.5" stroke={color2} strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* Whisker dots */}
      <circle cx="14" cy="26" r="0.6" fill={color2} opacity="0.3" />
      <circle cx="12" cy="25" r="0.6" fill={color2} opacity="0.3" />
      <circle cx="30" cy="26" r="0.6" fill={color2} opacity="0.3" />
      <circle cx="32" cy="25" r="0.6" fill={color2} opacity="0.3" />
    </svg>
  );
}

function SafariTree({ color, color2 }: { color: string; color2: string }) {
  return (
    <svg viewBox="0 0 48 56" fill="none" width="100%" height="100%">
      {/* Trunk */}
      <rect x="21" y="28" width="6" height="26" rx="2" fill={color2} />
      <rect x="21" y="28" width="6" height="26" rx="2" fill="white" opacity="0.1" />
      {/* Branch left */}
      <line x1="24" y1="36" x2="12" y2="28" stroke={color2} strokeWidth="3" strokeLinecap="round" />
      {/* Branch right */}
      <line x1="24" y1="34" x2="38" y2="26" stroke={color2} strokeWidth="3" strokeLinecap="round" />
      {/* Canopy — flat acacia-style spread */}
      <ellipse cx="24" cy="18" rx="22" ry="14" fill={color} opacity="0.8" />
      <ellipse cx="24" cy="16" rx="18" ry="10" fill={color} />
      <ellipse cx="16" cy="20" rx="10" ry="8" fill={color} opacity="0.7" />
      <ellipse cx="32" cy="20" rx="10" ry="8" fill={color} opacity="0.7" />
      {/* Highlight on canopy */}
      <ellipse cx="20" cy="14" rx="8" ry="5" fill="white" opacity="0.12" />
    </svg>
  );
}

function Sun({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" width="100%" height="100%">
      {/* Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="22"
          y1="6"
          x2="22"
          y2="1"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
          transform={`rotate(${angle} 22 22)`}
        />
      ))}
      {/* Main circle */}
      <circle cx="22" cy="22" r="11" fill={color} />
      <circle cx="22" cy="22" r="11" fill="white" opacity="0.15" />
      {/* Highlight */}
      <circle cx="18" cy="18" r="4" fill="white" opacity="0.2" />
      {/* Smile */}
      <path d="M17 24 Q22 28 27 24" stroke="white" strokeWidth="1.2" fill="none" opacity="0.4" />
      {/* Eyes */}
      <circle cx="18" cy="20" r="1.2" fill="white" opacity="0.5" />
      <circle cx="26" cy="20" r="1.2" fill="white" opacity="0.5" />
    </svg>
  );
}

function WhiteCloud() {
  return (
    <svg viewBox="0 0 56 30" fill="none" width="100%" height="100%">
      <ellipse cx="28" cy="20" rx="20" ry="10" fill="#d0d8e8" />
      <ellipse cx="18" cy="16" rx="14" ry="10" fill="#dce3ef" />
      <ellipse cx="38" cy="16" rx="14" ry="10" fill="#dce3ef" />
      <ellipse cx="28" cy="12" rx="12" ry="9" fill="#e4eaf4" />
      <ellipse cx="22" cy="10" rx="8" ry="7" fill="#eaeff7" />
      <ellipse cx="34" cy="10" rx="8" ry="7" fill="#eaeff7" />
    </svg>
  );
}

function Flag({ color, color2 }: { color: string; color2: string }) {
  return (
    <svg viewBox="0 0 28 40" fill="none" width="100%" height="100%">
      <rect
        x="4"
        y="4"
        width="2"
        height="34"
        rx="1"
        fill={color2}
        opacity="0.6"
      />
      <path d="M6 4 L26 10 L6 18Z" fill={color} />
      <path d="M6 4 L26 10 L6 18Z" fill="white" opacity="0.15" />
    </svg>
  );
}

// ─── Age badge ──────────────────────────────────────────────────────────────

export function AgeBadge({
  age,
  primaryColor,
  secondaryColor,
}: {
  age: number;
  primaryColor: string;
  secondaryColor: string;
}) {
  return (
    <div
      className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
        boxShadow: `0 8px 30px ${primaryColor}40`,
      }}
    >
      <span
        className="text-5xl sm:text-7xl font-bold text-white drop-shadow-lg"
        style={{ fontFamily: "var(--theme-display-font)" }}
      >
        {age}
      </span>
      <div className="absolute inset-0 rounded-full border-4 border-white/20" />
    </div>
  );
}

// ─── Theme illustration sets ────────────────────────────────────────────────

interface IllustrationItem {
  component: React.ReactNode;
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  rotate: number;
  anim: string;
}

function getThemeIllustrations(
  illustration: string,
  c: string[],
): IllustrationItem[] {
  const p = c[0],
    s = c[1],
    t = c[2],
    f = c[3],
    v = c[4] || c[0];

  // F = float (bob up/down/side), D = drift (wander around), S = sway (swing side to side), T = twinkle (pulse)
  const F = "animate-birthday-float",
    D = "animate-birthday-drift",
    S = "animate-birthday-sway",
    T = "animate-twinkle";

  const sets: Record<string, IllustrationItem[]> = {
    adventure: [
      {
        component: <Rocket color={p} />,
        x: "1%",
        y: "3%",
        size: 70,
        delay: 0,
        duration: 7,
        opacity: 0.45,
        rotate: -20,
        anim: F,
      },
      {
        component: <Cloud color={p} />,
        x: "60%",
        y: "1%",
        size: 110,
        delay: 1,
        duration: 14,
        opacity: 0.15,
        rotate: 0,
        anim: S,
      },
      {
        component: <StarSvg color={s} />,
        x: "88%",
        y: "10%",
        size: 26,
        delay: 0.5,
        duration: 3,
        opacity: 0.5,
        rotate: 15,
        anim: T,
      },
      {
        component: <Balloon color={s} />,
        x: "90%",
        y: "20%",
        size: 60,
        delay: 2,
        duration: 9,
        opacity: 0.5,
        rotate: 5,
        anim: D,
      },
      {
        component: <StarSvg color={t} />,
        x: "12%",
        y: "65%",
        size: 22,
        delay: 1.5,
        duration: 2.5,
        opacity: 0.4,
        rotate: 30,
        anim: T,
      },
      {
        component: <Cloud color={t} />,
        x: "2%",
        y: "35%",
        size: 90,
        delay: 3,
        duration: 16,
        opacity: 0.1,
        rotate: 0,
        anim: S,
      },
      {
        component: <Rocket color={f} />,
        x: "80%",
        y: "48%",
        size: 55,
        delay: 1.5,
        duration: 8,
        opacity: 0.35,
        rotate: 25,
        anim: F,
      },
      {
        component: <Balloon color={p} />,
        x: "8%",
        y: "78%",
        size: 50,
        delay: 0.8,
        duration: 8,
        opacity: 0.4,
        rotate: -5,
        anim: D,
      },
      {
        component: <Sparkle color={v} />,
        x: "48%",
        y: "6%",
        size: 20,
        delay: 2,
        duration: 2.5,
        opacity: 0.45,
        rotate: 0,
        anim: T,
      },
      {
        component: <StarSvg color={f} />,
        x: "55%",
        y: "72%",
        size: 24,
        delay: 0,
        duration: 3,
        opacity: 0.35,
        rotate: -10,
        anim: T,
      },
      {
        component: <Balloon color={t} />,
        x: "35%",
        y: "88%",
        size: 45,
        delay: 0.3,
        duration: 10,
        opacity: 0.3,
        rotate: 8,
        anim: F,
      },
      {
        component: <Cloud color={s} />,
        x: "30%",
        y: "30%",
        size: 75,
        delay: 4,
        duration: 18,
        opacity: 0.08,
        rotate: 0,
        anim: S,
      },
      {
        component: <Sparkle color={p} />,
        x: "72%",
        y: "82%",
        size: 18,
        delay: 1.2,
        duration: 2,
        opacity: 0.35,
        rotate: 20,
        anim: T,
      },
      {
        component: <Rocket color={s} />,
        x: "40%",
        y: "50%",
        size: 40,
        delay: 2.5,
        duration: 9,
        opacity: 0.2,
        rotate: -30,
        anim: D,
      },
    ],
    animals: [
      {
        component: <Elephant color={p} />,
        x: "0%",
        y: "5%",
        size: 80,
        delay: 0,
        duration: 10,
        opacity: 0.4,
        rotate: 0,
        anim: D,
      },
      {
        component: <Monkey color={s} color2={p} />,
        x: "82%",
        y: "2%",
        size: 65,
        delay: 1,
        duration: 11,
        opacity: 0.4,
        rotate: 3,
        anim: F,
      },
      {
        component: <Leaf color={p} />,
        x: "18%",
        y: "18%",
        size: 35,
        delay: 0.5,
        duration: 7,
        opacity: 0.35,
        rotate: -25,
        anim: S,
      },
      {
        component: <Leaf color={t} />,
        x: "72%",
        y: "30%",
        size: 30,
        delay: 2,
        duration: 8,
        opacity: 0.3,
        rotate: 35,
        anim: F,
      },
      {
        component: <Lion color={s} color2={p} />,
        x: "2%",
        y: "48%",
        size: 65,
        delay: 1.5,
        duration: 9,
        opacity: 0.35,
        rotate: 0,
        anim: D,
      },
      {
        component: <Leaf color={f} />,
        x: "88%",
        y: "58%",
        size: 32,
        delay: 0,
        duration: 6,
        opacity: 0.3,
        rotate: 50,
        anim: S,
      },
      {
        component: <Circle color={t} />,
        x: "42%",
        y: "4%",
        size: 16,
        delay: 1,
        duration: 3,
        opacity: 0.25,
        rotate: 0,
        anim: T,
      },
      {
        component: <Leaf color={p} />,
        x: "50%",
        y: "75%",
        size: 38,
        delay: 3,
        duration: 9,
        opacity: 0.25,
        rotate: -50,
        anim: F,
      },
      {
        component: <Circle color={v} />,
        x: "28%",
        y: "65%",
        size: 14,
        delay: 0.5,
        duration: 2.5,
        opacity: 0.3,
        rotate: 0,
        anim: T,
      },
      {
        component: <Elephant color={t} />,
        x: "65%",
        y: "72%",
        size: 60,
        delay: 2,
        duration: 11,
        opacity: 0.25,
        rotate: -3,
        anim: D,
      },
      {
        component: <Monkey color={f} color2={t} />,
        x: "35%",
        y: "40%",
        size: 48,
        delay: 3.5,
        duration: 10,
        opacity: 0.18,
        rotate: -5,
        anim: F,
      },
      {
        component: <Leaf color={s} />,
        x: "92%",
        y: "85%",
        size: 28,
        delay: 1.8,
        duration: 7,
        opacity: 0.2,
        rotate: 20,
        anim: S,
      },
      {
        component: <Lion color={f} color2={t} />,
        x: "20%",
        y: "88%",
        size: 50,
        delay: 0.8,
        duration: 10,
        opacity: 0.2,
        rotate: 0,
        anim: D,
      },
    ],
    space: [
      {
        component: <Rocket color={p} />,
        x: "2%",
        y: "5%",
        size: 75,
        delay: 0,
        duration: 8,
        opacity: 0.5,
        rotate: -30,
        anim: D,
      },
      {
        component: <Planet color={s} />,
        x: "75%",
        y: "2%",
        size: 80,
        delay: 1,
        duration: 12,
        opacity: 0.4,
        rotate: 0,
        anim: F,
      },
      {
        component: <Moon color={p} />,
        x: "86%",
        y: "40%",
        size: 55,
        delay: 2,
        duration: 10,
        opacity: 0.35,
        rotate: 0,
        anim: D,
      },
      {
        component: <StarSvg color={t} />,
        x: "22%",
        y: "12%",
        size: 20,
        delay: 0,
        duration: 2,
        opacity: 0.55,
        rotate: 0,
        anim: T,
      },
      {
        component: <StarSvg color={f} />,
        x: "58%",
        y: "22%",
        size: 16,
        delay: 1.5,
        duration: 2.5,
        opacity: 0.5,
        rotate: 15,
        anim: T,
      },
      {
        component: <StarSvg color={v} />,
        x: "38%",
        y: "3%",
        size: 14,
        delay: 0.8,
        duration: 2,
        opacity: 0.45,
        rotate: 0,
        anim: T,
      },
      {
        component: <Sparkle color={p} />,
        x: "12%",
        y: "55%",
        size: 22,
        delay: 2.5,
        duration: 3,
        opacity: 0.4,
        rotate: 0,
        anim: T,
      },
      {
        component: <Planet color={t} />,
        x: "5%",
        y: "70%",
        size: 60,
        delay: 1,
        duration: 14,
        opacity: 0.25,
        rotate: 10,
        anim: F,
      },
      {
        component: <StarSvg color={s} />,
        x: "70%",
        y: "65%",
        size: 22,
        delay: 0.3,
        duration: 2.8,
        opacity: 0.45,
        rotate: -10,
        anim: T,
      },
      {
        component: <Rocket color={t} />,
        x: "72%",
        y: "78%",
        size: 50,
        delay: 3,
        duration: 7,
        opacity: 0.3,
        rotate: 35,
        anim: D,
      },
      {
        component: <Sparkle color={f} />,
        x: "48%",
        y: "45%",
        size: 16,
        delay: 1,
        duration: 2,
        opacity: 0.35,
        rotate: 45,
        anim: T,
      },
      {
        component: <StarSvg color={p} />,
        x: "90%",
        y: "82%",
        size: 18,
        delay: 2,
        duration: 2,
        opacity: 0.4,
        rotate: 0,
        anim: T,
      },
      {
        component: <Moon color={s} />,
        x: "30%",
        y: "82%",
        size: 40,
        delay: 1.8,
        duration: 11,
        opacity: 0.2,
        rotate: -15,
        anim: F,
      },
      {
        component: <Planet color={f} />,
        x: "50%",
        y: "60%",
        size: 45,
        delay: 0.5,
        duration: 13,
        opacity: 0.15,
        rotate: 5,
        anim: D,
      },
    ],
    fairy: [
      {
        component: <MagicWand color={p} color2={s} />,
        x: "2%",
        y: "5%",
        size: 70,
        delay: 0,
        duration: 8,
        opacity: 0.45,
        rotate: -10,
        anim: D,
      },
      {
        component: <Flower color={p} color2={t} />,
        x: "78%",
        y: "3%",
        size: 58,
        delay: 1,
        duration: 9,
        opacity: 0.4,
        rotate: 5,
        anim: F,
      },
      {
        component: <Sparkle color={s} />,
        x: "22%",
        y: "15%",
        size: 20,
        delay: 0.5,
        duration: 2.5,
        opacity: 0.5,
        rotate: 0,
        anim: T,
      },
      {
        component: <Heart color={p} />,
        x: "86%",
        y: "25%",
        size: 28,
        delay: 2,
        duration: 7,
        opacity: 0.4,
        rotate: -15,
        anim: F,
      },
      {
        component: <MagicWand color={s} color2={p} />,
        x: "72%",
        y: "48%",
        size: 60,
        delay: 1.5,
        duration: 9,
        opacity: 0.35,
        rotate: 12,
        anim: D,
      },
      {
        component: <Flower color={t} color2={s} />,
        x: "1%",
        y: "42%",
        size: 48,
        delay: 0,
        duration: 8,
        opacity: 0.35,
        rotate: 10,
        anim: F,
      },
      {
        component: <Sparkle color={f} />,
        x: "52%",
        y: "8%",
        size: 16,
        delay: 1,
        duration: 2,
        opacity: 0.4,
        rotate: 30,
        anim: T,
      },
      {
        component: <Heart color={s} />,
        x: "12%",
        y: "70%",
        size: 24,
        delay: 2,
        duration: 6,
        opacity: 0.35,
        rotate: 10,
        anim: S,
      },
      {
        component: <Flower color={p} color2={f} />,
        x: "55%",
        y: "75%",
        size: 50,
        delay: 3,
        duration: 10,
        opacity: 0.3,
        rotate: -5,
        anim: F,
      },
      {
        component: <Sparkle color={p} />,
        x: "38%",
        y: "35%",
        size: 14,
        delay: 0.8,
        duration: 2.2,
        opacity: 0.35,
        rotate: 0,
        anim: T,
      },
      {
        component: <MagicWand color={t} color2={f} />,
        x: "30%",
        y: "82%",
        size: 55,
        delay: 1.2,
        duration: 8,
        opacity: 0.25,
        rotate: -18,
        anim: D,
      },
      {
        component: <Heart color={t} />,
        x: "90%",
        y: "70%",
        size: 20,
        delay: 0.3,
        duration: 5,
        opacity: 0.3,
        rotate: 5,
        anim: F,
      },
      {
        component: <Flower color={s} color2={p} />,
        x: "42%",
        y: "55%",
        size: 35,
        delay: 2.5,
        duration: 9,
        opacity: 0.2,
        rotate: -10,
        anim: S,
      },
    ],
    princess: [
      {
        component: <Crown color={s} />,
        x: "2%",
        y: "3%",
        size: 75,
        delay: 0,
        duration: 9,
        opacity: 0.45,
        rotate: -8,
        anim: D,
      },
      {
        component: <Heart color={p} />,
        x: "82%",
        y: "5%",
        size: 40,
        delay: 0.5,
        duration: 7,
        opacity: 0.45,
        rotate: 0,
        anim: F,
      },
      {
        component: <Sparkle color={s} />,
        x: "28%",
        y: "10%",
        size: 22,
        delay: 1,
        duration: 2.5,
        opacity: 0.55,
        rotate: 0,
        anim: T,
      },
      {
        component: <Diamond color={p} />,
        x: "88%",
        y: "30%",
        size: 24,
        delay: 1.5,
        duration: 3,
        opacity: 0.4,
        rotate: 15,
        anim: T,
      },
      {
        component: <Crown color={p} />,
        x: "74%",
        y: "52%",
        size: 60,
        delay: 2,
        duration: 9,
        opacity: 0.3,
        rotate: 8,
        anim: D,
      },
      {
        component: <Heart color={s} />,
        x: "5%",
        y: "40%",
        size: 30,
        delay: 0,
        duration: 6,
        opacity: 0.4,
        rotate: -10,
        anim: S,
      },
      {
        component: <Sparkle color={f} />,
        x: "48%",
        y: "3%",
        size: 16,
        delay: 2,
        duration: 2,
        opacity: 0.45,
        rotate: 45,
        anim: T,
      },
      {
        component: <Heart color={t} />,
        x: "16%",
        y: "65%",
        size: 28,
        delay: 1,
        duration: 7,
        opacity: 0.35,
        rotate: 5,
        anim: F,
      },
      {
        component: <Diamond color={s} />,
        x: "62%",
        y: "72%",
        size: 20,
        delay: 0.8,
        duration: 3,
        opacity: 0.35,
        rotate: 30,
        anim: T,
      },
      {
        component: <Sparkle color={p} />,
        x: "40%",
        y: "48%",
        size: 14,
        delay: 1.5,
        duration: 2,
        opacity: 0.3,
        rotate: 0,
        anim: T,
      },
      {
        component: <Crown color={t} />,
        x: "10%",
        y: "85%",
        size: 50,
        delay: 3,
        duration: 10,
        opacity: 0.25,
        rotate: -5,
        anim: D,
      },
      {
        component: <Heart color={f} />,
        x: "70%",
        y: "85%",
        size: 22,
        delay: 0.3,
        duration: 6,
        opacity: 0.25,
        rotate: 12,
        anim: F,
      },
      {
        component: <Diamond color={t} />,
        x: "55%",
        y: "20%",
        size: 18,
        delay: 2.2,
        duration: 2.8,
        opacity: 0.3,
        rotate: -20,
        anim: T,
      },
      {
        component: <Crown color={s} />,
        x: "38%",
        y: "90%",
        size: 42,
        delay: 1.8,
        duration: 8,
        opacity: 0.18,
        rotate: 10,
        anim: S,
      },
    ],
    rainbow: [
      {
        component: <Sun color="#FFD93D" />,
        x: "1%",
        y: "1%",
        size: 90,
        delay: 0,
        duration: 14,
        opacity: 0.55,
        rotate: 0,
        anim: S,
      },
      {
        component: <WhiteCloud />,
        x: "55%",
        y: "2%",
        size: 110,
        delay: 0.5,
        duration: 18,
        opacity: 0.6,
        rotate: 0,
        anim: S,
      },
      {
        component: <Balloon color={p} />,
        x: "85%",
        y: "5%",
        size: 58,
        delay: 1,
        duration: 9,
        opacity: 0.45,
        rotate: 5,
        anim: F,
      },
      {
        component: <WhiteCloud />,
        x: "2%",
        y: "22%",
        size: 95,
        delay: 2,
        duration: 20,
        opacity: 0.5,
        rotate: 0,
        anim: S,
      },
      {
        component: <Balloon color={f} />,
        x: "48%",
        y: "18%",
        size: 50,
        delay: 1.5,
        duration: 10,
        opacity: 0.4,
        rotate: 0,
        anim: D,
      },
      {
        component: <Sun color="#FBBF24" />,
        x: "78%",
        y: "28%",
        size: 65,
        delay: 1.5,
        duration: 12,
        opacity: 0.4,
        rotate: 0,
        anim: S,
      },
      {
        component: <Heart color={p} />,
        x: "30%",
        y: "15%",
        size: 24,
        delay: 2,
        duration: 6,
        opacity: 0.4,
        rotate: -10,
        anim: F,
      },
      {
        component: <WhiteCloud />,
        x: "65%",
        y: "45%",
        size: 100,
        delay: 3,
        duration: 22,
        opacity: 0.45,
        rotate: 0,
        anim: S,
      },
      {
        component: <Balloon color={t} />,
        x: "5%",
        y: "58%",
        size: 55,
        delay: 2.5,
        duration: 8,
        opacity: 0.35,
        rotate: -8,
        anim: F,
      },
      {
        component: <Sun color="#FCA5A5" />,
        x: "15%",
        y: "42%",
        size: 55,
        delay: 3.5,
        duration: 15,
        opacity: 0.35,
        rotate: 0,
        anim: S,
      },
      {
        component: <WhiteCloud />,
        x: "25%",
        y: "68%",
        size: 90,
        delay: 1,
        duration: 19,
        opacity: 0.4,
        rotate: 0,
        anim: S,
      },
      {
        component: <Balloon color={v} />,
        x: "70%",
        y: "75%",
        size: 48,
        delay: 0.3,
        duration: 9,
        opacity: 0.3,
        rotate: 3,
        anim: D,
      },
      {
        component: <StarSvg color="#FFD93D" />,
        x: "90%",
        y: "60%",
        size: 22,
        delay: 1,
        duration: 2.5,
        opacity: 0.45,
        rotate: 15,
        anim: T,
      },
      {
        component: <Balloon color={s} />,
        x: "20%",
        y: "85%",
        size: 45,
        delay: 2.2,
        duration: 10,
        opacity: 0.25,
        rotate: -3,
        anim: F,
      },
      {
        component: <Sun color="#FFD93D" />,
        x: "82%",
        y: "82%",
        size: 50,
        delay: 0.8,
        duration: 13,
        opacity: 0.25,
        rotate: 0,
        anim: S,
      },
      {
        component: <WhiteCloud />,
        x: "48%",
        y: "88%",
        size: 80,
        delay: 4,
        duration: 17,
        opacity: 0.35,
        rotate: 0,
        anim: S,
      },
    ],
    safari: [
      {
        component: <SafariTree color={p} color2={s} />,
        x: "0%",
        y: "2%",
        size: 90,
        delay: 0,
        duration: 12,
        opacity: 0.35,
        rotate: 0,
        anim: S,
      },
      {
        component: <Monkey color={p} color2={s} />,
        x: "82%",
        y: "1%",
        size: 68,
        delay: 1,
        duration: 11,
        opacity: 0.4,
        rotate: 3,
        anim: F,
      },
      {
        component: <Lion color={p} color2={s} />,
        x: "76%",
        y: "40%",
        size: 65,
        delay: 2,
        duration: 9,
        opacity: 0.35,
        rotate: 0,
        anim: D,
      },
      {
        component: <Elephant color={t} />,
        x: "16%",
        y: "22%",
        size: 70,
        delay: 0.5,
        duration: 10,
        opacity: 0.3,
        rotate: 0,
        anim: D,
      },
      {
        component: <Leaf color={p} />,
        x: "68%",
        y: "25%",
        size: 30,
        delay: 2,
        duration: 8,
        opacity: 0.3,
        rotate: 40,
        anim: F,
      },
      {
        component: <SafariTree color={t} color2={f} />,
        x: "85%",
        y: "60%",
        size: 75,
        delay: 1,
        duration: 14,
        opacity: 0.25,
        rotate: 0,
        anim: S,
      },
      {
        component: <Leaf color={f} />,
        x: "48%",
        y: "8%",
        size: 32,
        delay: 0,
        duration: 6,
        opacity: 0.3,
        rotate: -30,
        anim: F,
      },
      {
        component: <Elephant color={p} />,
        x: "2%",
        y: "58%",
        size: 65,
        delay: 1.5,
        duration: 11,
        opacity: 0.25,
        rotate: 0,
        anim: D,
      },
      {
        component: <Monkey color={f} color2={t} />,
        x: "50%",
        y: "72%",
        size: 55,
        delay: 3,
        duration: 10,
        opacity: 0.22,
        rotate: -3,
        anim: F,
      },
      {
        component: <SafariTree color={s} color2={p} />,
        x: "25%",
        y: "80%",
        size: 70,
        delay: 2.5,
        duration: 13,
        opacity: 0.2,
        rotate: 0,
        anim: S,
      },
      {
        component: <Lion color={t} color2={f} />,
        x: "55%",
        y: "42%",
        size: 50,
        delay: 3.5,
        duration: 10,
        opacity: 0.18,
        rotate: 0,
        anim: D,
      },
      {
        component: <Leaf color={v} />,
        x: "35%",
        y: "50%",
        size: 28,
        delay: 1.2,
        duration: 7,
        opacity: 0.2,
        rotate: 30,
        anim: F,
      },
      {
        component: <Circle color={s} />,
        x: "42%",
        y: "5%",
        size: 16,
        delay: 0.8,
        duration: 2.5,
        opacity: 0.2,
        rotate: 0,
        anim: T,
      },
    ],
    circus: [
      {
        component: <Flag color={p} color2={s} />,
        x: "1%",
        y: "1%",
        size: 65,
        delay: 0,
        duration: 8,
        opacity: 0.5,
        rotate: -10,
        anim: F,
      },
      {
        component: <Balloon color={s} />,
        x: "82%",
        y: "3%",
        size: 65,
        delay: 0.5,
        duration: 9,
        opacity: 0.5,
        rotate: 5,
        anim: D,
      },
      {
        component: <StarSvg color={p} />,
        x: "22%",
        y: "10%",
        size: 28,
        delay: 1,
        duration: 2.5,
        opacity: 0.55,
        rotate: 0,
        anim: T,
      },
      {
        component: <Balloon color={p} />,
        x: "48%",
        y: "0%",
        size: 55,
        delay: 1.5,
        duration: 8,
        opacity: 0.45,
        rotate: -3,
        anim: F,
      },
      {
        component: <Flag color={t} color2={p} />,
        x: "85%",
        y: "35%",
        size: 52,
        delay: 2,
        duration: 7,
        opacity: 0.35,
        rotate: 8,
        anim: D,
      },
      {
        component: <StarSvg color={s} />,
        x: "68%",
        y: "22%",
        size: 22,
        delay: 0,
        duration: 2,
        opacity: 0.45,
        rotate: 15,
        anim: T,
      },
      {
        component: <Cake color={p} color2={s} />,
        x: "5%",
        y: "42%",
        size: 62,
        delay: 1,
        duration: 10,
        opacity: 0.35,
        rotate: 0,
        anim: F,
      },
      {
        component: <Balloon color={f} />,
        x: "12%",
        y: "72%",
        size: 52,
        delay: 2.5,
        duration: 8,
        opacity: 0.35,
        rotate: -8,
        anim: D,
      },
      {
        component: <Flag color={s} color2={t} />,
        x: "66%",
        y: "65%",
        size: 45,
        delay: 0.8,
        duration: 7,
        opacity: 0.3,
        rotate: 5,
        anim: S,
      },
      {
        component: <StarSvg color={f} />,
        x: "38%",
        y: "55%",
        size: 20,
        delay: 1.5,
        duration: 2.5,
        opacity: 0.35,
        rotate: -20,
        anim: T,
      },
      {
        component: <Balloon color={t} />,
        x: "52%",
        y: "85%",
        size: 48,
        delay: 0.3,
        duration: 9,
        opacity: 0.3,
        rotate: 3,
        anim: F,
      },
      {
        component: <Sparkle color={s} />,
        x: "90%",
        y: "80%",
        size: 18,
        delay: 2,
        duration: 2,
        opacity: 0.35,
        rotate: 0,
        anim: T,
      },
      {
        component: <Cake color={t} color2={f} />,
        x: "72%",
        y: "88%",
        size: 45,
        delay: 3,
        duration: 10,
        opacity: 0.2,
        rotate: 0,
        anim: D,
      },
      {
        component: <Flag color={p} color2={f} />,
        x: "30%",
        y: "30%",
        size: 38,
        delay: 1.2,
        duration: 8,
        opacity: 0.18,
        rotate: -12,
        anim: S,
      },
    ],
  };

  return sets[illustration] || sets.rainbow;
}

// ─── Main scene component ───────────────────────────────────────────────────

export function SceneDecorations({
  illustration,
  confetti,
}: {
  illustration: string;
  confetti: string[];
}) {
  const items = getThemeIllustrations(illustration, confetti);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
      {items.map((item, i) => (
        <Float
          key={i}
          x={item.x}
          y={item.y}
          size={item.size}
          delay={item.delay}
          duration={item.duration}
          opacity={item.opacity}
          rotate={item.rotate}
          className={item.anim}
        >
          {item.component}
        </Float>
      ))}
    </div>
  );
}
