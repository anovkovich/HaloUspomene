import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  X as XIcon,
  MapPin,
  QrCode,
  Timer,
  Smartphone,
  Phone,
  ArrowRight,
  Heart,
  Award,
  Clock,
  Globe,
  LayoutDashboard,
  Gift,
  Send,
  CheckCircle2,
  PartyPopper,
  Printer,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PromoCapture from "@/components/PromoCapture";
import LiveExamplesRow from "./LiveExamplesRow";
import StampaneLeadForm from "./StampaneLeadForm";
import ComparisonHint from "./ComparisonHint";
import {
  pricing,
  formatPrice,
  getAudioPrice,
  isAudioDiscountActive,
  getTier,
  getKompletnoSavings,
  getRodjendanPozivnicaPrice,
} from "@/data/pricing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title: "Digitalne Pozivnice za Venčanje i Proslave",
  description:
    "Digitalna pozivnica za venčanje, rođendan ili punoletstvo — potvrde dolaska, odbrojavanje i mapa. Od 4.500 din, gotova odmah. Radimo i pametne štampane sa QR kodom.",
  keywords: [
    // Redosled prati stvarnu potraznju iz GSC-a: "online" i "digitaln*" nose
    // gotovo sve prikaze, dok upit sa recju "website" u nalogu ne postoji.
    "digitalne pozivnice",
    "digitalna pozivnica",
    "izrada pozivnica online",
    "napravi pozivnicu online",
    "online pozivnica",
    "pozivnica za venčanje",
    "pozivnice za vencanje",
    "digitalne pozivnice za vencanje",
    "pozivnice za vencanje online",
    "pozivnica za svadbu",
    "elektronska pozivnica",
    "e-pozivnica",
    "cena digitalne pozivnice",
    "pozivnica za venčanje cena",
    "pozivnica sa potvrdom dolaska",
    "pozivnica za venčanje sa QR kodom",
    "pozivnica za rođendan",
    "pozivnica za dečiji rođendan",
    "pozivnica za prvi rođendan",
    "pozivnica za punoletstvo",
    "pozivnice za 18 rodjendan",
    "štampane pozivnice sa QR kodom",
    "pozivnica za venčanje srbija",
    "pozivnica za venčanje beograd",
  ],
  openGraph: {
    title: "Digitalne Pozivnice za Venčanje i Proslave | HALO Uspomene",
    description:
      "Potvrde dolaska, odbrojavanje i mapa — u jednoj pozivnici koja se deli linkom. Od 4.500 din. Radimo i pametne štampane sa QR kodom.",
    type: "website",
    url: `${siteUrl}/pozivnice`,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digitalne Pozivnice za Venčanje i Proslave",
    description:
      "Venčanje, rođendan ili punoletstvo — pozivnica gotova odmah. Od 4.500 din.",
  },
  alternates: {
    canonical: `${siteUrl}/pozivnice`,
  },
};

// Sest prednosti, redom kojim ih kupac zaista vrednuje. "Latinica i cirilica"
// namerno nije medju njima: vazi samo za standardne teme za vencanje, pa bi na
// stranici koja pokriva sve prilike bilo obecanje koje ne stoji svuda.
const features = [
  {
    icon: <Send size={22} />,
    title: "Podelite jednim linkom",
    desc: "Pozivnicu šaljete preko WhatsApp-a, Vibera ili e-maila — bez štampe i bez deljenja papira.",
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: "Potvrde dolaska uživo",
    desc: "Gosti potvrđuju dolazak kroz formu, a vi u realnom vremenu vidite ko dolazi i sa koliko osoba.",
  },
  {
    icon: <Timer size={22} />,
    title: "Odbrojavanje i program",
    desc: "Automatsko odbrojavanje do događaja, satnica programa i lokacija na Google mapi.",
  },
  {
    icon: <Smartphone size={22} />,
    title: "Savršeno na telefonu",
    desc: "Pozivnica izgleda besprekorno na svakom uređaju — telefonu, tabletu i računaru.",
  },
  {
    icon: <Printer size={22} />,
    title: "I štampane, ako želite",
    desc: "Štampane pozivnice sa QR kodom — 10% popusta uz našu digitalnu.",
  },
  {
    icon: <PartyPopper size={22} />,
    title: "Za sve prilike",
    desc: "Venčanja i svadbe, dečiji rođendani, punoletstva, ali i korporativne proslave.",
  },
];

// Karusel primera uzivo — jedna kartica po prilici, svaka sa nekoliko tema.
// Premium tri teme stoje kao odvojene kartice jer se prodaju pojedinacno;
// standardne su grupisane po prilici.
const clip = (name: string) => ({
  videoWebm: `/videos/${name}.webm`,
  poster: `/videos/${name}-poster.webp`,
});

const liveExamples = [
  {
    label: "Venčanje",
    featured: true,
    desc: "Standardne teme · više boja i fontova",
    createHref: "/napravi-pozivnicu",
    variants: [
      { theme: "Classic Rose", gradient: "linear-gradient(160deg, #AE343F, #7a1f27)", initials: "A & D", liveHref: "/pozivnica/ana-dejan", ...clip("poz-rose") },
      { theme: "Luxury Gold", gradient: "linear-gradient(160deg, #3a3226, #6b5a2f)", initials: "A & D", initialsColor: "#f0e2b8", liveHref: "/pozivnica/ana-dejan", ...clip("poz-gold") },
      { theme: "Modern Blue", gradient: "linear-gradient(160deg, #3f5c78, #26374a)", initials: "A & D", liveHref: "/pozivnica/ana-dejan", ...clip("poz-blue") },
    ],
  },
  {
    label: "Punoletstvo",
    desc: "Više boja · primer uživo za svaku",
    createHref: "/napravi-punoletstvo",
    variants: [
      { theme: "Bordo & zlato", gradient: "linear-gradient(160deg, #2b2b2b, #4a3f2a)", initials: "18", initialsColor: "#d4af37", liveHref: "/punoletstvo/primer-devojka", ...clip("pun-devojka") },
      { theme: "Teget & zlato", gradient: "linear-gradient(160deg, #1f2a44, #2c3a5a)", initials: "18", initialsColor: "#d4af37", liveHref: "/punoletstvo/primer-momak", ...clip("pun-momak") },
    ],
  },
  {
    label: "Dečiji rođendan",
    desc: "Teme za dečake i devojčice",
    createHref: "/napravi-deciju-pozivnicu",
    variants: [
      { theme: "Za dečake", gradient: "linear-gradient(160deg, #4a7ba6, #2f5a7d)", initials: "1", liveHref: "/deciji-rodjendan/primer-decak", ...clip("dec-decak") },
      { theme: "Za devojčice", gradient: "linear-gradient(160deg, #c76a90, #a24f74)", initials: "1", liveHref: "/deciji-rodjendan/primer-devojcica", ...clip("dec-devojcica") },
    ],
  },
  {
    label: "Watercolor",
    groupTitle: "Premium pozivnice za venčanje",
    desc: "Premium · animirana scena sa retro automobilima",
    createHref:
      "/napravi-pozivnicu?premium=1&raspored=1&audio=1&galerija=1&paket=premium",
    variants: [
      { theme: "Watercolor", gradient: "linear-gradient(160deg, #24303f, #3a2b40)", initials: "T & B", initialsColor: "#e8c9a0", liveHref: "/premium-pozivnica/teodora-bojan", ...clip("pre-watercolor") },
    ],
  },
  {
    label: "Parallax",
    desc: "Premium · papirni svet sa paralaks dubinom",
    createHref:
      "/napravi-pozivnicu?premium=1&raspored=1&audio=1&galerija=1&paket=premium",
    variants: [
      { theme: "Parallax", gradient: "linear-gradient(160deg, #7d7f6e, #585a49)", initials: "A & M", liveHref: "/premium-pozivnica/ana-marko", ...clip("pre-paper") },
    ],
  },
  {
    label: "Fountain",
    desc: "Premium · bordo tonovi, fontana i beli golubovi",
    createHref:
      "/napravi-pozivnicu?premium=1&raspored=1&audio=1&galerija=1&paket=premium",
    variants: [
      { theme: "Fountain", gradient: "linear-gradient(160deg, #8a1f28, #AE343F)", initials: "M & N", initialsColor: "#f0d9b0", liveHref: "/premium-pozivnica/milica-nikola", ...clip("pre-burgundy") },
    ],
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
    title: "Dobijate pozivnicu odmah",
    desc: "Softver odmah generiše vašu pozivnicu iz podataka iz upitnika — spremna je istog trena. Čim uplatite, šaljete je gostima.",
  },
];

// Redovi sa `hint` nose objasnjenje za proizvod koji kupac jos ne zna sta je
// (isti obrazac kao "Sta je ovo?" na /cene).
const comparisonRows: {
  label: string;
  hint?: string;
  paper: string | boolean;
  animated: string | boolean;
  other: string | boolean;
  halo: string | boolean;
  haloNote?: string;
}[] = [
  {
    label: "Cena",
    paper: "15.000–30.000+ din",
    animated: "5.000–15.000 din",
    other: "100€+",
    halo: `od ${formatPrice(getRodjendanPozivnicaPrice())}`,
    haloNote: `venčanje od ${formatPrice(pricing.pozivnica.website.price)}`,
  },
  {
    label: "Potvrda dolaska",
    paper: false,
    animated: false,
    other: "Kod nekih",
    halo: true,
  },
  {
    label: "Odbrojavanje + mapa",
    paper: false,
    animated: "Retko",
    other: "Uz doplatu",
    halo: true,
  },
  {
    label: '"Gde sedim?"',
    hint: "Gost na dan svadbe otvori link, ukuca svoje ime i odmah vidi za kojim stolom sedi — bez traženja po spisku na ulazu.",
    paper: false,
    animated: false,
    other: false,
    halo: true,
  },
  {
    label: "Raspored sedenja",
    hint: "Alat u kom rasporedite goste po stolovima prevlačenjem, pa preuzmete PDF plan sale za štampu i za osoblje.",
    paper: false,
    animated: false,
    other: false,
    halo: `✓ (${formatPrice(pricing.pozivnica.raspored.price)})`,
  },
  {
    label: "QR galerija",
    hint: "Gosti skeniraju QR kod i sa svojih telefona ubacuju fotografije sa proslave u jednu zajedničku galeriju — pa dobijate i sve one snimke koje fotograf nije stigao da uhvati.",
    paper: false,
    animated: false,
    other: false,
    halo: `✓ (${formatPrice(pricing.pozivnica.galerija.price)})`,
  },
  {
    label: "Audio knjiga",
    hint: "Gosti vam preko pozivnice ostavljaju glasovne poruke i čestitke, a vi ih posle svadbe preslušavate i čuvate zauvek.",
    paper: false,
    animated: false,
    other: false,
    halo: `✓ (${formatPrice(pricing.pozivnica.audio.price)})`,
  },
  {
    label: "Promena podataka",
    paper: "Ponovo štampate",
    animated: "Ponovo snimate",
    other: "Uz doplatu",
    halo: "Odmah, neograničeno",
  },
  {
    label: "Isporuka",
    paper: "2–4 nedelje",
    animated: "2–7 dana",
    other: "2–5 dana",
    halo: "Odmah",
  },
  {
    label: "Digital + papir",
    paper: "Samo papir",
    animated: "Samo digital",
    other: "Samo digital",
    halo: "Oba moguća",
  },
];

const faqItems = [
  {
    q: "Za koje prilike mogu da napravim pozivnicu?",
    a: "Za venčanje, dečiji rođendan, prvi rođendan i punoletstvo. Svaka prilika ima svoje teme i svoj upitnik, a pozivnica se u svakom slučaju deli jednim linkom i prima potvrde dolaska.",
  },
  {
    q: "Koliko košta digitalna pozivnica?",
    a: `Pozivnica za rođendan i punoletstvo je ${formatPrice(getRodjendanPozivnicaPrice())}, a za venčanje ${formatPrice(pricing.pozivnica.website.price)}. Kompletan paket za venčanje — pozivnica, raspored sedenja, audio knjiga i QR galerija — je ${formatPrice(getTier("kompletno")?.price ?? 9900)} umesto ${formatPrice(getTier("kompletno")?.fullPrice ?? 14000)}. Premium teme sa animacijama su poseban paket, cene su na stranici Cene.`,
  },
  {
    q: "Koliko brzo je pozivnica gotova?",
    a: "Odmah. Softver je generiše iz podataka koje ste uneli u upitnik — čim uplatite, link je vaš i možete ga poslati gostima.",
  },
  {
    q: "Kako gosti dobijaju pozivnicu i kako potvrđuju dolazak?",
    a: "Pošaljete im link preko WhatsApp-a, Vibera, SMS-a ili e-maila. Gost otvori pozivnicu na telefonu i kroz formu potvrđuje dolazak i broj osoba, a vi u realnom vremenu vidite ko je potvrdio.",
  },
  {
    q: "Šta je sve uključeno u pozivnicu?",
    a: "Potvrde dolaska, odbrojavanje do događaja, lokacije na Google mapi, program dana, izbor teme i boje, i dizajn prilagođen telefonu. Sve na jednoj stranici koja se deli jednim linkom.",
  },
  {
    q: "Da li radite i štampane pozivnice?",
    a: "Da. Ručno izrađujemo štampane pozivnice sa QR kodom za potvrdu dolaska — pametna štampana pozivnica, za goste koji vole nešto u ruci. Uz našu digitalnu pozivnicu idu sa 10% popusta. Dizajn je besplatan, plaćate samo štampu.",
  },
  {
    q: "Da li pravite i zahvalnice?",
    a: "Pravimo zahvalnice sa QR kodom koji vodi na foto galeriju sa vašeg venčanja, i možemo ih upariti sa čokoladicama kao poklon gostima. Zatražite ponudu kroz formu na ovoj stranici.",
  },
  {
    q: "Da li mogu kasnije da menjam podatke na pozivnici?",
    a: "Možete, neograničeno i bez doplate. Promena se vidi odmah na istom linku — gostima ne treba slati ništa novo. Kod štampanih pozivnica to nije moguće, zato ih i preporučujemo uz digitalnu, a ne umesto nje.",
  },
  {
    q: "Da li pozivnica podržava i latinicu i ćirilicu?",
    a: "Standardne teme za venčanje podržavaju oba pisma i vi birate koje želite — uključujući dekorativne fontove sa ćirilicom. Za ostale prilike pišite nam kroz upitnik ako vam treba ćirilica.",
  },
  {
    q: 'Šta je raspored sedenja i šta je "Gde sedim?"',
    a: `Raspored sedenja je alat u kom stolove i goste raspoređujete prevlačenjem, pa preuzmete PDF plan sale za štampu. "Gde sedim?" je pretraga za goste: na dan proslave gost ukuca svoje ime i vidi za kojim stolom sedi. Oba dolaze zajedno za ${formatPrice(pricing.pozivnica.raspored.price)}.`,
  },
  {
    q: "Šta je audio knjiga utisaka?",
    a: `Gosti preko pozivnice ostavljaju glasovne poruke i čestitke, a vi ih posle proslave preslušavate i preuzimate. Cena je ${formatPrice(pricing.pozivnica.audio.price)}.`,
  },
  {
    q: "Da li pozivnica radi na svim uređajima?",
    a: "Radi. Pravljena je prvo za telefon, jer tamo gosti i otvaraju link, ali izgleda jednako dobro na tabletu i računaru. Ne treba nikakva aplikacija — otvara se u pretraživaču.",
  },
];


function CellValue({ value }: { value: boolean | string }) {
  if (value === true)
    return <Check size={16} className="!text-green-600 mx-auto" />;
  if (value === false)
    return <XIcon size={16} className="text-[#232323]/20 mx-auto" />;
  if (typeof value === "string" && value.startsWith("✓")) {
    const rest = value.slice(1).trim();
    return (
      <span className="inline-flex items-center justify-center gap-1 text-xs leading-tight">
        <Check size={16} className="!text-green-600 shrink-0" />
        {rest}
      </span>
    );
  }
  return (
    <span className="text-xs leading-tight text-center block">{value}</span>
  );
}

export default function PozivnicePage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Digitalna pozivnica",
    description:
      "Digitalna pozivnica za venčanje, dečiji rođendan, prvi rođendan ili punoletstvo — sa potvrdom dolaska, odbrojavanjem, mapom i programom dana.",
    image: `${siteUrl}/images/full-logo.png`,
    brand: { "@type": "Brand", name: "Halo Uspomene" },
    url: `${siteUrl}/pozivnice`,
    offers: {
      "@type": "Offer",
      price: String(getRodjendanPozivnicaPrice()),
      priceCurrency: "RSD",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Halo Uspomene" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "RSD",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "RS",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "RS",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
    },
    // Namerno bez `aggregateRating` — v. src/data/testimonials.ts.
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

  // Preneto sa /izrada-pozivnica-online: cetiri prilike kao lista, da pretraga
  // vidi da jedna stranica pokriva sve, a ne samo vencanje.
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Vrste digitalnih pozivnica",
    itemListElement: [
      { name: "Pozivnica za venčanje", url: `${siteUrl}/napravi-pozivnicu` },
      {
        name: "Pozivnica za dečiji rođendan",
        url: `${siteUrl}/napravi-deciju-pozivnicu`,
      },
      {
        name: "Pozivnica za prvi rođendan",
        url: `${siteUrl}/napravi-deciju-pozivnicu`,
      },
      {
        name: "Pozivnica za punoletstvo",
        url: `${siteUrl}/napravi-punoletstvo`,
      },
    ].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };

  return (
    <>
      <Header />
      <PromoCapture />
      <main className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />

        {/* ═══ HERO ═══ */}
        <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#AE343F]/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#d4af37]/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="mb-6">
              <Breadcrumbs
                items={[
                  { label: "Početna", href: "/" },
                  { label: "Pozivnice" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              {/* Text */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#AE343F]/10 rounded-full mb-6">
                  <Heart size={14} className="text-[#AE343F]" fill="#AE343F" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#AE343F]">
                    Digitalna + pametne štampane
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] mb-6 leading-[1.1]">
                  Digitalne pozivnice{" "}
                  <span className="text-[#AE343F] italic">
                    za venčanje i proslave
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-[#232323]/60 leading-relaxed mb-8 max-w-2xl">
                  Venčanje, dečiji rođendan, prvi rođendan ili punoletstvo —
                  pozivnica kao website stranica sa potvrdom dolaska,
                  odbrojavanjem, mapom i programom dana. Deli se jednim linkom, a
                  radimo i štampane sa QR kodom.
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  {[
                    { icon: <Check size={16} />, label: "Potvrde dolaska" },
                    { icon: <Timer size={16} />, label: "Odbrojavanje" },
                    { icon: <MapPin size={16} />, label: "Mapa" },
                    { icon: <Printer size={16} />, label: "I štampane" },
                  ].map((pill) => (
                    <span
                      key={pill.label}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#232323]/8 rounded-full text-sm text-[#232323]/60"
                    >
                      <span className="text-[#AE343F]">{pill.icon}</span>
                      {pill.label}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <a
                    href="#primeri"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#AE343F] text-white text-sm uppercase tracking-widest font-medium hover:bg-[#8B2833] transition-all rounded-full"
                  >
                    Pogledajte primere
                  </a>
                  <Link
                    href="/cene"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#232323]/10 text-[#232323]/70 text-sm uppercase tracking-widest font-medium hover:border-[#AE343F] hover:text-[#AE343F] transition-all rounded-full"
                  >
                    Pogledajte cene
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="flex items-center gap-6 text-sm text-[#232323]/40">
                  <span className="font-bold text-[#AE343F]">
                    od {formatPrice(getRodjendanPozivnicaPrice())}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#AE343F]" />
                    Gotova odmah
                  </span>
                </div>
              </div>

              {/* Image */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <Image
                  src="/images/website-pozivnice.webp"
                  alt="HALO Uspomene website pozivnica za venčanje — digitalna pozivnica sa potvrdama dolaska, odbrojavanjem, mapom i PDF za štampu"
                  width={797}
                  height={874}
                  priority
                  className="w-full max-w-md lg:max-w-lg object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PRIMERI UŽIVO ═══
            Sidro se zove #primeri jer tri mesta u aplikaciji vec vode ovamo
            (pocetna, upitnik, planer) — hes se ne salje serveru, pa ga
            preusmerenje sa /izrada-pozivnica-online ne bi prenelo. */}
        <section
          id="primeri"
          className="py-16 sm:py-24 bg-[#232323] relative overflow-hidden"
        >
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-4">
                Primeri uživo
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F4DC] mb-4">
                Pogledajte teme na pravim pozivnicama
              </h2>
              <p className="text-[#F5F4DC]/60 max-w-2xl mx-auto">
                Svaki primer je prava pozivnica — otvorite je, listajte program
                dana i probajte potvrdu dolaska.
              </p>
            </div>

            <LiveExamplesRow examples={liveExamples} />
          </div>
        </section>

        {/* ═══ ŠTA UKLJUČUJE ═══ */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Šta dobijate
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Ovako je sve{" "}
                <span className="text-[#AE343F] italic">mnogo lakše</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-[#faf9f6] rounded-2xl p-5 border border-stone-100"
                >
                  <div className="w-11 h-11 bg-[#AE343F]/10 rounded-xl flex items-center justify-center mb-4 text-[#AE343F]">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-[#232323] mb-1">
                    {f.title}
                  </h3>
                  <p className="text-xs text-[#232323]/50 leading-relaxed">
                    {f.desc}
                  </p>
                  {"badge" in f && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-green-500/10 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {(f as { badge: string }).badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ŠTAMPANE POZIVNICE I ZAHVALNICE ═══
            Zamenilo je nekadasnje obecanje besplatnog PDF-a: PDF su ljudi
            svakako mogli sami da naprave, a stampa je usluga koju stvarno
            radimo i naplacujemo. */}
        <section className="py-16 sm:py-20 bg-[#F5F4DC]">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-serif text-[#232323] mb-4">
                Pametne štampane pozivnice{" "}
                <span className="italic text-[#AE343F]">sa QR kodom</span>
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#d4af37]/20 shadow-sm">
              <p className="text-[#232323]/70 leading-relaxed mb-5">
                Pored digitalne, ručno izrađujemo i{" "}
                <strong className="text-[#232323]">
                  štampane pozivnice sa QR kodom
                </strong>{" "}
                za potvrdu dolaska. Gost skenira kod i potvrđuje dolazak sa
                telefona, a vi i dalje sve vidite na jednom mestu. Za starije
                goste i one koji ne znaju da skeniraju QR kod, tu je i dalje
                klasičan broj telefona.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {["QR kod za potvrdu dolaska", "Dizajniranje besplatno"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center justify-center gap-2 text-sm text-[#232323]/70"
                    >
                      <Check size={16} className="text-[#d4af37] shrink-0" />
                      {item}
                    </div>
                  ),
                )}
              </div>

              {/* Zahvalnice su zaseban proizvod, ne stavka stampane pozivnice —
                  zato kartica u kartici, sa zlatnom ivicom. */}
              <div
                className="rounded-xl p-5 mb-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.03))",
                  border: "1px solid rgba(212,175,55,0.35)",
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d4af37]/15 text-[#d4af37]">
                    <Gift size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37] mb-1">
                      Bitan detalj svake proslave
                    </p>
                    <p className="text-sm font-semibold text-[#232323] mb-1">
                      Zahvalnice sa QR kodom za foto galeriju
                    </p>
                    <p className="text-xs text-[#232323]/60 leading-relaxed">
                      Gost skenira kod i otvara galeriju sa vaše proslave.
                      Uparujemo ih i sa čokoladicama, po dogovoru.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <span className="inline-block px-3 py-1 bg-green-500/10 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full">
                  10% popusta uz digitalnu
                </span>
                <a
                  href="#kontakt"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#AE343F] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#8B2833] transition-all rounded-full"
                >
                  Zatražite ponudu
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ KAKO FUNKCIONIŠE ═══ */}
        <section className="py-16 sm:py-24 bg-[#232323] relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-3xl relative z-10">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Kako početi
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F4DC] mb-4">
                Od ideje do pozivnice{" "}
                <span className="italic text-[#d4af37]">za par minuta</span>
              </h2>
            </div>

            <div className="space-y-5">
              {steps.map((step, i) => ({
                ...step,
                icon: [
                  <Heart key="0" size={20} />,
                  <Globe key="1" size={20} />,
                  <QrCode key="2" size={20} />,
                ][i],
              })).map((step) => (
                <div
                  key={step.n}
                  className="flex items-start gap-5 bg-white/[0.07] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#AE343F]/20 flex items-center justify-center shrink-0 text-[#AE343F]">
                    {step.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[#AE343F]/60 font-serif font-black text-lg">
                        {step.n}
                      </span>
                      <h3 className="text-[#F5F4DC] text-lg font-semibold">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-[#F5F4DC]/50 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-[#F5F4DC]/70 text-sm mb-5">
                Pa hajmo — izaberite priliku:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { label: "Venčanje", href: "/napravi-pozivnicu" },
                  { label: "Punoletstvo", href: "/napravi-punoletstvo" },
                  {
                    label: "Dečiji rođendan",
                    href: "/napravi-deciju-pozivnicu",
                  },
                ].map((o) => (
                  <Link
                    key={o.href}
                    href={o.href}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#AE343F] text-white text-xs sm:text-sm uppercase tracking-widest font-medium hover:bg-[#8B2833] transition-all rounded-full"
                  >
                    {o.label}
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ VELIKO POREĐENJE ═══ */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Poređenje
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#232323] mb-4">
                Zašto digitalna pozivnica?
              </h2>
              <p className="text-[#232323]/50 max-w-2xl mx-auto">
                Uporedite sa papirnim, animiranim i drugim digitalnim
                pozivnicama.
              </p>
            </div>

            {/* Desktop: HALO last | Mobile: HALO first */}
            <div className="relative">
              <div className="flex">
                {/* Fixed label column */}
                <div className="shrink-0 w-[120px] sm:w-[150px] md:w-auto">
                  <div className="h-12 flex items-center p-3" />
                  {comparisonRows.map((row, i) => (
                    <div
                      key={row.label}
                      className={`h-12 flex items-center p-3 text-xs sm:text-sm font-medium text-[#232323]/70 ${
                        i % 2 === 0 ? "bg-[#faf9f6]" : "bg-white"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {row.label}
                        {row.hint && <ComparisonHint text={row.hint} />}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Scrollable columns */}
                <div className="flex-1 overflow-x-auto scrollbar-none">
                  <div className="inline-flex min-w-full md:w-full">
                    {/* HALO — first on mobile, last on desktop */}
                    <div className="shrink-0 w-[140px] sm:w-[160px] md:w-1/4 md:order-last">
                      <div className="h-12 flex items-center justify-center p-2 font-bold text-[#AE343F] bg-[#AE343F]/5 rounded-t-xl">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                          <Award size={14} />
                          HALO Uspomene
                        </div>
                      </div>
                      {comparisonRows.map((row, i) => (
                        <div
                          key={row.label}
                          className={`h-12 flex items-center justify-center p-2 font-semibold text-[#AE343F] bg-[#AE343F]/5 ${
                            i % 2 !== 0 ? "bg-[#AE343F]/[0.03]" : ""
                          }`}
                        >
                          <span className="flex flex-col items-center leading-tight">
                            <CellValue value={row.halo} />
                            {row.haloNote && (
                              <span className="text-[9px] font-normal text-[#AE343F]/60">
                                {row.haloNote}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Papirna */}
                    <div className="shrink-0 w-[120px] sm:w-[140px] md:w-1/4 md:order-first">
                      <div className="h-12 flex items-center justify-center p-2 text-xs sm:text-sm font-medium text-[#232323]/60">
                        Papirna
                      </div>
                      {comparisonRows.map((row, i) => (
                        <div
                          key={row.label}
                          className={`h-12 flex items-center justify-center p-2 text-[#232323]/50 ${
                            i % 2 === 0 ? "bg-[#faf9f6]" : "bg-white"
                          }`}
                        >
                          <CellValue value={row.paper} />
                        </div>
                      ))}
                    </div>

                    {/* Animirana */}
                    <div className="shrink-0 w-[120px] sm:w-[140px] md:w-1/4 md:order-2">
                      <div className="h-12 flex items-center justify-center p-2 text-xs sm:text-sm font-medium text-[#232323]/60">
                        Animirana
                      </div>
                      {comparisonRows.map((row, i) => (
                        <div
                          key={row.label}
                          className={`h-12 flex items-center justify-center p-2 text-[#232323]/50 ${
                            i % 2 === 0 ? "bg-[#faf9f6]" : "bg-white"
                          }`}
                        >
                          <CellValue value={row.animated} />
                        </div>
                      ))}
                    </div>

                    {/* Drugi sajtovi */}
                    <div className="shrink-0 w-[120px] sm:w-[140px] md:w-1/4 md:order-3">
                      <div className="h-12 flex items-center justify-center p-2 text-xs sm:text-sm font-medium text-[#232323]/60">
                        Drugi sajtovi
                      </div>
                      {comparisonRows.map((row, i) => (
                        <div
                          key={row.label}
                          className={`h-12 flex items-center justify-center p-2 text-[#232323]/50 ${
                            i % 2 === 0 ? "bg-[#faf9f6]" : "bg-white"
                          }`}
                        >
                          <CellValue value={row.other} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ DODATNE MOGUĆNOSTI ═══ */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Još više mogućnosti
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#232323] mb-4">
                Kompletna platforma za venčanje
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/planiranje-vencanja"
                className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:border-[#AE343F]/20 hover:shadow-md transition-all group"
              >
                <Gift size={22} className="text-[#AE343F] mb-3" />
                <p className="text-sm font-semibold text-[#232323] group-hover:text-[#AE343F] transition-colors mb-1">
                  Planer za venčanje
                </p>
                <p className="text-xs text-[#232323]/40 mb-2">
                  Detaljna Checklista, budžet kalkulator i vendori
                </p>
                <span className="text-xs font-bold text-green-700">
                  Uključeno
                </span>
              </Link>
              <Link
                href="/cene"
                className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:border-[#AE343F]/20 hover:shadow-md transition-all group"
              >
                <LayoutDashboard size={22} className="text-[#AE343F] mb-3" />
                <p className="text-sm font-semibold text-[#232323] group-hover:text-[#AE343F] transition-colors mb-1">
                  Raspored sedenja
                </p>
                <p className="text-xs text-[#232323]/40 mb-2">
                  Alat za raspored sedenja, gosti nalaze sto sami
                </p>
                <span className="text-xs font-bold text-[#AE343F]">
                  {formatPrice(pricing.pozivnica.raspored.price)}
                </span>
              </Link>
              <Link
                href="/telefon-uspomena"
                className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:border-[#AE343F]/20 hover:shadow-md transition-all group"
              >
                <Phone size={22} className="text-[#AE343F] mb-3" />
                <p className="text-sm font-semibold text-[#232323] group-hover:text-[#AE343F] transition-colors mb-1">
                  Retro telefon uspomena
                </p>
                <p className="text-xs text-[#232323]/40 mb-2">
                  Vintage telefon za glasovne poruke gostiju
                </p>
                <span className="text-xs font-bold text-[#AE343F] flex items-center gap-2">
                  {isAudioDiscountActive() ? (
                    <>
                      <span className="line-through text-[#AE343F]/40 text-[10px]">
                        {formatPrice(pricing.packages.essential.price)}
                      </span>
                      <span>{formatPrice(getAudioPrice())}</span>
                    </>
                  ) : (
                    formatPrice(pricing.packages.essential.price)
                  )}
                </span>
              </Link>
              <a
                href="#kontakt"
                className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:border-[#AE343F]/20 hover:shadow-md transition-all group"
              >
                <Printer size={22} className="text-[#AE343F] mb-3" />
                <p className="text-sm font-semibold text-[#232323] group-hover:text-[#AE343F] transition-colors mb-1">
                  QR zahvalnice
                </p>
                <p className="text-xs text-[#232323]/40 mb-2">
                  Dizajniramo po vašim željama, plus čokoladice
                </p>
                <span className="text-xs font-bold text-[#AE343F]">
                  Po dogovoru
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* ═══ CENE ═══ */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-lg">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Cene
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#232323] mb-4">
                Transparentne cene, bez skrivenih troškova
              </h2>
            </div>

            <div className="bg-[#faf9f6] rounded-2xl p-6 sm:p-8 border border-stone-100">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#232323]/70">
                    Pozivnica za venčanje
                  </span>
                  <span className="text-sm font-bold text-[#232323]">
                    {formatPrice(pricing.pozivnica.website.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#232323]/70">
                    Rođendan i punoletstvo
                  </span>
                  <span className="text-sm font-bold text-[#232323]">
                    {formatPrice(getRodjendanPozivnicaPrice())}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#232323]/70">
                    Dizajniranje štampanih pozivnica
                  </span>
                  <span className="text-xs font-bold text-green-700 bg-green-500/10 px-2 py-0.5 rounded-full">
                    Besplatno
                  </span>
                </div>
                <div className="h-px bg-[#232323]/5" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#232323]/70">
                    + Raspored sedenja
                  </span>
                  <span className="text-sm text-[#232323]/50">
                    {formatPrice(pricing.pozivnica.raspored.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#232323]/70">
                    + Audio knjiga
                  </span>
                  <span className="text-sm text-[#232323]/50">
                    {formatPrice(pricing.pozivnica.audio.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#232323]/70">
                    + QR galerija fotografija
                  </span>
                  <span className="text-sm text-[#232323]/50">
                    {formatPrice(pricing.pozivnica.galerija.price)}
                  </span>
                </div>
                <div className="h-px bg-[#232323]/5" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-[#232323]">
                      Kompletno Venčanje
                    </span>
                    <span className="text-xs text-[#232323]/30 line-through ml-2">
                      {formatPrice(getTier("kompletno")?.fullPrice ?? 14000)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-[#AE343F]">
                    {formatPrice(getTier("kompletno")?.price ?? 9900)}
                  </span>
                </div>
              </div>

              <span className="inline-block mb-5 px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs font-bold rounded-full">
                Uštedite {formatPrice(getKompletnoSavings())}
              </span>

              <p className="text-xs text-[#232323]/50 leading-relaxed mb-5">
                Želite animirane premium teme — Watercolor, Parallax ili
                Fountain? One idu kroz{" "}
                <Link
                  href="/cene"
                  className="text-[#AE343F] underline underline-offset-2"
                >
                  Premium paket
                </Link>
                .
              </p>

              <Link
                href="/cene"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold bg-[#AE343F] hover:bg-[#8A2A32] text-white transition-colors"
              >
                Pogledajte sve cene
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Stampa i zahvalnice se ne naplacuju po cenovniku — svaka narudzbina
                je drugacija, pa vodi na formu umesto na cenu. */}
            <div className="mt-5 rounded-2xl border border-[#d4af37]/25 bg-white p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <Printer size={18} className="mt-0.5 shrink-0 text-[#d4af37]" />
                <div>
                  <p className="text-sm font-semibold text-[#232323] mb-1">
                    Štampane pozivnice, zahvalnice i čokoladice
                  </p>
                  <p className="text-xs text-[#232323]/60 leading-relaxed mb-3">
                    Štampane pozivnice sa QR kodom za potvrdu dolaska, zahvalnice
                    sa QR kodom koji vodi na foto galeriju sa vaše proslave, i
                    čokoladice kao poklon gostima. Dizajn je besplatan, a uz našu
                    digitalnu pozivnicu ide 10% popusta na štampu.
                  </p>
                  <a
                    href="#kontakt"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#AE343F] hover:underline"
                  >
                    Zatražite ponudu
                    <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ KONTAKT — stampane pozivnice i zahvalnice ═══ */}
        <section id="kontakt" className="py-16 sm:py-20 bg-[#232323]">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-4">
                Štampa i zahvalnice
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#F5F4DC] mb-4">
                Zatražite ponudu
              </h2>
              <p className="text-[#F5F4DC]/60 max-w-xl mx-auto">
                Javite nam šta vam treba i za koji datum — vraćamo se sa cenom i
                predlogom dizajna.
              </p>
            </div>

            <StampaneLeadForm />
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-16 sm:py-24 bg-gradient-to-t from-[#faf9f6] to-[#AE343F]/10 border-t-4 border-[#AE343F]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#AE343F]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Česta pitanja
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
                Sve o website pozivnicama
              </h2>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="collapse collapse-arrow bg-[#faf9f6] rounded-2xl border border-stone-200"
                >
                  <input type="checkbox" />
                  <div className="collapse-title text-base sm:text-lg font-medium text-[#232323] pr-12">
                    {item.q}
                  </div>
                  <div className="collapse-content">
                    <p className="text-[#232323]/60 leading-relaxed pt-2">
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-16 sm:py-20 md:py-24 bg-[#232323] text-[#F5F4DC] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-[#AE343F]/10 rounded-full blur-2xl sm:blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-[#AE343F]/5 rounded-full blur-2xl sm:blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mb-6">
              Napravite svoju pozivnicu za venčanje odmah
            </h2>
            <p className="text-lg text-[#F5F4DC]/60 max-w-2xl mx-auto mb-10">
              Popunite upitnik u 2 minuta — mi ćemo sve ostalo. Vaša
              personalizovana pozivnica biće gotova odmah.
            </p>
            <Link
              href="/napravi-pozivnicu"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#AE343F] text-white text-sm uppercase tracking-widest font-medium hover:bg-[#8B2833] transition-all rounded-full shadow-xl shadow-[#AE343F]/30"
            >
              Napravi pozivnicu
              <ArrowRight size={16} />
            </Link>
            <p className="mt-6 text-sm text-[#F5F4DC]/40">
              od {formatPrice(pricing.pozivnica.website.price)} · Gotova odmah
            </p>
            <p className="mt-3 text-sm text-[#F5F4DC]/40">
              Slavite nešto drugo?{" "}
              <Link
                href="/napravi-punoletstvo"
                className="text-[#d4af37] hover:underline"
              >
                Punoletstvo
              </Link>{" "}
              ·{" "}
              <Link
                href="/napravi-deciju-pozivnicu"
                className="text-[#d4af37] hover:underline"
              >
                Dečiji rođendan
              </Link>{" "}
              — od {formatPrice(getRodjendanPozivnicaPrice())}
            </p>
          </div>
        </section>

        {/* ═══ SEO HIDDEN CONTENT ═══ */}
        <section className="sr-only">
          <h2>Digitalne pozivnice za venčanje i proslave u Srbiji</h2>
          <p>
            HALO Uspomene izrađuje digitalne pozivnice za venčanje, dečiji
            rođendan, prvi rođendan i punoletstvo. Pozivnica je website
            stranica — potvrda dolaska, odbrojavanje, interaktivna Google mapa i
            program dana — koja se deli jednim linkom. Rođendan i punoletstvo od
            4.500 din, venčanje od 5.000 din, gotova odmah.
          </p>
          <p>
            Digitalne pozivnice, digitalna pozivnica, izrada pozivnica online,
            napravi pozivnicu online, online pozivnica, pozivnica za venčanje,
            pozivnice za vencanje, digitalne pozivnice za vencanje, pozivnica za
            svadbu, elektronska pozivnica, e-pozivnica, cena digitalne
            pozivnice, pozivnica sa potvrdom dolaska, pozivnica za venčanje sa
            QR kodom, pozivnica za rođendan, pozivnica za dečiji rođendan,
            pozivnica za prvi rođendan, pozivnica za punoletstvo, pozivnice za
            18 rodjendan.
          </p>
          <p>
            Pored digitalne, izrađujemo i štampane pozivnice sa QR kodom za
            potvrdu dolaska, kao i zahvalnice sa QR kodom koji vodi na foto
            galeriju sa proslave. Dizajn štampanih pozivnica je besplatan, a uz
            digitalnu pozivnicu odobravamo 10% popusta na štampu.
          </p>
          <p>
            Pozivnica za venčanje Beograd, pozivnica za venčanje Novi Sad,
            pozivnica za venčanje Niš, pozivnica za venčanje Kragujevac,
            pozivnica za venčanje Subotica. Dostupno u celoj Srbiji.
          </p>
          <p>
            Kompletno Venčanje uključuje digitalnu pozivnicu, raspored sedenja,
            digitalnu audio knjigu utisaka i QR galeriju fotografija.
            Pogledajte <Link href="/cene">cene pozivnica</Link>,{" "}
            <Link href="/telefon-uspomena">telefon uspomena</Link>,{" "}
            <Link href="/planiranje-vencanja">planer za venčanje</Link> i{" "}
            <Link href="/lokacije">dostupne gradove</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
