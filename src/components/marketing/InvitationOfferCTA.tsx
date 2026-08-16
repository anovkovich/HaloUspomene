import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDatumGenitiv } from "@/lib/datum";
import PromoCodeCopy from "./PromoCodeCopy";
import InstagramFollowLink from "./InstagramFollowLink";

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
 * NOT a server component in practice: every caller is a `"use client"` form, so
 * this lands in the client bundle. Keep node-only imports (crypto, mongodb, and
 * therefore `@/lib/payments/promo`) OUT of it — the discount percentage below is
 * duplicated by hand for exactly that reason.
 */
type Tone = "theme" | "onDark" | "onLight";

/** MORA pratiti `PROMO_PERCENT` iz `src/lib/payments/promo.ts`. Ne uvozi se
 *  odande jer taj modul vuče node `crypto`, a ova komponenta ide u klijentski
 *  bandl. Promeni li se popust, promeni ga i ovde. */
const PROMO_PERCENT_UI = 10;

const TONES: Record<
  Tone,
  {
    brand: string;
    headline: string;
    /** Podnaslov + sitan tekst u kuponu — čitljiviji od `brand`. */
    muted: string;
    divider: string;
    btnBg: string;
    btnText: string;
    btnShadow: string;
    cardBg: string;
    cardBorder: string;
    /** Isprekidana ivica poklon-kupona — ista boja kao primarno dugme. */
    couponBorder: string;
    /** Sekundarno "ghost" Instagram dugme — tekst + ivica. */
    igText: string;
    igBorder: string;
  }
> = {
  theme: {
    brand: "var(--theme-text-light, #9a8f86)",
    headline: "var(--theme-text, #232323)",
    muted: "var(--theme-text-muted, #6b6560)",
    divider: "var(--theme-border, rgba(35,35,35,0.1))",
    btnBg: "var(--theme-primary, #AE343F)",
    btnText: "#ffffff",
    btnShadow: "var(--theme-shadow, 0 8px 24px rgba(174,52,63,0.18))",
    cardBg: "var(--theme-surface, #ffffff)",
    cardBorder: "1px solid var(--theme-border-light, rgba(35,35,35,0.08))",
    couponBorder: "var(--theme-primary, #AE343F)",
    igText: "var(--theme-text, #232323)",
    igBorder: "var(--theme-border, rgba(35,35,35,0.18))",
  },
  onDark: {
    brand: "rgba(255,255,255,0.55)",
    headline: "#ffffff",
    muted: "rgba(255,255,255,0.7)",
    divider: "rgba(255,255,255,0.18)",
    btnBg: "#ffffff",
    btnText: "#232323",
    btnShadow: "0 8px 24px rgba(0,0,0,0.25)",
    cardBg: "rgba(255,255,255,0.08)",
    cardBorder: "1px solid rgba(255,255,255,0.15)",
    couponBorder: "rgba(255,255,255,0.45)",
    igText: "rgba(255,255,255,0.85)",
    igBorder: "rgba(255,255,255,0.35)",
  },
  onLight: {
    brand: "#9a8f86",
    headline: "#232323",
    muted: "#6b6560",
    divider: "rgba(35,35,35,0.1)",
    btnBg: "#d4af37",
    btnText: "#ffffff",
    btnShadow: "0 8px 24px rgba(212,175,55,0.25)",
    cardBg: "#ffffff",
    cardBorder: "1px solid rgba(35,35,35,0.08)",
    couponBorder: "#d4af37",
    igText: "#232323",
    igBorder: "rgba(35,35,35,0.2)",
  },
};

export default function InvitationOfferCTA({
  headline = "Svidela vam se pozivnica?",
  subline = "Napravite ovakvu i za svoju proslavu — gotova je odmah.",
  inline = false,
  tone = "theme",
  className = "",
  ctaBase = "/izrada-pozivnica-online",
  promoCode,
  promoValidUntil,
}: {
  headline?: string;
  /** Jedna linija vrednosti ispod naslova; `null` je sakriva. */
  subline?: string | null;
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

  // Genitiv, sa tačkom koja zatvara rečenicu — zato datum ide na kraj rečenice.
  const validUntil = formatDatumGenitiv(promoValidUntil);

  const content = (
    <>
      <div className="animate-[hu-offer-in_0.5s_ease-out_0.35s_both]">
        <p
          className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] mb-2"
          style={{ color: s.brand }}
        >
          Napravljeno sa HaloUspomene
        </p>
        <p
          className="font-serif text-lg sm:text-xl mb-1"
          style={{ color: s.headline }}
        >
          {headline}
        </p>
        {subline && (
          <p className="text-[13px] leading-relaxed" style={{ color: s.muted }}>
            {subline}
          </p>
        )}
      </div>

      {promoCode && (
        <div
          className="mx-auto mt-6 mb-5 max-w-xs rounded-xl px-4 pb-3 animate-[hu-offer-in_0.5s_ease-out_0.5s_both]"
          style={{
            backgroundColor: s.cardBg,
            border: `1.5px dashed ${s.couponBorder}`,
          }}
        >
          {/* Bedž preseca gornju ivicu kupona — nosi konkretnu vrednost. */}
          <div className="flex justify-center -mt-3 mb-2">
            <span
              className="whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] animate-[hu-badge-pop_0.4s_ease-out_0.85s_both]"
              style={{
                backgroundColor: s.btnBg,
                color: s.btnText,
                boxShadow: s.btnShadow,
              }}
            >
              🎁 Poklon −{PROMO_PERCENT_UI}%
            </span>
          </div>
          <PromoCodeCopy code={promoCode} textColor={s.headline} />
          <p className="text-[11px] leading-relaxed" style={{ color: s.muted }}>
            Sačuvajte kôd
            {validUntil ? ` — važi do ${validUntil}` : " za svoju proslavu."}{" "}
            Primenjuje se sam kad kliknete ispod.
          </p>
        </div>
      )}

      <div
        className={`animate-[hu-offer-in_0.5s_ease-out_0.65s_both] ${promoCode ? "" : "mt-5"}`}
      >
        <Link
          href={href}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-transform duration-300 hover:scale-[1.03]"
          style={{
            backgroundColor: s.btnBg,
            color: s.btnText,
            boxShadow: s.btnShadow,
          }}
        >
          {promoCode
            ? `Napravite svoju uz ${PROMO_PERCENT_UI}% popusta`
            : "Pogledajte ponudu"}
          <ArrowRight size={15} />
        </Link>
        <InstagramFollowLink
          code={promoCode}
          textColor={s.igText}
          borderColor={s.igBorder}
          mutedColor={s.brand}
        />
      </div>

      <style>{`
        @keyframes hu-offer-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hu-badge-pop {
          0% { opacity: 0; transform: scale(0.6); }
          60% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="hu-offer-in"], [class*="hu-badge-pop"] { animation: none !important; }
        }
      `}</style>
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
