import React from "react";
import type { Metadata } from "next";
import Hero from "../components/landing/Hero";
import ProductGrid from "../components/landing/ProductGrid";
import WhyUs from "../components/landing/WhyUs";
import Process from "../components/landing/Process";
import PriceStrip from "../components/landing/PriceStrip";
import Testimonials from "../components/landing/Testimonials";
import FAQ, { homeFaqItems } from "../components/landing/FAQ";
import SectionKontakt from "../components/landing/SectionKontakt";
import Footer from "@/components/layout/footer/Footer";
import { Header } from "@/components/layout";

// Naslov i opis se nasleđuju iz root layout-a; ovde se postavlja samo canonical,
// pošto je uklonjen iz layout-a da ga ne bi nasleđivala svaka stranica.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Izvedeno iz istih pitanja koja se prikazuju, da se tekst i schema ne raziđu.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

/**
 * Početna je raskrsnica, ne prodajna stranica.
 *
 * Ranije je nosila 16 sekcija i sedam pojedinačnih prodajnih priča — po jednu
 * za svaki proizvod — pa se retro telefon pojavljivao na devet mesta na istoj
 * stranici. Pune priče sada žive na proizvodnim stranicama, na koje vodi
 * `ProductGrid`; ovde ostaje samo ono što posetioca usmerava.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <Hero />

        {/* Zamenjuje sedam prodajnih sekcija — v. `src/data/products.ts`. */}
        <ProductGrid />

        {/* Spoj `PainPointSolution` + `Concept`, koje su nosile istu poruku. */}
        <WhyUs />

        {/* `id="proces"` — podnožje linkuje `/#proces`. */}
        <Process />

        {/* `id="paketi"` — popravlja pokvareni `/#paketi` sa `/cene` i svih
            šest gradskih stranica. */}
        <PriceStrip />

        <Testimonials />

        {/* `id="faq"` i jedini FAQPage schema blok — v. komentar u komponenti. */}
        <FAQ />

        {/* `id="kontakt"` — nosi šest linkova, uključujući CTA blok blog postova. */}
        <SectionKontakt />
      </main>
      <Footer />
    </>
  );
}
