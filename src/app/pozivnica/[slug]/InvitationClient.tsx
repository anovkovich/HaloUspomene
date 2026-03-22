"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Heart, Calendar, MapPin, Clock, Mic, Church } from "lucide-react";
// MapPin and Clock retained for Feature Cards section below
import { WeddingData } from "./types";
import { getThemeConfig } from "./constants";
import { getTranslations } from "./translations";
import { ThemeProvider } from "./components/ThemeProvider";
import { EnvelopeLoader } from "./components/EnvelopeLoader";
import { Countdown } from "./components/Countdown";
import { Timeline } from "./components/Timeline";
import { RSVPForm } from "./components/RSVPFrom";
import { generateInvitationPDF } from "./generateInvitationPDF";
import Link from "next/link";
import { Download } from "lucide-react";

interface InvitationClientProps {
  data: WeddingData;
  slug: string;
}

// Helper to format date with translation support
function formatEventDate(
  dateStr: string,
  months: string[],
  days: string[],
): {
  display: string;
  short: string;
  dayName: string;
} {
  const date = new Date(dateStr);

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

// Helper function to scroll to element by ID
function scrollTo(elementId: string) {
  const element = document.getElementById(elementId.replace("#", ""));
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

const LOCATION_TYPE_LABELS: Record<string, { latin: string; cyrillic: string; icon: React.ReactNode }> = {
  hall: { latin: "Svečana sala", cyrillic: "Свечана сала", icon: <MapPin size={14} /> },
  church: { latin: "Crkva", cyrillic: "Црква", icon: <Church size={14} /> },
};

function LocationMapSection({
  locations,
  singleLabel,
  pluralLabel,
}: {
  locations: import("./types").Location[];
  singleLabel: string;
  pluralLabel: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = locations[activeIdx];
  const hasMultiple = locations.length > 1;

  return (
    <section id="mapa" className="py-24 sm:py-40 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2
          className="text-5xl sm:text-8xl font-script mb-4"
          style={{ color: "var(--theme-primary)" }}
        >
          {hasMultiple ? pluralLabel : singleLabel}
        </h2>

        {/* Tabs */}
        {hasMultiple ? (
          <div className="flex items-center justify-center gap-3 mt-6">
            {locations.map((loc, i) => {
              const isActive = i === activeIdx;
              const meta = LOCATION_TYPE_LABELS[loc.type];
              return (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-elegant text-xs uppercase tracking-[0.15em] transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? "var(--theme-primary)" : "transparent",
                    color: isActive ? "#fff" : "var(--theme-text-light)",
                    border: isActive
                      ? "1px solid var(--theme-primary)"
                      : "1px solid var(--theme-border)",
                  }}
                >
                  {meta?.icon}
                  {meta?.latin || loc.name || loc.type}
                </button>
              );
            })}
          </div>
        ) : (
          <p
            className="font-elegant text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--theme-text-light)" }}
          >
            {active?.address}
          </p>
        )}
      </div>

      {/* Address (shown below tabs for multi) */}
      {hasMultiple && (
        <p
          className="text-center font-elegant text-xs uppercase tracking-[0.3em] mb-8 transition-opacity duration-300"
          style={{ color: "var(--theme-text-light)" }}
          key={activeIdx}
        >
          {active?.address}
        </p>
      )}

      {/* Map with slide animation */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: "var(--theme-radius)",
          boxShadow: "var(--theme-shadow)",
          border: "1px solid var(--theme-border-light)",
        }}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            width: `${locations.length * 100}%`,
            transform: `translateX(-${(activeIdx * 100) / locations.length}%)`,
          }}
        >
          {locations.map((loc, i) => (
            <div key={i} style={{ width: `${100 / locations.length}%` }}>
              {loc.map_url && (
                <iframe
                  src={loc.map_url}
                  className="w-full h-[400px] sm:h-[600px] grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function InvitationClient({
  data,
  slug,
}: InvitationClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

  const useCyrillic = data.useCyrillic ?? false;
  const t = useMemo(() => getTranslations(useCyrillic), [useCyrillic]);

  const themeConfig = useMemo(() => getThemeConfig(data.theme), [data.theme]);
  const formattedDate = useMemo(
    () => formatEventDate(data.event_date, t.months, t.days_week),
    [data.event_date, t.months, t.days_week],
  );
  const mainLocation = useMemo(
    () => data.locations.find((l) => l.type === "hall"),
    [data],
  );
  const mapLocations = useMemo(
    () => data.locations.filter((l) => l.map_url),
    [data],
  );
  const eventTime = useMemo(
    () =>
      data.event_date.split("T")[1]?.split(":")[0] +
      ":" +
      data.event_date.split("T")[1]?.split(":")[1],
    [data.event_date],
  );

  // RSVP deadline & seating lookup availability
  const { isPastDeadline, showGdeSedimLink, isWeddingDay, submitUntilDisplay } =
    useMemo(() => {
      const now = new Date();
      const deadline = new Date(data.submit_until);
      deadline.setHours(23, 59, 59, 999); // inclusive of the deadline day
      const eventDate = new Date(data.event_date);
      const dayBefore = new Date(eventDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      dayBefore.setHours(0, 0, 0, 0);
      // Wedding day gate: event day + day after
      const eventStart = new Date(eventDate);
      eventStart.setHours(0, 0, 0, 0);
      const dayAfterEnd = new Date(eventStart);
      dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
      dayAfterEnd.setHours(23, 59, 59, 999);
      // Format submit_until as "DD. MMMM YYYY."
      const d = new Date(data.submit_until);
      const day = d.getDate().toString().padStart(2, "0");
      const month = t.months[d.getMonth()];
      const year = d.getFullYear();
      return {
        isPastDeadline: now > deadline,
        showGdeSedimLink: now >= dayBefore,
        isWeddingDay: now >= eventStart && now <= dayAfterEnd,
        submitUntilDisplay: `${day}. ${month} ${year}.`,
      };
    }, [data.submit_until, data.event_date, t.months]);

  useEffect(() => {
    if (!isLoading) {
      const revealTimer = setTimeout(() => setIsRevealed(true), 50);
      return () => clearTimeout(revealTimer);
    }
  }, [isLoading]);

  // Grand full-width ornamental SVG divider
  const renderDivider = (position: "top" | "bottom" = "top") => {
    const shift = position === "top" ? "-translate-y-1/2" : "translate-y-1/2";
    const gid = `dg-${position}`;
    return (
      <>
        <div
          className={`absolute ${position}-0 left-0 w-full pointer-events-none`}
          style={{
            height: "2px",
            backgroundColor: "var(--theme-primary)",
            opacity: 0.22,
            zIndex: 2,
          }}
        />
        <div
          className={`absolute ${position}-0 left-0 w-full ${shift} pointer-events-none`}
          style={{ zIndex: 1, overflow: "visible" }}
        >
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            style={{ height: "120px", overflow: "visible" }}
          >
            <defs>
              {/* Gradient: fade in from edges, dip to 0 at center (behind flower) */}
              <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop
                  offset="0%"
                  stopColor="var(--theme-primary)"
                  stopOpacity="0"
                />
                <stop
                  offset="5%"
                  stopColor="var(--theme-primary)"
                  stopOpacity="0.55"
                />
                <stop
                  offset="38%"
                  stopColor="var(--theme-primary)"
                  stopOpacity="0.6"
                />
                <stop
                  offset="44%"
                  stopColor="var(--theme-primary)"
                  stopOpacity="0"
                />
                <stop
                  offset="56%"
                  stopColor="var(--theme-primary)"
                  stopOpacity="0"
                />
                <stop
                  offset="62%"
                  stopColor="var(--theme-primary)"
                  stopOpacity="0.6"
                />
                <stop
                  offset="95%"
                  stopColor="var(--theme-primary)"
                  stopOpacity="0.55"
                />
                <stop
                  offset="100%"
                  stopColor="var(--theme-primary)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* ══ Single clean horizontal line ══ */}
            <line
              x1="0"
              y1="60"
              x2="1200"
              y2="60"
              stroke={`url(#${gid})`}
              strokeWidth="1"
            />
          </svg>

          {/* ══ Flower illustration — CSS mask colors it with --theme-primary ══ */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(600px, 90vw)",
              aspectRatio: "842 / 232",
              backgroundColor: "var(--theme-primary)",
              maskImage: "url(/flower-divider.svg)",
              WebkitMaskImage: "url(/flower-divider.svg)",
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              opacity: 0.78,
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        </div>
      </>
    );
  };

  if (isLoading) {
    return (
      <ThemeProvider
        theme={data.theme}
        scriptFont={data.scriptFont}
        useCyrillic={useCyrillic}
      >
        <EnvelopeLoader
          names={data.couple_names.full_display}
          eventDate={formattedDate.short}
          onComplete={() => setIsLoading(false)}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      theme={data.theme}
      scriptFont={data.scriptFont}
      useCyrillic={useCyrillic}
    >
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
          <div className="relative z-10 w-full my-10 max-h-full max-w-5xl mx-auto flex flex-col items-center space-y-10 sm:space-y-16">
            {/* Subtitle */}
            <div
              className={`flex items-center gap-3 transition-all duration-1000 delay-300 ${isRevealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              <p
                className="font-elegant uppercase tracking-[0.4em] text-[9px] sm:text-[11px]"
                style={{ color: "var(--theme-text-light)" }}
              >
                {t.celebrateLove}
              </p>
            </div>

            {/* Names */}
            <div className="flex flex-col items-center w-full">
              <h1
                className={`text-5xl xs:text-5xl sm:text-7xl lg:text-[8rem] font-script leading-[0.85] drop-shadow-sm px-4 transition-all duration-[1500ms] delay-500 ${isRevealed ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ color: "var(--theme-text)" }}
              >
                {data.couple_names.bride}
              </h1>

              <div
                className={`flex items-center justify-center gap-4 sm:gap-12 my-4 sm:my-6 w-full px-6 transition-all duration-[2000ms] delay-700 ${isRevealed ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
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
                  style={{ color: "var(--theme-primary)" }}
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
                className={`text-5xl xs:text-5xl sm:text-7xl lg:text-[8rem] font-script leading-[0.85] drop-shadow-sm px-4 transition-all duration-[1500ms] delay-600 ${isRevealed ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ color: "var(--theme-text)" }}
              >
                {data.couple_names.groom}
              </h1>
            </div>

            {/* Tagline */}
            <div
              className={`font-serif italic text-base sm:text-2xl max-w-2xl mx-auto leading-relaxed font-light px-10 transition-all duration-[1500ms] delay-1000 ${isRevealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ color: "var(--theme-text-muted)", opacity: 0.7 }}
            >
              {data.tagline?.split(/\\n|\n/).map((line, i, arr) => (
                <React.Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>

            {/* Date display */}
            <div
              className={`pt-0 flex flex-col items-center gap-6 sm:gap-10 transition-all duration-[2000ms] delay-[1200ms] ${isRevealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              <div className="relative">
                <span
                  className="text-2xl sm:text-5xl font-serif tracking-[0.15em] px-8 sm:px-16 py-6 sm:py-8 block"
                  style={{ color: "var(--theme-text)" }}
                >
                  {formattedDate.display}
                </span>
              </div>

              <div className="flex justify-center">
                {showGdeSedimLink ? (
                  data.paid_for_raspored ? (
                    <Link
                      href={`/pozivnica/${slug}/gde-sedim`}
                      className="flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3.5 rounded-full font-elegant text-xs sm:text-sm tracking-[0.12em] sm:tracking-[0.2em] uppercase transition-all hover:opacity-80 whitespace-nowrap"
                      style={{
                        backgroundColor: "var(--theme-primary)",
                        color: "#fff",
                        boxShadow: "var(--theme-shadow)",
                      }}
                    >
                      {t.findSeating}
                    </Link>
                  ) : null
                ) : (
                  <button
                    onClick={() => scrollTo("rsvp")}
                    className="flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3.5 rounded-full font-elegant text-xs sm:text-sm tracking-[0.12em] sm:tracking-[0.2em] uppercase transition-all hover:opacity-80 cursor-pointer whitespace-nowrap"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.5)",
                      border: `1px solid var(--theme-border-light)`,
                      color: "var(--theme-text-muted)",
                    }}
                  >
                    <Heart
                      size={14}
                      style={{ color: "var(--theme-primary)" }}
                      fill="currentColor"
                    />
                    <span className="flex mt-1">
                      {t.confirmAttendance ?? "Potvrdite dolazak"}
                    </span>
                    <Heart
                      size={14}
                      style={{ color: "var(--theme-primary)" }}
                      fill="currentColor"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Countdown Section */}
        {data.countdown_enabled && (
          <section
            className="relative py-24 sm:py-40 px-6 overflow-hidden"
            style={{
              backgroundColor: "var(--theme-surface)",
              backgroundImage: `radial-gradient(ellipse 70% 100% at 50% 50%, color-mix(in srgb, var(--theme-primary) 14%, var(--theme-surface)), var(--theme-surface))`,
            }}
          >
            {renderDivider("top")}
            {renderDivider("bottom")}
            <div className="max-w-4xl mx-auto text-center">
              <h2
                className="text-5xl sm:text-8xl font-script mb-4"
                style={{ color: "var(--theme-primary)" }}
              >
                {t.countdown}
              </h2>
              <p
                className="font-elegant text-xs uppercase tracking-[0.4em] mb-12"
                style={{ color: "var(--theme-text-light)" }}
              >
                -
              </p>
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
                title: t.where,
                content: `${mainLocation?.name}\n${mainLocation?.address}`,
                link: "#mapa",
              },
              {
                icon: Calendar,
                title: t.whenLabel,
                content: `${formattedDate.dayName}\n${formattedDate.short} ${eventTime}`,
                link: "#protokol",
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
                  onClick={() => {
                    scrollTo(item.link!);
                  }}
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
            id="protokol"
            className="relative py-24 sm:py-40 px-4 overflow-hidden"
            style={{
              background: `linear-gradient(to bottom, var(--theme-surface), var(--theme-surface-alt), var(--theme-surface))`,
            }}
          >
            {renderDivider("top")}

            <div className="text-center mb-16 sm:mb-24">
              <h2
                className="text-6xl sm:text-8xl font-script mb-5"
                style={{ color: "var(--theme-primary)" }}
              >
                {t.protocol}
              </h2>
              <p
                className="font-serif text-sm sm:text-base leading-relaxed"
                style={{ color: "var(--theme-text-light)" }}
              >
                {t.ourDayPlan}
              </p>
            </div>
            <Timeline items={data.timeline} />
            {renderDivider("bottom")}
          </section>
        )}

        {/* Map */}
        {data.map_enabled && mapLocations.length > 0 && (
          <LocationMapSection
            locations={mapLocations}
            singleLabel={t.location}
            pluralLabel={t.locations}
          />
        )}

        {/* RSVP */}
        <section
          id="rsvp"
          className="relative py-24 sm:py-40 px-6 overflow-hidden"
          style={{
            background: `linear-gradient(to bottom, var(--theme-background), var(--theme-surface-alt), var(--theme-background))`,
          }}
        >
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2
              className="text-6xl sm:text-8xl font-script mb-5"
              style={{ color: "var(--theme-primary)" }}
            >
              {t.rsvpTitle}
            </h2>
            <p
              className="font-serif text-sm sm:text-base leading-relaxed"
              style={{ color: "var(--theme-text-muted)" }}
            >
              {t.rsvpSubtitle}{" "}
              <span
                className="font-semibold"
                style={{ color: "var(--theme-text)" }}
              >
                {submitUntilDisplay}
              </span>
            </p>
          </div>
          {isPastDeadline ? (
            <div
              className="max-w-xl mx-auto text-center py-12 px-8 rounded-[var(--theme-radius)]"
              style={{
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
                boxShadow: "var(--theme-shadow)",
              }}
            >
              <p
                className="font-serif text-2xl mb-3"
                style={{ color: "var(--theme-text)" }}
              >
                {t.rsvpClosed}
              </p>
              <p
                className="font-elegant text-sm"
                style={{ color: "var(--theme-text-light)" }}
              >
                {t.rsvpClosedSub}
              </p>
            </div>
          ) : (
            <RSVPForm slug={slug} />
          )}

          {/* Seating lookup note / link — only shown when paid_for_raspored */}
          {data.paid_for_raspored && (
            <div className="max-w-xl mx-auto mt-6 text-center">
              {showGdeSedimLink ? (
                <Link
                  href={`/pozivnica/${slug}/gde-sedim`}
                  className="inline-flex items-center gap-2 font-elegant text-sm uppercase tracking-widest transition-opacity hover:opacity-70"
                  style={{ color: "var(--theme-primary)" }}
                >
                  {t.findSeating}
                </Link>
              ) : (
                <p
                  className="font-elegant text-xs leading-relaxed"
                  style={{ color: "var(--theme-text-light)", opacity: 0.7 }}
                >
                  {t.seatingAvailableNote}
                </p>
              )}
            </div>
          )}

          {/* Audio guest book link — wedding day only */}
          {isWeddingDay && data.paid_for_audio && (
            <div className="max-w-xl mx-auto mt-6 text-center">
              <Link
                href={`/pozivnica/${slug}/audio-knjiga`}
                className="inline-flex items-center gap-2 font-elegant text-sm uppercase tracking-widest transition-opacity hover:opacity-70"
                style={{ color: "var(--theme-primary)" }}
              >
                <Mic size={14} />
                {t.audioGuestBook}
              </Link>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer
          className="relative pt-32 sm:pt-48 text-center overflow-hidden"
          style={{ backgroundColor: "var(--theme-surface)" }}
        >
          {renderDivider("top")}
          <div className="relative  pb-32 sm:pt-48">
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

            <div
              className="font-elegant text-xs uppercase tracking-[0.3em] px-3"
              style={{ color: "var(--theme-text-light)" }}
            >
              {(data.thankYouFooter || t.thankYouFooter).split(/\\n|\n/).map((line, i, arr) => (
                <React.Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <div className="h-6" />}
                </React.Fragment>
              ))}
            </div>

            <p
              className="mt-12 font-elegant text-[10px] uppercase tracking-[0.3em]"
              style={{ color: "var(--theme-text-light)", opacity: 0.5 }}
            >
              {formattedDate.short}
            </p>
          </div>
          <Link
            href="/"
            className="mt-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
          >
            <Image
              src="/images/logo.png"
              alt="Halo Uspomene LOGO"
              width={3519}
              height={1301}
              className="h-6 mb-1 w-auto"
            />
          </Link>

          <Link
            href="/"
            className="w-full flex font-serif text-center gap-1 mb-3 justify-center items-center text-[10px] sm:text-xs mt-0 sm:mt-2 opacity-50"
          >
            Made with <Heart size={10} className="text-[#AE343F]" /> | Halo
            Pozivnice
          </Link>

          <button
            onClick={() => generateInvitationPDF(data, slug, data.paid_for_pdf ?? false, useCyrillic)}
            className="flex items-center gap-1 mb-5 mx-auto text-[9px] uppercase tracking-[0.2em] transition-opacity hover:opacity-40 cursor-pointer"
            style={{ color: "var(--theme-text-light)", opacity: 0.15 }}
          >
            <Download size={9} />
            {t.downloadPDF}
          </button>
        </footer>
      </div>
    </ThemeProvider>
  );
}
