import React from "react";
import type { Metadata } from "next";
import {
  Armchair,
  ArrowRight,
  Building2,
  Briefcase,
  PartyPopper,
  FileSpreadsheet,
  Mail,
  MousePointerClick,
  Printer,
  QrCode,
  Sparkles,
  Users,
  Shuffle,
  Check,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  formatPrice,
  getStandaloneSeatingPrice,
  getStandaloneSeatingRegularPrice,
  isStandaloneSeatingPromoActive,
} from "@/data/pricing";
import RasporedKontaktForm from "./RasporedKontaktForm";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title:
    "Raspored sedenja za svadbu ili događaj — Online alat sa QR Panoom | HALO Uspomene",
  description:
    "Raspored sedenja online — alat za raspoređivanje stolova i gostiju za svadbu, konferenciju, korporativni event ili veću proslavu. Excel/CSV uvoz gostiju, QR Pano dobrodošlice, lično „gde sedim?” pretraga. Cena, demo i pristup po upitu.",
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

const steps = [
  {
    n: "01",
    icon: <Mail size={22} />,
    title: "Popunite kontakt formu",
    desc: "Otvorite formu na dnu ove stranice i ostavite osnovne podatke o događaju. Javljamo Vam se u toku 24h sa potvrdom i uputstvom za korišćenje.",
  },
  {
    n: "02",
    icon: <MousePointerClick size={22} />,
    title: "Dobijete privatan pristup",
    desc: "Otvorite link, dodate goste direktno iz Excel/CSV fajla ili unesete goste ručno, postavite stolove prema šemi sale i na kraju rasporedite goste.",
  },
  {
    n: "03",
    icon: <Printer size={22} />,
    title: "QR Pano za ulaz",
    desc: "Generišete pano dobrodošlice ili samo QR kod za štampu. Postavite pano na ulaz u salu ili prosledite hostesi link na kom će lako i brzo pronaći mesto svakom gostu.",
  },
];

const benefits = [
  {
    icon: <Users size={20} />,
    title: "Bez gužve na ulazu",
    desc: "Postavite pano na ulazu i gosti će se sami snaći — ili prosledite link hostesi koja će lako pronaći mesto svakom gostu bez haosa sa štampanim spiskovima.",
  },
  {
    icon: <Shuffle size={20} />,
    title: "Promene u zadnji čas",
    desc: "Neko je otkazao? Dolaze dodatni gosti? Promenite raspored u editoru — pano i link ostaju isti, sve se ažurira u realnom vremenu tako da budite bez brige.",
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
    desc: "Najčešća upotreba — 80–250 gostiju, mladenački sto, raspoređivanje po porodicama, mogućnost sedenja gosta na dva stola istovremeno.",
  },
  {
    icon: <Briefcase size={26} />,
    title: "Korporativni eventi",
    desc: "Gala večere, godišnjice firme, team building — lako razvrstavanje gostiju po timovima, sektorima ili nivoima rukovodstva.",
  },
  {
    icon: <Building2 size={26} />,
    title: "Konferencije i forumi",
    desc: "Panel diskusije, seminari, prezentacije — sto za govornike, okrugli stolovi i jasno definisana mesta za sve.",
  },
  {
    icon: <PartyPopper size={26} />,
    title: "Veće proslave",
    desc: "Punoletstva, jubileji, godišnjice — kad imate više od 50 gostiju i hoćete da svako zna gde sedi bez gužve na ulazu.",
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
    a: "Da. Sve promene koje napravite u editoru se ažuriraju u realnom vremenu — i QR kod i link „gde sedim?” ostaju isti, samo se ažurira ono što gost vidi kada skenira. Možete da menjate raspored čak i tokom samog događaja sa telefona.",
  },
  {
    q: "Da li mogu da uvezem goste iz Excel-a ili Google Sheets-a?",
    a: "Da. Alat podržava .xlsx, .xls i .csv format. Dovoljno je da imate kolone za ime gosta, broj osoba u njegovoj grupi i opciono kategoriju (npr. „Mladini” ili „Kolege sa posla”). Alat sve automatski procesuira u listu spremnu za raspoređivanje.",
  },
  {
    q: "Šta je QR Pano dobrodošlice i kako se uklapa u raspored sedenja?",
    a: "QR Pano dobrodošlice je elegantan grafički pano (B1 format, spreman za štampu) sa QR kodom koji vodi do personalizovane stranice „gde sedim?”. Postavlja se na ulazu u salu — gost skenira telefonom, ukuca ime i odmah vidi za koji je sto raspoređen. Eliminiše gužvu na ulazu, štampane spiskove i potrebu za hostesom. Više detalja na našoj stranici QR Pano dobrodošlice.",
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
    a: "Tri opcije: 1) Skeniraju QR kod sa panoa na ulazu u salu i pretraže svoje ime. 2) Otvore link „gde sedim?” koji ste im poslali pre događaja (npr. u sklopu pozivnice). 3) Pitaju hostesu koja koristi isti taj link na svom telefonu. Pretraga zanemaruje dijakritike (š, č, ž, ć) — gost se nalazi i ako ukuca „Petrovic” umesto „Petrović”.",
  },
  {
    q: "Da li je raspored sedenja online dostupan i u Beogradu, Novom Sadu i drugim gradovima?",
    a: "Da. Alat je 100% online i radi u celoj Srbiji — Beograd, Novi Sad, Niš, Kragujevac, Subotica, Čačak i svim ostalim mestima. Nema fizičke dostave, sve se odvija digitalno. PDF pano spreman za štampu možete odštampati u bilo kojoj lokalnoj štampariji.",
  },
];

export default function RasporedSedenjaLanding() {
  const standalonePrice = getStandaloneSeatingPrice();
  const standaloneRegular = getStandaloneSeatingRegularPrice();
  const standalonePromoActive = isStandaloneSeatingPromoActive();

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "HALO Uspomene — Raspored sedenja online",
    description:
      "Online alat za raspoređivanje stolova i gostiju na svadbi, konferenciji, korporativnom eventu ili većoj proslavi. Editor, Excel/CSV uvoz gostiju, QR pano dobrodošlice za ulaz u salu, lično „gde sedim?” pretraga.",
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
      "Personalizovan link „Gde sedim?” za goste",
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
        {/* Hero */}
        <section className="relative pt-32 pb-12 sm:pt-36 sm:pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-[#F5F4DC] to-[#faf9f6] overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#AE343F]/8 rounded-full blur-[120px] translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] -translate-x-1/3" />

          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Raspored sedenja za organizatore" },
              ]}
            />

            <div className="max-w-4xl mx-auto mt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#AE343F]/8 border border-[#AE343F]/20 rounded-full mb-5">
                <Armchair size={12} className="text-[#AE343F]" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#AE343F]">
                  Za organizatore
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] leading-tight mb-5">
                Raspored sedenja{" "}
                <span className="italic text-[#AE343F]">
                  za svadbu ili događaj
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-[#232323]/65 leading-relaxed mb-4 max-w-2xl">
                <strong className="text-[#232323]">
                  Raspored sedenja online
                </strong>{" "}
                — Alat za raspoređivanje stolova i gostiju za svadbu,
                konferenciju, korporativni event ili veću proslavu. Sa Excel
                uvozom gostiju, QR Panoom dobrodošlice za ulaz u salu i ličnom
                „gde sedim?” pretragom za svakog gosta.
              </p>
              <p className="text-sm sm:text-base text-[#232323]/55 leading-relaxed mb-8 max-w-2xl">
                Idealan za sve događaje gde imate listu zvanica i želite da
                svako odmah zna gde sedi — bez štampanih spiskova, bez gužve na
                ulazu, bez improvizacije.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#kontakt-raspored"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-xl shadow-[#AE343F]/20"
                >
                  Kontaktirajte nas
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Kako radi
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
                Tri koraka i sve je{" "}
                <span className="italic text-[#AE343F]">organizovano</span>.
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

        {/* Use cases */}
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

        {/* Benefits */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Prednosti
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
                Bolji od ručnih spiskova jer:
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

        {/* What you get */}
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
                  'Personalizovan link „Gde sedim?" za goste',
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

              <div className="text-center pt-4 border-t border-stone-200">
                {standalonePromoActive && (
                  <span className="inline-block mb-3 px-3 py-1 rounded-full bg-[#AE343F]/10 text-[#AE343F] text-[10px] font-bold uppercase tracking-[0.2em]">
                    Majska akcija
                  </span>
                )}
                <div className="flex items-baseline justify-center gap-3 mb-5">
                  {standalonePromoActive && (
                    <span className="text-xl sm:text-2xl font-serif text-stone-400 line-through">
                      {formatPrice(standaloneRegular)}
                    </span>
                  )}
                  <p className="text-4xl sm:text-5xl font-serif text-[#AE343F]">
                    {formatPrice(standalonePrice)}
                  </p>
                </div>
                <a
                  href="#kontakt-raspored"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-xl shadow-[#AE343F]/20"
                >
                  Pošaljite nam upit
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* RSVP QR bonus */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#faf9f6] to-[#F5F4DC] rounded-3xl p-8 sm:p-10 md:p-12 border border-stone-200">
              <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center shrink-0">
                  <QrCode size={36} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-3">
                    Bonus
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
                    Vašu listu gostiju spremni za raspoređivanje. Nema
                    preuzimanja Excel fajlova, nema ručnog unosa, nema SMS-ova.
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

        {/* FAQ */}
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

        {/* Contact form */}
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
                  Ostavite osnovne podatke o događaju — a mi ćemo Vas
                  kontaktirati u roku od 24h
                </p>
              </div>

              <RasporedKontaktForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
