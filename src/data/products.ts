import {
  Car,
  CarFront,
  ClipboardList,
  Gavel,
  Globe,
  Images,
  LayoutDashboard,
  Mic,
  QrCode,
  Sparkles,
  Store,
  Tent,
  type LucideIcon,
} from "lucide-react";
import {
  formatPrice,
  getAudioPrice,
  getPremiumPrice,
  getStandaloneSeatingPrice,
  pricing,
} from "./pricing";

/**
 * Jedan izvor istine za spisak proizvoda.
 *
 * Isti spisak je do sada bio ručno prepisan na tri mesta — mreža na početnoj,
 * padajuće liste u zaglavlju i kolona u podnožju — pa se svaki novi proizvod
 * dodavao tri puta, a po pravilu se negde zaboravio.
 *
 * Cene su funkcije, ne stringovi, iz dva razloga: promo cene se menjaju u
 * `pricing.json` (npr. `standalone_seating.promoActive`), a modul se učitava
 * jednom pri pokretanju procesa — vrednost izračunata u trenutku učitavanja
 * ostala bi zamrznuta do sledećeg deploy-a.
 */
export type Product = {
  id: string;
  name: string;
  /** Jedna rečenica — koristi se i u mreži i kao opis u padajućoj listi. */
  blurb: string;
  href: string;
  price?: () => string;
  priceNote?: () => string;
  icon: LucideIcon;
  badge?: "Novo" | "Najčešće u paketu";
};

/** Naši proizvodi — sve što sami pravimo i naplaćujemo. */
export const CORE_PRODUCTS: Product[] = [
  {
    id: "pozivnica",
    name: "Standardna pozivnica",
    blurb:
      "Animirana koverta, odbrojavanje, svi detalji, mapa i potvrde dolaska",
    href: "/izrada-pozivnica-online",
    price: () => formatPrice(pricing.pozivnica.website.price),
    icon: Globe,
    badge: "Najčešće u paketu",
  },
  {
    id: "premium",
    name: "Premium pozivnica",
    blurb:
      "Moderna animirana koverta i luksuzni detalji koji oduzimaju dah",
    href: "/cene?premium=1",
    price: () => formatPrice(getPremiumPrice()),
    icon: Sparkles,
  },
  {
    id: "raspored",
    name: "Raspored sedenja",
    blurb:
      "Rasporedite stolove prema šemi sale i prevucite goste bez haosa",
    href: "/raspored-sedenja",
    price: () => formatPrice(getStandaloneSeatingPrice()),
    priceNote: () =>
      `uz pozivnicu ${formatPrice(pricing.pozivnica.raspored.price)}`,
    icon: LayoutDashboard,
  },
  {
    id: "qr-pano",
    name: "QR pano dobrodošlice",
    blurb:
      "Bez gužve i spiskova: gost skenira, nađe mesto i vidi meni hrane",
    href: "/qr-pano-dobrodoslice",
    priceNote: () => "uz raspored sedenja",
    icon: QrCode,
  },
  {
    id: "qr-galerija",
    name: "QR galerija slika",
    blurb:
      "Sačuvajte kadrove koje su gosti uhvatili — bez instaliranja aplikacije",
    href: "/qr-galerija-slika-sa-vencanja",
    price: () => formatPrice(pricing.pozivnica.galerija.price),
    icon: Images,
    badge: "Novo",
  },
  {
    id: "audio",
    name: "Audio knjiga utisaka",
    blurb:
      "Glasovne čestitke koje godinama vraćaju emociju i atmosferu tog dana",
    href: "/telefon-uspomena",
    price: () => `od ${formatPrice(pricing.pozivnica.audio.price)}`,
    priceNote: () => `retro telefon ${formatPrice(getAudioPrice())}`,
    icon: Mic,
  },
  {
    id: "planer",
    name: "Moje Venčanje",
    blurb:
      "Potvrde dolaska, checklista, planer budžeta i još mnogo toga",
    href: "/planiranje-vencanja",
    priceNote: () => "više o planeru",
    icon: ClipboardList,
  },
  {
    // „Vendor" je anglicizam koji par u Srbiji ne koristi — zato nabrajanje
    // odmah kaže šta se iza reči krije, a broj ostaje kao dokaz.
    id: "vendori",
    name: "Provereni saradnici",
    blurb: "Preko 90 fotografa, bendova, sala i drugih usluga",
    href: "/vendori",
    priceNote: () => "pogledajte listu",
    icon: Store,
  },
];

/**
 * Usluge koje posredujemo. Prikazuju se vizuelno lakše od naših, da razlika
 * bude očigledna bez rečenice koja je objašnjava.
 *
 * Partner se NIKAD ne imenuje ni ovde ni na javnoj stranici — v. „Rental
 * Fleets — White-Label" u CLAUDE.md.
 */
export const PARTNER_SERVICES: Product[] = [
  {
    id: "oldtajmeri",
    name: "Oldtajmeri",
    blurb: "Retro automobili sa vozačem za mladence",
    href: "/iznajmljivanje-oldtajmera-za-vencanje",
    icon: Car,
  },
  {
    id: "automobili",
    name: "Luksuzni automobili",
    blurb: "Mercedes flota sa profesionalnim šoferom",
    href: "/iznajmljivanje-automobila-za-vencanje",
    icon: CarFront,
  },
  {
    id: "oprema",
    name: "Paviljoni i oprema",
    blurb: "Paviljoni i barski stolovi za doček gostiju",
    href: "/iznajmljivanje-opreme-za-vencanje",
    icon: Tent,
  },
  {
    id: "maticar",
    name: "Lažni matičar",
    blurb: "Simbolična ceremonija koju vodi glumac",
    href: "/lazni-maticar",
    icon: Gavel,
  },
];

/** Rođendanske pozivnice — jedan red ispod mreže, ne cela sekcija. */
export const BIRTHDAY_LINKS = [
  { name: "Dečiji rođendan", href: "/napravi-deciju-pozivnicu" },
  { name: "Prvi rođendan", href: "/pozivnica-za-prvi-rodjendan" },
  { name: "Punoletstvo", href: "/napravi-punoletstvo" },
];

/** Padajuća lista „Raspored i QR" u zaglavlju. */
export const NAV_SEATING_IDS = ["raspored", "qr-pano", "qr-galerija"];

/** Padajuća lista „Iznajmljivanje" — retro telefon plus posredovane usluge. */
export const NAV_RENTAL_IDS = [
  "audio",
  "oprema",
  "oldtajmeri",
  "automobili",
  "maticar",
];

const ALL_PRODUCTS = [...CORE_PRODUCTS, ...PARTNER_SERVICES];

/** Podskup proizvoda po `id`, u zadatom redosledu. Baca grešku na nepoznat
 *  `id` — tiho izostavljena stavka u navigaciji se ne primeti mesecima. */
export function productsByIds(ids: string[]): Product[] {
  return ids.map((id) => {
    const found = ALL_PRODUCTS.find((p) => p.id === id);
    if (!found) throw new Error(`Nepoznat proizvod: ${id}`);
    return found;
  });
}
