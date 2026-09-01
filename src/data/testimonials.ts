/**
 * Google Business Profile — linkovi i rezervni brojevi.
 *
 * Same recenzije više ne žive ovde. Dovlači ih `scripts/sync-google-reviews.mjs`
 * jednom mesečno u kolekciju `google_reviews`, a sajt ih čita preko
 * `src/lib/google-reviews.ts`. Ovde ostaje samo ono što mora biti statično:
 * `layout.tsx` koristi `profileUrl` u `sameAs` JSON-LD-u, gde se ne može čekati
 * asinhroni upit ka bazi.
 *
 * Ranija odluka „ne prepisujemo recenzije, samo linkujemo na Google" pala je
 * kada se ispostavilo da profil, dok je neverifikovan, nije siguran kanal —
 * link vodi na stranicu koju Google može da skloni. Recenzije se sada
 * prikazuju i kod nas, doslovno i sa atribucijom, a link i dalje stoji za
 * proveru.
 *
 * ─── NIKAKAV `AggregateRating` NI `Review` MARKUP, NIGDE ────────────────────
 * Ocenu koju biznis sam objavljuje o sebi Google tretira kao self-serving i ne
 * prikazuje je kao zvezdice u rezultatima — dakle ni u najboljem slučaju ne
 * donosi ništa. Nepotkrepljena tvrdnja u markup-u je uz to prekršaj smernica i
 * rizik od ručne kazne, koja gasi rich results za CEO sajt.
 *
 * Pravilo važi i za proizvodne stranice, ne samo za ovaj fajl. Do 2026-08-17
 * pet njih je emitovalo izmišljene ocene u `Product`/`SoftwareApplication`
 * šemama — `/telefon-uspomena`, `/pozivnice` i `/planiranje-vencanja` po „5,0
 * od 3 recenzije", `/raspored-sedenja` i `/qr-pano-dobrodoslice` po „5,0 od 20
 * recenzija" — nijedan broj nije odgovarao ničemu. Uklonjeno; sve pet i dalje
 * imaju `offers`, pa su šeme ostale validne. Ne vraćati, ni sa „pravim"
 * brojevima: 16 recenzija sa Google profila govori o biznisu u celini i ne
 * može se pripisati pojedinačnom proizvodu.
 * ────────────────────────────────────────────────────────────────────────────
 */

/**
 * Rezervne vrednosti — koriste se dok prvi sync ne popuni bazu, i ako upit ka
 * bazi padne. Ažurirati kad se broj na profilu osetnije promeni.
 */
export const googleReviews = {
  ratingValue: 5.0,
  reviewCount: 16,
  /** Stabilan CID link — otporniji na promene od maps.app.goo.gl skraćenice. */
  profileUrl: "https://www.google.com/maps?cid=12090923469823668258",
  /** Forma za ostavljanje recenzije (isti link koji koristi /recenzija). */
  writeReviewUrl: "https://g.page/r/CSLwRdnVlsunEAE/review",
};
