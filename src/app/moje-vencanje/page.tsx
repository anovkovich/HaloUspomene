import type { Metadata } from "next";
import MojeVencanjeClient from "./MojeVencanjeClient";

export const metadata: Metadata = {
  title: "Moje Venčanje — Planer za Organizaciju | HALO Uspomene",
  description:
    "Besplatan planer za organizaciju venčanja. Checklista za pripremu, praćenje budžeta i sve na jednom mestu.",
  openGraph: {
    title: "Moje Venčanje — Planer za Organizaciju | HALO Uspomene",
    description:
      "Besplatan planer za organizaciju venčanja. Checklista za pripremu, praćenje budžeta i sve na jednom mestu.",
  },
};

export default function MojeVencanjePage() {
  return <MojeVencanjeClient />;
}
