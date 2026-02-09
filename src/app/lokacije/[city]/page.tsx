import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  MapPin,
  Truck,
  Star,
  BadgeCheck,
  Package,
  ArrowRight,
} from "lucide-react";
import { locations, getLocation } from "@/data/locations";
import { testimonials } from "@/data/testimonials";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return locations.map((loc) => ({ city: loc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const loc = getLocation(city);
  if (!loc) return {};

  return {
    title: `Audio Guest Book ${loc.name} — Venčanja u ${loc.name === "Niš" ? "Nišu" : loc.name === "Beograd" ? "Beogradu" : loc.name === "Novi Sad" ? "Novom Sadu" : loc.name === "Kragujevac" ? "Kragujevcu" : loc.name === "Subotica" ? "Subotici" : loc.name}`,
    description: loc.shortDescription,
    alternates: { canonical: `/lokacije/${loc.slug}` },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const loc = getLocation(city);

  if (!loc) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

  const cityTestimonials = testimonials.filter((t) =>
    loc.testimonialIds.includes(t.id),
  );

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Audio Guest Book za Venčanja u ${loc.name === "Niš" ? "Nišu" : loc.name === "Beograd" ? "Beogradu" : loc.name === "Novi Sad" ? "Novom Sadu" : loc.name === "Kragujevac" ? "Kragujevcu" : loc.name === "Subotica" ? "Subotici" : loc.name}`,
    description: loc.description,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${siteUrl}/#business`,
      name: "HALO Uspomene",
    },
    areaServed: {
      "@type": "City",
      name: loc.name,
      containedInPlace: {
        "@type": "Country",
        name: "Serbia",
      },
    },
    serviceType: "Audio Guest Book Rental",
    url: `${siteUrl}/lokacije/${loc.slug}`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: loc.localFaq.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#faf9f6] pt-28 pb-16 sm:pb-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Lokacije", href: "/lokacije" },
                { label: loc.name },
              ]}
            />
          </div>

          {/* Hero */}
          <section className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#AE343F]/10 rounded-full mb-6">
              <MapPin size={16} className="text-[#AE343F]" />
              <span className="text-sm font-medium text-[#AE343F] uppercase tracking-widest">
                {loc.region}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
              Audio Guest Book u{" "}
              {loc.name === "Niš"
                ? "Nišu"
                : loc.name === "Beograd"
                  ? "Beogradu"
                  : loc.name === "Novi Sad"
                    ? "Novom Sadu"
                    : loc.name === "Kragujevac"
                      ? "Kragujevcu"
                      : loc.name === "Subotica"
                        ? "Subotici"
                        : loc.name}
            </h1>
            <p className="text-lg text-[#232323]/50 max-w-2xl mx-auto leading-relaxed">
              {loc.description}
            </p>
          </section>

          {/* Delivery Info */}
          <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-stone-100 mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-[#AE343F]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Truck size={24} className="text-[#AE343F]" />
                </div>
                <h3 className="font-semibold text-[#232323] mb-1">
                  {loc.deliveryType}
                </h3>
                <p className="text-sm text-[#232323]/50">{loc.deliveryTime}</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-[#AE343F]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Package size={24} className="text-[#AE343F]" />
                </div>
                <h3 className="font-semibold text-[#232323] mb-1">
                  {loc.deliveryType === "Kurirska dostava"
                    ? "Sigurno upakovano"
                    : "Mi postavljamo"}
                </h3>
                <p className="text-sm text-[#232323]/50">
                  {loc.deliveryType === "Kurirska dostava"
                    ? "telefon i uputstvo stižu sigurno upakovani spremni za korišćenje"
                    : "telefon, a i govornicu ukoliko izaberete Full Service paket"}
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-[#AE343F]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <BadgeCheck size={24} className="text-[#AE343F]" />
                </div>
                <h3 className="font-semibold text-[#232323] mb-1">
                  Besplatan povrat
                </h3>
                <p className="text-sm text-[#232323]/50">
                  {loc.deliveryType === "Kurirska dostava"
                    ? "mi pokrivamo troškove povratne dostave"
                    : "mi dolazimo po opremu i telefon nakon proslave"}
                </p>
              </div>
            </div>
          </section>

          {/* Popular Venues */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#232323] mb-6">
              Popularne lokacije za venčanja u{" "}
              {loc.name === "Niš"
                ? "Nišu"
                : loc.name === "Beograd"
                  ? "Beogradu"
                  : loc.name === "Novi Sad"
                    ? "Novom Sadu"
                    : loc.name === "Kragujevac"
                      ? "Kragujevcu"
                      : loc.name === "Subotica"
                        ? "Subotici"
                        : loc.name}
            </h2>
            <p className="text-[#232323]/50 mb-6">
              HALO Uspomene retro telefon se savršeno uklapa u svaku svečanu
              salu. A evo nekih od popularnih lokacija gde su naši klijenti
              planirali venčanja ili gde smo već imali zadovoljstvo da budemo
              deo proslave:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loc.popularVenues.map((venue) => (
                <div
                  key={venue}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-100"
                >
                  <MapPin size={16} className="text-[#AE343F] shrink-0" />
                  <span className="text-[#232323]/70">{venue}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Local Testimonials */}
          {cityTestimonials.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-serif text-[#232323] mb-6">
                Utisci parova iz{" "}
                {loc.name === "Niš"
                  ? "Niša"
                  : loc.name === "Beograd"
                    ? "Beograda"
                    : loc.name === "Novi Sad"
                      ? "Novog Sada"
                      : loc.name === "Kragujevac"
                        ? "Kragujevca"
                        : loc.name === "Subotica"
                          ? "Subotice"
                          : loc.name}
              </h2>
              <div className="space-y-4">
                {cityTestimonials.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-100"
                  >
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className="text-[#d4af37] fill-[#d4af37]"
                        />
                      ))}
                    </div>
                    <p className="text-[#232323]/70 leading-relaxed mb-4 italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#AE343F]/10 rounded-xl flex items-center justify-center text-[#AE343F] font-bold text-xs">
                        {t.initials}
                      </div>
                      <div>
                        <p className="font-serif font-semibold text-[#232323] text-sm">
                          {t.coupleName}
                        </p>
                        <p className="text-xs text-[#232323]/40">
                          {t.date} — {t.packageType}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Local FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#232323] mb-6">
              Česta pitanja za {loc.name}
            </h2>
            <div className="space-y-3">
              {loc.localFaq.map((faq, index) => (
                <div
                  key={index}
                  className="collapse collapse-arrow bg-white rounded-2xl border border-stone-100"
                >
                  <input type="checkbox" />
                  <div className="collapse-title text-base sm:text-lg font-medium text-[#232323] pr-12">
                    {faq.question}
                  </div>
                  <div className="collapse-content">
                    <p className="text-[#232323]/60 leading-relaxed pt-2">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-[#232323] rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#F5F4DC] mb-4">
              Planirate venčanje u{" "}
              {loc.name === "Niš"
                ? "Nišu"
                : loc.name === "Beograd"
                  ? "Beogradu"
                  : loc.name === "Novi Sad"
                    ? "Novom Sadu"
                    : loc.name === "Kragujevac"
                      ? "Kragujevcu"
                      : loc.name === "Subotica"
                        ? "Subotici"
                        : loc.name}
              ?
            </h2>
            <p className="text-[#F5F4DC]/60 mb-6 max-w-lg mx-auto">
              Rezervišite vaš audio guest book na vreme i sačuvajte glasove sa
              svog venčanja zauvek.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#paketi"
                className="btn btn-outline border-white/20 text-white hover:bg-white hover:text-[#232323] rounded-full px-8"
              >
                Pogledaj pakete
              </Link>
              <Link
                href="/#kontakt"
                className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] rounded-full px-8 border-none"
              >
                Rezervišite termin
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link
              href="/lokacije"
              className="inline-flex items-center gap-2 text-[#232323]/50 hover:text-[#AE343F] transition-colors"
            >
              ← Svi gradovi
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
