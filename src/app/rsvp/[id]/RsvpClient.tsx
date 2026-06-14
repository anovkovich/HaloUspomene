"use client";

import React from "react";
import { Heart } from "lucide-react";
import { ThemeProvider } from "@/app/pozivnica/[slug]/components/ThemeProvider";
import { RSVPForm } from "@/app/pozivnica/[slug]/components/RSVPFrom";
import { BirthdayRSVPForm } from "@/app/deciji-rodjendan/[slug]/components/BirthdayRSVPForm";
import StandaloneRSVPForm from "./StandaloneRSVPForm";
import PremiumRsvpForm from "./PremiumRsvpForm";
import type {
  ThemeType,
  ScriptFontType,
  PremiumThemeType,
} from "@/app/pozivnica/[slug]/types";

interface BaseProps {
  slug: string;
  title: string;
  subtitle: string;
  eventDate: string;
  submitUntil: string;
}

interface CoupleSpecific {
  theme: ThemeType;
  scriptFont: ScriptFontType;
  useCyrillic: boolean;
  callNumbers?: string[];
}

interface ClassicProps extends BaseProps, CoupleSpecific {
  kind: "classic";
}

interface PremiumProps extends BaseProps, CoupleSpecific {
  kind: "premium";
  premiumTheme?: PremiumThemeType;
}

interface BirthdayProps extends BaseProps {
  kind: "birthday";
  gender: "boy" | "girl" | "neutral";
}

interface StandaloneProps extends BaseProps {
  kind: "standalone";
}

type Props = ClassicProps | PremiumProps | BirthdayProps | StandaloneProps;

const NEUTRAL_VARS: Record<string, string> = {
  "--theme-background": "#F5F4DC",
  "--theme-surface": "#ffffff",
  "--theme-primary": "#AE343F",
  "--theme-primary-muted": "rgba(174,52,63,0.1)",
  "--theme-text": "#232323",
  "--theme-text-muted": "rgba(35,35,35,0.75)",
  "--theme-text-light": "rgba(35,35,35,0.55)",
  "--theme-border-light": "rgba(35,35,35,0.15)",
  "--theme-border": "rgba(35,35,35,0.25)",
  "--theme-shadow": "0 4px 20px rgba(0,0,0,0.05)",
  "--theme-radius": "16px",
  "--theme-display-font": "var(--font-great-vibes)",
};

const MONTHS_LATIN = [
  "januar", "februar", "mart", "april", "maj", "jun",
  "jul", "avgust", "septembar", "oktobar", "novembar", "decembar",
];
const MONTHS_CYRILLIC = [
  "јануар", "фебруар", "март", "април", "мај", "јун",
  "јул", "август", "септембар", "октобар", "новембар", "децембар",
];

function formatPhone(raw: string): string {
  const match = raw.replace(/\s+/g, "").match(/^\+381(\d{2})(\d{3})(\d+)$/);
  if (match) return `+381 ${match[1]} ${match[2]} ${match[3]}`;
  return raw;
}

function formatDate(iso: string, cyrillic: boolean): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const months = cyrillic ? MONTHS_CYRILLIC : MONTHS_LATIN;
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}.`;
}

/* ── Premium luxe RSVP layout — dark, immersive, gold (matches the Watercolor
   invitation's "Potvrda dolaska"). Rendered inside ThemeProvider only for the
   script display font; all colors are hardcoded gold/cream on a warm dark base. */
const PREMIUM_GOLD = "#d4af37";
const PREMIUM_GOLD_LIGHT = "#f5d77e";

function PremiumRsvpLayout({
  title,
  subtitle,
  formattedDate,
  cyrillic,
  callNumbers,
  children,
}: {
  title: string;
  subtitle: string;
  formattedDate: string | null;
  cyrillic: boolean;
  callNumbers: string[];
  children: React.ReactNode;
}) {
  const wordmark = cyrillic ? "ПОТВРДА ДОЛАСКА" : "POTVRDA DOLASKA";
  const diamond = (size: number, opacity = 1) => (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        background: PREMIUM_GOLD,
        opacity,
        transform: "rotate(45deg)",
        borderRadius: 1,
      }}
    />
  );
  const line = (
    <span
      className="inline-block h-px w-10"
      style={{ background: PREMIUM_GOLD, opacity: 0.55 }}
    />
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 130% 100% at 50% 18%, #4a3b2a 0%, #342819 55%, #241c12 100%)",
      }}
    >
      {/* Page-corner gold diamonds */}
      <span className="absolute top-5 left-5">{diamond(12, 0.6)}</span>
      <span className="absolute top-5 right-5">{diamond(12, 0.6)}</span>
      <span className="absolute bottom-5 left-5">{diamond(12, 0.6)}</span>
      <span className="absolute bottom-5 right-5">{diamond(12, 0.6)}</span>

      <div className="w-full max-w-lg relative">
        {/* Header */}
        <div className="text-center mb-9">
          <div className="flex items-center justify-center gap-3 mb-6">
            {diamond(5, 0.85)}
            {line}
            <span
              className="text-[11px] uppercase tracking-[0.35em]"
              style={{ color: PREMIUM_GOLD }}
            >
              {wordmark}
            </span>
            {line}
            {diamond(5, 0.85)}
          </div>

          <h1
            className="leading-[1.05]"
            style={{
              fontFamily: "var(--theme-display-font)",
              color: PREMIUM_GOLD_LIGHT,
              fontSize: "clamp(46px, 13vw, 80px)",
              textShadow: "0 3px 14px rgba(0,0,0,0.6)",
            }}
          >
            {title}
          </h1>

          <p className="text-[11px] uppercase tracking-[0.3em] mt-3 mb-4 text-white/55">
            {subtitle}
          </p>

          {formattedDate && (
            <div className="flex items-center justify-center gap-3">
              {line}
              {diamond(6, 0.9)}
              <span className="text-base font-serif italic text-white/85">
                {formattedDate}
              </span>
              {diamond(6, 0.9)}
              {line}
            </div>
          )}
        </div>

        {children}

        {callNumbers.length > 0 && (
          <div className="mt-6 text-center text-sm">
            <p className="text-[11px] uppercase tracking-[0.25em] mb-2 text-white/45">
              {cyrillic
                ? callNumbers.length > 1
                  ? "Или позови један од бројева:"
                  : "Или позови број:"
                : callNumbers.length > 1
                  ? "Ili pozovi jedan od brojeva:"
                  : "Ili pozovi broj:"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              {callNumbers.map((num, i) => (
                <React.Fragment key={`${num}-${i}`}>
                  {i > 0 && <span className="text-white/30">•</span>}
                  <a
                    href={`tel:${num.replace(/\s+/g, "")}`}
                    className="font-medium underline-offset-2 hover:underline"
                    style={{ color: PREMIUM_GOLD }}
                  >
                    {formatPhone(num)}
                  </a>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <p className="text-center mt-9 text-[10px] uppercase tracking-[0.35em] text-white/35">
          Halo Uspomene
        </p>
      </div>
    </div>
  );
}

export default function RsvpClient(props: Props) {
  const cyrillic =
    (props.kind === "classic" || props.kind === "premium") && props.useCyrillic;
  const formattedDate = formatDate(props.eventDate, cyrillic);

  const header = (
    <div className="text-center mb-8">
      <p
        className="text-xs uppercase tracking-[0.3em] mb-3"
        style={{ color: "var(--theme-text-light)" }}
      >
        {props.subtitle}
      </p>
      <h1
        className="text-4xl sm:text-5xl mb-4 leading-tight"
        style={{
          color: "var(--theme-primary)",
          fontFamily: "var(--theme-display-font)",
        }}
      >
        {props.title}
      </h1>
      {formattedDate && (
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-10" style={{ backgroundColor: "var(--theme-border)" }} />
          <Heart size={12} style={{ color: "var(--theme-primary)" }} fill="currentColor" />
          <span className="text-sm" style={{ color: "var(--theme-text-muted)" }}>
            {formattedDate}
          </span>
          <Heart size={12} style={{ color: "var(--theme-primary)" }} fill="currentColor" />
          <div className="h-px w-10" style={{ backgroundColor: "var(--theme-border)" }} />
        </div>
      )}
    </div>
  );

  const footer = (
    <p
      className="text-center mt-8 text-xs uppercase tracking-widest"
      style={{ color: "var(--theme-text-light)" }}
    >
      halouspomene.rs
    </p>
  );

  const wrap = (children: React.ReactNode) => (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: "var(--theme-background)" }}
    >
      <div className="w-full max-w-xl">
        {header}
        {children}
        {footer}
      </div>
    </div>
  );

  const callNumbers = (
    (props.kind === "classic" || props.kind === "premium") && props.callNumbers
  ) || [];

  const callBlock =
    callNumbers.length > 0 ? (
      <div
        className="mt-6 text-center text-sm"
        style={{ color: "var(--theme-text-muted)" }}
      >
        <p
          className="text-[11px] uppercase tracking-[0.25em] mb-2"
          style={{ color: "var(--theme-text-light)" }}
        >
          {cyrillic
            ? callNumbers.length > 1
              ? "Или позови један од бројева:"
              : "Или позови број:"
            : callNumbers.length > 1
              ? "Ili pozovi jedan od brojeva:"
              : "Ili pozovi broj:"}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {callNumbers.map((num, i) => (
            <React.Fragment key={`${num}-${i}`}>
              {i > 0 && (
                <span style={{ color: "var(--theme-text-light)" }}>•</span>
              )}
              <a
                href={`tel:${num.replace(/\s+/g, "")}`}
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--theme-primary)" }}
              >
                {formatPhone(num)}
              </a>
            </React.Fragment>
          ))}
        </div>
      </div>
    ) : null;

  if (props.kind === "classic") {
    return (
      <ThemeProvider
        theme={props.theme}
        scriptFont={props.scriptFont}
        useCyrillic={props.useCyrillic}
      >
        {wrap(
          <>
            <RSVPForm slug={props.slug} />
            {callBlock}
          </>,
        )}
      </ThemeProvider>
    );
  }

  if (props.kind === "premium") {
    const formattedDeadline = formatDate(props.submitUntil, cyrillic);
    return (
      <ThemeProvider
        theme={props.theme}
        scriptFont={props.scriptFont}
        useCyrillic={props.useCyrillic}
      >
        <PremiumRsvpLayout
          title={props.title}
          subtitle={props.subtitle}
          formattedDate={formattedDate}
          cyrillic={cyrillic}
          callNumbers={callNumbers}
        >
          <PremiumRsvpForm
            slug={props.slug}
            submitUntil={props.submitUntil}
            formattedDeadline={formattedDeadline}
            cyrillic={cyrillic}
          />
        </PremiumRsvpLayout>
      </ThemeProvider>
    );
  }

  if (props.kind === "standalone") {
    return (
      <div style={NEUTRAL_VARS as React.CSSProperties}>
        {wrap(<StandaloneRSVPForm slug={props.slug} />)}
      </div>
    );
  }

  return (
    <div style={NEUTRAL_VARS as React.CSSProperties}>
      {wrap(
        <BirthdayRSVPForm
          slug={props.slug}
          submitUntil={props.submitUntil}
          gender={props.gender}
        />,
      )}
    </div>
  );
}
