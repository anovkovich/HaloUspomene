"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

/**
 * A short explanation attached to a phrase inside running text.
 *
 * Opens on hover for a mouse and on tap for a phone — a hover-only tooltip is
 * invisible on touch, which is where most couples read the planner. Focus opens
 * it too, so it is reachable by keyboard; Escape and an outside tap close it.
 *
 * Positioned relative to the trigger rather than portalled. The trigger sits
 * mid-sentence, so anchoring the panel to it alone pushes the panel off-screen
 * on a narrow phone; after opening it is measured and nudged back inside the
 * viewport. `align` only decides which way it grows first.
 */

interface Props {
  /** The phrase in the sentence that carries the explanation. */
  label: string;
  children: React.ReactNode;
  /** Which edge the panel is anchored to. */
  align?: "left" | "right";
}

export default function InfoTooltip({ label, children, align = "left" }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  /** Writes the correction straight to the node instead of through state: this
   *  is a layout measurement feeding back into the DOM, and routing it through
   *  a render would cost an extra pass for no benefit. */
  const clampToViewport = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    // Measure unshifted, so the correction never compounds across resizes.
    el.style.transform = "";
    const r = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const margin = 10;
    let dx = 0;
    if (r.right > vw - margin) dx = vw - margin - r.right;
    if (r.left + dx < margin) dx = margin - r.left;
    if (dx) el.style.transform = `translateX(${dx}px)`;
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    clampToViewport();
    window.addEventListener("resize", clampToViewport);
    return () => window.removeEventListener("resize", clampToViewport);
  }, [open, clampToViewport]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="text-[#AE343F] underline decoration-dotted underline-offset-2 cursor-help"
      >
        {label}
      </button>

      {open && (
        <span
          ref={panelRef}
          id={panelId}
          role="tooltip"
          className={`absolute top-full z-30 mt-2 block w-[min(22rem,calc(100vw-2.5rem))] rounded-xl border border-[#232323]/12 bg-white p-3.5 text-left text-xs leading-relaxed text-[#232323]/80 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </span>
      )}
    </span>
  );
}
