import React from "react";
import Link from "next/link";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import ContactForm from "./ContactForm";

/**
 * Izdvojeno iz `page.tsx`, gde je stajalo kao jedina sekcija pisana ručno
 * usred spiska komponenti.
 *
 * `id="kontakt"` nosi šest linkova sa sajta, uključujući podrazumevani CTA
 * blok ispod svakog blog posta — pa ovaj `id` mora da preživi svaki refaktor.
 */
const SectionKontakt: React.FC = () => (
  <Section
    id="kontakt"
    tone="tamna"
    size="spacious"
    width="uska"
    className="overflow-hidden"
    backdrop={
      <>
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#AE343F]/10 blur-2xl sm:h-48 sm:w-48 sm:blur-3xl md:h-64 md:w-64" />
        <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#AE343F]/5 blur-2xl sm:h-72 sm:w-72 sm:blur-3xl md:h-96 md:w-96" />
      </>
    }
  >
    <SectionHeader
      title="Zakažite retro telefon uspomena"
      tone="tamna"
      subtitle={
        <>
          Svaki mesec radimo sa ograničenim brojem događaja kako bismo svakom
          posvetili punu pažnju. Rezervišite termin na vreme —{" "}
          <Link
            href="/telefon-uspomena"
            className="underline transition-colors hover:text-[#F5F4DC]"
          >
            saznajte više o telefonu uspomena
          </Link>
          .
        </>
      }
    />

    <ContactForm />
  </Section>
);

export default SectionKontakt;
