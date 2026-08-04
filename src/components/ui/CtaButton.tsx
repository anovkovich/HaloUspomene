import React from "react";
import Link from "next/link";

/**
 * Dugme poziva na akciju — zamena za 20 ručno pisanih varijanti.
 *
 * DVA TVRDA OGRANIČENJA:
 *
 * 1. `track` se prevodi u `data-track` / `data-track-cta-name` /
 *    `data-track-cta-location`. `AnalyticsProvider.tsx` hvata klik delegacijom
 *    na `[data-track]`; bez tih atributa `cta_click` tiho nestaje.
 * 2. NE koristi DaisyUI klasu `btn`. Do sada je pola dugmadi bilo `btn btn-lg`,
 *    a pola ručno `px-8 py-4` — `btn` nosi sopstveni reset visine i tipografije,
 *    pa su dva ista dugmeta izgledala isto na desktopu i različito na mobilnom.
 *    Sve mere su ovde eksplicitne.
 */

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "sm" | "md" | "lg";
type Tone = "svetla" | "tamna";

const SIZE: Record<Size, string> = {
  sm: "px-5 py-2.5 text-xs",
  md: "px-7 py-3 text-sm",
  lg: "px-9 py-4 text-sm sm:px-12",
};

/** `secondary` i `ghost` menjaju boju u zavisnosti od pozadine sekcije. */
function variantClasses(variant: Variant, tone: Tone): string {
  switch (variant) {
    case "primary":
      return "bg-[#AE343F] text-[#F5F4DC] shadow-xl shadow-[#AE343F]/25 hover:bg-[#8A2A32]";
    case "gold":
      return "bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/30";
    case "secondary":
      return tone === "tamna"
        ? "border border-[#F5F4DC]/25 text-[#F5F4DC] hover:bg-[#F5F4DC] hover:text-[#232323]"
        : "border border-[#232323]/20 text-[#232323] hover:border-[#232323] hover:bg-[#232323] hover:text-[#F5F4DC]";
    case "ghost":
      return tone === "tamna"
        ? "text-[#F5F4DC]/70 hover:text-[#F5F4DC]"
        : "text-[#232323]/70 hover:text-[#AE343F]";
  }
}

interface CtaButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  tone?: Tone;
  icon?: React.ReactNode;
  /** Ikonica ispred teksta umesto iza njega. */
  iconLeading?: boolean;
  fullWidth?: boolean;
  track?: { name: string; location: string };
  className?: string;
  children: React.ReactNode;
}

const CtaButton: React.FC<CtaButtonProps> = ({
  href,
  variant = "primary",
  size = "md",
  tone = "svetla",
  icon,
  iconLeading = false,
  fullWidth = false,
  track,
  className = "",
  children,
}) => {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.12em] transition-all duration-300",
    SIZE[size],
    variantClasses(variant, tone),
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const trackAttrs = track
    ? {
        "data-track": "cta_click",
        "data-track-cta-name": track.name,
        "data-track-cta-location": track.location,
      }
    : {};

  const body = (
    <>
      {iconLeading && icon}
      {children}
      {!iconLeading && icon}
    </>
  );

  // Spoljne adrese i mailto/tel ne prolaze kroz `next/link`.
  if (/^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={classes}
        {...trackAttrs}
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...trackAttrs}>
      {body}
    </Link>
  );
};

export default CtaButton;
