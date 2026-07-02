import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  QrCode,
  Check,
  ArrowRight,
  Sparkles,
  Users,
  Shuffle,
  Smartphone,
  ScanLine,
  MapPin,
  ClipboardList,
  ChevronDown,
  Armchair,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { formatPrice, pricing } from "@/data/pricing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title:
    "QR Pano Dobrodošlice — Pametan Raspored Sedenja za Svadbu | HALO Uspomene",
  description:
    "QR Pano dobrodošlice za venčanje, svadbu ili drugi događaj — gosti skeniraju QR kod na ulazu u salu, ukucaju ime i telefon ih vodi do njihovog stola. Alat za raspored sedenja, B1 pano spreman za štampu. Bez gužve, bez spiskova, bez hostese.",
  keywords: [
    "qr pano dobrodošlice",
    "qr pano za venčanje",
    "qr pano za svadbu",
    "qr pano za salu",
    "raspored sedenja",
    "raspored sedenja za svadbu",
    "raspored sedenja za venčanje",
    "raspored sedenja online",
    "digitalni raspored sedenja",
    "raspored stolova svadba",
    "QR kod za sedenje",
    "pametno sedenje venčanje",
    "vizuelni raspored stolova",
    "gde sedim svadba",
    "pano za salu",
    "pano dobrodošlice za štampu",
    "ulaz u salu venčanje",
    "moderna svadba srbija",
    "qr pano cena",
    "kako napraviti qr pano",
  ],
  openGraph: {
    title: "QR Pano Dobrodošlice — Pametan raspored sedenja | HALO Uspomene",
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
      "Pametan raspored sedenja — alat za upravljanje rasporedom i QR pano za ulaz u salu.",
  },
  alternates: {
    canonical: `${siteUrl}/qr-pano-dobrodoslice`,
  },
};

/* ─────────────────────────────────────────────────────────────
   SHOWCASE — sve vizuale crtamo sami (SVG + CSS), bez screenshota.
   ───────────────────────────────────────────────────────────── */

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

/** Realističan iPhone mockup (Dynamic Island + bočni tasteri). */
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

function RsvpMock() {
  return (
    <div>
      <p className="font-serif text-lg text-[#232323] mb-4 text-center">
        Potvrda dolaska
      </p>
      <div className="flex gap-2 mb-3">
        <div className="flex-1 rounded-xl bg-[#AE343F] text-[#F5F4DC] text-center text-sm py-2 font-medium">
          Dolazim
        </div>
        <div className="flex-1 rounded-xl border border-stone-200 text-[#232323]/45 text-center text-sm py-2">
          Ne mogu
        </div>
      </div>
      <div className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-[#232323]/70 mb-2 flex items-center justify-between">
        <span>Broj osoba</span>
        <span className="font-semibold tabular-nums">3</span>
      </div>
      <div className="rounded-xl border border-stone-200 px-3 py-2 text-[12.5px] text-[#232323]/60 mb-3 leading-snug">
        Dolazimo supruga, ja i ćerka Mila
      </div>
      <div className="rounded-full bg-[#AE343F] text-[#F5F4DC] text-center text-sm py-2.5 font-medium">
        Potvrdite dolazak
      </div>
    </div>
  );
}

/** Prazna šema sale — okrugli stolovi sa strane, mladenački sto, podijum i ulazna vrata. */
function EmptyHallSvg() {
  // Dve kolone levo + dve desno (centar je slobodan za mladenački sto i podijum).
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

      {/* Mladenački sto (pravougaoni, centar–vrh) */}
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

      {/* Podijum za igru (osenčen kvadrat, centar) */}
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

      {/* Arhitektonska oznaka ulaza — dupla (dvokrilna) vrata */}
      <g stroke="#d4af37" strokeWidth={2} fill="none" strokeLinecap="round">
        {/* zidovi sa obe strane otvora */}
        <line x1="195" y1="312" x2="250" y2="312" />
        <line x1="320" y1="312" x2="375" y2="312" />
        {/* levo krilo */}
        <line x1="250" y1="312" x2="250" y2="277" />
        <path d="M250 277 A 35 35 0 0 1 285 312" strokeDasharray="3 5" />
        {/* desno krilo */}
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

/** Popunjena šema sale — 8 mesta po stolu, većina zauzeta. */
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

/** Realan „Gde sedim?" rezultat — kada gost pronađe svoje mesto. */
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

/* ── Story scenes ─────────────────────────────────────────────── */
const SCENE_ICON = {
  list: <ClipboardList size={16} />,
  qr: <QrCode size={16} />,
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
    title: "Nema gužve na ulazu",
    desc: "Gosti se sami snalaze — bez hostese sa štampanim spiskom i bez zastoja na vratima sale.",
  },
  {
    icon: <Shuffle size={20} />,
    title: "Promene do poslednjeg dana",
    desc: "Neko otkaže ili dovede još nekog? Izmenite raspored u editoru — pano i link ostaju isti.",
  },
  {
    icon: <Smartphone size={20} />,
    title: "Bez aplikacije",
    desc: "Gost skenira kamerom telefona. Radi besprekorno na svakom Android i iPhone uređaju.",
  },
  {
    icon: <ScanLine size={20} />,
    title: "Wow utisak",
    desc: "Moderan detalj koji gosti pamte i prepričavaju — nivo organizacije koji se primeti.",
  },
];

const faqs = [
  {
    q: "Šta je QR pano dobrodošlice na venčanju?",
    a: "QR Pano dobrodošlice je elegantan grafički pano, najčešće u B1 formatu (700x1000mm), koji se postavlja na ulazu u salu na dan venčanja. Sadrži imena para, dobrodošlicu i QR kod koji vodi do stranice za pretragu mesta sedenja. Gost skenira kamerom kod, ukuca svoje ime i odmah vidi za koji je sto raspoređen — bez haosa oko štampanih spiskova.",
  },
  {
    q: "Kako napraviti QR pano za svadbu?",
    a: "Prvo dobijete pristup alatu — bilo da uzmete raspored sedenja uz našu website pozivnicu, ili se prijavite samo za korišćenje alata (link u podnožju ove stranice). Zatim u tri koraka: 1) Napravite raspored sedenja u alatu — uvezete listu gostiju iz Excel-a, iscrtate šemu sale sa stolovima i rasporedite goste. 2) Jednim klikom generišete PDF panoa u visokoj rezoluciji, spreman za štampu. 3) Odštampate u bilo kojoj štampariji (B1 format, mat ili sjajni papir) i postavite na ulaz u salu pre dolaska gostiju.",
  },
  {
    q: "Koliko košta QR pano dobrodošlice?",
    a: "QR pano je deo paketa „raspored sedenja” — košta 2.500 RSD uz website pozivnicu, ili još povoljnije u kombinaciji sa premium pozivnicom. Cena uključuje pristup alatu za pravljenje rasporeda, generisanje PDF panoa, QR koda i personalizovan link „gde sedim?” za goste. Sama štampa kod štamparije nije uračunata (obično 1.000–2.500 RSD za B1 format u Srbiji).",
  },
  {
    q: "Mogu li gosti da pronađu svoj sto bez QR panoa?",
    a: "Da. Možete im poslati direktan link „gde sedim?” pre venčanja (uz pozivnicu, SMS-om ili u WhatsApp grupi), ili tradicionalno postaviti domaćina/hostesu na ulazu sa tabletom ili telefonom — umesto haosa sa papirima i spiskovima, jednostavno otvore isti taj link i pronađu mesto svakom gostu za par sekundi.",
  },
  {
    q: "Da li QR pano radi i bez interneta?",
    a: "Sam QR kod se skenira bez interneta — kamera telefona prepoznaje kod u sekundi. Ali da bi gost video za koji je sto raspoređen, potrebna mu je internet konekcija (mobilni podaci ili Wi-Fi sale). Naša „gde sedim?” stranica je optimizovana za brzo učitavanje (manje od 500 KB) i radi i na slabom signalu.",
  },
  {
    q: "U kom formatu se štampa QR pano?",
    a: "Generišemo PDF u B1 formatu (700x1000 mm), što je najčešći format panoa na venčanjima. Možete štampati i u manjim formatima (B2 ili A0) — PDF je vektorski tako da nema gubitka kvaliteta. Preporučujemo mat papir 250+ gsm sa kaširanjem na karton peni ili pleksiglasu za stabilnost na štafelaju.",
  },
  {
    q: "Mogu li da menjam raspored ako neko otkaže dan-dva pre venčanja?",
    a: "Da. Editor je dostupan do samog dana venčanja — bilo kakvu promenu napravite i sačuvajte, link i QR kod ostaju isti, samo se ažurira ono što gost vidi kad skenira. Možete ažurirati raspored čak i tokom samog događaja, sa telefona, ukoliko bude potrebno.",
  },
  {
    q: "Da li pretraga prepoznaje srpske dijakritike (š, č, ž, ć)?",
    a: "Da. Pretraga gostiju zanemaruje dijakritike — ako se gost preziva „Petrović”, može da ukuca „Petrovic” i naći će se u listi. Isto važi za sva slova sa kvačicama (š, č, ž, ć) i njihove latinične varijante.",
  },
  {
    q: "Da li dobijam i QR kod za potvrdu dolaska (RSVP)?",
    a: "Da, uz QR pano za sedenje dobijate i drugi QR kod koji vodi na stranicu za online potvrdu dolaska. Možete ga štampati na klasičnim koverat-pozivnicama — gost skenira, ukuca ime i potvrdi dolazak, a potvrda automatski upada u vašu listu gostiju.",
  },
];

export default function QRPanoLandingPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "QR Pano Dobrodošlice — Pametan raspored sedenja",
    description:
      "Elegantan QR pano za ulaz u salu — gosti skeniraju kod, ukucaju ime i telefon ih vodi do njihovog stola. Uz alat za raspored sedenja i personalizovan link „gde sedim?”. Format B1, spreman za štampu.",
    image: `${siteUrl}/images/pano.webp`,
    brand: { "@type": "Brand", name: "HALO Uspomene" },
    category: "Wedding Stationery / Event Signage",
    url: `${siteUrl}/qr-pano-dobrodoslice`,
    offers: {
      "@type": "Offer",
      price: String(pricing.pozivnica.raspored.price),
      priceCurrency: "RSD",
      url: `${siteUrl}/qr-pano-dobrodoslice`,
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
      { "@type": "ListItem", position: 1, name: "Početna", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "QR Pano dobrodošlice",
        item: `${siteUrl}/qr-pano-dobrodoslice`,
      },
    ],
  };

  const rasporedPrice = formatPrice(pricing.pozivnica.raspored.price);
  const standalonePrice = formatPrice(pricing.standalone_seating.price);
  const priceSave = formatPrice(
    pricing.standalone_seating.price - pricing.pozivnica.raspored.price,
  );

  return (
    <>
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
                { label: "QR Pano dobrodošlice" },
              ]}
            />

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto mt-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#AE343F]/8 border border-[#AE343F]/20 rounded-full mb-5">
                  <Sparkles size={12} className="text-[#AE343F]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#AE343F]">
                    Najtraženije za salu
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] leading-tight mb-5">
                  QR Pano{" "}
                  <span className="italic text-[#AE343F]">dobrodošlice</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-[#232323]/65 leading-relaxed mb-8">
                  Gost skenira kod na ulazu, ukuca svoje ime — i za dve sekunde
                  zna za kojim stolom sedi. Bez gužve, bez štampanih spiskova,
                  bez hostese sa papirima.
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
                    Pogledajte cene
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <p className="mt-6 text-sm text-[#232323]/50">
                  Raspored sedenja + QR pano:{" "}
                  <span className="font-bold text-[#AE343F]">
                    {rasporedPrice}
                  </span>{" "}
                  uz pozivnicu — još povoljnije uz Premium. Dostupno i
                  samostalno, bez pozivnice.
                </p>

                <a
                  href="#kako-radi"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#AE343F] hover:gap-2.5 transition-all"
                >
                  Pogledajte kako sve radi — korak po korak
                  <ChevronDown size={16} />
                </a>
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

        {/* ───────── Problem (Scena 1) ───────── */}
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
                  <span className="italic text-[#d4af37]">šemu poput ove</span>
                </h2>
                <p className="text-base sm:text-lg text-[#F5F4DC]/70 leading-relaxed">
                  Sad treba da rasporedite 200 gostiju. Verujte, znamo da to ume
                  da bude pravi izazov — zato smo i napravili ovo rešenje za
                  vas!
                </p>
              </div>
              <div className="rounded-2xl border border-[#F5F4DC]/15 bg-[#F5F4DC]/[0.04] p-5">
                <EmptyHallSvg />
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Story (Scene 2–5) ───────── */}
        <section id="kako-radi" className="py-16 sm:py-24 bg-white scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Kako radi — pravi primer
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
                Od liste zvanica do panoa na ulazu
              </h2>
            </div>

            <div className="max-w-5xl mx-auto space-y-16 sm:space-y-24">
              <Scene
                n="01"
                icon={SCENE_ICON.list}
                title="Napravite listu zvanica i grupišite goste"
                text="Sve goste stavite na ovaj digitalni spisak i imajte jasan pregled — koga ste pozvali, koga još niste, ko je potvrdio dolazak, a ko otkazao."
                visual={
                  <BrowserFrame>
                    <GuestListMock />
                  </BrowserFrame>
                }
              />
              <Scene
                n="02"
                icon={SCENE_ICON.qr}
                title="Gosti potvrđuju dolazak"
                flip
                text="Dodajte QR kod na štampane pozivnice koji vaše goste vodi na jednostavnu formu za potvrdu — nakon par klikova odgovor je vidljiv na vašem portalu. Bez poziva, bez poruka i ručnog prepisivanja. A ako vas neko ipak pozove, brzo i lako ga sami dodate u listu potvrda."
                visual={
                  <IPhoneFrame>
                    <RsvpMock />
                  </IPhoneFrame>
                }
              />
              <Scene
                n="03"
                icon={SCENE_ICON.chair}
                title="Napravite virtuelnu šemu sale"
                text="Postavite raspored stolova prema šemi sale i jednostavno rasporedite goste na njihova mesta. Ukoliko neko otkaže ili izmeni pratnju, izmenu napravite za par sekundi — a QR kod za pano dobrodošlice ostaje isti."
                visual={
                  <BrowserFrame>
                    <FilledHallSvg />
                  </BrowserFrame>
                }
              />
              <Scene
                n="04"
                icon={SCENE_ICON.pin}
                title="Pano dobrodošlice sa QR kodom"
                flip
                text="Nakon što rasporedite goste, preuzmite dizajn svog QR panoa dobrodošlice i postavite ga na ulazu u salu. Gost skenira kod, ukuca svoje ime i vidi broj svog stola — ali i šemu sale sa označenim stolom, kako bi se lakše snašao."
                visual={
                  <IPhoneFrame>
                    <SeatResultMock />
                  </IPhoneFrame>
                }
              />
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

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-9">
                {[
                  "Alat za crtanje šeme sale i raspoređivanje gostiju",
                  "Okrugli, pravougaoni, mladenački i jednostrani stolovi",
                  "Excel / CSV uvoz gostiju (ime, broj osoba, kategorija)",
                  "QR kod za pano u visokoj rezoluciji za štampu",
                  "PDF pano u B1 formatu, spreman za štampariju",
                  'Personalizovan link „Gde sedim?" za svakog gosta',
                  "Pretraga po imenu (prepoznaje š, č, ž, ć)",
                  "Promene moguće do samog dana venčanja",
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
                <div className="flex items-baseline justify-center gap-2 mb-1">
                  <span className="text-sm text-[#232323]/50">
                    Uz website pozivnicu
                  </span>
                  <span className="text-4xl sm:text-5xl font-serif text-[#AE343F]">
                    {rasporedPrice}
                  </span>
                </div>
                <p className="text-sm text-[#232323]/55 mb-6">
                  Cena alata za raspored sedenja bez pozivnice{" "}
                  <span className="font-bold text-[#232323]">
                    {standalonePrice}
                  </span>{" "}
                  (ušteda {priceSave})
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/napravi-pozivnicu"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-xl shadow-[#AE343F]/20"
                  >
                    Napravite pozivnicu sa rasporedom
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/cene"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#232323]/15 hover:border-[#232323] text-[#232323] text-sm uppercase tracking-widest font-medium rounded-full transition-colors"
                  >
                    Sve cene
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Benefits ───────── */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Zašto baš ovako
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
                Bolje od štampanog spiska
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

        {/* ───────── RSVP QR bonus ───────── */}
        <section className="py-16 sm:py-20 bg-[#F5F4DC]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-10 md:p-12 border border-stone-200 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center shrink-0">
                  <QrCode size={36} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-3">
                    Bonus uz QR pano
                  </p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#232323] leading-tight mb-4">
                    Drugi QR kod —{" "}
                    <span className="italic text-[#AE343F]">
                      za potvrde dolaska
                    </span>
                  </h2>
                  <p className="text-base text-[#232323]/70 leading-relaxed mb-5">
                    Pored QR panoa za sedenje, dobijate i poseban QR kod do
                    stranice za online potvrdu dolaska. Zalepite ga na štampane
                    pozivnice — gosti skeniraju, ukucaju ime i potvrđuju dolazak
                    online. Manje SMS-ova vama, manje papira, brže potvrde.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    {[
                      "QR vodi na stranicu samo za potvrdu dolaska",
                      "Automatski usklađen sa stilom vaše pozivnice",
                      "Sve potvrde se slivaju u Moje Venčanje portal",
                      "Idealno za goste koji vole papirne pozivnice",
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
                Sve o QR Panou dobrodošlice
              </h2>
              <p className="text-lg text-[#232323]/50 max-w-2xl mx-auto">
                Odgovori na najčešća pitanja o panou, ceni, štampi i tome kako
                gosti pronalaze svoj sto u sali.
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

        {/* ───────── Final CTA ───────── */}
        <section className="py-16 sm:py-20 md:py-24 bg-[#232323] text-[#F5F4DC] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#AE343F]/12 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
            <Armchair size={28} className="mx-auto mb-5 text-[#AE343F]" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4">
              Neka raspored bude najlakši deo
            </h2>
            <p className="text-base sm:text-lg text-[#F5F4DC]/65 leading-relaxed mb-8">
              Uzmite QR pano uz pozivnicu i pustite goste da se sami snađu na
              ulazu — vi samo uživajte u svom danu.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/napravi-pozivnicu"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-xl shadow-[#AE343F]/20"
              >
                Uzmite uz pozivnicu
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/cene"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#F5F4DC]/25 hover:border-[#F5F4DC] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-colors"
              >
                Pogledajte cene
              </Link>
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
            kartica, gosti skeniraju QR kod na panou postavljenom na ulazu u
            salu, ukucaju svoje ime, i telefon ih vodi pravo do njihovog stola.
            Sistem radi u svim gradovima Srbije: Beograd, Novi Sad, Niš,
            Kragujevac, Subotica, Čačak. Kompatibilno sa svim modernim Android i
            iPhone uređajima — bez instalacije aplikacije.
          </p>
          <p>
            Alat za raspored stolova omogućava jednostavno pomeranje gostiju,
            dodavanje novih stolova različitih oblika (okrugli, pravougaoni,
            mladenački sto) i promene do poslednjeg trenutka. Cena rasporeda
            sedenja: 2.500 din uz pozivnicu, ili 8.500 din za kompletni paket
            (pozivnica + raspored + digitalna audio knjiga). Pogledajte{" "}
            <Link href="/cene">cene HALO Uspomene</Link> ili{" "}
            <Link href="/napravi-pozivnicu">
              napravite pozivnicu sa rasporedom
            </Link>
            .
          </p>
        </section>

        {/* Bottom note: standalone seating access */}
        <section className="py-10 sm:py-12 bg-white border-t border-stone-200">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm sm:text-base text-[#232323]/60 leading-relaxed max-w-2xl mx-auto">
              Organizujete event ili ne želite website pozivnicu? Alat za
              raspored sedenja i QR pano možete uzeti i samostalno —{" "}
              <Link
                href="/raspored-sedenja#kontakt-raspored"
                className="text-[#AE343F] font-medium hover:underline underline-offset-4"
              >
                prijavite se ovde
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
