"use client";

import React, { useRef, useState, useSyncExternalStore } from "react";
import LiveExampleCard, { type ExampleVariant } from "./LiveExampleCard";

const HOVER = "(hover: hover)";

/** True on devices that cannot hover. Server-renders as false, so the markup
 *  matches the pointer case and hydration corrects touch devices. */
function useTouchInput() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(HOVER);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => !window.matchMedia(HOVER).matches,
    () => false,
  );
}

export interface LiveExample {
  label: string;
  /** Kada je postavljen, iznad ove kartice pocinje nova grupa sa ovim naslovom.
   *  Standardne teme ne nose naslov — one su podrazumevana ponuda. */
  groupTitle?: string;
  desc: string;
  /** Card highlighted and playing before any hover, and the one the row falls
   *  back to when the pointer leaves. Pointer devices only — see below. */
  featured?: boolean;
  variants: ExampleVariant[];
  /** "Napravi ovakvu pozivnicu" target for this occasion (classic → pricing,
   *  premium/birthday/punoletstvo → straight to their builder). */
  createHref: string;
}

/**
 * Owns which card is active, because only one clip may play at a time — four
 * phones animating at once reads as noise rather than as a demo.
 *
 * How a card becomes active depends on the input device:
 *  - pointer: hover picks it, leaving the row falls back to the featured card.
 *  - touch: whichever card the carousel is scrolled to, since the featured card
 *    starts off screen there and would otherwise leave every visible card
 *    frozen on its poster, which reads as a broken player.
 * Tapping a card activates it either way.
 */
export default function LiveExamplesRow({
  examples,
}: {
  examples: LiveExample[];
}) {
  // Grupa = red kartica ispod jednog podnaslova. Aktivira se cela grupa, ne
  // pojedinacna kartica: red od tri telefona koji se zajedno pokrenu cita se
  // kao ponuda, dok jedan koji radi pored dva zaledjena izgleda kao kvar.
  const groupOf = examples.map(() => 0);
  let g = -1;
  examples.forEach((ex, i) => {
    if (i === 0 || ex.groupTitle) g += 1;
    groupOf[i] = g;
  });
  const featuredGroup =
    groupOf[Math.max(0, examples.findIndex((e) => e.featured))] ?? 0;

  const rowRef = useRef<HTMLDivElement>(null);
  const [activeGroup, setActiveGroup] = useState(featuredGroup);
  const touch = useTouchInput();

  // Kartice se grupisu u stvarne blokove umesto da stoje ravno u jednom
  // flex-wrap-u: tako `onMouseEnter` hvata i prazan prostor izmedju kartica i
  // sam podnaslov. Dok je visio na pojedinacnoj kartici, prelazak preko razmaka
  // ka premium redu nije nista aktivirao, pa je gornji red nastavljao da svira.
  const groups: { title?: string; items: LiveExample[] }[] = [];
  examples.forEach((ex, i) => {
    if (i === 0 || ex.groupTitle)
      groups.push({ title: ex.groupTitle, items: [] });
    groups[groups.length - 1].items.push(ex);
  });

  return (
    <div
      ref={rowRef}
      onMouseLeave={touch ? undefined : () => setActiveGroup(featuredGroup)}
      className="flex flex-col gap-6"
    >
      {groups.map((group, gi) => (
        <div
          key={group.title ?? gi}
          onMouseEnter={touch ? undefined : () => setActiveGroup(gi)}
          onFocusCapture={touch ? undefined : () => setActiveGroup(gi)}
        >
          {group.title && (
            <div className="mb-3 flex items-center gap-4">
              <span className="h-px flex-1 bg-[#F5F4DC]/15" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#d4af37] whitespace-nowrap">
                {group.title}
              </span>
              <span className="h-px flex-1 bg-[#F5F4DC]/15" />
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {group.items.map((ex) => (
              <LiveExampleCard
                key={ex.label}
                label={ex.label}
                desc={ex.desc}
                variants={ex.variants}
                createHref={ex.createHref}
                // Na dodir su sve kartice "aktivne", pa klip pusta samo onaj
                // koji je stvarno u vidokrugu (IntersectionObserver u
                // VariantClip-u). Pokazivacem svira cela grupa pod kursorom.
                active={touch || gi === activeGroup}
                onActivate={() => setActiveGroup(gi)}
                prebuffer={!touch}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
