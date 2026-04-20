import type { Metadata } from "next";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import PunoletstvoQuestionnaireForm from "./PunoletstvoQuestionnaireForm";

export const metadata: Metadata = {
  title: "Napravi Pozivnicu za Punoletstvo | Digitalna 18. Rođendan Pozivnica",
  description:
    "Napravite elegantnu digitalnu pozivnicu za 18. rođendan — klasičan stil sa script fontom, RSVP formom, mapom i odbrojavanjem. Gotovo za 24h.",
  keywords: [
    "pozivnica za punoletstvo",
    "pozivnica za 18 rođendan",
    "digitalna pozivnica punoletstvo",
    "online pozivnica 18 rođendan",
    "elegantna pozivnica za punoletstvo",
    "website pozivnica 18 rođendan",
    "pozivnica za osamnaesti rođendan",
  ],
  openGraph: {
    title: "Napravi Pozivnicu za Punoletstvo | HALO Uspomene",
    description:
      "Elegantna digitalna pozivnica za 18. rođendan — klasičan stil sa RSVP formom, mapom i odbrojavanjem. Gotova za 24h.",
    type: "website",
  },
  alternates: {
    canonical: "/napravi-punoletstvo",
  },
};

export default function NapraviPunoletstvoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-20 bg-gradient-to-b from-[#fffdf5] to-[#faf8ef]">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#AE343F] mb-5">
              Pozivnica za punoletstvo
            </h1>
            <p className="text-[#7A242C] text-lg max-w-xl mx-auto">
              Popunite upitnik u 4 koraka — klasičan dizajn sa elegantnim script
              fontom, RSVP formom i odbrojavanjem. Gotova za 24h.
            </p>
          </div>

          <PunoletstvoQuestionnaireForm />
        </div>

        {/* Hidden SEO content */}
        <div className="sr-only" aria-hidden="true">
          <h2>Digitalna pozivnica za punoletstvo (18. rođendan)</h2>
          <p>
            HALO Uspomene izrađuje elegantne digitalne pozivnice za punoletstvo
            u Srbiji — u klasičnom stilu svadbenih pozivnica, sa script fontom i
            svečanim bojama (bordo i zlatna ili teget i zlatna). Usluga
            obuhvata RSVP formu, odbrojavanje do proslave i Google mapu
            lokacije.
          </p>
          <h3>Kako funkcioniše izrada pozivnice za punoletstvo?</h3>
          <p>
            Popunite kratki upitnik u 4 koraka: unesite ime i prezime
            slavljenika, datum i lokaciju proslave, odaberite boje (bela — zlatna
            — bordo za devojke ili bela — zlatna — teget za momke) i script font.
            Mi zatim za 24 sata pravimo vašu personalizovanu digitalnu pozivnicu
            i šaljemo vam link koji možete podeliti sa gostima putem WhatsApp-a,
            Vibera ili e-maila.
          </p>
          <h3>Šta je uključeno u pozivnicu za punoletstvo?</h3>
          <ul>
            <li>Klasičan dizajn u odabranoj kombinaciji boja</li>
            <li>Elegantni script fontovi — latinični i ćirilični</li>
            <li>Animirani omot pozivnice (classic envelope)</li>
            <li>RSVP forma za potvrdu dolaska gostiju</li>
            <li>Odbrojavanje do dana proslave</li>
            <li>Lokacija na Google Maps</li>
            <li>Optimizovano za mobilne uređaje i desktop</li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
