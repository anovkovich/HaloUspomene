"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

interface EnvelopeLoaderProps {
  onComplete: () => void;
  names: string;
  eventDate?: string;
}

// Extract initials from names (e.g., "Emilija & Aleksa" -> "E&A")
function getInitials(names: string): string {
  const parts = names.split(/\s*&\s*/);
  if (parts.length === 2) {
    return `${parts[0].charAt(0)}&${parts[1].charAt(0)}`;
  }
  return names.charAt(0);
}

export const EnvelopeLoader: React.FC<EnvelopeLoaderProps> = ({
  onComplete,
  names,
  eventDate = "Jun 06, 2026",
}) => {
  const { config, t } = useTheme();
  const [stage, setStage] = useState<
    "sealed" | "opening" | "extracted" | "fadeout"
  >("sealed");

  const initials = getInitials(names);

  useEffect(() => {
    const sequence = async () => {
      await new Promise((r) => setTimeout(r, 800));
      setStage("opening");
      await new Promise((r) => setTimeout(r, 1200));
      setStage("extracted");
      await new Promise((r) => setTimeout(r, 2600));
      setStage("fadeout");
      await new Promise((r) => setTimeout(r, 1000));
      onComplete();
    };
    sequence();
  }, [onComplete]);

  // Use theme colors
  const primaryColor = config.colors.primary;
  const waxSealColor = config.colors.waxSeal;
  const waxSealDark = config.colors.waxSealDark;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1) ${stage === "fadeout" ? "opacity-0 scale-110 blur-xl pointer-events-none" : "opacity-100"}`}
      style={{ backgroundColor: config.colors.surface }}
    >
      {/* Background Texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(primaryColor)}' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-float"
            style={{
              backgroundColor: `${primaryColor}33`,
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i}s`,
            }}
          />
        ))}
      </div>

      {/* 3D Scene - moved down slightly so card doesn't go off screen */}
      <div className="relative w-[300px] h-[200px] sm:w-[480px] sm:h-[310px] perspective-[1500px] mt-8 sm:mt-0">
        {/* ENVELOPE ASSEMBLY */}
        <div
          className={`relative w-full h-full preserve-3d transition-all duration-[1500ms] will-change-transform
          ${stage === "extracted" ? "translate-y-[12%] rotateX(6deg)" : "rotateX(0deg)"}
          ${stage === "fadeout" ? "opacity-30 blur-sm scale-90" : "opacity-100"}`}
        >
          {/* 1. BACK SIDE */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#e8e4d8] to-[#ddd9cd] rounded-sm border border-stone-300/50 z-0 shadow-inner">
            <div className="absolute inset-0 bg-black/5"></div>
          </div>

          {/* 2. THE CARD (Invitation) */}
          <div
            className={`absolute inset-2 sm:inset-3 bg-gradient-to-b from-white to-[#fdfcfa] shadow-2xl flex flex-col items-center justify-center text-center p-4 sm:p-12 border border-stone-100 will-change-transform transition-all duration-[2200ms] cubic-bezier(0.19, 1, 0.22, 1)
              ${stage === "sealed" ? "opacity-0 scale-95 z-10" : ""}
              ${stage === "opening" ? "opacity-100 scale-100 z-10" : ""}
              ${stage === "extracted" || stage === "fadeout" ? "z-10 shadow-[0_60px_130px_-30px_rgba(0,0,0,0.35)]" : ""}
            `}
            style={{
              transform:
                stage === "extracted" || stage === "fadeout"
                  ? "translateY(-80%) scale(1.03)"
                  : "translateY(0) scale(1)",
              backfaceVisibility: "hidden",
            }}
          >
            {/* Decorative border */}
            <div
              className="absolute inset-2 sm:inset-3 pointer-events-none"
              style={{ border: `1px solid ${primaryColor}33` }}
            ></div>
            <div
              className="absolute inset-3 sm:inset-4 pointer-events-none"
              style={{ border: `1px solid ${primaryColor}1a` }}
            ></div>

            {/* Corner ornaments */}
            <div
              className="absolute top-3 left-3 sm:top-4 sm:left-4 w-4 h-4 sm:w-6 sm:h-6"
              style={{ borderTop: `2px solid ${primaryColor}4d`, borderLeft: `2px solid ${primaryColor}4d` }}
            ></div>
            <div
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-4 h-4 sm:w-6 sm:h-6"
              style={{ borderTop: `2px solid ${primaryColor}4d`, borderRight: `2px solid ${primaryColor}4d` }}
            ></div>
            <div
              className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-4 h-4 sm:w-6 sm:h-6"
              style={{ borderBottom: `2px solid ${primaryColor}4d`, borderLeft: `2px solid ${primaryColor}4d` }}
            ></div>
            <div
              className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-4 h-4 sm:w-6 sm:h-6"
              style={{ borderBottom: `2px solid ${primaryColor}4d`, borderRight: `2px solid ${primaryColor}4d` }}
            ></div>

            <p
              className="font-elegant uppercase tracking-[0.2em] sm:tracking-[0.5em] text-[6px] sm:text-[10px] mb-2 sm:mb-4"
              style={{ color: config.colors.textLight }}
            >
              {t.inviteYou}
            </p>
            <h2
              className="font-script text-2xl sm:text-6xl leading-tight px-2 sm:px-4 select-none drop-shadow-sm"
              style={{ color: primaryColor }}
            >
              {names}
            </h2>
            <div className="flex items-center gap-2 sm:gap-3 my-3 sm:my-6">
              <div
                className="w-5 sm:w-8 h-px"
                style={{ background: `linear-gradient(to right, transparent, ${primaryColor}66)` }}
              ></div>
              <div
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rotate-45"
                style={{ border: `1px solid ${primaryColor}66` }}
              ></div>
              <div
                className="w-5 sm:w-8 h-px"
                style={{ background: `linear-gradient(to left, transparent, ${primaryColor}66)` }}
              ></div>
            </div>
            <p
              className="font-serif italic text-[8px] sm:text-xs tracking-[0.15em] sm:tracking-[0.3em]"
              style={{ color: config.colors.textMuted }}
            >
              {eventDate}
            </p>
          </div>

          {/* 3. FRONT POCKET */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#f4f0e0] to-[#ebe7d7] border border-stone-200/50 rounded-b-sm shadow-lg"
              style={{
                clipPath: "polygon(0 0%, 50% 55%, 100% 0%, 100% 100%, 0 100%)",
              }}
            ></div>
            <div
              className="absolute inset-0 bg-black/[0.02]"
              style={{
                clipPath: "polygon(0 0%, 50% 55%, 100% 0%, 100% 100%, 0 100%)",
              }}
            ></div>
          </div>

          {/* 4. WAX SEAL - Positioned at the bottom tip of the flap (56% height) */}
          <div
            className={`absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-[70px] sm:h-[70px] z-[60] transition-all duration-1000 cubic-bezier(0.175, 0.885, 0.32, 1.275)
                 ${stage !== "sealed" ? "scale-0 opacity-0 blur-md" : "scale-100 opacity-100"}`}
          >
            <div
              className="relative w-full h-full rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center"
              style={{
                background: `linear-gradient(to bottom right, ${waxSealColor}, ${waxSealDark})`,
                border: `1px solid ${waxSealDark}`,
              }}
            >
              {/* Wax seal texture */}
              <div
                className="absolute inset-0.5 sm:inset-1 rounded-full"
                style={{ border: `1px solid ${primaryColor}4d` }}
              ></div>
              <span
                className="font-serif text-base sm:text-2xl select-none drop-shadow-md"
                style={{ color: primaryColor }}
              >
                {initials}
              </span>
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.15),_transparent_50%)]"></div>
            </div>
          </div>

          {/* 5. FLAP */}
          <div
            className={`absolute top-0 left-0 right-0 h-[56%] origin-top preserve-3d transition-transform duration-[1400ms] cubic-bezier(0.4, 0, 0.2, 1) will-change-transform`}
            style={{
              transform:
                stage !== "sealed" ? "rotateX(180deg)" : "rotateX(0deg)",
              zIndex: stage === "sealed" ? 40 : 5,
            }}
          >
            {/* Outer Flap */}
            <div
              className="absolute inset-0 bg-[#f4f0e0] backface-hidden shadow-sm"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            ></div>

            {/* Inner Flap (backside) */}
            <div
              className="absolute inset-0 bg-[#f9f7f2] backface-hidden"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                transform: "rotateX(180deg)",
              }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
