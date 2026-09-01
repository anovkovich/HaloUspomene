"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Shirt } from "lucide-react";
import type { EventInvitationView } from "@/lib/event-invitation-view";
import { resolveEventTheme } from "./eventInvitationThemes";
import StandaloneRSVPForm from "@/app/rsvp/[id]/StandaloneRSVPForm";
import { parseLocalDate, calendarLabels } from "@/lib/calendar";

/**
 * Event invitation renderer.
 *
 * Takes an `EventInvitationView`, never a DB record — see that type for why.
 * The visual language here is a deliberate first pass; refining it should not
 * require touching anything but this file and `eventInvitationThemes.ts`.
 *
 * Note: no envelope-opening loader, by product decision.
 */

const MONTHS_GEN = [
  "januara", "februara", "marta", "aprila", "maja", "juna",
  "jula", "avgusta", "septembra", "oktobra", "novembra", "decembra",
];
const DAYS = [
  "Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota",
];

function formatDate(iso: string) {
  const d = parseLocalDate(iso);
  if (!d) return { full: "", day: "" };
  return {
    full: `${d.getDate()}. ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}.`,
    day: DAYS[d.getDay()],
  };
}

export default function EventInvitationClient({
  view,
}: {
  view: EventInvitationView;
}) {
  const theme = resolveEventTheme(view.theme);
  const c = theme.colors;
  const date = formatDate(view.date);

  const calendarEvent = (() => {
    const start = parseLocalDate(
      view.time ? `${view.date}T${view.time}` : view.date,
    );
    if (!start) return null;
    return {
      title: view.title,
      description: view.subtitle,
      location: view.location
        ? [view.location.name, view.location.address].filter(Boolean).join(", ")
        : undefined,
      start,
      allDay: !view.time,
    };
  })();

  const vars = {
    "--theme-primary": c.primary,
    "--theme-background": c.background,
    "--theme-surface": c.surface,
    "--theme-text": c.text,
    "--theme-text-muted": c.textMuted,
    "--theme-border-light": c.border,
    "--theme-shadow": "0 1px 3px rgba(0,0,0,0.06)",
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen"
      style={{ ...vars, backgroundColor: c.background, color: c.text }}
    >
      <div className="max-w-xl mx-auto px-5 py-14 sm:py-20">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {view.displayNumber && (
            <p
              className="font-serif leading-none mb-4"
              style={{ fontSize: "5.5rem", color: c.accent }}
            >
              {view.displayNumber}
            </p>
          )}
          <h1 className="font-serif text-4xl sm:text-5xl leading-tight">
            {view.title}
          </h1>
          {view.subtitle && (
            <p
              className="mt-3 text-xs uppercase tracking-[0.2em]"
              style={{ color: c.textMuted }}
            >
              {view.subtitle}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 my-7">
            <span className="h-px w-12" style={{ backgroundColor: c.accent, opacity: 0.5 }} />
            <span style={{ color: c.accent, fontSize: 11 }}>◆</span>
            <span className="h-px w-12" style={{ backgroundColor: c.accent, opacity: 0.5 }} />
          </div>

          {view.tagline && (
            <p className="text-base leading-relaxed" style={{ color: c.textMuted }}>
              {view.tagline}
            </p>
          )}
        </motion.header>

        {/* When & where */}
        <section className="mt-10 space-y-3">
          <Row icon={<Calendar size={16} />} accent={c.accent} border={c.border} surface={c.surface}>
            <p className="font-medium">{date.full}</p>
            <p className="text-sm" style={{ color: c.textMuted }}>{date.day}</p>
          </Row>

          {view.time && (
            <Row icon={<Clock size={16} />} accent={c.accent} border={c.border} surface={c.surface}>
              <p className="font-medium">{view.time}</p>
            </Row>
          )}

          {view.location && (
            <Row icon={<MapPin size={16} />} accent={c.accent} border={c.border} surface={c.surface}>
              <p className="font-medium">{view.location.name}</p>
              {view.location.address && (
                <p className="text-sm" style={{ color: c.textMuted }}>
                  {view.location.address}
                </p>
              )}
            </Row>
          )}

          {view.dressCode && (
            <Row icon={<Shirt size={16} />} accent={c.accent} border={c.border} surface={c.surface}>
              <p className="text-sm" style={{ color: c.textMuted }}>Dress code</p>
              <p className="font-medium">{view.dressCode}</p>
            </Row>
          )}
        </section>

        {/* Agenda */}
        {view.agenda && view.agenda.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xs uppercase tracking-[0.2em] text-center mb-6" style={{ color: c.textMuted }}>
              Satnica
            </h2>
            <ol className="space-y-0">
              {view.agenda.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-4 py-3"
                  style={{
                    borderTop: i === 0 ? "none" : `1px solid ${c.border}`,
                  }}
                >
                  <span
                    className="tabular-nums text-sm font-medium w-14 shrink-0"
                    style={{ color: c.accent }}
                  >
                    {item.time}
                  </span>
                  <span className="text-sm">{item.title}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Map */}
        {view.location?.mapUrl && (
          <section className="mt-12">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${c.border}` }}
            >
              <iframe
                src={view.location.mapUrl}
                width="100%"
                height="260"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Mapa — ${view.location.name}`}
              />
            </div>
          </section>
        )}

        {/* RSVP */}
        <section className="mt-12">
          <h2
            className="text-xs uppercase tracking-[0.2em] text-center mb-6"
            style={{ color: c.textMuted }}
          >
            Potvrda dolaska
          </h2>
          {view.rsvp.kind === "standalone" ? (
            <StandaloneRSVPForm
              slug={view.rsvp.slug}
              calendarEvent={calendarEvent}
              calendarLabels={calendarLabels(false)}
              submitUntil={view.rsvp.submitUntil}
            />
          ) : null}
        </section>

        <footer className="mt-14 text-center">
          {/* Plain anchor with target="_top": inside InvitationFrame the page
              renders in an iframe, so next/link would navigate the frame. */}
          <a
            href="https://halouspomene.rs"
            target="_top"
            className="text-[11px] tracking-wider transition-opacity hover:opacity-70"
            style={{ color: c.textMuted }}
          >
            halouspomene.rs
          </a>
        </footer>
      </div>
    </div>
  );
}

function Row({
  icon,
  children,
  accent,
  border,
  surface,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  accent: string;
  border: string;
  surface: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3.5"
      style={{ backgroundColor: surface, border: `1px solid ${border}` }}
    >
      <span className="mt-0.5 shrink-0" style={{ color: accent }}>
        {icon}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
