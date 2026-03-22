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

export const testimonials: Testimonial[] = [
  {
    id: 1,
    initials: "JM",
    coupleName: "Jelena & Marko",
    city: "Novi Sad",
    date: "Septembar 2025",
    rating: 5,
    service: "Pozivnica + Retro telefon",
    quote:
      "Website pozivnica je bila impresivna i dosta gostiju je pohvalilo dizajn, mi smo imali jasnu listu potvrđenih gostiju. Retro telefon je bio hit na svadbi — svi su hteli da ostave poruku!",
  },
  {
    id: 2,
    initials: "SN",
    coupleName: "Sara & Nikola",
    city: "Novi Sad",
    date: "Septembar 2025",
    rating: 5,
    service: "Pozivnica + Audio knjiga",
    quote:
      "Od kontaktiranja do slanja snimaka sve je bilo na profesionalnom nivou. Pozivnica sa formom za potvrdu nam je uštedela sate telefonskih poziva gostiju.",
  },
  {
    id: 3,
    initials: "MA",
    coupleName: "Marina & Aleksandar",
    city: "Kragujevac",
    date: "Oktobar 2025",
    rating: 5,
    service: "Retro telefon — Essential",
    quote:
      "Jednostavno a prelepo. Telefon je stigao dan ranije, uputstvo je bilo jasno, snimci kvalitetni! Preporučujemo svima koji žele nešto posebno na venčanju.",
  },
];
