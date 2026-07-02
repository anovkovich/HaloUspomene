import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Car,
  Crown,
  Mountain,
  Sparkles,
  Clock,
  ShieldCheck,
  UserCheck,
  Heart,
  Flag,
  Users,
  Plane,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CarRentalLeadForm from "./CarRentalLeadForm";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title:
    "Iznajmljivanje Luksuznih Automobila za Venčanje — Mercedes sa Šoferom | HALO Uspomene",
  description:
    "Luksuzan automobil za mladence, kuma i barjaktara na svadbi. Mercedes E, S, GLE i G klasa sa profesionalnim šoferom — po satu ili za ceo dan. Cene i dostupnost za venčanja širom Srbije.",
  keywords: [
    "iznajmljivanje automobila za venčanje",
    "auto za venčanje",
    "auto za svadbu",
    "auto za mladence",
    "luksuzni automobil za venčanje",
    "mercedes za venčanje",
    "mercedes za svadbu",
    "mercedes s klasa za venčanje",
    "mercedes g klasa za svadbu",
    "limuzina za venčanje",
    "rent a car za venčanje",
    "rent a car sa šoferom",
    "auto za kuma",
    "auto za barjaktara",
    "svadbena kolona",
    "iznajmljivanje vozila sa vozačem",
    "luksuzni auto sa šoferom beograd",
    "najam automobila za svadbu",
    "vip prevoz za venčanje",
    "auto za venčanje beograd",
    "auto za venčanje novi sad",
    "transfer mladenaca",
  ],
  openGraph: {
    title:
      "Iznajmljivanje Luksuznih Automobila za Venčanje | HALO Uspomene",
    description:
      "Mercedes E, S, GLE i G klasa sa profesionalnim šoferom za mladence, kuma i barjaktara. Po satu ili za ceo dan.",
    type: "website",
    url: `${siteUrl}/iznajmljivanje-automobila-za-vencanje`,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Iznajmljivanje Luksuznih Automobila za Venčanje | HALO Uspomene",
    description:
      "Luksuzan Mercedes sa šoferom za mladence, kuma i barjaktara — po satu ili za ceo dan.",
  },
  alternates: {
    canonical: `${siteUrl}/iznajmljivanje-automobila-za-vencanje`,
  },
};

interface Vehicle {
  name: string;
  tagline: string;
  badge: string;
  icon: React.ReactNode;
  image?: string;
  perHour: number;
  perDay: number;
  blurb: string;
}

const vehicles: Vehicle[] = [
  {
    name: "Mercedes E Class",
    tagline: "Elegantna limuzina",
    badge: "Klasik",
    icon: <Car size={32} />,
    image: "/images/cars/e.webp",
    perHour: 50,
    perDay: 350,
    blurb:
      "Bezvremenski izbor za mladence. Udobnost, elegancija i prefinjen dolazak ispred sale — pravi balans luksuza i cene.",
  },
  {
    name: "Mercedes S Class",
    tagline: "VIP limuzina",
    badge: "Najluksuznija",
    icon: <Crown size={32} />,
    image: "/images/cars/s.webp",
    perHour: 80,
    perDay: 600,
    blurb:
      "Vrhunac luksuza za mladu i mladoženju. Prostran, tih i reprezentativan — automobil koji ostavlja utisak na svakoj fotografiji.",
  },
  {
    name: "Mercedes GLE SUV",
    tagline: "Luksuzni SUV",
    badge: "Prostran",
    icon: <Car size={32} />,
    image: "/images/cars/gle.webp",
    perHour: 65,
    perDay: 450,
    blurb:
      "Visok, prostran i upečatljiv. Idealan kada želite više prostora za venčanicu i moderan, sportski izgled kolone.",
  },
  {
    name: "Mercedes G Class",
    tagline: "Statusni terenac",
    badge: "Statement",
    icon: <Mountain size={32} />,
    // Foto uskoro — do tada elegantan placeholder (vidi karticu ispod).
    perHour: 100,
    perDay: 700,
    blurb:
      "Najprepoznatljiviji terenac na svetu. Za parove koji žele da naprave ekskluzivan, drugačiji i pamtljiv ulazak.",
  },
];

const occasions = [
  {
    icon: <Heart size={26} />,
    title: "Za mladence",
    desc: "Reprezentativan dolazak mlade i mladoženje ispred crkve, matičara i sale — sa šoferom i dovoljno prostora za venčanicu.",
  },
  {
    icon: <Flag size={26} />,
    title: "Za kuma i barjaktara",
    desc: "Posebno vozilo za kuma, kumu ili barjaktara koje prati glavni automobil i upotpunjuje svečanu kolonu.",
  },
  {
    icon: <Users size={26} />,
    title: "Svadbena kolona",
    desc: "Više vozila iste klase za usklađenu, elegantnu svadbenu kolonu koja se pamti — i sjajno izgleda na snimku.",
  },
  {
    icon: <Plane size={26} />,
    title: "Transfer gostiju i transferi",
    desc: "Dolazak i odlazak mladenaca, prevoz najbližih ili transfer do/od aerodroma — udobno i tačno na vreme.",
  },
];

const included = [
  {
    icon: <UserCheck size={24} />,
    title: "Profesionalni šofer",
    desc: "Iskusan vozač u svečanom odelu, ljubazan i diskretan — vi se opuštate, on vodi računa o svemu.",
  },
  {
    icon: <Sparkles size={24} />,
    title: "Besprekorno čisto vozilo",
    desc: "Automobil detaljno opran i pripremljen pre događaja — spreman za fotografije iznutra i spolja.",
  },
  {
    icon: <Clock size={24} />,
    title: "Dolazak na vreme",
    desc: "Precizno planiran termin i ruta. Vozilo je ispred vas pre nego što vam zatreba — bez stresa na dan venčanja.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Osiguranje uključeno",
    desc: "Vozila su potpuno osigurana i redovno servisirana, tako da vaš najvažniji dan teče bezbrižno.",
  },
];

const howItWorks = [
  {
    n: "01",
    title: "Pošaljite upit",
    desc: "Izaberite vozilo i datum venčanja u formi ispod — odgovor stiže brzo, bez obaveze.",
  },
  {
    n: "02",
    title: "Potvrda i ponuda",
    desc: "Proveravamo dostupnost za vaš termin i šaljemo vam jasnu ponudu prilagođenu satnici.",
  },
  {
    n: "03",
    title: "Uživajte na dan venčanja",
    desc: "Šofer stiže na vreme sa pripremljenim vozilom — vama ostaje samo da uđete i uživate.",
  },
];

const faqItems = [
  {
    q: "Koliko košta iznajmljivanje automobila za venčanje?",
    a: "Cena zavisi od modela i trajanja najma. Najam ide po satu (minimum 2 sata) ili za ceo dan (8 sati): Mercedes E klasa od 50 € po satu odnosno 350 € za ceo dan, GLE SUV 65 € / 450 €, S klasa 80 € / 600 €, a G klasa 100 € / 700 €. Pošaljite upit i dobijate tačnu ponudu za vaš termin.",
  },
  {
    q: "Da li u cenu ulazi šofer?",
    a: "Da. Sva vozila se iznajmljuju isključivo sa profesionalnim šoferom u svečanom odelu. Vi ne morate da brinete o vožnji, parkingu ni ruti — sve je organizovano.",
  },
  {
    q: "Mogu li da iznajmim vozilo za kuma ili barjaktara, a ne samo za mladence?",
    a: "Naravno. Možete iznajmiti jedno vozilo za mladence, a dodatna vozila za kuma, kumu ili barjaktara — ili celu usklađenu svadbenu kolonu od više automobila iste klase.",
  },
  {
    q: "Koliko unapred treba da rezervišem automobil?",
    a: "Preporučujemo rezervaciju što ranije, posebno za vrhunac sezone venčanja (maj–septembar) i za vikende, jer su najtraženiji modeli brzo zauzeti. Čim imate datum, pošaljite upit da proverimo dostupnost.",
  },
  {
    q: "Da li je vozilo dekorisano za venčanje?",
    a: "Vozilo stiže besprekorno čisto i pripremljeno. Dekoraciju (cveće, traka) dogovaramo prema vašoj želji — javite nam u upitu pa ćemo uskladiti detalje.",
  },
  {
    q: "Da li dolazite u moj grad?",
    a: "Da, organizujemo najam za venčanja širom Srbije — Beograd, Novi Sad, Niš, Kragujevac i ostale gradove. Navedite lokaciju u upitu i potvrdićemo dostupnost.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Iznajmljivanje luksuznih automobila za venčanje",
  name: "Iznajmljivanje luksuznih automobila za venčanje sa šoferom",
  description:
    "Najam luksuznih Mercedes vozila (E, S, GLE i G klasa) sa profesionalnim šoferom za mladence, kuma i barjaktara na venčanju. Najam po satu ili za ceo dan.",
  provider: {
    "@type": "Organization",
    name: "HALO Uspomene",
    url: siteUrl,
  },
  areaServed: {
    "@type": "Country",
    name: "Srbija",
  },
  url: `${siteUrl}/iznajmljivanje-automobila-za-vencanje`,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Vozni park za venčanja",
    itemListElement: vehicles.map((v) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: `${v.name} sa šoferom za venčanje`,
        description: v.blurb,
      },
      priceSpecification: [
        {
          "@type": "UnitPriceSpecification",
          price: v.perHour,
          priceCurrency: "EUR",
          unitText: "po satu (min. 2h)",
        },
        {
          "@type": "UnitPriceSpecification",
          price: v.perDay,
          priceCurrency: "EUR",
          unitText: "ceo dan (8h)",
        },
      ],
    })),
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function IznajmljivanjeAutomobilaZaVencanje() {
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
        <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-5xl">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Iznajmljivanje automobila za venčanje" },
              ]}
            />
            <div className="text-center mt-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-5">
                Luksuzan prevoz za vaš najvažniji dan
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] leading-tight mb-6">
                Iznajmljivanje luksuznih automobila za{" "}
                <span className="italic text-[#AE343F]">venčanje</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#232323]/60 max-w-2xl mx-auto mb-4 leading-relaxed">
                Treba vam reprezentativan auto za mladence, kuma ili barjaktara
                na svadbi? Mercedes E, S, GLE i G klasa sa profesionalnim
                šoferom.
              </p>
              <p className="text-sm text-[#232323]/50 max-w-xl mx-auto mb-8">
                Besprekorno čisto vozilo, iskusan šofer i dolazak tačno na vreme
                — za venčanja širom Srbije.
              </p>
              {/* Mercedes-Benz logo (transparentan) — bez okvira, sa mekim toplim sjajem */}
              <div className="mb-8 flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  {/* meki topli sjaj — daje dubinu da logo ne „lebdi" na ravnom */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-56 w-56 sm:h-64 sm:w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.16),transparent_65%)] blur-2xl"
                  />
                  <Image
                    src="/images/cars/logo.png"
                    alt="Mercedes-Benz"
                    width={320}
                    height={320}
                    priority
                    className="relative z-10 h-auto w-48 sm:w-56 object-contain"
                  />
                </div>
                {/* Natpis u brend „eyebrow" maniru — simetrične gold hairline linije */}
                <div className="mt-3 flex items-center gap-3 text-[#232323]/45">
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#d4af37]/70" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                    Flota sa profesionalnim šoferom
                  </span>
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#d4af37]/70" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#kontakt"
                  className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] btn-lg rounded-full px-10 border-none shadow-xl shadow-[#AE343F]/30"
                  data-track="cta_click"
                  data-track-cta-name="upit_vozilo"
                  data-track-cta-location="hero"
                >
                  Pošalji upit
                  <ArrowRight size={18} />
                </a>
                <a
                  href="#vozni-park"
                  className="btn btn-outline border-[#232323]/20 text-[#232323] hover:bg-[#232323] hover:text-[#F5F4DC] btn-lg rounded-full px-10"
                >
                  Pogledaj vozni park
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* INCLUDED / TRUST */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {included.map((item) => (
                <div
                  key={item.title}
                  className="text-center p-6 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-serif text-xl text-[#232323] mb-2">
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

        {/* VOZNI PARK */}
        <section id="vozni-park" className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Vozni park
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Mercedes flota za{" "}
                <span className="italic text-[#AE343F]">venčanja</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Sva vozila dolaze sa profesionalnim šoferom. Najam po satu
                (minimum 2 sata) ili za ceo dan (8 sati).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehicles.map((v) => (
                <div
                  key={v.name}
                  className="group flex flex-col bg-white rounded-3xl border border-[#232323]/8 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#232323]/10 hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* Foto vozila (G klasa: placeholder dok fotografija ne stigne) */}
                  <div className="relative aspect-[16/11] overflow-hidden bg-[#232323]">
                    {v.image ? (
                      <Image
                        src={v.image}
                        alt={`${v.name} sa šoferom za venčanje`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#2c2c2c] to-[#151515] text-[#d4af37]">
                        {v.icon}
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#F5F4DC]/40">
                          Fotografija uskoro
                        </span>
                      </div>
                    )}
                    {/* Blagi gradijent radi čitljivosti badge-a */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-[#F5F4DC] bg-[#AE343F]/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                      {v.badge}
                    </span>
                  </div>

                  <div className="p-6 pt-5 flex flex-col flex-1">
                    <h3 className="font-serif text-2xl text-[#232323] leading-tight">
                      {v.name}
                    </h3>
                    <p className="text-sm text-[#232323]/45 mt-1 mb-4">
                      {v.tagline}
                    </p>
                    <p className="text-sm text-[#232323]/55 leading-relaxed mb-6 flex-1">
                      {v.blurb}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs uppercase tracking-wider text-[#232323]/45">
                          Po satu
                        </span>
                        <span className="font-serif text-xl text-[#232323]">
                          {v.perHour} €
                          <span className="text-[11px] text-[#232323]/40 ml-1">
                            / min. 2h
                          </span>
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between border-t border-[#232323]/5 pt-3">
                        <span className="text-xs uppercase tracking-wider text-[#232323]/45">
                          Ceo dan (8h)
                        </span>
                        <span className="font-serif text-2xl text-[#AE343F] font-medium">
                          {v.perDay} €
                        </span>
                      </div>
                    </div>
                    <a
                      href="#kontakt"
                      className="mt-6 btn btn-sm bg-[#232323] hover:bg-[#AE343F] text-[#F5F4DC] rounded-full border-none w-full"
                      data-track="cta_click"
                      data-track-cta-name="upit_vozilo"
                      data-track-cta-location={`kartica_${v.name}`}
                    >
                      Proveri dostupnost
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-[#232323]/40 mt-8 max-w-2xl mx-auto">
              Cene su informativne i izražene u evrima (€). Tačna ponuda zavisi
              od datuma, trajanja i lokacije — pošaljite upit za potvrdu.
            </p>
          </div>
        </section>

        {/* PRILIKE / ZA KOGA */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Za svaku ulogu na svadbi
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Auto za mladence, kuma i{" "}
                <span className="italic text-[#AE343F]">barjaktara</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Bilo da vam treba jedno vozilo ili cela svadbena kolona —
                uskladimo flotu prema vašoj satnici i broju vozila.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {occasions.map((o) => (
                <div
                  key={o.title}
                  className="flex gap-5 p-6 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5"
                >
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center">
                    {o.icon}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-[#232323] mb-2">
                      {o.title}
                    </h3>
                    <p className="text-sm text-[#232323]/55 leading-relaxed">
                      {o.desc}
                    </p>
                  </div>
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
                Rezervacija u <span className="italic text-[#AE343F]">3 koraka</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {howItWorks.map((step) => (
                <div
                  key={step.n}
                  className="relative p-8 rounded-3xl bg-white border border-[#232323]/8 text-center"
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

            <p className="text-center text-sm text-[#232323]/50 mt-10">
              Želite više saveta?{" "}
              <Link
                href="/blog/auto-za-vencanje-vodic"
                className="text-[#AE343F] font-medium hover:underline"
              >
                Pročitajte vodič: kako izabrati auto za venčanje
              </Link>
            </p>
          </div>
        </section>

        {/* KONTAKT / LEAD FORMA */}
        <section
          id="kontakt"
          className="py-16 sm:py-20 md:py-24 bg-[#232323]"
        >
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-4">
                Rezervišite vozilo
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F4DC] mb-4">
                Proverite dostupnost za{" "}
                <span className="italic text-[#AE343F]">vaš datum</span>
              </h2>
              <p className="text-[#F5F4DC]/50 max-w-xl mx-auto">
                Pošaljite upit — javljamo se brzo sa potvrdom dostupnosti i
                ponudom prilagođenom vašoj satnici. Bez obaveze.
              </p>
            </div>
            <CarRentalLeadForm />
          </div>
        </section>

        {/* SEO HIDDEN CONTENT */}
        <section className="sr-only">
          <h2>
            Iznajmljivanje automobila za venčanje sa šoferom — Mercedes E, S,
            GLE i G klasa
          </h2>
          <p>
            HALO Uspomene posreduje najam luksuznih automobila za venčanja i
            svadbe širom Srbije. U ponudi su Mercedes E klasa, Mercedes S klasa
            (VIP limuzina), Mercedes GLE SUV i Mercedes G klasa — sva vozila sa
            profesionalnim šoferom. Iznajmite luksuzan auto za mladence,
            reprezentativno vozilo za kuma i barjaktara ili celu usklađenu
            svadbenu kolonu. Najam je moguć po satu (minimum dva sata) ili za
            ceo dan od osam sati. Organizujemo prevoz za venčanja u Beogradu,
            Novom Sadu, Nišu, Kragujevcu, Subotici i ostalim gradovima.
            Pouzdan rent a car sa vozačem za vaš najvažniji dan — čisto vozilo,
            tačnost i diskrecija.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
