import React from "react";
import { Star, ExternalLink } from "lucide-react";
import { googleReviews, testimonials } from "@/data/testimonials";

/**
 * Sekcija sa utiscima.
 *
 * Ne prikazuje recenzije prepisane na sajt nego vodi na Google Business Profile,
 * gde su ih ostavili stvarni parovi. Recenzija na tuđoj platformi, koju mi ne
 * možemo da uredimo, vredi znatno više — i posetiocu i pretraživaču — od citata
 * na sopstvenom sajtu.
 *
 * Namerno NEMA dugmeta za ostavljanje recenzije: javni poziv bi pozvao i
 * konkurenciju da obori ocenu. Link za ostavljanje recenzije šalje se ciljano
 * zadovoljnim parovima, preko /recenzija stranice.
 *
 * Ako `testimonials` ikad bude popunjen stvarnim recenzijama, kartice se
 * prikazuju ispod ovog bloka; do tada blok stoji sam.
 */
const Testimonials: React.FC = () => {
  const { ratingValue, reviewCount, profileUrl } = googleReviews;

  return (
    <section
      id="utisci"
      className="pt-8 pb-16 sm:pt-10 sm:pb-24 md:pt-12 md:pb-32 bg-[#F5F4DC] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
            Utisci naših parova
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
            Glasovi koji govore za nas
          </h2>
          <p className="text-lg text-[#232323]/50 max-w-2xl mx-auto">
            Recenzije ne prepisujemo na svoj sajt — pročitajte ih tamo gde su ih
            parovi zaista ostavili, na našem Google profilu.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-stone-100 shadow-sm p-8 sm:p-10 text-center">
          <div
            className="flex items-center justify-center gap-1 mb-4"
            aria-hidden="true"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={26}
                className="text-[#d4af37] fill-[#d4af37]"
              />
            ))}
          </div>

          <p className="font-serif text-5xl sm:text-6xl text-[#232323] mb-2">
            {ratingValue.toFixed(1)}
          </p>
          <p className="text-[#232323]/55 mb-8">
            Prosečna ocena na osnovu {reviewCount} recenzija na Google-u
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] rounded-full px-8 border-none"
              data-track="cta_click"
              data-track-cta-name="google_recenzije"
              data-track-cta-location="utisci"
            >
              Pročitaj recenzije na Google-u
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* Prikazuje se tek kada u testimonials.ts uđu stvarne recenzije. */}
        {testimonials.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-100 flex flex-col"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-[#d4af37] fill-[#d4af37]"
                    />
                  ))}
                </div>
                <p className="text-[#232323]/70 leading-relaxed mb-4 italic flex-1">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#AE343F]/10 rounded-xl flex items-center justify-center text-[#AE343F] font-bold text-xs">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-serif font-semibold text-[#232323] text-sm">
                      {t.coupleName}
                    </p>
                    <p className="text-xs text-[#232323]/40">
                      {t.city} · {t.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
