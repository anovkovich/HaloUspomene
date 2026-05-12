"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { Heart, Send, MapPin, Clock, ChevronDown } from "lucide-react";
import type { ThemeInvitationProps } from "../PremiumInvitationClient";
import { MultilineText } from "@/lib/multiline";
import { useRecaptcha } from "@/components/forms/RecaptchaProvider";
import PremiumCallCTA from "../components/PremiumCallCTA";

/*
 * WATERCOLOR ROMANCE THEME
 * ─────────────────────────
 * Cinematic, full-bleed illustrated backgrounds.
 * Dark palette, white/gold text, immersive painted feel.
 *
 * Assets in: /public/images/premium/watercolor-invitation/
 */

const CITY_BACKGROUNDS: Record<string, string> = {
  // Current options
  saint_sava_temple:
    "/images/premium/watercolor-invitation/backgrounds/Saint-Sava-Temple.webp",
  saint_mark_church:
    "/images/premium/watercolor-invitation/backgrounds/Saint-Mark-Church.webp",
  novi_sad_cathedral:
    "/images/premium/watercolor-invitation/backgrounds/Cathedral-NoviSad.webp",
  gradska_kuca_novi_sad:
    "/images/premium/watercolor-invitation/backgrounds/Gradska-Kuća-NoviSad.webp",
  city_hall_subotica:
    "/images/premium/watercolor-invitation/backgrounds/City-Hall-Subotica.webp",
  monastery:
    "/images/premium/watercolor-invitation/backgrounds/Monastery.webp",
  old_hall:
    "/images/premium/watercolor-invitation/backgrounds/Old-Hall.webp",
  // Custom backgrounds — not exposed in the stepper, set manually per couple.
  mileseva:
    "/images/premium/watercolor-invitation/backgrounds/custom/mileseva.webp",
  josnicka_banja:
    "/images/premium/watercolor-invitation/backgrounds/custom/josnicka-banja.webp",
  zica:
    "/images/premium/watercolor-invitation/backgrounds/custom/zica.webp",
  ostrog:
    "/images/premium/watercolor-invitation/backgrounds/custom/ostrog.webp",
  // Legacy key aliases — map old DB values to the new files
  beograd:
    "/images/premium/watercolor-invitation/backgrounds/Saint-Sava-Temple.webp",
  novi_sad:
    "/images/premium/watercolor-invitation/backgrounds/Cathedral-NoviSad.webp",
  kragujevac:
    "/images/premium/watercolor-invitation/backgrounds/Old-Hall.webp",
  // Fallback / default
  default:
    "/images/premium/watercolor-invitation/backgrounds/Saint-Sava-Temple.webp",
};

const CAR_IMAGES: Record<string, string> = {
  // Current options (webp)
  bmw_x6: "/images/premium/watercolor-invitation/cars/BMW-X6.webp",
  cadillac: "/images/premium/watercolor-invitation/cars/Cadillac.webp",
  maybach: "/images/premium/watercolor-invitation/cars/Maybach.webp",
  mercedes_190_sl:
    "/images/premium/watercolor-invitation/cars/Mercedes-190-SL.webp",
  new_rolls_royce:
    "/images/premium/watercolor-invitation/cars/New-Rolls-Royce.webp",
  old_mercedes: "/images/premium/watercolor-invitation/cars/Old-Mercedes.webp",
  old_rolls_royce:
    "/images/premium/watercolor-invitation/cars/Old-Rolls-Royce.webp",
  range_rover: "/images/premium/watercolor-invitation/cars/Range-Rover.webp",
  vw_beetle: "/images/premium/watercolor-invitation/cars/VW-Beetle.webp",
  // Legacy key aliases — map old DB values to the new files
  oldtimer: "/images/premium/watercolor-invitation/cars/Old-Mercedes.webp",
  mercedes_classic:
    "/images/premium/watercolor-invitation/cars/Mercedes-190-SL.webp",
  rolls_royce:
    "/images/premium/watercolor-invitation/cars/Old-Rolls-Royce.webp",
  vw_buba: "/images/premium/watercolor-invitation/cars/VW-Beetle.webp",
  // Fallback / default
  default:
    "/images/premium/watercolor-invitation/cars/New-Rolls-Royce.webp",
};

function WatercolorCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });
  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-md mx-auto">
      {[
        { value: timeLeft.days, label: "dana" },
        { value: timeLeft.hours, label: "sati" },
        { value: timeLeft.mins, label: "min" },
        { value: timeLeft.secs, label: "sek" },
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div
            className="relative rounded-2xl py-3 sm:py-4 px-2 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(212,175,55,0.08) 100%)",
              backdropFilter: "blur(16px) saturate(140%)",
              WebkitBackdropFilter: "blur(16px) saturate(140%)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 12px 32px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,175,55,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {/* Top shine highlight */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)" }}
            />
            <span
              className="relative text-3xl sm:text-5xl font-serif font-medium text-white tabular-nums leading-none uppercase tracking-wide"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}
            >
              {String(item.value).padStart(2, "0")}
            </span>
          </div>
          <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.25em] text-white/60 mt-2">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function WatercolorRSVPForm({
  slug,
  submitUntil,
  formattedDeadline,
}: {
  slug: string;
  submitUntil: string;
  formattedDeadline: string;
}) {
  const { execute: executeRecaptcha } = useRecaptcha();
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"Da" | "Ne">("Da");
  const [guestCount, setGuestCount] = useState(1);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Molimo unesite Vaše ime.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      let recaptchaToken = "";
      try {
        recaptchaToken = await executeRecaptcha("rsvp");
      } catch {
        setError("Provera neuspešna. Osvežite stranicu i pokušajte ponovo.");
        setIsSubmitting(false);
        return;
      }
      const res = await fetch(`/api/pozivnica/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          attending,
          guestCount,
          details,
          recaptcha_token: recaptchaToken,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Greška pri slanju.");
      }
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Greška pri slanju.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="w-16 h-16 rounded-full bg-[#d4af37]/15 flex items-center justify-center mx-auto mb-6">
          <Heart size={28} className="text-[#d4af37]" fill="currentColor" />
        </div>
        <p className="text-lg font-serif text-white/80 mb-2">Hvala, {name}!</p>
        <p className="text-sm text-white/50">
          {attending === "Da"
            ? `Radujemo se vašem dolasku! (${guestCount} ${guestCount === 1 ? "osoba" : "osobe"})`
            : "Žao nam je što nećete moći da dođete."}
        </p>
        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            setName("");
            setDetails("");
          }}
          className="mt-6 text-xs text-white/30 underline hover:text-white/50"
        >
          Pošalji još jednu potvrdu
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p
        className="text-base sm:text-lg text-white/90 text-center font-serif mb-6"
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.75)" }}
      >
        Sa zadovoljstvom Vas očekujemo
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Vaše ime i prezime"
        className="w-full bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/60 focus:outline-none focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/25 transition-all"
      />
      <div className="flex gap-3">
        {(["Da", "Ne"] as const).map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setAttending(val)}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
              attending === val
                ? "bg-gradient-to-r from-[#d4af37] to-[#c5a028] text-white shadow-md shadow-[#d4af37]/20 border border-[#d4af37]"
                : "bg-white/10 text-white/90 border border-white/25 hover:border-white/40"
            }`}
          >
            {val === "Da" ? "Dolazim" : "Ne dolazim"}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {attending === "Da" && (
          <motion.div
            key="guest-fields"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden space-y-5"
          >
            <div className="flex items-center justify-between bg-white/10 border border-white/25 rounded-xl px-4 py-2.5">
              <span
                className="text-sm text-white/90"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
              >
                Broj osoba
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="w-9 h-9 rounded-full bg-white/20 border border-white/40 text-white hover:bg-white/30 text-xl font-bold leading-none transition-colors inline-flex items-center justify-center pb-0.5"
                >
                  −
                </button>
                <span
                  className="text-white font-semibold text-base w-6 text-center"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
                >
                  {guestCount}
                </span>
                <button
                  type="button"
                  onClick={() => setGuestCount(guestCount + 1)}
                  className="w-9 h-9 rounded-full bg-white/20 border border-white/40 text-white hover:bg-white/30 text-xl font-bold leading-none transition-colors inline-flex items-center justify-center pb-0.5"
                >
                  +
                </button>
              </div>
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Napomena (opciono)"
              rows={2}
              className="w-full bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/60 focus:outline-none focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/25 resize-none transition-all"
            />
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c5a028] text-white font-medium text-sm shadow-lg shadow-[#d4af37]/25 hover:shadow-[#d4af37]/40 hover:brightness-110 transition-all disabled:opacity-50"
      >
        {isSubmitting ? (
          "Slanje..."
        ) : attending === "Da" ? (
          <>
            <Heart size={14} fill="currentColor" /> Potvrdi
          </>
        ) : (
          <>
            <Send size={14} /> Pošalji
          </>
        )}
      </button>
      {submitUntil && (
        <p
          className="text-xs sm:text-sm text-white/90 text-center font-medium tracking-wide"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}
        >
          Rok za potvrdu:{" "}
          <span className="text-[#d4af37]">{formattedDeadline}</span>
        </p>
      )}
    </form>
  );
}

export default function WatercolorInvitation({
  data,
  slug,
  bride,
  groom,
  full_display,
  formattedDate,
  formattedDateShort,
  isPastDeadline,
}: ThemeInvitationProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Track small-screen breakpoint for responsive car parallax values.
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Parallax layers — all freeze at 50% scroll so the hero locks in place along with the car
  const yBg = useTransform(scrollYProgress, [0, 0.5, 1], [0, -40, -40]);
  const yNames = useTransform(scrollYProgress, [0, 0.5, 1], [0, -100, -100]);
  const namesOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  // Hero bg stays visible throughout — sections below show it through their backdrop-blur
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 1]);

  // ONE shared blur+darken overlay over the fixed hero — opacity ramps with scroll.
  // Sections below are fully transparent so there are no visible seams between them.
  // Mobile skips backdrop-blur (it's the single biggest scroll-jank source there —
  // compositor re-blurs the entire viewport every frame); compensates with a darker
  // overlay so the hero still recedes behind content.
  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, 0.4, 1],
    isSmall ? [0, 0.62, 0.82] : [0, 0.5, 0.7],
  );

  // Car parallax — moves until ~50% scroll, then locks in place.
  // Mobile: continues the entry trajectory (gentle rightward + slight upward)
  // so scaling down + hero shift don't make the car appear to sink.
  const carX = useTransform(
    scrollYProgress, [0, 0.5, 1],
    isSmall ? [0, 80, 80] : [0, 150, 150],
  );
  const carY = useTransform(
    scrollYProgress, [0, 0.5, 1],
    isSmall ? [0, -50, -50] : [0, -60, -60],
  );
  const carScale = useTransform(
    scrollYProgress, [0, 0.5, 1],
    isSmall ? [1, 0.8, 0.8] : [1, 0.65, 0.65],
  );
  const carOpacity = useTransform(scrollYProgress, [0, 1], [1, 1]);
  const scrollIndicatorOpacity = useTransform(
    scrollYProgress,
    [0, 0.15],
    [0.4, 0],
  );

  const bgSrc =
    CITY_BACKGROUNDS[data.premium_city || ""] || CITY_BACKGROUNDS.default;
  const carSrc = CAR_IMAGES[data.premium_car || ""] || CAR_IMAGES.default;

  return (
    <div className="bg-[#0a0805]">
      {/* ─── ONE shared blur+darken overlay over the fixed hero ───
          Fades in as user scrolls. All content sections below are transparent
          and stack over this overlay, so there are no visible seams. */}
      <motion.div
        className="fixed inset-0 z-[5] pointer-events-none"
        style={{
          opacity: overlayOpacity,
          backgroundColor: isSmall
            ? "rgba(20, 14, 8, 0.55)"
            : "rgba(20, 14, 8, 0.32)",
          ...(isSmall
            ? {}
            : {
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }),
          willChange: "opacity",
          contain: "paint",
        }}
      />

      {/* ═══════════════ HERO (fixed — content scrolls over it) ═══════════════ */}
      <div ref={heroRef}>
        <section
          className="fixed top-0 left-0 right-0 h-screen flex flex-col overflow-hidden"
          style={{ contain: "paint" }}
        >
          {/* Background — palace illustration (drifts up slowly).
              The container extends 80px BELOW the viewport so the parallax
              shift (max 40px up) never reveals a gap at the bottom. */}
          <motion.div
            className="absolute left-0 right-0 top-0 z-0"
            style={{
              bottom: -80,
              y: yBg,
              opacity: heroOpacity,
              willChange: "transform, opacity",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bgSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
              fetchPriority="high"
            />
            {/* Gradient overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            {/* Bottom fade — matches the page bg (#0a0805) so the transition
                from hero into the content sections is seamless. */}
            <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-[#0a0805] via-[#0a0805]/80 to-transparent" />
          </motion.div>

          {/* Names — top area (drifts up faster) */}
          <motion.div
            className="relative z-10 flex-1 flex flex-col items-center justify-start pt-16 sm:pt-24 px-6"
            style={{
              opacity: namesOpacity,
              y: yNames,
              willChange: "transform, opacity",
            }}
          >
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <h1
                className="font-serif text-white leading-[0.78] uppercase tracking-wide whitespace-nowrap"
                style={{
                  ["--len" as never]: bride.length,
                  // Length-aware: smaller of (responsive clamp) and (per-character cap)
                  // Per-char cap: 1.6 * 92vw / nameLength → ensures any name fits in 92% of viewport
                  fontSize:
                    "min(clamp(36px, calc(20px + 7vw), 160px), calc(88vw / var(--len) * 1.35))",
                  textShadow:
                    "0 3px 10px rgba(0,0,0,0.7), 0 6px 24px rgba(0,0,0,0.5)",
                }}
              >
                {bride}
              </h1>
              <p
                className="font-serif uppercase tracking-[0.4em] text-white/70 -my-1 sm:-my-1"
                style={{ fontSize: "clamp(20px, calc(12px + 1.2vw), 40px)" }}
              >
                &amp;
              </p>
              <h1
                className="font-serif text-white leading-[0.78] uppercase tracking-wide whitespace-nowrap"
                style={{
                  ["--len" as never]: groom.length,
                  fontSize:
                    "min(clamp(36px, calc(20px + 7vw), 160px), calc(88vw / var(--len) * 1.35))",
                  textShadow:
                    "0 3px 10px rgba(0,0,0,0.7), 0 6px 24px rgba(0,0,0,0.5)",
                }}
              >
                {groom}
              </h1>
            </motion.div>
          </motion.div>

          {/* Vintage car — slides in from bottom-left, drives top-right on scroll */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 z-20"
            initial={{ x: -250, y: 80, scale: 1.3 }}
            animate={{ x: 0, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 18,
              delay: 0.6,
            }}
            style={{
              x: carX,
              y: carY,
              scale: carScale,
              opacity: carOpacity,
              willChange: "transform, opacity",
              // Smooth scaling without breakpoint jumps:
              // ≤480px: clamped to 260px min (≈68% of 380px screen)
              // 480-1700px: scales linearly with viewport (≈30% + offset)
              // ≥1700px: clamped to 600px max
              width: "clamp(260px, calc(28vw + 110px), 600px)",
              // Position: uses svh (stable viewport height) so mobile URL-bar show/hide
              // doesn't trigger layout recalc on every scroll frame.
              bottom: "clamp(-16svh, calc(24svh - 17vw), 22svh)",
            }}
          >
            <img src={carSrc} alt="Save the Date" className="w-full h-auto" />
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2, duration: 1 }}
            style={{ opacity: scrollIndicatorOpacity }}
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ChevronDown size={24} className="text-white" />
            </motion.div>
          </motion.div>
        </section>
        {/* Spacer — pushes content below the fixed hero */}
        <div className="h-screen" />
      </div>

      {/* ═══════════════ DATE & WELCOME ═══════════════ */}
      <section className="relative z-10 py-16 sm:py-24 px-6 overflow-hidden">
        <motion.div
          className="relative z-10 text-center max-w-md mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {data.countdown_enabled && data.event_date && (
            <div className="mb-10">
              <WatercolorCountdown targetDate={data.event_date} />
            </div>
          )}
          <p
            className="font-serif font-bold tracking-[0.3em] text-3xl sm:text-4xl text-[#d4af37] mb-6"
            style={{
              textShadow:
                "0 3px 18px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.75)",
            }}
          >
            {formattedDateShort}
          </p>
          {data.tagline && (
            <p
              className="text-white italic font-serif text-2xl sm:text-3xl leading-relaxed"
              style={{
                textShadow:
                  "0 3px 18px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.75)",
              }}
            >
              <MultilineText text={data.tagline} />
            </p>
          )}
        </motion.div>
      </section>

      {/* ═══════════════ TIMELINE ═══════════════ */}
      {data.timeline.length > 0 && (
        <section className="relative z-10 py-20 px-6 overflow-hidden">
          <div className="relative z-10 max-w-md mx-auto">
            <div className="flex flex-col items-center gap-12 sm:gap-14">
              {data.timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="flex flex-col items-center text-center relative"
                >
                  <div
                    className="relative rounded-2xl py-3 sm:py-4 px-5 sm:px-6 mb-3 overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(212,175,55,0.08) 100%)",
                      backdropFilter: "blur(16px) saturate(140%)",
                      WebkitBackdropFilter: "blur(16px) saturate(140%)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      boxShadow:
                        "0 12px 32px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,175,55,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}
                  >
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-px"
                      style={{
                        background:
                          "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)",
                      }}
                    />
                    <span
                      className="relative text-3xl sm:text-4xl font-serif font-medium text-[#d4af37] leading-none tabular-nums"
                      style={{ textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}
                    >
                      {item.time}
                    </span>
                  </div>
                  {item.what && (
                    <p
                      className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-white/65 mb-1"
                      style={{
                        textShadow:
                          "0 3px 18px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.75)",
                      }}
                    >
                      {item.what}
                    </p>
                  )}
                  <p
                    className="text-lg sm:text-xl font-semibold text-white"
                    style={{
                      textShadow:
                        "0 3px 18px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.75)",
                    }}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p
                      className="text-sm text-white/70 mt-1"
                      style={{
                        textShadow:
                          "0 3px 18px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.75)",
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                  {i < data.timeline.length - 1 && (
                    <div className="absolute -bottom-11 sm:-bottom-12 left-1/2 -translate-x-1/2 w-[2px] h-11 sm:h-12 bg-gradient-to-b from-[#d4af37] via-[#d4af37]/80 to-[#d4af37]/30" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ RSVP ═══════════════ */}
      <section
        className="relative z-10 py-20 sm:py-28 px-6 overflow-hidden"
        id="rsvp"
      >
        <motion.div
          className="relative z-10 max-w-md mx-auto rounded-3xl p-6 sm:p-8 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(212,175,55,0.08) 100%)",
            backdropFilter: "blur(24px) saturate(140%)",
            WebkitBackdropFilter: "blur(24px) saturate(140%)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow:
              "0 20px 60px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          {/* Top shine highlight */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)",
            }}
          />
          {/* Soft gold ambient glow at top */}
          <div
            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(212,175,55,0.18), transparent 70%)",
            }}
          />
          <p
            className="relative font-serif uppercase tracking-[0.4em] text-white text-lg sm:text-2xl mb-8 text-center"
            style={{
              textShadow:
                "0 2px 12px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.75)",
            }}
          >
            Potvrda dolaska
          </p>
          {isPastDeadline ? (
            <p className="text-sm text-white/50 text-center">
              Rok za potvrdu dolaska je istekao.
            </p>
          ) : (
            <WatercolorRSVPForm
              slug={slug}
              submitUntil={data.submit_until}
              formattedDeadline={formattedDate}
            />
          )}
          <PremiumCallCTA
            contactPhone={data.contact_phone}
            showNumbers={data.show_numbers}
            useCyrillic={data.useCyrillic}
            labelClassName="text-white/70"
            numberClassName="text-[#d4af37]"
            separatorClassName="text-white/30"
            wrapperClassName="mt-6"
          />
        </motion.div>
      </section>

      {/* ═══════════════ LOCATIONS ═══════════════ */}
      {data.map_enabled && data.locations.some((l) => l.map_url) && (
        <section className="relative z-10 py-16 sm:py-20 px-6 overflow-hidden">
          <div className="max-w-md mx-auto">
            {/* Section title with decorative ornament */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-white/70" />
              <p
                className="font-serif uppercase tracking-[0.4em] text-white text-lg sm:text-2xl"
                style={{
                  textShadow:
                    "0 3px 18px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.75)",
                }}
              >
                {data.locations.filter((l) => l.map_url).length > 1
                  ? "Lokacije"
                  : "Lokacija"}
              </p>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-white/70" />
            </div>

            <div className="space-y-6">
              {data.locations
                .filter((l) => l.map_url)
                .map((loc, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    className="relative rounded-3xl p-5 sm:p-6 overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(212,175,55,0.08) 100%)",
                      backdropFilter: "blur(20px) saturate(140%)",
                      WebkitBackdropFilter: "blur(20px) saturate(140%)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      boxShadow:
                        "0 16px 48px -16px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}
                  >
                    {/* Top shine highlight */}
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-px"
                      style={{
                        background:
                          "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)",
                      }}
                    />

                    {/* Header: pin + name + time */}
                    <div className="relative flex items-center gap-2.5 mb-1">
                      <div className="w-7 h-7 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center shrink-0">
                        <MapPin size={12} className="text-[#d4af37]" />
                      </div>
                      <p
                        className="text-base font-semibold text-white tracking-wide"
                        style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
                      >
                        {loc.name}
                      </p>
                      {loc.time && (
                        <span className="flex items-center gap-1 text-[11px] text-[#d4af37]/80 ml-auto">
                          <Clock size={10} /> {loc.time}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/55 mb-4 ml-9">
                      {loc.address}
                    </p>

                    {/* Map with ornate gold frame */}
                    <div
                      className="relative rounded-2xl overflow-hidden"
                      style={{
                        border: "1px solid rgba(212,175,55,0.35)",
                        boxShadow:
                          "inset 0 0 0 1px rgba(255,255,255,0.06), 0 8px 24px -8px rgba(0,0,0,0.5)",
                      }}
                    >
                      <iframe
                        src={loc.map_url}
                        className="w-full h-40 block"
                        loading="eager"
                        style={{
                          filter:
                            "invert(1) hue-rotate(200deg) brightness(0.9) contrast(0.9) grayscale(0.3)",
                        }}
                      />
                      {/* Bottom fade so the map blends into the card */}
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(20,14,8,0.55), transparent)",
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="relative z-10 py-16 sm:py-20 text-center px-6 overflow-hidden">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 sm:w-24 h-px bg-gradient-to-r from-transparent to-[#d4af37]" />
            <Heart
              size={14}
              className="text-[#d4af37]"
              fill="currentColor"
              style={{ filter: "drop-shadow(0 0 6px rgba(212,175,55,0.5))" }}
            />
            <div className="w-14 sm:w-24 h-px bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>
          <p
            className="font-serif text-3xl sm:text-4xl text-white/90 mb-3"
            style={{
              textShadow:
                "0 3px 18px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.75)",
            }}
          >
            {full_display}
          </p>
          <p
            className="font-serif tracking-[0.15em] text-lg sm:text-xl text-[#d4af37] mb-6"
            style={{
              textShadow:
                "0 3px 18px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.75)",
            }}
          >
            {formattedDateShort}
          </p>

          {/* Thank-you message */}
          {data.thankYouFooter && (
            <p
              className="font-serif italic text-base sm:text-lg text-white/90 leading-relaxed"
              style={{
                textShadow:
                  "0 3px 18px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.75)",
              }}
            >
              {data.thankYouFooter}
            </p>
          )}

          <a
            href="https://halouspomene.rs"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-16 sm:mt-20 pt-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-6 h-px bg-[#d4af37]/20" />
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#d4af37]/35">
                Powered by
              </p>
              <div className="w-6 h-px bg-[#d4af37]/20" />
            </div>
            <p
              className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#d4af37]/70 hover:text-[#d4af37] transition-colors font-medium"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
            >
              Halo Uspomene
            </p>
          </a>
        </div>
      </footer>
    </div>
  );
}
