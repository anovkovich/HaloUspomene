"use client";

import { useEffect, useRef, useCallback } from "react";

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  opacity: number;
  settled: boolean;
}

interface PetalCanvasProps {
  fadingOut: boolean;
  onFadeComplete?: () => void;
}

export default function PetalCanvas({
  fadingOut,
  onFadeComplete,
}: PetalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const fadeOpacityRef = useRef(1);
  const rafRef = useRef<number>(0);

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;
  const petalCount = isMobile ? 35 : 70;

  const initPetals = useCallback(() => {
    const w = window.innerWidth;
    const petals: Petal[] = [];
    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * w,
        y: -(Math.random() * 200 + 50),
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.5 + 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        size: Math.random() * 8 + 6,
        opacity: Math.random() * 0.4 + 0.4,
        settled: false,
      });
    }
    petalsRef.current = petals;
  }, [petalCount]);

  const drawPetal = useCallback(
    (ctx: CanvasRenderingContext2D, petal: Petal) => {
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);
      ctx.globalAlpha = petal.opacity * fadeOpacityRef.current;

      // Simple petal shape
      ctx.beginPath();
      ctx.ellipse(0, 0, petal.size * 0.4, petal.size, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 120, 130, ${0.7})`;
      ctx.fill();

      // Inner highlight
      ctx.beginPath();
      ctx.ellipse(0, -petal.size * 0.2, petal.size * 0.2, petal.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 150, 160, ${0.4})`;
      ctx.fill();

      ctx.restore();
    },
    [],
  );

  useEffect(() => {
    // Check for reduced motion preference
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

    initPetals();

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const floorY = canvas.height - 20;

      for (const petal of petalsRef.current) {
        if (!petal.settled) {
          petal.x += petal.vx;
          petal.y += petal.vy;
          petal.rotation += petal.rotationSpeed;

          // Wind effect
          petal.vx += (Math.random() - 0.5) * 0.1;
          petal.vx = Math.max(-2, Math.min(2, petal.vx));

          // Settle at bottom
          if (petal.y >= floorY) {
            petal.y = floorY;
            petal.vy = 0;
            petal.vx *= 0.95;
            petal.rotationSpeed *= 0.9;
            if (Math.abs(petal.vx) < 0.05) {
              petal.settled = true;
            }
          }
        }

        drawPetal(ctx, petal);
      }

      // Handle fade out
      if (fadingOut) {
        fadeOpacityRef.current -= 0.02;
        if (fadeOpacityRef.current <= 0) {
          fadeOpacityRef.current = 0;
          onFadeComplete?.();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [fadingOut, onFadeComplete, initPetals, drawPetal]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ willChange: "transform" }}
    />
  );
}
