import React from "react";
import Link from "next/link";

/**
 * Kartica — zamena za 25 ručno pisanih varijanti istog bloka.
 *
 * Kada je prosleđen `href`, cela kartica postaje `<Link>` (a ne samo naslov u
 * njoj), pa je površina za klik na mobilnom telefonu cela kartica.
 */

type Tone = "bela" | "krem" | "tamna" | "obris";
type Padding = "sm" | "md" | "lg";

const TONE: Record<Tone, string> = {
  bela: "bg-white border border-stone-200",
  krem: "bg-[#F5F4DC]/60 border border-[#AE343F]/10",
  tamna: "bg-white/[0.07] border border-white/10",
  obris: "bg-transparent border border-[#232323]/10",
};

/** Ton naglašene ivice pri prelasku mišem — zavisi od pozadine kartice. */
const HOVER: Record<Tone, string> = {
  bela: "hover:border-[#AE343F]/40 hover:shadow-xl hover:shadow-[#AE343F]/10",
  krem: "hover:border-[#AE343F]/30 hover:bg-[#F5F4DC]",
  tamna: "hover:border-white/25 hover:bg-white/[0.1]",
  obris: "hover:border-[#AE343F]/40 hover:bg-white",
};

const PADDING: Record<Padding, string> = {
  sm: "p-4 sm:p-5",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

interface CardProps {
  /** Element kada nema `href`. Podrazumevano `div`. */
  as?: "div" | "li" | "article";
  href?: string;
  tone?: Tone;
  padding?: Padding;
  /** Dodaje prelaz i naglašenu ivicu pri prelasku mišem. `href` ga podrazumeva. */
  interactive?: boolean;
  /** Zlatni prsten — koristi se štedljivo, za jednu istaknutu karticu. */
  highlight?: boolean;
  badge?: string;
  className?: string;
  children: React.ReactNode;
  /** Prosleđuje se na koren kartice kada je `href` prisutan. */
  "data-track"?: string;
  "data-track-cta-name"?: string;
  "data-track-cta-location"?: string;
}

const Card: React.FC<CardProps> = ({
  as: Element = "div",
  href,
  tone = "bela",
  padding = "md",
  interactive,
  highlight,
  badge,
  className = "",
  children,
  ...rest
}) => {
  const clickable = interactive ?? Boolean(href);

  const classes = [
    "relative rounded-2xl sm:rounded-3xl",
    TONE[tone],
    PADDING[padding],
    clickable ? `transition-all duration-300 ${HOVER[tone]}` : "",
    highlight ? "ring-2 ring-[#d4af37]/50" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {badge && (
        // `tracking-wide` a ne `widest`, i 9px: duži natpis („Najčešće u
        // paketu") inače prelije usku karticu u dvokolonskoj mreži na telefonu.
        <span className="absolute -top-2.5 right-3 max-w-[calc(100%-1.5rem)] whitespace-nowrap rounded-full bg-[#AE343F] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#F5F4DC]">
          {badge}
        </span>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`block ${classes}`} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <Element className={classes} {...rest}>
      {content}
    </Element>
  );
};

export default Card;
