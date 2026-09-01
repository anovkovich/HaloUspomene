"use client";

import React, { useState, useMemo } from "react";
import type { PublicVendor } from "@/lib/vendors";
import type { VendorCategory } from "@/app/moje-vencanje/types";
import { CITIES } from "@/app/moje-vencanje/vendor-constants";
import { CITY_SLUGS } from "@/data/vendori/categories";
import { PublicVendorCard } from "../PublicVendorCard";
import TeaserDrawer from "../TeaserDrawer";
import { categoryIcon } from "@/lib/vendor-icons";

type CityName = (typeof CITIES)[number];

interface Props {
  vendors: PublicVendor[];
  category: VendorCategory;
  categoryLabel: string;
  cityIntros: Partial<Record<CityName, string>>;
}

function groupByCity(vendors: PublicVendor[]): Record<string, PublicVendor[]> {
  const out: Record<string, PublicVendor[]> = {};
  for (const v of vendors) {
    if (!out[v.city]) out[v.city] = [];
    out[v.city].push(v);
  }
  return out;
}

export default function VendorListClient({
  vendors,
  category,
  categoryLabel,
  cityIntros,
}: Props) {
  const [selected, setSelected] = useState<PublicVendor | null>(null);

  const grouped = useMemo(() => groupByCity(vendors), [vendors]);
  const icon = useMemo(() => categoryIcon(category, 18), [category]);
  const drawerIcon = useMemo(() => categoryIcon(category, 20), [category]);

  // Render cities in canonical order; only those with vendors
  const cityOrder = CITIES.filter((c) => grouped[c]?.length > 0);
  const otherCities = Object.keys(grouped).filter(
    (c) => !CITIES.includes(c as CityName),
  );

  return (
    <>
      {cityOrder.length === 0 && otherCities.length === 0 && (
        <p className="text-center text-[#232323]/60 italic py-12">
          Trenutno nemamo vendore u ovoj kategoriji.
        </p>
      )}

      {cityOrder.map((city) => {
        const cityVendors = grouped[city];
        const intro = cityIntros[city as CityName];
        return (
          <section
            key={city}
            id={CITY_SLUGS[city as CityName]}
            className="mb-12 scroll-mt-24"
          >
            <h2 className="font-serif text-2xl text-[#232323] mb-3">
              {categoryLabel} u {cityLocative(city)}
            </h2>
            {intro && (
              <p className="text-sm text-[#232323]/70 leading-relaxed mb-5 max-w-3xl">
                {intro}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cityVendors.map((v) => (
                <PublicVendorCard
                  key={v.id}
                  name={v.name}
                  city={v.city}
                  categoryIcon={icon}
                  onSelect={() => setSelected(v)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {otherCities.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-[#232323] mb-3">
            {categoryLabel} u ostalim mestima
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherCities.flatMap((c) =>
              grouped[c].map((v) => (
                <PublicVendorCard
                  key={v.id}
                  name={v.name}
                  city={v.city}
                  categoryIcon={icon}
                  onSelect={() => setSelected(v)}
                />
              )),
            )}
          </div>
        </section>
      )}

      <TeaserDrawer
        vendor={selected}
        categoryLabel={categoryLabel}
        categoryIcon={drawerIcon}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

// Serbian locative case for in-page H2 ("u Beogradu", "u Novom Sadu", ...)
function cityLocative(city: string): string {
  switch (city) {
    case "Beograd":
      return "Beogradu";
    case "Novi Sad":
      return "Novom Sadu";
    case "Subotica":
      return "Subotici";
    case "Čačak":
      return "Čačku";
    case "Kragujevac":
      return "Kragujevcu";
    case "Niš":
      return "Nišu";
    default:
      return city;
  }
}
