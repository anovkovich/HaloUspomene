"use client";

import { Eye } from "lucide-react";

/**
 * Freemium preview honesty + lock layer (B3). A draft invitation renders its
 * full self as a preview; this adds (1) a repeating diagonal "PREGLED + padlock"
 * watermark across the whole page and (2) a fixed top banner routing to publish.
 * Neither can be dismissed — they stay until the couple pays and it's published.
 * Both are pointer-events-none / non-blocking; the REAL gate is the server-side
 * guest-write `draft → 403`. Shared across classic + premium weddings and
 * birthdays/punoletstvo — `payHref` points at the right `/placanje/[kind]/[slug]`.
 */

// One repeating tile: a padlock glyph above the word PREGLED. Single-quoted so
// it survives encodeURIComponent cleanly into a data: URI. Every glyph is drawn
// twice — a white pass offset by 1px under a dark pass (emboss) — so the mark
// stays visible on dark theme backgrounds where a dark-only stroke disappears.
const TILE = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='170' viewBox='0 0 240 170'>
  <g transform='translate(1 1)' fill='none' stroke='#ffffff' stroke-opacity='0.22' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>
    <rect x='102' y='58' width='36' height='30' rx='5'/>
    <path d='M108 58 v-9 a12 12 0 0 1 24 0 v9'/>
    <circle cx='120' cy='71' r='2.5' fill='#ffffff' fill-opacity='0.22' stroke='none'/>
  </g>
  <g fill='none' stroke='#232323' stroke-opacity='0.14' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>
    <rect x='102' y='58' width='36' height='30' rx='5'/>
    <path d='M108 58 v-9 a12 12 0 0 1 24 0 v9'/>
    <circle cx='120' cy='71' r='2.5' fill='#232323' fill-opacity='0.14' stroke='none'/>
  </g>
  <text x='121' y='113' font-family='Arial, Helvetica, sans-serif' font-size='15' font-weight='700' letter-spacing='3' text-anchor='middle' fill='#ffffff' fill-opacity='0.2'>PREGLED</text>
  <text x='120' y='112' font-family='Arial, Helvetica, sans-serif' font-size='15' font-weight='700' letter-spacing='3' text-anchor='middle' fill='#232323' fill-opacity='0.13'>PREGLED</text>
</svg>`;

const WATERMARK_BG = `url("data:image/svg+xml,${encodeURIComponent(TILE)}")`;

export default function PreviewWatermark({ payHref }: { payHref: string }) {
  return (
    <>
      {/* Repeating diagonal watermark — permanent, over content, below the bar */}
      <div
        aria-hidden
        className="fixed pointer-events-none z-[55]"
        style={{
          top: "-60%",
          left: "-60%",
          width: "220%",
          height: "220%",
          transform: "rotate(-30deg)",
          backgroundImage: WATERMARK_BG,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Fixed publish banner — permanent, cannot be closed */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#232323]/95 text-[#F5F4DC] backdrop-blur-sm shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 py-2.5">
          <Eye size={15} className="shrink-0 text-[#F5F4DC]/70" />
          <p className="text-[12px] sm:text-sm flex-1 min-w-0">
            <span className="font-semibold">PREGLED</span>
            <span className="hidden sm:inline">
              {" "}
              — pozivnica je <strong>ZAKLJUČANA</strong>!
            </span>
          </p>
          {/* Plain <a target="_top"> — NOT next/link. This lives inside the
              desktop phone-frame iframe (InvitationFrame ?embed=1); a real
              anchor navigates the TOP browsing context out of the frame,
              whereas next/link would client-route inside the iframe. */}
          <a
            href={payHref}
            target="_top"
            className="shrink-0 rounded-full bg-[#AE343F] hover:bg-[#8A2A32] text-white px-4 sm:px-5 py-1.5 text-[12px] font-semibold transition-colors"
          >
            Plati i otključaj je!
          </a>
        </div>
      </div>
    </>
  );
}
