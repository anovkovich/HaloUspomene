import React from "react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * Četiri koraka izdvojena iz `HowItWorks` (315 linija), koji je prepričavao
 * četiri sekcije iznad sebe — uključujući i ceo cenovnik.
 *
 * `id="proces"` — podnožje već linkuje `/#proces`.
 */

const steps = [
  {
    n: "01",
    t: "Popunite upitnik",
    d: "Imena, datum, lokacija i tema — u šest koraka",
  },
  {
    n: "02",
    t: "Pozivnica je gotova odmah",
    d: "Otključavate je nakon uplate, izmene su moguće do dana venčanja",
  },
  {
    n: "03",
    t: "Podelite sa gostima",
    d: "Pošaljite link ili QR kod — gosti potvrde dolazak online",
  },
  {
    n: "04",
    t: "Rasporedite goste",
    d: "Na dan venčanja svako sam pronalazi svoje mesto",
  },
];

const Process: React.FC = () => (
  <Section
    id="proces"
    tone="tamna"
    size="spacious"
    width="siroka"
    className="overflow-hidden"
    backdrop={
      <>
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #F5F4DC 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute left-1/3 top-0 h-96 w-96 rounded-full bg-[#AE343F]/8 blur-[120px]" />
      </>
    }
  >
    <SectionHeader
      eyebrow="Kako funkcioniše"
      title="Od upitnika do dana venčanja —"
      accent="četiri koraka"
      tone="tamna"
      size="lg"
      align="levo"
    />

    <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s) => (
        <li
          key={s.n}
          className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 transition-colors hover:border-white/25"
        >
          <span className="font-serif text-3xl font-black text-[#AE343F]/60">
            {s.n}
          </span>
          <p className="mt-3 font-semibold text-[#F5F4DC]">{s.t}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[#F5F4DC]/50">
            {s.d}
          </p>
        </li>
      ))}
    </ol>
  </Section>
);

export default Process;
