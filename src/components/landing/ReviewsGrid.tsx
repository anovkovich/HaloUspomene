"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { GoogleReview } from "@/lib/google-reviews";
import GoogleReviewCard from "@/components/ui/GoogleReviewCard";

/**
 * Recenzije u kolonama, sa „Prikaži još".
 *
 * ── ZAŠTO NE CSS `columns` ──────────────────────────────────────────────────
 * Prva verzija je koristila `columns-3`, što izgleda isto ali se raspada na
 * klik: `columns` uvek IZBALANSIRA kolone da budu jednake visine, pa dodavanje
 * kartica premesti i one koje su već bile na ekranu. Korisnik klikne „Prikaži
 * još" i ono što je čitao odskoči na drugo mesto.
 *
 * Zato se raspodela računa kod nas, i to POHLEPNO: svaka kartica ide u kolonu
 * koja je do tog trenutka najkraća. Time se dobija oboje —
 *
 * 1. Kolone su približno jednake, kao kod `columns`. Prosto `i % 3` to ne ume:
 *    jedna duga recenzija napravi kolonu dvostruko dužu od ostalih.
 * 2. Raspored je stabilan na klik. Odluka za karticu `i` zavisi isključivo od
 *    kartica pre nje, pa prvih devet dobije iste kolone bez obzira na to da li
 *    renderujemo devet ili šesnaest. Nova kartica pada na dno neke kolone i
 *    ništa iznad se ne pomera.
 *
 * Uzgredna korist: tri najnovije su u gornjem redu sleva nadesno (sve kolone
 * kreću od nule, pa prve tri idu redom), dok su kod `columns` išle jedna ispod
 * druge.
 *
 * ── KAKO OSTAJE RESPONZIVNO BEZ JS-a ────────────────────────────────────────
 * Ispod `lg` omotači kolona dobijaju `display: contents`, pa nestaju iz
 * rasporeda i kartice postaju direktna deca flex kontejnera. Inline `order`
 * (originalni redni broj) ih tamo vraća u tačan hronološki red — jedna kolona,
 * od najnovije. Na `lg` omotači postaju prave kolone. Sve je CSS, pa server i
 * klijent renderuju isto i nema ni treperenja ni hydration greške.
 * ────────────────────────────────────────────────────────────────────────────
 */

const KOLONA = 3;

function padez(n: number): string {
  if (n === 1) return "recenziju";
  return n < 5 ? "recenzije" : "recenzija";
}

/**
 * Gruba procena visine kartice, u proizvoljnim jedinicama.
 *
 * Ne mora da bude tačna — služi samo da se kolone porede međusobno, pa je bitan
 * odnos a ne apsolutna vrednost. Emodži, duge reči i različite širine ekrana je
 * malo pomere, ali razlika od jednog reda ne menja koja je kolona najkraća.
 */
function procenaVisine(review: GoogleReview): number {
  /** Zvezdice, potpis sa avatarom i unutrašnji razmak — isto na svakoj kartici. */
  const OSNOVA = 150;
  const VISINA_REDA = 30;
  /** Otprilike toliko znakova stane u red kurziva u koloni širine ~360px. */
  const ZNAKOVA_U_REDU = 38;

  // Ocene bez komentara nose jednoredni „— bez komentara".
  const duzina = review.text.length || 15;
  return OSNOVA + Math.ceil(duzina / ZNAKOVA_U_REDU) * VISINA_REDA;
}

const ReviewsGrid: React.FC<{
  reviews: GoogleReview[];
  /** Koliko se vidi pre klika. 9 popuni tri kolone bez krnjeg reda. */
  initial?: number;
}> = ({ reviews, initial = 9 }) => {
  const [expanded, setExpanded] = useState(false);

  const preostalo = expanded ? 0 : Math.max(0, reviews.length - initial);

  // Raspoređuju se SVE, ne samo vidljive: višak se sakriva CSS-om (`hidden`),
  // da bi tekst svih recenzija bio u HTML-u. Ranije su neprikazane kartice
  // izostajale iz DOM-a, pa ih pretraživač nije video — Googlebot ne klikće
  // dugmad. Sakriveno je i dalje indeksirano, a posetiocu dostupno na klik.
  //
  // Pošto je raspodela pohlepna i time stabilna na prefiksu, prvih `initial`
  // kartica završi u istim kolonama bilo da računamo devet ili šesnaest — pa
  // se skupljeni prikaz poklapa sa raširenim.
  const kolone: { review: GoogleReview; index: number }[][] = Array.from(
    { length: KOLONA },
    () => []
  );
  const visine = new Array<number>(KOLONA).fill(0);

  reviews.forEach((review, index) => {
    // Stroga nejednakost: kad su sve kolone jednake (prve tri kartice), ostaje
    // prva po redu, pa tri najnovije završe u gornjem redu sleva nadesno.
    let najkraca = 0;
    for (let k = 1; k < KOLONA; k++) {
      if (visine[k] < visine[najkraca]) najkraca = k;
    }
    kolone[najkraca].push({ review, index });
    visine[najkraca] += procenaVisine(review);
  });

  return (
    <div className="mt-12 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
        {kolone.map((kolona, i) => (
          <div
            key={i}
            className="contents lg:flex lg:flex-col lg:flex-1 lg:min-w-0 lg:gap-6"
          >
            {kolona.map(({ review, index }) => (
              // `order` je bitan samo dok je omotač `display: contents`, dakle
              // na uskim ekranima; u koloni je redosled ionako već tačan.
              <div
                key={review.review_id}
                style={{ order: index }}
                className={!expanded && index >= initial ? "hidden" : undefined}
              >
                <GoogleReviewCard review={review} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {preostalo > 0 && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="btn btn-outline border-[#AE343F]/30 text-[#AE343F] hover:bg-[#AE343F] hover:border-[#AE343F] hover:text-[#F5F4DC] rounded-full px-8"
            data-track="cta_click"
            data-track-cta-name="prikazi_jos_recenzija"
            data-track-cta-location="utisci"
          >
            Prikaži još {preostalo} {padez(preostalo)}
            <ChevronDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsGrid;
