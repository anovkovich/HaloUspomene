"use client";

import { useEffect, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import type { TocItem } from "@/lib/slugify-heading";

/**
 * Table of contents for blog posts.
 *
 * - variant="sidebar": slim sticky column (desktop, >= xl) with active-section
 *   highlighting via IntersectionObserver.
 * - variant="collapsible": <details> block above the article (below xl),
 *   closed by default. Works entirely without JS.
 *
 * Anchor links are plain <a href="#...">, so navigation works even if
 * JavaScript never loads — the observer is purely progressive enhancement.
 */
export default function TableOfContents({
  items,
  variant,
}: {
  items: TocItem[];
  variant: "sidebar" | "collapsible";
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (variant !== "sidebar") return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // Offset roughly matching the fixed navbar + scroll-margin on headings.
    const OFFSET = 130;

    const computeActive = () => {
      let current = headings[0].id;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - OFFSET <= 0) {
          current = heading.id;
        }
      }
      setActiveId(current);
    };

    computeActive();

    const observer = new IntersectionObserver(computeActive, {
      rootMargin: "-120px 0px -55% 0px",
      threshold: [0, 1],
    });
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [items, variant]);

  if (items.length === 0) return null;

  if (variant === "collapsible") {
    return (
      <details className="group mb-8 rounded-2xl border border-stone-200 bg-white/70 shadow-sm xl:hidden">
        <summary className="flex cursor-pointer select-none list-none items-center justify-between gap-2 px-5 py-3.5 text-sm font-semibold text-[#232323] [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <List size={16} className="text-[#AE343F]" aria-hidden="true" />
            Sadržaj
          </span>
          <ChevronDown
            size={16}
            className="text-[#232323]/40 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <nav aria-label="Sadržaj članka" className="px-5 pb-4">
          <ul className="space-y-1 border-t border-stone-100 pt-3 text-sm">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`block py-1 leading-snug text-[#232323]/60 transition-colors hover:text-[#AE343F] ${
                    item.depth === 3 ? "pl-5 text-[13px]" : "font-medium"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="Sadržaj članka" className="text-sm">
      <p className="mb-4 font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#232323]/40">
        Sadržaj
      </p>
      <ul className="space-y-0.5 border-l border-[#232323]/10">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`-ml-px block border-l-2 py-1.5 pr-2 leading-snug transition-colors ${
                  item.depth === 3 ? "pl-7 text-[13px]" : "pl-4"
                } ${
                  isActive
                    ? "border-[#AE343F] font-medium text-[#AE343F]"
                    : "border-transparent text-[#232323]/55 hover:border-[#AE343F]/40 hover:text-[#AE343F]"
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
