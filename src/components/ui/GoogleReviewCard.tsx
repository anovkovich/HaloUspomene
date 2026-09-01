import React from "react";
import { Star } from "lucide-react";
import type { GoogleReview } from "@/lib/google-reviews";
import { cyrillicToLatin } from "@/lib/serbian-script";

/**
 * Jedna Google recenzija.
 *
 * Koriste je početna (`landing/Testimonials`) i gradske stranice, pa markup
 * stoji ovde umesto dvaput.
 *
 * Tekst se prikazuje ceo: bez skraćivanja, bez lektorisanja i bez prevoda —
 * potpisan je tuđim imenom. Jedina intervencija je **preslovljavanje ćirilice
 * u latinicu**, jer je sajt latinični pa bi jedna ćirilična kartica među
 * latiničnim izgledala kao greška. To nije prevod: iste reči, isti red, samo
 * drugo pismo, i smer ćirilica→latinica je jednoznačan. Original ostaje
 * netaknut u bazi i na Google-u, na koji svaka sekcija vodi.
 *
 * Ime autora i naznaka da je izvor Google nisu ukras nego atribucija.
 */

const MESECI = [
  "januar",
  "februar",
  "mart",
  "april",
  "maj",
  "jun",
  "jul",
  "avgust",
  "septembar",
  "oktobar",
  "novembar",
  "decembar",
];

function formatDatum(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime()) || d.getFullYear() < 2000) return "";
  return `${MESECI[d.getMonth()]} ${d.getFullYear()}.`;
}

function inicijali(ime: string): string {
  return ime
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((deo) => deo[0]?.toUpperCase() ?? "")
    .join("");
}

const GoogleReviewCard: React.FC<{ review: GoogleReview }> = ({ review }) => {
  const datum = formatDatum(review.published_at);
  const tekst = cyrillicToLatin(review.text);
  const ime = cyrillicToLatin(review.author_name);

  // Razmak između kartica namerno nije ovde nego na kontejneru: početna ih
  // slaže u fiksne flex kolone (gap), gradske stranice u CSS `columns`.
  return (
    <figure className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-100 flex flex-col">
      <div
        className="flex gap-1 mb-3"
        aria-label={`Ocena ${review.rating} od 5`}
      >
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className="text-[#d4af37] fill-[#d4af37]"
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Ocene bez komentara dobijaju istu karticu, ali bez navodnika —
          navodnici oko ničega izgledaju kao greška u učitavanju. */}
      {tekst ? (
        <blockquote className="text-[#232323]/70 leading-relaxed mb-5 italic flex-1">
          &ldquo;{tekst}&rdquo;
        </blockquote>
      ) : (
        <p className="text-[#232323]/35 leading-relaxed mb-5 flex-1">
          &mdash; bez komentara
        </p>
      )}

      <figcaption className="flex items-center gap-3">
        <div
          className="w-10 h-10 bg-[#AE343F]/10 rounded-xl flex items-center justify-center text-[#AE343F] font-bold text-xs shrink-0"
          aria-hidden="true"
        >
          {inicijali(ime)}
        </div>
        <div className="min-w-0">
          <p className="font-serif font-semibold text-[#232323] text-sm truncate">
            {ime}
          </p>
          <p className="text-xs text-[#232323]/40">
            {datum ? `${datum} · ` : ""}recenzija sa Google-a
          </p>
        </div>
      </figcaption>
    </figure>
  );
};

export default GoogleReviewCard;
