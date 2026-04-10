"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import type { EnvelopeItem } from "@/app/pozivnica/[slug]/types";
import { getLoaderTheme } from "./envelopeThemes";

type Stage = "sealed" | "untying" | "opening" | "extracted" | "fadeout";

interface WingEnvelopeLoaderProps {
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
  if (parts.length === 2) return `${parts[0].charAt(0)}&${parts[1].charAt(0)}`;
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

export default function WingEnvelopeLoader({
  onComplete,
  names,
  eventDate,
  envelopeItems = [],
  theme = "watercolor",
}: WingEnvelopeLoaderProps) {
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
      setStage("untying"); // bow unties
      await new Promise((r) => setTimeout(r, 800));
      setStage("opening"); // wings open
      await new Promise((r) => setTimeout(r, 1200));
      setStage("extracted"); // card rises
      await new Promise((r) => setTimeout(r, 2600));
      setStage("fadeout");
      await new Promise((r) => setTimeout(r, 1500));
      onComplete();
    };
    sequence();
  }, [onComplete]);

  const isUntied = stage !== "sealed";
  const isOpen = stage === "opening" || stage === "extracted" || stage === "fadeout";
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
      {/* Square envelope container */}
      <div className="relative w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] mt-4 sm:mt-0">

        {/* Background / base */}
        <div
          className="absolute inset-0 shadow-xl"
          style={{ background: t.envelope.back, border: `1px solid ${t.envelope.backBorder}` }}
        />

        {/* THE CARD (Invitation) — centered, rises up */}
        <div
          className={`absolute inset-6 sm:inset-10 flex flex-col items-center justify-center text-center p-4 sm:p-8 will-change-transform transition-all duration-[2200ms] z-10
            ${stage === "sealed" || stage === "untying" ? "opacity-0 scale-95" : ""}
            ${stage === "opening" ? "opacity-100 scale-100" : ""}
          `}
          style={{
            background: t.card.bg,
            border: `1px solid ${t.card.border}`,
            boxShadow: isExtracted ? t.card.shadowExtracted : t.card.shadow,
            backdropFilter: t.card.backdropFilter,
            WebkitBackdropFilter: t.card.backdropFilter,
            transform: isExtracted
              ? "translateY(-60%) scale(1.05)"
              : "translateY(0) scale(1)",
            backfaceVisibility: "hidden",
            transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)",
          } as React.CSSProperties}
        >
          {/* Decorative borders */}
          <div className="absolute inset-2 sm:inset-3 pointer-events-none" style={{ border: `1px solid ${t.card.innerBorder1}` }} />
          <div className="absolute inset-3 sm:inset-4 pointer-events-none" style={{ border: `1px solid ${t.card.innerBorder2}` }} />

          {/* Corner ornaments */}
          {[
            "top-2 left-2 sm:top-3 sm:left-3 border-t border-l",
            "top-2 right-2 sm:top-3 sm:right-3 border-t border-r",
            "bottom-2 left-2 sm:bottom-3 sm:left-3 border-b border-l",
            "bottom-2 right-2 sm:bottom-3 sm:right-3 border-b border-r",
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-3 h-3 sm:w-5 sm:h-5`}
              style={{ borderColor: t.card.cornerColor, borderWidth: "2px" }}
            />
          ))}

          <p className="font-elegant uppercase tracking-[0.25em] sm:tracking-[0.4em] text-[5.5px] sm:text-[8px] mb-0.5 sm:mb-1" style={{ color: t.text.label }}>
            Pozivamo Vas
          </p>
          <h2 className="font-serif text-lg sm:text-[28px] leading-tight px-1 sm:px-2 select-none" style={{ color: t.text.names }}>
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
                className="font-serif font-bold text-[56px] sm:text-[88px] leading-[0.82]"
                style={{ color: t.text.dateDay, letterSpacing: "-0.02em" }}
              >
                {dateParts.day}
              </span>
              <span
                className="font-serif font-semibold text-[18px] sm:text-[28px] leading-none -mt-0.5 sm:-mt-1"
                style={{ color: t.text.dateMonth, letterSpacing: "0.3em" }}
              >
                {dateParts.month}
              </span>
              <span
                className="font-elegant text-[9px] sm:text-[14px] leading-none mt-0.5 sm:mt-1"
                style={{ color: t.text.dateYear, letterSpacing: "0.35em" }}
              >
                {dateParts.year}
              </span>
            </div>
          ) : (
            <p className="font-serif italic text-[7px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.25em]" style={{ color: t.text.dateYear }}>
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
                  animate={{ x: offset.x, y: offset.y, scale: 1, opacity: 1, rotate: (i % 2 === 0 ? 1 : -1) * (5 + i * 3) }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.15 + i * 0.2 }}
                >
                  <img src={ITEM_SRCS[item.type]} alt={item.type} className="w-full h-full object-contain drop-shadow-lg" />
                </motion.div>
              );
            })}
        </AnimatePresence>

        {/* LEFT WING — curved flap */}
        <div
          className="absolute top-0 left-0 w-1/2 h-full z-20 will-change-transform transition-transform duration-[1200ms]"
          style={{
            transformOrigin: "left center",
            transform: isOpen ? "perspective(800px) rotateY(-140deg)" : "perspective(800px) rotateY(0deg)",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="absolute inset-0 shadow-md"
            style={{
              background: t.envelope.wingOuter,
              clipPath: "ellipse(100% 50% at 0% 50%)",
              backfaceVisibility: "hidden",
            }}
          />
          {/* Stroked arc on outer curved edge */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ backfaceVisibility: "hidden" }}>
            <ellipse cx="0" cy="50%" rx="100%" ry="50%" fill="none" stroke={t.envelope.wingStroke} strokeWidth="1.5" opacity={t.envelope.wingStrokeOpacity} />
          </svg>
          {/* Inner face — mirrored: curve faces outward when open */}
          <div
            className="absolute inset-0"
            style={{
              background: t.envelope.wingInner,
              clipPath: "ellipse(100% 50% at 100% 50%)",
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
            }}
          />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
            <ellipse cx="100%" cy="50%" rx="100%" ry="50%" fill="none" stroke={t.envelope.wingStroke} strokeWidth="1.5" opacity={t.envelope.wingStrokeOpacity} />
          </svg>
        </div>

        {/* RIGHT WING — curved flap */}
        <div
          className="absolute top-0 right-0 w-1/2 h-full z-20 will-change-transform transition-transform duration-[1200ms]"
          style={{
            transformOrigin: "right center",
            transform: isOpen ? "perspective(800px) rotateY(140deg)" : "perspective(800px) rotateY(0deg)",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="absolute inset-0 shadow-md"
            style={{
              background: t.envelope.wingOuter,
              clipPath: "ellipse(100% 50% at 100% 50%)",
              backfaceVisibility: "hidden",
            }}
          />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ backfaceVisibility: "hidden" }}>
            <ellipse cx="100%" cy="50%" rx="100%" ry="50%" fill="none" stroke={t.envelope.wingStroke} strokeWidth="1.5" opacity={t.envelope.wingStrokeOpacity} />
          </svg>
          {/* Inner face — mirrored: curve faces outward when open */}
          <div
            className="absolute inset-0"
            style={{
              background: t.envelope.wingInner,
              clipPath: "ellipse(100% 50% at 0% 50%)",
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
            }}
          />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
            <ellipse cx="0" cy="50%" rx="100%" ry="50%" fill="none" stroke={t.envelope.wingStroke} strokeWidth="1.5" opacity={t.envelope.wingStrokeOpacity} />
          </svg>
        </div>

        {/* CLOSURE — gold bow (watercolor) or paper-cut ink medallion (line art) */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60]"
          initial={{ scale: 1, opacity: 1 }}
          animate={
            isUntied
              ? { scale: [1, 1.12, 1.15, 0], opacity: [1, 1, 1, 0] }
              : { scale: 1, opacity: 1 }
          }
          transition={
            isUntied
              ? { duration: 0.8, times: [0, 0.6, 0.75, 1], ease: "easeInOut" }
              : {}
          }
        >
          {t.seal.kind === "wax" ? (
            <img
              src="/images/premium/envelope-details/1f06d143-7d86-402a-81cc-688836ff367a.png"
              alt="Bow"
              className="object-contain drop-shadow-xl"
              style={{
                width: isMobile ? 190 : 285,
                height: isMobile ? 143 : 214,
                maxWidth: "none",
                display: "block",
              }}
            />
          ) : (
            <div
              className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
              style={{
                background: t.seal.bg,
                border: `1.5px solid ${t.seal.border}`,
                boxShadow: t.seal.shadow,
              }}
            >
              <div
                className="absolute inset-2 sm:inset-3 rounded-full"
                style={{ border: `1px solid ${t.seal.border}`, opacity: 0.4 }}
              />
              <span
                className="font-serif text-lg sm:text-3xl select-none"
                style={{ color: t.seal.textColor, letterSpacing: "0.05em" }}
              >
                {initials}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
