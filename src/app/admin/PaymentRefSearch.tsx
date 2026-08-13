"use client";

import { useState } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { formatPrice } from "@/data/pricing";

/**
 * Pretraga po pozivu na broj, iznad tabova. Namerno radi SAMO to — filter po
 * imenu ostaje u Pozivnice tabu, jer je to drugi posao (filtrira u letu nad
 * već učitanom listom, bez servera).
 *
 * Rezultat se NE prikazuje kao kartica: nalaz sam po sebi ne vredi ništa, treba
 * ti stavka u svom tabu sa svim akcijama. Zato se na jedan pogodak odmah skače
 * na odgovarajući tab i lista se suzi na tu stavku. Kartica se pokazuje samo
 * kad ima više pogodaka, da se odluči na koji se ide.
 *
 * Collapsible po istom obrascu kao nekadašnji kalendar iznad tabova
 * (grid-rows 0fr↔1fr), koji je kasnije premešten u tab Retro telefon.
 */

export interface RefHit {
  ref: string;
  source: "racun" | "placanje";
  kind: string;
  slug: string;
  displayName: string;
  amountRsd: number;
  issuedAt: string;
  status?: string;
  orderId?: string;
  tier?: string;
  settledAt?: string | null;
  items?: Array<{ l: string; p: number }>;
}

const KIND_LABEL: Record<string, string> = {
  pozivnica: "Pozivnica",
  rodjendan: "Rođendan",
  punoletstvo: "Punoletstvo",
  raspored: "Raspored sedenja",
  galerija: "Galerija",
  dogadjaj: "Događaj",
  telefon: "Retro telefon",
  custom: "Samostalni račun",
};

export default function PaymentRefSearch({
  onOpen,
  onNeedsLogin,
}: {
  /** Skoči na tab te stavke i suzi listu na nju. */
  onOpen: (hit: RefHit) => void;
  onNeedsLogin?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [choices, setChoices] = useState<RefHit[] | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);

  async function run() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setChoices(null);
    setNotFound(null);
    try {
      const r = await fetch(
        `/api/admin/payment-refs?ref=${encodeURIComponent(q)}`,
      );
      if (r.status === 401) {
        onNeedsLogin?.();
        return;
      }
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Greška pri pretrazi");
        return;
      }
      const hits: RefHit[] = d.hits ?? [];
      if (hits.length === 0) {
        setNotFound(d.ref);
        return;
      }
      if (hits.length === 1) {
        // Jedan pogodak — nema šta da se bira, vodi pravo na stavku.
        open(hits[0]);
        return;
      }
      setChoices(hits);
    } catch {
      setError("Greška u vezi sa serverom");
    } finally {
      setLoading(false);
    }
  }

  function open(hit: RefHit) {
    onOpen(hit);
    setIsExpanded(false);
    setChoices(null);
    setQuery("");
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors py-1 px-2 rounded-lg hover:bg-white/5 cursor-pointer"
      >
        <Search size={13} />
        <span>Pretraga po pozivu na broj</span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 mt-2">
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") run();
                }}
                placeholder="npr. 202608140905 ili HU914950274680"
                className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#AE343F]/60 transition-colors"
              />
              <button
                onClick={run}
                disabled={loading || !query.trim()}
                className="shrink-0 flex items-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Search size={15} />
                )}
                Traži
              </button>
            </div>

            <p className="text-[11px] text-white/30 mt-2">
              Vodi pravo na stavku u njenom tabu. Podnosi i model iz IPS-a
              (00…) i HU prefiks.
            </p>

            {error && <p className="text-[12px] text-red-400 mt-3">{error}</p>}

            {notFound && (
              <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[13px] text-white/60">
                  Ništa za <span className="font-mono">{notFound}</span>.
                </p>
                <p className="text-[11px] text-white/30 mt-1">
                  Računi generisani pre 14. 8. 2026. nisu zavedeni u bazi — kod
                  njih poziv na broj postoji samo u linku koji si poslao.
                </p>
              </div>
            )}

            {/* Isti broj u oba izvora je redak slučaj, ali tada nema nagađanja. */}
            {choices && (
              <div className="mt-3 space-y-2">
                <p className="text-[11px] text-white/40">
                  Više zapisa nosi ovaj poziv na broj — izaberi:
                </p>
                {choices.map((h) => (
                  <button
                    key={`${h.source}-${h.ref}`}
                    onClick={() => open(h)}
                    className="w-full text-left rounded-lg border border-white/10 bg-white/[0.03] hover:border-[#AE343F]/50 p-3 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                        {KIND_LABEL[h.kind] ?? h.kind}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {h.source === "placanje" ? "self-serve" : "račun"}
                      </span>
                    </div>
                    <p className="text-sm text-white font-medium">
                      {h.displayName}
                    </p>
                    <p className="text-[12px] text-white/50">
                      {formatPrice(h.amountRsd)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
