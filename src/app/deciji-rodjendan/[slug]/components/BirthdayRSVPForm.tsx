"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Minus, Plus } from "lucide-react";

interface BirthdayRSVPFormProps {
  slug: string;
  submitUntil: string;
}

export function BirthdayRSVPForm({ slug, submitUntil }: BirthdayRSVPFormProps) {
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
      </motion.div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || attending === null) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/deciji-rodjendan/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          attending,
          guestCount: attending === "Da" ? guestCount : 0,
          message: message.trim(),
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
          placeholder="Čestitka ili poruka za slavljenika..."
          rows={2}
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
    </form>
  );
}
