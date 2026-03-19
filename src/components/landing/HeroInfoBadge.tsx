"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X } from "lucide-react";
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
                Sačuvajte glasove vaših najdražih zauvek — svaka poruka postaje
                uspomena koju ćete slušati godinama.
              </p>

              {/* Two options */}
              <div className="space-y-3 mb-6">
                {/* Retro phone */}
                <div className="bg-[#faf9f6] border border-[#ae343f]/15 rounded-2xl p-5">
                  <p className="font-bold text-[#232323] text-sm mb-1">
                    🎙️ Retro Telefon Uspomena
                  </p>
                  <p className="text-xs text-[#232323]/60 leading-relaxed">
                    Fizički vintage telefon na vašem venčanju — gosti podižu
                    slušalicu i ostavljaju poruku od srca. Atrakcija o kojoj će
                    svi pričati.
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <Link
                      href="/#kontakt"
                      onClick={() => setModalOpen(false)}
                      className="text-xs font-bold text-[#AE343F] uppercase tracking-wider hover:underline"
                    >
                      Zakažite termin →
                    </Link>
                  </div>
                </div>

                {/* Digital audio */}
                <div className="bg-[#faf9f6] border border-[#ae343f]/15 rounded-2xl p-5">
                  <p className="font-bold text-[#232323] text-sm mb-1">
                    🎤 Digitalna Audio Knjiga Utisaka
                  </p>
                  <p className="text-xs text-[#232323]/60 leading-relaxed">
                    Gosti snimaju poruke direktno sa svog telefona — bez
                    aplikacije, bez instalacije. Vi slušate, preuzimate i čuvate
                    zauvek.
                  </p>
                  <p className="text-[10px] text-[#232323]/40 mt-2 italic">
                    Dolazi uz Website Pozivnicu
                  </p>
                </div>

                {/* Website pozivnica */}
                <div className="bg-[#faf9f6] border border-[#ae343f]/15 rounded-2xl p-5">
                  <p className="font-bold text-[#232323] text-sm mb-1">
                    💌 Website Pozivnica
                  </p>
                  <p className="text-xs text-[#232323]/60 leading-relaxed">
                    Kompletna platforma — RSVP, portal, raspored sedenja, PDF
                    pozivnica za štampu, i još mnogo toga.
                  </p>
                  <Link
                    href="/napravi-pozivnicu"
                    onClick={() => setModalOpen(false)}
                    className="text-xs font-bold text-[#AE343F] uppercase tracking-wider hover:underline mt-2 inline-block"
                  >
                    Napravite pozivnicu →
                  </Link>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/#kontakt"
                onClick={() => setModalOpen(false)}
                className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] btn-lg rounded-full w-full border-none shadow-xl shadow-[#AE343F]/20"
              >
                Zakažite retro telefon
              </Link>
            </div>
          </div>
        </div>,
        document.body,
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
