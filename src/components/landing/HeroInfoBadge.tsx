"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Award, Check, Sparkles, X } from "lucide-react";
import Link from "next/link";

const HeroInfoBadge: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const modal = modalOpen
    ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 z-10 w-9 h-9 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={18} className="text-[#232323]" />
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#AE343F]/10 text-[#AE343F] rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles size={12} />
                Zašto HALO Uspomene?
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#232323] mb-2 leading-tight">
                Više od fotografija —<br />
                <span className="italic text-[#AE343F]">čuvajte glasove</span>
              </h2>
              <p className="text-sm text-[#232323]/60 mb-6 leading-relaxed">
                Vintage telefon na koji gosti ostavljaju glasovne poruke tokom
                venčanja. Zamislite da za 10 godina ponovo čujete glas bake,
                dede, najboljeg prijatelja — tačno onakvim kakav je bio tog dana.
              </p>

              {/* Why us */}
              <div className="bg-[#d4af37]/10 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award size={16} className="text-[#d4af37]" />
                  <p className="text-sm font-bold text-[#232323] uppercase tracking-wider">
                    Najpovoljniji u Srbiji
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    "Već od 9.000 din — najpovoljnije cene u Srbiji",
                    "Dostava do vas uvek uključena u cenu",
                    "Svi snimci digitalno — fizički oblici dostupni kao dodaci",
                    "Fiksne cene tokom cele godine, bez skrivenih troškova",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Check size={14} className="text-[#d4af37] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-[#232323]/70">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Packages */}
              <p className="text-xs font-bold uppercase tracking-widest text-[#AE343F] mb-3">
                Paketi
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#faf9f6] border border-[#ae343f]/20 rounded-2xl p-4">
                  <p className="font-bold text-[#232323] text-sm mb-1">Essential</p>
                  <p className="text-xl font-serif text-[#AE343F] font-bold">9.000 din</p>
                  <p className="text-xs text-[#232323]/70 mt-1 leading-relaxed">
                    Kurirska dostava, vintage telefon, svi snimci za 3–5 dana,
                    popusti za digitalne pozivnice!
                  </p>
                </div>
                <div className="bg-[#faf9f6] border border-[#ae343f]/20 rounded-2xl p-4 relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#232323] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap">
                    Preporuka
                  </div>
                  <p className="font-bold text-[#232323] text-sm mb-1">Full Service</p>
                  <p className="text-xl font-serif text-[#AE343F] font-bold">10.000 din</p>
                  <p className="text-xs text-[#232323]/70 mt-1 leading-relaxed">
                    Lična dostava, mogućnost postavljanja govornice,
                    personalizovana dobrodošlica...
                  </p>
                  <p className="text-[10px] text-[#232323]/40 mt-2 italic">
                    * Dostupno samo u Novom Sadu
                  </p>
                </div>
              </div>

              {/* Add-ons */}
              <p className="text-xs font-bold uppercase tracking-widest text-[#AE343F] mb-3">
                Dodaci
              </p>
              <div className="space-y-2 mb-8">
                {[
                  { label: "USB retro kaseta", price: "2.500 din", note: "Fizički suvenir" },
                  { label: "Uspomene u boci — USB u bočici", price: "2.000 din", note: "Fizički suvenir" },
                  { label: "MINI govornica", price: "3.000 din", note: "Drvena, kompaktna" },
                  { label: "MAXI govornica", price: "5.000 din", note: "Centralni detalj sale" },
                  { label: "Digitalna pozivnica", price: "5.000 din", note: "3.500 din uz paket (−30%)" },
                ].map((addon) => (
                  <div
                    key={addon.label}
                    className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#232323]">{addon.label}</p>
                      <p className="text-xs text-[#232323]/60">{addon.note}</p>
                    </div>
                    <p className="text-sm font-bold text-[#AE343F] ml-4 whitespace-nowrap">
                      +{addon.price}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href="/#kontakt"
                onClick={() => setModalOpen(false)}
                className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] btn-lg rounded-full w-full border-none shadow-xl shadow-[#AE343F]/20"
              >
                Proverite dostupnost
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <style>{`
        @keyframes sparkleFlash {
          0%, 100% { opacity: 0.25; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .sparkle-flash { animation: sparkleFlash 1.4s ease-in-out infinite; }
      `}</style>
      <button
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#AE343F]/10 text-[#AE343F] rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-8 hover:bg-[#AE343F]/20 transition-colors cursor-pointer"
      >
        <Sparkles size={14} className="sparkle-flash" />
        Vaš Dan Zaslužuje Više Od Fotografija
      </button>

      {modal}
    </>
  );
};

export default HeroInfoBadge;
