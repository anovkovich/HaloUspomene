import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Store, ArrowRight } from "lucide-react";

const SectionPlaner: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-[#1a1a1a] via-[#202020] to-[#2d2622] border-t-[3px] border-[#d4af37] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div className="text-center md:text-left">
            <div className="flex flex-wrap items-center gap-2 mb-4 justify-center md:justify-start">
              <Link
                href="/planiranje-vencanja"
                className="group inline-flex items-center gap-2 px-3 py-1 bg-[#F5F4DC]/10 border border-[#F5F4DC]/15 rounded-full hover:bg-[#d4af37]/15 hover:border-[#d4af37]/40 transition-colors"
                data-track="cta_click"
                data-track-cta-name="vodic_badge"
                data-track-cta-location="section_planer"
              >
                <BookOpen size={12} className="text-[#d4af37]" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F5F4DC]/70 group-hover:text-[#F5F4DC]/95">
                  Besplatan vodič
                </span>
              </Link>
              <Link
                href="/vendori"
                className="group inline-flex items-center gap-2 px-3 py-1 bg-[#F5F4DC]/10 border border-[#F5F4DC]/15 rounded-full hover:bg-[#d4af37]/15 hover:border-[#d4af37]/40 transition-colors"
                data-track="cta_click"
                data-track-cta-name="vendori_badge"
                data-track-cta-location="section_planer"
              >
                <Store size={12} className="text-[#d4af37]" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F5F4DC]/70 group-hover:text-[#F5F4DC]/95">
                  Baza proverenih vendora
                </span>
              </Link>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#F5F4DC] leading-tight mb-3">
              Tek ste na početku organizacije?{" "}
              <span className="italic text-[#d4af37]">Imamo vodič.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#F5F4DC]/60 leading-relaxed max-w-2xl">
              Kompletan vodič kroz planiranje venčanja — checklista po grupama,
              korisni saveti i baza proverenih vendora. Dostupan svima potpuno
              besplatno.
            </p>
          </div>

          <div className="flex justify-center md:justify-end shrink-0">
            <Link
              href="/planiranje-vencanja"
              className="inline-flex items-center gap-2 px-7 py-4 bg-[#d4af37] hover:bg-[#b8962e] text-[#232323] text-sm uppercase tracking-widest font-bold rounded-full transition-all shadow-2xl shadow-[#d4af37]/20"
              data-track="cta_click"
              data-track-cta-name="planer_vodic"
              data-track-cta-location="section_planer"
            >
              Pogledajte vodič
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionPlaner;
