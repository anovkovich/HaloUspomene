import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Smartphone,
  Clock,
  QrCode,
  Send,
  CheckCircle2,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import InvitationClusterLinks from "@/components/seo/InvitationClusterLinks";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title:
    "Izrada Pozivnica Online — Napravi Digitalnu Pozivnicu za Svaku Priliku | HALO Uspomene",
  description:
    "Napravite pozivnicu online za venčanje, dečiji rođendan, prvi rođendan ili punoletstvo. Personalizovana digitalna pozivnica sa RSVP-om, odbrojavanjem i mapom — gotova za 24h.",
  keywords: [
    "izrada pozivnica",
    "izrada pozivnica online",
    "napravi pozivnicu online",
    "napravi pozivnicu",
    "online pozivnica",
    "online pozivnice",
    "digitalna pozivnica",
    "elektronska pozivnica",
    "e-pozivnica",
    "web pozivnica",
    "kreiranje pozivnica online",
    "pozivnica online",
    "pozivnica za venčanje",
    "pozivnica za svadbu",
    "pozivnica za rođendan",
    "pozivnica za dečiji rođendan",
    "pozivnica za prvi rođendan",
    "pozivnica za punoletstvo",
    "pozivnica sa RSVP",
    "pozivnica srbija",
  ],
  openGraph: {
    title: "Izrada Pozivnica Online za Svaku Priliku | HALO Uspomene",
    description:
      "Digitalna pozivnica za venčanje, rođendan, prvi rođendan ili punoletstvo — sa RSVP-om, odbrojavanjem i mapom. Gotova za 24h.",
    type: "website",
    url: `${siteUrl}/izrada-pozivnica-online`,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Izrada Pozivnica Online za Svaku Priliku | HALO Uspomene",
    description:
      "Napravite digitalnu pozivnicu za venčanje, rođendan ili punoletstvo — sa RSVP-om i odbrojavanjem.",
  },
  alternates: {
    canonical: `${siteUrl}/izrada-pozivnica-online`,
  },
};

const benefits = [
  {
    icon: <Send size={24} />,
    title: "Podelite jednim linkom",
    desc: "Pozivnicu šaljete preko WhatsApp-a, Vibera ili e-maila — bez štampe i bez deljenja papira.",
  },
  {
    icon: <CheckCircle2 size={24} />,
    title: "RSVP potvrde uživo",
    desc: "Gosti potvrđuju dolazak kroz formu, a vi u realnom vremenu vidite ko dolazi i sa koliko osoba.",
  },
  {
    icon: <Clock size={24} />,
    title: "Odbrojavanje i program",
    desc: "Automatsko odbrojavanje do događaja, satnica programa i lokacija na Google mapi.",
  },
  {
    icon: <Smartphone size={24} />,
    title: "Savršeno na telefonu",
    desc: "Pozivnica izgleda besprekorno na svakom uređaju — telefonu, tabletu i računaru.",
  },
  {
    icon: <QrCode size={24} />,
    title: "PDF sa QR kodom",
    desc: "Uz digitalnu, dobijate i PDF verziju sa QR kodom — za one gostima koji vole nešto u ruci.",
  },
  {
    icon: <Wallet size={24} />,
    title: "Povoljnije od štampe",
    desc: "Bez troškova papira, štampe i dostave. Jedna pozivnica za neograničen broj gostiju.",
  },
];

const steps = [
  {
    n: "01",
    title: "Izaberite priliku",
    desc: "Venčanje, dečiji rođendan, prvi rođendan ili punoletstvo — svaka ima svoj dizajn.",
  },
  {
    n: "02",
    title: "Popunite upitnik",
    desc: "Kratak upitnik u 4 koraka: imena, datum, lokacija i stil. Traje par minuta.",
  },
  {
    n: "03",
    title: "Dobijate pozivnicu za 24h",
    desc: "Mi dizajniramo i šaljemo vam link spreman za deljenje — plus PDF sa QR kodom.",
  },
];

const faqItems = [
  {
    q: "Za koje prilike mogu da napravim pozivnicu online?",
    a: "Trenutno izrađujemo digitalne pozivnice za venčanje, dečiji rođendan (svih uzrasta, uključujući prvi rođendan) i punoletstvo (18. rođendan). Svaka vrsta ima poseban dizajn prilagođen prilici.",
  },
  {
    q: "Koliko traje izrada pozivnice?",
    a: "Pozivnicu izrađujemo i šaljemo u roku od 24 sata od popunjavanja upitnika. Vi popunite kratak upitnik u 4 koraka, a mi radimo dizajn.",
  },
  {
    q: "Šta je uključeno u digitalnu pozivnicu?",
    a: "Personalizovani dizajn, RSVP forma za potvrdu dolaska, odbrojavanje do događaja, lokacija na Google mapi i optimizacija za mobilne uređaje. Uz to dobijate i PDF verziju sa QR kodom.",
  },
  {
    q: "Kako gosti dobijaju pozivnicu?",
    a: "Dobijate jedan link koji delite gostima preko WhatsApp-a, Vibera, e-maila ili društvenih mreža. Nema štampe ni deljenja papira — jedna pozivnica važi za sve goste.",
  },
  {
    q: "Da li je online pozivnica jeftinija od štampane?",
    a: "Najčešće jeste — nema troškova papira, štampe i dostave, a jedna digitalna pozivnica pokriva neograničen broj gostiju. Tačne cene po vrsti pogledajte na stranici svake prilike.",
  },
  {
    q: "Mogu li da dobijem pozivnicu na ćirilici?",
    a: "Da. Pozivnice za venčanje i punoletstvo podržavaju i latinicu i ćirilicu, sa odgovarajućim fontovima.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Vrste digitalnih pozivnica",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Pozivnica za venčanje",
      url: `${siteUrl}/napravi-pozivnicu`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Pozivnica za dečiji rođendan",
      url: `${siteUrl}/napravi-deciju-pozivnicu`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Pozivnica za prvi rođendan",
      url: `${siteUrl}/pozivnica-za-prvi-rodjendan`,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Pozivnica za punoletstvo",
      url: `${siteUrl}/napravi-punoletstvo`,
    },
  ],
};

export default function IzradaPozivnicaOnline() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />

        {/* HERO */}
        <section className="pt-28 sm:pt-32 pb-12 sm:pb-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Izrada pozivnica online" },
              ]}
            />
            <div className="text-center mt-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-5">
                Digitalna pozivnica za svaku priliku
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] leading-tight mb-6">
                Izrada pozivnica{" "}
                <span className="italic text-[#AE343F]">online</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#232323]/60 max-w-2xl mx-auto leading-relaxed">
                Napravite personalizovanu digitalnu pozivnicu za venčanje,
                dečiji rođendan, prvi rođendan ili punoletstvo — sa RSVP-om,
                odbrojavanjem i mapom. Gotova za 24h, deli se jednim linkom.
              </p>
            </div>
          </div>
        </section>

        {/* CHOOSER — all event types */}
        <section className="py-12 sm:py-16">
          <InvitationClusterLinks
            title="Za koju priliku pravite pozivnicu?"
            subtitle="Izaberite tip događaja — svaka pozivnica ima dizajn prilagođen prilici."
            showHubLink={false}
          />
        </section>

        {/* BENEFITS */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Zašto online pozivnica
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Sve prednosti{" "}
                <span className="italic text-[#AE343F]">na jednom mestu</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="p-6 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mb-4">
                    {b.icon}
                  </div>
                  <h3 className="font-serif text-xl text-[#232323] mb-2">
                    {b.title}
                  </h3>
                  <p className="text-sm text-[#232323]/55 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KAKO FUNKCIONISE */}
        <section className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Kako funkcioniše
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323]">
                Pozivnica u{" "}
                <span className="italic text-[#AE343F]">3 koraka</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step) => (
                <div
                  key={step.n}
                  className="p-8 rounded-3xl bg-white border border-[#232323]/8 text-center"
                >
                  <span className="font-serif text-5xl text-[#AE343F]/20 block mb-3">
                    {step.n}
                  </span>
                  <h3 className="font-serif text-xl text-[#232323] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#232323]/55 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Česta pitanja
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323]">
                Sve što vas{" "}
                <span className="italic text-[#AE343F]">zanima</span>
              </h2>
            </div>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.q}
                  className="group bg-[#f5f4dc]/40 rounded-2xl border border-[#232323]/5 overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-serif text-lg text-[#232323] list-none">
                    {item.q}
                    <ArrowRight
                      size={18}
                      className="shrink-0 text-[#AE343F] rotate-90 group-open:rotate-[270deg] transition-transform"
                    />
                  </summary>
                  <div className="px-5 pb-5 text-[#232323]/60 leading-relaxed text-[15px]">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* SEO HIDDEN CONTENT */}
        <section className="sr-only">
          <h2>Izrada pozivnica online u Srbiji</h2>
          <p>
            HALO Uspomene izrađuje digitalne pozivnice online za sve prilike u
            Srbiji. Napravite pozivnicu za venčanje, pozivnicu za svadbu,
            pozivnicu za dečiji rođendan, pozivnicu za prvi rođendan ili
            pozivnicu za punoletstvo (18. rođendan). Svaka online pozivnica
            uključuje RSVP formu za potvrdu dolaska, odbrojavanje do događaja,
            lokaciju na Google mapi i PDF verziju sa QR kodom. Pozivnicu delite
            jednim linkom preko WhatsApp-a, Vibera ili e-maila i gotova je za 24
            sata. Pogledajte i naše{" "}
            <Link href="/napravi-pozivnicu">pozivnice za venčanje</Link>,{" "}
            <Link href="/napravi-deciju-pozivnicu">
              pozivnice za dečiji rođendan
            </Link>
            ,{" "}
            <Link href="/pozivnica-za-prvi-rodjendan">
              pozivnice za prvi rođendan
            </Link>{" "}
            i{" "}
            <Link href="/napravi-punoletstvo">pozivnice za punoletstvo</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
