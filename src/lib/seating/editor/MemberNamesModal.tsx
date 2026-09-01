"use client";

import { useState } from "react";
import { X, MessageSquare } from "lucide-react";
import type { RSVPEntry } from "@/lib/rsvp";

interface Props {
  guest: RSVPEntry;
  initialNames: string[];
  onSave: (names: string[]) => void;
  onClose: () => void;
}

/**
 * Lets the host enter the individual names of everyone on one RSVP party
 * (e.g. "Glavonjić - Čukelj ×2" → "Jovan Glavonjić", "Anastasija Čukelj"),
 * showing the guest's note since people usually list who's coming there.
 * The names are then used as seat labels when the party is placed.
 */
export default function MemberNamesModal({
  guest,
  initialNames,
  onSave,
  onClose,
}: Props) {
  const count = Math.max(1, parseInt(guest.guestCount) || 1);
  const [names, setNames] = useState<string[]>(() => {
    const arr = [...initialNames];
    while (arr.length < count) arr.push("");
    return arr.slice(0, count);
  });

  const setAt = (i: number, v: string) =>
    setNames((prev) => prev.map((n, idx) => (idx === i ? v : n)));

  const handleSave = () => {
    onSave(names);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
        style={{ maxHeight: "85vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="font-raleway text-base font-semibold"
              style={{ color: "var(--theme-text, #232323)" }}
            >
              {guest.name}
            </p>
            <p
              className="font-raleway text-xs"
              style={{ color: "var(--theme-text-light, rgba(35,35,35,0.55))" }}
            >
              {count} {count === 1 ? "osoba" : "osobe"} na ovoj zvanici
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-[#232323]/45 transition-colors hover:text-[#232323] cursor-pointer"
            aria-label="Zatvori"
          >
            <X size={18} />
          </button>
        </div>

        {guest.details?.trim() && (
          <div
            className="mt-3 mb-4 flex gap-2 rounded-xl p-3"
            style={{
              backgroundColor: "var(--theme-background, #F5F4DC)",
              border: "1px solid var(--theme-border-light, rgba(35,35,35,0.15))",
            }}
          >
            <MessageSquare
              size={14}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--theme-primary, #AE343F)" }}
            />
            <div className="min-w-0">
              <p
                className="font-raleway text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--theme-text-light, rgba(35,35,35,0.55))" }}
              >
                Napomena gosta
              </p>
              <p
                className="font-raleway text-xs whitespace-pre-wrap break-words"
                style={{ color: "var(--theme-text, #232323)" }}
              >
                {guest.details}
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="mt-4 space-y-2">
            {names.map((n, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-5 shrink-0 text-right font-raleway text-xs tabular-nums"
                  style={{
                    color: "var(--theme-text-light, rgba(35,35,35,0.55))",
                  }}
                >
                  {i + 1}.
                </span>
                <input
                  type="text"
                  value={n}
                  onChange={(e) => setAt(i, e.target.value)}
                  placeholder={`Ime i prezime ${i + 1}. osobe`}
                  autoFocus={i === 0}
                  className="w-full rounded-lg px-3 py-2 font-raleway text-sm outline-none"
                  style={{
                    backgroundColor: "var(--theme-background, #F5F4DC)",
                    border:
                      "1px solid var(--theme-border-light, rgba(35,35,35,0.15))",
                    color: "var(--theme-text, #232323)",
                  }}
                />
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border px-4 py-2.5 font-raleway text-sm font-medium cursor-pointer transition-colors hover:bg-black/5"
              style={{
                borderColor: "var(--theme-border-light, rgba(35,35,35,0.15))",
                color: "var(--theme-text-light, rgba(35,35,35,0.55))",
              }}
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg px-4 py-2.5 font-raleway text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--theme-primary, #AE343F)" }}
            >
              Sačuvaj imena
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
