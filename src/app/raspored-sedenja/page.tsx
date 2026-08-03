import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Armchair,
  ArrowRight,
  Building2,
  Briefcase,
  PartyPopper,
  FileSpreadsheet,
  MousePointerClick,
  QrCode,
  Sparkles,
  Users,
  Shuffle,
  Check,
  X,
  ClipboardList,
  MapPin,
  ChevronDown,
  Smartphone,
  ScanLine,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  formatPrice,
  getStandaloneSeatingPrice,
  getStandaloneSeatingRegularPrice,
  isStandaloneSeatingPromoActive,
  pricing,
} from "@/data/pricing";
import RasporedKontaktForm from "./RasporedKontaktForm";
import GdeSedimInfoButton from "./GdeSedimInfoButton";
import { resolveBypassInfo } from "@/lib/bypass-token";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title: "Raspored Sedenja za Svadbu — Online Alat",
  description:
    'Raspored sedenja i stolova za svadbu online — rasporedite goste, dodajte QR pano dobrodošlice i pretragu gde sedim. Uvoz gostiju, demo i cena po upitu.',
  keywords: [
    "raspored sedenja",
    "raspored sedenja online",
    "raspored sedenja za svadbu",
    "raspored sedenja za venčanje",
    "raspored sedenja za događaj",
    "raspored stolova alat",
    "online raspored sedenja",
    "seating chart srpski",
    "raspored sedenja za konferenciju",
    "raspored sedenja za korporativni event",
    "raspored sedenja za organizatore",
    "raspored sedenja za 100 gostiju",
    "QR pano za event",
    "vizuelni alat za raspored stolova",
    "import gostiju iz Excel-a",
    "raspored sedenja Beograd",
    "raspored sedenja Novi Sad",
    "raspored sedenja Srbija",
    "kako napraviti raspored sedenja",
    "alat za raspored sedenja",
  ],
  openGraph: {
    title: "Raspored sedenja za svadbu ili događaj | HALO Uspomene",
    description:
      "Online alat za raspored stolova + QR Pano dobrodošlice. Za svadbe, konferencije, korporativne evente i veće proslave.",
    type: "website",
    url: `${siteUrl}/raspored-sedenja`,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raspored sedenja za svadbu ili događaj | HALO Uspomene",
    description:
      "Online alat za raspored stolova + QR Pano dobrodošlice za vaš event.",
  },
  alternates: {
    canonical: `${siteUrl}/raspored-sedenja`,
  },
};

/* ─────────────────────────────────────────────────────────────
   VISUAL MOCKS — SVG illustrations for the page
   ───────────────────────────────────────────────────────────── */

/** Prazna šema sale — okrugli stolovi sa strane, mladenački sto, podijum i ulazna vrata. */
function EmptyHallSvg() {
  const cols = [60, 150, 420, 510];
  const rows = [56, 122, 188, 254];
  const tables: { cx: number; cy: number }[] = [];
  rows.forEach((cy) => cols.forEach((cx) => tables.push({ cx, cy })));
  return (
    <svg viewBox="0 0 570 360" className="w-full h-auto">
      {tables.map((t, i) => (
        <circle
          key={i}
          cx={t.cx}
          cy={t.cy}
          r={20}
          fill="#e8e7df"
          stroke="#cfcdc1"
          strokeWidth={1.4}
        />
      ))}
      <rect
        x={222}
        y={42}
        width={126}
        height={30}
        rx={7}
        fill="#e8e7df"
        stroke="#cfcdc1"
        strokeWidth={1.4}
      />
      <text
        x={285}
        y={61}
        textAnchor="middle"
        fontSize="9"
        letterSpacing="1.5"
        fill="#8a8779"
      >
        MLADENCI
      </text>
      <rect
        x={222}
        y={100}
        width={126}
        height={120}
        rx={10}
        fill="rgba(245,244,220,0.08)"
        stroke="rgba(245,244,220,0.28)"
        strokeWidth={1.4}
        strokeDasharray="4 5"
      />
      <text
        x={285}
        y={165}
        textAnchor="middle"
        fontSize="11"
        letterSpacing="2"
        fill="rgba(245,244,220,0.45)"
      >
        PODIJUM
      </text>
      <g stroke="#d4af37" strokeWidth={2} fill="none" strokeLinecap="round">
        <line x1="195" y1="312" x2="250" y2="312" />
        <line x1="320" y1="312" x2="375" y2="312" />
        <line x1="250" y1="312" x2="250" y2="277" />
        <path d="M250 277 A 35 35 0 0 1 285 312" strokeDasharray="3 5" />
        <line x1="320" y1="312" x2="320" y2="277" />
        <path d="M320 277 A 35 35 0 0 0 285 312" strokeDasharray="3 5" />
      </g>
      <text
        x={285}
        y={336}
        textAnchor="middle"
        fontSize="11"
        letterSpacing="2"
        fill="#d4af37"
      >
        ULAZ
      </text>
    </svg>
  );
}

/** Popunjena šema sale — stolovi sa gostima. */
function FilledHallSvg() {
  const tables = [
    { cx: 64, cy: 60, fill: 8 },
    { cx: 180, cy: 52, fill: 7 },
    { cx: 296, cy: 62, fill: 8 },
    { cx: 104, cy: 158, fill: 8 },
    { cx: 232, cy: 162, fill: 6 },
    { cx: 316, cy: 165, fill: 7 },
  ];
  const r = 20;
  const seats = 8;
  return (
    <svg viewBox="0 0 360 220" className="w-full h-auto">
      {tables.map((t, ti) => {
        const dots = [];
        for (let i = 0; i < seats; i++) {
          const a = (i / seats) * Math.PI * 2 - Math.PI / 2;
          const sx = t.cx + (r + 9) * Math.cos(a);
          const sy = t.cy + (r + 9) * Math.sin(a);
          const lit = i < t.fill;
          dots.push(
            <circle
              key={i}
              cx={sx}
              cy={sy}
              r={4.4}
              fill={lit ? "#AE343F" : "#ffffff"}
              stroke={lit ? "#AE343F" : "#cdcbbf"}
              strokeWidth={1.2}
            />,
          );
        }
        return (
          <g key={ti}>
            <circle
              cx={t.cx}
              cy={t.cy}
              r={r}
              fill="#f3ece0"
              stroke="#d8d6ca"
              strokeWidth={1.2}
            />
            {dots}
          </g>
        );
      })}
    </svg>
  );
}

/** Mini mapa sale sa označenim stolom gosta. */
function MiniHallMap() {
  const tables = [
    { cx: 32, cy: 32, hi: false },
    { cx: 90, cy: 26, hi: false },
    { cx: 152, cy: 34, hi: true },
    { cx: 52, cy: 80, hi: false },
    { cx: 116, cy: 82, hi: false },
    { cx: 168, cy: 84, hi: false },
  ];
  return (
    <svg viewBox="0 0 196 110" className="w-full h-auto">
      {tables.map((t, i) => (
        <circle
          key={i}
          cx={t.cx}
          cy={t.cy}
          r={t.hi ? 15 : 12}
          fill={t.hi ? "rgba(174,52,63,0.16)" : "#efeee6"}
          stroke={t.hi ? "#AE343F" : "#d8d6ca"}
          strokeWidth={t.hi ? 2.2 : 1.2}
        />
      ))}
      <circle cx={152} cy={34} r={3.2} fill="#AE343F" />
    </svg>
  );
}

const DOT = {
  confirmed: "#4a8a5c",
  invited: "#d4af37",
  none: "#c9c7bc",
} as const;

function GuestRow({
  name,
  count,
  status,
}: {
  name: string;
  count: string;
  status: keyof typeof DOT;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-stone-200/70 last:border-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: DOT[status] }}
        />
        <span className="text-[13px] text-[#232323]/85 truncate">{name}</span>
      </div>
      <span className="text-[11px] font-semibold text-[#232323]/45 tabular-nums">
        {count}
      </span>
    </div>
  );
}

function GuestListMock() {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="font-serif text-lg text-[#232323]">Lista zvanica</span>
        <span className="text-[11px] font-bold text-[#AE343F] whitespace-nowrap">
          81 zvanica · 196 gostiju
        </span>
      </div>
      <p className="text-[10px] uppercase tracking-[0.15em] text-[#232323]/40 mb-1">
        Familija — Mladina strana
      </p>
      <GuestRow name="Marko Jovanović i Marina" count="2" status="confirmed" />
      <GuestRow name="Jelena Krstić" count="3" status="confirmed" />
      <GuestRow name="Sanja Đukić" count="1" status="invited" />
      <p className="text-[10px] uppercase tracking-[0.15em] text-[#232323]/40 mb-1 mt-4">
        Kolege s posla
      </p>
      <GuestRow name="Nikola Stanković" count="2" status="confirmed" />
      <GuestRow name="Ana Petrović" count="1" status="none" />
    </div>
  );
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-300/30 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 h-9 bg-[#faf9f6] border-b border-stone-200">
        <span className="w-2.5 h-2.5 rounded-full bg-[#e0a0a0]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#e6cf8f]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#a9c9a0]" />
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function IPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[250px]">
      <span className="absolute -left-[3px] top-[88px] w-[3px] h-9 rounded-l bg-[#2a2a2c]" />
      <span className="absolute -left-[3px] top-[136px] w-[3px] h-9 rounded-l bg-[#2a2a2c]" />
      <span className="absolute -right-[3px] top-[120px] w-[3px] h-16 rounded-r bg-[#2a2a2c]" />
      <div className="rounded-[2.9rem] bg-[#1b1b1d] p-[10px] shadow-2xl shadow-stone-400/40">
        <div className="relative rounded-[2.3rem] bg-[#faf9f6] overflow-hidden min-h-[440px]">
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[80px] h-[22px] bg-[#1b1b1d] rounded-full z-20" />
          <div className="pt-11 px-4 pb-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SeatResultMock() {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#232323]/40 mb-1">
        Dobrodošli
      </p>
      <p className="font-serif italic text-xl text-[#d4af37] mb-3">
        Marko Jovanović
      </p>
      <div className="h-px w-12 bg-stone-200 mx-auto mb-3" />
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#232323]/40">
        Vaše mesto
      </p>
      <p className="font-serif text-4xl text-[#232323] my-0.5">Sto 7</p>
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#AE343F] bg-[#AE343F]/10 rounded-full px-3 py-1 mb-4">
        <MapPin size={11} /> Vi ste ovde
      </span>
      <div className="rounded-xl border border-stone-200 bg-white p-3">
        <p className="text-[9px] uppercase tracking-[0.18em] text-[#232323]/35 mb-1.5">
          Plan sale
        </p>
        <MiniHallMap />
      </div>
    </div>
  );
}

/* ── Story scene component ─────────────────────────────────────────────── */
const SCENE_ICON = {
  list: <ClipboardList size={16} />,
  editor: <MousePointerClick size={16} />,
  chair: <Armchair size={16} />,
  pin: <MapPin size={16} />,
};

function Scene({
  n,
  icon,
  title,
  text,
  visual,
  flip,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  visual: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
      <div className={flip ? "md:order-2" : ""}>{visual}</div>
      <div className={flip ? "md:order-1" : ""}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AE343F]/8 text-[#AE343F] mb-4">
          {icon}
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">
            Korak {n}
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif text-[#232323] leading-snug mb-3">
          {title}
        </h3>
        <p className="text-[15px] sm:text-base text-[#232323]/65 leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}

const benefits = [
  {
    icon: <Users size={20} />,
    title: "Bez gužve na ulazu",
    desc: "Postavite pano na ulazu i gosti će se sami snaći — ili prosledite link hostesi koja će lako pronaći mesto svakom gostu bez haosa sa štampanim spiskovima.",
  },
  {
    icon: <Shuffle size={20} />,
    title: "Promene u zadnji čas",
    desc: "Neko je otkazao? Dolaze dodatni gosti? Promenite raspored u editoru — pano i link ostaju isti, sve se ažurira u realnom vremenu.",
  },
  {
    icon: <FileSpreadsheet size={20} />,
    title: "Excel / CSV uvoz",
    desc: "Već imate spisak u Excel-u? Učitajte fajl, naš alat ga procesuira (ime zvanice, broj gostiju, kategorija) i gosti su spremni za raspoređivanje za par sekundi.",
  },
  {
    icon: <Sparkles size={20} />,
    title: "Wow utisak",
    desc: "Ostavite profesionalan utisak koji odudara od standardnih šablona. Gosti će pričati o ovim detaljima, a vi ćete biti ponosni na nivo organizacije.",
  },
];

const useCases = [
  {
    icon: <PartyPopper size={26} />,
    title: "Svadbe i venčanja",
    desc: "Najčešća upotreba — 80–250 gostiju, mladenački sto, raspoređivanje po porodicama.",
  },
  {
    icon: <Briefcase size={26} />,
    title: "Korporativni eventi",
    desc: "Gala večere, godišnjice firme, team building — razvrstavanje po timovima i sektorima.",
  },
  {
    icon: <Building2 size={26} />,
    title: "Konferencije",
    desc: "Panel diskusije, seminari — sto za govornike, jasno definisana mesta za sve.",
  },
  {
    icon: <PartyPopper size={26} />,
    title: "Veće proslave",
    desc: "Punoletstva, jubileji, godišnjice — kad imate 50+ gostiju i hoćete red na ulazu.",
  },
];

const faqs = [
  {
    q: "Šta je raspored sedenja online i kako funkcioniše?",
    a: "Raspored sedenja online je digitalni alat koji zamenjuje papirne spiskove i haos sa Word/Excel tabelama. Vi unosite listu gostiju (ili importujete vaš spisak iz Excel/CSV tabele), iscrtate šemu sale sa stolovima koje koristite i rasporedite goste na njihova mesta. Sistem automatski generiše QR kod na jedan klik ili kompletan pano dobrodošlice za štampu — gosti na ulazu u salu skeniraju kod, ukucaju svoje ime i telefon im pokaže za koji sto su raspoređeni.",
  },
  {
    q: "Koliko košta raspored sedenja za svadbu?",
    a: "Raspored sedenja na HALO Uspomene platformi košta 2.500 RSD ako ga uzimate uz website pozivnicu, ili samostalno kao zaseban proizvod po ceni iz cenovnika ove stranice. Cena uključuje pristup alatu, neograničen broj izmena do dana događaja, generisanje QR koda i PDF panoa B1 formata spremnog za štampu.",
  },
  {
    q: "Kako da napravim raspored sedenja za 100 gostiju?",
    a: "Za 100 gostiju realno vam treba 10–14 okruglih stolova po 8–10 ljudi, plus mladenački/glavni sto. Koraci: 1) U alat uvezite listu gostiju — ime, broj osoba, kategorija. 2) Iscrtajte šemu sale prema rasporedu koji ćete imati u objektu. 3) Grupišite goste po porodicama, prijateljima i kategorijama (mladini, mladoženjini, kolege) i postavite ih na stolove. 4) Generišite QR pano za ulaz u salu.",
  },
  {
    q: "Mogu li da menjam raspored u poslednji čas ako neko otkaže?",
    a: 'Da. Sve promene koje napravite u editoru se ažuriraju u realnom vremenu — i QR kod i link "gde sedim?" ostaju isti, samo se ažurira ono što gost vidi kada skenira. Možete da menjate raspored čak i tokom samog događaja sa telefona.',
  },
  {
    q: "Da li mogu da uvezem goste iz Excel-a ili Google Sheets-a?",
    a: 'Da. Alat podržava .xlsx, .xls i .csv format. Dovoljno je da imate kolone za ime gosta, broj osoba u njegovoj grupi i opciono kategoriju (npr. "Mladini" ili "Kolege sa posla"). Alat sve automatski procesuira u listu spremnu za raspoređivanje.',
  },
  {
    q: "Šta je QR Pano dobrodošlice i kako se uklapa u raspored sedenja?",
    a: 'QR Pano dobrodošlice je elegantan grafički pano (B1 format, spreman za štampu) sa QR kodom koji vodi do personalizovane stranice "gde sedim?". Postavlja se na ulazu u salu — gost skenira telefonom, ukuca ime i odmah vidi za koji je sto raspoređen. Eliminiše gužvu na ulazu, štampane spiskove i potrebu za hostesom. Više detalja na našoj stranici QR Pano dobrodošlice.',
  },
  {
    q: "Koje oblike stolova podržava alat?",
    a: "Alat podržava okrugle stolove (klasično za svadbe i gala večere), pravougaone (za korporativne evente i konferencije) i jednostrane stolove (idealni za mladenačke ili govornički sto na konferenciji). Za svaki sto definišete broj mesta i poziciju u sali.",
  },
  {
    q: "Da li alat radi i za konferencije i korporativne evente, ne samo za svadbe?",
    a: "Da. Iako se najčešće koristi za svadbe, alat je u potpunosti prilagodljiv za konferencije, panel diskusije, gala večere, godišnjice firme, jubileje i veće privatne proslave (50+ gostiju). Gosti mogu da budu označeni kategorijama (VIP, Govornici, Studenti, Tim A/B), što olakšava raspoređivanje.",
  },
  {
    q: "Kako gosti pronalaze svoj sto na dan događaja?",
    a: 'Tri opcije: 1) Skeniraju QR kod sa panoa na ulazu u salu i pretraže svoje ime. 2) Otvore link "gde sedim?" koji ste im poslali pre događaja (npr. u sklopu pozivnice). 3) Pitaju hostesu koja koristi isti taj link na svom telefonu. Pretraga zanemaruje dijakritike (š, č, ž, ć) — gost se nalazi i ako ukuca "Petrovic" umesto "Petrović".',
  },
  {
    q: "Da li je raspored sedenja online dostupan i u Beogradu, Novom Sadu i drugim gradovima?",
    a: "Da. Alat je 100% online i radi u celoj Srbiji — Beograd, Novi Sad, Niš, Kragujevac, Subotica, Čačak i svim ostalim mestima. Nema fizičke dostave, sve se odvija digitalno. PDF pano spreman za štampu možete odštampati u bilo kojoj lokalnoj štampariji.",
  },
];

export default async function RasporedSedenjaLanding({
  searchParams,
}: {
  searchParams: Promise<{ bypass?: string }>;
}) {
  // Foreign-customer bypass link (admin-issued) — skips SMS verification.
  const bypassInfo = await resolveBypassInfo((await searchParams).bypass);
  const standalonePrice = getStandaloneSeatingPrice();
  const standaloneRegular = getStandaloneSeatingRegularPrice();
  const standalonePromoActive = isStandaloneSeatingPromoActive();
  const bundlePrice = formatPrice(pricing.pozivnica.raspored.price);

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "HALO Uspomene — Raspored sedenja online",
    description:
      'Online alat za raspoređivanje stolova i gostiju na svadbi, konferenciji, korporativnom eventu ili većoj proslavi. Editor, Excel/CSV uvoz gostiju, QR pano dobrodošlice za ulaz u salu, lično "gde sedim?" pretraga.',
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Event Planning",
    operatingSystem: "Web (browser-based)",
    url: `${siteUrl}/raspored-sedenja`,
    inLanguage: "sr-RS",
    featureList: [
      "Alat za raspored stolova",
      "Okrugli, pravougaoni i jednostrani stolovi",
      "Excel/CSV uvoz gostiju",
      "Ručno dodavanje i izmena gostiju",
      "Filtriranje po kategorijama (VIP, Govornici, kolege)",
      "QR pano dobrodošlice (PDF, B1 format)",
      'Personalizovan link "Gde sedim?" za goste',
      "Promene moguće u realnom vremenu do dana događaja",
      "Pretraga sa prepoznavanjem dijakritike",
    ],
    offers: {
      "@type": "Offer",
      price: String(standalonePrice),
      priceCurrency: "RSD",
      url: `${siteUrl}/raspored-sedenja`,
      availability: "https://schema.org/InStock",
      priceValidUntil: `${new Date().getFullYear()}-12-31`,
      seller: {
        "@type": "Organization",
        name: "HALO Uspomene",
        url: siteUrl,
      },
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
    provider: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "HALO Uspomene",
      url: siteUrl,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "20",
      bestRating: "5",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Početna",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Raspored sedenja",
        item: `${siteUrl}/raspored-sedenja`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <main>
        {/* ───────── Hero ───────── */}
        <section className="relative pt-32 pb-12 sm:pt-36 sm:pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-[#F5F4DC] to-[#faf9f6] overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#AE343F]/8 rounded-full blur-[120px] translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] -translate-x-1/3" />

          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Raspored sedenja" },
              ]}
            />

            <div className="max-w-4xl mx-auto mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#AE343F]/8 border border-[#AE343F]/20 rounded-full mb-5">
                <Armchair size={12} className="text-[#AE343F]" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#AE343F]">
                  Online alat
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] leading-tight mb-5">
                Raspored sedenja{" "}
                <span className="italic text-[#AE343F]">online</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-[#232323]/65 leading-relaxed mb-4 max-w-3xl mx-auto">
                Zaboravite na štampane spiskove i haos na ulazu u salu. Naš alat
                vam omogućava da jednostavno rasporedite goste po stolovima —
                a oni na dan svadbe skeniraju QR kod i za{" "}
                <strong className="text-[#232323]">5 sekundi</strong> znaju gde
                sede.
              </p>
              <p className="text-sm sm:text-base text-[#232323]/50 leading-relaxed mb-8 max-w-2xl mx-auto">
                Za svadbe, konferencije, korporativne evente i veće proslave.
                Excel uvoz gostiju, vizuelna šema sale, QR pano dobrodošlice.
              </p>

              <a
                href="#kako-radi"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#AE343F] hover:gap-2.5 transition-all"
              >
                Pogledajte kako sve radi — korak po korak
                <ChevronDown size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* ───────── Problem section ───────── */}
        <section className="py-16 sm:py-20 bg-[#232323] text-[#F5F4DC] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#AE343F]/15 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center max-w-5xl mx-auto">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                  Pravi problem
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-[2.6rem] font-serif leading-tight mb-5">
                  Od svečane sale ste dobili samo{" "}
                  <span className="italic text-[#d4af37]">
                    šemu poput ove
                  </span>
                </h2>
                <p className="text-base sm:text-lg text-[#F5F4DC]/70 leading-relaxed">
                  Sad treba da rasporedite 200 gostiju tako da niko ne bude
                  nezadovoljan — familije blizu, kolege zajedno, a kumovi kod
                  mladenaca. Verujte, znamo da to ume da bude pravi izazov.
                </p>
              </div>
              <div className="rounded-2xl border border-[#F5F4DC]/15 bg-[#F5F4DC]/[0.04] p-5">
                <EmptyHallSvg />
              </div>
            </div>
          </div>
        </section>

        {/* ───────── How it works — Story ───────── */}
        <section
          id="kako-radi"
          className="py-16 sm:py-24 bg-white scroll-mt-20"
        >
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Kako radi — pravi primer
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
                Od šeme sale do panoa na ulazu
              </h2>
            </div>

            <div className="max-w-5xl mx-auto space-y-16 sm:space-y-24">
              <Scene
                n="01"
                icon={SCENE_ICON.editor}
                title="Iscrtajte šemu sale i rasporedite goste"
                text="Postavite stolove prema planu koji ste dobili od objekta — okrugle, pravougaone ili mladenački sto. Zatim jednostavno prevucite goste na njihova mesta. Sistem vam pokazuje koliko je mesta zauzeto na svakom stolu."
                visual={
                  <BrowserFrame>
                    <FilledHallSvg />
                  </BrowserFrame>
                }
              />
              <Scene
                n="02"
                icon={SCENE_ICON.chair}
                title="Generišite QR pano za ulaz u salu"
                flip
                text="Jednim klikom preuzmite elegantan B1 pano sa QR kodom — spreman za štampu u bilo kojoj štampariji. Postavite ga na ulaz i gosti će se sami snaći bez gužve i štampanih spiskova."
                visual={
                  <div className="bg-gradient-to-br from-[#faf9f6] to-[#F5F4DC] rounded-2xl p-8 border border-stone-200 text-center">
                    <QrCode
                      size={120}
                      strokeWidth={1}
                      className="mx-auto text-[#232323]/80 mb-4"
                    />
                    <p className="text-sm font-medium text-[#232323]/60">
                      B1 Pano (700×1000mm)
                    </p>
                    <p className="text-xs text-[#232323]/40">
                      PDF spreman za štampu
                    </p>
                  </div>
                }
              />
              <Scene
                n="03"
                icon={SCENE_ICON.pin}
                title="Gost skenira i odmah zna svoj sto"
                text="Gost na ulazu skenira QR kod sa telefona, ukuca svoje ime — i za 5 sekundi vidi broj svog stola zajedno sa mapom sale. Bez čekanja, bez pitanja, bez haosa."
                visual={
                  <IPhoneFrame>
                    <SeatResultMock />
                  </IPhoneFrame>
                }
              />
            </div>
          </div>
        </section>

        {/* ───────── Use cases ───────── */}
        <section className="py-16 sm:py-20 bg-[#F5F4DC]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Za koga je ovo
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
                Tipovi događaja
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {useCases.map((u) => (
                <div
                  key={u.title}
                  className="bg-white rounded-2xl p-7 border border-stone-200 text-center"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mb-5">
                    {u.icon}
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#232323] mb-2">
                    {u.title}
                  </h3>
                  <p className="text-sm text-[#232323]/65 leading-relaxed">
                    {u.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Benefits ───────── */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Zašto ne štampani spiskovi
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
                Prednosti digitalnog rasporeda
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="flex items-start gap-4 bg-[#faf9f6] rounded-2xl p-6 border border-stone-200"
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

        {/* ───────── QR Pano bonus — šlag na tortu ───────── */}
        <section className="py-16 sm:py-20 bg-[#F5F4DC]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-10 md:p-12 border border-stone-200 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center shrink-0">
                  <QrCode size={36} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-3">
                    Šlag na tortu
                  </p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#232323] leading-tight mb-4">
                    QR Pano dobrodošlice —{" "}
                    <span className="italic text-[#AE343F]">
                      uključen u cenu
                    </span>
                  </h2>
                  <p className="text-base text-[#232323]/70 leading-relaxed mb-5">
                    Uz alat za raspored dobijate i elegantan{" "}
                    <Link
                      href="/qr-pano-dobrodoslice"
                      className="text-[#AE343F] font-medium underline decoration-[#AE343F]/30 underline-offset-2 hover:decoration-[#AE343F]"
                    >
                      QR pano dobrodošlice
                    </Link>{" "}
                    — B1 format spreman za štampu, koji postavljate na ulaz u
                    salu. Gosti skeniraju kod i za 5 sekundi znaju gde sede.
                    Bez gužve, bez štampanih spiskova, bez hostese sa papirima.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    {[
                      "B1 pano (700×1000mm) spreman za štampu",
                      "QR kod u visokoj rezoluciji",
                      'Personalizovan link "Gde sedim?" za goste',
                      "Mapa sale sa označenim stolom gosta",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-2 text-sm text-[#232323]/80"
                      >
                        <Check
                          size={15}
                          className="text-[#AE343F] shrink-0 mt-0.5"
                          strokeWidth={2.5}
                        />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Why us vs free tools ───────── */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-[#F5F4DC]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Zašto baš mi
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
                &bdquo;Besplatno&ldquo; ima sitna slova
              </h2>
              <p className="text-base text-[#232323]/65 leading-relaxed mt-4">
                Drugi vam poklone 5 stolova i šezdesetak gostiju — a onda, kad
                vam zatreba cela svadba, naplate paket po paket. Kod nas je{" "}
                <strong className="text-[#232323]">jedna cena</strong>, bez
                ograničenja i bez skrivenih nivoa.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {/* Them */}
              <div className="rounded-2xl p-7 border border-stone-200 bg-white">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#232323]/40 mb-5">
                  Drugi alati
                </p>
                <ul className="space-y-3">
                  {[
                    "Do 5 stolova i 50 gostiju",
                    "Cela svadba zahteva dodatne doplate",
                    "Nema dizajn za pano dobrodošlice",
                    "Ne postoji ni PDF izvoz",
                    'Bez stranice "Gde sedim?"!',
                    "Bez podrške — snalazite se sami",
                  ].map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-2.5 text-sm text-[#232323]/55"
                    >
                      <X
                        size={16}
                        className="text-stone-400 shrink-0 mt-0.5"
                        strokeWidth={2.5}
                      />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Us */}
              <div className="rounded-2xl p-7 border-2 border-[#AE343F]/30 bg-white shadow-lg shadow-[#AE343F]/5">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#AE343F] mb-5">
                  HALO Uspomene
                </p>
                <ul className="space-y-3">
                  {[
                    <>Neograničen broj stolova i gostiju — jedna cena</>,
                    <>
                      Gratis{" "}
                      <Link
                        href="/qr-pano-dobrodoslice"
                        className="text-[#AE343F] font-semibold underline decoration-[#AE343F]/30 underline-offset-2 hover:decoration-[#AE343F]"
                      >
                        QR pano dobrodošlice
                      </Link>{" "}
                      za ulaz u salu
                    </>,
                    <>
                      Stranica &bdquo;Gde sedim?&ldquo; — gost skenira, ukuca ime i za pet
                      sekundi zna svoj sto
                      <GdeSedimInfoButton />
                    </>,
                    <>Šema sale sa vizuelnim rasporedom stolova</>,
                    <>
                      Meni za hranu i piće ako želite da ga dodate — bez doplate
                    </>,
                    <>Izmene do poslednjeg trenutka — pano i link ostaju isti</>,
                  ].map((t, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-[#232323]/80"
                    >
                      <Check
                        size={16}
                        className="text-[#AE343F] shrink-0 mt-0.5"
                        strokeWidth={2.5}
                      />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── What you get + price ───────── */}
        <section className="py-16 sm:py-20 bg-[#F5F4DC]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-10 md:p-12 border border-stone-200">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#232323] text-center mb-8">
                Šta tačno dobijate
              </h2>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-8">
                {[
                  "Jednostavan alat za raspoređivanje stolova prema sali",
                  "Okrugli, pravougaoni i jednostrani stolovi",
                  "Excel / CSV uvoz gostiju (ime, broj, kategorija)",
                  "Ručno dodavanje, izmena i brisanje gostiju",
                  "Filtriranje po kategorijama (npr. VIP, Govornici, Studenti)",
                  'Personalizovan link "Gde sedim?" za goste',
                  "QR kod (visoka rezolucija za štampu)",
                  "QR pano u B1 formatu spreman za štampu (PDF format)",
                  "Mapa sale sa vizuelnim rasporedom stolova",
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

              <div className="text-center pt-6 border-t border-stone-200">
                {standalonePromoActive && (
                  <span className="inline-block mb-3 px-3 py-1 rounded-full bg-[#AE343F]/10 text-[#AE343F] text-[10px] font-bold uppercase tracking-[0.2em]">
                    Julska akcija
                  </span>
                )}
                <div className="flex items-baseline justify-center gap-3 mb-2">
                  {standalonePromoActive && (
                    <span className="text-xl sm:text-2xl font-serif text-stone-400 line-through">
                      {formatPrice(standaloneRegular)}
                    </span>
                  )}
                  <p className="text-4xl sm:text-5xl font-serif text-[#AE343F]">
                    {formatPrice(standalonePrice)}
                  </p>
                </div>
                <p className="text-sm text-[#232323]/50 mb-6">
                  ili samo{" "}
                  <span className="font-bold text-[#232323]">{bundlePrice}</span>{" "}
                  uz website pozivnicu
                </p>
                <div className="flex flex-col items-center gap-3">
                  <a
                    href="#kontakt-raspored"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-xl shadow-[#AE343F]/20"
                  >
                    Kupi odmah
                    <ArrowRight size={16} />
                  </a>
                  <a
                    href="#kontakt-raspored"
                    className="text-sm text-[#232323]/60 hover:text-[#AE343F] transition-colors"
                  >
                    Imam pitanje — pošalji upit
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── RSVP QR bonus ───────── */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#faf9f6] to-[#F5F4DC] rounded-3xl p-8 sm:p-10 md:p-12 border border-stone-200">
              <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center shrink-0">
                  <Smartphone size={36} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-3">
                    Dodatni bonus
                  </p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#232323] leading-tight mb-4">
                    Gosti potvrđuju sami —{" "}
                    <span className="italic text-[#AE343F]">
                      ne unosite ručno
                    </span>
                  </h2>
                  <p className="text-base text-[#232323]/70 leading-relaxed mb-5">
                    Uz alat dobijate i poseban QR kod do stranice za online
                    potvrdu dolaska. Zalepite ga na štampane pozivnice — gosti
                    skeniraju, ukucaju ime i broj osoba, i automatski ulaze u
                    Vašu listu gostiju spremni za raspoređivanje.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    {[
                      "Minimalna stranica — samo ime + broj osoba",
                      "Potvrde direktno upadaju u Vašu listu gostiju",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-2 text-sm text-[#232323]/80"
                      >
                        <Check
                          size={15}
                          className="text-[#AE343F] shrink-0 mt-0.5"
                          strokeWidth={2.5}
                        />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── FAQ ───────── */}
        <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-t from-[#faf9f6] to-[#AE343F]/10 border-t-4 border-b-4 border-[#AE343F]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#AE343F]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <div className="text-center mb-12 sm:mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Česta pitanja
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
                Sve o rasporedu sedenja online
              </h2>
              <p className="text-lg text-[#232323]/50 max-w-2xl mx-auto">
                Odgovori na najčešća pitanja o alatu, ceni, QR Panou,
                raspoređivanju gostiju i razlikama u odnosu na štampane
                spiskove.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="collapse collapse-arrow bg-[#faf9f6] rounded-2xl border border-stone-200"
                >
                  <input type="checkbox" />
                  <div className="collapse-title text-base sm:text-lg font-medium text-[#232323] pr-12">
                    {faq.q}
                  </div>
                  <div className="collapse-content">
                    <p className="text-[#232323]/60 leading-relaxed pt-2">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Contact form ───────── */}
        <section
          id="kontakt-raspored"
          className="py-16 sm:py-20 md:py-24 bg-[#232323] text-[#F5F4DC] relative overflow-hidden scroll-mt-20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#AE343F]/15 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#AE343F]/8 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10 sm:mb-12">
                <Armchair size={28} className="mx-auto mb-5 text-[#AE343F]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-3">
                  Kontakt
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4">
                  Spremni da organizujete?
                </h2>
                <p className="text-base sm:text-lg text-[#F5F4DC]/65 leading-relaxed">
                  Unesite podatke o događaju i aktivirajte alat odmah
                </p>
              </div>

              <RasporedKontaktForm bypassInfo={bypassInfo} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
