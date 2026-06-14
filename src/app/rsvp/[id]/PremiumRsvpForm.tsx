"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, X } from "lucide-react";
import { useRecaptcha } from "@/components/forms/RecaptchaProvider";

/* Luxe premium RSVP form — glassmorphism + gold, matching the Watercolor
   invitation's "Potvrda dolaska". Self-contained (own strings) so it can live on
   the standalone /rsvp page. */

const GLASS_BG =
  "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(212,175,55,0.08) 100%)";
const GLASS_BORDER = "1px solid rgba(255,255,255,0.18)";
const GLASS_SHADOW =
  "0 12px 32px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,175,55,0.08), inset 0 1px 0 rgba(255,255,255,0.15)";
const SHADOW = "0 2px 10px rgba(0,0,0,0.75)";

type Strings = {
  intro: string;
  namePh: string;
  come: string;
  notCome: string;
  count: string;
  notePh: string;
  confirm: string;
  send: string;
  sending: string;
  deadline: string;
  thanks: (n: string) => string;
  glad: (n: number) => string;
  sorry: string;
  another: string;
};

const LAT: Strings = {
  intro: "Sa zadovoljstvom Vas očekujemo",
  namePh: "Vaše ime i prezime",
  come: "Dolazim",
  notCome: "Ne dolazim",
  count: "Broj osoba",
  notePh: "Napomena (opciono)",
  confirm: "Potvrdi",
  send: "Pošalji",
  sending: "Slanje...",
  deadline: "Rok za potvrdu:",
  thanks: (n) => `Hvala, ${n}!`,
  glad: (n) => `Radujemo se vašem dolasku! (${n} ${n === 1 ? "osoba" : "osobe"})`,
  sorry: "Žao nam je što nećete moći da dođete.",
  another: "Pošalji još jednu potvrdu",
};

const CYR: Strings = {
  intro: "Са задовољством Вас очекујемо",
  namePh: "Ваше име и презиме",
  come: "Долазим",
  notCome: "Не долазим",
  count: "Број особа",
  notePh: "Напомена (опционо)",
  confirm: "Потврди",
  send: "Пошаљи",
  sending: "Слање...",
  deadline: "Рок за потврду:",
  thanks: (n) => `Хвала, ${n}!`,
  glad: (n) => `Радујемо се вашем доласку! (${n} ${n === 1 ? "особа" : "особе"})`,
  sorry: "Жао нам је што нећете моћи да дођете.",
  another: "Пошаљи још једну потврду",
};

export default function PremiumRsvpForm({
  slug,
  submitUntil,
  formattedDeadline,
  cyrillic,
}: {
  slug: string;
  submitUntil: string;
  formattedDeadline: string | null;
  cyrillic: boolean;
}) {
  const t = cyrillic ? CYR : LAT;
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
      setError(cyrillic ? "Молимо унесите Ваше име." : "Molimo unesite Vaše ime.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      let recaptchaToken = "";
      try {
        recaptchaToken = await executeRecaptcha("rsvp");
      } catch {
        setError(
          cyrillic
            ? "Провера неуспешна. Освежите страницу и покушајте поново."
            : "Provera neuspešna. Osvežite stranicu i pokušajte ponovo.",
        );
        setIsSubmitting(false);
        return;
      }
      const res = await fetch(`/api/pozivnica/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          attending,
          guestCount: attending === "Da" ? guestCount : 0,
          details: attending === "Da" ? details : "",
          recaptcha_token: recaptchaToken,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error || (cyrillic ? "Грешка при слању." : "Greška pri slanju."),
        );
      }
      setIsSubmitted(true);
    } catch (err) {
      setError(
        (err as Error).message ||
          (cyrillic ? "Грешка при слању." : "Greška pri slanju."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        className="relative rounded-3xl p-8 text-center overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: GLASS_BG,
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          border: GLASS_BORDER,
          boxShadow: GLASS_SHADOW,
        }}
      >
        <div className="w-16 h-16 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center mx-auto mb-6">
          <Heart size={28} className="text-[#d4af37]" fill="currentColor" />
        </div>
        <p className="text-xl font-serif text-white mb-2" style={{ textShadow: SHADOW }}>
          {t.thanks(name)}
        </p>
        <p className="text-sm text-white/70">
          {attending === "Da" ? t.glad(guestCount) : t.sorry}
        </p>
        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            setName("");
            setDetails("");
            setGuestCount(1);
          }}
          className="mt-6 text-xs text-white/40 underline hover:text-white/70 cursor-pointer"
        >
          {t.another}
        </button>
      </motion.div>
    );
  }

  return (
    <div
      className="relative rounded-3xl p-6 sm:p-8 overflow-hidden"
      style={{
        background: GLASS_BG,
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        border: GLASS_BORDER,
        boxShadow: GLASS_SHADOW,
      }}
    >
      {/* Top shine */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)",
        }}
      />

      <form onSubmit={handleSubmit} className="relative space-y-5">
        <p
          className="text-base sm:text-lg text-white/90 text-center font-serif mb-6"
          style={{ textShadow: SHADOW }}
        >
          {t.intro}
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePh}
          className="w-full bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/55 focus:outline-none focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/25 transition-all"
        />

        <div className="grid grid-cols-2 gap-3">
          {(["Da", "Ne"] as const).map((val) => {
            const active = attending === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setAttending(val)}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl text-sm font-medium transition-all ${
                  active
                    ? "bg-gradient-to-br from-[#d4af37] to-[#c5a028] text-white shadow-lg shadow-[#d4af37]/25 border border-[#d4af37]"
                    : "bg-white/8 text-white/85 border border-white/22 hover:border-white/40"
                }`}
              >
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: active
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.08)",
                  }}
                >
                  {val === "Da" ? (
                    <Heart
                      size={15}
                      fill="currentColor"
                      className={active ? "text-white" : "text-white/70"}
                    />
                  ) : (
                    <X
                      size={16}
                      strokeWidth={2.5}
                      className={active ? "text-white" : "text-white/70"}
                    />
                  )}
                </span>
                {val === "Da" ? t.come : t.notCome}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {attending === "Da" && (
            <motion.div
              key="extra"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden space-y-5"
            >
              <div className="flex items-center justify-between bg-white/10 border border-white/25 rounded-xl px-4 py-2.5">
                <span className="text-sm text-white/90" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                  {t.count}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                    className="w-9 h-9 rounded-full bg-white/15 border border-white/35 text-white hover:bg-white/25 text-xl font-bold leading-none inline-flex items-center justify-center pb-0.5 transition-colors cursor-pointer"
                  >
                    −
                  </button>
                  <span
                    className="text-white font-semibold text-base w-6 text-center tabular-nums"
                    style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
                  >
                    {guestCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuestCount((c) => c + 1)}
                    className="w-9 h-9 rounded-full bg-white/15 border border-white/35 text-white hover:bg-white/25 text-xl font-bold leading-none inline-flex items-center justify-center pb-0.5 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t.notePh}
                rows={2}
                className="w-full bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/55 focus:outline-none focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/25 resize-none transition-all"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="text-xs text-red-300 text-center">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c5a028] text-white font-medium text-sm uppercase tracking-[0.15em] shadow-lg shadow-[#d4af37]/25 hover:shadow-[#d4af37]/40 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            t.sending
          ) : (
            <>
              <Send size={15} /> {attending === "Da" ? t.confirm : t.send}
            </>
          )}
        </button>

        {submitUntil && formattedDeadline && (
          <p
            className="text-xs text-white/85 text-center font-medium tracking-wide"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}
          >
            {t.deadline} <span className="text-[#d4af37]">{formattedDeadline}</span>
          </p>
        )}
      </form>
    </div>
  );
}
