"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, ChevronDown } from "lucide-react";
import type { BirthdayData } from "@/app/deciji-rodjendan/[slug]/types";
import type {
  ThemeType,
  ScriptFontType,
} from "@/app/pozivnica/[slug]/types";
import { ThemeProvider } from "@/app/pozivnica/[slug]/components/ThemeProvider";
import { EnvelopeLoader } from "@/app/pozivnica/[slug]/components/EnvelopeLoader";
import { BirthdayRSVPForm } from "@/app/deciji-rodjendan/[slug]/components/BirthdayRSVPForm";

interface Props {
  data: BirthdayData;
  slug: string;
}

const FONT_VAR_BY_KEY: Record<ScriptFontType, string> = {
  "great-vibes": "var(--font-great-vibes)",
  "dancing-script": "var(--font-dancing-script)",
  "alex-brush": "var(--font-alex-brush)",
  parisienne: "var(--font-parisienne)",
  allura: "var(--font-allura)",
  "marck-script": "var(--font-marck-script)",
  caveat: "var(--font-caveat)",
  "bad-script": "var(--font-bad-script)",
};

const MONTHS_NOM = [
  "januar", "februar", "mart", "april", "maj", "jun",
  "jul", "avgust", "septembar", "oktobar", "novembar", "decembar",
];
const MONTHS_GEN = [
  "januara", "februara", "marta", "aprila", "maja", "juna",
  "jula", "avgusta", "septembra", "oktobra", "novembra", "decembra",
];
const DAYS = [
  "Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota",
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    full: `${d.getDate()}. ${MONTHS_NOM[d.getMonth()]} ${d.getFullYear()}.`,
    fullGenitive: `${d.getDate()}. ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}.`,
    day: DAYS[d.getDay()],
    time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}h`,
    shortOg: `${d.getDate()}. ${MONTHS_NOM[d.getMonth()]} ${d.getFullYear()}`,
  };
}

// ─── Ornament SVGs ──────────────────────────────────────────────────────────

function CornerOrnament({
  className,
  rotate = 0,
}: {
  className?: string;
  rotate?: number;
}) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M 4 4 L 30 4" strokeWidth="1" />
        <path d="M 4 4 L 4 30" strokeWidth="1" />
        <path d="M 4 4 L 20 20" strokeWidth="0.5" opacity="0.6" />
        <path
          d="M 10 4 Q 22 4 22 16 Q 22 22 28 22"
          strokeWidth="0.6"
          opacity="0.7"
        />
        <circle cx="4" cy="4" r="2.5" fill="currentColor" opacity="0.9" />
        <circle cx="4" cy="4" r="5" opacity="0.25" />
        <path d="M 16 4 L 20 4" strokeWidth="0.5" />
        <path d="M 4 16 L 4 20" strokeWidth="0.5" />
      </g>
    </svg>
  );
}

function DiamondDivider({ className = "my-8" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div
        className="h-px flex-1 max-w-[120px]"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--theme-wax-seal) 40%, var(--theme-wax-seal))",
        }}
      />
      <svg width="28" height="16" viewBox="0 0 28 16" aria-hidden>
        <g
          fill="none"
          stroke="var(--theme-wax-seal)"
          strokeWidth="0.8"
        >
          <path d="M 14 1 L 21 8 L 14 15 L 7 8 Z" fill="var(--theme-wax-seal)" fillOpacity="0.3" />
          <circle cx="14" cy="8" r="1.5" fill="var(--theme-wax-seal)" />
          <path d="M 3 8 L 7 8 M 21 8 L 25 8" />
        </g>
      </svg>
      <div
        className="h-px flex-1 max-w-[120px]"
        style={{
          background:
            "linear-gradient(to left, transparent, var(--theme-wax-seal) 40%, var(--theme-wax-seal))",
        }}
      />
    </div>
  );
}

function SunburstRing() {
  const rays = Array.from({ length: 36 });
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ animation: "punoletstvo-rotate-slow 80s linear infinite", transformOrigin: "50% 50%" }}
      aria-hidden
    >
      <g stroke="var(--theme-wax-seal)" strokeWidth="0.5" opacity="0.4">
        {rays.map((_, i) => {
          const angle = (i * 360) / rays.length;
          const r1 = i % 2 === 0 ? 72 : 68;
          const r2 = i % 2 === 0 ? 95 : 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + Math.cos(rad) * r1;
          const y1 = 100 + Math.sin(rad) * r1;
          const x2 = 100 + Math.cos(rad) * r2;
          const y2 = 100 + Math.sin(rad) * r2;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
      <circle
        cx="100"
        cy="100"
        r="65"
        fill="none"
        stroke="var(--theme-wax-seal)"
        strokeWidth="0.4"
        opacity="0.35"
      />
    </svg>
  );
}

// ─── Floating particles background ──────────────────────────────────────────

function FloatingParticles() {
  // Deterministic seeded placement keeps SSR/CSR markup identical.
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => {
        const seed = (i + 1) * 7.3;
        return {
          left: ((Math.sin(seed) + 1) / 2) * 100,
          delay: (i * 0.55) % 8,
          duration: 16 + ((i * 3.1) % 12),
          size: 4 + ((i * 2.3) % 5),
          opacity: 0.25 + ((i * 0.17) % 0.5),
        };
      }),
    [],
  );
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute block rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: `-${p.size * 4}px`,
            width: p.size,
            height: p.size,
            background:
              "radial-gradient(circle at 30% 30%, var(--theme-wax-seal), transparent 70%)",
            opacity: p.opacity,
            animation: `punoletstvo-drift ${p.duration}s linear ${p.delay}s infinite`,
            filter: "blur(0.4px)",
          }}
        />
      ))}
      <style>{`
        @keyframes punoletstvo-drift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-110vh) translateX(40px); opacity: 0; }
        }
        @keyframes punoletstvo-shimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.15) drop-shadow(0 0 18px rgba(212,175,55,0.45)); }
        }
        @keyframes punoletstvo-rotate-slow {
          to { transform: rotate(360deg); }
        }
        @keyframes punoletstvo-bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}

// ─── Countdown (glassmorphism) ──────────────────────────────────────────────

function calcTimeLeft(eventDate: string) {
  const diff = new Date(eventDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Countdown({ eventDate }: { eventDate: string }) {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft(eventDate));
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(eventDate)), 1000);
    return () => clearInterval(id);
  }, [eventDate]);

  const units = [
    { value: timeLeft.days, label: "Dana" },
    { value: timeLeft.hours, label: "Sati" },
    { value: timeLeft.minutes, label: "Minuta" },
    { value: timeLeft.seconds, label: "Sekundi" },
  ];

  return (
    <div className="flex items-stretch justify-center gap-2 sm:gap-5">
      {units.map((u, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
          className="flex flex-col items-center flex-1 sm:flex-none max-w-[76px] sm:max-w-none"
        >
          <div
            className="relative w-full sm:w-24 h-[72px] sm:h-28 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm"
            style={{
              backgroundColor: "color-mix(in srgb, var(--theme-surface) 85%, transparent)",
              border: "1px solid var(--theme-wax-seal)",
              boxShadow:
                "0 20px 40px -20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            {/* inner hairline border */}
            <div
              className="absolute inset-[3px] rounded-[9px] sm:rounded-[14px] pointer-events-none"
              style={{ border: "1px solid var(--theme-wax-seal)", opacity: 0.3 }}
            />
            <span
              className="font-serif tabular-nums text-2xl sm:text-4xl font-light"
              style={{ color: "var(--theme-primary)" }}
            >
              {String(u.value).padStart(2, "0")}
            </span>
          </div>
          <span
            className="mt-2 sm:mt-3 text-[8px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] whitespace-nowrap"
            style={{ color: "var(--theme-text-muted)" }}
          >
            {u.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function PunoletstvoInvitationClient({ data, slug }: Props) {
  const [loaderDone, setLoaderDone] = useState(false);

  const scriptFont: ScriptFontType =
    ((data as BirthdayData & { scriptFont?: ScriptFontType }).scriptFont as
      | ScriptFontType
      | undefined) || "great-vibes";
  const rawTheme = data.theme as string;
  const theme: ThemeType =
    rawTheme === "white_gold_navy" ? "white_gold_navy" : "white_gold_burgundy";

  const displayName =
    data.honoree_name && data.honoree_surname
      ? `${data.honoree_name} ${data.honoree_surname}`
      : data.child_name;
  const initials =
    ((data.honoree_name?.[0] ?? "") + (data.honoree_surname?.[0] ?? "")) ||
    displayName.slice(0, 2).toUpperCase();

  const dateInfo = formatDate(data.event_date);

  return (
    <ThemeProvider theme={theme} scriptFont={scriptFont}>
      <div
        style={{
          ["--theme-display-font" as string]: FONT_VAR_BY_KEY[scriptFont],
        }}
      >
        {!loaderDone && (
          <EnvelopeLoader
            onComplete={() => setLoaderDone(true)}
            names={displayName}
            eventDate={dateInfo.shortOg}
            initials="18"
            inviteLabel="18. rođendan"
            waxImageSrc="/images/premium/envelope-details/gold-wax.webp"
          />
        )}

        <main
          className="min-h-screen relative overflow-hidden"
          style={{
            backgroundColor: "var(--theme-background)",
            backgroundImage:
              "radial-gradient(ellipse at top, color-mix(in srgb, var(--theme-wax-seal) 8%, transparent) 0%, transparent 55%), radial-gradient(ellipse at bottom, color-mix(in srgb, var(--theme-primary) 6%, transparent) 0%, transparent 60%)",
          }}
        >
          <FloatingParticles />

          {/* ─── HERO ─────────────────────────────────────────────────────── */}
          <section className="relative min-h-screen flex items-center justify-center px-4 pt-6 pb-14 sm:px-6 sm:py-24">
            <div className="relative max-w-2xl w-full" style={{ zIndex: 1 }}>
              {/* Framed card */}
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
                className="relative px-6 sm:px-14 pt-4 sm:pt-10 pb-10 sm:pb-20 text-center"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--theme-surface) 92%, transparent)",
                  backdropFilter: "blur(4px)",
                  borderRadius: 4,
                  border: "1px solid var(--theme-wax-seal)",
                  boxShadow:
                    "0 30px 80px -30px rgba(0,0,0,0.3), 0 10px 30px -10px rgba(0,0,0,0.15)",
                }}
              >
                {/* Inner gold hairline */}
                <div
                  className="absolute inset-[6px] pointer-events-none"
                  style={{
                    border: "1px solid var(--theme-wax-seal)",
                    opacity: 0.5,
                    borderRadius: 2,
                  }}
                />

                {/* Art-deco corners */}
                <div
                  className="absolute top-3 left-3 w-10 h-10 sm:w-14 sm:h-14 pointer-events-none"
                  style={{ color: "var(--theme-wax-seal)" }}
                >
                  <CornerOrnament className="w-full h-full" />
                </div>
                <div
                  className="absolute top-3 right-3 w-10 h-10 sm:w-14 sm:h-14 pointer-events-none"
                  style={{ color: "var(--theme-wax-seal)" }}
                >
                  <CornerOrnament className="w-full h-full" rotate={90} />
                </div>
                <div
                  className="absolute bottom-3 right-3 w-10 h-10 sm:w-14 sm:h-14 pointer-events-none"
                  style={{ color: "var(--theme-wax-seal)" }}
                >
                  <CornerOrnament className="w-full h-full" rotate={180} />
                </div>
                <div
                  className="absolute bottom-3 left-3 w-10 h-10 sm:w-14 sm:h-14 pointer-events-none"
                  style={{ color: "var(--theme-wax-seal)" }}
                >
                  <CornerOrnament className="w-full h-full" rotate={270} />
                </div>

                {/* 18 medallion */}
                <div className="relative flex items-center justify-center mb-2 sm:mb-6">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{
                      delay: 0.55,
                      type: "spring",
                      stiffness: 160,
                      damping: 16,
                    }}
                    className="relative w-36 h-36 sm:w-60 sm:h-60"
                    style={{ animation: "punoletstvo-shimmer 4s ease-in-out infinite" }}
                  >
                    <SunburstRing />
                    <div className="absolute inset-2 flex items-center justify-center">
                      {/* Real 3D gold wax seal — same asset used by premium invitation */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/premium/envelope-details/gold-wax.webp"
                        alt="Zlatna voštana pečat"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                        style={{ filter: "drop-shadow(0 18px 36px rgba(0,0,0,0.4))" }}
                        decoding="async"
                      />
                      {/* "18" overlaid on the empty center of the seal */}
                      <span
                        className="relative text-4xl sm:text-6xl font-serif font-semibold select-none leading-none"
                        style={{
                          color: "#7a5318",
                          textShadow:
                            "0 1px 1px rgba(255,232,150,0.85), 0 0 8px rgba(90,55,10,0.4)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        18
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Punoletstvo label — moved beneath the gold wax seal */}
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="text-[10px] sm:text-xs uppercase tracking-[0.55em] mb-5 sm:mb-8"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Punoletstvo
                </motion.p>

                {/* Honoree name */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.9 }}
                  className="text-5xl sm:text-7xl leading-[1.05] px-2"
                  style={{
                    fontFamily: "var(--theme-script-font)",
                    color: "var(--theme-primary)",
                    textShadow:
                      "0 1px 0 rgba(255,255,255,0.5), 0 2px 8px color-mix(in srgb, var(--theme-primary) 20%, transparent)",
                  }}
                >
                  {displayName}
                </motion.h1>

                <DiamondDivider className="mt-6 sm:mt-10 mb-5 sm:mb-8" />

                {data.tagline && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.05, duration: 0.9 }}
                    className="font-serif italic text-base sm:text-lg max-w-lg mx-auto leading-relaxed my-5 sm:my-10"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {data.tagline}
                  </motion.p>
                )}

                {/* Date card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.15, duration: 0.7 }}
                  className="relative inline-flex flex-col items-center gap-1 px-8 sm:px-12 py-5"
                >
                  {/* Top divider — fades at both edges */}
                  <div
                    aria-hidden
                    className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, var(--theme-wax-seal) 22%, var(--theme-wax-seal) 78%, transparent)",
                    }}
                  />
                  {/* Bottom divider — fades at both edges */}
                  <div
                    aria-hidden
                    className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, var(--theme-wax-seal) 22%, var(--theme-wax-seal) 78%, transparent)",
                    }}
                  />
                  <span
                    className="text-[10px] uppercase tracking-[0.45em]"
                    style={{ color: "var(--theme-text-light)" }}
                  >
                    {dateInfo.day}
                  </span>
                  <span
                    className="text-3xl sm:text-4xl font-serif font-light"
                    style={{ color: "var(--theme-primary)" }}
                  >
                    {dateInfo.full}
                  </span>
                  <span
                    className="text-sm tracking-[0.3em]"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {dateInfo.time}
                  </span>
                </motion.div>

                {/* CTA → RSVP */}
                <motion.a
                  href="#rsvp"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, duration: 0.8 }}
                  className="mt-10 flex w-fit mx-auto items-center justify-center px-7 py-3 rounded-full text-[10px] sm:text-xs uppercase tracking-[0.35em] transition-all"
                  style={{
                    color: "var(--theme-primary)",
                    border: "1px solid var(--theme-wax-seal)",
                    backgroundColor:
                      "color-mix(in srgb, var(--theme-surface) 50%, transparent)",
                    textIndent: "0.35em",
                  }}
                >
                  Potvrdite dolazak
                </motion.a>

              </motion.div>

              {/* Floating scroll indicator below the hero card */}
              <motion.a
                href="#rsvp"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.8 }}
                className="mt-8 flex flex-col items-center gap-2 mx-auto"
                aria-label="Skrolujte niže"
                style={{
                  color: "var(--theme-wax-seal)",
                  animation: "punoletstvo-bounce-soft 2.2s ease-in-out infinite",
                }}
              >
                <span
                  className="text-[9px] uppercase tracking-[0.4em]"
                  style={{
                    color: "var(--theme-text-light)",
                    textIndent: "0.4em",
                  }}
                >
                  Skrolujte
                </span>
                <ChevronDown size={20} strokeWidth={1.25} />
              </motion.a>
            </div>
          </section>

          {/* ─── COUNTDOWN ────────────────────────────────────────────────── */}
          {data.countdown_enabled && (
            <section className="relative px-6 py-20" style={{ zIndex: 1 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto text-center"
              >
                <p
                  className="text-[10px] uppercase tracking-[0.5em] mb-3"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Odbrojavanje
                </p>
                <h2
                  className="text-3xl sm:text-4xl mb-8"
                  style={{
                    fontFamily: "var(--theme-script-font)",
                    color: "var(--theme-primary)",
                  }}
                >
                  Do proslave
                </h2>
                <DiamondDivider className="mb-10" />
                <Countdown eventDate={data.event_date} />
              </motion.div>
            </section>
          )}

          {/* ─── LOCATION ─────────────────────────────────────────────────── */}
          <section className="relative px-6 py-20" style={{ zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-10">
                <p
                  className="text-[10px] uppercase tracking-[0.5em] mb-3"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Mesto proslave
                </p>
                <h2
                  className="text-4xl sm:text-5xl"
                  style={{
                    fontFamily: "var(--theme-script-font)",
                    color: "var(--theme-primary)",
                  }}
                >
                  {data.location.name}
                </h2>
                <DiamondDivider className="mt-6" />
              </div>

              <div
                className="relative rounded-sm overflow-hidden"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  border: "1px solid var(--theme-wax-seal)",
                  boxShadow: "0 30px 60px -30px rgba(0,0,0,0.25)",
                }}
              >
                <div
                  className="absolute inset-[6px] pointer-events-none"
                  style={{
                    border: "1px solid var(--theme-wax-seal)",
                    opacity: 0.35,
                  }}
                />
                <div className="grid sm:grid-cols-3 gap-6 p-8 sm:p-10 text-center sm:text-left">
                  {[
                    { Icon: Calendar, label: "Datum", value: dateInfo.full },
                    { Icon: Clock, label: "Vreme", value: dateInfo.time },
                    { Icon: MapPin, label: "Adresa", value: data.location.address },
                  ].map(({ Icon, label, value }, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row items-center sm:items-start gap-3"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: "var(--theme-primary-muted)",
                          border: "1px solid var(--theme-wax-seal)",
                        }}
                      >
                        <Icon
                          size={16}
                          style={{ color: "var(--theme-primary)" }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-[9px] uppercase tracking-[0.3em] font-semibold mb-1"
                          style={{ color: "var(--theme-wax-seal)" }}
                        >
                          {label}
                        </p>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "var(--theme-text)" }}
                        >
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {data.map_enabled && data.location.map_url && (
                  <div
                    className="border-t relative"
                    style={{ borderColor: "var(--theme-wax-seal)" }}
                  >
                    <iframe
                      src={data.location.map_url}
                      className="w-full h-72 sm:h-96 border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Mapa — ${data.location.name}`}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </section>

          {/* ─── RSVP ─────────────────────────────────────────────────────── */}
          <section id="rsvp" className="relative px-6 py-20 scroll-mt-6" style={{ zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-10">
                <p
                  className="text-[10px] uppercase tracking-[0.5em] mb-3"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Potvrda dolaska
                </p>
                <h2
                  className="text-4xl sm:text-5xl"
                  style={{
                    fontFamily: "var(--theme-script-font)",
                    color: "var(--theme-primary)",
                  }}
                >
                  Vaš odgovor
                </h2>
                <DiamondDivider className="mt-6 mb-4" />
                <p
                  className="text-sm"
                  style={{ color: "var(--theme-text-muted)" }}
                >
                  Molimo potvrdite dolazak do{" "}
                  <strong style={{ color: "var(--theme-primary)" }}>
                    {formatDate(data.submit_until).fullGenitive}
                  </strong>
                </p>
              </div>

              <BirthdayRSVPForm
                slug={slug}
                submitUntil={data.submit_until}
                gender={data.gender}
              />
            </motion.div>
          </section>

          {/* ─── FOOTER ───────────────────────────────────────────────────── */}
          <footer className="relative px-6 py-16 text-center" style={{ zIndex: 1 }}>
            <DiamondDivider className="mb-6" />
            <div
              className="inline-flex items-center gap-4 mb-4"
              style={{ color: "var(--theme-wax-seal)" }}
            >
              <div
                className="h-px w-14"
                style={{ backgroundColor: "currentColor", opacity: 0.5 }}
              />
              <span
                className="font-serif text-xl tracking-[0.4em] font-light"
                style={{ color: "var(--theme-primary)", marginRight: "-0.4em" }}
              >
                {initials.toUpperCase()}
              </span>
              <div
                className="h-px w-14"
                style={{ backgroundColor: "currentColor", opacity: 0.5 }}
              />
            </div>
            <p
              className="text-[10px] uppercase tracking-[0.4em]"
              style={{ color: "var(--theme-text-light)", textIndent: "0.4em" }}
            >
              Hvala što ćete biti deo moje proslave
            </p>
          </footer>
        </main>
      </div>
    </ThemeProvider>
  );
}
