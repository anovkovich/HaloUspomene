"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface ExampleVariant {
  /** Theme/variant name shown under the phone (e.g. "Classic Rose"). */
  theme: string;
  gradient: string;
  initials: string;
  initialsColor?: string;
  /** "Pogledaj primer uživo" target for this variant. */
  liveHref: string;
  /**
   * Optional looping clip of the real invitation (muted, autoplay). When set it
   * replaces the skeleton placeholder. MP4 (H.264, yuv420p) required for iOS;
   * WebM optional for smaller size. See placement/encoding spec in the PR.
   */
  video?: string;
  videoWebm?: string;
  /** First-frame image — instant paint + fallback while the clip loads. */
  poster?: string;
}

/**
 * Phone-framed live-example card with a subtle left/right arrow carousel to
 * cycle between theme variants. Each occasion has several variants (colors /
 * fonts / premium themes). The skeleton screen is a placeholder — real
 * GIF/video clips per theme drop straight into the frame later (separate task).
 */
export default function LiveExampleCard({
  label,
  desc,
  variants,
}: {
  label: string;
  desc: string;
  variants: ExampleVariant[];
}) {
  const [i, setI] = useState(0);
  const many = variants.length > 1;
  const v = variants[i];
  const go = (d: number) =>
    setI((p) => (p + d + variants.length) % variants.length);

  const arrow =
    "shrink-0 p-0.5 text-white/35 hover:text-white transition-colors";

  return (
    <div className="snap-center shrink-0 flex flex-col items-center">
      <div className="flex items-center gap-0.5 sm:gap-1">
        {many && (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Prethodna tema"
            className={arrow}
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div className="relative w-[178px] aspect-[9/19] rounded-[2rem] bg-[#0d0d0d] p-2.5 shadow-2xl">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full bg-white/15 z-10" />
          {v.video ? (
            /* Real invitation clip — muted looping teaser. `key` forces a fresh
               <video> per variant so switching themes reloads the right clip. */
            <video
              key={v.video}
              className="w-full h-full rounded-[1.6rem] object-cover bg-[#0d0d0d]"
              poster={v.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src={v.video} type="video/mp4" />
              {v.videoWebm && <source src={v.videoWebm} type="video/webm" />}
            </video>
          ) : (
            /* Skeleton placeholder until a clip is dropped in for this variant. */
            <div
              className="w-full h-full rounded-[1.6rem] overflow-hidden flex flex-col items-center justify-center gap-3 px-5 text-center transition-[background] duration-300"
              style={{ background: v.gradient }}
            >
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/70">
                Pozivnica
              </span>
              <span
                className="font-serif text-3xl leading-none"
                style={{ color: v.initialsColor ?? "#ffffff" }}
              >
                {v.initials}
              </span>
              <div className="flex flex-col items-center gap-1.5">
                <span className="h-1.5 w-24 rounded-full bg-white/25" />
                <span className="h-1.5 w-16 rounded-full bg-white/20" />
              </div>
              <div className="flex gap-1.5 mt-1">
                {["12", "08", "45"].map((n) => (
                  <span
                    key={n}
                    className="w-7 h-8 rounded-md bg-white/15 flex items-center justify-center text-white text-xs font-medium"
                  >
                    {n}
                  </span>
                ))}
              </div>
              <span className="mt-1 text-[9px] bg-white/90 text-[#232323] px-3 py-1 rounded-full">
                Potvrdi dolazak
              </span>
            </div>
          )}
        </div>

        {many && (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Sledeća tema"
            className={arrow}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {many && (
        <div className="flex gap-1.5 mt-3">
          {variants.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Tema ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-4 bg-[#d4af37]" : "w-1.5 bg-white/25"
              }`}
            />
          ))}
        </div>
      )}

      <p className="mt-4 font-serif text-lg text-[#F5F4DC]">{label}</p>
      <p className="text-xs text-[#F5F4DC]/45">{desc}</p>
      {many && (
        <p className="text-[11px] font-medium text-[#d4af37]/80 mt-0.5">
          {v.theme}
        </p>
      )}
      <Link
        href={v.liveHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#d4af37] hover:gap-2.5 transition-all mt-2"
      >
        Pogledaj primer uživo
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
