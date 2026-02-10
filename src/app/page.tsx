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

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Concept />
        <HowItWorks />
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
        <section className="py-16 sm:py-20 bg-gradient-to-b from-[#faf9f6] to-[#f5f0eb] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <div className="bg-white rounded-3xl p-8 sm:p-10 md:p-12 shadow-xl border border-stone-100 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 rounded-full mb-6">
                <Sparkles size={16} className="text-[#d4af37]" />
                <span className="text-sm font-medium text-[#d4af37] uppercase tracking-widest">
                  Novo u ponudi
                </span>
                <Sparkles size={16} className="text-[#d4af37]" />
              </div>

              {/* Hearts decoration */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <Heart
                  size={24}
                  className="text-[#d4af37]/30"
                  fill="currentColor"
                />
                <Heart
                  size={32}
                  className="text-[#d4af37]"
                  fill="currentColor"
                />
                <Heart
                  size={24}
                  className="text-[#d4af37]/30"
                  fill="currentColor"
                />
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1a1a1a] mb-4">
                Digitalne Pozivnice
              </h2>

              <p className="text-stone-500 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                Želite jedinstvenu digitalnu pozivnicu za Vaše venčanje?
                Kreiramo personalizovanu web stranicu sa svim detaljima koju
                možete podeliti sa gostima jednim klikom.
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                {[
                  {
                    title: "Personalizovan dizajn",
                    desc: "U dogovoru sa vama",
                  },
                  {
                    title: "Forma za potvrđivanje",
                    desc: "Pratite potvrde gostiju",
                  },
                  {
                    title: "Jedan link za deljenje",
                    desc: "Sva magija na jednom mestu",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="p-4 bg-[#faf9f6] rounded-2xl"
                  >
                    <p className="font-medium text-[#1a1a1a]">
                      {feature.title}
                    </p>
                    <p className="text-sm text-stone-400">{feature.desc}</p>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                href="/napravi-pozivnicu"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#1a1a1a] text-white text-sm uppercase tracking-widest font-medium hover:bg-[#333] transition-all rounded-full group"
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

              {/* Discount banner */}
              <div className="mt-8 p-4 bg-gradient-to-r from-[#AE343F]/10 via-[#AE343F]/5 to-[#AE343F]/10 rounded-2xl border border-[#AE343F]/20">
                <p className="text-[#AE343F] font-semibold">
                  <span className="text-xl">-20%</span> na digitalnu pozivnicu
                  uz HALO Uspomene telefon
                </p>
                <p className="text-stone-500 text-sm mt-1">
                  Rezervišite audio guest book i ostvarite popust na pozivnicu
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
