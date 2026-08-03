import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Car,
  Camera,
  Sparkles,
  Clock,
  ShieldCheck,
  UserCheck,
  Heart,
  Flag,
  Users,
  MapPin,
  Palette,
  Gem,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import VehicleRentalLeadForm from "@/components/forms/VehicleRentalLeadForm";
import {
  oldtimerFleet,
  fleetCities,
  getFleetByCity,
  getFleetPriceRange,
  getVehicleOptions,
  vehicleCountLabel,
} from "@/data/oldtajmeri";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";
const pageUrl = `${siteUrl}/iznajmljivanje-oldtajmera-za-vencanje`;

const { low: priceLow, high: priceHigh } = getFleetPriceRange();

/** Ponuda grupisana po gradu polaska — koristi je i flota i cenovnik. */
const fleetByCity = getFleetByCity();

/** Koliko vozila polazi iz datog grada — da se brojevi u tekstu ne pišu rukom. */
const countFrom = (city: string) =>
  oldtimerFleet.filter((v) => v.basedIn === city).length;

/** Jedinstveni nazivi modela — koristi se u skrivenom SEO pasusu. */
const modelNames = Array.from(
  new Set(
    oldtimerFleet.map((v) => (v.year ? `${v.name} (${v.year})` : v.name)),
  ),
);

export const metadata: Metadata = {
  title: "Iznajmljivanje Oldtajmera za Venčanje — Cene i Flota",
  description: `Oldtajmer za venčanje sa vozačem — retro automobili za mladence, svadbenu kolonu i fotografisanje. Cene od ${priceLow} EUR, Beograd, Pancevo i cela Srbija.`,
  keywords: [
    "iznajmljivanje oldtajmera za venčanje",
    "iznajmljivanje oldtajmera",
    "oldtajmer za svadbu",
    "oldtajmer za venčanje",
    "oldtimer za venčanje",
    "oldtimer za svadbu",
    "retro auto za svadbu",
    "retro automobil za venčanje",
    "stari automobili za venčanje",
    "klasični automobili za venčanje",
    "vintage auto za venčanje",
    "oldtajmer cena",
    "cena iznajmljivanja oldtajmera",
    "oldtajmer za mladence",
    "oldtajmer za fotografisanje",
    "oldtajmer za slikanje",
    "fiat 1300 za svadbu",
    "tristać za svadbu",
    "citroen traction avant za venčanje",
    "predratni automobil za svadbu",
    "kabriolet za venčanje",
    "iznajmljivanje oldtajmera Beograd",
    "oldtajmer za svadbu Beograd",
    "oldtajmer za svadbu Pančevo",
    "oldtajmer za svadbu Novi Sad",
    "auto za mladence",
    "svadbena kolona",
  ],
  openGraph: {
    title: "Iznajmljivanje Oldtajmera za Venčanje | HALO Uspomene",
    description:
      "Retro automobili sa vozačem za mladence — od klasika šezdesetih do predratnih kabrioleta. Cene, dostupnost i uslovi na jednom mestu.",
    type: "website",
    url: pageUrl,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Iznajmljivanje Oldtajmera za Venčanje | HALO Uspomene",
    description:
      "Oldtajmer sa vozačem za mladence — retro automobili koji se pamte na fotografijama.",
  },
  alternates: {
    canonical: pageUrl,
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SADRŽAJ
═══════════════════════════════════════════════════════════════════════════ */

const included = [
  {
    icon: <UserCheck size={24} />,
    title: "Vozač uz vozilo",
    desc: "Oldtajmeri se iznajmljuju isključivo sa vozačem koji poznaje vozilo. Vi se vozite i uživate, o svemu ostalom se brine on.",
  },
  {
    icon: <Sparkles size={24} />,
    title: "Pripremljeno za fotografije",
    desc: "Vozilo stiže očišćeno i ispolirano, spremno za kadrove ispred crkve, opštine i sale.",
  },
  {
    icon: <Clock size={24} />,
    title: "Maršuta dogovorena unapred",
    desc: "Satnica i ruta se planiraju pre dana venčanja, da ne bude nagađanja i kašnjenja.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Vozila koja se čuvaju",
    desc: "Sva vozila su u rukama kolekcionara koji ih redovno održavaju i voze pažljivo — to nisu obična rent-a-car auta.",
  },
];

const whyOldtimer = [
  {
    icon: <Camera size={26} />,
    title: "Fotografije koje ne liče ni na čije",
    desc: "Moderni automobili na fotografijama izgledaju slično. Retro linija, hrom i stari lak daju kadru karakter koji nijedan filter ne može da doda — a te slike gledate ceo život.",
  },
  {
    icon: <Heart size={26} />,
    title: "Emocija koju gosti prepoznaju",
    desc: "Retro auto ne izaziva samo divljenje nego i sećanje. Stariji gosti prepoznaju automobil iz svoje mladosti, mlađi ga vide prvi put uživo — i jedni i drugi mu priđu.",
  },
  {
    icon: <Gem size={26} />,
    title: "Drugačija vrsta luksuza",
    desc: "Luksuz oldtajmera nije u opremi nego u retkosti. Ovakva vozila se ne kupuju — čuvaju se decenijama, i to se vidi na svakom detalju.",
  },
  {
    icon: <Users size={26} />,
    title: "Auto koji se pamti",
    desc: "Gosti retko pamte kojim je autom neko došao. Kada ispred sale stane vozilo staro devedeset godina, o njemu se priča i posle svadbe.",
  },
  {
    icon: <Palette size={26} />,
    title: "Uklapa se u vintage i rustik stil",
    desc: "Ako venčanje ima retro, boho ili rustik notu — od pozivnica do dekoracije — moderna limuzina ispada iz priče, a oldtajmer je zaokružuje.",
  },
  {
    icon: <Flag size={26} />,
    title: "Idealan za čelo kolone",
    desc: "Svadbena kolona sa barjaktarom je naša tradicija. Retro auto na čelu kolone je detalj zbog kojeg se ljudi okreću na ulici.",
  },
];

const weddingDay = [
  {
    n: "01",
    title: "Polazak od kuće mlade",
    desc: "Vozilo stiže pred dogovoreno vreme, dok traju pripreme — taman da fotograf uhvati prve kadrove sa autom pre polaska.",
  },
  {
    n: "02",
    title: "Opština i crkva",
    desc: "Dolazak i odlazak sa ceremonije je trenutak kada gosti prvi put vide vozilo. Vozač parkira tako da auto bude u kadru, a ne u gužvi.",
  },
  {
    n: "03",
    title: "Fotografisanje",
    desc: "Najvredniji deo termina. Lokaciju za slikanje dogovorite sa fotografom unapred — kod retro vozila i najobičnija ulica izgleda kao set.",
  },
  {
    n: "04",
    title: "Dolazak u salu",
    desc: "Ulazak mladenaca ispred sale, uz kolonu i barjaktara. Ovde oldtajmer ostavlja najjači utisak na goste koji čekaju napolju.",
  },
];

const cities = [
  {
    name: "Beograd",
    desc: `Iz Beograda polazi ${vehicleCountLabel(countFrom("Beograd"))} iz naše flote, pa za venčanja u gradu nema doplate za transport. Pokrivamo sve opštine, od Zemuna do Voždovca, kao i sale u okolini.`,
  },
  {
    name: "Pančevo i južni Banat",
    desc: `Iz Pančeva polazi ${vehicleCountLabel(countFrom("Pančevo"))} — za venčanja u samom Pančevu nema troška transporta. Za ostala mesta u južnom Banatu transport se dogovara prema udaljenosti.`,
  },
  {
    name: "Novi Sad i Vojvodina",
    desc: "Sva vozila mogu da izađu u Novi Sad i ostatak Vojvodine. Transport se dogovara posebno i zavisi od udaljenosti sale.",
  },
  {
    name: "Niš, Kragujevac i ostatak Srbije",
    desc: "Za venčanja van šireg beogradskog i pančevačkog kruga potreban je transport vozila, pa se termin dogovara ranije. Javite nam grad i datum pa računamo tačno.",
  },
];

const comparison = [
  {
    kriterijum: "Utisak na fotografijama",
    oldtajmer: "Jedinstven, prepoznatljiv kadar",
    moderno: "Elegantan, ali viđen",
  },
  {
    kriterijum: "Broj putnika",
    oldtajmer: "Realno 2–4 osobe",
    moderno: "4–5 osoba udobno",
  },
  {
    kriterijum: "Prostor za venčanicu",
    oldtajmer: "Skromniji, traži pažljiv ulazak",
    moderno: "Prostrano, posebno SUV",
  },
  {
    kriterijum: "Klima uređaj",
    oldtajmer: "Po pravilu ga nema",
    moderno: "Standardno",
  },
  {
    kriterijum: "Duge relacije",
    oldtajmer: "Kraće vožnje i lokalna maršuta",
    moderno: "Bez ograničenja",
  },
  {
    kriterijum: "Cena",
    oldtajmer: `Od ${priceLow} € za venčanje`,
    moderno: "Od 350 € za ceo dan",
  },
  {
    kriterijum: "Najbolje za",
    oldtajmer: "Mladence, fotografisanje, čelo kolone",
    moderno: "Kumove, goste, transfere, ceo dan",
  },
];

const faqItems = [
  {
    q: "Koliko košta iznajmljivanje oldtajmera za venčanje?",
    a: `Cena zavisi od vozila i od grada iz kojeg polazi i kreće se od ${priceLow} € do ${priceHigh} € za svadbeni termin — tačan iznos po vozilu naveden je u cenovniku na ovoj stranici. Izlazak u druge gradove znači doplatu za transport, koju računamo prema udaljenosti. Pošaljite upit sa datumom i lokacijom pa dobijate tačnu cenu.`,
  },
  {
    q: "Da li oldtajmer dolazi sa vozačem?",
    a: "Da. Retro vozila se iznajmljuju isključivo sa vozačem koji ih poznaje. Ova vozila imaju svoje specifičnosti u vožnji i održavanju, pa ih vlasnici ne daju bez vozača — što je za mladence dobra vest, jer nemate brigu ni o vožnji ni o parkingu.",
  },
  {
    q: "Koliko unapred treba da rezervišem oldtajmer?",
    a: "Što ranije, jer je u pitanju mala flota jedinstvenih vozila — ne postoji drugi identičan auto koji uskače ako je termin zauzet. U sezoni venčanja (maj–oktobar), a naročito za subote, računajte dva do tri meseca unapred. Van sezone je često dovoljno i mesec dana.",
  },
  {
    q: "Šta je uključeno u cenu?",
    a: "Vozilo, vozač i gorivo za dogovorenu maršutu u okviru grada iz kojeg vozilo polazi. Posebno se dogovaraju transport do drugog grada, dekoracija i eventualno produženje termina.",
  },
  {
    q: "Koliko ljudi može da se vozi u oldtajmeru?",
    a: "Formalno do četvoro, ali realno je udobno za dvoje — venčanica zauzima dosta prostora, a stara vozila nemaju enterijer savremenih dimenzija. Zbog toga se najčešće radi tako da mladenci idu oldtajmerom, a kum, kuma i barjaktar drugim vozilima.",
  },
  {
    q: "Mogu li da iznajmim dva retro automobila za kolonu?",
    a: "Možete. U floti imamo i vozila koja se odlično slažu u paru, pa kolona deluje usklađeno. Moguće je kombinovati i vozila iz različitih gradova, samo to treba dogovoriti ranije zbog logistike i transporta.",
  },
  {
    q: "Da li mogu da iznajmim oldtajmer samo za fotografisanje?",
    a: "Da. Kraći termin samo za foto ili video sesiju je česta opcija — bilo za predsvadbeno snimanje, bilo za sat vremena slikanja na dan venčanja. Javite nam koliko vam vremena treba pa pravimo ponudu za taj obim.",
  },
  {
    q: "Da li oldtajmer ima klimu?",
    a: "Po pravilu nema — reč je o vozilima starim od šezdeset do skoro sto godina. Za letnje venčanje to rešavamo planiranjem: kraće vožnje, otvoreni kabriolet umesto zatvorene limuzine, ili vožnja u delovima dana kada nije najtoplije.",
  },
  {
    q: "Može li oldtajmer da dođe u moj grad?",
    a: `Može. Vozila polaze iz Beograda i iz Pančeva, a za ostale gradove se dogovara transport. Zbog godina vozila duže relacije se ne prelaze u vožnji nego se vozilo prevozi, pa nam javite grad i datum da izračunamo tačnu doplatu.`,
  },
  {
    q: "Da li se vozilo dekoriše za venčanje?",
    a: "Dekoracija se dogovara sa vlasnikom vozila. Kod oldtajmera važi pravilo da se ništa ne lepi direktno na lak i hrom — koriste se trake, magneti i aranžmani koji se skidaju bez traga. Recite nam u upitu kakvu dekoraciju želite pa proveravamo šta je moguće na konkretnom vozilu.",
  },
  {
    q: "Šta ako se vozilo pokvari na dan venčanja?",
    a: "Vozila se pripremaju i proveravaju pred svaki termin, ali kod automobila starih više decenija uvek preporučujemo da unapred dogovorimo rezervni plan. Najsigurnija kombinacija je oldtajmer za mladence i moderno vozilo za kumove, tako da u svakom trenutku postoji drugi auto u koloni.",
  },
  {
    q: "Oldtajmer ili moderna limuzina — šta da izaberem?",
    a: "Oldtajmer birajte zbog karaktera, fotografija i utiska; modernu limuzinu zbog komfora, klime, prostora i dužih relacija. Mnogi parovi ne biraju nego kombinuju: retro auto za mladence i fotografisanje, a moderno vozilo za goste i transfere tokom dana.",
  },
  {
    q: "Može li retro auto da vodi svadbenu kolonu?",
    a: "Naravno — to je i najefektnija upotreba. Kolona sa barjaktarom je deo naše svadbene tradicije, a vozilo staro devedeset godina na čelu povorke je detalj koji se pamti i koji odlično izgleda na snimku iz drona.",
  },
  {
    q: "Kako se rezerviše vozilo?",
    a: "Popunite formu na ovoj stranici sa datumom, gradom i vozilom koje vam se dopada. Proveravamo dostupnost za taj termin i javljamo se sa potvrdom i tačnom cenom. Rezervacija je gotova kada potvrdite ponudu.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SCHEMA.ORG
═══════════════════════════════════════════════════════════════════════════ */

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Iznajmljivanje oldtajmera za venčanje",
  name: "Iznajmljivanje oldtajmera i retro automobila za venčanje sa vozačem",
  description: `Najam oldtajmera za venčanja i svadbe u Srbiji: ${modelNames.join(", ")}. Sva vozila dolaze sa vozačem.`,
  provider: {
    "@type": "Organization",
    name: "HALO Uspomene",
    url: siteUrl,
  },
  areaServed: [
    { "@type": "Country", name: "Srbija" },
    ...fleetCities.map((city) => ({ "@type": "City", name: city })),
  ],
  url: pageUrl,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: priceLow,
    highPrice: priceHigh,
    offerCount: oldtimerFleet.length,
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Flota oldtajmera za venčanja",
    itemListElement: oldtimerFleet.map((v) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: `${v.name}${v.year ? ` (${v.year})` : ""} sa vozačem za venčanje`,
        description: v.blurb,
      },
      priceCurrency: "EUR",
      price: v.price.from,
      ...(v.price.to
        ? {
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: v.price.from,
              maxPrice: v.price.to,
              priceCurrency: "EUR",
            },
          }
        : {}),
      areaServed: { "@type": "City", name: v.basedIn },
    })),
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

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Početna", item: siteUrl },
    {
      "@type": "ListItem",
      position: 2,
      name: "Iznajmljivanje oldtajmera za venčanje",
      item: pageUrl,
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   STRANICA
═══════════════════════════════════════════════════════════════════════════ */

export default function IznajmljivanjeOldtajmeraZaVencanje() {
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        {/* ─────────────────────────── HERO ─────────────────────────── */}
        <section className="pt-28 sm:pt-32 pb-14 sm:pb-20 relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-5xl">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Iznajmljivanje oldtajmera za venčanje" },
              ]}
            />
            <div className="text-center mt-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-5">
                Retro automobili za mladence
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] leading-tight mb-6">
                Iznajmljivanje oldtajmera za{" "}
                <span className="italic text-[#AE343F]">venčanje</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#232323]/60 max-w-2xl mx-auto mb-4 leading-relaxed">
                Klasici iz šezdesetih i predratni američki i evropski automobili
                — retro vozila sa vozačem, za dolazak koji gosti pamte i
                fotografije koje ne stare.
              </p>
              <p className="text-sm text-[#232323]/50 max-w-xl mx-auto mb-9">
                Flota polazi iz Beograda i Pančeva, a uz dogovoren transport
                izlazi na venčanja širom Srbije.
              </p>

              {/* Fotografija je bez pozadine — bez okvira, samo meki topli sjaj ispod */}
              <div className="relative mx-auto mb-9 max-w-3xl">
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[75%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(212,175,55,0.18),transparent_70%)] blur-3xl"
                />
                <Image
                  src="/images/oldtajmeri/citroen-traction-avant-11b.webp"
                  alt="Citroën Traction Avant 11B — crni oldtajmer za venčanje sa vozačem"
                  width={1200}
                  height={800}
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="relative z-10 h-auto w-full"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-9 text-[#232323]/50 text-sm">
                <span className="flex items-center gap-2">
                  <Car size={16} className="text-[#AE343F]" />
                  {oldtimerFleet.length} vozila u ponudi
                </span>
                <span className="flex items-center gap-2">
                  <Gem size={16} className="text-[#AE343F]" />
                  od {priceLow} € za venčanje
                </span>
                <span className="flex items-center gap-2">
                  <UserCheck size={16} className="text-[#AE343F]" />
                  vozač uključen
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#kontakt"
                  className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] btn-lg rounded-full px-10 border-none shadow-xl shadow-[#AE343F]/30"
                  data-track="cta_click"
                  data-track-cta-name="upit_oldtajmer"
                  data-track-cta-location="hero"
                >
                  Proveri dostupnost
                  <ArrowRight size={18} />
                </a>
                <a
                  href="#flota"
                  className="btn btn-outline border-[#232323]/20 text-[#232323] hover:bg-[#232323] hover:text-[#F5F4DC] btn-lg rounded-full px-10"
                >
                  Pogledaj vozila
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────── ŠTA JE UKLJUČENO ─────────────────────── */}
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

        {/* ─────────────────────────── FLOTA ─────────────────────────── */}
        <section id="flota" className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Naša flota
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Retro automobili za{" "}
                <span className="italic text-[#AE343F]">vaše venčanje</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Svako vozilo je jedinstveno i dostupno samo za jedan termin
                dnevno. Sva dolaze sa vozačem.
              </p>
            </div>

            {fleetByCity.map((group) => (
              <div key={group.city} className="mb-14 last:mb-0">
                {/* Grupisanje po gradu polaska — mladencima je to logistička
                    informacija, jer se transport van tog grada doplaćuje. */}
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-6 pb-4 border-b border-[#232323]/10">
                  <h3 className="font-serif text-2xl text-[#232323] flex items-center gap-2">
                    <MapPin size={18} className="text-[#AE343F]" />
                    {group.city}
                  </h3>
                  <span className="text-sm text-[#232323]/45">
                    {vehicleCountLabel(group.vehicles.length)}
                  </span>
                  {group.priceNote && (
                    <span className="text-xs text-[#232323]/40 basis-full sm:basis-auto sm:ml-auto sm:text-right sm:max-w-sm leading-snug">
                      {group.priceNote}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.vehicles.map((v) => (
                    <article
                      key={v.id}
                      className="group flex flex-col bg-white rounded-3xl border border-[#232323]/8 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#232323]/10 hover:-translate-y-1.5 transition-all duration-300"
                    >
                      <div className="relative aspect-[16/11] overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,#fdfcf6_0%,#f1efdb_55%,#e2dfc6_100%)]">
                        {v.image ? (
                          <Image
                            src={v.image}
                            alt={`${v.name}${v.year ? ` iz ${v.year}` : ""} — oldtajmer za venčanje, ${v.color.toLowerCase()} boja`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#232323]/25">
                            <Car size={32} />
                            <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
                              Fotografija uskoro
                            </span>
                          </div>
                        )}
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
                          {v.year ? ` · ${v.year}` : ""}
                        </p>
                        <p className="text-sm text-[#232323]/55 leading-relaxed mb-6 flex-1">
                          {v.blurb}
                        </p>

                        <a
                          href="#kontakt"
                          className="btn btn-sm bg-[#232323] hover:bg-[#AE343F] text-[#F5F4DC] rounded-full border-none w-full"
                          data-track="cta_click"
                          data-track-cta-name="upit_oldtajmer"
                          data-track-cta-location={`kartica_${v.id}`}
                        >
                          Proveri dostupnost
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}

            <p className="text-center text-sm text-[#232323]/45 mt-10 max-w-2xl mx-auto">
              Cena za svako vozilo nalazi se u{" "}
              <a
                href="#cene"
                className="text-[#AE343F] font-medium hover:underline"
              >
                cenovniku ispod
              </a>
              .
            </p>
          </div>
        </section>

        {/* ───────────────────────── CENE / ŠTA ULAZI ───────────────────────── */}
        <section id="cene" className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Cene
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Koliko košta oldtajmer za{" "}
                <span className="italic text-[#AE343F]">svadbu</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Za razliku od većine ponuda na tržištu, kod nas cena nije
                skrivena iza forme za upit. Evo šta plaćate i šta je uključeno.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-[#232323]/8 bg-white">
              <table className="w-full text-left text-sm min-w-[520px]">
                <thead>
                  <tr className="bg-[#232323] text-[#F5F4DC]">
                    <th className="py-4 px-5 font-semibold">Vozilo</th>
                    <th className="py-4 px-5 font-semibold text-right">
                      Cena za venčanje
                    </th>
                  </tr>
                </thead>
                {/* Jedan <tbody> po gradu polaska — napomena o transportu se
                    tako piše jednom umesto u svakom redu. */}
                {fleetByCity.map((group) => (
                  <tbody key={group.city}>
                    <tr className="bg-[#f5f4dc]/70 border-t border-[#232323]/8">
                      <th
                        colSpan={2}
                        className="py-3 px-5 text-left font-normal"
                      >
                        <span className="font-serif text-lg text-[#232323]">
                          {group.city}
                        </span>
                        {group.priceNote && (
                          <span className="block text-xs text-[#232323]/45 mt-0.5">
                            {group.priceNote}
                          </span>
                        )}
                      </th>
                    </tr>
                    {group.vehicles.map((v) => (
                      <tr
                        key={v.id}
                        className="border-t border-[#232323]/8 hover:bg-[#f5f4dc]/40 transition-colors"
                      >
                        <td className="py-4 px-5">
                          <span className="font-medium text-[#232323]">
                            {v.name}
                          </span>
                          <span className="block text-xs text-[#232323]/45">
                            {v.color}
                            {v.year ? ` · ${v.year}` : ""}
                            {v.seats ? ` · ${v.seats.toLowerCase()}` : ""}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-serif text-lg text-[#AE343F] text-right whitespace-nowrap">
                          {v.price.to
                            ? `${v.price.from}–${v.price.to} €`
                            : `${v.price.from} €`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="p-7 rounded-3xl bg-[#f5f4dc]/50 border border-[#232323]/8">
                <h3 className="font-serif text-xl text-[#232323] mb-4">
                  U cenu je uključeno
                </h3>
                <ul className="space-y-2.5 text-sm text-[#232323]/60">
                  <li>Vozilo za dogovoreni svadbeni termin</li>
                  <li>Vozač koji poznaje vozilo</li>
                  <li>Gorivo za maršutu u okviru grada polaska</li>
                  <li>Priprema i čišćenje vozila pre termina</li>
                  <li>Dogovor satnice i rute unapred</li>
                </ul>
              </div>
              <div className="p-7 rounded-3xl bg-[#f5f4dc]/50 border border-[#232323]/8">
                <h3 className="font-serif text-xl text-[#232323] mb-4">
                  Dogovara se posebno
                </h3>
                <ul className="space-y-2.5 text-sm text-[#232323]/60">
                  <li>Transport vozila do drugog grada</li>
                  <li>Dekoracija vozila (cveće, trake)</li>
                  <li>Produžetak termina preko dogovorenog</li>
                  <li>Dodatno vozilo za kumove i barjaktara</li>
                  <li>Kraći termin samo za fotografisanje</li>
                </ul>
              </div>
            </div>

            <p className="text-center text-sm text-[#232323]/50 mt-8 max-w-2xl mx-auto leading-relaxed">
              Poređenja radi, oldtajmeri se na srpskom tržištu uglavnom
              naplaćuju od oko 120 € za prvi sat, odnosno 500 € i više za ceo
              dan. Naše cene su fiksne za svadbeni termin, bez računanja po
              započetom satu.
            </p>
          </div>
        </section>

        {/* ─────────────────────── ZAŠTO OLDTAJMER ─────────────────────── */}
        <section className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Zašto baš retro
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-5">
                Zašto mladenci biraju oldtajmer, a ne{" "}
                <span className="italic text-[#AE343F]">običan auto</span>
              </h2>
              <p className="text-[#232323]/55 max-w-3xl mx-auto leading-relaxed">
                Auto na venčanju odavno nije samo prevoz od kuće do sale. On je
                prva scena koju gosti vide, kulisa za najveći deo fotografija i
                jedan od retkih detalja koji se pamti godinama. Zato sve više
                parova bira vozilo sa pričom umesto vozila sa opremom.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyOldtimer.map((item) => (
                <div
                  key={item.title}
                  className="p-7 rounded-3xl bg-white border border-[#232323]/8 shadow-sm"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mb-5">
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

            <p className="text-center text-sm text-[#232323]/50 mt-10 max-w-2xl mx-auto">
              Više o tome zašto se trend okrenuo ka retro vozilima pisali smo u
              tekstu{" "}
              <Link
                href="/blog/oldtajmer-za-vencanje-zasto-retro"
                className="text-[#AE343F] font-medium hover:underline"
              >
                zašto mladenci biraju oldtajmere umesto modernih limuzina
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ─────────────────── SVADBENI DAN SA OLDTAJMEROM ─────────────────── */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Kako to izgleda
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Svadbeni dan sa{" "}
                <span className="italic text-[#AE343F]">oldtajmerom</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Standardna maršuta prati klasičan tok srpske svadbe. Sve se
                dogovara unapred, da vozilo bude tamo gde treba i kada treba.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {weddingDay.map((step) => (
                <div
                  key={step.n}
                  className="p-7 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5"
                >
                  <span className="font-serif text-4xl text-[#AE343F]/25 block mb-3">
                    {step.n}
                  </span>
                  <h3 className="font-serif text-lg text-[#232323] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#232323]/55 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 p-7 sm:p-9 rounded-3xl bg-[#232323] text-[#F5F4DC]">
              <h3 className="font-serif text-2xl mb-3 flex items-center gap-3">
                <Flag size={22} className="text-[#d4af37]" />
                Oldtajmer na čelu svadbene kolone
              </h3>
              <p className="text-[#F5F4DC]/60 leading-relaxed text-[15px]">
                Kolona sa barjaktarom na čelu jedan je od najprepoznatljivijih
                delova naše svadbene tradicije. Kada tu ulogu preuzme automobil
                star devedeset godina, kolona prestaje da bude niz automobila i
                postaje deo proslave — nešto zbog čega se prolaznici okreću, a
                snimak iz drona dobija scenu koju inače nema. Najčešća
                kombinacija je oldtajmer za mladence, a{" "}
                <Link
                  href="/iznajmljivanje-automobila-za-vencanje"
                  className="text-[#d4af37] hover:underline"
                >
                  moderna luksuzna vozila
                </Link>{" "}
                za kuma, kumu i barjaktara.
              </p>
            </div>
          </div>
        </section>

        {/* ──────────────── FOTOGRAFISANJE + DEKORACIJA ──────────────── */}
        <section className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white border border-[#232323]/8">
                <div className="w-14 h-14 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mb-5">
                  <Camera size={26} />
                </div>
                <h2 className="font-serif text-2xl text-[#232323] mb-3">
                  Oldtajmer za fotografisanje i predsvadbeno snimanje
                </h2>
                <p className="text-sm text-[#232323]/55 leading-relaxed mb-4">
                  Retro auto ne mora da bude rezervisan za ceo dan. Mnogi parovi
                  uzimaju kraći termin samo za foto ili video sesiju — za
                  predsvadbeno snimanje, save the date snimak ili sat vremena
                  slikanja na dan venčanja.
                </p>
                <p className="text-sm text-[#232323]/55 leading-relaxed">
                  Savet iz prakse: lokaciju dogovorite sa fotografom unapred.
                  Stara vozila najbolje izgledaju ispred jednostavnih pozadina —
                  zid od cigle, drvored, stara fasada — bez modernih automobila
                  u kadru.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white border border-[#232323]/8">
                <div className="w-14 h-14 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mb-5">
                  <Palette size={26} />
                </div>
                <h2 className="font-serif text-2xl text-[#232323] mb-3">
                  Dekoracija retro automobila
                </h2>
                <p className="text-sm text-[#232323]/55 leading-relaxed mb-4">
                  Dekoracija se uvek dogovara sa vlasnikom vozila. Kod
                  oldtajmera važi jedno pravilo: ništa se ne lepi direktno na
                  lak i hrom. Koriste se trake, magnetni nosači i aranžmani koji
                  se skidaju bez traga.
                </p>
                <p className="text-sm text-[#232323]/55 leading-relaxed">
                  Manje je više — kod vozila sa ovoliko karaktera dovoljan je
                  jedan aranžman na haubi ili traka u boji venčanja. Javite nam
                  u upitu šta ste zamislili pa proveravamo šta je moguće na
                  konkretnom automobilu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────── GRADOVI ─────────────────────────── */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Gde izlazimo
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Oldtajmer za venčanje u{" "}
                <span className="italic text-[#AE343F]">vašem gradu</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Vozila polaze iz Beograda i Pančeva. Za ostale gradove računamo
                transport prema udaljenosti sale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cities.map((c) => (
                <div
                  key={c.name}
                  className="flex gap-5 p-6 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5"
                >
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-[#232323] mb-2">
                      {c.name}
                    </h3>
                    <p className="text-sm text-[#232323]/55 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────── OLDTAJMER ILI MODERNA LIMUZINA ──────────────── */}
        <section className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Poređenje
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Oldtajmer ili moderna{" "}
                <span className="italic text-[#AE343F]">limuzina?</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Nema pogrešnog izbora — postoji samo izbor koji odgovara vašem
                venčanju. Evo poštenog poređenja.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-[#232323]/8 bg-white">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-[#232323] text-[#F5F4DC]">
                    <th className="py-4 px-5 font-semibold">Kriterijum</th>
                    <th className="py-4 px-5 font-semibold">Oldtajmer</th>
                    <th className="py-4 px-5 font-semibold">
                      Moderno luksuzno vozilo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr
                      key={row.kriterijum}
                      className="border-t border-[#232323]/8"
                    >
                      <td className="py-4 px-5 font-medium text-[#232323]">
                        {row.kriterijum}
                      </td>
                      <td className="py-4 px-5 text-[#232323]/60">
                        {row.oldtajmer}
                      </td>
                      <td className="py-4 px-5 text-[#232323]/60">
                        {row.moderno}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-7 rounded-3xl bg-[#f5f4dc]/60 border border-[#232323]/8 text-center">
              <p className="text-[#232323]/65 leading-relaxed">
                Ako vam je važniji komfor, klima i prostor za venčanicu,
                pogledajte našu ponudu{" "}
                <Link
                  href="/iznajmljivanje-automobila-za-vencanje"
                  className="text-[#AE343F] font-medium hover:underline"
                >
                  modernih luksuznih automobila za venčanje
                </Link>{" "}
                — Mercedes E, S, GLE i G klasa sa šoferom. Najbolje od oba sveta
                je kombinacija: retro auto za mladence, moderno vozilo za goste.
              </p>
            </div>
          </div>
        </section>

        {/* ─────────────────────────── FAQ ─────────────────────────── */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Česta pitanja
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323]">
                Sve o najmu{" "}
                <span className="italic text-[#AE343F]">oldtajmera</span>
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
              Planirate venčanje?{" "}
              <Link
                href="/blog/auto-za-vencanje-vodic"
                className="text-[#AE343F] font-medium hover:underline"
              >
                Pročitajte vodič kako izabrati auto za venčanje
              </Link>{" "}
              ili otvorite{" "}
              <Link
                href="/planiranje-vencanja"
                className="text-[#AE343F] font-medium hover:underline"
              >
                naš planer venčanja
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ─────────────────────── KONTAKT / FORMA ─────────────────────── */}
        <section id="kontakt" className="py-16 sm:py-20 md:py-24 bg-[#232323]">
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
                Svako od ovih vozila postoji u jednom primerku i vozi jedno
                venčanje dnevno — zato se termini zauzimaju rano. Pošaljite
                upit, javljamo se sa potvrdom i tačnom cenom. Bez obaveze.
              </p>
            </div>
            <VehicleRentalLeadForm
              vehicleOptions={getVehicleOptions()}
              serviceOptions={[
                "Ceo svadbeni termin",
                "Samo fotografisanje",
                "Više vozila za kolonu",
              ]}
              subjectLabel="Najam oldtajmera za venčanje"
              paket="Iznajmljivanje oldtajmera za venčanje"
              introHighlight="najam oldtajmera"
              routingProduct="oldtajmeri"
              submitLabel="Pošalji upit za oldtajmer"
            />
          </div>
        </section>

        {/* ─────────────────────── SEO TEKST (skriven) ─────────────────────── */}
        <section className="sr-only">
          <h2>
            Iznajmljivanje oldtajmera za venčanje i svadbu — retro automobili sa
            vozačem
          </h2>
          <p>
            HALO Uspomene posreduje iznajmljivanje oldtajmera za venčanja i
            svadbe u Srbiji. U ponudi su trenutno: {modelNames.join(", ")}. Sva
            vozila se iznajmljuju sa vozačem, a ponuda se stalno širi. Oldtajmer
            možete uzeti kao auto za mladence, kao vozilo na čelu svadbene
            kolone sa barjaktarom, ili samo za fotografisanje i predsvadbeno
            snimanje. Vozila polaze iz Beograda i Pančeva, a uz dogovoren
            transport izlaze na venčanja u Novom Sadu, Nišu, Kragujevcu,
            Subotici, Čačku i ostalim gradovima. Ako tražite stari automobil za
            venčanje, retro auto za svadbu, klasična ili vintage vozila za
            mladence — ovde su cene, uslovi i dostupnost na jednom mestu. Za
            moderna vozila pogledajte našu ponudu luksuznih automobila sa
            šoferom.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
