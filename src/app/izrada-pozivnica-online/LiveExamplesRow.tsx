"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  const featured = Math.max(
    0,
    examples.findIndex((e) => e.featured),
  );
  const rowRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(featured);
  const touch = useTouchInput();

  useEffect(() => {
    const row = rowRef.current;
    if (!touch || !row) return;

    let queued = 0;
    const pick = () => {
      queued = 0;
      const rowBox = row.getBoundingClientRect();
      const mid = rowBox.left + rowBox.width / 2;
      let best = 0;
      let bestDist = Infinity;
      Array.from(row.children).forEach((child, i) => {
        const box = child.getBoundingClientRect();
        const dist = Math.abs(box.left + box.width / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(pick);
    };

    row.addEventListener("scroll", onScroll, { passive: true });
    pick();
    return () => {
      row.removeEventListener("scroll", onScroll);
      if (queued) cancelAnimationFrame(queued);
    };
  }, [touch]);

  return (
    <div
      ref={rowRef}
      onMouseLeave={touch ? undefined : () => setActive(featured)}
      // Cards carry their own padding, so the gap only has to keep the active
      // card's frame off its neighbour. Anything more overflowed the 1152px
      // container and put a scrollbar under the row.
      className="flex gap-1 sm:gap-2 overflow-x-auto snap-x snap-mandatory scroll-px-4 pb-4 -mx-4 px-4 justify-start xl:justify-center scrollbar-none"
    >
      {examples.map((ex, i) => (
        <LiveExampleCard
          key={ex.label}
          label={ex.label}
          desc={ex.desc}
          variants={ex.variants}
          createHref={ex.createHref}
          active={i === active}
          onActivate={() => setActive(i)}
          prebuffer={!touch}
        />
      ))}
    </div>
  );
}
