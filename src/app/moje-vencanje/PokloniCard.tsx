"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { Gift, Search, X, Plus, Trash2, Loader2, Link2, Download } from "lucide-react";
import {
  loadGuestListAction,
  loadPokloniAction,
  saveGiftsAction,
  getWeddingDataForPDF,
} from "./actions";
import { FALLBACK_EUR_RATE, toRSD } from "@/lib/currency";
import type { Invitee, GiftEntry, GiftKind } from "./types";

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "dj")
    .replace(/\s+/g, " ")
    .trim();
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatRSD(value: number): string {
  return Math.round(value).toLocaleString("sr-RS") + " din";
}

export default function PokloniCard({
  eurRate = FALLBACK_EUR_RATE,
}: {
  /** Live EUR→RSD rate (see src/lib/nbs-rate.ts); defaults to a fixed
   *  fallback while it's still loading. */
  eurRate?: number;
} = {}) {
  const [gifts, setGifts] = useState<GiftEntry[]>([]);
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Add-gift form state
  const [query, setQuery] = useState("");
  const [pickedInviteeId, setPickedInviteeId] = useState<string | undefined>();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [kind, setKind] = useState<GiftKind>("amount");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"RSD" | "EUR">("EUR");
  const [note, setNote] = useState("");

  useEffect(() => {
    Promise.all([loadPokloniAction(), loadGuestListAction()]).then(
      ([g, gl]) => {
        setGifts(g);
        setInvitees(gl?.invitees ?? []);
        setLoading(false);
      },
    );
  }, []);

  const q = normalizeName(query);
  const suggestions = useMemo(() => {
    if (!q) return [];
    return invitees
      .filter((i) => i.name.trim() && normalizeName(i.name).includes(q))
      .slice(0, 8);
  }, [invitees, q]);

  const persist = useCallback(async (next: GiftEntry[]) => {
    setSaving(true);
    const res = await saveGiftsAction(next);
    setSaving(false);
    if (!res || "error" in res) {
      toast.error("Greška pri čuvanju");
    }
  }, []);

  const pickInvitee = (i: Invitee) => {
    setQuery(i.name);
    setPickedInviteeId(i.id);
    setShowSuggestions(false);
  };

  const resetForm = () => {
    setQuery("");
    setPickedInviteeId(undefined);
    setKind("amount");
    setAmount("");
    setCurrency("EUR");
    setNote("");
  };

  const handleAdd = () => {
    const name = query.trim();
    if (!name) {
      toast("Unesite ime");
      return;
    }
    if (kind === "amount") {
      const num = parseFloat(amount.replace(",", "."));
      if (!amount || isNaN(num) || num <= 0) {
        toast("Unesite ispravan iznos");
        return;
      }
      const entry: GiftEntry = {
        id: uid(),
        name,
        linkedInviteeId: pickedInviteeId,
        kind: "amount",
        amount: num,
        currency,
        createdAt: new Date().toISOString(),
      };
      const next = [...gifts, entry];
      setGifts(next);
      persist(next);
    } else {
      if (!note.trim()) {
        toast("Unesite opis poklona");
        return;
      }
      const entry: GiftEntry = {
        id: uid(),
        name,
        linkedInviteeId: pickedInviteeId,
        kind: "note",
        note: note.trim(),
        createdAt: new Date().toISOString(),
      };
      const next = [...gifts, entry];
      setGifts(next);
      persist(next);
    }
    resetForm();
  };

  const handleRemove = (id: string) => {
    const next = gifts.filter((g) => g.id !== id);
    setGifts(next);
    persist(next);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const result = await getWeddingDataForPDF();
      if (!result) {
        toast.error("Greška pri učitavanju podataka. Pokušajte ponovo.");
        return;
      }
      const { generatePokloniPDF } = await import("./generatePokloniPDF");
      await generatePokloniPDF({
        slug: result.slug,
        coupleDisplay: result.weddingData.couple_names.full_display,
        scriptFont: result.weddingData.scriptFont,
        useCyrillic: result.weddingData.useCyrillic ?? false,
        eventDate: result.weddingData.event_date,
        gifts,
        totalRSD,
        noteCount,
      });
    } catch {
      toast.error("Greška pri pravljenju PDF-a. Pokušajte ponovo.");
    } finally {
      setExporting(false);
    }
  };

  const totalRSD = gifts.reduce(
    (s, g) => (g.kind === "amount" ? s + toRSD(g.amount ?? 0, g.currency, eurRate) : s),
    0,
  );
  const noteCount = gifts.filter((g) => g.kind === "note").length;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-[#AE343F]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#232323] flex items-center gap-2">
          <Gift size={22} className="text-[#AE343F]" />
          Pokloni
        </h2>
        <p className="text-sm text-[#232323]/60 mt-1">
          Evidencija poklona i priloga koje ste dobili od gostiju. Vidite
          samo vi.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#232323]/10 p-5 space-y-3">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#232323]/55"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPickedInviteeId(undefined);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Ime gosta (pretraži listu zvanica ili upišite novo ime)"
            className="w-full bg-white pl-10 pr-10 py-2.5 text-sm rounded-lg border border-[#232323]/20 placeholder:text-[#232323]/50 outline-none focus:border-[#AE343F] transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setPickedInviteeId(undefined);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#232323]/55 hover:text-[#232323] cursor-pointer transition-colors"
            >
              <X size={15} />
            </button>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-[#232323]/15 shadow-lg overflow-hidden">
              {suggestions.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickInvitee(i);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[#232323] hover:bg-[#F5F4DC]/60 cursor-pointer flex items-center gap-2"
                >
                  <Link2 size={12} className="text-[#4a8a5c] shrink-0" />
                  {i.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {pickedInviteeId && (
          <p className="text-[11px] text-[#3a6e49] flex items-center gap-1">
            <Link2 size={11} />
            Povezano sa zvanicom
          </p>
        )}

        <div className="flex gap-1.5">
          {(
            [
              { v: "amount" as const, l: "Novac" },
              { v: "note" as const, l: "Opisno" },
            ]
          ).map((t) => (
            <button
              key={t.v}
              type="button"
              onClick={() => setKind(t.v)}
              className={`flex-1 text-sm font-medium px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                kind === t.v
                  ? "bg-[#AE343F] text-white border-[#AE343F]"
                  : "bg-white text-[#232323]/75 border-[#232323]/15 hover:border-[#232323]/30"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>

        {kind === "amount" ? (
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Iznos"
              className="flex-1 min-w-0 bg-white px-3 py-2.5 text-sm rounded-lg border border-[#232323]/20 placeholder:text-[#232323]/50 outline-none focus:border-[#AE343F] transition-colors"
            />
            <div className="flex rounded-lg border border-[#232323]/20 overflow-hidden shrink-0">
              {(["EUR", "RSD"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${
                    currency === c
                      ? "bg-[#AE343F] text-white"
                      : "bg-white text-[#232323]/75 hover:bg-[#F5F4DC]/60"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Opis poklona (npr. vaza, poklon bon)"
            maxLength={120}
            className="w-full bg-white px-3 py-2.5 text-sm rounded-lg border border-[#232323]/20 placeholder:text-[#232323]/50 outline-none focus:border-[#AE343F] transition-colors"
          />
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#AE343F] hover:bg-[#8A2A32] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Plus size={15} />
          )}
          Dodaj poklon
        </button>
      </div>

      {gifts.length === 0 ? (
        <div className="text-center py-12 bg-[#F5F4DC]/30 rounded-xl border border-[#232323]/15">
          <Gift size={28} className="mx-auto mb-3 text-[#AE343F]/40" />
          <p className="text-sm text-[#232323]/65">
            Još uvek nema unetih poklona
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {gifts.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 bg-white rounded-xl border border-[#232323]/10 px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#232323] truncate flex items-center gap-1.5">
                  {g.name}
                  {g.linkedInviteeId && (
                    <Link2 size={11} className="text-[#4a8a5c] shrink-0" />
                  )}
                </p>
                <p className="text-xs text-[#232323]/60">
                  {g.kind === "amount"
                    ? `${g.amount?.toLocaleString("sr-RS")} ${g.currency}`
                    : g.note}
                </p>
              </div>
              <button
                onClick={() => handleRemove(g.id)}
                aria-label="Obriši poklon"
                className="shrink-0 p-2 rounded-lg text-[#232323]/40 hover:text-[#AE343F] hover:bg-[#AE343F]/8 transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {gifts.length > 0 && (
        <>
          <div className="bg-[#F5F4DC] rounded-2xl border border-[#d4af37]/35 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#232323]/55">
                Ukupno
              </p>
              {noteCount > 0 && (
                <p className="text-[11px] text-[#232323]/55 mt-0.5">
                  + {noteCount} opisnih poklona (nisu uračunati u sumu)
                </p>
              )}
            </div>
            <p className="font-serif text-2xl text-[#AE343F] font-semibold">
              {formatRSD(totalRSD)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exporting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#AE343F] border border-[#AE343F]/40 bg-white hover:bg-[#AE343F]/8 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {exporting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
            Preuzmi PDF
          </button>
        </>
      )}
    </div>
  );
}