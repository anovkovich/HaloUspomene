"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { X, Lightbulb } from "lucide-react";

/** Dismissal is remembered per browser: the tip teaches one thing once, and
 *  coming back to it every session would be nagging, not helping. */
const HINT_KEY = "halo_seating_canvas_hint";

/** No-op: the stored flag only ever changes through this component itself. */
const subscribe = () => () => {};

const readSeen = () => {
  try {
    return !!localStorage.getItem(HINT_KEY);
  } catch {
    // Blocked storage: show the tip and let dismissal last only this session.
    return false;
  }
};

/**
 * Bottom-right tip explaining the controls that only appear on hover.
 *
 * The table header — rename, seat count, rotate, delete — is hidden until the
 * pointer is over a table, which keeps the canvas clean but leaves a new user
 * with no way to discover any of it. Rather than show the header permanently
 * and clutter every table, the editor says it once in words.
 */
export default function CanvasHintNote() {
  // `useSyncExternalStore` rather than an effect: the server snapshot says
  // "already seen", so nothing renders during SSR and a returning user never
  // sees the tip flash before it disappears.
  const seen = useSyncExternalStore(subscribe, readSeen, () => true);
  const [dismissed, setDismissed] = useState(false);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      // Nothing to do — it simply returns next session.
    }
  }, []);

  if (seen || dismissed) return null;

  return (
    <div
      className="absolute z-10 hidden lg:block rounded-xl p-3 pr-8"
      style={{
        bottom: 12,
        right: 12,
        maxWidth: 290,
        backgroundColor: "color-mix(in srgb, var(--theme-surface) 88%, #ffffff)",
        border:
          "1px solid color-mix(in srgb, var(--theme-primary) 22%, transparent)",
        boxShadow:
          "0 1px 2px rgba(35,35,35,0.06), 0 10px 24px -12px rgba(35,35,35,0.3)",
        backdropFilter: "blur(8px)",
      }}
    >
      <button
        onClick={dismiss}
        aria-label="Sakrij savet"
        title="Sakrij savet"
        className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded transition-opacity hover:opacity-60 cursor-pointer"
        style={{ color: "var(--theme-text-light)" }}
      >
        <X size={13} />
      </button>

      <div className="flex gap-2">
        <Lightbulb
          size={14}
          className="shrink-0 mt-0.5"
          style={{ color: "var(--theme-primary)" }}
        />
        <div className="min-w-0">
          <p
            className="font-raleway text-[11px] font-semibold mb-1"
            style={{ color: "var(--theme-text)" }}
          >
            Podešavanja stola
          </p>
          <p
            className="font-raleway text-[11px] leading-relaxed"
            style={{ color: "var(--theme-text-light)" }}
          >
            Pređi kursorom preko stola i iznad njega iskače traka: preimenovanje
            (dupli klik na naziv), broj mesta, rotacija i brisanje. Sto se
            pomera hvatanjem za njegovu površinu.
          </p>
        </div>
      </div>
    </div>
  );
}
