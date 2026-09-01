"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/**
 * The promo code + a copy button, for the RSVP-success offer box. A client
 * island inside the (server) InvitationOfferCTA. `textColor` is the box's
 * headline colour so the code + icon stay legible on every tone (theme / dark /
 * light); the copied state flips green, which reads on all three.
 */
export default function PromoCodeCopy({
  code,
  textColor,
}: {
  code: string;
  textColor: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-1">
      <span
        className="font-mono text-base font-bold tracking-wider"
        style={{ color: textColor }}
      >
        {code}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label="Kopiraj promo kôd"
        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-70 cursor-pointer"
        style={{ color: copied ? "#22c55e" : textColor }}
      >
        {copied ? (
          <>
            <Check size={14} /> Kopirano
          </>
        ) : (
          <>
            <Copy size={14} /> Kopiraj
          </>
        )}
      </button>
    </div>
  );
}
