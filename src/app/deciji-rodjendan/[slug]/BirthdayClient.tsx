"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock } from "lucide-react";
import type { BirthdayData } from "./types";
import {
  getBirthdayThemeCSSVariables,
  getBirthdayThemeConfig,
} from "./constants";
import { BirthdayThemeProvider } from "./components/ThemeProvider";
import { SceneDecorations, AgeBadge } from "./components/Illustrations";
import { BirthdayCountdown } from "./components/Countdown";
import { BirthdayRSVPForm } from "./components/BirthdayRSVPForm";

interface Props {
  data: BirthdayData;
  slug: string;
}

const MONTHS = [
  "januar",
  "februar",
  "mart",
  "april",
  "maj",
  "jun",
  "jul",
  "avgust",
  "septembar",
  "oktobar",
  "novembar",
  "decembar",
];

const DAYS = [
  "Nedelja",
  "Ponedeljak",
  "Utorak",
  "Sreda",
  "Četvrtak",
  "Petak",
  "Subota",
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    full: `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}.`,
    day: DAYS[d.getDay()],
    time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}h`,
  };
}

export default function BirthdayClient({ data, slug }: Props) {
  const cssVars = getBirthdayThemeCSSVariables(data.theme, data.displayFont);
  const themeConfig = getBirthdayThemeConfig(data.theme);
  const dateInfo = formatDate(data.event_date);
  const confetti = themeConfig.colors.confetti;
  const illustration = themeConfig.illustration;

  return (
    <BirthdayThemeProvider theme={data.theme} cssVars={cssVars}>
      <div
        className="min-h-screen relative"
        style={{ backgroundColor: "var(--theme-background)" }}
      >
        {/* ── Fixed background illustrations — parallax effect on scroll ── */}
        <SceneDecorations illustration={illustration} confetti={confetti} />

        {/* ── Hero Section ── */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 text-center space-y-6"
          >
            {/* Parent names */}
            <p
              className="text-sm sm:text-base tracking-wide uppercase"
              style={{ color: "var(--theme-text-light)" }}
            >
              {data.parent_names}
            </p>

            {/* Invitation label */}
            <p
              className="text-xs sm:text-sm uppercase tracking-[0.3em] font-medium"
              style={{ color: "var(--theme-text-muted)" }}
            >
              Vas pozivaju na moj
            </p>

            {/* Age badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <AgeBadge
                age={data.age}
                primaryColor={themeConfig.colors.primary}
                secondaryColor={themeConfig.colors.secondary}
              />
            </motion.div>

            {/* Birthday label */}
            <p
              className="text-sm sm:text-base uppercase tracking-[0.2em]"
              style={{ color: "var(--theme-text-muted)" }}
            >
              {/* {data.age === 1 ? "prvog rođendana" : `${data.age}. rođendana`} */}
              rođendan
            </p>

            {/* Child name */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-5xl sm:text-7xl md:text-8xl font-bold"
              style={{
                color: "var(--theme-text)",
                fontFamily: "var(--theme-display-font)",
                lineHeight: 1.1,
              }}
            >
              {data.child_name}
            </motion.h1>

            {/* Tagline */}
            {data.tagline && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-base sm:text-lg max-w-md mx-auto italic"
                style={{ color: "var(--theme-text-muted)" }}
              >
                {data.tagline}
              </motion.p>
            )}
          </motion.div>
        </section>

        {/* ── Countdown ── */}
        {data.countdown_enabled && (
          <section className="relative py-16 sm:py-24 px-6">
            <div className="relative z-10">
              <div className="text-center mb-10">
                <h2
                  className="text-3xl sm:text-4xl font-bold mb-2"
                  style={{
                    color: "var(--theme-primary)",
                    fontFamily: "var(--theme-display-font)",
                  }}
                >
                  Odbrojavanje
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Do proslave je ostalo
                </p>
              </div>
              <BirthdayCountdown eventDate={data.event_date} />
            </div>
          </section>
        )}

        {/* ── Details Card ── */}
        <section className="relative py-16 sm:py-24 px-6">
          <div className="max-w-md mx-auto relative z-10">
            <div
              className="p-8 rounded-3xl text-center space-y-6 backdrop-blur-sm"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--theme-surface) 92%, transparent)",
                border: "1px solid var(--theme-border-light)",
                boxShadow: "var(--theme-shadow)",
              }}
            >
              <h2
                className="text-2xl sm:text-3xl font-bold"
                style={{
                  color: "var(--theme-primary)",
                  fontFamily: "var(--theme-display-font)",
                }}
              >
                Detalji proslave
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Calendar
                    size={18}
                    style={{ color: "var(--theme-secondary)" }}
                  />
                  <span style={{ color: "var(--theme-text)" }}>
                    {dateInfo.day}, {dateInfo.full}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <Clock
                    size={18}
                    style={{ color: "var(--theme-secondary)" }}
                  />
                  <span style={{ color: "var(--theme-text)" }}>
                    {dateInfo.time}
                  </span>
                </div>

                <div
                  className="h-px my-2"
                  style={{ backgroundColor: "var(--theme-border-light)" }}
                />

                <div className="flex items-center justify-center gap-3">
                  <MapPin
                    size={18}
                    style={{ color: "var(--theme-secondary)" }}
                  />
                  <div>
                    <p
                      className="font-bold"
                      style={{ color: "var(--theme-text)" }}
                    >
                      {data.location.name}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--theme-text-muted)" }}
                    >
                      {data.location.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Map ── */}
        {data.map_enabled && data.location.map_url && (
          <section className="relative py-8 sm:py-16 px-6">
            <div className="max-w-2xl mx-auto relative z-10">
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  border: "1px solid var(--theme-border-light)",
                  boxShadow: "var(--theme-shadow)",
                }}
              >
                <iframe
                  src={data.location.map_url}
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </section>
        )}

        {/* ── RSVP Form ── */}
        <section id="rsvp" className="relative py-16 sm:py-24 px-6">
          <div className="max-w-md mx-auto relative z-10">
            <div className="text-center mb-10">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-2"
                style={{
                  color: "var(--theme-primary)",
                  fontFamily: "var(--theme-display-font)",
                }}
              >
                Prijavite se
              </h2>
              <p
                className="text-sm"
                style={{ color: "var(--theme-text-light)" }}
              >
                Potvrdite svoje prisustvo
              </p>
            </div>
            <BirthdayRSVPForm slug={slug} submitUntil={data.submit_until} />
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="relative py-12 px-6 text-center space-y-4">
          <div className="relative z-10">
            <p
              className="text-2xl font-bold"
              style={{
                color: "var(--theme-primary)",
                fontFamily: "var(--theme-display-font)",
              }}
            >
              {data.child_name}
            </p>
            <div
              className="h-px w-16 mx-auto mt-4"
              style={{ backgroundColor: "var(--theme-border)" }}
            />
            <p
              className="text-xs uppercase tracking-[0.2em] mt-4"
              style={{ color: "var(--theme-text-light)" }}
            >
              halouspomene.rs
            </p>
          </div>
        </footer>
      </div>
    </BirthdayThemeProvider>
  );
}
