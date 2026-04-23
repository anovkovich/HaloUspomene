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

// ─── Small accent SVGs (kept for scene richness) ───────────────────────────

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
        {age}.
      </span>
      <div className="absolute inset-0 rounded-full border-4 border-white/20" />
    </div>
  );
}

// ─── Theme illustration images (.webp in /public/images/child-invitations) ──

const THEME_IMAGES: Record<string, string[]> = {
  // Safari (boy_animals) — African savanna animals
  animals: ["safari_elephant", "safari_giraffe", "safari_lion", "safari_zebra"],
  // Svemir (boy_space) — planets, rockets, moons
  space: ["space_mars", "space_moon", "space_rocket", "space_saturn"],
  // Jungle (neutral_safari) — trees, leaves, toucan, jungle lion
  safari: ["jangle_lion", "jungle_leafs", "jungle_trees", "jungle_tucan"],
  // Cirkus (neutral_circus) — tent, balloons, rabbit, bike
  circus: ["circus_balloones", "circus_bike", "circus_rabit", "circus_tent"],
  // Vila (girl_fairy) — dress, potion, wand, wings
  fairy: ["fairy_dress", "fairy_potion", "fairy_wand", "fairy_wings"],
  // Princeza (girl_princess) — cake, crown, dress, mirror
  princess: [
    "princess_cake",
    "princess_crown",
    "princess_dress",
    "princess_mirror",
  ],
};

// F = float, D = drift, S = sway, T = twinkle
type Anim = "F" | "D" | "S" | "T";
const ANIM_CLASS: Record<Anim, string> = {
  F: "animate-birthday-float",
  D: "animate-birthday-drift",
  S: "animate-birthday-sway",
  T: "animate-twinkle",
};

// 14 scattered slots for the webp illustrations — cycles through the theme's
// 4-image pool so every image repeats 3–4 times at different sizes & positions.
interface ImageSlot {
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  rotate: number;
  anim: Anim;
  img: number;
}

const IMAGE_SLOTS: ImageSlot[] = [
  { x: "-3%", y: "2%",  size: 140, delay: 0,   duration: 11, opacity: 0.6,  rotate: -6,  anim: "D", img: 0 },
  { x: "76%", y: "0%",  size: 120, delay: 1,   duration: 10, opacity: 0.55, rotate: 6,   anim: "F", img: 1 },
  { x: "30%", y: "22%", size: 85,  delay: 0.5, duration: 8,  opacity: 0.55, rotate: -12, anim: "S", img: 2 },
  { x: "82%", y: "32%", size: 110, delay: 2,   duration: 9,  opacity: 0.5,  rotate: 10,  anim: "D", img: 3 },
  { x: "-2%", y: "40%", size: 100, delay: 1.5, duration: 12, opacity: 0.5,  rotate: 4,   anim: "F", img: 0 },
  { x: "64%", y: "56%", size: 115, delay: 2.5, duration: 10, opacity: 0.45, rotate: -6,  anim: "D", img: 2 },
  { x: "28%", y: "50%", size: 75,  delay: 0.8, duration: 8,  opacity: 0.4,  rotate: -18, anim: "S", img: 1 },
  { x: "-4%", y: "72%", size: 120, delay: 3,   duration: 11, opacity: 0.45, rotate: 8,   anim: "F", img: 3 },
  { x: "80%", y: "76%", size: 95,  delay: 1.2, duration: 10, opacity: 0.4,  rotate: 5,   anim: "F", img: 1 },
  { x: "36%", y: "84%", size: 90,  delay: 2,   duration: 9,  opacity: 0.4,  rotate: -3,  anim: "D", img: 2 },
];

// Small SVG accents — one shape per theme, colored from the theme's confetti
// palette. Space=sparkles, Circus=stars, Safari/Jungle=diamonds,
// Fairy/Princess=hearts.
type AccentShape = "star" | "heart" | "diamond" | "sparkle";

const THEME_ACCENT: Record<string, AccentShape> = {
  animals: "diamond",
  safari: "diamond",
  space: "sparkle",
  circus: "star",
  fairy: "heart",
  princess: "heart",
};

interface AccentSlot {
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  rotate: number;
  color: number;
}

const ACCENT_SLOTS: AccentSlot[] = [
  { x: "44%", y: "10%", size: 24, delay: 0,   duration: 2.5, opacity: 0.55, rotate: 0,   color: 0 },
  { x: "14%", y: "28%", size: 20, delay: 1,   duration: 2,   opacity: 0.5,  rotate: 15,  color: 1 },
  { x: "92%", y: "18%", size: 18, delay: 0.5, duration: 3,   opacity: 0.5,  rotate: 30,  color: 2 },
  { x: "50%", y: "38%", size: 16, delay: 0.3, duration: 2,   opacity: 0.5,  rotate: 0,   color: 3 },
  { x: "8%",  y: "58%", size: 22, delay: 1.5, duration: 2.8, opacity: 0.45, rotate: -10, color: 4 },
  { x: "86%", y: "62%", size: 18, delay: 2.5, duration: 2.5, opacity: 0.4,  rotate: 20,  color: 0 },
  { x: "54%", y: "72%", size: 20, delay: 1,   duration: 2.3, opacity: 0.45, rotate: 0,   color: 2 },
  { x: "22%", y: "94%", size: 18, delay: 1.4, duration: 2.5, opacity: 0.4,  rotate: 10,  color: 1 },
];

function AccentSvg({ shape, color }: { shape: AccentShape; color: string }) {
  switch (shape) {
    case "star":
      return <StarSvg color={color} />;
    case "heart":
      return <Heart color={color} />;
    case "diamond":
      return <Diamond color={color} />;
    case "sparkle":
      return <Sparkle color={color} />;
  }
}

// ─── Main scene component ───────────────────────────────────────────────────

export function SceneDecorations({
  illustration,
  confetti,
}: {
  illustration: string;
  confetti: string[];
}) {
  const images = THEME_IMAGES[illustration];

  // `classic` (punoletstvo) or unknown illustration — skip decorations.
  if (!images) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
      {IMAGE_SLOTS.map((slot, i) => {
        const src = `/images/child-invitations/${images[slot.img]}.webp`;
        return (
          <Float
            key={`img-${i}`}
            x={slot.x}
            y={slot.y}
            size={slot.size}
            delay={slot.delay}
            duration={slot.duration}
            opacity={slot.opacity}
            rotate={slot.rotate}
            className={ANIM_CLASS[slot.anim]}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full"
              style={{ objectFit: "contain" }}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </Float>
        );
      })}
      {ACCENT_SLOTS.map((slot, i) => (
        <Float
          key={`accent-${i}`}
          x={slot.x}
          y={slot.y}
          size={slot.size}
          delay={slot.delay}
          duration={slot.duration}
          opacity={slot.opacity}
          rotate={slot.rotate}
          className={ANIM_CLASS.T}
        >
          <AccentSvg
            shape={THEME_ACCENT[illustration]}
            color={confetti[slot.color % confetti.length]}
          />
        </Float>
      ))}
    </div>
  );
}
