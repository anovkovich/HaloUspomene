import React from "react";
import { Award, Check } from "lucide-react";

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
      {/* Glow accent */}
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
          {/* — Main card — */}
          <div className="md:col-span-2 bg-white/[0.07] border border-white/10 rounded-3xl p-7 sm:p-10 relative overflow-hidden group hover:border-white/20 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#AE343F] mb-4">
              Audio Guest Book
            </p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#F5F4DC] mb-4 leading-tight">
              Vintage telefon koji čuva glasove
              <br />
              <span className="text-[#F5F4DC]/70 font-light">
                Vaših najdražih — zauvek
              </span>
            </h3>
            <p className="text-[#F5F4DC]/70 text-sm sm:text-base leading-relaxed max-w-lg">
              Gosti podižu slušalicu i ostavljaju glasovnu poruku. Vi dobijate
              digitalni album svih snimaka — glasovi kuma, roditelja,
              prijatelja, tačno onakvi kakvi su bili na Vaš najlepši dan.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Essential paket",
                "Full Service — Novi Sad",
                "Dostava širom Srbije",
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-[#F5F4DC]/70 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* — Award card — */}
          <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-3xl p-7 sm:p-8 flex flex-col justify-between hover:border-[#d4af37]/40 transition-colors">
            <Award size={28} className="text-[#d4af37]" />
            <div>
              <p className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.25em] mb-3">
                Najpovoljniji u Srbiji
              </p>
              <p className="text-[#F5F4DC] font-serif text-4xl font-bold leading-none mb-3">
                Već od
                <br />
                9.000 din
              </p>
              <div className="space-y-1.5 mt-4">
                {[
                  "Troškovi povratka uređaja uključeni u cenu",
                  "Fiksne cene — bez skrivenih troškova",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={12} className="text-[#d4af37] shrink-0" />
                    <span className="text-[#F5F4DC]/70 text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* — How it works compact — */}
          <div className="bg-white/[0.07] border border-white/10 rounded-3xl p-7 sm:p-8 hover:border-white/20 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#AE343F] mb-6">
              Kako funkcioniše
            </p>
            <div className="space-y-5">
              {[
                {
                  n: "01",
                  t: "Rezervišete",
                  d: "Izaberete paket i datum u kontakt formi na dnu stranice",
                },
                {
                  n: "02",
                  t: "Telefon stiže",
                  d: "Kurirskom službom ili lično ukoliko ste u NS",
                },
                {
                  n: "03",
                  t: "Dobijate blago",
                  d: "Svi snimci najčešće za dva dana spremni za preuzimanje",
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

          {/* — Add-ons card — */}
          <div className="bg-white/[0.07] border border-white/10 rounded-3xl p-7 sm:p-8 hover:border-white/20 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#AE343F] mb-5">
              Dodaci
            </p>
            <div className="space-y-3">
              {[
                {
                  label: "USB retro kaseta",
                  desc: "Snimci na vintage kasetnoj USB memoriji",
                  price: "+2.500 din",
                },
                {
                  label: "Uspomene u boci",
                  desc: "USB poruke elegantno spakovane u mini bočicu",
                  price: "+2.000 din",
                },
                {
                  label: "MINI & MAXI govornice",
                  desc: "Drvene govornice koje postaje centralni dekor ",
                  price: "samo za NS",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-start py-2 border-b border-white/5 last:border-0 gap-3"
                >
                  <div>
                    <p className="text-[#F5F4DC]/70 text-sm">{item.label}</p>
                    <p className="text-[#F5F4DC]/35 text-xs mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <span className="text-[#F5F4DC] text-sm font-bold tabular-nums shrink-0">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* — Digital invite card — */}
          <div className="bg-[#AE343F]/10 border border-[#AE343F]/20 rounded-3xl p-7 sm:p-8 flex flex-col justify-between hover:border-[#AE343F]/40 transition-colors">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Digitalna pozivnica
              </p>
              <h3 className="text-[#F5F4DC] font-serif text-2xl leading-tight mb-3">
                Web pozivnica sa RSVP sistemom
              </h3>
              <p className="text-[#F5F4DC]/70 text-sm leading-relaxed">
                Personalizovana stranica za Vaše venčanje — odbrojavanje, mapa,
                potvrda dolaska.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[#F5F4DC]/60 text-sm line-through">
                5.000 din
              </span>
              <span className="px-3 py-1.5 bg-[#AE343F]/20 border border-[#AE343F]/30 rounded-full text-[#AE343F] text-xs font-bold">
                3.500 din uz AGB − 30%
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
