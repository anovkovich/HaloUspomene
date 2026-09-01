import React from "react";

/**
 * Omot sekcije — jedina tačka na kojoj se određuje vertikalni razmak, ton
 * pozadine i širina sadržaja.
 *
 * TVRDO OGRANIČENJE: renderuje `<section>`, nikad `<div>`.
 * `AnalyticsProvider.tsx` posmatra `document.querySelectorAll("section[id]")`,
 * pa bi svaka zamena elementa tiho ugasila `section_view` događaj — bez greške
 * u build-u i bez vidljive promene u pregledaču.
 */

type Tone = "krem" | "bela" | "tamna";
type Size = "compact" | "default" | "spacious";
type Width = "uska" | "default" | "siroka";

const TONE: Record<Tone, string> = {
  krem: "bg-[#F5F4DC] text-[#232323]",
  bela: "bg-white text-[#232323]",
  tamna: "bg-[#232323] text-[#F5F4DC]",
};

/** Tri imenovane skale umesto četiri nekonzistentne. `spacious` je namenjen
 *  tamnim sekcijama, gde veći vazduh nosi kontrast. */
const SIZE: Record<Size, string> = {
  compact: "py-10 sm:py-12 md:py-14",
  default: "py-14 sm:py-16 md:py-20",
  spacious: "py-16 sm:py-20 md:py-28",
};

const WIDTH: Record<Width, string> = {
  uska: "max-w-3xl",
  default: "max-w-6xl",
  siroka: "max-w-7xl",
};

interface SectionProps {
  id?: string;
  tone?: Tone;
  size?: Size;
  width?: Width;
  /** Klase na samom `<section>` — pozadinski slojevi, `overflow-hidden`… */
  className?: string;
  /** Klase na unutrašnjem kontejneru. */
  containerClassName?: string;
  /** Dekoracija koja ide izvan kontejnera (mrlje, mreže tačaka). */
  backdrop?: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  id,
  tone = "krem",
  size = "default",
  width = "default",
  className = "",
  containerClassName = "",
  backdrop,
  children,
}) => (
  <section
    id={id}
    className={`relative ${TONE[tone]} ${SIZE[size]} ${className}`}
  >
    {backdrop}
    <div
      className={`container relative z-10 mx-auto px-4 ${WIDTH[width]} ${containerClassName}`}
    >
      {children}
    </div>
  </section>
);

export default Section;
