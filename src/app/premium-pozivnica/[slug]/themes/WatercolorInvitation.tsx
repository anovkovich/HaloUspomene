"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Heart, Send, MapPin, Clock, ChevronDown } from "lucide-react";
import type { ThemeInvitationProps } from "../PremiumInvitationClient";

/*
 * WATERCOLOR ROMANCE THEME
 * ─────────────────────────
 * Cinematic, full-bleed illustrated backgrounds.
 * Dark palette, white/gold text, immersive painted feel.
 *
 * Assets in: /public/images/premium/watercolor-invitation/
 */

function WatercolorCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 }); return; }
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
          <div className="bg-white/10 rounded-2xl border border-white/15 py-3 sm:py-4 px-2">
            <span className="text-3xl sm:text-5xl font-serif text-white tabular-nums drop-shadow-lg">
              {String(item.value).padStart(2, "0")}
            </span>
          </div>
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/60 mt-2">
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
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"Da" | "Ne">("Da");
  const [guestCount, setGuestCount] = useState(1);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Molimo unesite Vaše ime."); return; }
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/pozivnica/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), attending, guestCount, details }),
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
          onClick={() => { setIsSubmitted(false); setName(""); setDetails(""); }}
          className="mt-6 text-xs text-white/30 underline hover:text-white/50"
        >
          Pošalji još jednu potvrdu
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-base sm:text-lg text-white/55 text-center font-serif mb-6">
        Sa zadovoljstvom Vas očekujemo. Molimo potvrdite Vaš dolazak.
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Vaše ime i prezime"
        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 transition-all"
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
                : "bg-white/5 text-white/50 border border-white/15 hover:border-white/30"
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
            <div className="flex items-center justify-between bg-white/5 border border-white/12 rounded-xl px-4 py-2.5">
              <span className="text-sm text-white/50">Broj osoba</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-8 h-8 rounded-full bg-white/10 text-[#d4af37] hover:bg-white/20 text-lg transition-colors">−</button>
                <span className="text-white font-medium w-6 text-center">{guestCount}</span>
                <button type="button" onClick={() => setGuestCount(guestCount + 1)} className="w-8 h-8 rounded-full bg-white/10 text-[#d4af37] hover:bg-white/20 text-lg transition-colors">+</button>
              </div>
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Napomena (opciono)"
              rows={2}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 resize-none transition-all"
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
        {isSubmitting ? "Slanje..." : attending === "Da" ? <><Heart size={14} fill="currentColor" /> Potvrdi</> : <><Send size={14} /> Pošalji</>}
      </button>
      {submitUntil && (
        <p className="text-[10px] text-white/25 text-center">Rok za potvrdu: {formattedDeadline}</p>
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
  const dateRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const { scrollYProgress: dateScrollProgress } = useScroll({
    target: dateRef,
    offset: ["start end", "start 0.4"],
  });

  // Parallax layers — each at a different scroll speed
  const yBg = useTransform(scrollYProgress, [0, 1], [0, -80]);        // background: slowest
  const yNames = useTransform(scrollYProgress, [0, 1], [0, -200]);    // names: faster
  const namesOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.8, 0]);

  // Date section: fades in from transparent + backdrop blur increases (never fully opaque)
  const dateBgOpacity = useTransform(dateScrollProgress, [0, 1], [0, 0.7]);
  const dateBlur = useTransform(dateScrollProgress, [0, 1], [0, 20]);
  const dateBlurCss = useTransform(dateBlur, (v) => `blur(${v}px)`);

  // Car parallax — hoisted to avoid re-creating motion values on each render
  const carX = useTransform(scrollYProgress, [0, 0.5, 1], [0, 80, 250]);
  const carY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -40, -120]);
  const carScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.35]);
  const carOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.9, 0]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.15], [0.4, 0]);

  return (
    <div className="bg-[#1a1510]">
      {/* ═══════════════ HERO (fixed — content scrolls over it) ═══════════════ */}
      <div ref={heroRef}>
        <section className="fixed top-0 left-0 right-0 h-screen flex flex-col overflow-hidden">
          {/* Background — palace illustration (drifts up slowly) */}
          <motion.div className="absolute inset-0 z-0" style={{ y: yBg, opacity: heroOpacity, willChange: "transform, opacity" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/premium/watercolor-invitation/Golden hour at the grand palace.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
              fetchPriority="high"
            />
            {/* Gradient overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510] via-transparent to-transparent" />
          </motion.div>

          {/* Names — top area (drifts up faster) */}
          <motion.div
            className="relative z-10 flex-1 flex flex-col items-center justify-start pt-16 sm:pt-24 px-6"
            style={{ opacity: namesOpacity, y: yNames, willChange: "transform, opacity" }}
          >
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <h1
                className="font-serif text-6xl sm:text-8xl text-white leading-[0.85] uppercase tracking-wide"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5), 0 0 80px rgba(0,0,0,0.3), 0 0 2px rgba(255,255,255,0.15)" }}
              >
                {bride}
              </h1>
              <p className="font-serif uppercase tracking-[0.4em] text-white/60 text-base sm:text-lg my-1 sm:my-2">
                &amp;
              </p>
              <h1
                className="font-serif text-6xl sm:text-8xl text-white leading-[0.85] uppercase tracking-wide"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5), 0 0 80px rgba(0,0,0,0.3), 0 0 2px rgba(255,255,255,0.15)" }}
              >
                {groom}
              </h1>
            </motion.div>
          </motion.div>

          {/* Vintage car — slides in from bottom-left, drives top-right on scroll */}
          <motion.div
            className="absolute bottom-[25%] sm:bottom-[5%] left-1/2 -translate-x-1/2 z-20 w-[95%] sm:w-[65%] max-w-[550px]"
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
            }}
          >
            <img
              src="/images/premium/watercolor-invitation/Vintage car.png"
              alt="Save the Date"
              className="w-full h-auto drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
            />
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
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown size={24} className="text-white" />
            </motion.div>
          </motion.div>
        </section>
        {/* Spacer — pushes content below the fixed hero */}
        <div className="h-screen" />
      </div>

      {/* ═══════════════ DATE & WELCOME ═══════════════ */}
      <motion.section
        ref={dateRef}
        className="relative z-10 py-16 sm:py-24 px-6 overflow-hidden"
        style={{
          backdropFilter: dateBlurCss,
          WebkitBackdropFilter: dateBlurCss,
        }}
      >
        <motion.div className="absolute inset-0 bg-gradient-to-b from-[#1a1510] via-[#241a10] to-[#1a1510]" style={{ opacity: dateBgOpacity }} />
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
          <p className="font-serif tracking-[0.3em] text-3xl sm:text-4xl text-[#d4af37] mb-6">
            {formattedDateShort}
          </p>
          {data.tagline && (
            <p className="text-white/70 italic font-serif text-lg sm:text-xl leading-relaxed">
              &ldquo;{data.tagline}&rdquo;
            </p>
          )}
        </motion.div>
      </motion.section>

      {/* ═══════════════ TIMELINE ═══════════════ */}
      {data.timeline.length > 0 && (
        <section className="relative z-10 py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1510] via-[#241a10] to-[#1a1510]" />
          <div className="relative z-10 max-w-md mx-auto">
            <div className="space-y-8">
              {data.timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="flex items-start gap-5"
                >
                  <div className="w-16 text-right shrink-0">
                    {item.what && (
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-white/35 mb-0">{item.what}</p>
                    )}
                    <span className="text-xl sm:text-2xl font-serif font-medium text-[#d4af37]">
                      {item.time}
                    </span>
                  </div>
                  <div className="relative shrink-0 mt-2">
                    {item.what && <div className="h-3" />}
                    <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]/40 border border-[#d4af37]/70" />
                    {i < data.timeline.length - 1 && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-[#d4af37]/30 to-transparent" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    {item.what && <div className="h-3" />}
                    <p className="text-base sm:text-lg font-semibold text-white/85">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-white/40 mt-1">{item.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ RSVP ═══════════════ */}
      <section className="relative z-10 py-20 sm:py-28 px-6 overflow-hidden" id="rsvp">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1510] via-[#2a1f14] to-[#1a1510]" />
        <motion.div
          className="relative z-10 max-w-md mx-auto bg-white/10 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/15"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-serif uppercase tracking-[0.4em] text-[#d4af37]/80 text-sm sm:text-base mb-8 text-center">
            Potvrda dolaska
          </p>
          {isPastDeadline ? (
            <p className="text-sm text-white/50 text-center">Rok za potvrdu dolaska je istekao.</p>
          ) : (
            <WatercolorRSVPForm slug={slug} submitUntil={data.submit_until} formattedDeadline={formattedDate} />
          )}
        </motion.div>
      </section>

      {/* ═══════════════ LOCATIONS ═══════════════ */}
      {data.map_enabled && data.locations.some((l) => l.map_url) && (
        <section className="relative z-10 bg-[#1a1510] py-16 px-6">
          <div className="max-w-md mx-auto">
            <p className="font-serif uppercase tracking-[0.4em] text-white/70 text-sm sm:text-base mb-10 text-center">
              {data.locations.filter((l) => l.map_url).length > 1 ? "Lokacije" : "Lokacija"}
            </p>
            <div className="space-y-8">
              {data.locations.filter((l) => l.map_url).map((loc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-[#d4af37]" />
                    <p className="text-sm font-medium text-white/75">{loc.name}</p>
                    {loc.time && (
                      <span className="flex items-center gap-1 text-xs text-[#d4af37]/50 ml-auto">
                        <Clock size={10} /> {loc.time}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/35 mb-3 ml-5">{loc.address}</p>
                  <div className="rounded-2xl overflow-hidden border-3 border-[#d4af37]/40">
                    <iframe
                      src={loc.map_url}
                      className="w-full h-36"
                      loading="lazy"
                      style={{ filter: "invert(1) hue-rotate(200deg) brightness(0.9) contrast(0.9) grayscale(0.3)" }}
                    />
                  </div>
                  <div
                    className="h-12 -mt-1"
                    style={{ background: "radial-gradient(ellipse at center top, rgba(26,21,16,0.8) 0%, transparent 70%)" }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="relative z-10 bg-[#1a1510] py-16 sm:py-20 text-center px-6">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 sm:w-20 h-px bg-gradient-to-r from-transparent to-[#d4af37]/30" />
          <Heart size={10} className="text-[#d4af37]/50" fill="currentColor" />
          <div className="w-12 sm:w-20 h-px bg-gradient-to-l from-transparent to-[#d4af37]/30" />
        </div>
        <p className="font-serif text-3xl sm:text-4xl text-white/70 mb-3">
          {full_display}
        </p>
        <p className="font-serif tracking-[0.15em] text-sm text-[#d4af37]/60">
          {formattedDateShort}
        </p>
        <div className="mt-10 flex items-center justify-center gap-2">
          <div className="w-6 h-px bg-[#d4af37]/15" />
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#d4af37]/25">
            Halo Uspomene
          </p>
          <div className="w-6 h-px bg-[#d4af37]/15" />
        </div>
      </footer>
    </div>
  );
}
