"use client";

import { useEffect, useRef, useCallback } from "react";
import type { PremiumThemeType } from "@/app/pozivnica/[slug]/types";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

interface ParticleBackgroundProps {
  theme: PremiumThemeType;
}

export default function ParticleBackground({
  theme,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const scrollKickRef = useRef(0);
  const lastScrollRef = useRef(0);

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;
  const count = isMobile ? 45 : 90;

  const initParticles = useCallback(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1000;
    const h = typeof window !== "undefined" ? window.innerHeight : 800;
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const isUp = theme === "disney_pixar";
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: isUp
          ? -(Math.random() * 0.5 + 0.2)
          : Math.random() * 0.25 + 0.05,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }
    particlesRef.current = particles;
  }, [count, theme]);

  const drawParticle = useCallback(
    (ctx: CanvasRenderingContext2D, p: Particle, w: number, h: number) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;

      if (theme === "watercolor") {
        // Warm champagne sparkles with twinkle + glow — visible on dark bg
        ctx.translate(p.x, p.y);
        const twinkle = 0.6 + 0.4 * Math.sin(Date.now() * 0.002 + p.x);
        ctx.globalAlpha = p.opacity * twinkle;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = "#f5e6b8";
        ctx.shadowColor = "#d4af37";
        ctx.shadowBlur = p.size * 4;
        ctx.fill();
      } else if (theme === "disney_pixar") {
        ctx.translate(p.x, p.y);
        const twinkle = 0.5 + 0.5 * Math.sin(Date.now() * 0.003 + p.x);
        ctx.globalAlpha = p.opacity * twinkle;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#d4af37";
        ctx.shadowColor = "#d4af37";
        ctx.shadowBlur = p.size * 3;
        ctx.fill();
      } else {
        // Line art — warm golden dust with soft glow, visible on cream bg
        ctx.translate(p.x, p.y);
        const twinkle = 0.75 + 0.25 * Math.sin(Date.now() * 0.002 + p.x);
        ctx.globalAlpha = Math.min(1, p.opacity * twinkle + 0.2);
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#b8932a";
        ctx.shadowColor = "#8b6914";
        ctx.shadowBlur = p.size * 6;
        ctx.fill();
      }

      ctx.restore();
    },
    [theme],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    lastScrollRef.current = window.scrollY;
    const onScroll = () => {
      const delta = window.scrollY - lastScrollRef.current;
      lastScrollRef.current = window.scrollY;
      // Scrolling down = upward drift (gravity loss).
      scrollKickRef.current -= Math.max(-30, Math.min(30, delta)) * 0.08;
      // Cap accumulated drift so fast scrolling never jolts.
      scrollKickRef.current = Math.max(-3, Math.min(3, scrollKickRef.current));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    initParticles();

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const kick = scrollKickRef.current;
      scrollKickRef.current *= 0.9; // decay

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy + kick;
        p.rotation += p.rotationSpeed;

        // Wrap around
        if (p.y > canvas.height + 20) p.y = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.x < -20) p.x = canvas.width + 20;

        drawParticle(ctx, p, canvas.width, canvas.height);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [initParticles, drawParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ willChange: "transform", zIndex: 2 }}
    />
  );
}
