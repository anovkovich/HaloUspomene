"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

/**
 * Freemium (B3): the visually-locked RSVP card shown in a DRAFT preview instead
 * of the working RSVP form. The real gate is the server-side `draft → 403` on
 * the RSVP endpoint — this is the couple-facing "pay to unlock" surface. Shared
 * across classic-styled and premium/birthday invitations; all visual tokens are
 * props so it blends into each theme (hex or CSS `var(--…)`).
 */
export default function PreviewRsvpLock({
  payHref,
  accent,
  ctaBg,
  surface,
  border,
  titleColor,
  mutedColor,
}: {
  payHref: string;
  /** Icon + title accent (theme primary). */
  accent: string;
  /** CTA button background; defaults to `accent`. */
  ctaBg?: string;
  surface: string;
  border: string;
  titleColor: string;
  mutedColor: string;
}) {
  return (
    <div
      className="max-w-xl mx-auto text-center rounded-2xl px-8 py-10"
      style={{ backgroundColor: surface, border: `1px solid ${border}` }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: `color-mix(in srgb, ${accent} 15%, transparent)` }}
      >
        <Lock size={20} style={{ color: accent }} />
      </div>
      <p
        className="font-serif text-xl sm:text-2xl mb-2"
        style={{ color: titleColor }}
      >
        Potvrde se otključavaju objavljivanjem
      </p>
      <p className="text-sm mb-7" style={{ color: mutedColor }}>
        Ovo je pregled vaše pozivnice. Kada je objavite, gosti mogu da potvrde
        dolazak i sve funkcije se aktiviraju.
      </p>
      <Link
        href={payHref}
        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: ctaBg || accent }}
      >
        Plati i otključaj je!
      </Link>
    </div>
  );
}
