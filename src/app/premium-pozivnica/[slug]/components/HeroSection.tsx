"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Heart, ChevronDown } from "lucide-react";
import type { PremiumThemeType } from "@/app/pozivnica/[slug]/types";
import {
  getPremiumVisualTheme,
  type PremiumVisualTheme,
} from "../premiumThemeConfig";
import dynamic from "next/dynamic";

const ParticleBackground = dynamic(() => import("./ParticleBackground"), {
  ssr: false,
});

interface HeroSectionProps {
  bride: string;
  groom: string;
  aiCoupleImageUrl?: string;
  premiumTheme?: PremiumThemeType;
  tagline?: string;
  formattedDateShort: string;
}

export default function HeroSection({
  bride,
  groom,
  aiCoupleImageUrl,
  premiumTheme,
  tagline,
  formattedDateShort,
}: HeroSectionProps) {
  const vt = getPremiumVisualTheme(premiumTheme);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // Window-level scroll (same as starry night in LineArtInvitation)
  const { scrollY: windowScrollY } = useScroll();
  const namesStarryMatchY = useTransform(windowScrollY, [0, 1200], [0, 480]);

  // Each layer transforms at different rates as the section scrolls out
  // Negative = moves up slower (stays behind = far), Positive = moves up faster (foreground)
  const yBg = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const yArch = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yGarlandTop = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const yFlowers = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const yContent = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yGarlandBottom = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const yForeground = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const yRoses = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0]);
  const namesFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-screen flex flex-col items-center overflow-hidden ${
        premiumTheme === "line_art" ? "justify-start pt-16 sm:pt-14 md:pt-12" : "justify-center"
      }`}
    >
      {/* ── LAYER 0 — Background gradient ── */}
      <div className={`absolute inset-0 z-0 ${vt.bgGradient}`} />

      {/* ── LAYER 0.5 — Paper wallpaper texture (line_art only) ── */}
      {premiumTheme === "line_art" && (
        <div
          className="absolute inset-0 z-[1]"
          style={{
            backgroundImage: "url('/images/premium/line-art-invitation/paper-wallpaper.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}

      {/* ── Yellow roses — left & right, 40% from top (line_art only) ── */}
      {premiumTheme === "line_art" && (
        <>
          <motion.div
            className="pointer-events-none absolute top-[20%] sm:top-[26%] md:top-[30%] lg:top-[34%] xl:top-[38%] left-[-8%] sm:left-[-5%] z-[6] w-[52%] sm:w-[38%] md:w-[34%] lg:w-[32%] max-w-[500px] md:max-w-[420px] lg:max-w-[480px] xl:max-w-[540px]"
            style={{ y: yRoses }}
          >
            <motion.img
              src="/images/premium/line-art-invitation/yellow-roses.png"
              alt=""
              aria-hidden
              className="w-full h-auto -scale-x-100 drop-shadow-[0_25px_45px_rgba(0,0,0,0.55)] origin-top"
              animate={{ y: [0, -16, 0], rotate: [-2, 3, -2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute top-[20%] sm:top-[26%] md:top-[30%] lg:top-[34%] xl:top-[38%] right-[-8%] sm:right-[-5%] z-[6] w-[52%] sm:w-[38%] md:w-[34%] lg:w-[32%] max-w-[500px] md:max-w-[420px] lg:max-w-[480px] xl:max-w-[540px]"
            style={{ y: yRoses }}
          >
            <motion.img
              src="/images/premium/line-art-invitation/yellow-roses.png"
              alt=""
              aria-hidden
              className="w-full h-auto drop-shadow-[0_25px_45px_rgba(0,0,0,0.55)] origin-top"
              animate={{ y: [0, -14, 0], rotate: [-2, 3, -2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </>
      )}


      {/* ── LAYER 1 — Particles (slow) ── */}
      <motion.div className="absolute inset-0 z-[1]" style={{ y: yBg }}>
        {premiumTheme && <ParticleBackground theme={premiumTheme} />}
      </motion.div>

      {/* ── LAYER 2 — Ornate arch frame (medium) ── */}
      <motion.div
        className="absolute inset-0 z-[2] pointer-events-none flex items-center justify-center"
        style={{ y: yArch }}
      >
        <img
          src="/images/premium/ornaments/ornate-arch-frame.png"
          alt=""
          className="w-[88%] sm:w-[70%] max-w-[520px] h-auto opacity-40"
        />
      </motion.div>

      {/* ── LAYER 3 — Top floral garland (fast — scrolls away quickly) ── */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-[3] pointer-events-none"
        style={{ y: yGarlandTop }}
      >
        <img
          src="/images/premium/ornaments/floral-garland-top.png"
          alt=""
          className="w-full h-auto opacity-80"
        />
      </motion.div>

      {/* ── LAYER 4 — Floating flowers (fastest — strong parallax) ── */}
      <motion.div
        className="absolute inset-0 z-[6] pointer-events-none"
        style={{ y: yFlowers, opacity: opacityFade }}
      >
        <img src="/images/premium/ornaments/floating-flower-1.png" alt="" className="absolute top-[12%] left-[3%] w-14 sm:w-20 opacity-50 rotate-[-15deg]" />
        <img src="/images/premium/ornaments/floating-flower-2.png" alt="" className="absolute top-[8%] right-[5%] w-12 sm:w-16 opacity-40 rotate-[20deg]" />
        <img src="/images/premium/ornaments/floating-flower-3.png" alt="" className="absolute top-[55%] left-[2%] w-12 sm:w-18 opacity-45 rotate-[30deg]" />
        <img src="/images/premium/ornaments/floating-flower-1.png" alt="" className="absolute top-[45%] right-[3%] w-10 sm:w-16 opacity-35 rotate-[-25deg]" />
        <img src="/images/premium/ornaments/floating-flower-2.png" alt="" className="absolute top-[75%] left-[8%] w-10 sm:w-14 opacity-30 rotate-[-40deg]" />
        <img src="/images/premium/ornaments/floating-flower-3.png" alt="" className="absolute top-[70%] right-[6%] w-11 sm:w-15 opacity-40 rotate-[10deg]" />
      </motion.div>

      {/* ── LAYER 5 — Side floral accents (medium) ── */}
      <motion.div
        className="absolute inset-0 z-[4] pointer-events-none"
        style={{ y: yArch }}
      >
        <img src="/images/premium/ornaments/floating-flower-2.png" alt="" className="absolute left-0 top-[30%] w-16 sm:w-24 opacity-30 rotate-[-10deg]" />
        <img src="/images/premium/ornaments/floating-flower-2.png" alt="" className="absolute right-0 top-[35%] w-16 sm:w-24 opacity-30 rotate-[10deg] -scale-x-100" />
      </motion.div>

      {/* ── LAYER 6 — Main hero content ── */}
      <motion.div
        className="relative z-[10] text-center px-4 sm:px-8 md:px-10 max-w-lg mx-auto"
        style={{ y: yContent }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* Pre-title (hidden for line_art) */}
        {premiumTheme !== "line_art" && (
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 sm:w-16 h-px bg-gradient-to-r from-transparent to-[#d4af37]/50" />
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-[#d4af37]/70">
              Pozivamo Vas
            </p>
            <div className="w-10 sm:w-16 h-px bg-gradient-to-l from-transparent to-[#d4af37]/50" />
          </div>
        )}

        {/* AI couple image (in main content for non-line_art) */}
        {premiumTheme !== "line_art" && aiCoupleImageUrl && (
          <motion.div
            className="mb-8 sm:mb-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative inline-block">
              <img
                src={aiCoupleImageUrl}
                alt={`${bride} & ${groom}`}
                className="w-52 h-52 sm:w-72 sm:h-72 object-cover rounded-full shadow-2xl shadow-[#d4af37]/15 border-2 border-[#d4af37]/20"
              />
              <div className="absolute -inset-2 rounded-full border border-[#d4af37]/15" />
              <div className="absolute -inset-4 rounded-full border border-dashed border-[#d4af37]/10" />
              <div className="absolute -inset-6 rounded-full border border-[#d4af37]/5" />
            </div>
          </motion.div>
        )}

        {/* Names */}
        <motion.div
          style={
            premiumTheme === "line_art"
              ? { opacity: namesFade, y: namesStarryMatchY }
              : undefined
          }
        >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1
            className={`font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] uppercase tracking-wide ${
              premiumTheme === "line_art" ? "text-[#d4af37]" : "text-[#232323] drop-shadow-sm"
            }`}
            style={
              premiumTheme === "line_art"
                ? {
                    textShadow:
                      "0 1px 0 #a68419, 0 2px 3px rgba(0,0,0,0.25), 0 6px 18px rgba(0,0,0,0.3)",
                  }
                : undefined
            }
          >
            {bride}
          </h1>
          <div
            className={`flex items-center justify-center gap-3 ${
              premiumTheme === "line_art" ? "my-0.5 sm:my-1" : "my-3 sm:my-4"
            }`}
          >
            <div className="w-12 sm:w-20 h-px bg-gradient-to-r from-transparent to-[#d4af37]/60" />
            <Heart size={10} className="text-[#d4af37]/60" fill="currentColor" />
            <div className="w-12 sm:w-20 h-px bg-gradient-to-l from-transparent to-[#d4af37]/60" />
          </div>
          <h1
            className={`font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] uppercase tracking-wide ${
              premiumTheme === "line_art" ? "text-[#d4af37]" : "text-[#232323] drop-shadow-sm"
            }`}
            style={
              premiumTheme === "line_art"
                ? {
                    textShadow:
                      "0 1px 0 #a68419, 0 2px 3px rgba(0,0,0,0.25), 0 6px 18px rgba(0,0,0,0.3)",
                  }
                : undefined
            }
          >
            {groom}
          </h1>
        </motion.div>
        </motion.div>

        {/* Date (hidden for line_art) */}
        {premiumTheme !== "line_art" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-8 sm:mt-10"
          >
            <div className="inline-block relative px-8 py-3">
              <div className="absolute inset-0 border border-[#d4af37]/20 rounded-full" />
              <p className="font-serif tracking-[0.2em] text-base sm:text-lg text-[#8B7355]">
                {formattedDateShort}
              </p>
            </div>
          </motion.div>
        )}

        {/* Tagline (hidden for line_art) */}
        {premiumTheme !== "line_art" && tagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-[#8B7355]/80 mt-8 max-w-sm mx-auto italic font-serif text-base sm:text-lg leading-relaxed"
          >
            &ldquo;{tagline}&rdquo;
          </motion.p>
        )}
      </motion.div>

      {/* ── AI couple image — bottom center, floating (line_art only) ── */}
      {premiumTheme === "line_art" && aiCoupleImageUrl && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 bottom-[10%] sm:bottom-[8%] md:bottom-[5%] lg:bottom-[3%] z-[6] pointer-events-none"
          style={{ y: yRoses }}
        >
          <motion.img
            src={aiCoupleImageUrl}
            alt={`${bride} & ${groom}`}
            className="h-[50vh] sm:h-[47vh] md:h-[44vh] lg:h-[40vh] w-auto max-w-none object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.55)]"
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}

      {/* ── LAYER 7 — Bottom floral (foreground — moves up INTO view) ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-[12] pointer-events-none"
        style={{ y: yGarlandBottom }}
      >
        <img
          src="/images/premium/ornaments/floral-garland-bottom.png"
          alt=""
          className="w-full h-auto opacity-75"
        />
      </motion.div>

      {/* ── LAYER 8 — Foreground blur glow (moves opposite) ── */}
      <motion.div
        className="absolute inset-0 z-[15] pointer-events-none"
        style={{ y: yForeground }}
      >
        <div className="absolute -bottom-10 -left-10 w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-[#d4af37]/[0.04]" style={{ filter: "blur(30px)" }} />
        <div className="absolute -bottom-5 -right-10 w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-[#8FAE7E]/[0.05]" style={{ filter: "blur(25px)" }} />
        <div className="absolute top-20 -right-5 w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-[#d4af37]/[0.03]" style={{ filter: "blur(35px)" }} />
        <div className="absolute top-1/4 -left-8 w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-[#C8A07E]/[0.04]" style={{ filter: "blur(30px)" }} />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <ChevronDown size={20} className="text-[#d4af37]/40 animate-bounce" />
      </motion.div>
    </section>
  );
}
