"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, X } from "lucide-react";

type Variant = "light" | "dark";

/**
 * Shown in SMS mode only: a foreign visitor without a Serbian number can't pass
 * the OTP, so point them to Instagram / WhatsApp where the admin issues a bypass
 * link. Collapsed to a single line ending in a clear "Klikni…" call-to-action;
 * tapping it opens a small popover with the full message + links. (In bypass
 * mode this never renders — they already have the link.)
 *
 * Shared by PhoneAuthField (raspored / galerija / deciji / punoletstvo) and the
 * napravi-pozivnicu wizard, so the message stays identical everywhere.
 */
export function ForeignCustomerNote({ variant }: { variant: Variant }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const dark = variant === "dark";
  const trigger = dark
    ? "text-white/55 group-hover:text-white/80"
    : "text-stone-400 group-hover:text-stone-600";
  const cta = dark
    ? "text-white/90 group-hover:text-white"
    : "text-[#AE343F] group-hover:text-[#8A2A32]";
  const card = dark
    ? "bg-[#1f1f1f] border-white/10 text-white/70"
    : "bg-white border-stone-200 text-stone-600 shadow-xl";
  const link = dark
    ? "text-white underline underline-offset-2 hover:text-white/80"
    : "text-[#AE343F] underline underline-offset-2 hover:opacity-80";

  return (
    <div ref={ref} className="relative mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group flex items-center gap-1 max-w-full text-[11px] leading-relaxed cursor-pointer"
      >
        <Globe size={12} className={`shrink-0 transition-colors ${trigger}`} />
        <span className={`truncate transition-colors ${trigger}`}>
          Nemate srpski broj i popunjavate iz inostranstva?
        </span>
        <span
          className={`shrink-0 font-semibold underline underline-offset-2 transition-colors ${cta}`}
        >
          Klikni…
        </span>
      </button>

      {open && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-50 w-[min(19rem,calc(100vw-2.5rem))] rounded-xl border p-3.5 pr-8 text-[12px] leading-relaxed ${card}`}
          role="dialog"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Zatvori"
            className={`absolute top-2 right-2 ${dark ? "text-white/40 hover:text-white/70" : "text-stone-400 hover:text-stone-600"}`}
          >
            <X size={14} />
          </button>
          Nemate srpski broj i popunjavate iz inostranstva? Pišite nam na{" "}
          <a
            href="https://www.instagram.com/halo_uspomene"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            Instagram
          </a>{" "}
          ili{" "}
          <a
            href="https://wa.me/381677621766"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            WhatsApp
          </a>{" "}
          — pošaljemo vam personalni link za pristup bez SMS-a.
        </div>
      )}
    </div>
  );
}
