"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";
import dynamic from "next/dynamic";
import BackgroundMusicPlayer, {
  type BackgroundMusicHandle,
} from "@/components/BackgroundMusicPlayer";

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
  formattedSubmitUntil: string;
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

  const musicEnabled = !!(data.paid_for_music && data.music_url);
  const musicRef = useRef<BackgroundMusicHandle>(null);

  // Tap on the envelope = the user gesture. Use it to unlock + buffer the song
  // (parked at 0) so it can start instantly, from the top, at the reveal.
  const handleEnvelopeTap = useCallback(() => {
    musicRef.current?.unlock();
  }, []);

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

  // Non-Serbian couples (phone_country != RS) get numeric month rendering
  // so the date reads as native in BA/HR/ME formatting conventions. We
  // prefer the explicit `phone_country` flag but fall back to the phone
  // prefix so legacy records (pre-bypass-token feature) still detect
  // correctly. BA = +387, HR = +385, ME = +382.
  const useNumericMonths = (() => {
    if (data.useCyrillic) return false;
    if (data.phone_country && data.phone_country !== "RS") return true;
    if (data.phone_country === "RS") return false;
    const primaryPhone = (data.contact_phone || "").split(",")[0]?.trim() ?? "";
    return /^\+(387|385|382)/.test(primaryPhone);
  })();

  const formattedDate = useMemo(() => {
    if (!data.event_date) return "";
    const d = new Date(data.event_date);
    if (useNumericMonths) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      return `${day}. ${month}. ${d.getFullYear()}.`;
    }
    return d.toLocaleDateString(
      data.useCyrillic ? "sr-Cyrl-RS" : "sr-Latn-RS",
      { day: "numeric", month: "long", year: "numeric" },
    );
  }, [data.event_date, data.useCyrillic, useNumericMonths]);

  const formattedDateShort = useMemo(() => {
    if (!data.event_date) return "";
    const d = new Date(data.event_date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}. ${month}. ${d.getFullYear()}.`;
  }, [data.event_date]);

  const formattedSubmitUntil = useMemo(() => {
    if (!data.submit_until) return "";
    const d = new Date(data.submit_until + "T00:00:00");
    if (isNaN(d.getTime())) return "";
    if (useNumericMonths) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      return `${day}. ${month}. ${d.getFullYear()}.`;
    }
    return d.toLocaleDateString(
      data.useCyrillic ? "sr-Cyrl-RS" : "sr-Latn-RS",
      { day: "numeric", month: "long", year: "numeric" },
    );
  }, [data.submit_until, data.useCyrillic, useNumericMonths]);

  const handleEnvelopeComplete = useCallback(() => {
    setIsLoading(false);
    setTimeout(() => setIsRevealed(true), 100);
    // Start the music exactly at the reveal, from the top, with a fade-in —
    // already unlocked/buffered by the tap, so there's no fetch delay.
    musicRef.current?.reveal();
  }, []);

  const isPastDeadline = useMemo(() => {
    if (!data.submit_until) return false;
    const deadline = new Date(data.submit_until + "T23:59:59");
    return new Date() > deadline;
  }, [data.submit_until]);

  const envelopeProps = {
    onComplete: handleEnvelopeComplete,
    onTap: handleEnvelopeTap,
    names: full_display,
    eventDate: formattedDate,
    envelopeItems: data.envelope_items,
    theme: data.premium_theme,
    requireTap: musicEnabled,
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
    formattedSubmitUntil,
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

      {/* Background music — gold accent on premium. Mounted from the start (so
          the envelope tap can unlock + buffer it) and driven imperatively:
          unlock() on tap, reveal() at the open. The button sits behind the
          envelope (higher z-index) so it doesn't peek out before the reveal. */}
      {musicEnabled && (
        <BackgroundMusicPlayer
          ref={musicRef}
          controlled
          src={data.music_url!}
          accentHex="#d4af37"
        />
      )}
    </>
  );
}
