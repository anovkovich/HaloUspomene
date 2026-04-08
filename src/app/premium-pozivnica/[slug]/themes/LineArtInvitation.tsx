"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MapPin, Clock } from "lucide-react";
import type { ThemeInvitationProps } from "../PremiumInvitationClient";
import dynamic from "next/dynamic";

const HeroSection = dynamic(() => import("../components/HeroSection"), {
  ssr: false,
});

// Glassmorphism card
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative backdrop-blur-xl bg-white/60 rounded-3xl border border-[#d4af37]/15 shadow-[0_8px_40px_rgba(212,175,55,0.06)] p-8 sm:p-10 overflow-hidden ${className}`}
    >
      <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
      <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#d4af37]/15 to-transparent" />
      <div className="absolute inset-3 sm:inset-4 border border-[#d4af37]/8 rounded-2xl pointer-events-none" />
      {["top-4 left-4 sm:top-5 sm:left-5", "top-4 right-4 sm:top-5 sm:right-5 rotate-90", "bottom-4 right-4 sm:bottom-5 sm:right-5 rotate-180", "bottom-4 left-4 sm:bottom-5 sm:left-5 -rotate-90"].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-3 h-3 sm:w-4 sm:h-4 border-t border-l border-[#d4af37]/20 pointer-events-none`} />
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
      <img src="/images/premium/ornaments/wave-divider.svg" alt="" className="w-[60%] max-w-[200px] h-auto opacity-20" />
    </div>
  );
}

function LineArtCountdown({ targetDate }: { targetDate: string }) {
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
          <div className="backdrop-blur-sm bg-white/50 rounded-2xl border border-[#d4af37]/10 py-3 sm:py-4 px-2">
            <span className="text-3xl sm:text-5xl font-serif text-[#d4af37] tabular-nums">
              {String(item.value).padStart(2, "0")}
            </span>
          </div>
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#8B7355]/70 mt-2">
            {item.label}
          </p>
        </div>
      ))}
    </div>
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
  return (
    <div className="bg-[#fffdf5]">
      <HeroSection
        bride={bride}
        groom={groom}
        aiCoupleImageUrl={data.ai_couple_image_url}
        premiumTheme={data.premium_theme}
        tagline={data.tagline}
        formattedDateShort={formattedDateShort}
      />

      <SectionDivider />

      {data.countdown_enabled && data.event_date && (
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-xl mx-auto">
            <GlassCard className="text-center">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#d4af37]/80 mb-6 text-center font-medium">Odbrojavanje</p>
              <LineArtCountdown targetDate={data.event_date} />
              <GoldDivider className="mt-8" />
            </GlassCard>
          </div>
        </section>
      )}

      <SectionDivider />

      {data.timeline.length > 0 && (
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-xl mx-auto">
            <GlassCard>
              <div className="space-y-8">
                {data.timeline.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex items-start gap-4 sm:gap-6"
                  >
                    <div className="w-14 sm:w-16 text-right shrink-0">
                      {item.what && (
                        <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[#d4af37]/50 mb-0">{item.what}</p>
                      )}
                      <span className="text-xl sm:text-2xl font-serif font-medium text-[#d4af37]">{item.time}</span>
                    </div>
                    <div className="relative shrink-0 mt-1.5">
                      {item.what && <div className="h-3" />}
                      <div className="w-3 h-3 rounded-full bg-[#d4af37]/30 border-2 border-[#d4af37]" />
                    </div>
                    <div className="flex-1 pb-2">
                      {item.what && <div className="h-3" />}
                      <p className="text-base sm:text-lg font-semibold text-[#232323]">{item.title}</p>
                      {item.description && <p className="text-xs sm:text-sm text-[#8B7355] mt-1">{item.description}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>
      )}

      <SectionDivider />

      {data.map_enabled && data.locations.some((l) => l.map_url) && (
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-xl mx-auto">
            <GlassCard>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#d4af37]/80 mb-6 text-center font-medium">Lokacije</p>
              <div className="space-y-8">
                {data.locations.filter((l) => l.map_url).map((loc, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-[#d4af37]" />
                      <p className="text-sm font-medium text-[#232323]">{loc.name}</p>
                      {loc.time && <span className="flex items-center gap-1 text-xs text-[#8B7355] ml-auto"><Clock size={10} />{loc.time}</span>}
                    </div>
                    <p className="text-xs text-[#8B7355] mb-3 ml-5">{loc.address}</p>
                    <div className="rounded-2xl overflow-hidden border border-[#d4af37]/10 shadow-sm">
                      <iframe src={loc.map_url} className="w-full h-52 grayscale-[80%] hover:grayscale-0 transition-all duration-500" loading="lazy" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>
      )}

      <SectionDivider />

      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-xl mx-auto">
          <GlassCard className="text-center">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#d4af37]/80 mb-6 text-center font-medium">Potvrda dolaska</p>
            {isPastDeadline ? (
              <p className="text-sm text-[#8B7355]">Rok za potvrdu dolaska je istekao.</p>
            ) : (
              <div>
                <p className="text-sm sm:text-base text-[#8B7355] mb-6 font-serif">Sa zadovoljstvom Vas očekujemo. Molimo potvrdite Vaš dolazak.</p>
                <a href={`/pozivnica/${slug}/#rsvp`} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#c5a028] text-white font-medium text-sm shadow-lg shadow-[#d4af37]/20 hover:shadow-xl transition-all hover:scale-[1.02]">
                  <Heart size={14} fill="currentColor" />
                  Potvrdi dolazak
                </a>
                {data.submit_until && <p className="text-[10px] text-[#8B7355]/60 mt-4">Rok za potvrdu: {formattedDate}</p>}
              </div>
            )}
          </GlassCard>
        </div>
      </section>

      <footer className="relative py-16 sm:py-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#d4af37]/[0.03] to-transparent" />
        <div className="relative z-10">
          <GoldDivider className="mb-8" />
          <p className="font-serif text-3xl sm:text-4xl text-[#232323] mb-3">{full_display}</p>
          <p className="font-serif tracking-[0.15em] text-sm text-[#8B7355]">{formattedDateShort}</p>
          <div className="mt-10 flex items-center justify-center gap-2">
            <div className="w-6 h-px bg-[#d4af37]/30" />
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#d4af37]/40">Halo Uspomene</p>
            <div className="w-6 h-px bg-[#d4af37]/30" />
          </div>
        </div>
      </footer>
    </div>
  );
}
