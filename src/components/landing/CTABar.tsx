import React from "react";
import Link from "next/link";
import {
  Globe,
  LayoutGrid,
  Mic,
  Sparkles,
  ArrowRight,
  Heart,
} from "lucide-react";

const items = [
  { icon: <Globe size={18} />, label: "Pozivnice" },
  { icon: <LayoutGrid size={18} />, label: "QR Pano" },
  { icon: <Mic size={18} />, label: "Audio uspomene" },
  { icon: <Sparkles size={18} />, label: "Premium" },
];

const CTABar: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-[#F5F4DC] relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="bg-white rounded-3xl p-8 sm:p-10 md:p-12 shadow-xl border border-stone-100 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Heart
              size={24}
              className="text-[#AE343F]/30"
              fill="currentColor"
            />
            <Heart size={32} className="text-[#AE343F]" fill="currentColor" />
            <Heart
              size={24}
              className="text-[#AE343F]/30"
              fill="currentColor"
            />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#AE343F] mb-4">
            Spremni da krenete?
          </h2>

          <p className="text-[#8B2833] text-base max-w-xl mx-auto mb-8 leading-relaxed font-medium">
            Sve za Vaše venčanje — pozivnica, potvrde dolaska, QR pano, audio
            uspomene. Bez stresa, bez Excel tabela, bez haosa!
          </p>

          {/* Icon row */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8">
            {items.map((item, i) => (
              <React.Fragment key={item.label}>
                <div className="flex items-center gap-2 text-[#AE343F]/85">
                  <span className="w-9 h-9 rounded-full bg-[#AE343F]/8 flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                {i < items.length - 1 && (
                  <span className="text-[#AE343F]/20 text-lg hidden sm:inline">
                    •
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-3">
            <Link
              href="/napravi-pozivnicu"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#AE343F] text-white text-sm uppercase tracking-widest font-medium hover:bg-[#8B2833] transition-all rounded-full shadow-xl shadow-[#AE343F]/20"
              data-track="cta_click"
              data-track-cta-name="napravi_pozivnicu"
              data-track-cta-location="cta_bar"
            >
              Napravite Vašu pozivnicu
            </Link>
            <Link
              href="/cene"
              className="inline-flex items-center gap-2 text-[#AE343F] text-sm uppercase tracking-widest font-medium hover:underline transition-all"
            >
              Pogledajte sve cene
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABar;
