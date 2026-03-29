import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  Check,
  Truck,
  MapPin,
  Calendar,
  Package,
  ArrowRight,
  Battery,
  Wifi,
  Music,
  Mic,
  Clock,
  ShieldCheck,
  Gift,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ContactForm from "@/components/landing/ContactForm";
import { pricing, formatPrice } from "@/data/pricing";
import RelatedPosts from "./RelatedPosts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title:
    "Telefon Uspomena za Venčanje — Retro Telefon za Audio Poruke | HALO Uspomene",
  description:
    "Telefon uspomena za venčanja u Srbiji. Iznajmite retro telefon sa brojčanikom — gosti ostavljaju glasovne poruke. Audio guest book od 9.000 din. Dostava u Beograd, Novi Sad i celu Srbiju.",
  keywords: [
    "telefon uspomena",
    "telefon uspomena za venčanje",
    "telefon uspomena cena",
    "telefon uspomena beograd",
    "telefon uspomena novi sad",
    "retro telefon za venčanje",
    "retro telefon za svadbe",
    "vintage telefon venčanje",
    "audio guest book",
    "audio guest book srbija",
    "audio guest book za venčanje",
    "iznajmljivanje retro telefona",
    "audio knjiga utisaka",
    "audio knjiga utisaka za venčanje",
    "telefon za glasovne poruke",
    "svadbeni telefon",
    "audio uspomene",
    "retro telefon uspomena",
    "vintage telefon za svadbu",
    "telefon za snimanje poruka na venčanju",
    "audio guest book cena",
    "audio guest book beograd",
    "audio guest book novi sad",
    "telefon za poruke gostiju",
    "knjiga utisaka alternativa",
    "originalan poklon za mladence",
    "audio poruke gostiju",
    "glasovne poruke venčanje",
  ],
  openGraph: {
    title: "Telefon Uspomena za Venčanje | HALO Uspomene",
    description:
      "Iznajmite retro telefon za venčanje — gosti podižu slušalicu i ostavljaju glasovne poruke. Audio guest book od 9.000 din sa dostavom u celoj Srbiji.",
    type: "website",
    url: `${siteUrl}/telefon-uspomena`,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Telefon Uspomena za Venčanje | HALO Uspomene",
    description:
      "Retro telefon za glasovne poruke gostiju na venčanju. Audio guest book — 9.000 din, dostava u celoj Srbiji.",
  },
  alternates: {
    canonical: `${siteUrl}/telefon-uspomena`,
  },
};

const packageFeatures = [
  "Autentični vintage telefon",
  "Dostava kurirskom službom u celoj Srbiji",
  "Elegantno retro uputstvo i dekoracija",
  "Svi audio snimci u digitalnom formatu",
  "Na vašoj adresi čak do 5 dana",
  "Personalizovana poruka dobrodošlice",
  "Besplatan povrat uređaja za celu Srbiju",
];

const howItWorksSteps = [
  {
    icon: <Calendar size={20} />,
    title: "Rezervišite datum",
    desc: "Kontaktirajte nas najbolje 4-6 nedelja pre venčanja i rezervišite telefon za vaš datum.",
  },
  {
    icon: <Truck size={20} />,
    title: "Telefon stiže do vas",
    desc: "Kurirska dostava u celoj Srbiji, ili lična dostava i montaža u Novom Sadu.",
  },
  {
    icon: <Sparkles size={20} />,
    title: "Postavite telefon u sali",
    desc: "Uz elegantno retro uputstvo i dekoraciju — postavite na vidno mesto i on je spreman.",
  },
  {
    icon: <Mic size={20} />,
    title: "Gosti ostavljaju poruke",
    desc: "Neograničen broj snimaka, celu noć na bateriji. Gosti podižu slušalicu i govore od srca.",
  },
  {
    icon: <Gift size={20} />,
    title: "Dobijate digitalni album",
    desc: "Sve glasovne poruke spremne za 3-5 dana — i mi vam šaljemo link za preuzimanje ili USB suvenir.",
  },
];

const faqItems = [
  {
    q: "Šta je telefon uspomena?",
    a: "Telefon uspomena je vintage retro telefon sa brojčanikom koji se postavlja na venčanju. Gosti podižu slušalicu i ostavljaju glasovne poruke za mladence — umesto klasične knjige utisaka, dobijate audio uspomene koje možete slušati godinama.",
  },
  {
    q: "Koliko košta iznajmljivanje telefona uspomena?",
    a: `Audio Guest Book paket košta ${formatPrice(pricing.packages.essential.price)}. Cena uključuje vintage telefon, kurirsku dostavu i povrat u celoj Srbiji, elegantno uputstvo i dekoraciju, i sve audio snimke u digitalnom formatu. Dodaci: Personalizovana audio dobrodošlica (${formatPrice(pricing.addons.find((a) => a.id === "personalizovana_dobrodoslica")!.price)}), Retro kaseta USB (${formatPrice(pricing.addons.find((a) => a.id === "usb_kaseta")!.price)}), Uspomene u boci USB (${formatPrice(pricing.addons.find((a) => a.id === "usb_bocica")!.price)}).`,
  },
  {
    q: "Da li dostavljate telefon uspomena u Beograd i Novi Sad?",
    a: "Da! Dostavljamo u celu Srbiju — Beograd, Novi Sad, Niš, Kragujevac, Suboticu i sve ostale gradove kurirskom službom. U Novom Sadu nudimo i ličnu dostavu sa montažom.",
  },
  {
    q: "Da li telefon treba struju ili WiFi?",
    a: "Ne! Telefon radi na bateriju koja traje celu noć — nema potrebe za strujom niti WiFi konekcijom. Jednostavno ga postavite gde želite i spreman je za korišćenje.",
  },
  {
    q: "Koliko poruka gosti mogu da ostave?",
    a: "Nema ograničenja! U proseku, na venčanjima sa 150-200 gostiju dobijemo između 50 i 100 poruka. Svaka poruka može trajati koliko god gost želi.",
  },
  {
    q: "Da li je ovo pravi telefon sa brojčanikom?",
    a: "Ovo je autentičan vintage telefon sa replikom rotirajućeg brojčanika koji je fabrički napravljen za snimanje audio poruka. Potpuno je funkcionalan — gosti podižu slušalicu i ostavljaju poruku baš kao na pravom telefonu.",
  },
  {
    q: "Koje boje retro telefona su dostupne?",
    a: "Trenutno u ponudi imamo klasične vintage telefone u crnoj i beloj boji — elegantni modeli koji se savršeno uklapaju u svaku dekoraciju i izgledaju spektakularno na fotografijama.",
  },
  {
    q: "Koliko unapred treba da rezervišem telefon uspomena?",
    a: "Preporučujemo rezervaciju najmanje 4-6 nedelja pre venčanja. U sezoni venčanja (maj-septembar) je poželjno i ranije. Kontaktirajte nas čim odredite datum!",
  },
  {
    q: "Kako se telefon vraća nakon venčanja?",
    a: "Telefon šaljete nazad kurirskom službom u istoj kutiji u kojoj ste ga primili — mi pokrivamo troškove povratne dostave. Za klijente u Novom Sadu, lično dolazimo po telefon.",
  },
  {
    q: "Da li mogu da koristim telefon uspomena za rođendan ili drugi događaj?",
    a: "Apsolutno! Iako su venčanja naš primarni fokus, telefon uspomena je savršen i za rođendane, godišnjice, proslave mature, korporativne događaje i svaku priliku gde želite da sačuvate glasove svojih najdražih.",
  },
];

export default function TelefonUspomenaPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Telefon Uspomena — Retro Telefon za Venčanja",
    description:
      "Iznajmljivanje retro telefona sa brojčanikom za venčanja u Srbiji. Gosti ostavljaju glasovne poruke — audio guest book od 9.000 din sa dostavom u celoj Srbiji.",
    image: `${siteUrl}/images/phone.webp`,
    brand: { "@type": "Brand", name: "HALO Uspomene" },
    url: `${siteUrl}/telefon-uspomena`,
    offers: {
      "@type": "Offer",
      price: "9000",
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
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "RS",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 5,
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
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Kako koristiti telefon uspomena na venčanju",
    description:
      "Vodič u 5 koraka za iznajmljivanje i korišćenje retro telefona za audio poruke gostiju na venčanju.",
    step: howItWorksSteps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.title,
      text: step.desc,
    })),
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]">
        {/* JSON-LD schemas */}
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
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
                  { label: "Telefon Uspomena" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Text */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#AE343F]/10 rounded-full mb-6">
                  <Phone size={14} className="text-[#AE343F]" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#AE343F]">
                    Audio Guest Book
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] mb-6 leading-[1.1]">
                  Telefon Uspomena{" "}
                  <span className="text-[#AE343F] italic">za Venčanje</span>
                </h1>

                <p className="text-lg sm:text-xl text-[#232323]/60 leading-relaxed mb-8 max-w-xl">
                  Retro telefon sa brojčanikom na Vašem venčanju — gosti podižu
                  slušalicu i ostavljaju glasovnu poruku od srca. Audio uspomene
                  koje ćete slušati godinama.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    href="#kontakt"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#AE343F] text-white text-sm uppercase tracking-widest font-medium hover:bg-[#8B2833] transition-all rounded-full"
                  >
                    Rezervišite termin
                  </Link>
                  <Link
                    href="#paketi"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#232323]/10 text-[#232323]/70 text-sm uppercase tracking-widest font-medium hover:border-[#AE343F] hover:text-[#AE343F] transition-all rounded-full"
                  >
                    Pogledajte pakete
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="flex items-center gap-6 text-sm text-[#232323]/40">
                  <span className="flex items-center gap-1.5">
                    <Truck size={14} className="text-[#AE343F]" />
                    Dostava u celoj Srbiji
                  </span>
                  <span className="font-bold text-[#AE343F]">
                    {formatPrice(pricing.packages.essential.price)}
                  </span>
                </div>
              </div>

              {/* Image */}
              <div className="flex justify-center lg:justify-end">
                <Image
                  src="/images/phone.webp"
                  alt="HALO Uspomene vintage retro telefon uspomena sa brojčanikom — audio guest book za venčanja u Srbiji"
                  width={600}
                  height={600}
                  priority
                  className="w-full max-w-md lg:max-w-lg object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ ŠTA JE TELEFON USPOMENA ═══ */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                O telefonu
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
                Šta je telefon uspomena?
              </h2>
            </div>

            <div className="prose prose-lg max-w-none text-[#232323]/70 leading-relaxed space-y-5">
              <p>
                Telefon uspomena je vintage retro telefon koji se postavlja na
                venčanju kao interaktivna atrakcija. Umesto klasične knjige
                utisaka gde gosti pišu poruke, ovde gosti{" "}
                <strong>podižu slušalicu i govore šta im je na srcu</strong> — a
                njihove glasove zajedno čuvamo zauvek.
              </p>
              <p>
                Zamislite trenutak: vaši najbilži podižu slušalicu, nasmeju se,
                i kažu reči koje će vas rasplakati od sreće svaki put kad ih
                čujete. Vaš najbolji prijatelj priča anegdotu sa fakulteta.
                Mladina kuma peva njihovu pesmu. To su{" "}
                <strong>audio uspomene koje ništa ne može da zameni</strong>.
              </p>
              <p>
                HALO Uspomene nudi iznajmljivanje retro telefona za venčanja,
                ali i druge proslave, širom Srbije — sa kompletnom dostavom,
                uputstvom i svim audio snimcima u digitalnom formatu. Telefon
                radi na bateriju, ne zahteva WiFi, i spreman je za korišćenje
                čim ga raspakujete.
              </p>
            </div>

            {/* Quick facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
              {[
                {
                  icon: <Battery size={20} />,
                  label: "Baterija",
                  value: "Ceo događaj",
                },
                {
                  icon: <Wifi size={20} />,
                  label: "WiFi",
                  value: "Nije potreban",
                },
                {
                  icon: <Music size={20} />,
                  label: "Poruke",
                  value: "Neograničeno",
                },
                {
                  icon: <Clock size={20} />,
                  label: "Snimci za",
                  value: "3-5 dana",
                },
              ].map((fact) => (
                <div
                  key={fact.label}
                  className="text-center p-4 bg-[#F5F4DC]/50 rounded-2xl border border-[#232323]/5"
                >
                  <div className="flex justify-center mb-2 text-[#AE343F]">
                    {fact.icon}
                  </div>
                  <p className="text-xs text-[#232323]/40 mb-0.5">
                    {fact.label}
                  </p>
                  <p className="text-sm font-semibold text-[#232323]">
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ KAKO FUNKCIONIŠE ═══ */}
        <section className="py-16 sm:py-24 bg-[#232323] relative overflow-hidden">
          <style>{`
            @keyframes dotWave2 {
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
              animation: "dotWave2 12s ease-in-out infinite",
            }}
          />
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#AE343F]/8 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <div className="text-center mb-12 sm:mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                5 jednostavnih koraka
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F4DC] mb-6">
                Kako funkcioniše telefon uspomena na venčanju?
              </h2>
              <p className="text-lg text-[#F5F4DC]/50 max-w-2xl mx-auto">
                Od rezervacije do digitalnog albuma ili USB suvenira
              </p>
            </div>

            <div className="space-y-6">
              {howItWorksSteps.map((step, i) => (
                <div
                  key={step.title}
                  className="flex items-start gap-5 bg-white/[0.07] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#AE343F]/20 flex items-center justify-center shrink-0 text-[#AE343F]">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[#AE343F]/60 font-serif font-black text-lg">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-[#F5F4DC] text-lg font-semibold">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-[#F5F4DC]/50 text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PAKET + CENA ═══ */}
        <section className="py-16 sm:py-20 bg-[#F5F4DC]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Šta je uključeno
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Audio Guest Book paket
              </h2>
              <p className="text-3xl font-serif font-bold text-[#AE343F]">
                {formatPrice(pricing.packages.essential.price)}
              </p>
            </div>

            <div className="max-w-md mx-auto mb-12">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#AE343F] shadow-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-[#F5F4DC] rounded-xl flex items-center justify-center">
                    <Package className="text-[#AE343F]" size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-[#232323] leading-tight">
                      Audio Guest Book
                    </h3>
                    <p className="text-sm font-semibold text-[#AE343F]">
                      Kompletni paket
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {packageFeatures.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-sm text-[#232323]/80"
                    >
                      <Check
                        size={14}
                        className="text-[#AE343F] flex-shrink-0"
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-[#232323]/40 mb-5 pl-1">
                  Lična dostava i montaža dostupna je samo u Novom Sadu.
                </p>

                <Link
                  href="#kontakt"
                  className="block w-full text-center py-3 rounded-xl text-sm font-bold transition-colors bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC]"
                >
                  Rezervišite termin
                </Link>
              </div>
            </div>

            {/* Addons */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-[#232323]/40 mb-6">
                Dodaci
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {pricing.addons.map((addon) => (
                  <div
                    key={addon.id}
                    className="bg-white rounded-xl p-5 border border-[#d4af37]/20 text-center"
                  >
                    <p className="text-sm font-semibold text-[#232323] mb-1">
                      {addon.label}
                    </p>
                    <p className="text-xs text-[#232323]/40 mb-2">
                      {addon.note}
                    </p>
                    <p className="text-sm font-bold text-[#d4af37]">
                      {formatPrice(addon.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ RETRO VS DIGITALNA ═══ */}
        <section id="paketi" className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Poređenje
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#232323] mb-4">
                Retro telefon vs Digitalna audio knjiga utisaka
              </h2>
              <p className="text-[#232323]/50 max-w-2xl mx-auto">
                Dva načina da sačuvate glasovne poruke gostiju — izaberite ono
                što odgovara vašem venčanju.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Retro phone */}
              <div className="bg-[#F5F4DC] border-2 border-[#AE343F]/20 rounded-2xl p-6 sm:p-8 relative">
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-[#AE343F] text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Popularniji
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Phone size={20} className="text-[#AE343F]" />
                  <h3 className="text-xl font-serif text-[#232323]">
                    Retro Telefon Uspomena
                  </h3>
                </div>
                <p className="text-2xl font-serif font-bold text-[#AE343F] mb-4">
                  {formatPrice(pricing.packages.essential.price)}
                </p>
                <ul className="space-y-2 mb-4">
                  {[
                    "Fizički vintage telefon na venčanju",
                    "WOW efekat — centralni detalj sale",
                    "Gosti podižu pravu slušalicu",
                    "Radi na bateriju, bez WiFi-ja",
                    "Kurirska dostava + povrat besplatan",
                    "Svi snimci u digitalnom formatu ili kao USB suvenir",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-[#232323]/70"
                    >
                      <Check size={14} className="text-[#AE343F] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Digital audio book */}
              <div className="bg-[#F5F4DC] border border-[#d4af37]/20 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Mic size={20} className="text-[#d4af37]" />
                  <h3 className="text-xl font-serif text-[#232323]">
                    Digitalna Audio Knjiga
                  </h3>
                </div>
                <p className="text-2xl font-serif font-bold text-[#d4af37] mb-4">
                  {formatPrice(pricing.pozivnica.audio.price)}
                  <span className="text-sm font-normal text-[#232323]/40 ml-2">
                    uz pozivnicu
                  </span>
                </p>
                <ul className="space-y-2 mb-4">
                  {[
                    "Gosti snimaju sa svog pametnog telefona",
                    "Skeniraju QR kod — bez aplikacije",
                    "Dostupna uz website pozivnicu",
                    "Idealno za manji budžet",
                    "Neograničen broj poruka",
                    "Digitalni album za preuzimanje ili USB suvenir",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-[#232323]/70"
                    >
                      <Check size={14} className="text-[#d4af37] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cene"
                  className="inline-flex items-center gap-1.5 text-sm text-[#d4af37] font-medium hover:underline"
                >
                  Pogledajte cene pozivnica
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ DOSTAVA ═══ */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Dostava
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#232323] mb-4">
                Dostava retro telefona u celoj Srbiji
              </h2>
              <p className="text-[#232323]/50 max-w-2xl mx-auto">
                Gde god da je vaše venčanje — telefon uspomena stiže do vas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-2xl p-6 text-center border border-stone-100 shadow-sm">
                <div className="w-12 h-12 bg-[#AE343F]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Truck size={22} className="text-[#AE343F]" />
                </div>
                <h3 className="font-semibold text-[#232323] mb-2">
                  Kurirska dostava
                </h3>
                <p className="text-sm text-[#232323]/50">
                  Besplatna dostava i povrat u svim gradovima Srbije kurirskom
                  službom.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center border border-stone-100 shadow-sm">
                <div className="w-12 h-12 bg-[#AE343F]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin size={22} className="text-[#AE343F]" />
                </div>
                <h3 className="font-semibold text-[#232323] mb-2">
                  Lična dostava — Novi Sad
                </h3>
                <p className="text-sm text-[#232323]/50">
                  U Novom Sadu nudimo ličnu dostavu i montažu telefona u sali
                  venčanja.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center border border-stone-100 shadow-sm">
                <div className="w-12 h-12 bg-[#AE343F]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={22} className="text-[#AE343F]" />
                </div>
                <h3 className="font-semibold text-[#232323] mb-2">
                  Besplatan povrat
                </h3>
                <p className="text-sm text-[#232323]/50">
                  Nakon venčanja, telefon šaljete nazad u istoj kutiji — mi
                  pokrivamo troškove.
                </p>
              </div>
            </div>

            {/* City chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Beograd",
                "Novi Sad",
                "Niš",
                "Kragujevac",
                "Subotica",
                "Čačak",
                "Smederevo",
                "Zrenjanin",
                "Pančevo",
                "Šabac",
              ].map((city) => (
                <span
                  key={city}
                  className="px-4 py-2 bg-white border border-[#232323]/8 rounded-full text-sm text-[#232323]/60"
                >
                  <MapPin size={12} className="inline mr-1.5 text-[#AE343F]" />
                  {city}
                </span>
              ))}
              <Link
                href="/lokacije"
                className="px-4 py-2 bg-[#AE343F]/10 border border-[#AE343F]/20 rounded-full text-sm text-[#AE343F] font-medium hover:bg-[#AE343F]/15 transition-colors"
              >
                Svi gradovi →
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
                Sve o telefonu uspomena
              </h2>
              <p className="text-lg text-[#232323]/50 max-w-2xl mx-auto">
                Odgovori na najčešća pitanja o našem retro telefonu za venčanja.
              </p>
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

        {/* ═══ RELATED BLOG POSTS ═══ */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Saznajte više
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#232323] mb-4">
                Članci o audio uspomenama
              </h2>
            </div>

            <RelatedPosts />
          </div>
        </section>

        {/* ═══ CONTACT CTA ═══ */}
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
                retro telefona na vreme.
              </p>
            </div>

            <ContactForm />
          </div>
        </section>

        {/* ═══ SEO HIDDEN CONTENT ═══ */}
        <section className="sr-only">
          <h2>Telefon Uspomena — Audio Guest Book za Venčanja u Srbiji</h2>
          <p>
            Telefon uspomena je retro telefon sa brojčanikom koji se koristi na
            venčanjima u Srbiji kao audio guest book. Gosti podižu slušalicu i
            ostavljaju glasovne poruke za mladence. HALO Uspomene nudi
            iznajmljivanje retro telefona za venčanja u svim gradovima: Beograd,
            Novi Sad, Niš, Kragujevac, Subotica, Čačak, Smederevo, Zrenjanin,
            Pančevo, Šabac i svi ostali gradovi u Srbiji.
          </p>
          <p>
            Telefon uspomena cena: Audio Guest Book paket košta 9.000 din sa
            besplatnom dostavom i povratom. Dodaci: USB retro kaseta 2.500 din,
            USB bočica 2.000 din, personalizovana audio dobrodošlica 1.000 din.
            Telefon uspomena Beograd — kurirska dostava. Telefon uspomena Novi
            Sad — lična dostava i montaža.
          </p>
          <p>
            Audio guest book, audio knjiga utisaka, audio knjiga uspomena, audio
            spomenar, vintage telefon za venčanje, retro telefon za svadbe,
            svadbeni telefon, telefon za glasovne poruke gostiju, telefon za
            snimanje poruka na venčanju, iznajmljivanje retro telefona za
            svadbu, glasovne poruke venčanje, audio poruke gostiju, originalan
            poklon za mladence, knjiga utisaka alternativa, moderni detalji za
            venčanje.
          </p>
          <p>
            HALO Uspomene je kompletna platforma za organizaciju venčanja:
            website pozivnice sa RSVP-om, raspored sedenja, digitalna audio
            knjiga utisaka i retro telefon uspomena. Sve na jednom mestu.
            Pogledajte i našu stranicu sa{" "}
            <Link href="/cene">cenama pozivnica</Link> i{" "}
            <Link href="/lokacije">dostupnim gradovima</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
