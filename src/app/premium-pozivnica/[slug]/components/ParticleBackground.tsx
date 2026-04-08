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

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;
  const count = isMobile ? 30 : 60;

  const initParticles = useCallback(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1000;
    const h = typeof window !== "undefined" ? window.innerHeight : 800;
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const isUp = theme === "disney_pixar";
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: isUp
          ? -(Math.random() * 0.5 + 0.2)
          : Math.random() * 0.3 + 0.1,
        size: Math.random() * 4 + 2,
        opacity: Math.random() * 0.5 + 0.2,
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
        // Rose petals — soft ellipse
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 130, 140, 0.6)`;
        ctx.fill();
      } else if (theme === "disney_pixar") {
        // Gold sparkles — circle with glow
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
        // Line art — geometric dots/lines
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.moveTo(-p.size, 0);
        ctx.lineTo(p.size, 0);
        ctx.strokeStyle = `rgba(100, 100, 100, 0.3)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(80, 80, 80, 0.4)`;
        ctx.fill();
      }

      ctx.restore();
    },
    [theme],
  );

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

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
    initParticles();

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
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
    };
  }, [initParticles, drawParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ willChange: "transform" }}
    />
  );
}
