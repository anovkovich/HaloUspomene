"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useMotionValue, animate } from "framer-motion";
import { Heart, Send, MapPin, Clock, Church, Home, Sparkles } from "lucide-react";
import type { ThemeInvitationProps } from "../PremiumInvitationClient";
import dynamic from "next/dynamic";

const HeroSection = dynamic(() => import("../components/HeroSection"), {
  ssr: false,
});

const ParticleBackground = dynamic(
  () => import("../components/ParticleBackground"),
  { ssr: false },
);

// Glassmorphism card
function GlassCard({
  children,
  className = "",
  cornerOrnaments = true,
}: {
  children: React.ReactNode;
  className?: string;
  cornerOrnaments?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative backdrop-blur-xl bg-white/60 rounded-3xl border border-[#d4af37]/15 shadow-[0_50px_120px_rgba(0,0,0,0.35),0_25px_60px_rgba(0,0,0,0.22),0_10px_30px_rgba(212,175,55,0.1)] p-5 sm:p-8 md:p-10 overflow-hidden ${className}`}
    >
      <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
      <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#d4af37]/15 to-transparent" />
      <div className="absolute inset-3 sm:inset-4 border border-[#d4af37]/8 rounded-2xl pointer-events-none" />
      {cornerOrnaments &&
        [
          "top-4 left-4 sm:top-5 sm:left-5",
          "top-4 right-4 sm:top-5 sm:right-5 rotate-90",
          "bottom-4 right-4 sm:bottom-5 sm:right-5 rotate-180",
          "bottom-4 left-4 sm:bottom-5 sm:left-5 -rotate-90",
        ].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-3 h-3 sm:w-4 sm:h-4 border-t border-l border-[#d4af37]/20 pointer-events-none`}
          />
        ))}
      {children}
    </motion.div>
  );
}

function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="w-12 sm:w-20 h-px bg-gradient-to-r from-transparent to-[#d4af37]/60" />
      <Heart size={10} className="text-[#d4af37]/60" fill="currentColor" />
      <div className="w-12 sm:w-20 h-px bg-gradient-to-l from-transparent to-[#d4af37]/60" />
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-4">
      <img
        src="/images/premium/ornaments/wave-divider.svg"
        alt=""
        className="w-[60%] max-w-[200px] h-auto opacity-20"
      />
    </div>
  );
}

function LineArtCountdown({ targetDate }: { targetDate: string }) {
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
    <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-md mx-auto">
      {[
        { value: timeLeft.days, label: "dana" },
        { value: timeLeft.hours, label: "sati" },
        { value: timeLeft.mins, label: "min" },
        { value: timeLeft.secs, label: "sek" },
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div
            className="rounded-xl sm:rounded-2xl py-2.5 sm:py-4 px-1.5 sm:px-2 overflow-hidden relative"
            style={{
              background: "linear-gradient(135deg, #ffffff, #faf8f0 40%, #ede5d0)",
              boxShadow: "0 0 0 1px rgba(212,175,55,0.2), 0 0 0 2.5px rgba(212,175,55,0.06), 0 3px 10px rgba(0,0,0,0.06), inset 0 1px 2px rgba(255,255,255,0.7), inset 0 -1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[50%] bg-gradient-to-b from-white/35 to-transparent rounded-t-xl sm:rounded-t-2xl pointer-events-none" />
            <span className="relative z-10 text-2xl sm:text-4xl md:text-5xl font-serif text-[#8b6914] tabular-nums">
              {String(item.value).padStart(2, "0")}
            </span>
          </div>
          <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#5a4a2e] font-semibold mt-1.5 sm:mt-2">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

const TAB_LABELS: Record<string, string> = {
  hall: "Sala",
  church: "Crkva",
  home: "Kuća",
  ceremony: "Ceremonija",
};

const TAB_ICONS: Record<string, typeof MapPin> = {
  hall: Heart,
  church: Church,
  home: Home,
  ceremony: Sparkles,
};

function LocationsCard({
  locations,
}: {
  locations: {
    name: string;
    address: string;
    map_url?: string;
    time?: string;
    type?: string;
  }[];
}) {
  const [activeTab, setActiveTab] = useState(0);
  const hasMultiple = locations.length > 1;

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto mt-12 sm:mt-16 px-8 sm:px-4 md:px-0">
      <GlassCard cornerOrnaments={false}>
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#d4af37]/80 mb-4 text-center font-medium">
          {hasMultiple ? "Lokacije" : "Lokacija"}
        </p>

        {/* Tabs — only when multiple locations */}
        {hasMultiple && (
          <div className="flex justify-center gap-2 sm:gap-3 mb-6">
            {locations.map((loc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveTab(i)}
                className="relative flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-500 overflow-hidden text-xs sm:text-sm font-medium"
                style={{
                  background: activeTab === i
                    ? "linear-gradient(135deg, #e8d48a, #d4af37 40%, #b89520)"
                    : "linear-gradient(135deg, #ffffff, #faf8f0 40%, #ede5d0)",
                  boxShadow: activeTab === i
                    ? "0 0 0 1.5px #b89520, 0 0 0 3px rgba(212,175,55,0.25), 0 6px 18px rgba(212,175,55,0.3), inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.12)"
                    : "0 0 0 1px rgba(212,175,55,0.2), 0 0 0 2.5px rgba(212,175,55,0.06), 0 3px 10px rgba(0,0,0,0.06), inset 0 1px 2px rgba(255,255,255,0.7), inset 0 -1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-[50%] bg-gradient-to-b from-white/35 to-transparent rounded-t-xl pointer-events-none" />
                {(() => {
                  const Icon = (loc.type && TAB_ICONS[loc.type]) || MapPin;
                  const isHeart = loc.type === "hall";
                  return (
                    <Icon
                      size={13}
                      className={`relative z-10 ${activeTab === i ? "text-white/90" : "text-[#d4af37]"}`}
                      fill={isHeart ? "currentColor" : "none"}
                    />
                  );
                })()}
                <span
                  className={`relative z-10 ${activeTab === i ? "text-white" : "text-[#8b6914]"}`}
                  style={activeTab === i ? { textShadow: "0 1px 2px rgba(0,0,0,0.3)" } : undefined}
                >
                  {(loc.type && TAB_LABELS[loc.type]) || loc.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* All locations — preloaded, only active visible */}
        {locations.map((loc, i) => (
          <div
            key={i}
            className={`transition-opacity duration-300 ${activeTab === i ? "opacity-100" : "hidden"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} className="text-[#d4af37]" />
              <p className="text-sm font-medium text-[#232323]">{loc.name}</p>
              {loc.time && (
                <span className="flex items-center gap-1 text-xs text-[#8B7355] ml-auto">
                  <Clock size={10} />{loc.time}
                </span>
              )}
            </div>
            <p className="text-xs text-[#8B7355] mb-3 ml-5">{loc.address}</p>
            <div className="rounded-2xl overflow-hidden border border-[#d4af37]/10 shadow-sm">
              <iframe src={loc.map_url} className="w-full h-52" loading="eager" />
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

function SpinningTimeline({ timeline, locations, mapEnabled }: {
  timeline: { title: string; time: string; description?: string; what?: string }[];
  locations?: { name: string; address: string; map_url?: string; time?: string }[];
  mapEnabled?: boolean;
}) {
  "use no memo";
  const count = timeline.length;
  const basePath = "/images/premium/line-art-invitation/spinning/";
  let wheelImg: string, maskImg: string, degPer: number;
  let items: typeof timeline;

  if (count >= 5) {
    wheelImg = "spinning-5-01.png"; maskImg = "spinning-5-mask-01.png";
    degPer = 72; items = timeline.slice(0, 5);
  } else if (count === 4) {
    wheelImg = "spinning-2-4-01.png"; maskImg = "spinning-2-4-mask-01.png";
    degPer = 90; items = timeline;
  } else if (count === 3) {
    wheelImg = "spinning-1-3-01.png"; maskImg = "spinning-1-3-mask-01.png";
    degPer = 120; items = timeline;
  } else if (count === 2) {
    wheelImg = "spinning-2-4-01.png"; maskImg = "spinning-2-4-mask-01.png";
    degPer = 90; items = [timeline[0], timeline[1], timeline[0], timeline[1]];
  } else {
    wheelImg = "spinning-1-3-01.png"; maskImg = "spinning-1-3-mask-01.png";
    degPer = 120; items = [timeline[0], timeline[0], timeline[0]];
  }

  // Unique items for navigation buttons (no duplicates)
  const uniqueItems = count >= 5 ? timeline.slice(0, 5) : timeline;

  const rotation = useMotionValue(0);
  const isDraggingRef = useRef(false);
  const cancelRef = useRef(false);
  const lastInteractionRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const AUTO_RESUME_DELAY = 6000;

  // Track which section is at top
  useEffect(() => {
    const unsubscribe = rotation.on("change", (v) => {
      const normalized = (((-v % 360) + 360) % 360);
      const idx = Math.round(normalized / degPer) % items.length;
      setActiveIndex(idx < uniqueItems.length ? idx : idx % uniqueItems.length);
    });
    return unsubscribe;
  }, [rotation, degPer, items.length, uniqueItems.length]);

  // Auto-rotate stepping through sections
  useEffect(() => {
    cancelRef.current = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(resolve, ms);
        const check = setInterval(() => {
          if (cancelRef.current) { clearTimeout(id); clearInterval(check); resolve(); }
        }, 100);
      });

    const autoRotate = async () => {
      await wait(2500);
      while (!cancelRef.current) {
        const sinceInteraction = Date.now() - lastInteractionRef.current;
        if (!isDraggingRef.current && sinceInteraction >= AUTO_RESUME_DELAY) {
          const current = rotation.get();
          const next = current - degPer; // negative = clockwise visual
          await new Promise<void>((resolve) => {
            animate(rotation, next, { duration: 2, ease: [0.4, 0, 0.2, 1], onComplete: resolve });
          });
          await wait(3500);
        } else {
          await wait(200);
        }
      }
    };
    autoRotate();
    return () => { cancelRef.current = true; };
  }, [degPer, rotation]);

  // Navigate to a specific section
  const goToSection = useCallback((sectionIndex: number) => {
    isDraggingRef.current = true;
    lastInteractionRef.current = Date.now();
    const current = rotation.get();
    const targetMod = ((360 - (sectionIndex * degPer) % 360) % 360) || 0;
    const currentMod = (((current % 360) + 360) % 360);
    let delta = targetMod - currentMod;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    animate(rotation, current + delta, { duration: 1.8, ease: [0.4, 0, 0.2, 1] });
    setTimeout(() => { isDraggingRef.current = false; }, 1800);
  }, [rotation, degPer]);

  return (
    <section className="relative flex flex-col items-center justify-center px-1 sm:px-16 md:px-24 py-16 sm:py-20 md:py-24">
      {/* Paper wallpaper background — matches the section above */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          aria-hidden
          className="absolute"
          style={{
            top: "-20%",
            left: "-15%",
            right: "-15%",
            bottom: "-20%",
            backgroundImage:
              "url('/images/premium/line-art-invitation/paper-wallpaper.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
      <div className="relative z-10 w-full sm:w-[80%] md:w-[66%] lg:w-[60%] max-w-[720px]">
        {/* Spinning wheel with timeline text */}
        <motion.div
          className="relative w-full"
          style={{ rotate: rotation }}
        >
          <img
            src={basePath + wheelImg}
            alt=""
            aria-hidden
            className="w-full h-auto opacity-90 drop-shadow-[0_10px_25px_rgba(0,0,0,0.2)] pointer-events-none select-none"
            draggable={false}
          />
          {/* Timeline text in each section */}
          {items.map((item, i) => {
            const is5 = items.length >= 5;
            return (
              <div
                key={i}
                className="absolute inset-0 pointer-events-none"
                style={{ transform: `rotate(${i * degPer}deg)`, transformOrigin: "50% 50%" }}
              >
                <div
                  className={`absolute top-[17%] sm:top-[18%] left-1/2 -translate-x-1/2 text-center flex flex-col items-center gap-0.5 sm:gap-1 ${
                    is5 ? "w-[28%] sm:w-[26%]" : "w-[38%] sm:w-[34%]"
                  }`}
                  style={{ filter: "drop-shadow(0 1px 2px rgba(255,255,255,0.6))" }}
                >
                  {item.what && (
                    <p className="text-[5.5px] sm:text-[7px] md:text-[8px] uppercase tracking-[0.25em] text-[#5a4a2e]/60 leading-tight font-medium">
                      {item.what}
                    </p>
                  )}
                  <p
                    className="text-[13px] sm:text-[17px] md:text-[20px] font-serif font-bold text-[#1a1208] tracking-wide"
                    style={is5 ? { lineHeight: 1 } : { lineHeight: 1.4 }}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p
                      className="text-[10px] sm:text-[13px] md:text-[15px] font-serif italic text-[#5a4a2e]"
                      style={is5 ? { lineHeight: 1 } : { lineHeight: 1.3 }}
                    >
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 sm:gap-1.5 my-0.5 sm:my-1">
                    <div className="w-3 sm:w-4 h-px bg-gradient-to-r from-transparent to-[#8b6914]" />
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#8b6914]" />
                    <div className="w-3 sm:w-4 h-px bg-gradient-to-l from-transparent to-[#8b6914]" />
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Fixed mask — full size, centered on top, no rotation */}
        <img
          src={basePath + maskImg}
          alt=""
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)] pointer-events-none select-none"
        />

        {/* Gold center pin */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-full z-[15] pointer-events-none"
          style={{
            background: "radial-gradient(circle at 38% 32%, #f0d860, #d4af37 45%, #b89520 75%, #8b6914)",
            boxShadow: "0 0 0 2px #a68419, 0 0 0 4px rgba(212,175,55,0.3), 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 3px rgba(255,255,255,0.5), inset 0 -1px 3px rgba(0,0,0,0.2)",
          }}
        >
          <div className="absolute top-[10%] left-[15%] right-[15%] h-[40%] rounded-full bg-gradient-to-b from-white/40 to-transparent" />
        </div>

        {/* Navigation buttons — follow the circle curve */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {uniqueItems.map((item, i) => {
            const spread = uniqueItems.length <= 2 ? 38 : uniqueItems.length <= 3 ? 32 : 25;
            const angle = 90 - (i - (uniqueItems.length - 1) / 2) * spread;
            const rad = (angle * Math.PI) / 180;
            const radius = 28;
            const left = 50 + radius * Math.cos(rad);
            const top = 50 + radius * Math.sin(rad);

            return (
              <button
                key={i}
                type="button"
                onClick={() => goToSection(i)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  background: activeIndex === i
                    ? "radial-gradient(circle at 40% 30%, #e8d48a, #d4af37 50%, #b89520 90%)"
                    : "radial-gradient(circle at 40% 30%, #ffffff, #faf8f0 50%, #ede5d0 90%)",
                  boxShadow: activeIndex === i
                    ? "0 0 0 2px #b89520, 0 0 0 4px rgba(212,175,55,0.3), 0 0 0 6px rgba(212,175,55,0.12), 0 8px 24px rgba(212,175,55,0.35), inset 0 1px 3px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.15)"
                    : "0 0 0 1.5px rgba(212,175,55,0.25), 0 0 0 3px rgba(212,175,55,0.08), 0 4px 14px rgba(0,0,0,0.08), inset 0 1px 3px rgba(255,255,255,0.7), inset 0 -1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <div className="absolute top-0 left-[10%] right-[10%] h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-full pointer-events-none" />
                <span
                  className={`font-elegant font-semibold tracking-[0.12em] text-[12px] sm:text-[14px] md:text-[16px] tabular-nums relative z-10 ${
                    activeIndex === i ? "text-white" : "text-[#8b6914]"
                  }`}
                  style={
                    activeIndex === i
                      ? { textShadow: "0 1px 3px rgba(0,0,0,0.4)" }
                      : { textShadow: "0 1px 2px rgba(255,253,245,0.6)" }
                  }
                >
                  {item.time}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Locations card — below the spinning wheel */}
      {mapEnabled && locations && locations.some((l) => l.map_url) && (
        <LocationsCard locations={locations.filter((l) => l.map_url)} />
      )}
    </section>
  );
}

function LineArtRSVPForm({ slug, submitUntil, formattedDeadline }: { slug: string; submitUntil: string; formattedDeadline: string }) {
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
      <motion.div className="text-center py-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="w-16 h-16 rounded-full bg-[#d4af37]/15 flex items-center justify-center mx-auto mb-6">
          <Heart size={28} className="text-[#d4af37]" fill="currentColor" />
        </div>
        <p className="text-lg font-serif text-[#232323] mb-2">Hvala, {name}!</p>
        <p className="text-sm text-[#8B7355]">
          {attending === "Da"
            ? `Radujemo se vašem dolasku! (${guestCount} ${guestCount === 1 ? "osoba" : "osobe"})`
            : "Žao nam je što nećete moći da dođete."}
        </p>
        <button type="button" onClick={() => { setIsSubmitted(false); setName(""); setDetails(""); }} className="mt-6 text-xs text-[#8B7355]/50 underline hover:text-[#8B7355]">
          Pošalji još jednu potvrdu
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <p className="text-sm sm:text-base text-[#8B7355] text-center font-serif mb-4">
        Sa zadovoljstvom Vas očekujemo.
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Vaše ime i prezime"
        className="w-full bg-white border border-[#d4af37]/20 rounded-xl px-4 py-3 text-[#232323] text-sm placeholder:text-[#8B7355]/40 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 transition-all"
      />
      <div className="flex gap-3">
        {(["Da", "Ne"] as const).map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setAttending(val)}
            className="relative flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-500 overflow-hidden"
            style={{
              background: attending === val
                ? "linear-gradient(135deg, #e8d48a, #d4af37 40%, #b89520)"
                : "linear-gradient(135deg, #ffffff, #faf8f0 40%, #ede5d0)",
              boxShadow: attending === val
                ? "0 0 0 1.5px #b89520, 0 0 0 3px rgba(212,175,55,0.25), 0 6px 18px rgba(212,175,55,0.3), inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.12)"
                : "0 0 0 1px rgba(212,175,55,0.2), 0 0 0 2.5px rgba(212,175,55,0.06), 0 3px 10px rgba(0,0,0,0.06), inset 0 1px 2px rgba(255,255,255,0.7), inset 0 -1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[50%] bg-gradient-to-b from-white/35 to-transparent rounded-t-xl pointer-events-none" />
            <span
              className={`relative z-10 ${attending === val ? "text-white" : "text-[#8b6914]"}`}
              style={attending === val ? { textShadow: "0 1px 2px rgba(0,0,0,0.3)" } : undefined}
            >
              {val === "Da" ? "Dolazim" : "Ne dolazim"}
            </span>
          </button>
        ))}
      </div>
      <motion.div
        initial={false}
        animate={{ height: attending === "Da" ? "auto" : 0, opacity: attending === "Da" ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden space-y-5"
      >
        <div className="flex items-center justify-between bg-white border border-[#d4af37]/15 rounded-xl px-4 py-2.5">
          <span className="text-sm text-[#8B7355]">Broj osoba</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-8 h-8 rounded-full bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 text-lg transition-colors">−</button>
            <span className="text-[#232323] font-medium w-6 text-center">{guestCount}</span>
            <button type="button" onClick={() => setGuestCount(guestCount + 1)} className="w-8 h-8 rounded-full bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 text-lg transition-colors">+</button>
          </div>
        </div>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Napomena (opciono)"
          rows={2}
          className="w-full bg-white border border-[#d4af37]/15 rounded-xl px-4 py-3 text-[#232323] text-sm placeholder:text-[#8B7355]/40 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 resize-none transition-all"
        />
      </motion.div>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm transition-all duration-500 overflow-hidden disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #e8d48a, #d4af37 40%, #b89520)",
          boxShadow: "0 0 0 1.5px #b89520, 0 0 0 3px rgba(212,175,55,0.25), 0 6px 18px rgba(212,175,55,0.3), inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.12)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[50%] bg-gradient-to-b from-white/35 to-transparent rounded-t-xl pointer-events-none" />
        <span className="relative z-10 flex items-center gap-2 text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
          {isSubmitting ? "Slanje..." : attending === "Da" ? <><Heart size={14} fill="currentColor" /> Potvrdi</> : <><Send size={14} /> Pošalji</>}
        </span>
      </button>
      {submitUntil && (
        <p className="text-[10px] text-[#8B7355]/50 text-center">Rok za potvrdu: {formattedDeadline}</p>
      )}
    </form>
  );
}

export default function LineArtInvitation({
  data,
  slug,
  bride,
  groom,
  full_display,
  formattedDate,
  formattedDateShort,
  isPastDeadline,
}: ThemeInvitationProps) {
  // Window-level scroll for page parallax
  const { scrollY } = useScroll();
  // Starry night: slow parallax — moves down at 40% of scroll speed (lingers at top)
  const starryNightY = useTransform(scrollY, [0, 1200], [0, 480]);
  // Slow parallax for the fixed side decor — pattern drifts upward as user scrolls down.
  const sideDecorY = useTransform(scrollY, (v) => -v * 0.25);

  return (
    <div className="bg-[#fffdf5] relative overflow-x-hidden">
      <style>{`html, body { background-color: #fffdf5; overscroll-behavior-y: none; }`}</style>
      {/* ── Floating gold particles — visible across entire invitation ── */}
      <ParticleBackground theme="line_art" />
      {/* ── SIDE DECOR — fixed on scroll with slow parallax, both edges ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 h-screen w-[60px] sm:w-[100px] md:w-[130px] lg:w-[160px] z-[5] overflow-hidden"
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-[600vh]"
          style={{
            y: sideDecorY,
            scaleX: -1,
            backgroundImage:
              "url('/images/premium/line-art-invitation/side-decor.webp')",
            backgroundSize: "100% auto",
            backgroundRepeat: "repeat-y",
            willChange: "transform",
          }}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 right-0 h-screen w-[60px] sm:w-[100px] md:w-[130px] lg:w-[160px] z-[5] overflow-hidden"
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-[600vh]"
          style={{
            y: sideDecorY,
            backgroundImage:
              "url('/images/premium/line-art-invitation/side-decor.webp')",
            backgroundSize: "100% auto",
            backgroundRepeat: "repeat-y",
            willChange: "transform",
          }}
        />
      </div>

      {/* ── STARRY NIGHT — top edge, above side decors (slow parallax) ── */}
      <motion.div
        className="pointer-events-none absolute top-0 left-0 right-0 z-[7] overflow-hidden pb-20 sm:pb-24"
        style={{ y: starryNightY }}
      >
        <img
          src="/images/premium/line-art-invitation/Starry-night.webp"
          alt=""
          className="w-full h-auto block translate-y-0 md:-translate-y-[30%] lg:-translate-y-[40%] drop-shadow-[0_15px_25px_rgba(0,0,0,0.45)] sm:drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]"
        />
      </motion.div>

      <HeroSection
        bride={bride}
        groom={groom}
        aiCoupleImageUrl={data.ai_couple_image_url}
        premiumTheme={data.premium_theme}
        tagline={data.tagline}
        formattedDateShort={formattedDateShort}
      />

      {/* ═══════════════ SECTION 2 — Countdown + Date + Tagline ═══════════════ */}
      <section className="relative md:min-h-screen flex flex-col items-center justify-start px-8 sm:px-16 md:px-24 pt-0 pb-48 sm:pb-56 md:pb-16">
        {/* Paper wallpaper background — wrapped in its own overflow-hidden so card shadows can escape */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            aria-hidden
            className="absolute"
            style={{
              top: "-20%",
              left: "-15%",
              right: "-15%",
              bottom: "-20%",
              backgroundImage:
                "url('/images/premium/line-art-invitation/paper-wallpaper.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
        <div className="relative z-10 w-full max-w-2xl mx-auto">
          <GlassCard className="text-center" cornerOrnaments={false}>
            {data.countdown_enabled && data.event_date && (
              <>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#8b6914] mb-6 text-center font-semibold">
                  Odbrojavanje
                </p>
                <LineArtCountdown targetDate={data.event_date} />
                <GoldDivider className="mt-4 mb-4" />
              </>
            )}
            <p className="font-serif tracking-[0.15em] sm:tracking-[0.2em] text-xl sm:text-2xl md:text-3xl text-[#8b6914] font-medium">
              {formattedDateShort}
            </p>
            {data.tagline && (
              <p className="text-[#5a4a2e] mt-4 sm:mt-6 italic font-serif text-lg sm:text-xl md:text-2xl leading-relaxed max-w-lg mx-auto">
                {data.tagline}
              </p>
            )}
          </GlassCard>
        </div>

      </section>

      {/* ═══════════════ SECTION 3 — Diamond waterfall (empty content) ═══════════════ */}
      <section className="relative h-[50vh] sm:h-[60vh] md:min-h-screen">
        {/* Paper wallpaper background — wrapped in its own overflow-hidden so only the bg is clipped */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            aria-hidden
            className="absolute"
            style={{
              top: "-20%",
              left: "-15%",
              right: "-15%",
              bottom: "-20%",
              backgroundImage:
                "url('/images/premium/line-art-invitation/paper-wallpaper.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
        {/* Diamond waterfall — extends upward into section 2, 50% overlap */}
        <motion.img
          src="/images/premium/line-art-invitation/diamond-waterfall.webp"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[30%] w-[135%] sm:w-[125%] md:w-[100%] lg:w-[88%] xl:w-[80%] max-w-[1400px] h-auto z-[3] drop-shadow-[0_30px_50px_rgba(0,0,0,0.4)]"
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>

      {/* ═══════════════ SECTION 4 — Timeline ═══════════════ */}
      {data.timeline.length > 0 && <SpinningTimeline timeline={data.timeline} locations={data.locations} mapEnabled={data.map_enabled} />}

      {/* ═══════════════ SECTION 5 — RSVP ═══════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 sm:px-16 md:px-24 py-16">
        {/* Paper wallpaper background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            aria-hidden
            className="absolute"
            style={{
              top: "-20%",
              left: "-15%",
              right: "-15%",
              bottom: "-20%",
              backgroundImage:
                "url('/images/premium/line-art-invitation/paper-wallpaper.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
        {/* Layered yellow roses — top corners */}
        <motion.img
          src="/images/premium/line-art-invitation/layered-yellow-roses.webp"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-[2%] left-[-2%] sm:left-[4%] md:left-[6%] w-[42%] sm:w-[36%] md:w-[32%] lg:w-[30%] max-w-[440px] h-auto z-[15] drop-shadow-[0_25px_45px_rgba(0,0,0,0.5)] origin-top"
          animate={{ y: [0, -8, 0], rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src="/images/premium/line-art-invitation/layered-yellow-roses.webp"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-[2%] right-[-2%] sm:right-[4%] md:right-[6%] w-[42%] sm:w-[36%] md:w-[32%] lg:w-[30%] max-w-[440px] h-auto -scale-x-100 z-[15] drop-shadow-[0_25px_45px_rgba(0,0,0,0.5)] origin-top"
          animate={{ y: [0, -6, 0], rotate: [1.5, -1.5, 1.5] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        />
        <div className="relative z-10 w-full max-w-xl mx-auto">
          <GlassCard cornerOrnaments={false}>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#d4af37]/80 mb-6 text-center font-medium">
              Potvrda dolaska
            </p>
            {isPastDeadline ? (
              <p className="text-sm text-[#8B7355] text-center">
                Rok za potvrdu dolaska je istekao.
              </p>
            ) : (
              <LineArtRSVPForm slug={slug} submitUntil={data.submit_until} formattedDeadline={formattedDate} />
            )}
          </GlassCard>
        </div>
      </section>

      {/* ═══════════════ SECTION 6 — Footer ═══════════════ */}
      <footer className="relative py-14 sm:py-16 md:py-20 text-center overflow-hidden px-16 sm:px-20 md:px-24">
        {/* Paper wallpaper background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            aria-hidden
            className="absolute"
            style={{
              top: "-20%",
              left: "-15%",
              right: "-15%",
              bottom: "-20%",
              backgroundImage:
                "url('/images/premium/line-art-invitation/paper-wallpaper.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#d4af37]/[0.03] to-transparent" />
        <div className="relative z-10 max-w-md mx-auto">
          <GoldDivider className="mb-6 sm:mb-8" />
          <p className="font-serif text-3xl sm:text-4xl text-[#232323] mb-3 break-words">
            {full_display}
          </p>
          <p className="font-serif tracking-[0.15em] text-lg sm:text-xl text-[#d4af37]/90 mb-6">
            {formattedDateShort}
          </p>

          {data.thankYouFooter && (
            <p className="font-serif italic text-lg sm:text-xl text-[#8B7355]/90 leading-relaxed mb-6">
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
              <div className="w-6 h-px bg-[#d4af37]/25" />
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#d4af37]/40">
                Powered by
              </p>
              <div className="w-6 h-px bg-[#d4af37]/25" />
            </div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#d4af37]/60 hover:text-[#d4af37] transition-colors font-medium">
              Halo Uspomene
            </p>
          </a>
        </div>
      </footer>
    </div>
  );
}
