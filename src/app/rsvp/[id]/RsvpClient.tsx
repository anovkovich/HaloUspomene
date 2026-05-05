"use client";

import React from "react";
import { Heart } from "lucide-react";
import { ThemeProvider } from "@/app/pozivnica/[slug]/components/ThemeProvider";
import { RSVPForm } from "@/app/pozivnica/[slug]/components/RSVPFrom";
import { BirthdayRSVPForm } from "@/app/deciji-rodjendan/[slug]/components/BirthdayRSVPForm";
import StandaloneRSVPForm from "./StandaloneRSVPForm";
import type { ThemeType, ScriptFontType } from "@/app/pozivnica/[slug]/types";

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
}

interface ClassicProps extends BaseProps, CoupleSpecific {
  kind: "classic";
}

interface PremiumProps extends BaseProps, CoupleSpecific {
  kind: "premium";
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

function formatDate(iso: string, cyrillic: boolean): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const months = cyrillic ? MONTHS_CYRILLIC : MONTHS_LATIN;
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}.`;
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

  if (props.kind === "classic") {
    return (
      <ThemeProvider
        theme={props.theme}
        scriptFont={props.scriptFont}
        useCyrillic={props.useCyrillic}
      >
        {wrap(<RSVPForm slug={props.slug} />)}
      </ThemeProvider>
    );
  }

  if (props.kind === "premium") {
    return (
      <ThemeProvider
        theme={props.theme}
        scriptFont={props.scriptFont}
        useCyrillic={props.useCyrillic}
        customPrimaryColor="#d4af37"
        customBackgroundColor="#fffdf5"
      >
        {wrap(<RSVPForm slug={props.slug} />)}
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
