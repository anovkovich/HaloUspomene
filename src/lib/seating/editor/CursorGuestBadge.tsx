"use client";

import { useEffect, useRef, useState } from "react";
import type { RSVPEntry } from "@/lib/rsvp";
import type { SeatAssignment } from "../types";

interface Props {
  selectedGuest: RSVPEntry | null;
  hoverSeat: SeatAssignment | null;
  /** Replacement label shown while hovering an interactive editor element
   *  (grab handle, rotate, label, entrance arrow). Overrides selectedGuest.name. */
  hint: string | null;
  /** The individual name being placed next (entered member name). When set,
   *  shown instead of the party label so you "carry" one person at a time. */
  selectedLabel?: string | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/** Desktop-only cursor-following badge for the seating editor.
 *  Top line: currently-selected guest (the one being assigned).
 *  Sub-line: "Skloni: {name}" when the cursor is over an occupied seat.
 *  Flashes gold when the active guest changes (e.g. after auto-advance). */
export default function CursorGuestBadge({
  selectedGuest,
  hoverSeat,
  hint,
  selectedLabel,
  containerRef,
}: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(false);
  const prevIdRef = useRef<string | null>(null);

  // Flash on guest → guest transitions only (skip null → guest and guest → null).
  useEffect(() => {
    if (!selectedGuest) {
      prevIdRef.current = null;
      setFlash(false);
      return;
    }
    if (prevIdRef.current && prevIdRef.current !== selectedGuest.id) {
      setFlash(true);
      const t = window.setTimeout(() => setFlash(false), 700);
      prevIdRef.current = selectedGuest.id;
      return () => window.clearTimeout(t);
    }
    prevIdRef.current = selectedGuest.id;
  }, [selectedGuest]);

  const hasContent = !!selectedGuest || !!hoverSeat || !!hint;
  const primaryText =
    hint ?? selectedLabel ?? selectedGuest?.name ?? null;
  // Sub-line is only meaningful for the seat-hover case; suppress it when a hint
  // is overriding the primary line so the badge shows just one message at a time.
  const showSubLine = !hint && !!hoverSeat;

  // Cursor tracking — direct DOM writes to avoid rerendering on every mousemove.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !hasContent) {
      setVisible(false);
      return;
    }

    const positionAt = (e: MouseEvent) => {
      const node = tooltipRef.current;
      if (!node) return;
      node.style.left = `${e.clientX + 14}px`;
      node.style.top = `${e.clientY + 14}px`;
    };
    const handleMove = (e: MouseEvent) => {
      positionAt(e);
      setVisible(true);
    };
    const handleEnter = (e: MouseEvent) => {
      positionAt(e);
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [hasContent, containerRef]);

  if (!hasContent) return null;

  // Inline (no portal) so theme CSS variables (--theme-primary, ...) inherit
  // from the editor's themed wrapper. Portal to document.body broke the gold flash.
  return (
    <div
      ref={tooltipRef}
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transform: `scale(${flash ? 1.08 : 1})`,
        transition:
          "opacity 0.15s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.35s ease, color 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
        backgroundColor: flash ? "var(--theme-primary)" : "var(--theme-surface)",
        color: flash ? "#fff" : "var(--theme-text)",
        border: `1px solid ${flash ? "var(--theme-primary)" : "var(--theme-border)"}`,
        boxShadow: flash
          ? "0 6px 22px color-mix(in srgb, var(--theme-primary) 45%, transparent)"
          : "0 2px 10px rgba(0,0,0,0.08)",
        padding: showSubLine && primaryText ? "7px 14px 8px" : "7px 14px",
        borderRadius: 16,
        fontFamily:
          "var(--font-raleway), system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        whiteSpace: "nowrap",
        textAlign: "center",
        lineHeight: 1.25,
      }}
    >
      {primaryText && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          {primaryText}
        </div>
      )}
      {showSubLine && hoverSeat && (
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 500,
            opacity: flash ? 0.85 : 0.65,
            marginTop: primaryText ? 2 : 0,
            letterSpacing: "0.01em",
          }}
        >
          Skloni: {hoverSeat.guestName}
        </div>
      )}
    </div>
  );
}
