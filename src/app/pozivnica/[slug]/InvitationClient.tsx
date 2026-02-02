"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Heart, Calendar, MapPin, Clock, Sparkles } from "lucide-react";
import { WeddingData } from "./types";
import { getThemeConfig } from "./constants";
import { ThemeProvider } from "./components/ThemeProvider";
import { EnvelopeLoader } from "./components/EnvelopeLoader";
import { Countdown } from "./components/Countdown";
import { Timeline } from "./components/Timeline";
import { RSVPForm } from "./components/RSVPFrom";

interface InvitationClientProps {
  data: WeddingData;
}

// Helper to format date
function formatEventDate(dateStr: string): {
  display: string;
  short: string;
  dayName: string;
} {
  const date = new Date(dateStr);
  const months = [
    "Januar",
    "Februar",
    "Mart",
    "April",
    "Maj",
    "Jun",
    "Jul",
    "Avgust",
    "Septembar",
    "Oktobar",
    "Novembar",
    "Decembar",
  ];
  const days = [
    "Nedelja",
    "Ponedeljak",
    "Utorak",
    "Sreda",
    "Četvrtak",
    "Petak",
    "Subota",
  ];

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.getMonth();
  const year = date.getFullYear();
  const dayName = days[date.getDay()];

  return {
    display: `${day} . ${(month + 1).toString().padStart(2, "0")} . ${year}`,
    short: `${day}. ${months[month]} ${year}.`,
    dayName,
  };
}

export default function InvitationClient({ data }: InvitationClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

  const themeConfig = useMemo(() => getThemeConfig(data.theme), [data.theme]);
  const formattedDate = useMemo(
    () => formatEventDate(data.event_date),
    [data.event_date],
  );
  const mainLocation = useMemo(
    () => data.locations.find((l) => l.type === "hall"),
    [data],
  );
  const eventTime = useMemo(
    () => data.timeline[0]?.time || "15:00",
    [data.timeline],
  );

  useEffect(() => {
    if (!isLoading) {
      const revealTimer = setTimeout(() => setIsRevealed(true), 50);
      return () => clearTimeout(revealTimer);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <ThemeProvider theme={data.theme}>
        <EnvelopeLoader
          names={data.couple_names.full_display}
          eventDate={formattedDate.short}
          onComplete={() => setIsLoading(false)}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={data.theme}>
      <div
        className={`invitation-page min-h-screen transition-all duration-[2000ms] ease-out ${isRevealed ? "opacity-100" : "opacity-0"}`}
        style={{
          backgroundColor: "var(--theme-background)",
          color: "var(--theme-text)",
        }}
      >
        {/* Hero Section */}
        <section
          className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-4 overflow-hidden"
          style={{ backgroundColor: "var(--theme-surface)" }}
        >
          {/* Background pattern - only show if ornaments enabled */}
          {themeConfig.style.ornaments && (
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(themeConfig.colors.primary)}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          )}

          {/* Decorative frame - only show if ornaments enabled */}
          {themeConfig.style.ornaments && (
            <>
              <div
                className={`absolute inset-6 sm:inset-14 pointer-events-none transition-all duration-[3000ms] delay-500 ${isRevealed ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                style={{ border: `1px solid var(--theme-border-light)` }}
              />
              <div
                className={`absolute top-8 left-8 w-12 h-12 sm:w-28 sm:h-28 pointer-events-none transition-all duration-[2000ms] delay-700 ${isRevealed ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 -translate-x-10 -translate-y-10"}`}
                style={{
                  borderTop: `2px solid var(--theme-border)`,
                  borderLeft: `2px solid var(--theme-border)`,
                }}
              />
              <div
                className={`absolute bottom-8 right-8 w-12 h-12 sm:w-28 sm:h-28 pointer-events-none transition-all duration-[2000ms] delay-700 ${isRevealed ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 translate-x-10 translate-y-10"}`}
                style={{
                  borderBottom: `2px solid var(--theme-border)`,
                  borderRight: `2px solid var(--theme-border)`,
                }}
              />
            </>
          )}

          <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center space-y-10 sm:space-y-16">
            {/* Subtitle */}
            <div
              className={`flex items-center gap-3 transition-all duration-1000 delay-300 ${isRevealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              {themeConfig.style.ornaments && (
                <Sparkles
                  size={12}
                  style={{ color: "var(--theme-primary)", opacity: 0.5 }}
                />
              )}
              <p
                className="font-elegant uppercase tracking-[0.4em] text-[9px] sm:text-[11px]"
                style={{ color: "var(--theme-text-light)" }}
              >
                Slavimo početak novog poglavlja
              </p>
              {themeConfig.style.ornaments && (
                <Sparkles
                  size={12}
                  style={{ color: "var(--theme-primary)", opacity: 0.5 }}
                />
              )}
            </div>

            {/* Names */}
            <div className="flex flex-col items-center w-full">
              <h1
                className={`text-5xl xs:text-6xl sm:text-9xl lg:text-[10rem] font-script leading-[0.85] drop-shadow-sm px-4 transition-all duration-[1500ms] delay-500 ${isRevealed ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ color: "var(--theme-text)" }}
              >
                {data.couple_names.bride}
              </h1>

              <div
                className={`flex items-center justify-center gap-4 sm:gap-12 my-6 sm:my-10 w-full px-6 transition-all duration-[2000ms] delay-700 ${isRevealed ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
              >
                <div
                  className="h-[0.5px] flex-1 max-w-[120px]"
                  style={{
                    background: `linear-gradient(to right, transparent, var(--theme-primary))`,
                    opacity: 0.4,
                  }}
                />
                <Heart
                  size={24}
                  style={{ color: "var(--theme-primary)", opacity: 0.6 }}
                  fill="currentColor"
                />
                <div
                  className="h-[0.5px] flex-1 max-w-[120px]"
                  style={{
                    background: `linear-gradient(to left, transparent, var(--theme-primary))`,
                    opacity: 0.4,
                  }}
                />
              </div>

              <h1
                className={`text-5xl xs:text-6xl sm:text-9xl lg:text-[10rem] font-script leading-[0.85] drop-shadow-sm px-4 transition-all duration-[1500ms] delay-600 ${isRevealed ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ color: "var(--theme-text)" }}
              >
                {data.couple_names.groom}
              </h1>
            </div>

            {/* Tagline */}
            <p
              className={`font-serif italic text-base sm:text-2xl max-w-2xl mx-auto leading-relaxed font-light px-10 transition-all duration-[1500ms] delay-1000 ${isRevealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ color: "var(--theme-text-muted)", opacity: 0.7 }}
            >
              {data.tagline}
            </p>

            {/* Date display */}
            <div
              className={`pt-6 flex flex-col items-center gap-10 sm:gap-16 transition-all duration-[2000ms] delay-[1200ms] ${isRevealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              <div className="relative">
                {themeConfig.style.ornaments && (
                  <>
                    <div
                      className="absolute -inset-4"
                      style={{ border: `1px solid var(--theme-border-light)` }}
                    />
                    <div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 px-4"
                      style={{ backgroundColor: "var(--theme-surface)" }}
                    >
                      <span
                        className="font-elegant text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: "var(--theme-primary)" }}
                      >
                        {formattedDate.dayName}
                      </span>
                    </div>
                  </>
                )}
                <span
                  className="text-2xl sm:text-5xl font-serif tracking-[0.15em] px-8 sm:px-16 py-6 sm:py-8 block"
                  style={{ color: "var(--theme-text)" }}
                >
                  {formattedDate.display}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-y-4 gap-x-12 sm:gap-x-20">
                <span
                  className="flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-sm"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.5)",
                    border: `1px solid var(--theme-border-light)`,
                  }}
                >
                  <Clock size={16} style={{ color: "var(--theme-primary)" }} />
                  <span
                    className="font-elegant text-sm tracking-[0.2em]"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {eventTime}
                  </span>
                </span>
                <span
                  className="flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-sm"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.5)",
                    border: `1px solid var(--theme-border-light)`,
                  }}
                >
                  <MapPin size={16} style={{ color: "var(--theme-primary)" }} />
                  <span
                    className="font-elegant text-sm tracking-[0.2em]"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {mainLocation?.name}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div
            className={`absolute bottom-10 sm:bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-all duration-[2000ms] delay-[1800ms] ${isRevealed ? "opacity-30" : "opacity-0"}`}
          >
            <span
              className="font-elegant text-[8px] uppercase tracking-[0.3em]"
              style={{ color: "var(--theme-text-light)" }}
            >
              Skrolujte
            </span>
            <div
              className="w-px h-12 sm:h-20"
              style={{
                background: `linear-gradient(to bottom, var(--theme-primary), transparent)`,
              }}
            />
          </div>
        </section>

        {/* Countdown Section */}
        {data.countdown_enabled && (
          <section
            className="relative py-24 sm:py-40 px-6 overflow-hidden"
            style={{
              background: `linear-gradient(to bottom, var(--theme-background), var(--theme-surface-alt), var(--theme-background))`,
            }}
          >
            <div
              className="absolute top-0 left-0 w-full h-px"
              style={{
                background: `linear-gradient(to right, transparent, var(--theme-border), transparent)`,
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-full h-px"
              style={{
                background: `linear-gradient(to right, transparent, var(--theme-border), transparent)`,
              }}
            />

            <div className="max-w-4xl mx-auto text-center">
              <h2
                className="text-5xl sm:text-8xl font-script mb-4"
                style={{ color: "var(--theme-primary)" }}
              >
                Odbrojavanje
              </h2>
              <p
                className="font-elegant text-xs uppercase tracking-[0.4em] mb-12"
                style={{ color: "var(--theme-text-light)" }}
              >
                do našeg posebnog dana
              </p>
              {themeConfig.style.ornaments && (
                <div className="flex items-center justify-center gap-4 mb-12">
                  <div
                    className="w-16 h-px"
                    style={{
                      background: `linear-gradient(to right, transparent, var(--theme-primary))`,
                      opacity: 0.3,
                    }}
                  />
                  <Heart
                    size={14}
                    style={{ color: "var(--theme-primary)", opacity: 0.4 }}
                    fill="currentColor"
                  />
                  <div
                    className="w-16 h-px"
                    style={{
                      background: `linear-gradient(to left, transparent, var(--theme-primary))`,
                      opacity: 0.3,
                    }}
                  />
                </div>
              )}
              <Countdown targetDate={data.event_date} />
            </div>
          </section>
        )}

        {/* Feature Cards */}
        <section className="py-24 sm:py-40 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {[
              {
                icon: MapPin,
                title: "Gde",
                content: `${mainLocation?.name}\n${mainLocation?.address}`,
              },
              {
                icon: Calendar,
                title: "Kada",
                content: `${formattedDate.dayName}\n${formattedDate.short} ${eventTime}`,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative p-10 sm:p-14 text-center group overflow-hidden transition-all duration-500"
                style={{
                  background: `linear-gradient(to bottom, var(--theme-background), var(--theme-surface))`,
                  borderRadius: "var(--theme-radius)",
                  border: `1px solid var(--theme-border-light)`,
                  boxShadow: "var(--theme-shadow)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(to bottom, transparent, var(--theme-primary-muted))`,
                  }}
                />

                <div
                  className="relative w-16 h-16 mx-auto mb-8 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: "var(--theme-surface)",
                    border: `1px solid var(--theme-border)`,
                  }}
                >
                  <item.icon
                    size={24}
                    strokeWidth={1}
                    style={{ color: "var(--theme-primary)" }}
                  />
                </div>

                <h3
                  className="font-elegant text-sm mb-6 tracking-[0.4em] uppercase"
                  style={{ color: "var(--theme-primary)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="font-serif text-base sm:text-lg leading-[2.2] whitespace-pre-line"
                  style={{ color: "var(--theme-text-muted)" }}
                >
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        {data.timeline.length > 0 && (
          <section
            className="relative py-24 sm:py-40 px-4 overflow-hidden"
            style={{
              background: `linear-gradient(to bottom, var(--theme-surface), var(--theme-surface-alt), var(--theme-surface))`,
            }}
          >
            <div
              className="absolute top-0 left-0 w-full h-px"
              style={{
                background: `linear-gradient(to right, transparent, var(--theme-border), transparent)`,
              }}
            />

            <div className="text-center mb-16 sm:mb-24">
              <h2
                className="text-6xl sm:text-8xl font-script mb-4"
                style={{ color: "var(--theme-primary)" }}
              >
                Protokol
              </h2>
              <p
                className="font-elegant text-xs uppercase tracking-[0.4em]"
                style={{ color: "var(--theme-text-light)" }}
              >
                Plan našeg zajedničkog dana
              </p>
            </div>
            <Timeline items={data.timeline} />
          </section>
        )}

        {/* Map */}
        {data.map_enabled && mainLocation?.map_url && (
          <section className="py-24 sm:py-40 px-6 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-5xl sm:text-8xl font-script mb-4"
                style={{ color: "var(--theme-primary)" }}
              >
                Lokacija
              </h2>
              <p
                className="font-elegant text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--theme-text-light)" }}
              >
                {mainLocation.address}
              </p>
            </div>
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: "var(--theme-radius)",
                boxShadow: "var(--theme-shadow)",
                border: `1px solid var(--theme-border-light)`,
              }}
            >
              <iframe
                src={mainLocation.map_url}
                className="w-full h-[400px] sm:h-[600px] grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
              />
            </div>
          </section>
        )}

        {/* RSVP */}
        <section
          className="relative py-24 sm:py-40 px-6 overflow-hidden"
          style={{
            background: `linear-gradient(to bottom, var(--theme-background), var(--theme-surface-alt), var(--theme-background))`,
          }}
        >
          <div
            className="absolute top-0 left-0 w-full h-px"
            style={{
              background: `linear-gradient(to right, transparent, var(--theme-border), transparent)`,
            }}
          />

          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2
              className="text-6xl sm:text-8xl font-script mb-4"
              style={{ color: "var(--theme-primary)" }}
            >
              Potvrda dolaska
            </h2>
            <p
              className="font-serif text-sm sm:text-base leading-relaxed"
              style={{ color: "var(--theme-text-muted)" }}
            >
              Molimo Vas da svoj dolazak potvrdite do{" "}
              <span
                className="font-semibold"
                style={{ color: "var(--theme-text)" }}
              >
                15. Maja 2026.
              </span>
            </p>
          </div>
          <RSVPForm formUrl={data.rsvp_form_url} entry_IDs={data.entry_IDs} />
        </section>

        {/* Footer */}
        <footer
          className="relative py-32 sm:py-48 text-center overflow-hidden"
          style={{ backgroundColor: "var(--theme-surface)" }}
        >
          <div
            className="absolute top-0 left-0 w-full h-px"
            style={{
              background: `linear-gradient(to right, transparent, var(--theme-border), transparent)`,
            }}
          />

          {themeConfig.style.ornaments && (
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(themeConfig.colors.primary)}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          )}

          <div className="relative">
            <p
              className="font-script text-5xl sm:text-8xl mb-8"
              style={{ color: "var(--theme-primary)" }}
            >
              {data.couple_names.full_display}
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div
                className="w-12 h-px"
                style={{
                  backgroundColor: "var(--theme-primary)",
                  opacity: 0.3,
                }}
              />
              <Heart
                size={16}
                style={{ color: "var(--theme-primary)", opacity: 0.5 }}
                fill="currentColor"
              />
              <div
                className="w-12 h-px"
                style={{
                  backgroundColor: "var(--theme-primary)",
                  opacity: 0.3,
                }}
              />
            </div>

            <p
              className="font-elegant text-xs uppercase tracking-[0.4em]"
              style={{ color: "var(--theme-text-light)" }}
            >
              Hvala Vam što ste deo naše sreće
            </p>

            <p
              className="mt-12 font-elegant text-[10px] uppercase tracking-[0.3em]"
              style={{ color: "var(--theme-text-light)", opacity: 0.5 }}
            >
              {formattedDate.short}
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
