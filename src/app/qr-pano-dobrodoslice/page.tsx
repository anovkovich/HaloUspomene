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

const faqs = [
  {
    q: "Šta je QR pano dobrodošlice na venčanju?",
    a: "QR Pano dobrodošlice je elegantan grafički pano, najčešće u B1 formatu (700x1000mm), koji se postavlja na ulazu u salu na dan venčanja. Sadrži imena para, dobrodošlicu i QR kod koji vodi do stranice za pretragu mesta sedenja. Gost skenira kamerom kod, ukuca svoje ime i odmah vidi za koji je sto raspoređen — bez haosa oko štampanih spiskova.",
  },
  {
    q: "Kako napraviti QR pano za svadbu?",
    a: "Prvo dobijete pristup alatu — bilo da uzmete raspored sedenja uz našu website pozivnicu, ili se prijavite samo za korišćenje alata (link u podnožju ove stranice). Zatim u tri koraka: 1) Napravite raspored sedenja u alatu — uvezete listu gostiju iz Excel-a, iscrtate šemu sale sa stolovima i prevlačenjem rasporedite goste. 2) Jednim klikom generišete PDF panoa u visokoj rezoluciji, spreman za štampu. 3) Odštampate u bilo kojoj štampariji (B1 format, mat ili sjajni papir) i postavite na ulaz u salu pre dolaska gostiju.",
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
    q: "Da li je QR pano samo za svadbe ili i za druge događaje?",
    a: "Iako je QR pano najpopularniji na svadbama, koristi se i na korporativnim eventima, gala večerama, godišnjicama firme, konferencijama i većim privatnim proslavama (punoletstva, jubileji). Za korporativne i konferencijske evente pogledajte našu stranicu Raspored sedenja za organizatore do koje vodi link naveden ispod ove sekcije sa pitanjima.",
  },
  {
    q: "Da li pretraga prepoznaje srpske dijakritike (š, č, ž, ć)?",
    a: "Da. Pretraga gostiju zanemaruje dijakritike — ako se gost preziva „Petrović”, može da ukuca „Petrovic” i naći će se u listi. Isto važi za sva slova sa kvačicama (š, č, ž, ć) i njihove latinične varijante.",
  },
  {
    q: "Da li dobijam i QR kod za potvrdu dolaska (RSVP)?",
    a: "Da, uz QR pano za sedenje dobijate i drugi QR kod koji vodi na stranicu za online potvrdu dolaska. Možete ga štampati na klasičnim koverat-pozivnicama — gost skenira, ukuca ime i potvrdi dolazak, a potvrda automatski upada u vašu listu gostiju",
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
    brand: {
      "@type": "Brand",
      name: "HALO Uspomene",
    },
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
        name: "QR Pano dobrodošlice",
        item: `${siteUrl}/qr-pano-dobrodoslice`,
      },
    ],
  };

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

        {/* RSVP QR bonus */}
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
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-2">
                    {[
                      "QR vodi na stranicu samo za potvrdu dolaska",
                      "Automatski usklađen sa stilom vaše pozivnice",
                      "Sve potvrde se slivaju u Moje Venčanje portal",
                      "Idealno za goste koji više vole papirne pozivnice",
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
