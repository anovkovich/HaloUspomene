import type { Metadata } from "next";
import {
  Fredoka,
  Bubblegum_Sans,
  Baloo_2,
  Patrick_Hand,
  Chewy,
} from "next/font/google";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import BirthdayQuestionnaireForm from "./BirthdayQuestionnaireForm";
import PortalLink from "./PortalLink";

const fredoka = Fredoka({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fredoka",
  display: "swap",
});

const bubblegumSans = Bubblegum_Sans({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-bubblegum-sans",
  display: "swap",
});

const baloo2 = Baloo_2({
  subsets: ["latin", "latin-ext"],
  variable: "--font-baloo-2",
  display: "swap",
});

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-patrick-hand",
  display: "swap",
});

const chewy = Chewy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-chewy",
  display: "swap",
});

const fontVars = `${fredoka.variable} ${bubblegumSans.variable} ${baloo2.variable} ${patrickHand.variable} ${chewy.variable}`;

export const metadata: Metadata = {
  title: "Napravi Pozivnicu za Dečiji Rođendan | Digitalna Pozivnica za Proslavu",
  description:
    "Napravite šarenu digitalnu pozivnicu za dečiji rođendan. Izaberite temu za dečaka ili devojčicu, dodajte RSVP formu i podelite sa gostima.",
  keywords: [
    "pozivnica za dečiji rođendan",
    "digitalna pozivnica rođendan",
    "online pozivnica za prvi rođendan",
    "pozivnica za dečiji rođendan online",
    "pozivnica za rođendan deteta",
    "pozivnica za prvi rođendan",
    "dečiji rođendan pozivnica online",
    "šarena pozivnica za rođendan",
    "pozivnica za dečaka rođendan",
    "pozivnica za devojčicu rođendan",
  ],
  openGraph: {
    title: "Napravi Pozivnicu za Dečiji Rođendan | HALO Uspomene",
    description:
      "Šarena digitalna pozivnica za dečiji rođendan — sa RSVP formom, odbrojavanjem i veselim temama. Gotova za 24h.",
    type: "website",
  },
  alternates: {
    canonical: "/napravi-deciju-pozivnicu",
  },
};

export default function NapraviDecijuPozivnicuPage() {
  return (
    <>
      <Header />
      <main className={`min-h-screen pt-28 pb-20 relative transition-colors duration-500 ${fontVars} birthday-form-page`}>
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#FF6B6B] mb-5">
              Napravite pozivnicu za rođendan
            </h1>
            <p className="text-[#E55A5A] text-lg max-w-xl mx-auto">
              Popunite upitnik u 4 koraka — mi ćemo sve ostalo uraditi i Vaša
              pozivnica će biti gotova za 24h
            </p>
            <p className="text-stone-400 text-sm mt-3">
              ili pođite na <PortalLink />
            </p>
          </div>

          <BirthdayQuestionnaireForm />
        </div>

        {/* Hidden SEO content — visible to crawlers, not to users */}
        <div className="sr-only" aria-hidden="true">
          <h2>Digitalna pozivnica za dečiji rođendan</h2>
          <p>
            HALO Uspomene izrađuje šarene digitalne pozivnice za dečije rođendane
            u Srbiji. Naša usluga obuhvata kreiranje vesele online pozivnice sa
            RSVP formom, odbrojavanjem do proslave i detaljima o lokaciji.
          </p>
          <h3>Kako funkcioniše izrada pozivnice za dečiji rođendan?</h3>
          <p>
            Popunite kratki upitnik u 4 koraka: unesite ime deteta, izaberite
            temu za dečaka ili devojčicu, dodajte datum i lokaciju proslave.
            Mi zatim za 24 sata pravimo vašu personalizovanu digitalnu pozivnicu
            i šaljemo vam link koji možete podeliti sa gostima putem WhatsApp-a,
            Vibera ili e-maila.
          </p>
          <h3>Šta je uključeno u pozivnicu za dečiji rođendan?</h3>
          <ul>
            <li>Personalizovani dizajn u odabranoj temi (dečak, devojčica, neutralna)</li>
            <li>Veseli fontovi i šarene ilustracije</li>
            <li>RSVP forma za potvrdu dolaska</li>
            <li>Odbrojavanje do proslave</li>
            <li>Lokacija na Google Maps</li>
            <li>Optimizovano za mobilne uređaje</li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
