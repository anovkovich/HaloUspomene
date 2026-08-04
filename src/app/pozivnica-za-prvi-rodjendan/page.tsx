import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Cake,
  Palette,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import InvitationClusterLinks from "@/components/seo/InvitationClusterLinks";
import ThemePreview from "@/components/ui/ThemePreview";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title: "Pozivnica za Prvi Rođendan — Digitalna Online",
  description:
    "Šarena digitalna pozivnica za prvi rođendan — teme za dečaka i devojčicu, potvrde dolaska, odbrojavanje i mapa. Gotova odmah, deli se jednim linkom.",
  keywords: [
    "pozivnica za prvi rođendan",
    "pozivnica za prvi rođendan online",
    "online pozivnica za prvi rođendan",
    "digitalna pozivnica za prvi rođendan",
    "pozivnica za prvu godinu",
    "pozivnica za prvi rođendan devojčice",
    "pozivnica za prvi rođendan dečaka",
    "pozivnica za prvi rodjendan",
    "napravi pozivnicu za prvi rođendan",
    "pozivnica za prvi rođendan srbija",
    "šarena pozivnica za prvi rođendan",
    "pozivnica za rođendan deteta",
  ],
  openGraph: {
    title: "Pozivnica za Prvi Rođendan — Digitalna Pozivnica Online | HALO Uspomene",
    description:
      "Šarena digitalna pozivnica za prvi rođendan — teme za dečaka, devojčicu ili neutralne, sa potvrdama dolaska i odbrojavanjem. Gotova odmah.",
    type: "website",
    url: `${siteUrl}/pozivnica-za-prvi-rodjendan`,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pozivnica za Prvi Rođendan Online | HALO Uspomene",
    description:
      "Napravite šarenu digitalnu pozivnicu za prvi rođendan — sa formom za potvrdu dolaska i odbrojavanjem.",
  },
  alternates: {
    canonical: `${siteUrl}/pozivnica-za-prvi-rodjendan`,
  },
};

const included = [
  {
    icon: <Palette size={24} />,
    title: "Tema po želji",
    desc: "Izaberite temu za dečaka, devojčicu ili neutralnu — sa veselim bojama, ilustracijama i fontovima.",
  },
  {
    icon: <CheckCircle2 size={24} />,
    title: "Potvrde dolaska",
    desc: "Gosti potvrđuju dolazak kroz formu — vi tačno znate koliko odraslih i mališana dolazi.",
  },
  {
    icon: <Clock size={24} />,
    title: "Odbrojavanje",
    desc: "Automatsko odbrojavanje do prve proslave — gradi uzbuđenje kod gostiju.",
  },
  {
    icon: <MapPin size={24} />,
    title: "Lokacija na mapi",
    desc: "Adresa restorana, igraonice ili kuće direktno na Google mapi — bez lutanja.",
  },
];

const steps = [
  {
    n: "01",
    title: "Popunite upitnik",
    desc: "Ime deteta, datum prvog rođendana, lokacija i tema — 4 kratka koraka.",
  },
  {
    n: "02",
    title: "Mi dizajniramo",
    desc: "Pozivnicu pravimo odmah i šaljemo vam link spreman za deljenje.",
  },
  {
    n: "03",
    title: "Podelite sa gostima",
    desc: "Link delite preko WhatsApp-a, Vibera ili e-maila — gosti potvrđuju jednim klikom.",
  },
];

const faqItems = [
  {
    q: "Kako da napravim pozivnicu za prvi rođendan?",
    a: "Popunite kratak upitnik u 4 koraka: ime deteta, datum prvog rođendana, lokaciju proslave i temu (dečak, devojčica ili neutralna). Pozivnicu izrađujemo odmah i šaljemo vam link spreman za deljenje.",
  },
  {
    q: "Da li postoje teme posebno za prvi rođendan?",
    a: "Da. Birate između tema za dečaka, devojčicu ili neutralnih — sa veselim bojama, ilustracijama i razigranim fontovima primerenim proslavi prve godine.",
  },
  {
    q: "Kako gosti dobijaju pozivnicu?",
    a: "Dobijate jedan link koji delite preko WhatsApp-a, Vibera, e-maila ili društvenih mreža. Nema štampe — jedna pozivnica važi za sve goste, a oni potvrđuju dolazak jednim klikom.",
  },
  {
    q: "Koliko košta pozivnica za prvi rođendan?",
    a: "Pozivnica za prvi rođendan koristi isti cenovnik kao i pozivnica za dečiji rođendan. Aktuelnu cenu vidite na stranici za izradu pre nego što potvrdite.",
  },
  {
    q: "Da li mogu da je koristim i za drugi ili treći rođendan?",
    a: "Naravno. Iako je ova stranica posvećena prvom rođendanu, isti proces i teme rade za bilo koji uzrast deteta — samo unesete odgovarajući datum i uzrast u upitniku.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Izrada digitalne pozivnice za prvi rođendan",
  name: "Digitalna pozivnica za prvi rođendan",
  description:
    "Personalizovana online pozivnica za prvi rođendan deteta sa temama za dečaka, devojčicu ili neutralnim, formom za potvrdu dolaska, odbrojavanjem i lokacijom na mapi. Gotova odmah.",
  provider: {
    "@type": "Organization",
    name: "HALO Uspomene",
    url: siteUrl,
  },
  areaServed: { "@type": "Country", name: "Srbija" },
  url: `${siteUrl}/pozivnica-za-prvi-rodjendan`,
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function PozivnicaZaPrviRodjendan() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* HERO */}
        <section className="pt-28 sm:pt-32 pb-12 sm:pb-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Pozivnica za prvi rođendan" },
              ]}
            />
            <div className="text-center mt-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] mb-6">
                <Cake size={32} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-5">
                Prva godina — prvi veliki dan
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] leading-tight mb-6">
                Pozivnica za{" "}
                <span className="italic text-[#AE343F]">prvi rođendan</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#232323]/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                Napravite šarenu digitalnu pozivnicu za prvi rođendan vašeg
                mališana — sa temama za dečaka, devojčicu ili neutralnim, uz
                formu za potvrdu dolaska i odbrojavanje. Gotova odmah, deli se
                jednim linkom.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/napravi-deciju-pozivnicu"
                  className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] btn-lg rounded-full px-10 border-none shadow-xl shadow-[#AE343F]/30"
                  data-track="cta_click"
                  data-track-cta-name="napravi_prvi_rodjendan"
                  data-track-cta-location="hero"
                >
                  Napravi pozivnicu
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/izrada-pozivnica-online"
                  className="btn btn-outline border-[#232323]/20 text-[#232323] hover:bg-[#232323] hover:text-[#F5F4DC] btn-lg rounded-full px-10"
                >
                  Sve vrste pozivnica
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ZASTO / O PRVOM RODJENDANU */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Zašto digitalna pozivnica
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#232323]">
                Prvi rođendan se{" "}
                <span className="italic text-[#AE343F]">pamti</span>
              </h2>
            </div>
            <div className="space-y-4 text-[#232323]/70 leading-relaxed text-center">
              <p>
                Prvi rođendan je jedna od najlepših porodičnih proslava — prva
                torta, prvi veliki krug gostiju, prve zajedničke fotografije sa
                svima koji vole vašeg mališana. Digitalna pozivnica čuva taj ton:
                vesela je, lična i lako se deli sa celom familijom i prijateljima
                u jednom potezu.
              </p>
              <p>
                Umesto da kupujete, štampate i ručno delite papirne pozivnice,
                vašu online pozivnicu šaljete linkom — preko WhatsApp-a, Vibera
                ili e-maila. Gosti odmah vide datum, lokaciju i potvrđuju dolazak,
                a vi u realnom vremenu znate koliko odraslih i dece dolazi, što
                mnogo olakšava rezervaciju restorana ili igraonice.
              </p>
            </div>
          </div>
        </section>

        {/* STA UKLJUCUJE */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Šta uključuje
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323]">
                Sve za{" "}
                <span className="italic text-[#AE343F]">prvu proslavu</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {included.map((item) => (
                <div
                  key={item.title}
                  className="p-6 rounded-3xl bg-white border border-[#232323]/8 text-center shadow-sm"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-serif text-lg text-[#232323] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#232323]/55 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KAKO FUNKCIONISE */}
        <section className="py-16 sm:py-20 bg-white">
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
                  className="p-8 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5 text-center"
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
            <div className="text-center mt-10">
              <Link
                href="/napravi-deciju-pozivnicu"
                className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] btn-lg rounded-full px-10 border-none"
                data-track="cta_click"
                data-track-cta-name="napravi_prvi_rodjendan"
                data-track-cta-location="koraci"
              >
                Napravi pozivnicu za prvi rođendan
                <Send size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-20 md:py-24">
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
                  className="group bg-white rounded-2xl border border-[#232323]/8 overflow-hidden shadow-sm"
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

        {/* ═══ Prozni deo — prvi rodjendan se razlikuje od ostalih ═══ */}
        <section className="bg-white py-16 sm:py-20">
          <div className="container mx-auto max-w-3xl space-y-5 px-4 leading-relaxed text-[#232323]/70">
            <h2 className="font-serif text-2xl text-[#232323] sm:text-3xl">
              Po čemu se pozivnica za prvi rođendan razlikuje
            </h2>
            <p>
              Prvi rođendan je jedina dečija proslava na kojoj su gosti uglavnom{" "}
              <strong className="text-[#232323]">odrasli</strong> — babe i dede,
              kumovi, tetke, prijatelji roditelja. Slavljenik neće pročitati
              pozivnicu, pa ona zapravo govori porodici: kada, gde, koliko dugo,
              i da li se dolazi sa decom.
            </p>
            <p>
              Zato su dva podatka važnija nego kod starije dece.{" "}
              <strong className="text-[#232323]">Trajanje proslave</strong> —
              prva godina se slavi kratko, obično dva do tri sata, i termin se
              bira oko dnevnog sna, pa gost treba unapred da zna do kada je
              zvan. I <strong className="text-[#232323]">koliko osoba
              dolazi</strong>, jer se kod prve godine često potvrđuje za celu
              porodicu odjednom — a to menja i broj mesta i količinu hrane.
            </p>
            <p>
              Digitalna pozivnica oba pitanja rešava sama: gost jednim klikom
              potvrdi dolazak i unese broj osoba, a vi vidite spisak koji se sam
              ažurira. Bez prozivanja po Viber grupama nedelju dana pre.
            </p>

            <h3 className="pt-3 font-serif text-xl text-[#232323]">
              Kada slati pozivnicu za prvu godinu
            </h3>
            <p>
              Dve do tri nedelje unapred je sasvim dovoljno, uz rok za potvrdu
              nedelju dana pre proslave. Ako računate na rodbinu iz drugog grada
              ili inostranstva, pomerite na mesec dana — njima treba vreme za
              put, i to je jedini razlog da se žuri.
            </p>

            <h3 className="pt-3 font-serif text-xl text-[#232323]">
              Šta napisati
            </h3>
            <p>
              Ime deteta, datum, vreme i lokaciju ne kucate — to su zasebna
              polja u upitniku i pozivnica ih sama prikazuje, zajedno sa mapom.
              Slobodno pišete samo kratku poruku na vrhu. Nekoliko primera:
            </p>
            <ul className="space-y-2.5">
              {[
                "Naša Sofija puni prvu godinu! Dođite da to proslavimo sa nama.",
                "Prva sveća, prva torta, prvi rođendan — i vi ste deo priče.",
                "Godinu dana sreće. Slavimo u krugu najdražih, računamo na vas.",
                "Luka puni 1! Kratko, veselo i uz mnogo fotografija.",
              ].map((t) => (
                <li
                  key={t}
                  className="rounded-xl border border-stone-200 bg-[#faf9f6] px-5 py-3 italic"
                >
                  {t}
                </li>
              ))}
            </ul>
            <p>
              Ako slavite i starijem detetu, isti upitnik radi i za{" "}
              <Link
                href="/napravi-deciju-pozivnicu"
                className="font-medium text-[#AE343F] hover:underline"
              >
                dečiji rođendan
              </Link>
              , a sve o samom formatu ima u vodiču{" "}
              <Link
                href="/blog/digitalne-pozivnice-za-vencanje"
                className="font-medium text-[#AE343F] hover:underline"
              >
                digitalne pozivnice
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ═══ Galerija zivih primera ═══
            Poster je obican next/image i stoji u HTML-u; video je cisto
            unapredjenje i krece na prelaz misem, kao i na /pozivnice. */}
        <section className="bg-[#faf9f6] py-16 sm:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="font-serif text-2xl text-[#232323] sm:text-3xl">
              Pogledajte pozivnicu uživo
            </h2>
            <p className="mt-2 mb-8 text-[#232323]/60">
              Dve gotove pozivnice, otvorene za pregled. Isto ovako izgleda i
              vaša — samo sa imenom vašeg deteta, datumom i lokacijom.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[
                {
                  ime: "Tema za dečake",
                  opis: "Vesele boje i ilustracije",
                  poster: "/videos/dec-decak-poster.webp",
                  video: "/videos/dec-decak.webm",
                  href: "/deciji-rodjendan/primer-decak",
                },
                {
                  ime: "Tema za devojčice",
                  opis: "Nežniji tonovi, isti sadržaj",
                  poster: "/videos/dec-devojcica-poster.webp",
                  video: "/videos/dec-devojcica.webm",
                  href: "/deciji-rodjendan/primer-devojcica",
                },
              ].map((t) => (
                <div
                  key={t.href}
                  className="rounded-3xl border border-stone-200 bg-white p-5"
                >
                  <div className="mx-auto max-w-[220px]">
                    <ThemePreview
                      poster={t.poster}
                      video={t.video}
                      alt={`Digitalna pozivnica za prvi rođendan — ${t.ime.toLowerCase()}`}
                    />
                  </div>
                  <p className="mt-4 font-serif text-lg text-[#232323]">
                    {t.ime}
                  </p>
                  <p className="mt-1 text-sm text-[#232323]/55">{t.opis}</p>
                  <Link
                    href={t.href}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#AE343F] hover:underline"
                  >
                    Otvorite primer
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-[#232323]/55">
              Pozivnica se pravi kroz isti upitnik kao za{" "}
              <Link
                href="/napravi-deciju-pozivnicu"
                className="font-medium text-[#AE343F] hover:underline"
              >
                dečiji rođendan
              </Link>{" "}
              — birate temu i boje koje odgovaraju prvoj godini. Nema posebne
              cene ni posebnog proizvoda za prvi rođendan.
            </p>
          </div>
        </section>

        {/* CLUSTER LINKS */}
        <section className="py-16 sm:py-20 bg-white">
          <InvitationClusterLinks
            current="prvi-rodjendan"
            subtitle="Pravite proslavu za nekog drugog? Imamo pozivnicu i za to."
          />
        </section>

        {/* Ranije je ovde stajao `sr-only` blok. Njegov sadrzaj je prelivan u
            vidljivu galeriju iznad i u tekst — skriven tekst Google gotovo ne
            vrednuje, a stranica je imala svega 530 vidljivih reci. */}
      </main>
      <Footer />
    </>
  );
}
