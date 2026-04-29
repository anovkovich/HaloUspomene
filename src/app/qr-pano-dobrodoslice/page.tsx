import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  MousePointerClick,
  Printer,
  QrCode,
  Check,
  ArrowRight,
  Sparkles,
  Users,
  Shuffle,
  ScanLine,
  Smartphone,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { formatPrice, pricing } from "@/data/pricing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title: "QR Pano Dobrodošlice — Pametan Raspored Sedenja | HALO Uspomene",
  description:
    "QR Pano dobrodošlice za venčanje — gosti skeniraju kod na ulazu u salu, ukucaju ime i telefon ih vodi do njihovog stola. Drag-and-drop editor za raspored sedenja. Bez gužve na ulazu.",
  keywords: [
    "qr pano dobrodošlice",
    "qr pano za venčanje",
    "raspored sedenja",
    "raspored sedenja za venčanje",
    "raspored sedenja online",
    "digitalni raspored sedenja",
    "raspored stolova svadba",
    "QR kod za sedenje",
    "pametno sedenje venčanje",
    "drag drop raspored",
    "gde sedim svadba",
    "pano za salu",
    "ulaz u salu venčanje",
    "moderna svadba srbija",
  ],
  openGraph: {
    title: "QR Pano Dobrodošlice | HALO Uspomene",
    description:
      "Pametan raspored sedenja za svadbu — gosti skeniraju QR pano i pronalaze svoj sto u 2 sekunde.",
    type: "website",
    url: `${siteUrl}/qr-pano-dobrodoslice`,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Pano Dobrodošlice | HALO Uspomene",
    description:
      "Pametan raspored sedenja — drag-and-drop editor i QR pano za ulaz u salu.",
  },
  alternates: {
    canonical: `${siteUrl}/qr-pano-dobrodoslice`,
  },
};

const steps = [
  {
    n: "01",
    icon: <MousePointerClick size={24} />,
    title: "Rasporedite goste lako",
    desc: "Pomoću našeg alata napravite šemu stolova i rasporedite goste. Možete menjati raspored do poslednjeg dana.",
  },
  {
    n: "02",
    icon: <Printer size={24} />,
    title: "Odštampajte QR Pano",
    desc: "Generišemo elegantan pano sa QR kodom i dobrodošlicom. Odnesete u štampariju, postavite na ulaz u salu.",
  },
  {
    n: "03",
    icon: <QrCode size={24} />,
    title: "Gosti pronalaze svoj sto",
    desc: "Gost skenira kod, ukuca svoje ime, i telefon ga vodi pravo do stola — uz mali prikaz rasporeda stolova u sali.",
  },
];

const benefits = [
  {
    icon: <Users size={20} />,
    title: "Nema gužve na ulazu",
    desc: "Gosti se sami snalaze — nema potrebe za hostesama ili štampanim spiskovima.",
  },
  {
    icon: <Shuffle size={20} />,
    title: "Omogućavamo promene u zadnji čas",
    desc: "Neko otkazao ili dovodi još nekog sa sobom? Promenite raspored u editoru  a pano ostaje isti.",
  },
  {
    icon: <Smartphone size={20} />,
    title: "Ne treba nikakva aplikacija",
    desc: "Gosti skeniraju kamerom telefona. Sve radi besprekorno na svim smartphone uređajima.",
  },
  {
    icon: <ScanLine size={20} />,
    title: "Ostavlja wow utisak",
    desc: "Moderan touch koji gosti pamte i prepričavaju. Svi vole nove trendove.",
  },
];

export default function QRPanoLandingPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-12 sm:pt-36 sm:pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-[#F5F4DC] to-[#faf9f6] overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#AE343F]/8 rounded-full blur-[120px] translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] -translate-x-1/3" />

          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "QR Pano dobrodošlice" },
              ]}
            />

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto mt-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#AE343F]/8 border border-[#AE343F]/20 rounded-full mb-5">
                  <Sparkles size={12} className="text-[#AE343F]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#AE343F]">
                    Najpopularnije
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] leading-tight mb-5">
                  QR Pano{" "}
                  <span className="italic text-[#AE343F]">dobrodošlice</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-[#232323]/65 leading-relaxed mb-8">
                  Pametan raspored sedenja za svadbu. Zaboravite na ručno
                  crtanje stolova i zbunjujuće liste na ulazu — gosti skeniraju
                  pano i sami pronalaze svoje mesto za 2 sekunde!
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/napravi-pozivnicu"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-xl shadow-[#AE343F]/20"
                  >
                    Uzmite uz pozivnicu
                  </Link>
                  <Link
                    href="/cene"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-[#232323]/15 hover:border-[#232323] text-[#232323] text-sm uppercase tracking-widest font-medium rounded-full transition-colors"
                  >
                    Cene
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <p className="mt-6 text-sm text-[#232323]/50">
                  Cena rasporeda sedenja:{" "}
                  <span className="font-bold text-[#AE343F]">
                    {formatPrice(pricing.pozivnica.raspored.price)}
                  </span>{" "}
                  uz pozivnicu, a još povoljnije uz premium pozivnicu! Moguće je
                  uzeti alat i bez pozivnice.
                </p>
              </div>

              <div className="relative lg:order-last lg:self-end">
                <Image
                  src="/images/pano.webp"
                  alt="QR Pano dobrodošlice — gost skenira QR kod na ulazu u salu i pronalazi svoj sto"
                  width={1200}
                  height={1500}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="w-full h-auto object-contain block -mb-12 sm:-mb-16 md:-mb-20 drop-shadow-[0_20px_30px_rgba(0,0,0,0.08)]"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* How it works — 3 steps */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Kako radi
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
                Tri koraka — Vaše veče počinje{" "}
                <span className="italic text-[#AE343F]">bez gužve</span>.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {steps.map((step) => (
                <div
                  key={step.n}
                  className="relative bg-[#faf9f6] rounded-2xl sm:rounded-3xl p-7 sm:p-8 border border-stone-200"
                >
                  <span className="absolute top-5 right-6 text-5xl font-serif font-black text-[#AE343F]/15">
                    {step.n}
                  </span>
                  <div className="w-14 h-14 rounded-2xl bg-[#AE343F] text-[#F5F4DC] flex items-center justify-center mb-5 shadow-lg shadow-[#AE343F]/30">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#232323] mb-3 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#232323]/65 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 sm:py-20 bg-[#F5F4DC]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Prednosti QR Panoa
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
                Bolji je od štampanog spiska jer:
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-stone-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#232323] mb-1">
                      {b.title}
                    </p>
                    <p className="text-sm text-[#232323]/60 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#faf9f6] to-[#F5F4DC] rounded-3xl p-8 sm:p-10 md:p-12 border border-stone-200">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#232323] text-center mb-8">
                Šta tačno dobijate
              </h2>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-8">
                {[
                  'Alat za "crtanje" šeme stolova',
                  "Više oblika stolova (okrugli, pravougaoni, mladenački)",
                  "Pregled mape sale sa vizuelnim rasporedom",
                  "QR kod za pano (visoka rezolucija za štampu)",
                  "Personalizovan link gde-sedim za goste",
                  "Pretraga po imenu gosta",
                  "Statistike popunjenosti stolova",
                  "Promene moguće do poslednjeg trenutka",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-[#232323]/80"
                  >
                    <Check
                      size={16}
                      className="text-[#AE343F] shrink-0 mt-0.5"
                      strokeWidth={2.5}
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/napravi-pozivnicu"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-xl shadow-[#AE343F]/20"
                >
                  Napravite pozivnicu sa rasporedom
                  <ArrowRight size={16} />
                </Link>
                <p className="mt-3 text-xs text-[#232323]/50">
                  Pozivnica + Raspored sedenja + Digitalna audio knjiga ={" "}
                  <span className="font-bold text-[#AE343F]">
                    {formatPrice(pricing.pozivnica.bundlePrice)}
                  </span>{" "}
                  (ušteda{" "}
                  {formatPrice(
                    pricing.pozivnica.bundleFullPrice -
                      pricing.pozivnica.bundlePrice,
                  )}
                  )
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO hidden */}
        <section className="sr-only">
          <h2>
            QR Pano dobrodošlice — pametan raspored sedenja za venčanja u Srbiji
          </h2>
          <p>
            QR Pano dobrodošlice je moderno rešenje za raspored sedenja na
            venčanjima i svadbama. Umesto štampanih spiskova ili sedećih
            kartica, gosti skeniraju QR kod na panu postavljenom na ulazu u
            salu, ukucaju svoje ime, i telefon ih vodi pravo do njihovog stola.
            Sistem radi u svim gradovima Srbije: Beograd, Novi Sad, Niš,
            Kragujevac, Subotica, Čačak. Kompatibilno sa svim modernim Android i
            iPhone uređajima — bez instalacije aplikacije.
          </p>
          <p>
            Drag-and-drop editor za raspored stolova omogućava jednostavno
            pomeranje gostiju, dodavanje novih stolova različitih oblika
            (okrugli, pravougaoni, mladenački sto) i promene do poslednjeg
            trenutka. Cena rasporeda sedenja: 2.500 din uz pozivnicu, ili 8.500
            din za kompletni paket (pozivnica + raspored + digitalna audio
            knjiga). Pogledajte <Link href="/cene">cene HALO Uspomene</Link> ili{" "}
            <Link href="/napravi-pozivnicu">
              napravite pozivnicu sa rasporedom
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
