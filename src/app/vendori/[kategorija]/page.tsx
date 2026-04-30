import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Lock, Sparkles, ChevronDown } from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getPublicVendors } from "@/lib/vendors";
import {
  CATEGORY_SLUGS,
  CITY_SLUGS,
  getCategoryBySlug,
} from "@/data/vendori/categories";
import { CITIES, CATEGORY_META } from "@/app/moje-vencanje/vendor-constants";
import VendorListClient from "./VendorListClient";
import { categoryIcon } from "@/lib/vendor-icons";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const revalidate = 3600;

export function generateStaticParams() {
  return Object.values(CATEGORY_SLUGS).map((kategorija) => ({ kategorija }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategorija: string }>;
}): Promise<Metadata> {
  const { kategorija } = await params;
  const content = getCategoryBySlug(kategorija);
  if (!content) return {};

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    keywords: content.keywords,
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      type: "website",
      url: `${siteUrl}/vendori/${kategorija}`,
      siteName: "Halo Uspomene",
    },
    twitter: {
      card: "summary_large_image",
      title: content.metaTitle,
      description: content.metaDescription,
    },
    alternates: {
      canonical: `${siteUrl}/vendori/${kategorija}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ kategorija: string }>;
}) {
  const { kategorija } = await params;
  const content = getCategoryBySlug(kategorija);
  if (!content) notFound();

  const vendors = await getPublicVendors({ category: content.category });

  // Determine which cities have vendors so anchor nav only shows real ones
  const citySet = new Set(vendors.map((v) => v.city));
  const presentCities = CITIES.filter((c) => citySet.has(c));

  // Display labels (e.g. "Torte", "Bendovi & DJ", "Foto & Video")
  const meta = CATEGORY_META.find((m) => m.id === content.category);
  const labelPlural = meta?.labelPlural ?? content.h1.split(" ")[0];

  // JSON-LD: ItemList of vendors (name + city only — no contact, no URL)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: content.h1,
    numberOfItems: vendors.length,
    itemListElement: vendors.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LocalBusiness",
        name: v.name,
        address: {
          "@type": "PostalAddress",
          addressLocality: v.city,
          addressCountry: "RS",
        },
      },
    })),
  };

  // JSON-LD: FAQ
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6] pt-28 pb-16 sm:pb-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Vendori", href: "/vendori" },
                { label: labelPlural },
              ]}
            />
          </div>

          {/* Hero */}
          <section className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#AE343F]/10 rounded-full mb-6">
              <span className="text-[#AE343F]">
                {categoryIcon(content.category, 16)}
              </span>
              <span className="text-sm font-medium text-[#AE343F] uppercase tracking-widest">
                {labelPlural}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
              {content.h1}
            </h1>
            <p className="text-base sm:text-lg text-[#232323]/70 max-w-3xl mx-auto leading-relaxed text-justify hyphens-auto">
              {content.intro}
            </p>
          </section>

          {/* Notice banner */}
          <div className="bg-[#F5F4DC] border border-[#d4af37]/40 rounded-2xl p-5 sm:p-6 mb-10 flex items-start gap-3 max-w-3xl mx-auto">
            <Lock size={18} className="text-[#AE343F] shrink-0 mt-0.5" />
            <p className="text-sm text-[#232323]/80 leading-relaxed">
              Ovo je javan pregled gde su svi vendori prikazani jednako.
              <strong className="font-semibold text-[#232323]"> Verifikovani, traženiji i posebno istaknuti vendori se izdvajaju u Moje Venčanje planeru</strong>{" "}
              posle besplatne registracije, gde dobijate i sve kontakte, opise i
              preporuke parova.
            </p>
          </div>

          {/* Anchor nav: skoči na grad */}
          {presentCities.length > 1 && (
            <nav
              aria-label="Skoči na grad"
              className="mb-10 flex items-center gap-2 flex-wrap justify-center text-sm"
            >
              <span className="text-[#232323]/55 inline-flex items-center gap-1">
                <ChevronDown size={14} />
                Skoči na:
              </span>
              {presentCities.map((c) => (
                <a
                  key={c}
                  href={`#${CITY_SLUGS[c]}`}
                  className="px-3 py-1.5 rounded-full border border-[#232323]/15 hover:border-[#AE343F]/50 hover:bg-[#AE343F]/5 text-[#232323]/80 hover:text-[#AE343F] transition-colors"
                >
                  {c}
                </a>
              ))}
            </nav>
          )}

          {/* Vendor sections by city */}
          <section className="mb-12">
            <VendorListClient
              vendors={vendors}
              category={content.category}
              categoryLabel={labelPlural}
              cityIntros={content.cityIntros}
            />
          </section>

          {/* FAQ */}
          {content.faq.length > 0 && (
            <section className="mb-12 max-w-3xl mx-auto">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#232323] mb-6 text-center">
                Često postavljana pitanja
              </h2>
              <div className="space-y-4">
                {content.faq.map((f, i) => (
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
            </section>
          )}

          {/* CTA banner */}
          <section className="bg-white border border-[#232323]/15 rounded-2xl p-6 sm:p-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#AE343F]/10 rounded-full mb-4">
              <Sparkles size={14} className="text-[#AE343F]" />
              <span className="text-xs font-medium text-[#AE343F] uppercase tracking-wider">
                Besplatan planer
              </span>
            </div>
            <h2 className="font-serif text-2xl text-[#232323] mb-3">
              Otključajte sve detalje
            </h2>
            <p className="text-sm text-[#232323]/65 max-w-xl mx-auto mb-5 leading-relaxed">
              Otvorite Moje Venčanje besplatno i dobijate kontakte vendora,
              opise, preporuke parova, mogućnost čuvanja omiljenih i kompletan
              direktorijum bez ograničenja.
            </p>
            <Link
              href="/moje-vencanje"
              className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] rounded-full px-8 border-none inline-flex items-center gap-2"
            >
              Otvorite Moje Venčanje
              <ArrowRight size={16} />
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
