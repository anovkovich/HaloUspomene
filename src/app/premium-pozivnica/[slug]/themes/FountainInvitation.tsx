"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useAnimation,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { Clock } from "lucide-react";
import TornPaperDivider from "../components/TornPaperDivider";
import type { ThemeInvitationProps } from "../PremiumInvitationClient";

const BURGUNDY = "#6B0E1E";
const BURGUNDY_DEEP = "#4A0813";
const CREAM = "#fdfaf3";

const ASSETS = {
  bgPortrait: "/images/premium/fountain/bg-portrait.webp",
  bgLandscape: "/images/premium/fountain/bg-landscape.webp",
  fountain1: "/images/premium/fountain/fountain-1.webp",
  fountain2: "/images/premium/fountain/fountain-2.webp",
  // VP9 with alpha channel — built from dove.mp4 via ffmpeg chromakey filter.
  // Browser plays it natively with transparent bg, GPU-decoded, no runtime
  // chroma-key shader needed. ~520KB at 800×450, 2× speed flap.
  dove: "/images/premium/fountain/dove.webm",
  frame: "/images/premium/fountain/frame.webp",
  paper: "/images/premium/fountain/paper.webp",
  roseRed: "/images/premium/fountain/rose-red.webp",
  roseRedSm: "/images/premium/fountain/rose-red-sm.webp",
  roseWhite: "/images/premium/fountain/rose-white.webp",
  roseWhiteSm: "/images/premium/fountain/rose-white-sm.webp",
};

const T = {
  latin: {
    weddingDay: "Dan venčanja",
    dearFamily: "Dragi prijatelji i porodico",
    days: "dana",
    hours: "sati",
    mins: "minuta",
    secs: "sekundi",
    schedule: "Raspored događaja",
    location: "Lokacija",
    locations: "Lokacije",
    confirmAttendance: "Potvrdite dolazak",
    confirmCta: "Pošaljite odgovor",
    rsvpBy: "Molimo potvrdite do",
    hopeToSeeYou: "Radujemo se vašem dolasku",
    ourMoments: "Naši trenuci",
    monthsGenitive: [
      "januara",
      "februara",
      "marta",
      "aprila",
      "maja",
      "juna",
      "jula",
      "avgusta",
      "septembra",
      "oktobra",
      "novembra",
      "decembra",
    ],
  },
  cyrillic: {
    weddingDay: "Дан венчања",
    dearFamily: "Драги пријатељи и породицо",
    days: "дана",
    hours: "сати",
    mins: "минута",
    secs: "секунди",
    schedule: "Распоред догађаја",
    location: "Локација",
    locations: "Локације",
    confirmAttendance: "Потврдите долазак",
    confirmCta: "Пошаљите одговор",
    rsvpBy: "Молимо потврдите до",
    hopeToSeeYou: "Радујемо се вашем доласку",
    ourMoments: "Наши тренуци",
    monthsGenitive: [
      "јануара",
      "фебруара",
      "марта",
      "априла",
      "маја",
      "јуна",
      "јула",
      "августа",
      "септембра",
      "октобра",
      "новембра",
      "децембра",
    ],
  },
};

// Rose composition — dense, multi-layered band that fills the space like a
// real florist arrangement. Built in 3 layers (back/mid/front) with smaller
// "-sm" roses filling the seams between larger ones. Seeded for determinism.
interface RoseSpec {
  src: string;
  leftPct: number;
  offsetPx: number; // distance from the anchored edge (top or bottom)
  width: number;
  rotation: number;
  z: number;
}

function makeRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function RosesBand({
  position,
  seed = 1,
  bandHeight = 200,
  /** Pixels the band overhangs past the anchored edge — pulls roses out of section bg. */
  overflow = 40,
  /** Indices to skip (after generation). */
  excludeIndices = [],
  /** When true, render the rose's index over the image. */
  debug = false,
  /** Force all roses to be white only (no red). */
  whiteOnly = false,
  /** Per-index size multiplier (e.g. { 4: 1.4 } makes rose #4 40% bigger). */
  sizeMultipliers = {},
  /** Per-index vertical nudge in pixels. Positive value moves the rose UP
   *  (toward the anchored edge); negative moves DOWN. Direction-agnostic. */
  nudgeUp = {},
}: {
  position: "top" | "bottom";
  seed?: number;
  bandHeight?: number;
  overflow?: number;
  excludeIndices?: number[];
  debug?: boolean;
  whiteOnly?: boolean;
  sizeMultipliers?: Record<number, number>;
  nudgeUp?: Record<number, number>;
}) {
  const roses = useMemo<RoseSpec[]>(() => {
    const rand = makeRand(seed);
    const arr: RoseSpec[] = [];

    // ── BACK LAYER ── big roses set deeper into the band
    const backCount = 3;
    for (let i = 0; i < backCount; i++) {
      // Always consume the rand() slot so positions stay deterministic
      // regardless of whiteOnly toggle.
      const redRoll = rand();
      const isRed = !whiteOnly && redRoll > 0.45;
      arr.push({
        src: isRed ? ASSETS.roseRed : ASSETS.roseWhite,
        leftPct: (i / backCount) * 105 + rand() * 12 - 6,
        offsetPx: bandHeight * 0.35 + rand() * (bandHeight * 0.25),
        width: 100 + rand() * 50,
        rotation: rand() * 60 - 30,
        z: 1,
      });
    }

    // ── MID LAYER ── big roses near the seam — the main visual mass
    const midCount = 5;
    for (let i = 0; i < midCount; i++) {
      const redRoll = rand();
      const isRed = !whiteOnly && redRoll > 0.5;
      arr.push({
        src: isRed ? ASSETS.roseRed : ASSETS.roseWhite,
        leftPct: (i / midCount) * 105 + rand() * 10 - 5,
        offsetPx: rand() * (bandHeight * 0.35),
        width: 115 + rand() * 55,
        rotation: rand() * 60 - 30,
        z: 3,
      });
    }

    // ── FRONT LAYER ── small roses fill gaps on top
    const frontCount = 7;
    for (let i = 0; i < frontCount; i++) {
      const redRoll = rand();
      const isRed = !whiteOnly && redRoll > 0.5;
      arr.push({
        src: isRed ? ASSETS.roseRedSm : ASSETS.roseWhiteSm,
        leftPct: (i / frontCount) * 105 + rand() * 8 - 4,
        offsetPx: rand() * bandHeight * 0.55,
        width: 60 + rand() * 35,
        rotation: rand() * 80 - 40,
        z: 5,
      });
    }

    return arr;
  }, [bandHeight, seed]);

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none select-none"
      style={{
        height: bandHeight,
        [position]: -overflow,
        zIndex: 25, // above fountain (z-10) so roses can sit ON the fountain
      }}
    >
      {roses.map((r, i) => {
        if (excludeIndices.includes(i)) return null;
        const mult = sizeMultipliers[i] ?? 1;
        const nudge = nudgeUp[i] ?? 0;
        // For position="top", offsetPx is distance from top, so moving up
        // means subtracting. For position="bottom", larger offset = higher,
        // so moving up means adding.
        const offset =
          position === "top" ? r.offsetPx - nudge : r.offsetPx + nudge;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${r.leftPct}%`,
              [position]: `${offset}px`,
              width: `${r.width * mult}px`,
              transform: `translateX(-50%) rotate(${r.rotation}deg)`,
              zIndex: r.z,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={r.src}
              alt=""
              className="block w-full"
              style={{
                filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.4))",
              }}
              draggable={false}
            />
            {debug && (
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  color: "#fff",
                  background: "rgba(0,0,0,0.55)",
                  fontWeight: 700,
                  fontSize: 18,
                  borderRadius: 6,
                  border: "2px solid #ff0",
                  transform: `rotate(${-r.rotation}deg)`, // counter-rotate for legibility
                }}
              >
                {i}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FountainCountdown({
  targetDate,
  labels,
  color = "#fff",
  mutedColor = "rgba(255,255,255,0.7)",
  separatorColor = "rgba(255,255,255,0.6)",
}: {
  targetDate: string;
  labels: { days: string; hours: string; mins: string; secs: string };
  color?: string;
  mutedColor?: string;
  separatorColor?: string;
}) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setT({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const items = [
    { value: t.d, label: labels.days },
    { value: t.h, label: labels.hours },
    { value: t.m, label: labels.mins },
    { value: t.s, label: labels.secs },
  ];

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-md mx-auto">
      {items.map((it, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className="flex items-baseline">
            <span
              className="text-4xl sm:text-6xl font-serif tabular-nums"
              style={{ color, fontWeight: 300, letterSpacing: "0.02em" }}
            >
              {String(it.value).padStart(2, "0")}
            </span>
            {i < items.length - 1 && (
              <span
                className="text-3xl sm:text-5xl mx-1 sm:mx-2 font-serif"
                style={{ color: separatorColor }}
              >
                :
              </span>
            )}
          </div>
          <span
            className="text-[10px] sm:text-xs uppercase tracking-[0.25em] mt-1"
            style={{ color: mutedColor }}
          >
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ScheduleTimeline({
  timeline,
}: {
  timeline: {
    title: string;
    time: string;
    what?: string;
    description?: string;
  }[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [dotYs, setDotYs] = useState<number[]>([]);
  const [containerH, setContainerH] = useState(0);

  // Measure dot Y positions (in container coords) and container height. We
  // map scroll progress through these positions with a dwell-around-each-dot
  // curve so the rose lingers near a point and races between points.
  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      if (!container || timeline.length < 2) return;
      const cBox = container.getBoundingClientRect();
      setContainerH(cBox.height);
      const positions = dotsRef.current.map((dot) => {
        if (!dot) return 0;
        const box = dot.getBoundingClientRect();
        return box.top + box.height / 2 - cBox.top;
      });
      setDotYs(positions);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [timeline.length]);

  // useScroll: progress 0 when container TOP hits viewport center, 1 when
  // container BOTTOM hits viewport center. With this offset, at progress p
  // a dot at container-y = (p * containerH) sits at viewport center.
  const { scrollYProgress: timelineProgress } = useScroll({
    target: containerRef,
    offset: ["start 50vh", "end 50vh"],
  });

  // Build a piecewise-linear map: for each dot, a "dwell" zone (progress
  // range where rose stays parked on that dot) plus quick linear transitions
  // between adjacent dot zones. Result: rose lingers near each point, races
  // through the gaps.
  const { inputRange, outputRange } = useMemo(() => {
    if (dotYs.length < 2 || containerH === 0) {
      return { inputRange: [0, 1], outputRange: [0, 0] };
    }
    const n = dotYs.length;
    const halfDwell = Math.min(0.07, 0.4 / n);
    const input: number[] = [];
    const output: number[] = [];
    for (let i = 0; i < n; i++) {
      const natural = dotYs[i] / containerH; // progress when this dot is at center
      let a = Math.max(0, natural - halfDwell);
      const b = Math.min(1, natural + halfDwell);
      // Keep input array strictly monotonic — bump if it backtracks.
      if (input.length > 0 && a <= input[input.length - 1]) {
        a = input[input.length - 1] + 0.0001;
      }
      input.push(a);
      output.push(dotYs[i]);
      input.push(Math.max(b, a + 0.0001));
      output.push(dotYs[i]);
    }
    return { inputRange: input, outputRange: output };
  }, [dotYs, containerH]);

  const roseYRaw = useTransform(timelineProgress, inputRange, outputRange);
  // Spring-smoothed Y. Bypasses jitter on fast scrolls and lets the browser
  // composite without re-laying-out on every scroll frame.
  const roseY = useSpring(roseYRaw, {
    stiffness: 180,
    damping: 28,
    mass: 0.6,
  });

  if (!timeline || timeline.length === 0) return null;
  return (
    <div
      ref={containerRef}
      className="relative max-w-md mx-auto px-4"
      style={{ overflow: "visible" }}
    >
      {/* Vertical line at center */}
      <div
        className="absolute left-1/2 top-3 bottom-3 w-px -translate-x-1/2 pointer-events-none"
        style={{ background: "rgba(255,255,255,0.55)" }}
        aria-hidden
      />

      {/* Scroll-driven rose — its container-Y position is mapped from scroll
          progress with a dwell-around-each-dot curve. The rose appears to
          "stick" to a point while that point is near the viewport center,
          then races to the next point as the scroll progresses past it. */}
      {timeline.length >= 2 && dotYs.length > 0 && containerH > 0 && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center"
          style={{
            top: 0,
            width: 56,
            height: 56,
            y: roseY,
            marginTop: -28,
            zIndex: 2,
            willChange: "transform",
            transform: "translateZ(0)",
          }}
          aria-hidden
        >
          <div
            className="flex items-center justify-center"
            style={{ width: 56, height: 56 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.roseWhite}
              alt=""
              className="block w-full h-full"
              style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.55))" }}
              draggable={false}
            />
          </div>
        </motion.div>
      )}

      {timeline.map((item, i) => (
        <div
          key={i}
          className="relative grid items-center py-8 sm:py-10"
          style={{ gridTemplateColumns: "1fr 14px 1fr" }}
        >
          <div className="pr-6 text-right">
            <div
              className="font-serif text-2xl sm:text-3xl text-white tabular-nums"
              style={{ fontWeight: 300 }}
            >
              {item.time}
            </div>
            {item.what && (
              <div
                className="text-white/70 text-xs sm:text-sm mt-1.5 leading-snug"
                style={{
                  fontFamily: "var(--body-font, serif)",
                  letterSpacing: "0.04em",
                  fontStyle: "italic",
                }}
              >
                {item.what}
              </div>
            )}
          </div>
          <div
            ref={(el) => {
              dotsRef.current[i] = el;
            }}
            className="relative"
            style={{ width: 14, height: 14, zIndex: 1 }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "#fff",
                boxShadow: "0 0 0 3px rgba(255,255,255,0.25)",
              }}
            />
          </div>
          <div className="pl-6 text-left">
            <p className="text-white text-lg sm:text-2xl font-light tracking-wide leading-tight pb-1.5">
              {item.title}
            </p>
            {item.description && (
              <p
                className="text-white/70 text-xs sm:text-sm mt-1.5 leading-snug"
                style={{
                  fontFamily: "var(--body-font, serif)",
                  letterSpacing: "0.04em",
                  fontStyle: "italic",
                }}
              >
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Native transparent-WebM dove. The source dove.mp4 was pre-processed once
 *  with ffmpeg (chromakey + despill + downscale + 2× speed → VP9 with
 *  alpha). The browser decodes it on the GPU and composites it
 *  transparently — no canvas, no shader, no per-frame JS. ~380KB total.
 *  `mirror` flips horizontally for the second dove. */
function DoveVideo({
  size = 140,
  mirror = false,
}: {
  size?: number;
  mirror?: boolean;
}) {
  return (
    <video
      src={ASSETS.dove}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      style={{
        width: size,
        height: "auto",
        display: "block",
        transform: mirror ? "scaleX(-1)" : undefined,
      }}
    />
  );
}

/** Real-paper background. The image is ≥150vw wide so its natural left/right
 *  torn edges sit off-screen, and `overhangTop` lets it spill up into the
 *  burgundy section above (mirroring how the roses straddle a section seam).
 *  The image height = section height + overhangTop, so the natural TOP torn
 *  edge sits above the section (visible against burgundy) and the natural
 *  BOTTOM torn edge sits at the section's bottom. Parent section must NOT
 *  clip vertically (use `overflow-x: clip` instead of `overflow-hidden`). */
function PaperBg({
  overhangTopPx = 0,
  overhangBottomPx = 0,
  overhang = 25,
}: {
  /** Extra fixed pixels the image spills past the section's TOP (used to
   *  cross-fade into the previous burgundy section). */
  overhangTopPx?: number;
  /** Extra fixed pixels the image spills past the section's BOTTOM (used to
   *  cross-fade into the next burgundy section). */
  overhangBottomPx?: number;
  /** Proportional spill (% of section height) on BOTH top and bottom. The
   *  paper image has ~15% transparent torn-edge padding on top and bottom,
   *  so we always need some proportional overhang to push the torn edges
   *  past the section's content area, otherwise tall content "falls off"
   *  the visible white paper. 25% is a safe default. */
  overhang?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ASSETS.paper}
      alt=""
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none select-none"
      style={{
        top: `calc(-${overhang}% - ${overhangTopPx}px)`,
        minWidth: "150vw",
        width: "150vw",
        height: `calc(${100 + 2 * overhang}% + ${overhangTopPx + overhangBottomPx}px)`,
        objectFit: "cover",
      }}
      draggable={false}
      aria-hidden
    />
  );
}

function PhotoFrame({ src, idx }: { src: string; idx: number }) {
  // Final resting tilt — slight, alternates direction for organic feel.
  const restRotations = [-4, 3.5, -3];
  const rot = restRotations[idx % restRotations.length];
  // Initial swing position — picture starts noticeably off-tilt in the
  // opposite direction, then spring-physics swings it down to the rest
  // angle like a freshly-hung frame settling on its nail.
  const swingFrom = idx % 2 === 0 ? -32 : 32;
  // Inner-opening inset (% of frame outer dimensions) — measured against the
  // ornate gold border in frame.webp. Photo gets clipped to this rectangle.
  const INSET = { top: 14, bottom: 14, left: 20, right: 20 };

  const controls = useAnimation();

  const playSwing = () => {
    controls.start({
      rotate: rot,
      opacity: 1,
      transition: {
        rotate: { type: "spring", stiffness: 40, damping: 5, mass: 1.4 },
        opacity: { duration: 0.35 },
      },
    });
  };

  const handleTap = () => {
    // Snap to swing-out angle (instant), then spring back to rest.
    controls.set({ rotate: swingFrom });
    playSwing();
  };

  return (
    <motion.div
      initial={{ rotate: swingFrom, opacity: 0 }}
      animate={controls}
      onViewportEnter={playSwing}
      viewport={{ once: true, margin: "-80px" }}
      onClick={handleTap}
      className="relative cursor-pointer"
      style={{
        width: 280,
        maxWidth: "85vw",
        aspectRatio: "1 / 1",
        transformOrigin: "50% 0%",
        filter: "drop-shadow(0 18px 35px rgba(0,0,0,0.45))",
      }}
    >
      {/* Photo clipped to the frame's inner opening */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: `${INSET.top}%`,
          bottom: `${INSET.bottom}%`,
          left: `${INSET.left}%`,
          right: `${INSET.right}%`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      {/* Frame overlay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.frame}
        alt=""
        className="absolute inset-0 w-full h-full pointer-events-none"
        draggable={false}
      />
    </motion.div>
  );
}

export default function FountainInvitation({
  data,
  slug,
  bride,
  groom,
  full_display,
  formattedDate,
}: ThemeInvitationProps) {
  const lang = data.useCyrillic ? T.cyrillic : T.latin;
  // Once a dove finishes its flight off-screen, unmount the GreenScreenVideo
  // entirely so the chroma-key canvas/video pipeline stops eating RAM.
  const [doveADone, setDoveADone] = useState(false);
  const [doveBDone, setDoveBDone] = useState(false);

  // Parallax for the hero background — scrolls slower than the rest of the
  // page so the chateau/sky "sticks" while the fountain (in normal flow)
  // continues at page speed.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgParallaxY = useTransform(heroScrollProgress, [0, 1], ["0vh", "35vh"]);
  // Lighter parallax on the fountain itself — it lags slightly behind the
  // page, but much less than the bg. Sits visually between page-speed
  // content and the slow-scrolling background.
  const fountainParallaxY = useTransform(
    heroScrollProgress,
    [0, 1],
    ["0vh", "15vh"],
  );

  const scriptFontStyle = useMemo<React.CSSProperties>(
    () => ({
      fontFamily: `var(--script-font, "Great Vibes"), "Great Vibes", cursive`,
    }),
    [],
  );

  return (
    <div
      style={{
        backgroundColor: BURGUNDY,
        color: "#fff",
        // `clip` instead of `hidden` so sticky descendants (the timeline rose)
        // still find the viewport as their scroll container. `hidden` makes
        // this div a scroll container and breaks sticky.
        overflowX: "clip",
      }}
    >
      {/* ──────────────────  HERO  ────────────────── */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
        style={{ height: "90vh", minHeight: 580 }}
      >
        {/* Background image — portrait on mobile, landscape on desktop.
            Wrapped in motion.div so it parallax-scrolls slower than page. */}
        <motion.div className="absolute inset-0" style={{ y: bgParallaxY }}>
          <picture>
            <source media="(min-width: 768px)" srcSet={ASSETS.bgLandscape} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.bgPortrait}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          </picture>
        </motion.div>

        {/* Soft top vignette for text legibility */}
        <div
          className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0))",
          }}
        />

        {/* Couple names — script, near the top of the hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.5 }}
          className="absolute inset-x-0 z-20 text-center px-6"
          style={{ top: "8%" }}
        >
          <h1
            className="text-white text-6xl sm:text-7xl md:text-8xl leading-[1.05]"
            style={{
              ...scriptFontStyle,
              textShadow:
                "0 4px 18px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)",
            }}
          >
            {bride}
          </h1>
          <p
            className="text-white/90 text-3xl sm:text-4xl my-1"
            style={{
              ...scriptFontStyle,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            &amp;
          </p>
          <h1
            className="text-white text-6xl sm:text-7xl md:text-8xl leading-[1.05]"
            style={{
              ...scriptFontStyle,
              textShadow:
                "0 4px 18px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)",
            }}
          >
            {groom}
          </h1>
        </motion.div>

        {/* Doves — start animating IMMEDIATELY on mount (before isRevealed)
            so by the time the envelope is fully out of the way they're
            mid-flight, and one trails the other by ~1.6s so they read as a
            pair rather than synchronized copies. Each unmounts as soon as
            it crosses off the viewport. */}
        {!doveADone && (
          <motion.div
            initial={{ x: "0vw", y: "0vh", opacity: 0 }}
            animate={{ x: "100vw", y: "-65vh", opacity: 1 }}
            transition={{
              duration: 4.5,
              delay: 4.3,
              ease: "linear",
              opacity: { duration: 0.6, delay: 4.3, ease: "easeOut" },
            }}
            onAnimationComplete={() => setDoveADone(true)}
            className="absolute pointer-events-none z-30"
            style={{ top: "32%", left: "12%" }}
          >
            <DoveVideo size={240} />
          </motion.div>
        )}
        {!doveBDone && (
          <motion.div
            initial={{ x: "0vw", y: "0vh", opacity: 0 }}
            animate={{ x: "95vw", y: "-55vh", opacity: 1 }}
            transition={{
              duration: 5.5,
              delay: 3.8,
              ease: "linear",
              opacity: { duration: 0.6, delay: 3.8, ease: "easeOut" },
            }}
            onAnimationComplete={() => setDoveBDone(true)}
            className="absolute pointer-events-none z-30"
            style={{ top: "50%", left: "22%" }}
          >
            <DoveVideo size={200} />
          </motion.div>
        )}

        {/* Fountain — two stacked frames that differ only in water position;
            the top one cross-fades in/out continuously to give the illusion
            of running water. CSS `scale(2)` actually doubles the visual size
            (pivoted at bottom-center so the fountain stays anchored to the
            hero's bottom edge). Wrapped in motion.div for a LIGHT parallax —
            lags a bit behind the page, but much less than the bg behind it. */}
        <motion.div
          className="absolute inset-0 pointer-events-none select-none z-10"
          style={{ y: fountainParallaxY }}
        >
          <div
            className="absolute bottom-0 left-1/2"
            style={{
              height: "60vh",
              transform: "translateX(-50%) translateY(18%) scale(2)",
              transformOrigin: "bottom center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.fountain1}
              alt=""
              className="block h-full w-auto"
              style={{
                objectFit: "contain",
                objectPosition: "bottom",
              }}
              draggable={false}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              src={ASSETS.fountain2}
              alt=""
              className="absolute inset-0 h-full w-auto"
              style={{
                objectFit: "contain",
                objectPosition: "bottom",
              }}
              // Peak at 0.25 — subtle overlay, just a hint of motion. No
              // hidden dwell — continuous oscillation. Fade-in and fade-out
              // each take 0.5s of the 1.0s cycle, same speed both directions.
              animate={{ opacity: [0, 0.25, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.7, 1],
              }}
              draggable={false}
            />
          </div>
        </motion.div>
      </section>

      {/* ──────────────────  BURGUNDY BLOCK  ──────────────────
         Roses act as the divider — they sit at the top of the burgundy
         section with slight upward overhang, straddling the hero/burgundy
         seam. No torn paper here so the roses ARE the transition. */}
      {/* Burgundy welcome — roses at top straddle the hero seam */}
      <section
        className="relative pt-40 sm:pt-44 pb-36 sm:pb-44 px-6 overflow-visible"
        style={{ background: BURGUNDY }}
      >
        <RosesBand
          position="top"
          seed={11}
          bandHeight={240}
          overflow={100}
          excludeIndices={[0, 3, 8, 12]}
          whiteOnly
          sizeMultipliers={{ 4: 1.2 }}
          nudgeUp={{ 4: 20 }}
        />
        {(() => {
          // Split the tagline on its first newline: anything BEFORE the
          // newline becomes the script-font title, anything AFTER is the
          // body. If the tagline has no newline, the whole thing is body
          // and we render NO title (no hardcoded fallback).
          const raw = data.tagline || "";
          const nlIdx = raw.indexOf("\n");
          const taglineTitle = nlIdx >= 0 ? raw.slice(0, nlIdx).trim() : "";
          const taglineBody =
            nlIdx >= 0 ? raw.slice(nlIdx + 1).trim() : raw.trim();
          return (
            <div className="max-w-2xl mx-auto text-center">
              {taglineTitle && (
                <h2
                  className="text-white text-4xl sm:text-5xl mb-6"
                  style={{
                    ...scriptFontStyle,
                    textShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  }}
                >
                  {taglineTitle}
                </h2>
              )}
              {taglineBody && (
                <p
                  className="text-white/90 text-lg sm:text-xl leading-relaxed whitespace-pre-line italic"
                  style={{ fontFamily: "var(--body-font, serif)" }}
                >
                  {taglineBody}
                </p>
              )}
              {data.note && (
                <p
                  className="text-white/85 text-sm sm:text-base leading-relaxed mt-4"
                  style={{ fontFamily: "var(--body-font, serif)" }}
                >
                  {data.note}
                </p>
              )}
            </div>
          );
        })()}
      </section>

      {/* Countdown — paper bg overhangs up into the burgundy welcome above,
          so the paper's natural torn top edge IS the divider (no SVG
          divider needed). `overflowX: clip` clips horizontal spillover
          without making the section a vertical scroll container, which lets
          the paper's negative `top` extend up out of the section. */}
      {data.countdown_enabled && data.event_date && (
        <>
          <section
            className="relative pt-4 sm:pt-6 pb-28 sm:pb-32 px-6"
            style={{ background: BURGUNDY, overflowX: "clip" }}
          >
            <PaperBg overhangTopPx={90} overhang={30} />
            <div className="relative z-10 max-w-md mx-auto text-center">
              <p
                className="text-3xl sm:text-4xl mb-6"
                style={{ ...scriptFontStyle, color: BURGUNDY_DEEP }}
              >
                {formattedDate}
              </p>
              <FountainCountdown
                targetDate={data.event_date}
                labels={{
                  days: lang.days,
                  hours: lang.hours,
                  mins: lang.mins,
                  secs: lang.secs,
                }}
                color={BURGUNDY_DEEP}
                mutedColor="rgba(74,8,19,0.7)"
                separatorColor="rgba(74,8,19,0.5)"
              />
            </div>
          </section>
        </>
      )}

      {/* Burgundy schedule */}
      {data.timeline && data.timeline.length > 0 && (
        <section
          className="relative py-16 sm:py-20 px-6"
          style={{ background: BURGUNDY }}
        >
          <h3
            className="text-center text-white text-4xl sm:text-5xl mb-8 sm:mb-10"
            style={{
              ...scriptFontStyle,
              textShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            {lang.schedule}
          </h3>
          <ScheduleTimeline timeline={data.timeline} />
        </section>
      )}

      {/* ──────────────────  LOCATION (cream)  ────────────────── */}
      {data.locations && data.locations.length > 0 && (
        <section
          className="relative pt-24 sm:pt-28 pb-24 sm:pb-28 px-6"
          style={{
            background: BURGUNDY,
            color: BURGUNDY_DEEP,
            overflowX: "clip",
          }}
        >
          <PaperBg overhang={11} />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h3
              className="text-5xl sm:text-6xl mb-10"
              style={{ ...scriptFontStyle, color: BURGUNDY_DEEP }}
            >
              {data.locations.length > 1 ? lang.locations : lang.location}
            </h3>
            <div
              className={
                data.locations.length > 1
                  ? "grid grid-cols-2 gap-3 sm:gap-6"
                  : "max-w-xl mx-auto"
              }
            >
              {data.locations.map((loc, i) => (
                <div key={i}>
                  <p
                    className="text-base sm:text-2xl mb-1 leading-snug"
                    style={{
                      fontFamily: "var(--body-font, serif)",
                      color: BURGUNDY_DEEP,
                      fontWeight: 500,
                    }}
                  >
                    {loc.name}
                  </p>
                  <p
                    className="text-xs sm:text-base"
                    style={{
                      color: "#5a3a3e",
                      fontFamily: "var(--body-font, serif)",
                    }}
                  >
                    {loc.address}
                  </p>
                  {loc.time && (
                    <p
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm mt-2"
                      style={{ color: BURGUNDY }}
                    >
                      <Clock size={13} />
                      {loc.time}
                    </p>
                  )}
                  {data.map_enabled && loc.map_url && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-[#6B0E1E]/15 shadow-md">
                      <iframe
                        src={loc.map_url}
                        className="w-full h-32 sm:h-48"
                        loading="eager"
                        title={`Map: ${loc.name}`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────  PHOTO GALLERY  ────────────────── */}
      {data.paid_for_images && data.images && data.images.length > 0 && (
        <>
          <TornPaperDivider edge="top" color={BURGUNDY} height={36} seed={13} />
          <section
            className="relative py-8 sm:py-12 px-6"
            style={{ background: BURGUNDY }}
          >
            <div className="max-w-2xl mx-auto space-y-6 sm:space-y-10">
              {data.images.slice(0, 3).map((img, i) => (
                <div
                  key={img.pathname}
                  className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                >
                  <PhotoFrame src={img.url} idx={i} />
                </div>
              ))}
            </div>
          </section>
          <TornPaperDivider
            edge="bottom"
            color={BURGUNDY}
            height={36}
            seed={17}
          />
        </>
      )}

      {/* ──────────────────  RSVP + FOOTER (one continuous burgundy block) */}
      <section
        className="relative py-20 sm:py-28 px-6"
        style={{ background: BURGUNDY, color: "#fff" }}
      >
        <div className="max-w-xl mx-auto text-center">
          <h3
            className="text-5xl sm:text-6xl mb-8"
            style={{
              ...scriptFontStyle,
              textShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            {lang.confirmAttendance}
          </h3>
          <Link
            href={`/rsvp/pozivnica-${slug}`}
            className="inline-flex items-center justify-center px-12 py-3.5 rounded-full text-sm uppercase tracking-[0.25em] transition-all hover:scale-105 hover:shadow-2xl"
            style={{
              background: "#fff",
              color: BURGUNDY_DEEP,
              fontWeight: 500,
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2)",
              fontFamily: "var(--body-font, serif)",
            }}
          >
            {lang.confirmCta}
          </Link>

          {data.submit_until &&
            (() => {
              const d = new Date(data.submit_until + "T00:00:00");
              if (isNaN(d.getTime())) return null;
              const day = d.getDate();
              const month = lang.monthsGenitive[d.getMonth()];
              const year = d.getFullYear();
              return (
                <p
                  className="text-xs sm:text-sm mt-4 text-white/65 italic"
                  style={{ fontFamily: "var(--body-font, serif)" }}
                >
                  {lang.rsvpBy} {day}. {month} {year}.
                </p>
              );
            })()}

          {data.thankYouFooter && (
            <p
              className="text-lg sm:text-2xl mt-16 leading-relaxed text-white/90 italic"
              style={{ fontFamily: "var(--body-font, serif)" }}
            >
              {data.thankYouFooter}
            </p>
          )}

          <p
            className="text-2xl sm:text-3xl mt-6"
            style={{
              ...scriptFontStyle,
              color: "rgba(255,255,255,0.95)",
              textShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            {bride} &amp; {groom}
          </p>

          <a
            href="https://halouspomene.rs"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-16 sm:mt-20 pt-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-6 h-px bg-white/25" />
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">
                Powered by
              </p>
              <div className="w-6 h-px bg-white/25" />
            </div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-white/60 hover:text-white transition-colors font-medium">
              Halo Uspomene
            </p>
          </a>
        </div>
      </section>
    </div>
  );
}
