"use client";

import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";

/**
 * The action pair under a locked feature in the planner: activate this one
 * thing now, or write to us — for details, or to agree several add-ons at once.
 *
 * Shared by the Audio knjiga and Galerija locked screens so the two never drift
 * apart. `checkoutHref` is optional because not every feature has a standalone
 * product — audio is only sold inside a package, so for a couple who already
 * bought something the checkout is deliberately absent rather than pointed at a
 * full-price tier they would be paying for twice.
 */

const WHATSAPP = "381677621766";

interface Props {
  /** Direct checkout (IPS or card). Omit when the feature has no own product. */
  checkoutHref?: string;
  /** Label for the checkout button, e.g. "Aktivirajte galeriju". */
  checkoutLabel?: string;
  /** Prefilled WhatsApp message — carries the slug so we know who is writing. */
  whatsappText: string;
  /** Shown instead of the checkout button when there is no direct product. */
  note?: string;
}

export default function ActivateCta({
  checkoutHref,
  checkoutLabel = "Aktivirajte",
  whatsappText,
  note,
}: Props) {
  return (
    <div className="rounded-xl border border-[#232323]/12 bg-[#faf9f6] p-4">
      <div className="flex flex-wrap items-center gap-2.5">
        {checkoutHref && (
          <Link
            href={checkoutHref}
            className="inline-flex items-center gap-2 rounded-xl bg-[#AE343F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8A2A32]"
          >
            <Sparkles size={15} />
            {checkoutLabel}
          </Link>
        )}
        <a
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-[#232323]/20 px-5 py-2.5 text-sm font-medium text-[#232323]/80 transition-colors hover:border-[#232323]/35 hover:bg-white"
        >
          <MessageCircle size={15} className="text-[#AE343F]" />
          Pišite nam za više detalja i dogovor
        </a>
      </div>
      <p className="mt-2.5 text-[11px] leading-relaxed text-[#232323]/55">
        {note ??
          "Plaćanje karticom ili prenosom preko IPS QR koda — aktivira se odmah po uplati."}
      </p>
    </div>
  );
}
