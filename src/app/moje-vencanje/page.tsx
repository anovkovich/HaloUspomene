import type { Metadata } from "next";
import MojeVencanjeClient from "./MojeVencanjeClient";

export const metadata: Metadata = {
  title: "Moje Venčanje — Planer za Organizaciju Venčanja",
  description:
    "Organizujte venčanje na jednom mestu: checklista zadataka, praćenje budžeta, katalog vendora i audio knjiga uspomena.",
  keywords: [
    "organizacija venčanja",
    "planer za venčanje",
    "checklista za venčanje",
    "budžet za venčanje",
    "sale za venčanje",
    "bendovi za svadbu",
    "fotograf za venčanje",
    "dekoracija venčanja",
    "svadbeni vendori Srbija",
    "torta za venčanje",
  ],
  openGraph: {
    title: "Moje Venčanje — Planer za Organizaciju Venčanja",
    description:
      "Checklista, budžet, katalog vendora i audio knjiga uspomena — sve za organizaciju vašeg venčanja na jednom mestu.",
  },
  // Ovo je ulaz u aplikaciju (prijava); sam portal je iza autentikacije i
  // pretraživač ga nikada ne vidi. GSC za 180 dana: 50 prikaza, 2 klika i
  // NIJEDAN upit koji prelazi prag — dakle za pretragu ne donosi ništa, a
  // ključnim rečima („planer za venčanje", „checklista za venčanje") otima
  // upite stranici `/planiranje-vencanja`, koja za njih već stoji tek na 18.
  // Zato: ne indeksirati, ali pratiti linkove. Uklonjena je i iz sitemap-a.
  robots: { index: false, follow: true },
  alternates: { canonical: "/moje-vencanje" },
};

export default function MojeVencanjePage() {
  return <MojeVencanjeClient />;
}
