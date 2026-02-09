import React from "react";
import { Star, MapPin, Package, BadgeCheck } from "lucide-react";
import { testimonials } from "@/data/testimonials";

const Testimonials: React.FC = () => {
  return (
    <section
      id="utisci"
      className="py-16 sm:py-24 md:py-32 bg-[#faf9f6] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#AE343F]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
            Utisci naših parova
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
            Glasovi koji govore za nas
          </h2>
          <p className="text-lg text-[#232323]/50 max-w-2xl mx-auto">
            Više od 40 parova u Srbiji već čuva audio uspomene sa svog venčanja.
            Evo šta kažu o svom iskustvu sa HALO Uspomene.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-100 hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              {/* Header: Avatar + Info */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-[#AE343F]/10 rounded-2xl flex items-center justify-center text-[#AE343F] font-bold text-sm shrink-0">
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-semibold text-[#232323] truncate">
                      {t.coupleName}
                    </h3>
                    <BadgeCheck
                      size={16}
                      className="text-[#AE343F] shrink-0"
                    />
                  </div>
                  <p className="text-sm text-[#232323]/40">{t.date}</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-[#d4af37] fill-[#d4af37]"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#232323]/70 leading-relaxed flex-1 mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f6] rounded-full text-xs font-medium text-[#232323]/60">
                  <MapPin size={12} />
                  {t.city}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f6] rounded-full text-xs font-medium text-[#232323]/60">
                  <Package size={12} />
                  {t.packageType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
