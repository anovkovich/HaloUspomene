import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Tent,
  Wine,
  Wind,
  Sparkles,
  Clock,
  ShieldCheck,
  Truck,
  Heart,
  PartyPopper,
  Sun,
  Home,
  ArrowRight,
  Check,
  Star,
  Zap,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EquipmentRentalLeadForm from "./EquipmentRentalLeadForm";

// Feature flag: set NEXT_PUBLIC_EQUIPMENT_RENTAL_ENABLED=true to enable this page
const isEnabled = process.env.NEXT_PUBLIC_EQUIPMENT_RENTAL_ENABLED === "true";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title:
    "Iznajmljivanje Paviljona i Barskih Stolova za Venčanje | HALO Uspomene",
  description:
    "Paviljoni i barski stolovi za venčanje i svadbu. Doček svatova, polazak od kuće, ceremonija na otvorenom. Besplatna dostava do 50km — od 30€ po danu.",
  keywords: [
    "iznajmljivanje paviljona za venčanje",
    "paviljon za svadbu",
    "šator za venčanje",
    "šator za doček svatova",
    "barski stolovi za venčanje",
    "koktail stolovi za svadbu",
    "ventilatori za venčanje",
    "rashladni ventilatori za svadbu",
    "oprema za venčanje na otvorenom",
    "doček svatova oprema",
    "polazak od kuće venčanje",
    "ceremonija na otvorenom oprema",
    "iznajmljivanje šatora za svadbu",
    "paviljon za proslave",
    "beli paviljon venčanje",
    "oprema za svadbu beograd",
    "oprema za svadbu novi sad",
    "iznajmljivanje opreme za proslave",
    "event oprema srbija",
    "svatovi na otvorenom",
  ],
  openGraph: {
    title: "Iznajmljivanje Opreme za Venčanje na Otvorenom | HALO Uspomene",
    description:
      "Paviljoni, barski stolovi i ventilatori za doček svatova, polazak od kuće i ceremoniju na otvorenom. Dostava i montaža širom Srbije.",
    type: "website",
    url: `${siteUrl}/iznajmljivanje-opreme-za-vencanje`,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Iznajmljivanje Opreme za Venčanje | HALO Uspomene",
    description:
      "Paviljoni, barski stolovi i ventilatori — sve što vam treba za savršeno venčanje na otvorenom.",
  },
  alternates: {
    canonical: `${siteUrl}/iznajmljivanje-opreme-za-vencanje`,
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   EQUIPMENT DATA
═══════════════════════════════════════════════════════════════════════════ */

interface Equipment {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  icon: React.ReactNode;
  image?: string;
  description: string;
  features: string[];
}

const equipment: Equipment[] = [
  {
    id: "paviljon",
    name: "Elegantni Paviljon",
    tagline: "Beli paviljon 3×3m sa zavesama",
    badge: "Najpopularniji",
    icon: <Tent size={32} />,
    image: "/images/equipment/paviljon.png",
    description:
      "Klasičan beli paviljon sa elegantnim zavesama — idealan za doček svatova, polazak od kuće ili ceremoniju na otvorenom. Pruža hlad i svečan ambijent.",
    features: [
      "Dimenzije 3×3 metra",
      "Bele svilenkaste zavese",
      "Čelična konstrukcija",
      "Brza montaža",
    ],
  },
  {
    id: "barski-sto",
    name: "Barski Sto",
    tagline: "Visoki koktail sto sa navlakom",
    badge: "Elegantan",
    icon: <Wine size={32} />,
    image: "/images/equipment/barski-sto.png",
    description:
      "Visoki barski sto sa belom ili crnom navlakom — savršen za koktail prijem, doček gostiju ili aperitiv ispred sale. Stabilan i reprezentativan.",
    features: [
      "Visina 110 cm",
      "Prečnik ploče 80 cm",
      "Elastična navlaka u beloj ili crnoj boji",
      "Stabilna baza",
    ],
  },
  {
    id: "ventilator",
    name: "Rashladni Ventilator",
    tagline: "Industrijski ventilator za letnje evente",
    badge: "Uskoro dostupno",
    icon: <Wind size={32} />,
    image: "/images/equipment/ventilator.png",
    description:
      "Snažan industrijski ventilator za letnje svadbe — drži goste sveže tokom dočeka ili ceremonije na otvorenom. Tihi rad, jak protok vazduha.",
    features: [
      "Prečnik 60 cm",
      "3 brzine rada",
      "Tihi motor",
      "Podesiv nagib",
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   PRICING DATA
═══════════════════════════════════════════════════════════════════════════ */

interface PricingItem {
  name: string;
  perDay: number;
  perWeekend: number;
  note?: string;
}

interface PricingPackage {
  name: string;
  description: string;
  items: string[];
  price: number;
  priceNote: string;
  badge?: string;
  highlight?: boolean;
}

const individualPricing: PricingItem[] = [
  { name: "Paviljon 3×3m sa zavesama", perDay: 30, perWeekend: 60 },
  { name: "Barski sto 80cm (sa navlakom)", perDay: 10, perWeekend: 20 },
  { name: "Rashladni ventilator", perDay: 40, perWeekend: 80, note: "uskoro" },
];

const packages: PricingPackage[] = [
  {
    name: "Starter",
    description: "Za manji doček ili polazak od kuće",
    items: ["1× Paviljon 3×3m", "3× Barski sto", "Besplatna dostava do 50km"],
    price: 55,
    priceNote: "po danu",
  },
  {
    name: "Komplet",
    description: "Najpopularniji izbor za svadbe",
    items: ["2× Paviljon 3×3m", "6× Barski sto", "Besplatna dostava do 50km"],
    price: 105,
    priceNote: "po danu",
    badge: "Preporuka",
    highlight: true,
  },
  {
    name: "Vikend Komplet",
    description: "Petak–nedelja, treći dan gratis",
    items: ["2× Paviljon 3×3m", "6× Barski sto", "Besplatna dostava do 50km", "3 dana korišćenja"],
    price: 205,
    priceNote: "vikend",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   OCCASIONS
═══════════════════════════════════════════════════════════════════════════ */

const occasions = [
  {
    icon: <Home size={26} />,
    title: "Polazak od kuće",
    desc: "Elegantna postavka ispred kuće mladoženje ili mlade — paviljon za hlad, barski stolovi za piće dobrodošlice i svečan ambijent za fotografije.",
  },
  {
    icon: <Heart size={26} />,
    title: "Doček svatova",
    desc: "Tradicionalni doček gostiju sa stilom. Paviljon pruža hlad, barski stolovi služe za aperitiv, a ventilatori osvežavaju goste na letnjim svadbama.",
  },
  {
    icon: <Sun size={26} />,
    title: "Ceremonija na otvorenom",
    desc: "Venčanje u dvorištu, bašti ili vinogradu? Paviljoni stvaraju intiman prostor za ceremoniju, zaštićen od sunca i sa romantičnim zavesama.",
  },
  {
    icon: <PartyPopper size={26} />,
    title: "Koktail prijem",
    desc: "Pre ulaska u salu — elegantan koktail sa barskim stolovima za druženje, fotografisanje i lagani aperitiv dok čekate ostale goste.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   INCLUDED FEATURES
═══════════════════════════════════════════════════════════════════════════ */

const included = [
  {
    icon: <Truck size={24} />,
    title: "Besplatna dostava do 50km",
    desc: "Dostava i montaža uključene za lokacije do 50km. Za udaljenije lokacije — dogovaramo se o simboličnim troškovima transporta.",
  },
  {
    icon: <Sparkles size={24} />,
    title: "Čista i održavana oprema",
    desc: "Svaki komad opreme je temeljno očišćen i pregledan pre isporuke — spreman za fotografije.",
  },
  {
    icon: <Clock size={24} />,
    title: "Fleksibilni termini",
    desc: "Najam po danu ili za ceo vikend. Postavljamo dan ranije, skupljamo dan nakon — bez žurbe.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Tehnička podrška",
    desc: "Na raspolaganju smo telefonom tokom celog događaja. Ako nešto zatreba — tu smo za vas.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════════════════════════════════ */

const howItWorks = [
  {
    n: "01",
    title: "Pošaljite upit",
    desc: "Izaberite opremu i datum u formi ispod — odgovaramo brzo, bez obaveze.",
  },
  {
    n: "02",
    title: "Potvrda i ponuda",
    desc: "Proveravamo dostupnost za vaš termin i šaljemo jasnu ponudu sa svim detaljima.",
  },
  {
    n: "03",
    title: "Dostava i montaža",
    desc: "Dovozimo opremu dan pre događaja i postavljamo sve na dogovorenu lokaciju.",
  },
  {
    n: "04",
    title: "Uživajte u danu",
    desc: "Posle venčanja dolazimo da pokupimo opremu — vi se fokusirate na slavlje.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════════════════════════════════ */

const faqItems = [
  {
    q: "Koliko košta iznajmljivanje paviljona za venčanje?",
    a: "Paviljon 3×3m sa zavesama košta 30€ po danu. Barski sto (80cm prečnik, sa navlakom) je 10€ po danu. Nudimo i povoljne pakete — npr. Starter paket (1 paviljon + 3 stola) je 55€, a Komplet paket (2 paviljona + 6 stolova) je 105€. Ventilatori (~40€/dan) stižu uskoro!",
  },
  {
    q: "Da li je dostava i montaža uključena u cenu?",
    a: "Dostava i montaža su besplatne za lokacije do 50km (u jednom pravcu, tj. ~100km ukupno za dovoz i odvoz). Za udaljenije lokacije — dogovaramo se individualno o simboličnim troškovima transporta. Dolazimo dan pre događaja da postavimo sve, a dan nakon dolazimo da pokupimo.",
  },
  {
    q: "Mogu li da iznajmim opremu samo za nekoliko sati?",
    a: "Minimum najma je jedan dan jer uključuje dostavu, montažu i demontažu. Međutim, ako vam oprema treba za ceo vikend (petak–nedelja), plaćate samo 2 dana a dobijate 3 — treći dan je gratis!",
  },
  {
    q: "Da li radite samo svadbe ili i druge proslave?",
    a: "Radimo sve vrste proslava — svadbe, veridbe, rođendane, krštenja, proslave diplome, korporativne evente. Oprema je univerzalna i elegantan beli dizajn se uklapa u svaku svečanost.",
  },
  {
    q: "Šta ako je loše vreme na dan venčanja?",
    a: "Naši paviljoni su stabilni i izdržavaju slab do umeren vetar. Međutim, u slučaju najave jakih pljuskova ili oluje, preporučujemo da imate rezervni plan za zatvoreni prostor. Kontaktirajte nas da se dogovorimo o najboljoj opciji.",
  },
  {
    q: "Koliko unapred treba da rezervišem opremu?",
    a: "Preporučujemo rezervaciju 2–4 nedelje unapred, posebno za sezonu venčanja (maj–septembar) i vikende. Za hitne termine pozovite nas — potrudićemo se da nađemo rešenje.",
  },
  {
    q: "Da li dolazite u moj grad?",
    a: "Da, pokrivamo celu Srbiju — Beograd, Novi Sad, Niš, Kragujevac, Subotica, Čačak i okolinu. Besplatna dostava do 50km, za dalje lokacije se dogovaramo. Navedite lokaciju u upitu i potvrdićemo dostupnost.",
  },
  {
    q: "Koliko opreme trenutno imate na raspolaganju?",
    a: "Trenutno na raspolaganju imamo 4 paviljona (3×3m) i 12 visokih barskih stolova. Uskoro stižu i rashladni ventilatori, kao i dodatni stolovi za sedenje. Za velike proslave preporučujemo ranije rezervisanje da bismo osigurali dostupnost.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   JSON-LD SCHEMAS
═══════════════════════════════════════════════════════════════════════════ */

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Iznajmljivanje opreme za venčanja i proslave",
  name: "Iznajmljivanje paviljona, barskih stolova i ventilatora za venčanje",
  description:
    "Najam elegantnih paviljona, barskih stolova i rashladnih ventilatora za svadbe, doček svatova, polazak od kuće i ceremonije na otvorenom. Dostava i montaža širom Srbije.",
  provider: {
    "@type": "Organization",
    name: "HALO Uspomene",
    url: siteUrl,
  },
  areaServed: {
    "@type": "Country",
    name: "Srbija",
  },
  url: `${siteUrl}/iznajmljivanje-opreme-za-vencanje`,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Oprema za venčanja na otvorenom",
    itemListElement: [
      ...individualPricing.map((item) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: item.name,
        },
        priceSpecification: [
          {
            "@type": "UnitPriceSpecification",
            price: item.perDay,
            priceCurrency: "EUR",
            unitText: "po danu",
          },
          {
            "@type": "UnitPriceSpecification",
            price: item.perWeekend,
            priceCurrency: "EUR",
            unitText: "vikend (petak–nedelja)",
          },
        ],
      })),
      ...packages.map((pkg) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: `${pkg.name} paket`,
          description: pkg.items.join(", "),
        },
        price: pkg.price,
        priceCurrency: "EUR",
        priceValidUntil: new Date(
          new Date().setMonth(new Date().getMonth() + 6)
        ).toISOString(),
      })),
    ],
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

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

export default function IznajmljivanjeOpremeZaVencanje() {
  // Hide page in production until partner verification is complete
  if (!isEnabled) notFound();

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

        {/* ══════════════════════════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23232323' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="container mx-auto px-4 max-w-5xl relative">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Iznajmljivanje opreme za venčanje" },
              ]}
            />

            <div className="text-center mt-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-5">
                Oprema za vaš savršeni dan
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] leading-tight mb-6">
                Paviljoni, barski stolovi i ventilatori za{" "}
                <span className="italic text-[#AE343F]">venčanje</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#232323]/60 max-w-2xl mx-auto mb-4 leading-relaxed">
                Sve što vam treba za elegantno venčanje na otvorenom — doček
                svatova, polazak od kuće ili ceremoniju u bašti.
              </p>
              <p className="text-sm text-[#232323]/50 max-w-xl mx-auto mb-8">
                Besplatna dostava do 50km, montaža i demontaža uključeni.
                Po danu ili za ceo vikend.
              </p>

              {/* Hero icons */}
              <div className="flex items-center justify-center gap-6 sm:gap-10 mb-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-lg shadow-[#232323]/5 border border-[#232323]/5 flex items-center justify-center text-[#AE343F]">
                    <Tent size={32} />
                  </div>
                  <span className="text-xs font-medium text-[#232323]/60">
                    Paviljoni
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-lg shadow-[#232323]/5 border border-[#232323]/5 flex items-center justify-center text-[#AE343F]">
                    <Wine size={32} />
                  </div>
                  <span className="text-xs font-medium text-[#232323]/60">
                    Barski stolovi
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-lg shadow-[#232323]/5 border border-[#232323]/5 flex items-center justify-center text-[#AE343F]">
                    <Wind size={32} />
                  </div>
                  <span className="text-xs font-medium text-[#232323]/60">
                    Ventilatori
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#cene"
                  className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] btn-lg rounded-full px-10 border-none shadow-xl shadow-[#AE343F]/30"
                  data-track="cta_click"
                  data-track-cta-name="pogledaj_cene"
                  data-track-cta-location="hero"
                >
                  Pogledaj cene
                  <ArrowRight size={18} />
                </a>
                <a
                  href="#kontakt"
                  className="btn btn-outline border-[#232323]/20 text-[#232323] hover:bg-[#232323] hover:text-[#F5F4DC] btn-lg rounded-full px-10"
                >
                  Pošalji upit
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            INCLUDED / TRUST SECTION
        ══════════════════════════════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════════════════════════════
            EQUIPMENT CATALOG
        ══════════════════════════════════════════════════════════════════ */}
        <section id="oprema" className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Naša ponuda
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Oprema za{" "}
                <span className="italic text-[#AE343F]">svečane prilike</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Elegantni paviljoni, barski stolovi i rashladni ventilatori —
                sve što vam treba za savršen ambijent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {equipment.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col bg-white rounded-3xl border border-[#232323]/8 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#232323]/10 hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* Equipment image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#f5f4dc] to-[#ebe9d0]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className={`transition-transform duration-500 group-hover:scale-105 ${
                          item.id === "ventilator" || item.id === "barski-sto"
                            ? "object-contain p-6"
                            : "object-cover"
                        }`}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#AE343F]">
                        {item.icon}
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#232323]/40">
                          Fotografija uskoro
                        </span>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    {/* Badge */}
                    <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-[#F5F4DC] bg-[#AE343F]/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                      {item.badge}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-serif text-2xl text-[#232323] leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-sm text-[#232323]/45 mt-1 mb-4">
                      {item.tagline}
                    </p>
                    <p className="text-sm text-[#232323]/60 leading-relaxed mb-5 flex-1">
                      {item.description}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-2 mb-6">
                      {item.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-[#232323]/70"
                        >
                          <Check
                            size={14}
                            className="text-[#AE343F] shrink-0"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <a
                      href="#kontakt"
                      className="btn btn-sm bg-[#232323] hover:bg-[#AE343F] text-[#F5F4DC] rounded-full border-none w-full"
                    >
                      Pošalji upit
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            PRICING TABLE
        ══════════════════════════════════════════════════════════════════ */}
        <section id="cene" className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Transparentne cene
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Cenovnik{" "}
                <span className="italic text-[#AE343F]">opreme</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Pojedinačna oprema ili komplet paketi sa popustom — izaberite
                šta vam najviše odgovara.
              </p>
            </div>

            {/* Individual pricing table */}
            <div className="mb-16">
              <h3 className="font-serif text-2xl text-[#232323] mb-6 text-center">
                Pojedinačne stavke
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full max-w-3xl mx-auto">
                  <thead>
                    <tr className="border-b-2 border-[#232323]/10">
                      <th className="text-left py-4 px-4 font-serif text-lg text-[#232323]">
                        Stavka
                      </th>
                      <th className="text-center py-4 px-4 font-serif text-lg text-[#232323]">
                        Po danu
                      </th>
                      <th className="text-center py-4 px-4 font-serif text-lg text-[#232323]">
                        Vikend
                        <span className="block text-xs font-normal text-[#232323]/50">
                          (petak–nedelja)
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {individualPricing.map((item, idx) => (
                      <tr
                        key={item.name}
                        className={`border-b border-[#232323]/5 ${
                          idx % 2 === 0 ? "bg-[#f5f4dc]/20" : ""
                        } ${item.note ? "opacity-60" : ""}`}
                      >
                        <td className="py-4 px-4 text-[#232323]/80">
                          {item.name}
                          {item.note && (
                            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-[#AE343F] bg-[#AE343F]/10 px-2 py-0.5 rounded-full">
                              {item.note}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-serif text-xl text-[#232323]">
                            {item.note ? "~" : ""}{item.perDay}€
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-xs text-[#232323]/40 line-through">
                              {item.note ? "~" : ""}{item.perDay * 3}€
                            </span>
                            <span className="font-serif text-xl text-[#AE343F] font-semibold">
                              {item.note ? "~" : ""}{item.perWeekend}€
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Package pricing */}
            <div>
              <h3 className="font-serif text-2xl text-[#232323] mb-8 text-center">
                Paketi sa popustom
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className={`relative flex flex-col p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 ${
                      pkg.highlight
                        ? "border-[#AE343F] bg-gradient-to-b from-[#AE343F]/5 to-transparent shadow-xl shadow-[#AE343F]/10 scale-[1.02] md:scale-105"
                        : "border-[#232323]/10 bg-white hover:border-[#AE343F]/30"
                    }`}
                  >
                    {/* Badge */}
                    {pkg.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#F5F4DC] bg-[#AE343F] px-4 py-1.5 rounded-full shadow-lg">
                          {pkg.highlight ? <Star size={12} /> : <Zap size={12} />}
                          {pkg.badge}
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6 pt-2">
                      <h4 className="font-serif text-2xl text-[#232323] mb-1">
                        {pkg.name}
                      </h4>
                      <p className="text-sm text-[#232323]/50">{pkg.description}</p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <span className="font-serif text-5xl text-[#232323]">
                        {pkg.price}€
                      </span>
                      <span className="text-sm text-[#232323]/50 ml-1">
                        {pkg.priceNote}
                      </span>
                    </div>

                    {/* Items list */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {pkg.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#AE343F]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={12} className="text-[#AE343F]" />
                          </div>
                          <span className="text-[#232323]/70 text-sm">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href="#kontakt"
                      className={`btn rounded-full border-none w-full ${
                        pkg.highlight
                          ? "bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] shadow-lg shadow-[#AE343F]/30"
                          : "bg-[#232323] hover:bg-[#AE343F] text-[#F5F4DC]"
                      }`}
                    >
                      Izaberi {pkg.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-[#232323]/40 mt-10 max-w-2xl mx-auto">
              Cene su izražene u evrima (€). Vikend = cena × 2 za 3 dana (petak–nedelja).
              Besplatna dostava i montaža do 50km. Za udaljenije lokacije — pošaljite upit.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            OCCASIONS / USE CASES
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Za svaku priliku
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Gde sve možete koristiti{" "}
                <span className="italic text-[#AE343F]">našu opremu</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Od polaska od kuće do dočeka svatova — stvorićemo savršen
                ambijent za svaki deo vašeg venčanja.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {occasions.map((o) => (
                <div
                  key={o.title}
                  className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border border-[#232323]/5 shadow-sm hover:shadow-lg transition-shadow"
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

        {/* ══════════════════════════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Kako funkcioniše
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323]">
                Jednostavno u{" "}
                <span className="italic text-[#AE343F]">4 koraka</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((step, idx) => (
                <div key={step.n} className="relative">
                  {/* Connector line (hidden on last item and mobile) */}
                  {idx < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#AE343F]/30 to-transparent" />
                  )}
                  <div className="p-6 sm:p-8 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5 text-center h-full">
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════════════════════════ */}
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
                  className="group bg-white rounded-2xl border border-[#232323]/5 overflow-hidden shadow-sm"
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
              Imate dodatnih pitanja?{" "}
              <a
                href="#kontakt"
                className="text-[#AE343F] font-medium hover:underline"
              >
                Pošaljite nam upit
              </a>{" "}
              — rado ćemo odgovoriti.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            CONTACT / LEAD FORM
        ══════════════════════════════════════════════════════════════════ */}
        <section
          id="kontakt"
          className="py-16 sm:py-20 md:py-24 bg-[#232323] relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#AE343F]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 max-w-3xl relative">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-4">
                Rezervišite opremu
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F4DC] mb-4">
                Proverite dostupnost za{" "}
                <span className="italic text-[#AE343F]">vaš datum</span>
              </h2>
              <p className="text-[#F5F4DC]/50 max-w-xl mx-auto">
                Pošaljite upit — javljamo se brzo sa potvrdom dostupnosti i
                ponudom prilagođenom vašim potrebama. Bez obaveze.
              </p>
            </div>
            <EquipmentRentalLeadForm />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SEO HIDDEN CONTENT
        ══════════════════════════════════════════════════════════════════ */}
        <section className="sr-only">
          <h2>
            Iznajmljivanje paviljona, barskih stolova i ventilatora za venčanje
          </h2>
          <p>
            HALO Uspomene posreduje najam opreme za venčanja i proslave širom
            Srbije. U ponudi su elegantni beli paviljoni sa zavesama dimenzija
            3×3 metra (30€/dan), visoki barski stolovi 80cm prečnika sa navlakama
            za koktail prijeme (10€/dan), i rashladni industrijski ventilatori
            za letnje svadbe na otvorenom (~40€/dan, uskoro dostupni). Trenutno
            na raspolaganju: 4 paviljona i 12 visokih stolova. Starter paket
            (1 paviljon + 3 stola) samo 55€, Komplet paket (2 paviljona + 6 stolova)
            105€. Oprema je idealna za doček svatova, polazak od kuće, ceremonije u
            dvorištu ili bašti, i koktail prijeme ispred sale. Besplatna dostava
            i montaža za lokacije do 50km (100km ukupno). Radimo širom Srbije —
            Beograd, Novi Sad, Niš, Kragujevac, Subotica, Čačak i svi ostali
            gradovi. Najam po danu ili za ceo vikend — fleksibilni smo i
            prilagođavamo se vašim potrebama. Čista, održavana oprema spremna
            za fotografije. Tehnička podrška dostupna tokom celog događaja.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
