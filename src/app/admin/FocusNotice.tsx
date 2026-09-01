"use client";

import { X } from "lucide-react";

/**
 * Traka iznad liste kad je pretraga po pozivu na broj suzila prikaz na jednu
 * stavku. Postoji da suženo stanje nikad ne izgleda kao prazna baza — bez nje
 * bi tab delovao kao da su ostali zapisi nestali.
 */
export default function FocusNotice({
  paymentRef,
  count,
  onClear,
}: {
  /** Poziv na broj po kojem je lista suzena. NE zvati ga `ref` — to je
   *  rezervisano ime propa i React bi ga presreo umesto da ga prosledi. */
  paymentRef: string;
  /** Koliko je stavki ostalo posle sužavanja. */
  count: number;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-lg border border-[#AE343F]/40 bg-[#AE343F]/10">
      <span className="text-[12px] text-white/70 flex-1 min-w-0">
        {count === 0 ? (
          <>
            Nema stavke za poziv na broj{" "}
            <span className="font-mono text-white/90">{paymentRef}</span> u ovom
            tabu — možda je entitet obrisan.
          </>
        ) : (
          <>
            Prikazano po pozivu na broj{" "}
            <span className="font-mono text-white/90">{paymentRef}</span>
          </>
        )}
      </span>
      <button
        onClick={onClear}
        className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
      >
        <X size={12} />
        Prikaži sve
      </button>
    </div>
  );
}
