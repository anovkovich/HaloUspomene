"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { type ActiveView, LOCKED_FEATURE_INFO } from "./nav-items";

interface LockedFeatureCardProps {
  view: ActiveView;
  /** Overrides the default "packages" upsell — used by a standalone gallery
   *  buyer who hasn't paid yet, where the one thing to do is pay for it. */
  ctaHref?: string;
  ctaLabel?: string;
  ctaNote?: string;
}

export default function LockedFeatureCard({
  view,
  ctaHref = "/cene",
  ctaLabel = "Pogledajte pakete",
  ctaNote,
}: LockedFeatureCardProps) {
  const info = LOCKED_FEATURE_INFO[view];

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#AE343F]/10 flex items-center justify-center">
          <Lock size={28} className="text-[#AE343F]/60" />
        </div>

        <h2 className="text-xl font-serif text-[#232323] mb-3">{info.title}</h2>

        <p className="text-sm text-[#232323]/70 leading-relaxed mb-8">
          {info.description}
        </p>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F5F4DC] to-[#F5F4DC]/50 border border-[#232323]/10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#d4af37]" />
            <span className="text-sm font-medium text-[#232323]">
              {ctaNote ? "Još samo jedan korak" : "Dostupno uz naše pakete pozivnica"}
            </span>
          </div>

          <p className="text-xs text-[#232323]/60 mb-4">
            {ctaNote ??
              "Ove funkcije dolaze uz digitalnu pozivnicu — potvrde dolaska, planer venčanja, audio knjiga, i još mnogo toga."}
          </p>

          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
