import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Truck, ArrowRight } from "lucide-react";
import { locations } from "@/data/locations";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";

export const metadata: Metadata = {
  title: "Lokacije — Audio Guest Book Dostava u Celoj Srbiji",
  description:
    "HALO Uspomene dostavlja audio guest book za venčanja u Beogradu, Novom Sadu, Nišu, Kragujevcu, Subotici i celoj Srbiji. Saznajte detalje o dostavi za vaš grad.",
  alternates: {
    canonical: "/lokacije",
  },
};

export default function LocationsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#faf9f6] pt-28 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <Breadcrumbs
              items={[{ label: "Početna", href: "/" }, { label: "Lokacije" }]}
            />
          </div>

          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
              Dostava širom Srbije
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
              Audio Guest Book u Vašem Gradu
            </h1>
            <p className="text-lg text-[#232323]/50 max-w-2xl mx-auto">
              HALO Uspomene pokriva celu Srbiju. Bez obzira da li je vaše
              venčanje u Beogradu, Novom Sadu, Nišu ili bilo kom drugom gradu —
              mi smo tu za vas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {locations.map((loc) => (
              <Link
                key={loc.slug}
                href={`/lokacije/${loc.slug}`}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-100 hover:shadow-lg transition-shadow duration-300 group flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#AE343F]/10 rounded-2xl flex items-center justify-center">
                    <MapPin size={24} className="text-[#AE343F]" />
                  </div>
                  <span className="px-3 py-1 bg-[#faf9f6] rounded-full text-xs font-medium text-[#232323]/50">
                    {loc.region}
                  </span>
                </div>

                <h2 className="text-2xl font-serif font-semibold text-[#232323] mb-2 group-hover:text-[#AE343F] transition-colors">
                  {loc.name}
                </h2>

                <p className="text-[#232323]/50 text-sm leading-relaxed mb-4 flex-1">
                  {loc.shortDescription}
                </p>

                <div className="flex items-center gap-4 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#232323]/60">
                    <Truck size={14} />
                    {loc.deliveryType}
                  </span>
                  <span className="text-xs text-[#232323]/40">
                    {loc.deliveryType === "Lična dostava"
                      ? "po dogovoru"
                      : loc.deliveryTime}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#AE343F] group-hover:gap-3 transition-all">
                  Saznaj više
                  <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16 sm:mt-20">
            <div className="bg-[#232323] rounded-3xl p-8 sm:p-12 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-serif text-[#F5F4DC] mb-4">
                Vaš grad nije na listi?
              </h2>
              <p className="text-[#F5F4DC]/60 mb-6">
                Bez brige — HALO Uspomene pokriva celu Srbiju kurirskom
                dostavom. Kontaktirajte nas sa lokacijom venčanja i pripremićemo
                sve za vas.
              </p>
              <Link
                href="/#kontakt"
                className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] rounded-full px-10 border-none"
              >
                Kontaktirajte nas
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
