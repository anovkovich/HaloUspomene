export interface Testimonial {
  id: number;
  initials: string;
  coupleName: string;
  city: string;
  date: string;
  rating: number;
  packageType: "Essential" | "Full Service";
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
    packageType: "Full Service",
    quote:
      "Govornica je izgledala fantastično u našem restoranu. Gosti su bili oduševljeni — čak i oni koji nisu znali šta je audio guest book. Dobili smo preko 80 poruka!",
  },
  {
    id: 2,
    initials: "SN",
    coupleName: "Sara & Nikola",
    city: "Novi Sad",
    date: "Septembar 2025",
    rating: 5,
    packageType: "Full Service",
    quote:
      "Od kontaktiranja do slanja snimaka sve je bilo na profesionalnom nivou. Personalizovana poruka dobrodošlice je oduševila goste. Vredi para!",
  },
  {
    id: 3,
    initials: "MA",
    coupleName: "Marina & Aleksandar",
    city: "Kragujevac",
    date: "Oktobar 2025",
    rating: 5,
    packageType: "Essential",
    quote:
      "Jednostavno a prelepo. Telefon je stigao dan ranije, uputstvo je bilo jasno, snimci kvalitetni! Preporučujemo svima koji žele nešto posebno na venčanju.",
  },
];
