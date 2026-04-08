import type { Metadata } from "next";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import FormPageWrapper from "./FormPageWrapper";

export const metadata: Metadata = {
  title: "Napravi Website Pozivnicu za Venčanje | Personalizovana Online Pozivnica",
  description:
    "Napravite svoju website pozivnicu za venčanje za 24h. Popunite kratki upitnik — mi biramo temu, font i dizajn. RSVP forma, odbrojavanje i program dana su uključeni.",
  keywords: [
    "website venčana pozivnica",
    "napravi pozivnicu online",
    "online venčana pozivnica",
    "personalizovana pozivnica za venčanje",
    "website pozivnica za svadbu",
    "venčana pozivnica sa RSVP",
    "pozivnica za venčanje srbija",
    "elektronska pozivnica venčanje",
    "custom wedding invitation",
    "vencanje pozivnica online",
  ],
  openGraph: {
    title: "Napravi Website Pozivnicu za Venčanje | HALO Uspomene",
    description:
      "Personalizovana website pozivnica za vaše venčanje — sa RSVP formom, odbrojavanjem i programom dana. Gotova za 24h.",
    type: "website",
  },
  alternates: {
    canonical: "/napravi-pozivnicu",
  },
};

export default function NapraviPozivnicuPage() {
  return (
    <>
      <Header />
      <FormPageWrapper />
      <Footer />
    </>
  );
}
