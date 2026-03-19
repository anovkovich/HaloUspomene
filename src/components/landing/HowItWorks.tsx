import React from "react";
import {
  Check,
  Globe,
  FileDown,
  LayoutDashboard,
  Mic,
  Phone,
  ArrowRight,
  Sparkles,
  Award,
} from "lucide-react";
import Link from "next/link";

const HowItWorks: React.FC = () => {
  return (
    <section
      id="proces"
      className="py-16 sm:py-24 bg-[#232323] relative overflow-hidden"
    >
      {/* Dot grid */}
      <style>{`
        @keyframes dotWave {
          0%   { background-position: 0px 0px; }
          50%  { background-position: 14px 14px; }
          100% { background-position: 0px 0px; }
        }
      `}</style>
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #F5F4DC 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          animation: "dotWave 12s ease-in-out infinite",
        }}
      />
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#AE343F]/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-3">
            Šta nudimo
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-[#F5F4DC] leading-none">
            Sve što je Vašem venčanju
            <br />
            <span className="italic text-[#AE343F]">zaista potrebno</span>
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* ═══ MAIN: Website pozivnica hero ═══ */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#AE343F]/20 to-[#8B2833]/30 border border-[#AE343F]/40 rounded-3xl p-7 sm:p-10 relative overflow-hidden group hover:border-[#AE343F]/60 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#AE343F] mb-4">
              Digitalna pozivnica
            </p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#F5F4DC] mb-2 leading-tight">
              Website pozivnica za venčanje
            </h3>
            <p className="text-[#F5F4DC]/50 font-serif text-lg sm:text-xl mb-5">
              + besplatna PDF pozivnica za štampu
            </p>
            <p className="text-[#F5F4DC]/60 text-sm sm:text-base leading-relaxed max-w-lg mb-6">
              Personalizovana web stranica sa RSVP formom, odbrojavanjem,
              programom dana i interaktivnom mapom. Gosti potvrde dolazak
              jednim klikom — bez poziva, nikad lakše.
            </p>

            {/* Feature pills */}
            <div className="grid grid-cols-2 gap-2 max-w-md">
              {[
                { icon: <Globe size={13} />, label: "6 dizajnerskih tema" },
                { icon: <FileDown size={13} />, label: "PDF za štampu — besplatno" },
                { icon: <Check size={13} />, label: "RSVP potvrda dolaska" },
                { icon: <Check size={13} />, label: "Latinica i ćirilica" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 text-xs text-[#F5F4DC]/60"
                >
                  <span className="text-[#AE343F]">{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          {/* ═══ Price card ═══ */}
          <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-3xl p-7 sm:p-8 flex flex-col justify-between hover:border-[#d4af37]/40 transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Award size={20} className="text-[#d4af37] shrink-0" />
                <p className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.25em]">
                  Najpovoljniji u Srbiji
                </p>
              </div>
              <p className="text-[#F5F4DC] font-serif text-3xl sm:text-4xl font-bold leading-none mb-1">
                od 5.000 din
              </p>
              <p className="text-[#F5F4DC]/40 text-xs mb-4">
                ili kompletni paket 8.000 din
              </p>
              <div className="space-y-1.5">
                {[
                  "Besplatna PDF pozivnica uključena",
                  "Fiksne cene — bez skrivenih troškova",
                  "Popust za kompletni paket",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={12} className="text-[#d4af37] shrink-0" />
                    <span className="text-[#F5F4DC]/60 text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/cene"
              className="mt-6 w-full py-3 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:bg-[#d4af37]/30 transition-all"
            >
              Pogledajte cene
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* ═══ Add-ons: Raspored + Audio ═══ */}
          <div className="bg-white/[0.07] border border-white/10 rounded-3xl p-7 sm:p-8 hover:border-white/20 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#AE343F] mb-5">
              Dodaci uz pozivnicu
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <FileDown size={14} className="text-[#AE343F]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[#F5F4DC] text-sm font-semibold">
                      Pozivnica za štampu
                    </p>
                    <span className="text-xs font-semibold uppercase tracking-wide text-green-400 bg-green-400/10 px-2.5 py-0.5 rounded-full">
                      Besplatno
                    </span>
                  </div>
                  <p className="text-[#F5F4DC]/40 text-xs mt-0.5">
                    Elegantna PDF pozivnica u A5 formatu sa QR kodom za potvrdu dolaska
                  </p>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <LayoutDashboard size={14} className="text-[#AE343F]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[#F5F4DC] text-sm font-semibold">
                      Raspored sedenja
                    </p>
                    <span className="text-[#F5F4DC]/70 text-sm font-bold tabular-nums">
                      2.000 din
                    </span>
                  </div>
                  <p className="text-[#F5F4DC]/40 text-xs mt-0.5">
                    Drag-and-drop editor za stolove, gosti pronalaze svoje mesto putem linka
                  </p>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <Mic size={14} className="text-[#AE343F]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[#F5F4DC] text-sm font-semibold">
                      Digitalna audio knjiga
                    </p>
                    <span className="text-[#F5F4DC]/70 text-sm font-bold tabular-nums">
                      3.000 din
                    </span>
                  </div>
                  <p className="text-[#F5F4DC]/40 text-xs mt-0.5">
                    Gosti snimaju poruke skeniranjem QR koda — bez aplikacije
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ How it works ═══ */}
          <div className="bg-white/[0.07] border border-white/10 rounded-3xl p-7 sm:p-8 hover:border-white/20 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#AE343F] mb-6">
              Kako funkcioniše
            </p>
            <div className="space-y-5">
              {[
                {
                  n: "01",
                  t: "Popunite upitnik",
                  d: "Imena, datum, lokacija, tema — sve u 6 koraka",
                },
                {
                  n: "02",
                  t: "Mi kreiramo pozivnicu",
                  d: "Vaša personalizovana stranica gotova za 24h",
                },
                {
                  n: "03",
                  t: "Podelite sa gostima",
                  d: "Pošaljite link ili QR kod — gosti potvrde dolazak online",
                },
                {
                  n: "04",
                  t: "Organizujte raspored sedenja",
                  d: "Jednostavno rasporedite goste, a oni na dan venčanja brzo pronalaze gde sede",
                },
              ].map((s) => (
                <div key={s.n} className="flex items-start gap-4">
                  <span className="text-[#AE343F]/60 font-serif font-black text-xl w-7 shrink-0 mt-0.5">
                    {s.n}
                  </span>
                  <div className="flex-1">
                    <p className="text-[#F5F4DC] text-sm font-semibold">
                      {s.t}
                    </p>
                    <p className="text-[#F5F4DC]/60 text-xs mt-0.5">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ Retro phone promo ═══ */}
          <div className="bg-white/[0.07] border border-white/10 rounded-3xl p-7 sm:p-8 hover:border-white/20 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Phone size={16} className="text-[#d4af37]" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37]">
                  Retro telefon
                </p>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif text-[#F5F4DC] mb-3 leading-tight">
                Vintage telefon koji čuva glasove
                <span className="text-[#F5F4DC]/50"> — zauvek</span>
              </h3>
              <p className="text-[#F5F4DC]/50 text-sm leading-relaxed mb-4">
                Gosti podižu slušalicu i ostavljaju glasovnu poruku.
                Autentični retro doživljaj koji postaje centralni detalj
                Vašeg venčanja.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {["Essential — od 9.000 din", "Full Service — Novi Sad"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-[#F5F4DC]/50 font-medium"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>
            <Link
              href="/#paketi"
              className="flex items-center gap-2 text-sm text-[#d4af37] font-medium hover:underline mt-auto"
            >
              Pogledajte pakete <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            href="/cene"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm uppercase tracking-[0.15em] font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: "#AE343F",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(174,52,63,0.3)",
            }}
          >
            <Sparkles size={16} />
            Izaberite šta vam treba — pogledajte sve cene
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
