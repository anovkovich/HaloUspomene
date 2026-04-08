"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { PremiumThemeType } from "@/app/pozivnica/[slug]/types";
import dynamic from "next/dynamic";

const ParticleBackground = dynamic(() => import("./ParticleBackground"), {
  ssr: false,
});

interface ParallaxHeroProps {
  bride: string;
  groom: string;
  aiCoupleImageUrl?: string;
  premiumTheme?: PremiumThemeType;
  tagline?: string;
  formattedDate: string;
}

export default function ParallaxHero({
  bride,
  groom,
  aiCoupleImageUrl,
  premiumTheme,
  tagline,
  formattedDate,
}: ParallaxHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [gyroOffset, setGyroOffset] = useState({ x: 0, y: 0 });
  const [hasGyro, setHasGyro] = useState(false);

  // Scroll-based parallax
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let raf = 0;
    const handleScroll = () => {
      raf = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Gyroscope support (mobile)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const x = Math.max(-15, Math.min(15, (e.gamma || 0) * 0.5));
      const y = Math.max(-15, Math.min(15, ((e.beta || 0) - 45) * 0.3));
      setGyroOffset({ x, y });
      setHasGyro(true);
    };

    // Try requesting permission on iOS 13+
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      // Permission will be requested on first user interaction
      const requestPermission = async () => {
        try {
          const response = await (
            DeviceOrientationEvent as any
          ).requestPermission();
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
          }
        } catch {
          // Permission denied
        }
      };
      document.addEventListener("click", requestPermission, { once: true });
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const getLayerStyle = (depth: number) => {
    const scrollOffset = scrollY * depth;
    const gyroX = hasGyro ? gyroOffset.x * depth : 0;
    const gyroY = hasGyro ? gyroOffset.y * depth : 0;
    return {
      transform: `translate3d(${gyroX}px, ${-scrollOffset + gyroY}px, 0)`,
      willChange: "transform" as const,
    };
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Layer 1 (back, 0.2x) — Particle background */}
      <div className="absolute inset-0 z-0" style={getLayerStyle(0.2)}>
        {premiumTheme && <ParticleBackground theme={premiumTheme} />}
      </div>

      {/* Layer 2 (0.5x) — Decorative frame */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={getLayerStyle(0.5)}>
        {/* Top arch decoration */}
        <div className="absolute top-0 left-0 right-0 h-40 flex items-start justify-center">
          <svg
            width="300"
            height="120"
            viewBox="0 0 300 120"
            fill="none"
            className="opacity-20"
          >
            <path
              d="M10 120 Q150 0 290 120"
              stroke="#d4af37"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M30 120 Q150 20 270 120"
              stroke="#d4af37"
              strokeWidth="0.5"
              fill="none"
            />
          </svg>
        </div>

        {/* Side decorations */}
        <div className="absolute left-4 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-[#d4af37]/20 to-transparent" />
        <div className="absolute right-4 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-[#d4af37]/20 to-transparent" />
      </div>

      {/* Layer 3 (0.8x) — Hero content (AI couple + names) */}
      <div className="relative z-20 text-center p-4" style={getLayerStyle(0.8)}>
        {aiCoupleImageUrl && (
          <div className="mb-8">
            <img
              src={aiCoupleImageUrl}
              alt={`${bride} & ${groom}`}
              className="w-56 sm:w-64 h-auto mx-auto rounded-3xl shadow-xl shadow-[#d4af37]/10 border border-[#d4af37]/20"
            />
          </div>
        )}

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif text-[#232323] mb-4 drop-shadow-sm">
          {bride}
        </h1>
        <div className="flex items-center justify-center gap-4 my-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4af37]" />
          <Sparkles size={16} className="text-[#d4af37]" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4af37]" />
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif text-[#232323] mb-8 drop-shadow-sm">
          {groom}
        </h1>

        {formattedDate && (
          <p className="text-lg tracking-[0.15em] text-[#8B7355] font-serif">
            {formattedDate}
          </p>
        )}

        {tagline && (
          <p className="text-[#8B7355] mt-6 max-w-md mx-auto italic text-lg">
            &ldquo;{tagline}&rdquo;
          </p>
        )}
      </div>

      {/* Layer 4 (front, 1.2x) — Foreground blur elements */}
      <div className="absolute inset-0 z-30 pointer-events-none" style={getLayerStyle(1.2)}>
        {/* Blurred foreground leaves */}
        <div
          className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#8FAE7E]/10"
          style={{ filter: "blur(20px)" }}
        />
        <div
          className="absolute -bottom-5 -right-10 w-32 h-32 rounded-full bg-[#d4af37]/8"
          style={{ filter: "blur(15px)" }}
        />
        <div
          className="absolute top-20 -right-5 w-24 h-24 rounded-full bg-[#d4af37]/5"
          style={{ filter: "blur(25px)" }}
        />
      </div>
    </section>
  );
}
