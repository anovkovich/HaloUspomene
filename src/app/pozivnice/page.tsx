import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  X as XIcon,
  MapPin,
  QrCode,
  Timer,
  Smartphone,
  Mic,
  Phone,
  ArrowRight,
  Sparkles,
  Heart,
  Palette,
  Languages,
  Calendar,
  Award,
  Clock,
  FileDown,
  Globe,
  LayoutDashboard,
  Gift,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { pricing, formatPrice } from "@/data/pricing";
import { THEME_CONFIGS } from "@/app/pozivnica/[slug]/constants";
import type { ThemeType, ThemeConfig } from "@/app/pozivnica/[slug]/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title:
    "Website Pozivnica za Venčanje — Digitalna Pozivnica + PDF za Štampu | HALO Uspomene",
  description:
    "Website pozivnica za venčanje sa RSVP potvrdom, odbrojavanjem, mapom i besplatnom PDF pozivnicom za štampu sa QR kodom. 5 tema, latinica i ćirilica. Od 5.000 din. Gotova za 24h.",
  keywords: [
    "pozivnica za venčanje",
    "pozivnice za vencanje",
    "digitalna pozivnica",
    "website pozivnica",
    "online pozivnica za svadbu",
    "elektronska pozivnica",
    "e-pozivnica",
    "pozivnica za venčanje sa QR kodom",
    "pozivnica za venčanje cena",
    "besplatna pozivnica za štampu",
    "pozivnica sa RSVP",
    "pozivnica za svadbu",
    "pozivnica za venčanje srbija",
    "pozivnica za venčanje beograd",
    "pozivnica za venčanje novi sad",
    "moderna pozivnica za venčanje",
    "jeftina pozivnica za venčanje",
    "PDF pozivnica za venčanje",
    "pozivnica za venčanje online",
    "pozivnica sa potvrdom dolaska",
    "web pozivnica za svadbu",
    "digitalna pozivnica za svadbu",
  ],
  openGraph: {
    title: "Website Pozivnica za Venčanje | HALO Uspomene",
    description:
      "Digitalna pozivnica + besplatna PDF za štampu sa QR kodom. RSVP, odbrojavanje, mapa — sve na jednom mestu. Od 5.000 din.",
    type: "website",
    url: `${siteUrl}/pozivnice`,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Pozivnica za Venčanje | HALO Uspomene",
    description:
      "Digitalna pozivnica + PDF za štampu sa QR kodom. Od 5.000 din, gotova za 24h.",
  },
  alternates: {
    canonical: `${siteUrl}/pozivnice`,
  },
};

const features = [
  {
    icon: <Check size={22} />,
    title: "RSVP potvrda dolaska",
    desc: "Gosti potvrđuju dolazak jednim klikom — bez telefonskih poziva.",
  },
  {
    icon: <Timer size={22} />,
    title: "Odbrojavanje do venčanja",
    desc: "Interaktivni brojač dana, sati i minuta do velikog dana.",
  },
  {
    icon: <MapPin size={22} />,
    title: "Interaktivna Google mapa",
    desc: "Pregled lokacija na iteraktivnim mapama za lakšu orijentaciju!",
  },
  {
    icon: <Calendar size={22} />,
    title: "Program dana",
    desc: "Timeline sa vremenima i opisom svakog dela događaja.",
  },
  {
    icon: <Palette size={22} />,
    title: "5 dizajnerskih tema",
    desc: "Od klasične ruže do modernog zlata — izaberite stil po želji.",
  },
  {
    icon: <Languages size={22} />,
    title: "Latinica i ćirilica",
    desc: "Pozivnica automatski podržava oba pisma, Vi birate.",
  },
  {
    icon: <Smartphone size={22} />,
    title: "Mobile-first dizajn",
    desc: "Savršeno izgleda na telefonu, tabletu i računaru.",
  },
  {
    icon: <FileDown size={22} />,
    title: "PDF za štampu sa QR kodom",
    desc: "Elegantna A5 pozivnica za štampu — besplatno uključena.",
  },
];

const themeEntries = Object.entries(THEME_CONFIGS) as [
  ThemeType,
  ThemeConfig,
][];

const comparisonRows = [
  {
    label: "Cena",
    paper: "20.000–50.000+ din",
    animated: "5.000–15.000 din",
    other: "12.000+ din",
    halo: `od ${formatPrice(pricing.pozivnica.website.price)}`,
  },
  {
    label: "RSVP potvrda",
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
    paper: false,
    animated: false,
    other: false,
    halo: true,
  },
  {
    label: "Raspored sedenja",
    paper: false,
    animated: false,
    other: false,
    halo: `✓ (${formatPrice(pricing.pozivnica.raspored.price)})`,
  },
  {
    label: "Audio knjiga",
    paper: false,
    animated: false,
    other: false,
    halo: `✓ (${formatPrice(pricing.pozivnica.audio.price)})`,
  },
  {
    label: "PDF za štampu",
    paper: "Samo papir",
    animated: false,
    other: "Uz doplatu",
    halo: "✓ BESPLATNO sa QR",
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
    halo: "24h",
  },
  {
    label: "Digital + papir",
    paper: "Samo papir",
    animated: "Samo digital",
    other: "Samo digital",
    halo: "Oba uključena",
  },
];

const faqItems = [
  {
    q: "Šta je website pozivnica za venčanje?",
    a: "Website pozivnica je personalizovana web stranica za vaše venčanje. Sadrži imena mladenaca, datum, lokaciju sa mapom, program dana, odbrojavanje i RSVP formu za potvrdu dolaska. Gosti otvaraju link na telefonu i potvrđuju dolazak — bez papira, bez poziva.",
  },
  {
    q: "Koliko košta website pozivnica?",
    a: `Website pozivnica košta ${formatPrice(pricing.pozivnica.website.price)}. U cenu je uključena i besplatna PDF pozivnica za štampu sa QR kodom. Kompletni paket (pozivnica + raspored sedenja + audio knjiga) košta ${formatPrice(pricing.pozivnica.bundlePrice)} umesto ${formatPrice(pricing.pozivnica.bundleFullPrice)}.`,
  },
  {
    q: "Da li je PDF pozivnica za štampu zaista besplatna?",
    a: "Da! Uz svaku website pozivnicu dobijate elegantnu PDF pozivnicu u A5 formatu sa QR kodom. Gosti koji skeniraju QR kod dolaze direktno na vašu online pozivnicu gde mogu potvrditi dolazak.",
  },
  {
    q: "Kako gosti potvrđuju dolazak (RSVP)?",
    a: "Gosti otvaraju link ili skeniraju QR kod, vide sve detalje venčanja i popune kratku RSVP formu. Vi u realnom vremenu pratite ko dolazi, koliko gostiju dovodi, i sve posebne napomene.",
  },
  {
    q: "Koje teme dizajna su dostupne?",
    a: "Nudimo 5 dizajnerskih tema: Classic Rose (romantična), Luxury Gold (raskošna), Modern Blue (moderna), Minimal Sage (prirodna) i Warm Terracotta (topla). Svaka tema ima pažljivo odabrane boje, fontove i atmosferu.",
  },
  {
    q: "Da li pozivnica podržava i latinicu i ćirilicu?",
    a: "Da! Sav tekst na pozivnici automatski podržava oba pisma. Vi birate da li želite latinicu ili ćirilicu prilikom kreiranja.",
  },
  {
    q: "Koliko brzo će moja pozivnica biti gotova?",
    a: "Pozivnica je gotova za 24h nakon što popunite upitnik. Popunjavanje traje oko 5 minuta — unosite imena, datum, lokaciju, temu i program dana.",
  },
  {
    q: "Da li mogu kasnije menjati podatke na pozivnici?",
    a: "Da, sve podatke možete menjati neograničeno i besplatno — vreme, lokaciju, program. Promene su vidljive odmah, bez čekanja.",
  },
  {
    q: "Šta je uključeno u raspored sedenja?",
    a: `Raspored sedenja (${formatPrice(pricing.pozivnica.raspored.price)}) je drag-and-drop editor gde raspoređujete goste po stolovima. Na dan venčanja, gosti otvaraju link "Gde sedim?" i za 2 sekunde pronalaze svoj sto.`,
  },
  {
    q: "Da li pozivnica radi na svim uređajima?",
    a: "Da! Pozivnica je mobile-first — savršeno izgleda na telefonu, tabletu i računaru. Gosti otvaraju link iz Viber-a, WhatsApp-a ili SMS-a i sve radi odmah.",
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
    name: "Website Pozivnica za Venčanje",
    description:
      "Digitalna pozivnica za venčanje sa RSVP potvrdom, odbrojavanjem, mapom, programom dana i besplatnom PDF pozivnicom za štampu sa QR kodom.",
    image: `${siteUrl}/images/full-logo.png`,
    brand: { "@type": "Brand", name: "Halo Uspomene" },
    url: `${siteUrl}/pozivnice`,
    offers: {
      "@type": "Offer",
      price: String(pricing.pozivnica.website.price),
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "3",
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#AE343F]/10 rounded-full mb-6">
                <Heart size={14} className="text-[#AE343F]" fill="#AE343F" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#AE343F]">
                  Digitalna + PDF za štampu
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] mb-6 leading-[1.1]">
                Website Pozivnica{" "}
                <span className="text-[#AE343F] italic">za Venčanje</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#232323]/60 leading-relaxed mb-8 max-w-2xl">
                Personalizovana web stranica sa RSVP potvrdom, odbrojavanjem,
                mapom i programom dana. Uz web pozivnicu dobijate i besplatnu
                PDF pozivnicu za štampu sa QR kodom.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: <Check size={16} />, label: "RSVP" },
                  { icon: <Timer size={16} />, label: "Odbrojavanje" },
                  { icon: <MapPin size={16} />, label: "Mapa" },
                  { icon: <Palette size={16} />, label: "5 tema" },
                  { icon: <FileDown size={16} />, label: "PDF besplatno" },
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
                <Link
                  href="/napravi-pozivnicu"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#AE343F] text-white text-sm uppercase tracking-widest font-medium hover:bg-[#8B2833] transition-all rounded-full"
                >
                  Napravi svoju pozivnicu
                </Link>
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
                  od {formatPrice(pricing.pozivnica.website.price)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#AE343F]" />
                  Gotova za 24h
                </span>
              </div>
            </div>
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
                Sve uključeno u jednu pozivnicu
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* ═══ 5 TEMA ═══ */}
        <section className="py-16 sm:py-24 bg-[#232323] relative overflow-hidden">
          <style>{`
            @keyframes dotWavePozivnice {
              0%   { background-position: 0px 0px; }
              50%  { background-position: 14px 14px; }
              100% { background-position: 0px 0px; }
            }
          `}</style>
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #F5F4DC 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              animation: "dotWavePozivnice 12s ease-in-out infinite",
            }}
          />

          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Dizajn
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F4DC] mb-4">
                5 dizajnerskih tema za svaki stil
              </h2>
              <p className="text-[#F5F4DC]/50 max-w-2xl mx-auto">
                Svaka tema ima pažljivo odabrane boje, fontove i atmosferu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {themeEntries.map(([key, config]) => (
                <div
                  key={key}
                  className="bg-white/[0.07] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors"
                  style={{
                    borderTopColor: config.colors.primary,
                    borderTopWidth: 3,
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-5 h-5 rounded-full shrink-0"
                      style={{ backgroundColor: config.colors.primary }}
                    />
                    <h3 className="text-sm font-semibold text-[#F5F4DC]">
                      {config.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#F5F4DC]/40 leading-relaxed mb-4">
                    {config.symbolism}
                  </p>
                  <div className="flex gap-1.5">
                    {[
                      config.colors.primary,
                      config.colors.primaryLight,
                      config.colors.background,
                      config.colors.surface,
                    ].map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-white/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PDF + QR ═══ */}
        <section className="py-16 sm:py-20 bg-[#F5F4DC]">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-4">
                Besplatna PDF pozivnica
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#232323] mb-4">
                Ne morate da birate — dobijate i website i pozivnicu za štampu
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#d4af37]/20 shadow-sm">
              <p className="text-[#232323]/70 leading-relaxed mb-5">
                Uz svaku website pozivnicu dobijate{" "}
                <strong className="text-[#232323]">
                  elegantnu PDF pozivnicu u A5 formatu
                </strong>{" "}
                sa QR kodom. Gosti koji skeniraju QR kod dolaze direktno na vašu
                online pozivnicu gde mogu potvrditi dolazak.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {[
                  "QR kod za potvrdu dolaska",
                  "Svi detalji venčanja",
                  "Spremna za profesionalnu štampu",
                  "A5 format — elegantan dizajn",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-[#232323]/70"
                  >
                    <Check size={16} className="text-[#d4af37] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#232323]/50 italic">
                Gosti koji vole papir — dobiju papir. Gosti koji vole link —
                dobiju link. Vi ste pokriveni u oba slučaja.
              </p>
              <div className="mt-4">
                <span className="inline-block px-3 py-1 bg-green-500/10 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full">
                  Besplatno uključena
                </span>
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
                Od upitnika do pozivnice za 24h
              </h2>
            </div>

            <div className="space-y-5">
              {[
                {
                  n: "01",
                  icon: <Globe size={20} />,
                  title: "Popunite upitnik",
                  desc: "Imena, datum, lokacija, tema i program — potrebno 2 minuta.",
                },
                {
                  n: "02",
                  icon: <Sparkles size={20} />,
                  title: "Mi kreiramo pozivnicu",
                  desc: "Vaša personalizovana web stranica sa svim detaljima, gotova za manje od 24h.",
                },
                {
                  n: "03",
                  icon: <QrCode size={20} />,
                  title: "Podelite sa gostima",
                  desc: "Pošaljite link putem Viber, WhatsApp ili pošaljite pozivnicu sa QR kodom — sve potvrde na jednom mestu.",
                },
              ].map((step) => (
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
              <Link
                href="/napravi-pozivnicu"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#AE343F] text-white text-sm uppercase tracking-widest font-medium hover:bg-[#8B2833] transition-all rounded-full"
              >
                Popunite upitnik
                <ArrowRight size={16} />
              </Link>
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
                Zašto website pozivnica?
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
                      {row.label}
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
                          <CellValue value={row.halo} />
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
                  Drag-and-drop editor, gosti nalaze sto sami
                </p>
                <span className="text-xs font-bold text-[#AE343F]">
                  {formatPrice(pricing.pozivnica.raspored.price)}
                </span>
              </Link>
              <Link
                href="/cene"
                className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:border-[#AE343F]/20 hover:shadow-md transition-all group"
              >
                <Mic size={22} className="text-[#AE343F] mb-3" />
                <p className="text-sm font-semibold text-[#232323] group-hover:text-[#AE343F] transition-colors mb-1">
                  Audio knjiga utisaka
                </p>
                <p className="text-xs text-[#232323]/40 mb-2">
                  Gosti snimaju glasovne poruke sa telefona
                </p>
                <span className="text-xs font-bold text-[#AE343F]">
                  {formatPrice(pricing.pozivnica.audio.price)}
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
                <span className="text-xs font-bold text-[#AE343F]">
                  {formatPrice(pricing.packages.essential.price)}
                </span>
              </Link>
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
                    Website pozivnica
                  </span>
                  <span className="text-sm font-bold text-[#232323]">
                    {formatPrice(pricing.pozivnica.website.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#232323]/70">
                    PDF za štampu sa QR kodom
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
                <div className="h-px bg-[#232323]/5" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-[#232323]">
                      Kompletni paket
                    </span>
                    <span className="text-xs text-[#232323]/30 line-through ml-2">
                      {formatPrice(pricing.pozivnica.bundleFullPrice)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-[#AE343F]">
                    {formatPrice(pricing.pozivnica.bundlePrice)}
                  </span>
                </div>
              </div>

              <span className="inline-block mb-5 px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs font-bold rounded-full">
                Uštedite{" "}
                {formatPrice(
                  pricing.pozivnica.bundleFullPrice -
                    pricing.pozivnica.bundlePrice,
                )}
              </span>

              <Link
                href="/cene"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold bg-[#AE343F] hover:bg-[#8A2A32] text-white transition-colors"
              >
                Pogledajte sve cene
                <ArrowRight size={14} />
              </Link>
            </div>
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

        {/* ═══ DEČIJE POZIVNICE ═══ */}
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="bg-[#F5F4DC]/50 border border-[#d4af37]/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex-1">
                <p className="font-serif text-lg text-[#232323] mb-1">
                  Tražite pozivnicu za dečiji rođendan?
                </p>
                <p className="text-sm text-[#232323]/50">
                  Pravimo i dečije pozivnice sa istim funkcijama — RSVP, mapa,
                  odbrojavanje.
                </p>
              </div>
              <Link
                href="/napravi-deciju-pozivnicu"
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-[#d4af37] hover:bg-[#c4a030] text-white text-sm font-semibold rounded-full transition-colors"
              >
                Dečije pozivnice
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-16 sm:py-20 md:py-24 bg-[#232323] text-[#F5F4DC] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-[#AE343F]/10 rounded-full blur-2xl sm:blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-[#AE343F]/5 rounded-full blur-2xl sm:blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mb-6">
              Napravite svoju pozivnicu danas
            </h2>
            <p className="text-lg text-[#F5F4DC]/60 max-w-2xl mx-auto mb-10">
              Popunite upitnik u 2 minuta — mi ćemo sve ostalo. Vaša
              personalizovana pozivnica biće gotova za manje od 24h.
            </p>
            <Link
              href="/napravi-pozivnicu"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#AE343F] text-white text-sm uppercase tracking-widest font-medium hover:bg-[#8B2833] transition-all rounded-full shadow-xl shadow-[#AE343F]/30"
            >
              Napravi pozivnicu
              <ArrowRight size={16} />
            </Link>
            <p className="mt-6 text-sm text-[#F5F4DC]/40">
              od {formatPrice(pricing.pozivnica.website.price)} · Gotova za 24h
            </p>
          </div>
        </section>

        {/* ═══ SEO HIDDEN CONTENT ═══ */}
        <section className="sr-only">
          <h2>Website Pozivnica za Venčanje u Srbiji</h2>
          <p>
            HALO Uspomene nudi website pozivnice za venčanja u Srbiji. Digitalna
            pozivnica sa RSVP potvrdom dolaska, odbrojavanjem, interaktivnom
            Google mapom, programom dana i besplatnom PDF pozivnicom za štampu
            sa QR kodom. 5 dizajnerskih tema, latinica i ćirilica. Od 5.000 din,
            gotova za 24h.
          </p>
          <p>
            Pozivnica za venčanje, pozivnice za vencanje, digitalna pozivnica za
            venčanje, website pozivnica, online pozivnica za svadbu, elektronska
            pozivnica, e-pozivnica, pozivnica za venčanje sa QR kodom, pozivnica
            za venčanje cena, besplatna pozivnica za štampu, pozivnica sa RSVP,
            pozivnica za svadbu, moderna pozivnica za venčanje, jeftina
            pozivnica za venčanje, PDF pozivnica za venčanje, web pozivnica za
            svadbu.
          </p>
          <p>
            Pozivnica za venčanje Beograd, pozivnica za venčanje Novi Sad,
            pozivnica za venčanje Niš, pozivnica za venčanje Kragujevac,
            pozivnica za venčanje Subotica. Dostupno u celoj Srbiji.
          </p>
          <p>
            Kompletni paket uključuje website pozivnicu, raspored sedenja,
            digitalnu audio knjigu utisaka i besplatnu PDF pozivnicu za štampu.
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
