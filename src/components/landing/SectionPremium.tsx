import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Wand2, Palette, Film } from "lucide-react";
import {
  formatPrice,
  getPremiumPrice,
  getPremiumRegularPrice,
  isPremiumPromoActive,
} from "@/data/pricing";

const features = [
  {
    icon: <Palette size={18} />,
    title: "Luksuzne teme",
    desc: "Animirana dobrodošlica, parallax efekat — pozivnica o kojoj će svi pričati!",
  },
  {
    icon: <Film size={18} />,
    title: "Cinematic osećaj",
    desc: "Vintage automobili & pozadina sa detaljima vašeg grada — sve u kadru pozivnice.",
  },
  {
    icon: <Wand2 size={18} />,
    title: "AI ilustracija para",
    desc: "Generišemo vašu personalizovanu ilustraciju koja postaje centar papirnog sveta.",
  },
];

const SectionPremium: React.FC = () => {
  const price = getPremiumPrice();
  const regularPrice = getPremiumRegularPrice();
  const promoActive = isPremiumPromoActive();

  return (
    <section
      id="premium"
      className="relative py-20 sm:py-24 md:py-28 bg-[#1a1a1a] overflow-hidden"
    >
      {/* Background watercolor image — subtle */}
      <div className="absolute inset-0 opacity-15">
        <Image
          src="/images/premium/watercolor-invitation/backgrounds/Saint-Sava-Temple.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/95 via-[#1a1a1a]/85 to-[#1a1a1a]/95" />

      {/* Glow accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#AE343F]/15 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-[#F5F4DC] leading-tight mb-5">
              Za one koji žele nešto{" "}
              <span className="italic text-[#d4af37]">wow</span>.
            </h2>
            <p className="text-base sm:text-lg text-[#F5F4DC]/65 leading-relaxed max-w-2xl mx-auto">
              Premium Pozivnica koja izgleda filmski. Prelepe ilustracije,
              parallax efekat, animirana moderna koverta, vintage automobili i
              detalji inspirisani vašim gradom.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5 mb-10 sm:mb-12">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-[#d4af37]/40 hover:bg-white/[0.06] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <p className="text-sm sm:text-base font-bold text-[#F5F4DC] mb-1.5">
                  {f.title}
                </p>
                <p className="text-xs sm:text-sm text-[#F5F4DC]/55 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Pricing + CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-7">
            <div className="flex items-baseline gap-2">
              {promoActive && (
                <span className="text-base text-[#F5F4DC]/30 line-through">
                  {formatPrice(regularPrice)}
                </span>
              )}
              <span className="text-3xl sm:text-4xl font-serif font-bold text-[#d4af37]">
                {formatPrice(price)}
              </span>
              {promoActive && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#d4af37] text-[#232323] px-2 py-0.5 rounded">
                  Promo
                </span>
              )}
            </div>

            <Link
              href="/cene?premium=1"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#d4af37] hover:bg-[#b8962e] text-[#232323] text-sm uppercase tracking-widest font-bold rounded-full transition-all shadow-2xl shadow-[#d4af37]/30"
              data-track="cta_click"
              data-track-cta-name="premium_saznaj"
              data-track-cta-location="section_premium"
            >
              Saznajte više o Premium-u
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionPremium;
