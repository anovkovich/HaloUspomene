import React from "react";
import { Star } from "lucide-react";
import { googleReviews } from "@/data/testimonials";
import {
  getGoogleReviews,
  getRatingOnlyGoogleReviews,
  getGoogleReviewsSummary,
  type GoogleReview,
} from "@/lib/google-reviews";
import ReviewsGrid from "./ReviewsGrid";

/**
 * Sekcija sa utiscima.
 *
 * Recenzije su prave, sa našeg Google Business Profila, prepisane doslovno i
 * poređane od najnovije. Atribucija stoji na svakoj kartici („recenzija sa
 * Google-a"); odluka vlasnika je da javnog linka ka profilu nema.
 *
 * Namerno NEMA dugmeta za ostavljanje recenzije: javni poziv bi pozvao i
 * konkurenciju da obori ocenu. Link za ostavljanje šalje se ciljano zadovoljnim
 * parovima, preko /recenzija stranice.
 *
 * Ako baza zakaže, ostaje samo kartica sa ocenom umesto da padne cela početna.
 */

/** Vidljivo pre klika na „Prikaži još"; ostatak je jedan klik daleko. */
const PRIKAZANO = 9;

const Testimonials = async () => {
  let reviews: GoogleReview[] = [];
  let rating = googleReviews.ratingValue;
  let count = googleReviews.reviewCount;

  try {
    // Sve odjednom, pa „Prikaži još" samo otkriva ostatak bez novog upita —
    // reč je o šesnaest kratkih zapisa, ne o listi koju vredi paginirati.
    const [saTekstom, bezTeksta, summary] = await Promise.all([
      getGoogleReviews(),
      getRatingOnlyGoogleReviews(),
      getGoogleReviewsSummary(),
    ]);
    // Ocene bez komentara idu na kraj, a ne po datumu među ostale: nose istu
    // karticu, ali ništa ne govore pa bi razbijale niz onih koje govore.
    reviews = [...saTekstom, ...bezTeksta];
    if (summary) {
      rating = summary.rating;
      count = summary.count;
    }
  } catch {
    // Baza nedostupna — ostaju rezervne vrednosti i prazna lista.
  }

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
            Recenzije su prenete sa našeg Google profila, onako kako su ih
            parovi napisali — od najnovije ka starijima.
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
            {rating.toFixed(1)}
          </p>
          <p className="text-[#232323]/55">
            Prosečna ocena na osnovu {count} recenzija na Google-u
          </p>
        </div>

        {reviews.length > 0 && (
          <ReviewsGrid reviews={reviews} initial={PRIKAZANO} />
        )}
      </div>
    </section>
  );
};

export default Testimonials;
