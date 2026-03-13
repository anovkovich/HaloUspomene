import React from "react";
import Link from "next/link";
import Hero from "../components/landing/Hero";
import Concept from "../components/landing/Concept";
import HowItWorks from "../components/landing/HowItWorks";
import Packages from "../components/landing/Packages";
import Testimonials from "../components/landing/Testimonials";
import FAQ from "../components/landing/FAQ";
import ContactForm from "../components/landing/ContactForm";
import Footer from "@/components/layout/footer/Footer";
import { Header } from "@/components/layout";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import { pricing, formatPrice } from "@/data/pricing";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Concept />
        <Packages />
        <Testimonials />
        <FAQ />

        <section
          id="kontakt"
          className="py-16 sm:py-20 md:py-24 bg-[#232323] text-[#F5F4DC] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-[#AE343F]/10 rounded-full blur-2xl sm:blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-[#AE343F]/5 rounded-full blur-2xl sm:blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mb-6">
                Kada je Vaše Venčanje?
              </h2>
              <p className="text-lg text-[#F5F4DC]/60 max-w-2xl mx-auto">
                Svaki mesec radimo sa ograničenim brojem događaja kako bismo
                svakom posvetili punu pažnju. Javite nam se na vreme — a mi ćemo
                Vam omogućiti da Vaš događaj bude jedinstven i nezaboravan.
              </p>
            </div>

            <ContactForm />
          </div>
        </section>

        {/* Wedding Invitation Promo Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <div className="bg-white rounded-3xl p-8 sm:p-10 md:p-12 shadow-xl border border-stone-100 text-center">
              {/* Hearts decoration */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <Heart
                  size={24}
                  className="text-[#AE343F]/30"
                  fill="currentColor"
                />
                <Heart
                  size={32}
                  className="text-[#AE343F]"
                  fill="currentColor"
                />
                <Heart
                  size={24}
                  className="text-[#AE343F]/30"
                  fill="currentColor"
                />
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#AE343F] mb-4">
                Digitalne Pozivnice
              </h2>

              <p className="text-[#8B2833] text-base max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                Zaboravite na klasične pozivnice — naša digitalna rešenja
                omogućavaju vam da ostavite trajan utisak. Gosti mogu lako
                potvrditi dolazak, saznati sve detalje, brzo i lako.
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {[
                  {
                    title: "🎨 Personalizovan dizajn",
                    desc: "Odaberite temu, boju i font po želji",
                  },
                  {
                    title: "📝 RSVP forma",
                    desc: "Pratite potvrde za dolazak gostiju",
                  },
                  {
                    title: "⏱️ Odbrojavanje",
                    desc: "Interaktivni brojač do vašeg velikog dana",
                  },
                  {
                    title: "🗺️ Google mapa",
                    desc: "Pregled lokacija i vreme svečanog dana",
                  },
                  {
                    title: "🔗 Jedan link",
                    desc: "Sve informacije na jednoj web stranici",
                  },
                  {
                    title: "📱 Mobile first",
                    desc: "Savršeno izgleda na svim uređajima",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="p-5 bg-[#AE343F]/5 border border-[#AE343F]/15 rounded-2xl"
                  >
                    <p className="font-semibold text-[#AE343F] mb-1">
                      {feature.title}
                    </p>
                    <p className="text-sm text-[#8B2833]">{feature.desc}</p>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                href="/napravi-pozivnicu"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#AE343F] text-white text-sm uppercase tracking-widest font-medium hover:bg-[#8B2833] transition-all rounded-full group"
                data-track="cta_click"
                data-track-cta-name="pozivnica_cta"
                data-track-cta-location="promo_section"
              >
                Zatražite Vašu Pozivnicu
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>

              {/* Pricing & Discount banner */}
              <div className="mt-10 space-y-4">
                <div className="p-5 bg-[#AE343F] text-white rounded-2xl text-center">
                  <p className="text-sm opacity-90 mb-1">Redovna cena svega:</p>
                  <p className="text-3xl font-bold">{formatPrice(pricing.addons.find(a => a.id === "digitalna_pozivnica")!.price)}</p>
                  <p className="text-sm opacity-75 mt-2">
                    Kompletna digitalna pozivnica sa svim funkcijama
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-[#AE343F]/10 via-[#AE343F]/5 to-[#AE343F]/10 rounded-2xl border border-[#AE343F]/20">
                  <p className="text-[#AE343F] font-semibold">
                    <span className="text-lg">-30%</span> popusta uz Audio
                    Knjigu Uspomena → {formatPrice(pricing.discounts.bundlePozivnica.discountedPrice)}
                  </p>
                  <p className="text-[#8B2833] text-sm mt-1">
                    Audio Retro Telefon + Digitalna Pozivnica = Nerocenljiva
                    vrednost
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Hidden Content - Keyword optimization */}
        <section className="sr-only">
          <h2>Dodatne Usluge - Audio Uspomene i Digitalne Pozivnice</h2>
          <p>
            HALO Uspomene nudi dva komplementarna servisa za vaše venčanje:
            digitalne pozivnice sa RSVP formom i audio uspomene putem retro
            telefona. Kreirajte personalizovane web pozivnice (e-pozivnice) sa
            interaktivnim mogućnostima ili iznajmite telefon uspomena za
            glasovne poruke gostiju. Naš telefon uspomena kombinuje klasičan
            retro telefon sa modernom tehnologijom, omogućavajući gostima da
            ostave audio poruke koje će biti trajne uspomene sa vaše svadbe.
            Audio guest book servis dostupan je sa profesionalnom montažom,
            dostavom u Beograd, Novi Sad, Niš, Kragujevac i sve ostale gradove u
            Srbiji. Odaberite između audio uspomene putem telefona, digitalne
            pozivnice sa odbrojavanje, ili kombinovane pakete koji uključuju i
            web pozivnice i audio guest book.
          </p>
          <p>
            Naše digitalne pozivnice omogućavaju vam da kreirate jedinstvene
            online pozivnice sa kustomnim dizajnom, RSVP praćenjem, mapom,
            odbrojavanje, i galerijom fotografija. Web invitations sa svim
            funkcijama za samo 5.000 dinara. Dodatne opcije: audio uspomene
            (retro telefon za poruke), videonos, i interaktivne osobine.
          </p>
          <p>
            Audio guest book (audio knjiga uspomena, audio knjiga utisaka, audio
            spomenar) je originalan poklon za mladence koji omogućava gostima da
            snime poruke na vintage telefonu. Retro telefon sa rotirajućim
            brojčanikom postaje ključna dekoracija na venčanju dok funkcioniše
            kao uređaj za snimanje glasovnih poruka. Svi audio snimci se čuvaju
            u digitalnom formatu kao neprocenjive uspomene sa vašeg velikog
            dana.
          </p>
          <p>
            Specijalni paketi: kombinovana usluga digitalne pozivnice + audio
            guest book sa 30% popusta. Zaboravite na klasične pozivnice —
            moderni digitalni i audio servisi za nezaboravne venčanju. Dostava i
            profesionalna montaža u svim večim gradovima: Beograd, Novi Sad,
            Niš, Kragujevac, Subotica, Čačak, Smederevo, i drugi.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
