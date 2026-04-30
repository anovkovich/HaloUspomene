import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getPublicVendors } from "@/lib/vendors";
import { CATEGORY_CONTENT } from "@/data/vendori/categories";
import { CATEGORY_META } from "@/app/moje-vencanje/vendor-constants";
import type { VendorCategory } from "@/app/moje-vencanje/types";
import { categoryIcon } from "@/lib/vendor-icons";
import QuickRegisterCta from "./QuickRegisterCta";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const revalidate = 3600;

const VENDOR_FAQ: { q: string; a: string }[] = [
  {
    q: "Da li mogu direktno kontaktirati vendora preko sajta?",
    a: "Da — kontakt podaci (telefon, sajt, Instagram) postaju vidljivi nakon besplatne registracije u Moje Venčanje planeru. Komunikacija ide direktno između vas i vendora, mi nismo posrednik niti uzimamo proviziju. U javnom pregledu na ovoj stranici kontakti su skriveni jer štitimo vendore od spam-a i jer pun pristup ide kao benefit registrovanim parovima.",
  },
  {
    q: "Kako da biram vendore za venčanje?",
    a: "Krenite od najveće stavke — sale, jer od nje zavise datum, broj zvanica i ton svadbe. Zatim po redosledu prioriteta uskladite sa budžetom: muzika, fotograf, dekoracija, cveće, torta, šminka, ostalo. Pre angažovanja posetite više vendora, pitajte za reference i tražite portfolio sa stvarnih venčanja, a ne studio snimke. U Moje Venčanje planeru dobijate broj preporuka drugih parova kao dodatni signal pouzdanosti.",
  },
  {
    q: "Koliko unapred da bukiram svakog vendora?",
    a: "Pravilo je: što veća stavka i ekskluzivniji izvođač — to ranije. Sale se bukiraju 9-12 meseci unapred (popularne i godinu i po), fotografi i bendovi 6-9 meseci, dekorateri 4-6 meseci, šminka i frizura 3-6 meseci, cveće i torta 2-4 meseca, burme 2-3 meseca. Za popularne datume (subote u maju, junu i septembru) sve pomerite ranije.",
  },
  {
    q: "Šta su preporuke parova i kako rade?",
    a: "Preporuke (endorsements) dolaze od parova koji su koristili vendora i to označili u Moje Venčanje planeru. Vendor sa više preporuka prelazi nivoe (Novi → Verifikovan → Preporučen → Top), što je signal da je proveren kroz stvarna venčanja, ne kroz reklame. U javnom pregledu broj preporuka nije vidljiv — vidi se tek nakon registracije u planeru, gde su istaknuti vendori sa više preporuka.",
  },
  {
    q: "Da li je korišćenje pregleda vendora besplatno?",
    a: "Da. Javni pregled je dostupan svima i bez registracije — vidite kategorije, gradove i imena vendora. Pun pristup je takođe besplatan (kontakti, opisi, portfolio, preporuke parova, mogućnost čuvanja omiljenih) samo zahteva besplatnu registraciju u Moje Venčanje planeru. Bez ikakve obaveze, registracija traje 10 sekundi.",
  },
  {
    q: "Kako vendori dospevaju u direktorijum i da li se naplaćuje?",
    a: "Inicijalna grupa vendora je uvrštena u direktorijum besplatno — kao prvi koji su podržali našu platformu. Naknadno dodavanje se naplaćuje simboličnom godišnjom članarinom, koja pokriva održavanje sistema. U javnom pregledu na ovoj stranici svi vendori su prikazani jednako, a tek nakon registracije u planeru, istaknuti su vendori sa više preporuka!",
  },
];

export const metadata: Metadata = {
  title: "Vendori za venčanje u Srbiji | HALO Uspomene",
  description:
    "Pregled vendora za venčanje u Srbiji — sale, muzika, fotografi, torte, dekoracija, cveće i ostalo. Pun pristup u besplatnom planeru.",
  keywords: [
    "vendori za venčanje",
    "vendori za svadbu",
    "vendori za venčanje srbija",
    "direktorijum vendora",
    "sale za venčanje",
    "fotograf za venčanje",
    "bend za venčanje",
    "dj za venčanje",
    "dekoracija za venčanje",
    "cveće za venčanje",
    "torta za venčanje",
    "vendori za venčanje beograd",
    "vendori za venčanje novi sad",
  ],
  openGraph: {
    title: "Vendori za venčanje u Srbiji | HALO Uspomene",
    description:
      "Sale, bendovi, fotografi, torte, dekoracija, cveće — pregled vendora za venčanja širom Srbije.",
    type: "website",
    url: `${siteUrl}/vendori`,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vendori za venčanje u Srbiji | HALO Uspomene",
    description:
      "Sale, bendovi, fotografi, torte, dekoracija, cveće — pregled vendora za venčanja širom Srbije.",
  },
  alternates: {
    canonical: `${siteUrl}/vendori`,
  },
};

export default async function VendoriRootPage() {
  const vendors = await getPublicVendors();

  // Count vendors per category for the cards
  const counts = new Map<VendorCategory, number>();
  for (const v of vendors) {
    counts.set(v.category, (counts.get(v.category) ?? 0) + 1);
  }

  // Round down to nearest 10 so the "preko N" copy stays truthful as the
  // catalog grows (e.g. 87 vendors → "preko 80 vendora")
  const totalVendors = vendors.length;
  const roundedTotal = Math.floor(totalVendors / 10) * 10;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: VENDOR_FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Vendori za venčanje u Srbiji",
    description:
      "Pregled vendora za venčanje u Srbiji — sale, muzika, fotografi, torte, dekoracija, cveće i ostalo.",
    url: `${siteUrl}/vendori`,
    isPartOf: {
      "@type": "WebSite",
      name: "HALO Uspomene",
      url: siteUrl,
    },
    hasPart: CATEGORY_CONTENT.map((c) => ({
      "@type": "WebPage",
      name: c.h1,
      url: `${siteUrl}/vendori/${c.slug}`,
    })),
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6] pt-28 pb-16 sm:pb-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <Breadcrumbs
              items={[{ label: "Početna", href: "/" }, { label: "Vendori" }]}
            />
          </div>

          {/* Hero */}
          <section className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#AE343F]/10 rounded-full mb-6">
              <Sparkles size={16} className="text-[#AE343F]" />
              <span className="text-sm font-medium text-[#AE343F] uppercase tracking-widest">
                Direktorijum vendora
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
              Vendori za venčanje u Srbiji
            </h1>
            <p className="text-lg text-[#232323]/65 max-w-2xl mx-auto leading-relaxed">
              Sale, bendovi i DJ-evi, fotografi, torte, dekoracija, cveće i
              ostalo — okupili smo{" "}
              {roundedTotal >= 10 ? `preko ${roundedTotal} ` : ""}
              vendora širom Srbije sa kojima sarađujemo. Pregledajte po
              kategoriji i otključajte sve detalje u besplatnom planeru.
            </p>
          </section>

          {/* Category grid */}
          <section className="mb-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {CATEGORY_META.map((meta) => {
                const content = CATEGORY_CONTENT.find(
                  (c) => c.category === meta.id,
                );
                if (!content) return null;
                const count = counts.get(meta.id) ?? 0;
                return (
                  <Link
                    key={meta.id}
                    href={`/vendori/${content.slug}`}
                    className="bg-white border border-[#232323]/15 hover:border-[#AE343F]/50 hover:shadow-md rounded-xl p-4 sm:p-5 flex flex-col items-center text-center gap-2 transition-all"
                  >
                    <div className="text-[#AE343F]">
                      {categoryIcon(meta.id, 26)}
                    </div>
                    <p className="text-sm font-semibold text-[#232323] mt-1">
                      {meta.labelPlural}
                    </p>
                    <p className="text-xs text-[#232323]/55">
                      {count > 0 ? `${count} vendora` : "Uskoro"}
                    </p>
                  </Link>
                );
              })}

              {/* 12th card — Moje Venčanje CTA (opens QuickStartForm modal) */}
              <QuickRegisterCta />
            </div>
          </section>

          {/* FAQ */}
          <section className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#232323] mb-2">
                Tu smo da vam pomognemo
              </h2>
              <p className="text-sm text-[#232323]/60 leading-relaxed max-w-xl mx-auto">
                Najčešće dileme oko izbora vendora i organizacije venčanja
              </p>
            </div>
            <div className="space-y-4">
              {VENDOR_FAQ.map((f, i) => (
                <details
                  key={i}
                  className="bg-white border border-[#232323]/15 rounded-xl p-4 group"
                >
                  <summary className="font-semibold text-[#232323] cursor-pointer flex items-center justify-between gap-3">
                    <span>{f.q}</span>
                    <ChevronDown
                      size={18}
                      className="text-[#AE343F] shrink-0 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="text-sm text-[#232323]/75 leading-relaxed mt-3">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>

            {/* Slim closing CTA — cross-sell ka pozivnici (kartica iznad pokriva planer) */}
            <p className="text-center mt-8 text-sm text-[#232323]/65">
              Želite odmah sve uz pozivnicu? Jedna personalizovana pozivnica za
              sve goste —{" "}
              <Link
                href="/napravi-pozivnicu"
                className="text-[#AE343F] hover:text-[#8A2A32] font-semibold inline-flex items-center gap-1"
              >
                napravite svoju
                <ArrowRight size={14} />
              </Link>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
