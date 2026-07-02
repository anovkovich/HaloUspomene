"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Minus, Plus } from "lucide-react";
import { useRecaptcha } from "@/components/forms/RecaptchaProvider";
import AddToCalendar from "@/components/ui/AddToCalendar";
import {
  type CalendarEvent,
  type CalendarLabels,
  calendarLabels as defaultCalendarLabels,
} from "@/lib/calendar";

interface BirthdayRSVPFormProps {
  slug: string;
  submitUntil: string;
  /** Accepted for call-site compatibility; no longer used in the form copy. */
  gender?: "boy" | "girl" | "neutral";
  /** "Add to calendar" event for the success screen. */
  calendarEvent?: CalendarEvent | null;
  /** RSVP reminder link shown at the bottom of the form. */
  reminder?: { event: CalendarEvent; label: string } | null;
  calendarLabels?: CalendarLabels;
}

export function BirthdayRSVPForm({
  slug,
  submitUntil,
  calendarEvent,
  reminder,
  calendarLabels = defaultCalendarLabels(false),
}: BirthdayRSVPFormProps) {
  const { execute: executeRecaptcha } = useRecaptcha();
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"Da" | "Ne" | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deadline = new Date(submitUntil);
  deadline.setHours(23, 59, 59, 999);
  const isPastDeadline = new Date() > deadline;

  if (isPastDeadline) {
    return (
      <div
        className="text-center p-8 rounded-3xl"
        style={{
          backgroundColor: "var(--theme-surface)",
          border: "1px solid var(--theme-border-light)",
        }}
      >
        <p style={{ color: "var(--theme-text-muted)" }}>
          Rok za prijavu je istekao.
        </p>
      </div>
    );
  }

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
          Hvala na prijavi!
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
              icsFilename={`rodjendan-${slug}.ics`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
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
      const res = await fetch(`/api/deciji-rodjendan/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          attending,
          guestCount: attending === "Da" ? guestCount : 0,
          message: message.trim(),
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
          Da li dolazite?
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAttending("Da")}
            className="flex-1 py-3 rounded-xl text-base font-bold transition-all cursor-pointer"
            style={{
              backgroundColor:
                attending === "Da"
                  ? "var(--theme-primary)"
                  : "var(--theme-background)",
              color: attending === "Da" ? "#fff" : "var(--theme-text-muted)",
              border:
                attending === "Da"
                  ? "2px solid var(--theme-primary)"
                  : "2px solid var(--theme-border-light)",
            }}
          >
            Da! 🎉
          </button>
          <button
            type="button"
            onClick={() => setAttending("Ne")}
            className="flex-1 py-3 rounded-xl text-base font-bold transition-all cursor-pointer"
            style={{
              backgroundColor:
                attending === "Ne"
                  ? "var(--theme-text-muted)"
                  : "var(--theme-background)",
              color: attending === "Ne" ? "#fff" : "var(--theme-text-muted)",
              border:
                attending === "Ne"
                  ? "2px solid var(--theme-text-muted)"
                  : "2px solid var(--theme-border-light)",
            }}
          >
            Ne 😔
          </button>
        </div>
      </div>

      {/* Guest count */}
      <AnimatePresence>
        {attending === "Da" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <label
              className="block text-sm font-bold mb-3"
              style={{ color: "var(--theme-text)" }}
            >
              Broj gostiju (ukupno sa vama)
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                style={{
                  backgroundColor: "var(--theme-primary-muted)",
                  color: "var(--theme-primary)",
                }}
              >
                <Minus size={18} />
              </button>
              <span
                className="text-3xl font-bold w-12 text-center"
                style={{
                  color: "var(--theme-primary)",
                  fontFamily: "var(--theme-display-font)",
                }}
              >
                {guestCount}
              </span>
              <button
                type="button"
                onClick={() => setGuestCount(Math.min(20, guestCount + 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                style={{
                  backgroundColor: "var(--theme-primary-muted)",
                  color: "var(--theme-primary)",
                }}
              >
                <Plus size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message */}
      <div>
        <label
          className="block text-sm font-bold mb-2"
          style={{ color: "var(--theme-text)" }}
        >
          Poruka (opciono)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ostavite napomenu ili navedite imena osoba koje dolaze sa vama..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-base outline-none transition-colors resize-none"
          style={{
            backgroundColor: "var(--theme-background)",
            border: "1px solid var(--theme-border-light)",
            color: "var(--theme-text)",
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !name.trim() || attending === null}
        className="w-full py-3.5 rounded-xl text-base font-bold text-white transition-opacity disabled:opacity-40 cursor-pointer"
        style={{
          backgroundColor: "var(--theme-primary)",
          boxShadow: `0 4px 16px var(--theme-primary-muted)`,
        }}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" />
            Šaljem...
          </span>
        ) : (
          "Potvrdi dolazak 🎈"
        )}
      </button>

      {reminder && (
        <div className="flex justify-center">
          <AddToCalendar
            event={reminder.event}
            label={reminder.label}
            dialogTitle={calendarLabels.dialogTitle}
            googleLabel={calendarLabels.google}
            appleLabel={calendarLabels.apple}
            icsFilename={`podsetnik-${slug}.ics`}
            className="inline-flex items-center gap-1.5 text-xs underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-70 cursor-pointer"
            style={{ color: "var(--theme-text-light)" }}
          />
        </div>
      )}
    </form>
  );
}
