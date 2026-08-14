"use client";

import { Lock, QrCode } from "lucide-react";

/**
 * Card for something the client PRINTS — a QR code or an A6 flyer.
 *
 * Sells better than a plain "Saznajte više" row because it shows the artefact
 * the client walks away with, and a locked card names the add-on that unlocks
 * it instead of hiding the feature.
 *
 * Presentation only: props in, JSX out, no data layer. There is a twin inside
 * `src/app/moje-vencanje/OverviewCard.tsx` that this was modelled on; the two
 * were deliberately NOT merged when this one was written, because the wedding
 * portal is live and works, and touching it to satisfy architecture would risk
 * a paying couple's screen for no functional gain. Converging them is optional
 * cleanup, not a prerequisite.
 */
export default function PrintCard({
  title,
  sub,
  formats,
  locked = false,
  lockLabel,
  featured = false,
  note,
  onClick,
}: {
  title: string;
  sub: string;
  formats: string[];
  locked?: boolean;
  /** Names the add-on that unlocks this — shown instead of the formats. */
  lockLabel?: string;
  featured?: boolean;
  /** Extra line under the formats, e.g. when a guest link only opens on the
   *  day of the party. Keeps the client from thinking a code is broken. */
  note?: string;
  onClick: () => void;
}) {
  const accent = featured
    ? "#d4af37"
    : locked
      ? "rgba(35,35,35,0.18)"
      : "var(--theme-primary)";

  return (
    <button
      onClick={onClick}
      className={`relative w-full bg-white rounded-lg shadow-[0_1px_3px_rgba(35,35,35,0.08)] overflow-hidden text-left cursor-pointer hover:shadow-[0_8px_20px_-8px_rgba(35,35,35,0.28)] transition-shadow ${
        featured ? "flex items-center gap-4 p-4" : "p-3.5"
      }`}
    >
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: accent }}
      />
      <div
        className={`rounded border flex items-center justify-center shrink-0 ${featured ? "" : "mb-2.5"}`}
        style={{
          width: featured ? 60 : 48,
          height: featured ? 76 : 60,
          backgroundColor: "#F5F4DC",
          borderColor: "rgba(35,35,35,0.12)",
          filter: locked ? "grayscale(1)" : "none",
        }}
      >
        <QrCode size={featured ? 26 : 20} className="text-[#232323]/70" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`font-serif font-semibold text-[#232323] ${featured ? "text-xl" : "text-base"}`}
        >
          {title}
        </p>
        <p className="text-[12px] text-[#232323]/60 mt-0.5 leading-snug">{sub}</p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {locked ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#d4af37]">
              <Lock size={11} /> {lockLabel}
            </span>
          ) : (
            formats.map((f) => (
              <span
                key={f}
                className="text-[10px] font-semibold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded border border-[#232323]/15 text-[#232323]/55"
              >
                {f}
              </span>
            ))
          )}
        </div>
        {note && !locked && (
          <p className="text-[10px] text-[#232323]/45 mt-1.5 leading-snug">
            {note}
          </p>
        )}
      </div>
    </button>
  );
}
