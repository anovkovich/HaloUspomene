"use client";

import { useEffect, useState } from "react";
import { Copy, Check, X, Globe, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const COUNTRIES: { code: "BA" | "HR" | "ME"; label: string; flag: string }[] = [
  { code: "BA", label: "Bosna i Hercegovina (+387)", flag: "BiH" },
  { code: "HR", label: "Hrvatska (+385)", flag: "HR" },
  { code: "ME", label: "Crna Gora (+382)", flag: "CG" },
];

export default function BypassLinkModal({ open, onClose }: Props) {
  const [country, setCountry] = useState<"BA" | "HR" | "ME">("BA");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; tokenId: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCountry("BA");
    setNote("");
    setError(null);
    setResult(null);
    setCopied(false);
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (!open) return null;

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bypass-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, note: note.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Generisanje nije uspelo.");
        return;
      }
      setResult({ url: data.url, tokenId: data.tokenId });
    } catch {
      setError("Greška u komunikaciji sa serverom.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
    } catch {
      // clipboard blocked — leave UI as-is, user can select manually
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#AE343F]/15 flex items-center justify-center text-[#AE343F]">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Bypass link za inostranstvo
              </h2>
              <p className="text-xs text-white/40 mt-0.5">
                Klijent otvara link i sam popunjava /napravi-pozivnicu bez SMS
                verifikacije. Važi 24 sata.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1 -mr-1 -mt-1"
            aria-label="Zatvori"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-white/40 mb-2">
              Zemlja
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCountry(c.code)}
                  disabled={loading || !!result}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                    country === c.code
                      ? "bg-[#AE343F] text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider opacity-70">
                    {c.flag}
                  </div>
                  <div className="text-[11px] font-mono opacity-80">
                    {c.code === "BA"
                      ? "+387"
                      : c.code === "HR"
                        ? "+385"
                        : "+382"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-white/40 mb-2">
              Beleška <span className="opacity-50">(opciono)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading || !!result}
              placeholder="npr. Marija iz Sarajeva"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#AE343F] disabled:opacity-50"
              maxLength={100}
            />
            <p className="text-[10px] text-white/30 mt-1.5">
              Samo za vašu evidenciju — ide u potpisanu nutrinu tokena.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {!result ? (
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#AE343F] hover:bg-[#8d2a33] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 text-sm font-semibold transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generisanje...
                </>
              ) : (
                <>Generiši link</>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80 mb-1.5">
                  Spreman za slanje
                </div>
                <div className="text-xs text-white/70 break-all font-mono leading-relaxed">
                  {result.url}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copy}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white py-2.5 text-sm font-medium transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={15} className="text-emerald-400" />
                      Kopirano
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      Kopiraj link
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setCopied(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors cursor-pointer"
                >
                  Novi
                </button>
              </div>
              <p className="text-[10px] text-white/30 text-center">
                ID tokena: <span className="font-mono">{result.tokenId}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
