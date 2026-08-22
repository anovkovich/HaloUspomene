"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

/**
 * "Šta je ovo?" uz red u tabeli poređenja.
 *
 * Raspored sedenja, „Gde sedim?" i audio knjiga su jedina tri reda gde je
 * kvačica bezvredna dok ne znaš šta proizvod radi — a to su baš redovi u
 * kojima konkurencija nema ništa. Otvara se na klik, ne na hover, jer je
 * 79% saobraćaja sa telefona gde hover ne postoji.
 */
export default function ComparisonHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        aria-expanded={open}
        aria-label="Šta je ovo?"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[#AE343F]/60 transition-colors hover:text-[#AE343F] cursor-pointer"
      >
        <HelpCircle size={13} />
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-2 w-60 -translate-x-1/2 rounded-lg bg-[#232323] px-3 py-2 text-left text-[11px] font-normal normal-case leading-relaxed tracking-normal text-white shadow-xl"
        >
          {text}
        </span>
      )}
    </span>
  );
}
