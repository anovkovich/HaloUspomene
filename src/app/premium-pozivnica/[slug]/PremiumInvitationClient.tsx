"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";
import dynamic from "next/dynamic";

const PremiumEnvelopeLoader = dynamic(
  () => import("./components/PremiumEnvelopeLoader"),
  { ssr: false },
);
const WingEnvelopeLoader = dynamic(
  () => import("./components/WingEnvelopeLoader"),
  { ssr: false },
);
// Theme-specific invitation layouts
const WatercolorInvitation = dynamic(
  () => import("./themes/WatercolorInvitation"),
  { ssr: false },
);
const LineArtInvitation = dynamic(
  () => import("./themes/LineArtInvitation"),
  { ssr: false },
);
const FountainInvitation = dynamic(
  () => import("./themes/FountainInvitation"),
  { ssr: false },
);

const themeComponents = {
  watercolor: WatercolorInvitation,
  line_art: LineArtInvitation,
  fountain: FountainInvitation,
} as const;

interface PremiumInvitationClientProps {
  data: WeddingData;
  slug: string;
}

// Shared theme props type — exported for theme components
export interface ThemeInvitationProps {
  data: WeddingData;
  slug: string;
  bride: string;
  groom: string;
  full_display: string;
  formattedDate: string;
  formattedDateShort: string;
  isPastDeadline: boolean;
  /** True once the envelope loader has finished and the invitation is on
   *  screen. Themes can gate heavy / time-locked animations (e.g. the
   *  fountain doves) behind this so they don't fire while still hidden. */
  isRevealed: boolean;
}

export default function PremiumInvitationClient({
  data,
  slug,
}: PremiumInvitationClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const { bride, groom, full_display } = data.couple_names;

  // On every page load/refresh, jump the user back to the top of the
  // invitation. Otherwise the browser restores their previous scroll
  // position, which mid-page bypasses the envelope-loader reveal.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  const formattedDate = useMemo(() => {
    if (!data.event_date) return "";
    const d = new Date(data.event_date);
    return d.toLocaleDateString(
      data.useCyrillic ? "sr-Cyrl-RS" : "sr-Latn-RS",
      { day: "numeric", month: "long", year: "numeric" },
    );
  }, [data.event_date, data.useCyrillic]);

  const formattedDateShort = useMemo(() => {
    if (!data.event_date) return "";
    const d = new Date(data.event_date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}. ${month}. ${d.getFullYear()}.`;
  }, [data.event_date]);

  const handleEnvelopeComplete = useCallback(() => {
    setIsLoading(false);
    setTimeout(() => setIsRevealed(true), 100);
  }, []);

  const isPastDeadline = useMemo(() => {
    if (!data.submit_until) return false;
    const deadline = new Date(data.submit_until + "T23:59:59");
    return new Date() > deadline;
  }, [data.submit_until]);

  const envelopeProps = {
    onComplete: handleEnvelopeComplete,
    names: full_display,
    eventDate: formattedDate,
    envelopeItems: data.envelope_items,
    theme: data.premium_theme,
  };

  // Shared props for theme components
  const themeProps = {
    data,
    slug,
    bride,
    groom,
    full_display,
    formattedDate,
    formattedDateShort,
    isPastDeadline,
    isRevealed,
  };

  const InvitationTheme =
    (data.premium_theme && themeComponents[data.premium_theme as keyof typeof themeComponents]) ||
    WatercolorInvitation;

  return (
    <>
      {/* Invitation always in DOM — visible behind envelope */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className={`min-h-screen transition-opacity duration-1000 ${
          isRevealed ? "opacity-100" : isLoading ? "opacity-100" : "opacity-0"
        }`}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{
          WebkitUserSelect: "none",
          userSelect: "none",
          WebkitTouchCallout: "none",
        } as React.CSSProperties}
      >
        {/* Global image protection styles */}
        <style>{`
          .premium-protected img {
            -webkit-user-drag: none;
            -khtml-user-drag: none;
            -moz-user-drag: none;
            -o-user-drag: none;
            user-drag: none;
            pointer-events: none;
          }
          .premium-protected img.interactive {
            pointer-events: auto;
          }
        `}</style>
        <div className="premium-protected">
          <InvitationTheme {...themeProps} />
        </div>
      </div>

      {/* Envelope overlay — on top */}
      {isLoading && (
        data.envelope_style === "wing" ? (
          <WingEnvelopeLoader {...envelopeProps} />
        ) : (
          <PremiumEnvelopeLoader {...envelopeProps} />
        )
      )}
    </>
  );
}
