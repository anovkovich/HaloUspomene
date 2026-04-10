"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import type { EnvelopeItem } from "@/app/pozivnica/[slug]/types";
import { getLoaderTheme } from "./envelopeThemes";

type Stage = "sealed" | "opening" | "extracted" | "fadeout";

interface PremiumEnvelopeLoaderProps {
  onComplete: () => void;
  names: string;
  eventDate?: string;
  envelopeItems?: EnvelopeItem[];
  /** Invitation theme — unknown values fall back to watercolor. */
  theme?: string;
}

const ITEM_SRCS: Record<string, string> = {
  clover: "/images/premium/envelope-details/clover.webp",
  dried_flower: "/images/premium/envelope-details/dried-white-flower.webp",
  champagne: "/images/premium/envelope-details/Champagne toast in vintage Polaroid.png",
  boutonniere: "/images/premium/envelope-details/Rustic wedding boutonniere in Polaroid.png",
  bouquet: "/images/premium/envelope-details/Vintage Biedermeier-style wedding bouquet.png",
  rings: "/images/premium/envelope-details/Wedding rings on textured fabric.png",
  tulips: "/images/premium/envelope-details/a37bb0a0-62d9-4bfe-b52d-a69e6954687d.png",
  roses: "/images/premium/envelope-details/835f4bca-7963-46d3-8245-6a615b27c997.png",
  gold_bow: "/images/premium/envelope-details/1f06d143-7d86-402a-81cc-688836ff367a.png",
};

// Mobile: 2 rows (3 top + 2 bottom), Desktop: arc layout
const BURST_OFFSETS_SM = [
  { x: -70, y: 50 },   // zone 0: top-left
  { x: -70, y: 140 },  // zone 1: bottom-left
  { x: 0, y: 95 },     // zone 2: center
  { x: 70, y: 50 },    // zone 3: top-right
  { x: 70, y: 140 },   // zone 4: bottom-right
];
const BURST_OFFSETS_LG = [
  { x: -200, y: 20 },
  { x: -140, y: 150 },
  { x: 0, y: 170 },
  { x: 140, y: 150 },
  { x: 200, y: 20 },
];

function getInitials(names: string): string {
  const parts = names.split(/\s*&\s*/);
  if (parts.length === 2) {
    return `${parts[0].charAt(0)}&${parts[1].charAt(0)}`;
  }
  return names.charAt(0);
}

const MONTH_ABBR: Record<string, string> = {
  januar: "JAN", februar: "FEB", mart: "MAR", april: "APR",
  maj: "MAJ", jun: "JUN", jul: "JUL", avgust: "AVG",
  septembar: "SEP", oktobar: "OKT", novembar: "NOV", decembar: "DEC",
};

function parseDateParts(dateStr?: string) {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{1,2})\.\s*(\w+)\s+(\d{4})/);
  if (!match) return null;
  return {
    day: match[1],
    month: MONTH_ABBR[match[2].toLowerCase()] || match[2].slice(0, 3).toUpperCase(),
    year: match[3],
  };
}

export default function PremiumEnvelopeLoader({
  onComplete,
  names,
  eventDate,
  envelopeItems = [],
  theme = "watercolor",
}: PremiumEnvelopeLoaderProps) {
  const [stage, setStage] = useState<Stage>("sealed");
  const [isMobile, setIsMobile] = useState(false);
  const initials = getInitials(names);
  const dateParts = parseDateParts(eventDate);
  const t = getLoaderTheme(theme);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  const BURST_OFFSETS = isMobile ? BURST_OFFSETS_SM : BURST_OFFSETS_LG;

  useEffect(() => {
    const sequence = async () => {
      await new Promise((r) => setTimeout(r, 800));
      setStage("opening");
      await new Promise((r) => setTimeout(r, 1200));
      setStage("extracted");
      await new Promise((r) => setTimeout(r, 2600));
      setStage("fadeout");
      await new Promise((r) => setTimeout(r, 1500));
      onComplete();
    };
    sequence();
  }, [onComplete]);

  const isOpen = stage !== "sealed";
  const isExtracted = stage === "extracted" || stage === "fadeout";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center ${
        stage === "fadeout"
          ? "opacity-0 scale-110 pointer-events-none"
          : "opacity-100"
      }`}
      style={{
        background:
          stage === "fadeout"
            ? "transparent"
            : isOpen
              ? t.overlay.bgOpen
              : t.overlay.bgSealed,
        backdropFilter:
          stage === "fadeout" ? "none" : isOpen ? t.overlay.backdropFilterOpen : "none",
        transition: "all 1.5s ease",
      }}
    >
      {/* 3D Scene */}
      <div className="relative w-[300px] h-[200px] sm:w-[480px] sm:h-[310px] perspective-[1500px] mt-8 sm:mt-0">
        {/* ENVELOPE ASSEMBLY */}
        <div
          className={`relative w-full h-full preserve-3d transition-all duration-[1500ms] will-change-transform
          ${isExtracted ? "translate-y-[12%] rotateX(6deg)" : "rotateX(0deg)"}
          ${stage === "fadeout" ? "opacity-30 blur-sm scale-90" : "opacity-100"}`}
        >
          {/* 1. BACK SIDE */}
          <div
            className="absolute inset-0 rounded-sm z-0 shadow-inner"
            style={{ background: t.envelope.back, border: `1px solid ${t.envelope.backBorder}` }}
          >
            <div className="absolute inset-0 bg-black/5" />
          </div>

          {/* 2. THE CARD (Invitation) */}
          <div
            className={`absolute inset-2 sm:inset-3 flex flex-col items-center justify-center text-center p-4 sm:p-12 will-change-transform transition-all duration-[2200ms]
              ${stage === "sealed" ? "opacity-0 scale-95 z-10" : ""}
              ${stage === "opening" ? "opacity-100 scale-100 z-10" : ""}
              ${isExtracted ? "z-10" : ""}
            `}
            style={{
              background: t.card.bg,
              border: `1px solid ${t.card.border}`,
              boxShadow: isExtracted ? t.card.shadowExtracted : t.card.shadow,
              backdropFilter: t.card.backdropFilter,
              WebkitBackdropFilter: t.card.backdropFilter,
              transform: isExtracted
                ? "translateY(-80%) scale(1.03)"
                : "translateY(0) scale(1)",
              backfaceVisibility: "hidden",
              transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)",
            } as React.CSSProperties}
          >
            {/* Decorative borders */}
            <div
              className="absolute inset-2 sm:inset-3 pointer-events-none"
              style={{ border: `1px solid ${t.card.innerBorder1}` }}
            />
            <div
              className="absolute inset-3 sm:inset-4 pointer-events-none"
              style={{ border: `1px solid ${t.card.innerBorder2}` }}
            />

            {/* Corner ornaments */}
            {[
              "top-3 left-3 sm:top-4 sm:left-4 border-t border-l",
              "top-3 right-3 sm:top-4 sm:right-4 border-t border-r",
              "bottom-3 left-3 sm:bottom-4 sm:left-4 border-b border-l",
              "bottom-3 right-3 sm:bottom-4 sm:right-4 border-b border-r",
            ].map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-4 h-4 sm:w-6 sm:h-6`}
                style={{ borderColor: t.card.cornerColor, borderWidth: "2px" }}
              />
            ))}

            <p
              className="font-elegant uppercase tracking-[0.25em] sm:tracking-[0.4em] text-[5px] sm:text-[8px] mb-0.5 sm:mb-1"
              style={{ color: t.text.label }}
            >
              Pozivamo Vas
            </p>
            <h2
              className="font-script text-xl sm:text-4xl leading-tight px-1 sm:px-2 select-none"
              style={{ color: t.text.names }}
            >
              {names}
            </h2>
            <div className="flex items-center gap-1 sm:gap-1.5 my-1 sm:my-2">
              <div className="w-3 sm:w-5 h-px" style={{ background: `linear-gradient(to right, transparent, ${t.text.dividerLine})` }} />
              <Heart size={5} className="sm:hidden" style={{ color: t.text.heart }} fill="currentColor" />
              <Heart size={6} className="hidden sm:block" style={{ color: t.text.heart }} fill="currentColor" />
              <div className="w-3 sm:w-5 h-px" style={{ background: `linear-gradient(to left, transparent, ${t.text.dividerLine})` }} />
            </div>
            {dateParts ? (
              <div className="flex flex-col items-center leading-none select-none mt-0.5 sm:mt-1">
                <span
                  className="font-serif font-bold text-[40px] sm:text-[64px] leading-[0.82]"
                  style={{ color: t.text.dateDay, letterSpacing: "-0.02em" }}
                >
                  {dateParts.day}
                </span>
                <span
                  className="font-serif font-semibold text-[14px] sm:text-[22px] leading-none -mt-0.5"
                  style={{ color: t.text.dateMonth, letterSpacing: "0.3em" }}
                >
                  {dateParts.month}
                </span>
                <span
                  className="font-elegant text-[10px] sm:text-[15px] leading-none mt-0.5 sm:mt-1"
                  style={{ color: t.text.dateYear, letterSpacing: "0.35em" }}
                >
                  {dateParts.year}
                </span>
              </div>
            ) : (
              <p
                className="font-serif italic text-[8px] sm:text-xs tracking-[0.15em] sm:tracking-[0.3em]"
                style={{ color: t.text.dateYear }}
              >
                {eventDate}
              </p>
            )}
          </div>

          {/* Envelope items bursting out */}
          <AnimatePresence>
            {isExtracted &&
              envelopeItems.slice(0, 5).sort((a, b) => a.zone - b.zone).map((item, i) => {
                const offset = BURST_OFFSETS[item.zone] || BURST_OFFSETS[i];
                return (
                  <motion.div
                    key={`${item.type}-${item.zone}`}
                    className="absolute top-1/2 left-1/2 w-20 h-20 sm:w-36 sm:h-36 -ml-10 -mt-10 sm:-ml-18 sm:-mt-18 z-30"
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{
                      x: offset.x,
                      y: offset.y,
                      scale: 1,
                      opacity: 1,
                      rotate: (i % 2 === 0 ? 1 : -1) * (5 + i * 3),
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 80,
                      damping: 20,
                      delay: 0.15 + i * 0.2,
                    }}
                  >
                    <img
                      src={ITEM_SRCS[item.type]}
                      alt={item.type}
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {/* 3. FRONT POCKET */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div
              className="absolute inset-0 rounded-b-sm shadow-lg"
              style={{
                background: t.envelope.pocket,
                border: `1px solid ${t.envelope.backBorder}`,
                clipPath: "polygon(0 0%, 50% 55%, 100% 0%, 100% 100%, 0 100%)",
              }}
            ></div>

            {/* Gold ^ fold line on the bottom of the pocket —
                the upward triangle where the bottom flap creases in a
                classic envelope. Apex sits around the vertical midline so
                it reads as a real fold crease, not a shallow bend. The
                top V-slot line is intentionally omitted because it would
                cross through the card's text area and break the layout. */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <polyline
                points="0,100 50,55 100,100"
                fill="none"
                stroke={t.envelope.wingStroke}
                strokeWidth="1.5"
                strokeOpacity={t.envelope.wingStrokeOpacity}
                strokeLinejoin="miter"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* 4. SEAL — wax stamp (watercolor) or paper-cut medallion (line art) */}
          <div
            className={`absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] ${
              t.seal.kind === "wax"
                ? "w-28 h-28 sm:w-[168px] sm:h-[168px]"
                : "w-20 h-20 sm:w-[120px] sm:h-[120px]"
            }`}
          >
            <motion.div
              className="w-full h-full"
              initial={{ scale: 1, opacity: 1 }}
              animate={
                isOpen
                  ? { scale: [1, 1.3, 1.35, 0], opacity: [1, 1, 1, 0] }
                  : { scale: 1, opacity: 1 }
              }
              transition={
                isOpen
                  ? { duration: 0.8, times: [0, 0.6, 0.75, 1], ease: "easeInOut" }
                  : {}
              }
            >
              {t.seal.kind === "wax" ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Real 3D gold wax seal image */}
                  <img
                    src="/images/premium/envelope-details/gold-wax.webp"
                    alt="Wax seal"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl pointer-events-none select-none"
                  />
                  {/* Initials overlaid on the empty center of the seal */}
                  <span
                    className="relative font-serif text-lg sm:text-2xl font-semibold select-none"
                    style={{
                      color: "#7a5318",
                      textShadow:
                        "0 1px 1px rgba(255,232,150,0.8), 0 0 6px rgba(90,55,10,0.35)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {initials}
                  </span>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Real 3D platinum wax seal image — line_art theme */}
                  <img
                    src="/images/premium/envelope-details/platinum-wax.webp"
                    alt="Platinum wax seal"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl pointer-events-none select-none"
                  />
                  {/* Initials overlaid on the empty center of the seal */}
                  <span
                    className="relative font-serif text-lg sm:text-2xl font-semibold select-none"
                    style={{
                      color: "#1a1a1a",
                      textShadow:
                        "0 1px 1px rgba(245,247,252,0.85), 0 0 6px rgba(30,35,50,0.25)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {initials}
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          {/* 5. FLAP */}
          <div
            className={`absolute top-0 left-0 right-0 h-[56%] origin-top preserve-3d transition-transform duration-[1400ms] cubic-bezier(0.4, 0, 0.2, 1) will-change-transform`}
            style={{
              transform: isOpen ? "rotateX(180deg)" : "rotateX(0deg)",
              zIndex: stage === "sealed" || stage === "opening" ? 40 : 5,
            }}
          >
            {/* Outer Flap */}
            <div
              className="absolute inset-0 backface-hidden shadow-sm"
              style={{
                background: t.envelope.flapOuter,
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            ></div>

            {/* Outer flap gold edge — drawn as SVG sibling (not clipped) so the
                full stroke width is visible along the slanted V of the flap */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none backface-hidden"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <polyline
                points="0,0 50,100 100,0"
                fill="none"
                stroke={t.envelope.wingStroke}
                strokeWidth="1.5"
                strokeOpacity={t.envelope.wingStrokeOpacity}
                strokeLinejoin="miter"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Inner Flap (backside) */}
            <div
              className="absolute inset-0 backface-hidden"
              style={{
                background: t.envelope.flapInner,
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                transform: "rotateX(180deg)",
              }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
              ></div>
            </div>

            {/* Inner flap gold edge — mirrored for the flipped backside */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none backface-hidden"
              style={{ transform: "rotateX(180deg)" }}
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <polyline
                points="0,0 50,100 100,0"
                fill="none"
                stroke={t.envelope.wingStroke}
                strokeWidth="1.5"
                strokeOpacity={t.envelope.wingStrokeOpacity}
                strokeLinejoin="miter"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
