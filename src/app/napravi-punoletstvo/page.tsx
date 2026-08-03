import type { Metadata } from "next";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import PunoletstvoQuestionnaireForm from "./PunoletstvoQuestionnaireForm";
import InvitationClusterLinks from "@/components/seo/InvitationClusterLinks";
import { resolveBypassInfo } from "@/lib/bypass-token";
import { getRodjendanPozivnicaPrice, formatPrice } from "@/data/pricing";

export const metadata: Metadata = {
  title: "Digitalne Pozivnice za 18. Rođendan i Punoletstvo",
  description:
    "Elegantna digitalna pozivnica za 18. rođendan i punoletstvo — potvrde dolaska, odbrojavanje i mapa. Gotova odmah, deli se jednim linkom.",
  keywords: [
    "pozivnica za punoletstvo",
    "pozivnica za 18 rođendan",
    "digitalna pozivnica punoletstvo",
    "online pozivnica 18 rođendan",
    "elegantna pozivnica za punoletstvo",
    "website pozivnica 18 rođendan",
    "pozivnica za osamnaesti rođendan",
    "pozivnica za 18. rođendan online",
    "izrada pozivnice za punoletstvo",
    "napravi pozivnicu za punoletstvo",
  ],
  openGraph: {
    title: "Napravi Pozivnicu za Punoletstvo | HALO Uspomene",
    description:
      "Elegantna digitalna pozivnica za 18. rođendan — klasičan stil sa formom za potvrdu dolaska, mapom i odbrojavanjem. Gotova odmah.",
    type: "website",
  },
  alternates: {
    canonical: "/napravi-punoletstvo",
  },
};

export default async function NapraviPunoletstvoPage({
  searchParams,
}: {
  searchParams: Promise<{ bypass?: string }>;
}) {
  // Foreign-customer bypass link (admin-issued) — skips SMS verification.
  const bypassInfo = await resolveBypassInfo((await searchParams).bypass);
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
              fontom, formom za potvrdu dolaska i odbrojavanjem. Gotova odmah.
            </p>
            <p className="inline-block mt-4 text-xs tracking-widest uppercase text-stone-400 border border-stone-200 rounded-full px-4 py-1.5">
              Cena: <span className="font-semibold text-[#AE343F]">{formatPrice(getRodjendanPozivnicaPrice(true))}</span>
            </p>
          </div>

          <PunoletstvoQuestionnaireForm bypassInfo={bypassInfo} />
        </div>

        {/* Hidden SEO content */}
        <div className="sr-only" aria-hidden="true">
          <h2>Digitalna pozivnica za punoletstvo (18. rođendan)</h2>
          <p>
            HALO Uspomene izrađuje elegantne digitalne pozivnice za punoletstvo
            u Srbiji — u klasičnom stilu svadbenih pozivnica, sa script fontom i
            svečanim bojama (bordo i zlatna ili teget i zlatna). Usluga
            obuhvata formu za potvrdu dolaska, odbrojavanje do proslave i Google mapu
            lokacije.
          </p>
          <h3>Kako funkcioniše izrada pozivnice za punoletstvo?</h3>
          <p>
            Popunite kratki upitnik u 4 koraka: unesite ime i prezime
            slavljenika, datum i lokaciju proslave, odaberite boje (bela — zlatna
            — bordo za devojke ili bela — zlatna — teget za momke) i script font.
            Mi zatim odmah pravimo vašu personalizovanu digitalnu pozivnicu
            i šaljemo vam link koji možete podeliti sa gostima putem WhatsApp-a,
            Vibera ili e-maila.
          </p>
          <h3>Šta je uključeno u pozivnicu za punoletstvo?</h3>
          <ul>
            <li>Klasičan dizajn u odabranoj kombinaciji boja</li>
            <li>Elegantni script fontovi — latinični i ćirilični</li>
            <li>Animirani omot pozivnice (classic envelope)</li>
            <li>Forma za potvrdu dolaska gostiju</li>
            <li>Odbrojavanje do dana proslave</li>
            <li>Lokacija na Google Maps</li>
            <li>Optimizovano za mobilne uređaje i desktop</li>
          </ul>
        </div>
      </main>
      <section className="py-16 sm:py-20 bg-[#faf9f6] border-t border-[#232323]/5">
        <InvitationClusterLinks current="punoletstvo" />
      </section>
      <Footer />
    </>
  );
}
