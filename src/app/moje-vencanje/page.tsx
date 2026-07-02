import type { Metadata } from "next";
import MojeVencanjeClient from "./MojeVencanjeClient";

export const metadata: Metadata = {
  title: "Moje Venčanje — Besplatan Planer za Organizaciju Venčanja | HALO Uspomene",
  description:
    "Organizujte venčanje na jednom mestu: checklista zadataka, praćenje budžeta, katalog vendora (sale, bendovi, fotografi, torte, dekoracija) i audio knjiga uspomena. Besplatno.",
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
    title: "Moje Venčanje — Besplatan Planer za Organizaciju Venčanja",
    description:
      "Checklista, budžet, katalog vendora i audio knjiga uspomena — sve za organizaciju vašeg venčanja na jednom mestu.",
  },
};

export default function MojeVencanjePage() {
  return <MojeVencanjeClient />;
}
