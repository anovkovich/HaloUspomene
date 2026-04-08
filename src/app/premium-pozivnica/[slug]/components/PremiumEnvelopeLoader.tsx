"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import type { EnvelopeItem } from "@/app/pozivnica/[slug]/types";
type Stage = "sealed" | "opening" | "extracted" | "fadeout";

interface PremiumEnvelopeLoaderProps {
  onComplete: () => void;
  names: string;
  eventDate?: string;
  envelopeItems?: EnvelopeItem[];
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
}: PremiumEnvelopeLoaderProps) {
  const [stage, setStage] = useState<Stage>("sealed");
  const [isMobile, setIsMobile] = useState(false);
  const initials = getInitials(names);
  const dateParts = parseDateParts(eventDate);

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

  // Gold palette
  const gold = "#d4af37";
  const goldDark = "#b89520";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center ${
        stage === "fadeout"
          ? "opacity-0 scale-110 pointer-events-none"
          : "opacity-100"
      }`}
      style={{
        backgroundColor: stage === "fadeout" ? "transparent" : isOpen ? "rgba(255, 253, 245, 0.5)" : "#fffdf5",
        backdropFilter: stage === "fadeout" ? "none" : isOpen ? "blur(6px)" : "none",
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
          <div className="absolute inset-0 bg-gradient-to-br from-[#f5ead6] to-[#efe0c8] rounded-sm border border-[#d4af37]/30 z-0 shadow-inner">
            <div className="absolute inset-0 bg-black/5" />
          </div>

          {/* 2. THE CARD (Invitation) */}
          <div
            className={`absolute inset-2 sm:inset-3 bg-gradient-to-b from-white to-[#fdfcfa] shadow-2xl flex flex-col items-center justify-center text-center p-4 sm:p-12 border border-stone-100 will-change-transform transition-all duration-[2200ms]
              ${stage === "sealed" ? "opacity-0 scale-95 z-10" : ""}
              ${stage === "opening" ? "opacity-100 scale-100 z-10" : ""}
              ${isExtracted ? "z-10 shadow-[0_60px_130px_-30px_rgba(0,0,0,0.35)]" : ""}
            `}
            style={{
              transform: isExtracted
                ? "translateY(-80%) scale(1.03)"
                : "translateY(0) scale(1)",
              backfaceVisibility: "hidden",
              transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)",
            }}
          >
            {/* Decorative borders */}
            <div
              className="absolute inset-2 sm:inset-3 pointer-events-none"
              style={{ border: `1px solid ${gold}33` }}
            />
            <div
              className="absolute inset-3 sm:inset-4 pointer-events-none"
              style={{ border: `1px solid ${gold}1a` }}
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
                style={{ borderColor: `${gold}4d`, borderWidth: "2px" }}
              />
            ))}

            <p
              className="font-elegant uppercase tracking-[0.25em] sm:tracking-[0.4em] text-[5px] sm:text-[8px] mb-0.5 sm:mb-1"
              style={{ color: "#9a8a6e" }}
            >
              Pozivamo Vas
            </p>
            <h2
              className="font-script text-xl sm:text-4xl leading-tight px-1 sm:px-2 select-none"
              style={{ color: gold }}
            >
              {names}
            </h2>
            <div className="flex items-center gap-1 sm:gap-1.5 my-1 sm:my-2">
              <div className="w-3 sm:w-5 h-px" style={{ background: `linear-gradient(to right, transparent, ${gold}66)` }} />
              <Heart size={5} className="sm:hidden" style={{ color: `${gold}88` }} fill="currentColor" />
              <Heart size={6} className="hidden sm:block" style={{ color: `${gold}88` }} fill="currentColor" />
              <div className="w-3 sm:w-5 h-px" style={{ background: `linear-gradient(to left, transparent, ${gold}66)` }} />
            </div>
            {dateParts ? (
              <div className="flex flex-col items-center leading-none select-none mt-0.5 sm:mt-1">
                <span
                  className="font-serif font-bold text-[40px] sm:text-[64px] leading-[0.82]"
                  style={{ color: "#dcc88c", letterSpacing: "-0.02em" }}
                >
                  {dateParts.day}
                </span>
                <span
                  className="font-serif font-semibold text-[14px] sm:text-[22px] leading-none -mt-0.5"
                  style={{ color: gold, letterSpacing: "0.3em" }}
                >
                  {dateParts.month}
                </span>
                <span
                  className="font-elegant text-[10px] sm:text-[15px] leading-none mt-0.5 sm:mt-1"
                  style={{ color: "#8B7355", letterSpacing: "0.35em" }}
                >
                  {dateParts.year}
                </span>
              </div>
            ) : (
              <p
                className="font-serif italic text-[8px] sm:text-xs tracking-[0.15em] sm:tracking-[0.3em]"
                style={{ color: "#8B7355" }}
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
                clipPath: "polygon(0 0%, 50% 55%, 100% 0%, 100% 100%, 0 100%)",
                background: "linear-gradient(to bottom, #f0ead8 0%, #ebe5d3 40%, #e5dfcd 100%)",
                borderBottom: "1px solid rgba(212,175,55,0.15)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 0%, 50% 55%, 100% 0%, 100% 100%, 0 100%)",
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(0,0,0,0.03) 100%)",
              }}
            />
          </div>

          {/* 4. WAX SEAL */}
          <div className="absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-[80px] sm:h-[80px] z-[60]">
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
              <div
                className="relative w-full h-full rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 35% 35%, #e8c84a, ${gold} 40%, ${goldDark} 80%, #8b6914)`,
                  boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), inset 0 2px 6px rgba(255,255,255,0.25), inset 0 -3px 6px rgba(0,0,0,0.25)`,
                  border: `2px solid ${goldDark}`,
                }}
              >
                {/* Outer ring */}
                <div
                  className="absolute inset-1 sm:inset-1.5 rounded-full"
                  style={{ border: "1.5px solid rgba(255,255,255,0.2)" }}
                />
                {/* Inner ring */}
                <div
                  className="absolute inset-2 sm:inset-2.5 rounded-full"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <span
                  className="font-serif text-base sm:text-2xl select-none"
                  style={{
                    color: "#fff",
                    textShadow: "0 1px 3px rgba(0,0,0,0.4), 0 0 8px rgba(255,255,255,0.15)",
                  }}
                >
                  {initials}
                </span>
                {/* Glossy highlight */}
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,_rgba(255,255,255,0.25),_transparent_45%)]" />
                {/* Bottom ambient */}
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_70%_80%,_rgba(139,105,20,0.15),_transparent_40%)]" />
              </div>
            </motion.div>
          </div>

          {/* 5. FLAP */}
          <div
            className="absolute top-0 left-0 right-0 h-[56%] origin-top transition-transform duration-[1400ms] will-change-transform"
            style={{
              transform: isOpen ? "rotateX(180deg)" : "rotateX(0deg)",
              zIndex: stage === "sealed" ? 40 : 5,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Outer Flap */}
            <div
              className="absolute inset-0 shadow-sm"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                background: "linear-gradient(to bottom, #f0ead8, #ebe5d0)",
                backfaceVisibility: "hidden",
              }}
            />

            {/* Inner Flap (backside) */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                transform: "rotateX(180deg)",
                backfaceVisibility: "hidden",
                background: "#f5f2ea",
              }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
