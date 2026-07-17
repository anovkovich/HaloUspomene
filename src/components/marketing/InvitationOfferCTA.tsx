import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PromoCodeCopy from "./PromoCodeCopy";

/**
 * Guest-facing, theme-aware branding + offer CTA.
 *
 * Shown ONLY after a guest submits their RSVP (the success screen) — never on
 * the paid invitation itself. Every wedding is seen by 50–300 guests; the RSVP
 * confirmation is the one moment where turning a guest into a future customer
 * is welcome rather than intrusive.
 *
 * Layout:
 *  - `inline: false` (default) → a self-contained bordered card.
 *  - `inline: true` → no outer card, just a thin divider + content, so it can
 *    sit INSIDE an existing success card as one unit.
 *
 * Tone (matches the surrounding surface):
 *  - `theme` (default) → uses the classic invitation `--theme-*` vars with
 *    light burgundy fallbacks (classic / birthday / punoletstvo / standalone).
 *  - `onDark` → white text + white button, for dark premium glass surfaces
 *    (Watercolor, Fountain, premium /rsvp).
 *  - `onLight` → dark text + gold button, for light premium surfaces (LineArt).
 *
 * Server component (no interactivity).
 */
type Tone = "theme" | "onDark" | "onLight";

const TONES: Record<
  Tone,
  {
    brand: string;
    headline: string;
    divider: string;
    btnBg: string;
    btnText: string;
    btnShadow: string;
    cardBg: string;
    cardBorder: string;
  }
> = {
  theme: {
    brand: "var(--theme-text-light, #9a8f86)",
    headline: "var(--theme-text, #232323)",
    divider: "var(--theme-border, rgba(35,35,35,0.1))",
    btnBg: "var(--theme-primary, #AE343F)",
    btnText: "#ffffff",
    btnShadow: "var(--theme-shadow, 0 8px 24px rgba(174,52,63,0.18))",
    cardBg: "var(--theme-surface, #ffffff)",
    cardBorder: "1px solid var(--theme-border-light, rgba(35,35,35,0.08))",
  },
  onDark: {
    brand: "rgba(255,255,255,0.55)",
    headline: "#ffffff",
    divider: "rgba(255,255,255,0.18)",
    btnBg: "#ffffff",
    btnText: "#232323",
    btnShadow: "0 8px 24px rgba(0,0,0,0.25)",
    cardBg: "rgba(255,255,255,0.08)",
    cardBorder: "1px solid rgba(255,255,255,0.15)",
  },
  onLight: {
    brand: "#9a8f86",
    headline: "#232323",
    divider: "rgba(35,35,35,0.1)",
    btnBg: "#d4af37",
    btnText: "#ffffff",
    btnShadow: "0 8px 24px rgba(212,175,55,0.25)",
    cardBg: "#ffffff",
    cardBorder: "1px solid rgba(35,35,35,0.08)",
  },
};

export default function InvitationOfferCTA({
  headline = "Svidela vam se pozivnica?",
  inline = false,
  tone = "theme",
  className = "",
  ctaBase = "/izrada-pozivnica-online",
  promoCode,
  promoValidUntil,
}: {
  headline?: string;
  inline?: boolean;
  tone?: Tone;
  className?: string;
  /** Funnel the CTA points at — wedding hub by default, but a birthday /
   *  punoletstvo surface passes its own builder so the offer matches the
   *  guest's celebration. The promo code (if any) is appended as `?promo=`. */
  ctaBase?: string;
  /** Guest-referral promo code (Option A) — shown here + carried on the link. */
  promoCode?: string;
  promoValidUntil?: string;
}) {
  const s = TONES[tone];

  const href = promoCode
    ? `${ctaBase}?promo=${encodeURIComponent(promoCode)}`
    : ctaBase;

  const validUntil = promoValidUntil
    ? new Date(promoValidUntil).toLocaleDateString("sr-Latn-RS", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const content = (
    <>
      <p
        className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] mb-2"
        style={{ color: s.brand }}
      >
        Napravljeno sa HaloUspomene
      </p>
      <p
        className="font-serif text-lg sm:text-xl mb-4"
        style={{ color: s.headline }}
      >
        {headline}
      </p>
      {promoCode && (
        <div
          className="mx-auto mb-4 max-w-xs rounded-xl px-4 py-3"
          style={{ backgroundColor: s.cardBg, border: s.cardBorder }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1"
            style={{ color: s.brand }}
          >
            🎁 Vaš poklon kôd
          </p>
          <PromoCodeCopy code={promoCode} textColor={s.headline} />
          <p className="text-[11px]" style={{ color: s.brand }}>
            Popust na vašu pozivnicu
            {validUntil ? ` — važi do ${validUntil}` : ""}. Automatski se
            primenjuje kad kliknete ispod.
          </p>
        </div>
      )}
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-transform duration-300 hover:scale-[1.03]"
        style={{ backgroundColor: s.btnBg, color: s.btnText, boxShadow: s.btnShadow }}
      >
        {promoCode ? "Napravi svoju uz popust" : "Pogledajte ponudu"}
        <ArrowRight size={15} />
      </Link>
    </>
  );

  if (inline) {
    return (
      <div className={`text-center ${className}`}>
        <div
          className="h-px w-full mb-6"
          style={{ backgroundColor: s.divider }}
        />
        {content}
      </div>
    );
  }

  return (
    <div className={`mx-auto w-full max-w-md px-4 text-center ${className}`}>
      <div
        className="rounded-[var(--theme-radius,1.25rem)] p-6 sm:p-7"
        style={{ backgroundColor: s.cardBg, border: s.cardBorder }}
      >
        {content}
      </div>
    </div>
  );
}
