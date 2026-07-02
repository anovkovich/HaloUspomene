"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Minus, Plus } from "lucide-react";
import { useRecaptcha } from "@/components/forms/RecaptchaProvider";
import AddToCalendar from "@/components/ui/AddToCalendar";
import {
  type CalendarEvent,
  type CalendarLabels,
  calendarLabels as defaultCalendarLabels,
} from "@/lib/calendar";

interface Props {
  slug: string;
  calendarEvent?: CalendarEvent | null;
  calendarLabels?: CalendarLabels;
}

export default function StandaloneRSVPForm({
  slug,
  calendarEvent,
  calendarLabels = defaultCalendarLabels(false),
}: Props) {
  const { execute: executeRecaptcha } = useRecaptcha();
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"Da" | "Ne" | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-8 rounded-3xl"
        style={{
          backgroundColor: "var(--theme-surface)",
          border: "1px solid var(--theme-border-light)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "var(--theme-primary)" }}
        >
          <CheckCircle2 size={32} className="text-white" />
        </div>
        <p
          className="text-xl font-bold mb-2"
          style={{
            color: "var(--theme-primary)",
            fontFamily: "var(--theme-display-font)",
          }}
        >
          Hvala na potvrdi!
        </p>
        <p style={{ color: "var(--theme-text-muted)" }}>
          {attending === "Da"
            ? "Vidimo se na proslavi!"
            : "Žao nam je što nećete moći da dođete."}
        </p>
        {attending === "Da" && calendarEvent && (
          <div className="mt-6 flex justify-center">
            <AddToCalendar
              event={calendarEvent}
              label={calendarLabels.addToCalendar}
              dialogTitle={calendarLabels.dialogTitle}
              googleLabel={calendarLabels.google}
              appleLabel={calendarLabels.apple}
              icsFilename={`dogadjaj-${slug}.ics`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: "var(--theme-primary)" }}
            />
          </div>
        )}
      </motion.div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || attending === null) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let recaptchaToken = "";
      try {
        recaptchaToken = await executeRecaptcha("rsvp");
      } catch {
        setError("Provera neuspešna. Osvežite stranicu i pokušajte ponovo.");
        setIsSubmitting(false);
        return;
      }
      const res = await fetch(`/api/raspored-sedenja/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          attending,
          guestCount: attending === "Da" ? guestCount : 0,
          recaptcha_token: recaptchaToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Greška pri slanju");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pokušajte ponovo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl space-y-6"
      style={{
        backgroundColor: "var(--theme-surface)",
        border: "1px solid var(--theme-border-light)",
        boxShadow: "var(--theme-shadow)",
      }}
    >
      {/* Name */}
      <div>
        <label
          className="block text-sm font-bold mb-2"
          style={{ color: "var(--theme-text)" }}
        >
          Vaše ime
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ime i prezime"
          required
          className="w-full px-4 py-3 rounded-xl text-base outline-none transition-colors"
          style={{
            backgroundColor: "var(--theme-background)",
            border: "1px solid var(--theme-border-light)",
            color: "var(--theme-text)",
          }}
        />
      </div>

      {/* Attending */}
      <div>
        <label
          className="block text-sm font-bold mb-3"
          style={{ color: "var(--theme-text)" }}
        >
          Dolazak
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["Da", "Ne"] as const).map((option) => {
            const selected = attending === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setAttending(option)}
                className="py-3 rounded-xl text-base font-medium transition-all cursor-pointer"
                style={{
                  backgroundColor: selected
                    ? "var(--theme-primary)"
                    : "var(--theme-background)",
                  color: selected ? "#ffffff" : "var(--theme-text-muted)",
                  border: `2px solid ${
                    selected
                      ? "var(--theme-primary)"
                      : "var(--theme-border-light)"
                  }`,
                }}
              >
                {option === "Da" ? "Dolazim" : "Ne mogu"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Guest count */}
      {attending === "Da" && (
        <div>
          <label
            className="block text-sm font-bold mb-3"
            style={{ color: "var(--theme-text)" }}
          >
            Broj osoba
          </label>
          <div
            className="flex items-center justify-between rounded-xl overflow-hidden"
            style={{
              backgroundColor: "var(--theme-background)",
              border: "1px solid var(--theme-border-light)",
            }}
          >
            <button
              type="button"
              onClick={() => setGuestCount((n) => Math.max(1, n - 1))}
              className="px-5 py-3 hover:opacity-60 transition-opacity"
              style={{ color: "var(--theme-text-muted)" }}
              aria-label="Manje"
            >
              <Minus size={16} />
            </button>
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: "var(--theme-text)" }}
            >
              {guestCount} {guestCount === 1 ? "osoba" : "osoba"}
            </span>
            <button
              type="button"
              onClick={() => setGuestCount((n) => n + 1)}
              className="px-5 py-3 hover:opacity-60 transition-opacity"
              style={{ color: "var(--theme-text-muted)" }}
              aria-label="Više"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-center" style={{ color: "#c0392b" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!name.trim() || attending === null || isSubmitting}
        className="w-full py-4 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
        style={{ backgroundColor: "var(--theme-primary)" }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Šaljem...
          </>
        ) : (
          "Potvrdi"
        )}
      </button>
    </form>
  );
}
