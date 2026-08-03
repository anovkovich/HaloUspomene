/**
 * Recenzije.
 *
 * Prave recenzije žive na Google Business Profilu, ne kod nas — tamo su ih
 * ostavili stvarni parovi i tamo su proverljive. Zato sajt ne prepisuje tuđi
 * sadržaj nego vodi na izvor.
 *
 * Ranije su ovde stajala tri izmišljena utiska, renderovana u `sr-only` bloku
 * (dakle vidljiva samo crawler-ima) i emitovana kao `Review` + `AggregateRating`
 * strukturirani podaci. Uklonjeno: izmišljene recenzije u schema markup-u su
 * tvrdnja Google-u koja se ne može potkrepiti, a skriveni tekst za robote je
 * zaseban prekršaj smernica.
 *
 * ─── AKO IKAD BUDEMO PRIKAZIVALI RECENZIJE NA SAJTU ─────────────────────────
 * Popuni `testimonials` SAMO stvarnim recenzijama, prepisanim doslovno, sa
 * imenom kako stoji na Google-u. Tip i mesta prikaza (početna, /lokacije/[city])
 * su spremna i sama se popune. Ne vraćaj `AggregateRating` u layout — ocene koje
 * biznis sam prikuplja i objavljuje o sebi Google tretira kao self-serving i ne
 * prikazuje ih kao zvezdice u rezultatima.
 * ────────────────────────────────────────────────────────────────────────────
 */

export interface Testimonial {
  id: number;
  initials: string;
  coupleName: string;
  city: string;
  date: string;
  rating: number;
  service: string;
  quote: string;
}

/** Namerno prazno — v. napomenu iznad. Gradske stranice ovo već tolerišu. */
export const testimonials: Testimonial[] = [];

/**
 * Google Business Profile.
 *
 * `ratingValue` i `reviewCount` su ono što stoji na profilu — ažurirati kad se
 * broj osetnije promeni. Prikazuju se kao običan tekst uz link ka izvoru i
 * NAMERNO nisu u schema markup-u: sami bismo tvrdili sopstvenu ocenu, a zvezdice
 * u rezultatima ionako dolaze iz Google-ovog profila, ne iz našeg markup-a.
 */
export const googleReviews = {
  ratingValue: 5.0,
  reviewCount: 16,
  /** Stabilan CID link — otporniji na promene od maps.app.goo.gl skraćenice. */
  profileUrl: "https://www.google.com/maps?cid=12090923469823668258",
  /** Forma za ostavljanje recenzije (isti link koji koristi /recenzija). */
  writeReviewUrl: "https://g.page/r/CSLwRdnVlsunEAE/review",
};
