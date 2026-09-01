import React from "react";
import Link from "next/link";
import { Cake, PartyPopper } from "lucide-react";

const SectionRodjendani: React.FC = () => {
  return (
    <section
      id="rodjendani"
      className="py-12 sm:py-16 bg-[#F5F4DC] relative overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow">
          <div className="grid md:grid-cols-[auto_1fr_auto] gap-6 md:gap-8 items-center">
            <div className="hidden md:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[#AE343F]/10 to-[#d4af37]/10 items-center justify-center shrink-0">
              <PartyPopper size={28} className="text-[#AE343F]" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#AE343F] mb-2">
                Pravimo i rođendanske pozivnice
              </p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#232323] leading-tight mb-2">
                Dečiji rođendani i punoletstva
              </h3>
              <p className="text-sm sm:text-base text-[#232323]/60 leading-relaxed">
                Na profesionalnom nivou kao i naše pozivnice za venčanje —
                prilagođen ton i teme. Pozivnica + Potvrde dolaska + Raspored
                sedenja.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              <Link
                href="/napravi-deciju-pozivnicu"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-xs uppercase tracking-wider font-bold rounded-full transition-colors"
              >
                <PartyPopper size={14} />
                Dečiji rođendan
              </Link>
              <Link
                href="/napravi-punoletstvo"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-xs uppercase tracking-wider font-bold rounded-full transition-colors"
              >
                <Cake size={14} />
                Punoletstvo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionRodjendani;
