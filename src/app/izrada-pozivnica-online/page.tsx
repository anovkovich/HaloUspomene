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
  Timer,
  MapPin,
  Heart,
  PartyPopper,
  Cake,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import InvitationClusterLinks from "@/components/seo/InvitationClusterLinks";
import StampaneLeadForm from "./StampaneLeadForm";
import LiveExamplesRow from "./LiveExamplesRow";
import PromoCapture from "@/components/PromoCapture";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title:
    "Izrada Pozivnica Online — Napravi Digitalnu Pozivnicu za Svaku Priliku",
  description:
    "Napravite pozivnicu online za venčanje, dečiji rođendan, prvi rođendan ili punoletstvo. Personalizovana digitalna pozivnica sa potvrdama dolaska, odbrojavanjem i mapom — gotova odmah.",
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
      "Digitalna pozivnica za venčanje, rođendan, prvi rođendan ili punoletstvo — sa potvrdama dolaska, odbrojavanjem i mapom. Gotova odmah.",
    type: "website",
    url: `${siteUrl}/izrada-pozivnica-online`,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Izrada Pozivnica Online za Svaku Priliku | HALO Uspomene",
    description:
      "Napravite digitalnu pozivnicu za venčanje, rođendan ili punoletstvo — sa potvrdama dolaska i odbrojavanjem.",
  },
  alternates: {
    canonical: `${siteUrl}/izrada-pozivnica-online`,
  },
};

const heroPills = [
  { icon: <CheckCircle2 size={15} />, label: "Potvrde dolaska" },
  { icon: <Timer size={15} />, label: "Odbrojavanje" },
  { icon: <MapPin size={15} />, label: "Mapa" },
  { icon: <QrCode size={15} />, label: "PDF sa QR" },
];

const benefits = [
  {
    icon: <Send size={24} />,
    title: "Podelite jednim linkom",
    desc: "Pozivnicu šaljete preko WhatsApp-a, Vibera ili e-maila — bez štampe i bez deljenja papira.",
  },
  {
    icon: <CheckCircle2 size={24} />,
    title: "Potvrde dolaska uživo",
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
    title: "Dobijate pozivnicu odmah",
    desc: "Softver odmah generiše vašu pozivnicu iz podataka iz upitnika — spremna je istog trena. Čim uplatite, šaljete je gostima, uz PDF sa QR kodom.",
  },
];

// Live-examples carousel — one card per occasion, each cycling several theme
// variants via subtle arrows. `gradient`/`initials` still drive the skeleton
// screen, which shows for any variant left without a clip.
// (Prvi rođendan is intentionally not a visible card here — it stays SEO-linked
//  in the hidden section and the chooser above.)
const clip = (name: string) => ({
  videoWebm: `/videos/${name}.webm`,
  poster: `/videos/${name}-poster.webp`,
});

const liveExamples = [
  {
    label: "Venčanje",
    desc: "Više boja i fontova · jedan primer uživo",
    createHref: "/cene",
    variants: [
      { theme: "Classic Rose", gradient: "linear-gradient(160deg, #AE343F, #7a1f27)", initials: "A & D", liveHref: "/pozivnica/ana-dejan", ...clip("poz-rose") },
      { theme: "Luxury Gold", gradient: "linear-gradient(160deg, #3a3226, #6b5a2f)", initials: "A & D", initialsColor: "#f0e2b8", liveHref: "/pozivnica/ana-dejan", ...clip("poz-gold") },
      { theme: "Modern Blue", gradient: "linear-gradient(160deg, #3f5c78, #26374a)", initials: "A & D", liveHref: "/pozivnica/ana-dejan", ...clip("poz-blue") },
    ],
  },
  {
    label: "Venčanje Premium",
    desc: "Tri premium teme · primer uživo za svaku",
    featured: true,
    createHref: "/napravi-pozivnicu?premium=1&raspored=1&audio=1&galerija=1&paket=premium",
    variants: [
      { theme: "Watercolor", gradient: "linear-gradient(160deg, #24303f, #3a2b40)", initials: "T & B", initialsColor: "#e8c9a0", liveHref: "/premium-pozivnica/teodora-bojan", ...clip("pre-watercolor") },
      { theme: "Parallax", gradient: "linear-gradient(160deg, #7d7f6e, #585a49)", initials: "A & M", liveHref: "/premium-pozivnica/ana-marko", ...clip("pre-paper") },
      { theme: "Fountain", gradient: "linear-gradient(160deg, #8a1f28, #AE343F)", initials: "M & N", initialsColor: "#f0d9b0", liveHref: "/premium-pozivnica/milica-nikola", ...clip("pre-burgundy") },
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
    label: "Punoletstvo",
    desc: "Više boja · primer uživo za svaku",
    createHref: "/napravi-punoletstvo",
    variants: [
      { theme: "Bordo & zlato", gradient: "linear-gradient(160deg, #2b2b2b, #4a3f2a)", initials: "18", initialsColor: "#d4af37", liveHref: "/punoletstvo/primer-devojka", ...clip("pun-devojka") },
      { theme: "Teget & zlato", gradient: "linear-gradient(160deg, #1f2a44, #2c3a5a)", initials: "18", initialsColor: "#d4af37", liveHref: "/punoletstvo/primer-momak", ...clip("pun-momak") },
    ],
  },
];

const clusterPills = [
  { icon: <Heart size={15} />, label: "Venčanje", href: "/napravi-pozivnicu" },
  {
    icon: <PartyPopper size={15} />,
    label: "Dečiji rođendan",
    href: "/napravi-deciju-pozivnicu",
  },
  {
    icon: <Cake size={15} />,
    label: "Prvi rođendan",
    href: "/pozivnica-za-prvi-rodjendan",
  },
  {
    icon: <Sparkles size={15} />,
    label: "Punoletstvo",
    href: "/napravi-punoletstvo",
  },
];

const faqItems = [
  {
    q: "Za koje prilike mogu da napravim pozivnicu online?",
    a: "Trenutno izrađujemo digitalne pozivnice za venčanje, dečiji rođendan (svih uzrasta, uključujući prvi rođendan) i punoletstvo (18. rođendan). Svaka vrsta ima poseban dizajn prilagođen prilici.",
  },
  {
    q: "Koliko traje izrada pozivnice?",
    a: "Pozivnica je gotova odmah — čim popunite kratak upitnik u 4 koraka (par minuta), spremna je, a otključavate je nakon plaćanja, bez čekanja.",
  },
  {
    q: "Šta je uključeno u digitalnu pozivnicu?",
    a: "Personalizovani dizajn, forma za potvrdu dolaska, odbrojavanje do događaja, lokacija na Google mapi i optimizacija za mobilne uređaje. Uz to dobijate i PDF verziju sa QR kodom.",
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

/** Faint skeleton "text" bars used inside the decorative fan cards. */
function Bars({ tone = "dark" }: { tone?: "dark" | "gold" }) {
  const bar = tone === "gold" ? "bg-[#F5F4DC]/15" : "bg-[#232323]/10";
  return (
    <div className="flex flex-col gap-1 items-center mt-1.5">
      <span className={`h-1 w-14 rounded-full ${bar}`} />
      <span className={`h-1 w-10 rounded-full ${bar}`} />
      <span className={`h-1 w-12 rounded-full ${bar}`} />
    </div>
  );
}

/** Decorative CSS "fan" of three occasion cards for the hero — Dečiji (left) ·
 *  Punoletstvo gold (center, elevated) · Venčanje (right). No images → no LCP
 *  cost; the h1 remains the LCP element. */
function InvitationFan() {
  return (
    <div className="relative flex items-end justify-center py-6 select-none">
      {/* Dečiji rođendan — left, playful */}
      <div
        className="relative z-10 w-28 sm:w-32 aspect-[3/4] rounded-2xl bg-white border border-[#232323]/8 shadow-xl flex flex-col items-center justify-center p-3 overflow-hidden"
        style={{ transform: "rotate(-8deg) translateY(20px)" }}
      >
        <span className="absolute top-3 left-4 w-2 h-2 rounded-full bg-[#AE343F]/40" />
        <span className="absolute top-4 right-5 w-1.5 h-1.5 rounded-full bg-[#d4af37]/70" />
        <span className="absolute top-2.5 right-9 w-1.5 h-1.5 rounded-full bg-[#4a7ba6]/60" />
        <span className="absolute top-10 left-6 w-1.5 h-1.5 rounded-full bg-[#7a9b6d]/60" />
        <span className="absolute bottom-5 left-5 w-1.5 h-1.5 rounded-full bg-[#d4af37]/50" />
        <span className="absolute bottom-6 right-6 w-2 h-2 rounded-full bg-[#AE343F]/30" />
        <span className="font-serif text-4xl text-[#AE343F] leading-none">
          5
        </span>
        <span className="text-[8px] uppercase tracking-[0.12em] text-[#232323]/50 mt-2">
          Dečiji rođendan
        </span>
        <Bars />
      </div>

      {/* Punoletstvo — center, gold cream, elevated (on top) */}
      <div
        className="relative z-20 -ml-5 w-28 sm:w-36 aspect-[3/4] rounded-2xl bg-[#FDF6EC] border border-[#d4af37]/40 shadow-2xl flex flex-col items-center justify-center p-3"
        style={{ transform: "rotate(0deg)" }}
      >
        <div className="flex gap-1.5 mb-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-[2px] bg-[#d4af37]/70"
            />
          ))}
        </div>
        <span className="font-serif text-5xl text-[#d4af37] leading-none mt-1">
          18
        </span>
        <span className="text-[8px] uppercase tracking-[0.16em] text-[#8a7a4a] mt-2">
          Punoletstvo
        </span>
        <span className="w-12 h-0.5 bg-[#d4af37]/50 mt-3" />
      </div>

      {/* Venčanje — right, elegant / rich */}
      <div
        className="relative z-10 -ml-5 w-28 sm:w-32 aspect-[3/4] rounded-2xl bg-[#FDFBF5] border border-[#d4af37]/40 shadow-xl flex flex-col items-center justify-center p-3"
        style={{ transform: "rotate(8deg) translateY(20px)" }}
      >
        <span className="absolute inset-2 rounded-xl border border-[#d4af37]/25 pointer-events-none" />
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-4 h-px bg-[#d4af37]/60" />
          <span className="w-1.5 h-1.5 rotate-45 bg-[#d4af37]/70" />
          <span className="w-4 h-px bg-[#d4af37]/60" />
        </div>
        <span className="font-serif text-2xl text-[#232323] leading-none mt-1">
          M <span className="text-[#d4af37]">&amp;</span> J
        </span>
        <span className="text-[8px] uppercase tracking-[0.16em] text-[#232323]/50 mt-2">
          Venčanje
        </span>
        <span className="text-[8px] tracking-wider text-[#a08a4a] mt-1">
          12 · 08 · 2025
        </span>
        <span className="mt-2.5 text-[8px] bg-[#AE343F] text-white px-2.5 py-0.5 rounded-full">
          Potvrdi dolazak
        </span>
      </div>
    </div>
  );
}

export default function IzradaPozivnicaOnline() {
  return (
    <>
      <PromoCapture />
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
        <section className="relative pt-28 sm:pt-32 pb-14 sm:pb-20 overflow-hidden">
          <div className="absolute top-10 right-0 w-96 h-96 bg-[#AE343F]/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#d4af37]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Izrada pozivnica online" },
              ]}
            />

            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center mt-8">
              {/* Text */}
              <div className="lg:col-span-7">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-5">
                  Jedna platforma · četiri prilike
                </p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] leading-[1.08] mb-6">
                  Izrada pozivnica online —{" "}
                  <span className="italic text-[#AE343F]">bez čekanja</span>
                </h1>
                <p className="text-lg sm:text-xl text-[#232323]/60 max-w-xl leading-relaxed mb-8">
                  Najlepše proslave počinju pozivom koji se pamti. Pogledajte
                  primere, izaberite svoj — i pozivnica je vaša istog trenutka.
                </p>

                <div className="flex flex-wrap gap-2.5 mb-8">
                  {heroPills.map((pill) => (
                    <span
                      key={pill.label}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#232323]/8 rounded-full text-sm text-[#232323]/60"
                    >
                      <span className="text-[#AE343F]">{pill.icon}</span>
                      {pill.label}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="#prilike"
                    className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[#AE343F] hover:bg-[#8A2A32] text-white text-sm uppercase tracking-widest font-medium rounded-full shadow-xl shadow-[#AE343F]/30 transition-all"
                  >
                    Izaberite priliku
                    <ArrowRight size={16} />
                  </a>
                  <a
                    href="#primeri"
                    className="inline-flex items-center justify-center gap-2 px-9 py-4 border-2 border-[#232323]/15 text-[#232323]/70 text-sm uppercase tracking-widest font-medium rounded-full hover:border-[#AE343F] hover:text-[#AE343F] transition-all"
                  >
                    Pogledajte primere
                  </a>
                </div>

              </div>

              {/* Visual — fan of invitations */}
              <div className="lg:col-span-5">
                <InvitationFan />
              </div>
            </div>
          </div>
        </section>

        {/* CHOOSER — all event types */}
        <section id="prilike" className="py-12 sm:py-16 scroll-mt-24">
          <InvitationClusterLinks
            title="Za koju priliku pravite pozivnicu?"
            subtitle="Izaberite tip događaja — svaka pozivnica ima dizajn prilagođen prilici."
            showHubLink={false}
            hrefOverrides={{ vencanje: "/cene" }}
          />
        </section>

        {/* PRIMERI UŽIVO — placeholder for real invitation clips (separate task) */}
        <section
          id="primeri"
          className="py-16 sm:py-24 bg-[#232323] relative overflow-hidden scroll-mt-24"
        >
          <style>{`
            @keyframes dotWaveIzrada {
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
              animation: "dotWaveIzrada 12s ease-in-out infinite",
            }}
          />

          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-4">
                Pogledajte uživo
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F4DC] mb-4">
                Ovako izgleda{" "}
                <span className="italic text-[#d4af37]">vaša pozivnica</span>
              </h2>
              <p className="text-[#F5F4DC]/50 max-w-2xl mx-auto">
                Prava pozivnica se ne opisuje — otvara se. Zavirite kako gosti
                doživljavaju svaku priliku.
              </p>
            </div>

            <LiveExamplesRow examples={liveExamples} />
          </div>
        </section>

        {/* BENEFITS */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Zašto online pozivnica
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Ovako je sve{" "}
                <span className="italic text-[#AE343F]">mnogo lakše!</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="p-6 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5 hover:border-[#AE343F]/20 hover:shadow-md transition-all"
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
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Kako funkcioniše
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323]">
                Od ideje do pozivnice{" "}
                <span className="italic text-[#AE343F]">za par minuta</span>
              </h2>
            </div>
            <div className="relative">
              {/* connecting line behind the numbered nodes (desktop) */}
              <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#AE343F]/10 via-[#AE343F]/40 to-[#AE343F]/10" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative">
                {steps.map((step) => (
                  <div
                    key={step.n}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="relative z-10 w-16 h-16 rounded-full bg-[#AE343F] text-white flex items-center justify-center font-serif text-2xl shadow-lg shadow-[#AE343F]/25">
                      {step.n}
                    </div>
                    <h3 className="font-serif text-xl text-[#232323] mt-5 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#232323]/55 leading-relaxed max-w-xs">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ŠTAMPANE POZIVNICE + QR */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="relative overflow-hidden rounded-3xl bg-[#232323] text-[#F5F4DC] p-8 sm:p-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#AE343F]/15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center shrink-0">
                  <QrCode size={40} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-3">
                    Volite nešto u ruci?
                  </p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif leading-tight mb-4">
                    Štampane pozivnice i zahvalnice{" "}
                    <span className="italic text-[#d4af37]">sa QR kodom</span>
                  </h2>
                  <p className="text-[#F5F4DC]/60 leading-relaxed mb-6 max-w-2xl">
                    Pored digitalne, ručno izrađujemo i štampane pozivnice sa QR
                    kodom za potvrdu dolaska — pored klasičnog broja telefona — i
                    zahvalnice sa QR kodom koji vodi na foto galeriju venčanja.
                    Uz poseban popust za naše korisnike.
                  </p>
                  <a
                    href="#kontakt"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#AE343F] hover:bg-[#8B2833] text-white text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-xl shadow-[#AE343F]/20"
                  >
                    Zatražite štampane pozivnice
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KONTAKT — štampane pozivnice / zahvalnice */}
        <section id="kontakt" className="py-16 sm:py-24 bg-[#232323] scroll-mt-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-4">
                Štampane pozivnice i zahvalnice
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F4DC] mb-4">
                Zatražite ponudu
              </h2>
              <p className="text-[#F5F4DC]/60 max-w-2xl mx-auto">
                Ručno izrađujemo štampane pozivnice i zahvalnice sa QR kodom —
                pošaljite upit bez obaveze, javljamo se sa ponudom i detaljima.
              </p>
            </div>
            <StampaneLeadForm />
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

        {/* FINAL CTA BAND */}
        <section className="py-16 sm:py-20 md:py-24 bg-[#232323] text-[#F5F4DC] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#AE343F]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#AE343F]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-6">
              Vaša prilika zaslužuje{" "}
              <span className="italic text-[#d4af37]">svoju pozivnicu</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {clusterPills.map((pill) => (
                <Link
                  key={pill.label}
                  href={pill.href}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.07] border border-white/10 rounded-full text-sm text-[#F5F4DC]/80 hover:border-[#d4af37]/40 hover:text-[#F5F4DC] transition-all"
                >
                  <span className="text-[#d4af37]">{pill.icon}</span>
                  {pill.label}
                </Link>
              ))}
            </div>
            <a
              href="#prilike"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#AE343F] text-white text-sm uppercase tracking-widest font-medium hover:bg-[#8B2833] transition-all rounded-full shadow-xl shadow-[#AE343F]/30"
            >
              Napravite pozivnicu
              <ArrowRight size={16} />
            </a>
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
            uključuje formu za potvrdu dolaska, odbrojavanje do događaja,
            lokaciju na Google mapi i PDF verziju sa QR kodom. Pozivnicu delite
            jednim linkom preko WhatsApp-a, Vibera ili e-maila i gotova je
            odmah. Pogledajte i naše{" "}
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
