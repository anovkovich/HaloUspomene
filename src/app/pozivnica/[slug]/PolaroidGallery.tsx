"use client";

import { useEffect, useRef } from "react";

interface PolaroidImage {
  url: string;
  pathname: string;
}

interface PolaroidGalleryProps {
  images: PolaroidImage[];
  useCyrillic?: boolean;
  imageLayout?: "line" | "triangle";
}

const LAYOUT_ROTATIONS: Record<number, number[]> = {
  1: [0],
  2: [-3, 3],
  3: [-4, 1.5, -2.5],
};

function PolaroidItem({
  img,
  idx,
  rotation,
  small,
  canHover,
}: {
  img: PolaroidImage;
  idx: number;
  rotation: number;
  small?: boolean;
  canHover: boolean;
}) {
  return (
    <div
      key={img.pathname}
      className="relative cursor-default transition-all duration-300 ease-out"
      style={{
        transform: `rotate(${rotation}deg)`,
        filter:
          "drop-shadow(0 8px 20px rgba(0,0,0,0.22)) drop-shadow(0 2px 6px rgba(0,0,0,0.12))",
      }}
      onMouseEnter={canHover ? (e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = `rotate(${rotation * 0.4}deg) translateY(-8px) scale(1.04) translateZ(0)`;
        el.style.filter =
          "drop-shadow(0 16px 32px rgba(0,0,0,0.28)) drop-shadow(0 4px 10px rgba(0,0,0,0.18))";
        el.style.zIndex = "10";
      } : undefined}
      onMouseLeave={canHover ? (e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = `rotate(${rotation}deg) translateZ(0)`;
        el.style.filter =
          "drop-shadow(0 8px 20px rgba(0,0,0,0.22)) drop-shadow(0 2px 6px rgba(0,0,0,0.12))";
        el.style.zIndex = "";
      } : undefined}
    >
      {/* Pushpin */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 rounded-full"
        style={{
          top: "-10px",
          width: "18px",
          height: "18px",
          backgroundColor: "var(--theme-primary)",
          boxShadow: `0 2px 4px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.3)`,
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            bottom: "2px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "6px",
            height: "6px",
            backgroundColor: "rgba(0,0,0,0.25)",
          }}
        />
      </div>

      {/* Polaroid frame */}
      <div
        className="bg-white"
        style={{
          padding: "10px 10px 42px 10px",
          width: small ? "150px" : "220px",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.url}
          alt={`Fotografija ${idx + 1}`}
          className="w-full object-cover"
          style={{ display: "block", aspectRatio: "1 / 1" }}
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default function PolaroidGallery({
  images,
  useCyrillic,
  imageLayout = "line",
}: PolaroidGalleryProps) {
  const canHoverRef = useRef(false);

  useEffect(() => {
    canHoverRef.current = window.matchMedia("(hover: hover)").matches;
  }, []);

  if (!images || images.length === 0) return null;

  const rotations = LAYOUT_ROTATIONS[images.length] ?? [-4, 1.5, -2.5];
  const isTriangle = imageLayout === "triangle" && images.length === 3;

  return (
    <section
      className="relative py-20 sm:py-32 px-6 overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.25'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Top divider line */}
      <div
        className="absolute top-0 left-0 w-full pointer-events-none"
        style={{
          height: "2px",
          backgroundColor: "var(--theme-primary)",
          opacity: 0.22,
          zIndex: 2,
        }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16 sm:mb-20">
          <h2
            className="text-5xl sm:text-7xl font-script mb-3"
            style={{ color: "var(--theme-primary)" }}
          >
            {useCyrillic ? "Наши тренуци" : "Naši trenuci"}
          </h2>
        </div>

        {isTriangle ? (
          <>
            {/* Triangle layout — desktop: img2 | img1(up) | img3 — mobile: img1 top, img2+img3 row */}
            {/* Desktop */}
            <div
              className="hidden sm:flex items-end justify-center gap-6"
              style={{ perspective: "1000px" }}
            >
              {/* Second image (left on desktop) */}
              <PolaroidItem img={images[1]} idx={1} rotation={rotations[1]} canHover={canHoverRef.current} />
              {/* First image (center, lifted) */}
              <div style={{ marginBottom: "40px" }}>
                <PolaroidItem img={images[0]} idx={0} rotation={rotations[0]} canHover={canHoverRef.current} />
              </div>
              {/* Third image (right on desktop) */}
              <PolaroidItem img={images[2]} idx={2} rotation={rotations[2]} canHover={canHoverRef.current} />
            </div>

            {/* Mobile */}
            <div className="flex sm:hidden flex-col items-center gap-8">
              {/* First image — full size */}
              <PolaroidItem img={images[0]} idx={0} rotation={rotations[0]} canHover={canHoverRef.current} />
              {/* Second + Third — smaller, side by side */}
              <div className="flex items-center justify-center gap-6">
                <PolaroidItem img={images[1]} idx={1} rotation={rotations[1]} small canHover={canHoverRef.current} />
                <PolaroidItem img={images[2]} idx={2} rotation={rotations[2]} small canHover={canHoverRef.current} />
              </div>
            </div>
          </>
        ) : (
          /* Line layout — original */
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-6"
            style={{ perspective: "1000px" }}
          >
            {images.map((img, idx) => (
              <PolaroidItem
                key={img.pathname}
                img={img}
                idx={idx}
                rotation={rotations[idx] ?? 0}
                canHover={canHoverRef.current}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
