import React from "react";
import Link from "next/link";
import { ArrowRight, PartyPopper } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
import {
  BIRTHDAY_LINKS,
  CORE_PRODUCTS,
  PARTNER_SERVICES,
  type Product,
} from "@/data/products";
import { PRODUCT_ILLUSTRATIONS } from "./product-illustrations";

/**
 * Mreža proizvoda — zamenjuje sedam pojedinačnih prodajnih sekcija.
 *
 * Bez slika, namerno: dvanaest slika odmah ispod Hero-a otima LCP koji Hero
 * već drži. Ikonice iz `lucide` su deo bundle-a i ne prave mrežni zahtev.
 */

function ProductCard({
  product,
  variant,
}: {
  product: Product;
  variant: "nase" | "posredujemo";
}) {
  const partner = variant === "posredujemo";
  const price = product.price?.();
  const priceNote = product.priceNote?.();

  // Autorska ilustracija; `lucide` ikonica iz `products.ts` ostaje kao rezerva
  // da nov proizvod bez ilustracije ne sruši render.
  const Illustration = PRODUCT_ILLUSTRATIONS[product.id];
  const Icon = product.icon;

  return (
    <Card
      href={product.href}
      tone={partner ? "krem" : "bela"}
      padding="md"
      badge={product.badge}
      className="group flex h-full flex-col"
      data-track="cta_click"
      data-track-cta-name={`proizvod_${product.id}`}
      data-track-cta-location="product_grid"
    >
      {/* Ilustracija stoji tamna na sivom i za naše i za posredovane usluge —
          crvena je na ovoj veličini delovala prenapadno. Razliku „naše /
          posredujemo" i dalje nosi ton same kartice (bela naspram krem) i
          naslov iznad grupe, pa se ništa ne gubi. Crvena ostaje na prelaz mišem. */}
      <span
        className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
          partner
            ? "bg-[#232323]/5 text-[#232323]/55 group-hover:bg-[#AE343F]/10 group-hover:text-[#AE343F]"
            : "bg-[#232323]/[0.06] text-[#232323]/70 group-hover:bg-[#AE343F]/10 group-hover:text-[#AE343F]"
        }`}
      >
        {Illustration ? (
          <Illustration className="h-7 w-7" />
        ) : (
          <Icon size={18} />
        )}
      </span>

      <h3 className="font-serif text-base leading-snug text-[#232323] sm:text-lg">
        {product.name}
      </h3>

      {/* Opis se na mobilnom izostavlja — dve kolone, cilj je pregled, ne
          čitanje. Od `sm` naviše ima mesta.

          `line-clamp-2` je osigurač, ne rešenje: opisi su pisani da stanu u dva
          reda, ali prelom zavisi od dužine pojedinačnih reči, pa duža reč na
          užem ekranu ume da gurne treći red i pokvari poravnanje cena u redu.
          `min-h` rezerviše ta dva reda i kada je opis kraći. */}
      <p className="mt-1.5 hidden min-h-[2.75rem] text-sm leading-relaxed text-[#232323]/55 line-clamp-2 sm:block">
        {product.blurb}
      </p>

      <span className="mt-auto flex items-center justify-between gap-2 pt-3">
        <span>
          {price && (
            <span className="block text-sm font-bold tabular-nums text-[#232323]">
              {price}
            </span>
          )}
          {priceNote && (
            <span className="block text-xs text-[#232323]/45">{priceNote}</span>
          )}
        </span>
        <ArrowRight
          size={15}
          className="shrink-0 text-[#AE343F]/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#AE343F]"
        />
      </span>
    </Card>
  );
}

const ProductGrid: React.FC = () => (
  <Section id="proizvodi" tone="krem" size="default" width="siroka">
    <SectionHeader
      eyebrow="Šta nudimo"
      title="Sve za venčanje —"
      accent="izaberite šta vam treba"
      subtitle="Svaki proizvod radi i sam za sebe. Uzmite jedan ili kombinujte — cene su fiksne i vidljive unapred."
    />

    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {CORE_PRODUCTS.map((p) => (
        <ProductCard key={p.id} product={p} variant="nase" />
      ))}
    </div>

    <p className="mt-10 mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#232323]/40">
      Posredujemo za dan venčanja
    </p>
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {PARTNER_SERVICES.map((p) => (
        <ProductCard key={p.id} product={p} variant="posredujemo" />
      ))}
    </div>

    {/* Rođendani — jedan red umesto cele sekcije. */}
    <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white px-5 py-4 sm:flex-row sm:gap-6 sm:px-7">
      <p className="flex items-center gap-3 text-sm text-[#232323]/70">
        <PartyPopper size={18} className="shrink-0 text-[#AE343F]" />
        <span>
          Pravimo i <strong className="font-semibold text-[#232323]">
            rođendanske pozivnice
          </strong>{" "}
          — isti nivo izrade, prilagođen ton i teme.
        </span>
      </p>
      <ul className="flex shrink-0 flex-wrap gap-2">
        {BIRTHDAY_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex rounded-full border border-[#AE343F]/25 px-4 py-1.5 text-xs font-semibold text-[#AE343F] transition-colors hover:bg-[#AE343F] hover:text-[#F5F4DC]"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </Section>
);

export default ProductGrid;
