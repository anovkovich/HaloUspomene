import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight, FileDown, LayoutDashboard } from "lucide-react";

const features = [
  "6 dizajnerskih tema, latinica i ćirilica",
  "Potvrda dolaska — nikad jednostavnije",
  "Pratite spisak gostiju u realnom vremenu",
];

const SectionInvitations: React.FC = () => {
  return (
    <section
      id="pozivnice"
      className="py-16 sm:py-20 md:py-24 bg-[#F5F4DC] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Text */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
              Standardne pozivnice
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight mb-5">
              Pozivnice koje gosti{" "}
              <span className="italic text-[#AE343F]">obožavaju</span>.
            </h2>
            <p className="text-base sm:text-lg text-[#232323]/65 leading-relaxed mb-6">
              Birajte između prelepih tema prilagođenih pametnim telefonima.
              Gosti na jednom mestu vide sve - kompletan plan vašeg dana,
              satinice, mapu restorana i crkve...
            </p>

            <ul className="space-y-3 mb-7">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-sm sm:text-base text-[#232323]/75"
                >
                  <Check
                    size={18}
                    className="text-[#AE343F] shrink-0 mt-0.5"
                    strokeWidth={2.5}
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* Moje Venčanje portal mention */}
            <div className="rounded-2xl border-2 border-dashed border-[#AE343F]/30 bg-[#AE343F]/5 p-5 mb-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#AE343F]/15 flex items-center justify-center shrink-0">
                  <LayoutDashboard size={18} className="text-[#AE343F]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#232323] mb-1">
                    Pristup portalu: Moje Venčanje
                  </p>
                  <p className="text-sm text-[#232323]/65 leading-relaxed">
                    Sve na Vašem telefonu — Checklist po grupama, budžet
                    kalkulator, baza proverenih vendora!
                  </p>
                </div>
              </div>
            </div>

            {/* PDF bonus highlight */}
            <div className="rounded-2xl border-2 border-dashed border-[#d4af37]/40 bg-[#d4af37]/5 p-5 mb-7">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 flex items-center justify-center shrink-0">
                  <FileDown size={18} className="text-[#d4af37]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#232323] mb-1">
                    Bonus: A5 PDF priprema za štampu
                  </p>
                  <p className="text-sm text-[#232323]/65 leading-relaxed">
                    Uz svaku web pozivnicu dobijate personalizovanu PDF
                    pozivnicu sa QR kodom — spremnu za štampariju.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Link
                href="/pozivnice"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-xl shadow-[#AE343F]/20"
                data-track="cta_click"
                data-track-cta-name="pozivnice_saznaj"
                data-track-cta-location="section_invitations"
              >
                Saznajte više o pozivnicama
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Image — below text on mobile (smaller), right side on desktop */}
          <div className="relative lg:order-last mx-auto max-w-[280px] sm:max-w-sm lg:max-w-none">
            <Image
              src="/images/website-pozivnice.webp"
              alt="HALO Uspomene website pozivnice — primeri tema na pametnom telefonu"
              width={1200}
              height={900}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionInvitations;
