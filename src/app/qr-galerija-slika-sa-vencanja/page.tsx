import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  QrCode,
  Camera,
  Images,
  Download,
  ShieldCheck,
  Smartphone,
  Sparkles,
  FolderDown,
  Lock,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { formatPrice, pricing } from "@/data/pricing";
import GalleryLeadForm from "./GalleryLeadForm";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";
const pagePath = "/qr-galerija-slika-sa-vencanja";
const pageUrl = `${siteUrl}${pagePath}`;
const galleryPrice = pricing.pozivnica.galerija.price;

export const metadata: Metadata = {
  title: {
    absolute:
      "QR Galerija Slika sa Venčanja — Sve Fotografije Gostiju na Jednom Mestu | HALO Uspomene",
  },
  description:
    "Gosti skeniraju QR kod i dodaju svoje fotografije sa vašeg venčanja — bez aplikacije. Sve slike sa svadbe na jednom mestu, a vi kasnije pregledate i preuzmete celu galeriju. Za venčanja širom Srbije.",
  keywords: [
    "qr galerija slika sa venčanja",
    "galerija slika sa venčanja",
    "slike gostiju sa venčanja",
    "fotografije gostiju sa venčanja",
    "qr kod za slike sa venčanja",
    "qr kod za fotografije sa svadbe",
    "deljena galerija fotografija venčanje",
    "zajednička galerija slika venčanje",
    "aplikacija za slike sa venčanja",
    "kako sakupiti slike sa venčanja",
    "prikupljanje fotografija sa venčanja",
    "galerija fotografija sa svadbe",
    "svadbena galerija gostiju",
    "digitalna galerija za venčanje",
    "slike sa svadbe na jednom mestu",
    "deljenje fotografija sa venčanja",
    "qr galerija za svadbu",
    "fotografije sa venčanja qr kod",
    "galerija slika sa venčanja beograd",
    "galerija slika sa venčanja novi sad",
  ],
  openGraph: {
    title:
      "QR Galerija Slika sa Venčanja — Fotografije Gostiju na Jednom Mestu",
    description:
      "Gosti skeniraju QR kod i dele slike sa vašeg venčanja — bez aplikacije. Sve fotografije sa svadbe na jednom mestu, a vi preuzmete celu galeriju.",
    type: "website",
    url: pageUrl,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Galerija Slika sa Venčanja | HALO Uspomene",
    description:
      "Gosti skeniraju QR kod i dodaju svoje fotografije — sve slike sa svadbe na jednom mestu.",
  },
  alternates: { canonical: pageUrl },
};

const steps = [
  {
    n: "01",
    icon: <QrCode size={26} />,
    title: "Postavite QR kod",
    desc: "Odštampan QR kod stavite na zahvalnice, na stolove ili na pano dobrodošlice. Gostima je dovoljna kamera telefona — ništa ne moraju da instaliraju.",
  },
  {
    n: "02",
    icon: <Camera size={26} />,
    title: "Gosti dodaju slike",
    desc: "Gost skenira kod, unese ime i doda fotografije direktno sa svog telefona. Slike se odmah nalaze u vašoj galeriji — tokom i posle venčanja.",
  },
  {
    n: "03",
    icon: <FolderDown size={26} />,
    title: "Preuzmete celu galeriju",
    desc: "Vi u svom portalu pregledate sve fotografije koje su gosti podelili i preuzmete ih — pojedinačno ili sve odjednom kao jedan ZIP.",
  },
];

const features = [
  {
    icon: <Smartphone size={24} />,
    title: "Bez aplikacije",
    desc: "Gost samo skenira QR kod telefonom i dodaje slike iz pregledača. Nema preuzimanja aplikacije, naloga ni komplikacija — radi iz prve.",
  },
  {
    icon: <Images size={24} />,
    title: "Sve slike na jednom mestu",
    desc: "Fotografije gostiju obično zauvek ostanu rasute po desetinama telefona. Ovde se sve slivaju u jednu galeriju — ništa se ne gubi.",
  },
  {
    icon: <Sparkles size={24} />,
    title: "Radi sa svakim telefonom",
    desc: "iPhone (uključujući HEIC format) i Android podjednako. Slike se automatski pripreme tako da se pravilno prikažu svima.",
  },
  {
    icon: <Lock size={24} />,
    title: "Privatno — samo za vas",
    desc: "Javno se ne pretražuju tuđe slike. Kompletnu galeriju pregledate i preuzimate samo vi, mladenci, u svom zaštićenom portalu.",
  },
  {
    icon: <Download size={24} />,
    title: "Preuzmi sve kao ZIP",
    desc: "Izaberite fotografije koje želite (ili sve) i preuzmite ih jednim klikom kao jedan ZIP fajl — bez ručnog čuvanja slike po slike.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Bez gubljenja uspomena",
    desc: "Podsećamo vas SMS-om da na vreme preuzmete slike dok je galerija aktivna, da vam nijedna dragocena fotografija ne promakne.",
  },
];

const faqItems = [
  {
    q: "Kako da sakupim sve slike gostiju sa venčanja na jednom mestu?",
    a: "Umesto da jurite fotografije po telefonima gostiju, postavite QR kod (na zahvalnice, stolove ili pano dobrodošlice). Gost skenira kod, unese ime i doda slike direktno sa telefona. Sve fotografije se automatski slivaju u vašu zajedničku galeriju, koju vi kasnije pregledate i preuzmete.",
  },
  {
    q: "Da li gostima treba aplikacija da dodaju fotografije?",
    a: "Ne. Gost samo skenira QR kod kamerom telefona i otvori se stranica u pregledaču na kojoj dodaje slike. Nema instalacije aplikacije, nema pravljenja naloga — sve radi direktno iz telefona, i na iPhone-u i na Androidu.",
  },
  {
    q: "Koliko košta QR galerija slika za venčanje?",
    a: `Cena QR galerije fotografija je ${formatPrice(
      galleryPrice
    )}. Možete je uzeti samostalno ili uz digitalnu pozivnicu i raspored sedenja. Javite se preko kontakt forme i dobijate sve informacije i aktivaciju.`,
  },
  {
    q: "Kako gosti dele svoje slike preko QR koda?",
    a: "Gost prisloni kameru telefona uz QR kod, klikne na link koji iskoči, unese svoje ime i izabere fotografije iz galerije telefona. Slike se otpremaju za par sekundi i odmah se nalaze u vašoj galeriji — mogu da dodaju slike i tokom slavlja i danima posle.",
  },
  {
    q: "Da li mogu da preuzmem sve fotografije sa venčanja odjednom?",
    a: "Da. U svom portalu vidite sve slike koje su gosti podelili. Možete preuzeti pojedinačnu fotografiju, izabrati određene, ili preuzeti sve odjednom kao jedan ZIP fajl — brzo i bez ručnog čuvanja svake slike.",
  },
  {
    q: "Da li rade fotografije snimljene iPhone-om (HEIC format)?",
    a: "Da. iPhone podrazumevano snima u HEIC formatu koji se na drugim uređajima često ne prikazuje. Naša galerija automatski konvertuje takve slike tako da se pravilno prikažu i preuzmu na svakom telefonu i računaru.",
  },
  {
    q: "Da li su fotografije javno dostupne svima?",
    a: "Ne. Javnu galeriju gosti vide samo kao potvrdu da su slike podeljene — ne mogu da pregledaju tuđe fotografije. Kompletnu galeriju sa svim slikama pregledate i preuzimate samo vi, mladenci, u svom zaštićenom portalu.",
  },
  {
    q: "Mogu li da naručim samo galeriju, bez digitalne pozivnice?",
    a: "Možete. QR galerija se prodaje i samostalno — ne morate imati našu pozivnicu. Dovoljno je da napravite besplatan nalog na planeru venčanja, mi vam aktiviramo galeriju, i dobijate QR kod za štampu na zahvalnicama.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "QR galerija fotografija za venčanje",
  name: "QR galerija slika sa venčanja — deljena galerija fotografija gostiju",
  description:
    "Digitalna QR galerija u koju gosti skeniranjem QR koda dodaju svoje fotografije sa venčanja, bez aplikacije. Mladenci pregledaju i preuzimaju sve slike sa svadbe na jednom mestu.",
  provider: {
    "@type": "Organization",
    "@id": `${siteUrl}/#business`,
    name: "HALO Uspomene",
    url: siteUrl,
  },
  areaServed: { "@type": "Country", name: "Srbija" },
  url: pageUrl,
  offers: {
    "@type": "Offer",
    price: galleryPrice,
    priceCurrency: "RSD",
    availability: "https://schema.org/InStock",
    url: pageUrl,
  },
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

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Kako sakupiti slike gostiju sa venčanja pomoću QR galerije",
  description:
    "U tri koraka sakupite sve fotografije koje gosti naprave na vašem venčanju, na jednom mestu.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.desc,
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Početna", item: siteUrl },
    {
      "@type": "ListItem",
      position: 2,
      name: "QR galerija slika sa venčanja",
      item: pageUrl,
    },
  ],
};

export default function QrGalerijaSlikaSaVencanja() {
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        {/* HERO */}
        <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-5xl">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "QR galerija slika sa venčanja" },
              ]}
            />
            <div className="text-center mt-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-5">
                Sve slike gostiju na jednom mestu
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] leading-tight mb-6">
                QR galerija slika sa{" "}
                <span className="italic text-[#AE343F]">venčanja</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#232323]/60 max-w-2xl mx-auto mb-4 leading-relaxed">
                Gosti skeniraju QR kod i dodaju svoje fotografije direktno sa
                telefona — bez aplikacije. Sve slike sa vašeg venčanja slivaju
                se u jednu galeriju.
              </p>
              <p className="text-sm text-[#232323]/50 max-w-xl mx-auto mb-8">
                Vi kasnije u miru pregledate i preuzmete celu galeriju — da vam
                nijedna dragocena uspomena ne ostane zaboravljena u tuđem
                telefonu.
              </p>

              <div className="mb-8 flex justify-center">
                <div className="relative flex items-center justify-center">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(174,52,63,0.12),transparent_65%)] blur-2xl"
                  />
                  <div className="relative z-10 w-28 h-28 rounded-3xl bg-white border border-[#232323]/8 shadow-xl flex items-center justify-center">
                    <QrCode size={56} className="text-[#AE343F]" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="#kontakt"
                  className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] btn-lg rounded-full px-10 border-none shadow-xl shadow-[#AE343F]/30"
                  data-track="cta_click"
                  data-track-cta-name="zatrazi_galeriju"
                  data-track-cta-location="hero"
                >
                  Zatražite galeriju
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#kako-funkcionise"
                  className="btn btn-outline border-[#232323]/20 text-[#232323] hover:bg-[#232323] hover:text-[#F5F4DC] btn-lg rounded-full px-10"
                >
                  Kako funkcioniše
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES / TRUST */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Zašto QR galerija
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Nijedna slika sa svadbe{" "}
                <span className="italic text-[#AE343F]">ne ostaje izgubljena</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Profesionalni fotograf uhvati zvanične kadrove — ali najlepši,
                iskreni trenuci često ostanu samo u telefonima gostiju. Ova
                galerija ih sakuplja sve na jedno mesto.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="p-6 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-serif text-xl text-[#232323] mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-[#232323]/55 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KAKO FUNKCIONISE */}
        <section id="kako-funkcionise" className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Kako funkcioniše
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323]">
                Sve slike u <span className="italic text-[#AE343F]">3 koraka</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step) => (
                <div
                  key={step.n}
                  className="relative p-8 rounded-3xl bg-white border border-[#232323]/8 text-center"
                >
                  <span className="font-serif text-5xl text-[#AE343F]/20 block mb-2">
                    {step.n}
                  </span>
                  <div className="w-14 h-14 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
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

        {/* CENA */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="rounded-3xl border border-[#232323]/8 bg-[#f5f4dc]/40 p-8 sm:p-10 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-3">
                Cena
              </p>
              <div className="flex items-baseline justify-center gap-2 mb-3">
                <span className="text-5xl font-serif font-bold text-[#AE343F]">
                  {formatPrice(galleryPrice)}
                </span>
              </div>
              <p className="text-[#232323]/60 leading-relaxed max-w-xl mx-auto mb-6">
                QR galerija fotografija — samostalno ili uz digitalnu pozivnicu i
                raspored sedenja. Dobijate QR kod za štampu na zahvalnicama i
                pristup celoj galeriji u svom portalu.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="#kontakt"
                  className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] rounded-full px-8 border-none"
                  data-track="cta_click"
                  data-track-cta-name="zatrazi_galeriju"
                  data-track-cta-location="section_cena"
                >
                  Zatražite galeriju
                </Link>
                <Link
                  href="/cene"
                  className="btn btn-outline border-[#232323]/20 text-[#232323] hover:bg-[#232323] hover:text-[#F5F4DC] rounded-full px-8"
                >
                  Sve cene i paketi
                </Link>
              </div>
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
                Sve što vas <span className="italic text-[#AE343F]">zanima</span>
              </h2>
            </div>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.q}
                  className="group bg-white rounded-2xl border border-[#232323]/5 overflow-hidden"
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

        {/* KONTAKT / LEAD FORMA */}
        <section id="kontakt" className="py-16 sm:py-20 md:py-24 bg-[#232323]">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <Heart
                size={28}
                className="text-[#AE343F] mx-auto mb-5"
                fill="currentColor"
              />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F4DC] mb-4">
                Zatražite QR galeriju za{" "}
                <span className="italic text-[#AE343F]">vaše venčanje</span>
              </h2>
              <p className="text-[#F5F4DC]/55 max-w-xl mx-auto">
                Pošaljite upit — javljamo se brzo sa svim informacijama i
                aktivacijom galerije. Bez obaveze.
              </p>
            </div>

            <GalleryLeadForm />

            <p className="text-center text-sm text-[#F5F4DC]/40 mt-8">
              Pogledajte i{" "}
              <Link
                href="/qr-pano-dobrodoslice"
                className="text-[#F5F4DC]/70 hover:text-[#AE343F] underline"
              >
                QR Pano dobrodošlice
              </Link>{" "}
              ili{" "}
              <Link
                href="/napravi-pozivnicu"
                className="text-[#F5F4DC]/70 hover:text-[#AE343F] underline"
              >
                napravite kompletnu digitalnu pozivnicu
              </Link>
              .
            </p>
          </div>
        </section>

        {/* SEO HIDDEN CONTENT */}
        <section className="sr-only">
          <h2>
            QR galerija slika sa venčanja — sakupite sve fotografije gostiju na
            jednom mestu
          </h2>
          <p>
            HALO Uspomene nudi digitalnu QR galeriju fotografija za venčanja i
            svadbe širom Srbije. Umesto da slike gostiju zauvek ostanu rasute po
            desetinama telefona, gosti skeniraju QR kod (na zahvalnici, stolu
            ili panou dobrodošlice), unesu ime i dodaju svoje fotografije
            direktno sa telefona — bez ikakve aplikacije. Sve slike sa svadbe
            slivaju se u jednu zajedničku galeriju. Mladenci u svom zaštićenom
            portalu pregledaju sve fotografije koje su gosti podelili i preuzmu
            ih pojedinačno ili sve odjednom kao jedan ZIP fajl. Galerija radi sa
            svakim telefonom, uključujući iPhone i HEIC format, koji se
            automatski konvertuje. Idealno rešenje za prikupljanje slika gostiju,
            deljenu galeriju fotografija i digitalni svadbeni album. Dostupno u
            Beogradu, Novom Sadu, Nišu, Kragujevcu, Subotici, Čačku i ostalim
            gradovima Srbije. Cena QR galerije: {formatPrice(galleryPrice)},
            samostalno ili uz digitalnu pozivnicu i raspored sedenja.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
