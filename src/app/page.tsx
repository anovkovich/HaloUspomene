import React from "react";
import Hero from "../components/landing/Hero";
import Concept from "../components/landing/Concept";
import HowItWorks from "../components/landing/HowItWorks";
import Packages from "../components/landing/Packages";
import Gallery from "../components/landing/Gallery";
import ContactForm from "../components/landing/ContactForm";

export default function Home() {
  return (
    <main>
      <Hero />
      <Concept />
      <HowItWorks />
      <Packages />
      <Gallery />

      <section
        id="book"
        className="py-24 bg-[#232323] text-[#F5F4DC] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#AE343F]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#AE343F]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-serif mb-6">
              Rezervišite Svoj Datum
            </h2>
            <p className="text-lg text-[#F5F4DC]/60 max-w-2xl mx-auto">
              Naši kalendari se brzo popunjavaju. Osigurajte retro šarm glasa
              na vašoj proslavi popunjavanjem forme ispod.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
