"use client";

import Link from "next/link";
import { Lock, Images, Armchair, ImagePlus, UtensilsCrossed, Sparkles } from "lucide-react";
import type { UpsellFeature, UpsellMeta } from "./config";

/**
 * Full-tab teaser for a feature the client hasn't bought yet.
 *
 * Deliberately visible-but-locked rather than hidden: the portal is opened
 * repeatedly in the weeks before the party, and each visit is the only chance
 * this client has to learn the add-on exists.
 */
export default function LockedTab({
  feature,
  meta,
}: {
  feature: UpsellFeature;
  meta: UpsellMeta;
}) {
  const Icon =
    feature === "galerija"
      ? Images
      : feature === "slike"
        ? ImagePlus
        : feature === "meni"
          ? UtensilsCrossed
          : Armchair;

  return (
    <div className="flex-1 flex items-start justify-center py-6">
      <div className="max-w-md w-full text-center">
        <div
          className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center relative"
          style={{ backgroundColor: "var(--theme-primary-muted)" }}
        >
          <Icon size={26} style={{ color: "var(--theme-primary)" }} />
          <span
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1px solid var(--theme-border-light)",
            }}
          >
            <Lock size={11} style={{ color: "var(--theme-text-muted)" }} />
          </span>
        </div>

        <h2
          className="text-xl font-bold mb-3"
          style={{
            color: "var(--theme-text)",
            fontFamily: "var(--theme-display-font)",
          }}
        >
          {meta.title}
        </h2>

        <p
          className="text-sm leading-relaxed mb-3"
          style={{ color: "var(--theme-text-muted)" }}
        >
          {meta.what}
        </p>

        <p
          className="text-sm italic leading-relaxed mb-6"
          style={{ color: "var(--theme-text-light)" }}
        >
          {meta.why}
        </p>

        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: "var(--theme-surface)",
            border: "1px solid var(--theme-border-light)",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={15} style={{ color: "var(--theme-primary)" }} />
            <span
              className="text-sm font-bold"
              style={{ color: "var(--theme-text)" }}
            >
              {meta.priceLabel}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href={meta.ctaHref}
              className="inline-flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--theme-primary)" }}
            >
              {meta.ctaLabel}
            </Link>
            {meta.ctaSecondaryHref && meta.ctaSecondaryLabel && (
              <Link
                href={meta.ctaSecondaryHref}
                className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--theme-primary)",
                  border: "1px solid var(--theme-primary)",
                }}
              >
                {meta.ctaSecondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
