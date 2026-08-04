import React from "react";

/**
 * Zaglavlje sekcije — natpis razmaknutih slova, naslov sa opcionim naglašenim
 * delom i podnaslov.
 *
 * Isti blok je ranije bio prepisan 91 put u 23 fajla, sa 10 varijanti H2 i
 * proizvoljnim donjim marginama (`mb-24` u `Concept`-u). Razmak ispod zaglavlja
 * je ovde fiksan — `mb-10 sm:mb-12` — i namerno se ne može podesiti spolja.
 */

type Tone = "svetla" | "tamna";
type Size = "sm" | "md" | "lg";
type Align = "levo" | "centar";

const TITLE_SIZE: Record<Size, string> = {
  sm: "text-2xl sm:text-3xl md:text-4xl",
  md: "text-3xl sm:text-4xl md:text-5xl",
  lg: "text-3xl sm:text-5xl md:text-6xl",
};

const TITLE_TONE: Record<Tone, string> = {
  svetla: "text-[#232323]",
  tamna: "text-[#F5F4DC]",
};

const SUBTITLE_TONE: Record<Tone, string> = {
  svetla: "text-[#232323]/60",
  tamna: "text-[#F5F4DC]/50",
};

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  /** Naglašeni nastavak naslova — kurziv u brend crvenoj. */
  accent?: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: Align;
  as?: "h1" | "h2" | "h3";
  tone?: Tone;
  size?: Size;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  accent,
  subtitle,
  align = "centar",
  as: Heading = "h2",
  tone = "svetla",
  size = "md",
  className = "",
}) => {
  const centered = align === "centar";

  return (
    <div
      className={`mb-10 sm:mb-12 ${centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}
    >
      {eyebrow && (
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F]">
          {eyebrow}
        </p>
      )}
      <Heading
        className={`font-serif leading-tight ${TITLE_SIZE[size]} ${TITLE_TONE[tone]}`}
      >
        {title}
        {accent && (
          <>
            {" "}
            <span className="italic text-[#AE343F]">{accent}</span>
          </>
        )}
      </Heading>
      {subtitle && (
        <p
          className={`mt-5 text-base leading-relaxed sm:text-lg ${SUBTITLE_TONE[tone]} ${centered ? "mx-auto max-w-2xl" : ""}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
