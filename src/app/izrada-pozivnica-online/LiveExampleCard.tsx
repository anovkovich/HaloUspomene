"use client";

import React, { useEffect, useRef, useState } from "react";
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
  /** Looping clip of the real invitation — WebM/VP9, no audio track. */
  videoWebm?: string;
  /** Optional H.264 MP4. Only Safari older than iOS 17.4 needs it. */
  video?: string;
  /** First frame: instant paint, and all that shows if no source decodes. */
  poster?: string;
}

/** Clips are all 540x904 — the phone screen matches so nothing is cropped. */
const CLIP_ASPECT = "aspect-[135/226]";

/**
 * Clip inside the phone frame. It plays only while its card is active AND on
 * screen: the card row is a horizontal scroller, so every card stays mounted,
 * and `preload="none"` keeps the parked ones off the wire entirely.
 *
 * Deliberately not gated on prefers-reduced-motion: these clips are the demo
 * this page exists for, and a static poster reads as a broken player rather
 * than a considered choice. The motion is a muted, looped phone-sized scroll,
 * not parallax or flashing.
 */
function VariantClip({
  variant,
  active,
  prebuffer,
}: {
  variant: ExampleVariant;
  active: boolean;
  prebuffer: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A cold clip needs ~300ms of buffering before play() shows a frame, which
  // is very visible when a pointer sweeps across the row. Once the row is on
  // screen, warm the parked clips so the swap is instant. Touch devices skip
  // this: there, one card fills the screen and only that clip is worth fetching.
  useEffect(() => {
    const el = ref.current;
    if (!el || !prebuffer || !onScreen || el.preload === "auto") return;
    el.preload = "auto";
    el.load();
  }, [prebuffer, onScreen]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active && onScreen) {
      // play() rejects if the element is torn down mid-load; nothing to do.
      void el.play().catch(() => {});
    } else {
      el.pause();
      // Rewind on deactivate so the next hover opens the envelope again, but
      // leave an active-yet-scrolled-away clip where it was.
      if (!active) el.currentTime = 0;
    }
  }, [active, onScreen]);

  return (
    <video
      ref={ref}
      className="w-full h-full object-cover bg-[#0d0d0d]"
      poster={variant.poster}
      muted
      loop
      playsInline
      // Chrome floats a picture-in-picture toggle over any playing video, even
      // without controls. This is a decorative loop inside a phone mock, not a
      // player, so opt out.
      disablePictureInPicture
      preload="none"
    >
      {variant.videoWebm && <source src={variant.videoWebm} type="video/webm" />}
      {variant.video && <source src={variant.video} type="video/mp4" />}
    </video>
  );
}

/**
 * Phone-framed live-example card with a subtle left/right arrow carousel to
 * cycle between theme variants. Each occasion has several variants (colors /
 * fonts / premium themes). Variants without a clip fall back to the skeleton
 * screen, so clips can be added one at a time.
 *
 * `active`/`onActivate` are owned by LiveExamplesRow — see the note there on
 * why only one card plays at a time.
 */
export default function LiveExampleCard({
  label,
  desc,
  variants,
  active,
  onActivate,
  prebuffer,
}: {
  label: string;
  desc: string;
  variants: ExampleVariant[];
  active: boolean;
  onActivate: () => void;
  /** Warm the clip ahead of use — see VariantClip. Pointer devices only. */
  prebuffer: boolean;
}) {
  const [i, setI] = useState(0);
  const many = variants.length > 1;
  const v = variants[i];
  const clip = v.videoWebm ?? v.video;
  const go = (d: number) =>
    setI((p) => (p + d + variants.length) % variants.length);

  const arrow =
    "shrink-0 p-0.5 text-white/35 hover:text-white transition-colors";

  return (
    // Pointer/tap picks the card; onFocusCapture covers keyboard users tabbing
    // into the arrows or the link without needing a role on the wrapper.
    <div
      onMouseEnter={onActivate}
      onFocusCapture={onActivate}
      onClick={onActivate}
      // Only the active card is framed, and the frame stays flat and in-flow:
      // no lift (it broke the row's alignment) and no drop/bloom shadows (wide
      // blurs repaint on every hover). An inset hairline costs nothing and
      // needs no placeholder border on the inactive state, so the row never
      // reflows.
      className={`snap-center shrink-0 flex flex-col items-center rounded-[1.75rem] px-3 sm:px-4 pt-4 pb-5 cursor-pointer transition-[background-color,box-shadow] duration-150 ease-out ${
        active
          ? "bg-white/[0.06] shadow-[inset_0_0_0_1px_rgba(212,175,55,0.22)]"
          : "bg-transparent"
      }`}
    >
      {/* Inactive phones only recede — dimming them hard turns the white
          invitation posters grey, which reads as "failed to load". */}
      <div
        className={`flex items-center gap-0.5 sm:gap-1 transition-opacity duration-150 ease-out ${
          active ? "opacity-100" : "opacity-75"
        }`}
      >
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

        {/* No outer aspect: the screen carries the clip's own ratio and the
            frame's height follows, so nothing is cropped left/right. The clip
            is a stubby 0.597, so the bezels do the elongating — thin at the
            sides, tall enough up top to hold a notch. That reads as 9:16
            (0.563) without touching a pixel of the invitation. */}
        <div className="relative w-[178px] rounded-[2rem] bg-[#0d0d0d] px-1.5 pt-6 pb-3.5 shadow-2xl">
          <div className="absolute top-[9px] left-1/2 -translate-x-1/2 w-12 h-2 rounded-full bg-white/10" />
          <div
            className={`relative w-full ${CLIP_ASPECT} rounded-[1.1rem] overflow-hidden`}
          >
            {clip ? (
              /* `key` forces a fresh <video> per variant: swapping <source>
                 children alone would not reload an already-loaded element. */
              <VariantClip
                key={clip}
                variant={v}
                active={active}
                prebuffer={prebuffer}
              />
            ) : (
              /* Skeleton placeholder until a clip is dropped in for this variant. */
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-3 px-5 text-center transition-[background] duration-300"
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
      {/* New tab: browsing examples is a comparison task, so keep this page
          (and the reader's place in the row) alive behind the sample. */}
      <Link
        href={v.liveHref}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#d4af37] hover:gap-2.5 transition-all mt-2"
      >
        Pogledaj primer uživo
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
