import React from "react";
import { Check } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
import CtaButton from "@/components/ui/CtaButton";
import {
  formatPrice,
  getKompletnoSavings,
  getPremiumTierSavings,
  getTier,
} from "@/data/pricing";

/**
 * Sažetak paketa — puna tabela ostaje na `/cene`.
 *
 * `id="paketi"` je ovde iz konkretnog razloga: `/#paketi` je bio POKVAREN
 * link u produkciji. `src/app/cene/PricingClient.tsx` i svih šest gradskih
 * stranica vode na njega, ali je taj `id` postojao samo u `Packages.tsx` —
 * komponenti koja se nigde nije renderovala, pa su svi ti linkovi slali
 * posetioca na vrh početne bez ikakvog pomeranja.
 */

const tiers = [
  {
    id: "osnovno" as const,
    tagline: "Website pozivnica sa potvrdama dolaska i PDF-om za štampu",
    savings: 0,
  },
  {
    id: "kompletno" as const,
    tagline: "Pozivnica, raspored sedenja i audio knjiga utisaka",
    savings: getKompletnoSavings(),
    highlight: true,
  },
  {
    id: "premium" as const,
    tagline: "Sve iz kompletnog paketa plus QR galerija slika",
    savings: getPremiumTierSavings(),
  },
];

const PriceStrip: React.FC = () => (
  <Section id="paketi" tone="krem" size="default" width="siroka">
    <SectionHeader
      eyebrow="Paketi"
      title="Fiksne cene,"
      accent="bez skrivenih troškova"
      subtitle="Tri paketa pokrivaju najveći broj venčanja. Svaki proizvod možete uzeti i pojedinačno."
    />

    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
      {tiers.map((t) => {
        const tier = getTier(t.id);
        if (!tier) return null;

        return (
          <Card
            key={t.id}
            tone="bela"
            padding="lg"
            highlight={t.highlight}
            className="flex flex-col"
          >
            {t.highlight && (
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37]">
                Najčešći izbor
              </p>
            )}
            <h3 className="font-serif text-xl text-[#232323]">{tier.label}</h3>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[#232323]/55">
              {t.tagline}
            </p>

            <p className="mt-5 font-serif text-3xl font-bold tabular-nums text-[#232323]">
              {formatPrice(tier.price)}
            </p>
            {t.savings > 0 && (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <Check size={13} strokeWidth={3} />
                uštedite {formatPrice(t.savings)}
              </p>
            )}
          </Card>
        );
      })}
    </div>

    <div className="mt-8 text-center">
      <CtaButton
        href="/cene"
        variant="primary"
        size="lg"
        track={{ name: "sve_cene", location: "price_strip" }}
      >
        Uporedite sve pakete
      </CtaButton>
    </div>
  </Section>
);

export default PriceStrip;
