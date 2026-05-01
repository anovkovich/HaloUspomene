import React from "react";
import Link from "next/link";
import Hero from "../components/landing/Hero";
import PainPointSolution from "../components/landing/PainPointSolution";
import HowItWorks from "../components/landing/HowItWorks";
import SectionInvitations from "../components/landing/SectionInvitations";
import SectionRaspored from "../components/landing/SectionRaspored";
import SectionAudio from "../components/landing/SectionAudio";
import SectionPremium from "../components/landing/SectionPremium";
import Concept from "../components/landing/Concept";
import SectionRodjendani from "../components/landing/SectionRodjendani";
import SectionPlaner from "../components/landing/SectionPlaner";
import Testimonials from "../components/landing/Testimonials";
import CTABar from "../components/landing/CTABar";
import ContactForm from "../components/landing/ContactForm";
import Footer from "@/components/layout/footer/Footer";
import { Header } from "@/components/layout";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PainPointSolution />
        <SectionInvitations />
        <SectionRaspored />
        <SectionPremium />
        <SectionPlaner />
        <SectionAudio />
        <Concept />
        <SectionRodjendani />
        <CTABar />
        <HowItWorks />

        {/* Testimonials hidden visually but kept in DOM for SEO/crawlers */}
        <div className="sr-only" aria-hidden="false">
          <Testimonials />
        </div>

        {/* Contact — Retro phone reservation */}
        <section
          id="kontakt"
          className="py-16 sm:py-20 md:py-24 bg-[#232323] text-[#F5F4DC] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-[#AE343F]/10 rounded-full blur-2xl sm:blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-[#AE343F]/5 rounded-full blur-2xl sm:blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mb-6">
                Zakažite Retro Telefon Uspomena
              </h2>
              <p className="text-lg text-[#F5F4DC]/60 max-w-2xl mx-auto">
                Svaki mesec radimo sa ograničenim brojem događaja kako bismo
                svakom posvetili punu pažnju. Rezervišite termin za najam našeg
                retro telefona na vreme — a mi ćemo se pobrinuti da Vaše
                venčanje dobije nezaboravnu atrakciju.{" "}
                <Link href="/telefon-uspomena" className="underline hover:text-[#F5F4DC]/80 transition-colors">
                  Saznajte više o telefonu uspomena
                </Link>.
              </p>
            </div>

            <ContactForm />
          </div>
        </section>

        {/* SEO Hidden Content - Keyword optimization */}
        <section className="sr-only">
          <h2>HALO Uspomene — sve za vaše venčanje na jednom mestu</h2>
          <p>
            HALO Uspomene je sveobuhvatna platforma za organizaciju venčanja u
            Srbiji. Nudimo digitalne web pozivnice (e-pozivnice) sa RSVP
            potvrdom dolaska, pametan raspored sedenja kroz QR Pano
            dobrodošlice, audio uspomene putem retro telefona ili digitalne
            audio knjige, kao i Premium AI Pozivnice sa AI generisanim
            ilustracijama para. Dostupno u svim gradovima Srbije: Beograd, Novi
            Sad, Niš, Kragujevac, Subotica, Čačak, Smederevo i drugi.
          </p>
          <p>
            Website pozivnice za venčanje sa kustomnim dizajnom, RSVP
            praćenjem, mapom restorana, odbrojavanjem i galerijom fotografija —
            od 5.000 din. Uz svaku web pozivnicu dobijate besplatnu PDF
            pozivnicu (A5 format) sa personalizovanim QR kodom za štampariju.
            Podržana latinica i ćirilica. Pozivnice za venčanje, dečije
            rođendane, punoletstva i sve druge proslave.
          </p>
          <p>
            QR Pano dobrodošlice — pametan raspored sedenja za svadbu. Drag
            and drop editor za stolove, štampani QR pano za ulaz u salu, gosti
            sami pronalaze svoje mesto skeniranjem koda. Bez hostesa, bez
            spiskova, bez gužve na ulazu. Idealna alternativa klasičnim
            sedećim kartama. Cena rasporeda sedenja: 2.500 din uz pozivnicu.
          </p>
          <p>
            Audio guest book (audio knjiga uspomena, audio knjiga utisaka,
            audio spomenar) — gosti snimaju glasovne čestitke koje slušate
            celog života. Dve opcije: vintage retro telefon sa rotirajućim
            brojčanikom (8.000 din, dostava u celoj Srbiji), ili
            digitalna audio knjiga preko QR koda za stolovima (3.000 din uz
            pozivnicu). Opcioni USB suveniri: retro kaseta sa USB-om i
            uspomene u bočici.
          </p>
          <p>
            Premium AI Pozivnice — luksuzna pozivnica sa AI generisanom
            ilustracijom Vašeg para, parallax hero sekcijom, animiranim
            envelope-om, vintage automobilima i sakralnim spomenicima Vašeg
            grada. Akvarel i line-art teme. Cena: 10.000 — 12.000 din.
          </p>
          <p>
            Moje Venčanje portal uključen uz svaku pozivnicu — checklist po
            vremenskim grupama, budžet kalkulator, baza preko 90 proverenih
            vendora, RSVP praćenje. Sve dostupno na pametnom telefonu.
            Saznajte više o našem{" "}
            <Link href="/telefon-uspomena">retro telefonu za venčanja</Link>{" "}
            ili pogledajte{" "}
            <Link href="/qr-pano-dobrodoslice">QR Pano dobrodošlice</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
