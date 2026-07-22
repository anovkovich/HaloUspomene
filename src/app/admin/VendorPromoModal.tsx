"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Ticket } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function VendorPromoModal({ open, onClose, onCreated }: Props) {
  const [code, setCode] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [percent, setPercent] = useState<5 | 10>(10);
  const [commissionRsd, setCommissionRsd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCode("");
    setVendorName("");
    setContact("");
    setNote("");
    setPercent(10);
    setCommissionRsd("");
    setError(null);
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/vendor-promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          vendorName: vendorName.trim(),
          contact: contact.trim() || undefined,
          note: note.trim() || undefined,
          percent,
          commissionRsd: Number(commissionRsd) || 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Kreiranje nije uspelo.");
        return;
      }
      onCreated();
      onClose();
    } catch {
      setError("Greška u komunikaciji sa serverom.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#AE343F] disabled:opacity-50";
  const labelCls =
    "block text-[11px] font-bold uppercase tracking-[0.18em] text-white/40 mb-2";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#AE343F]/15 flex items-center justify-center text-[#AE343F]">
              <Ticket size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Novi vendor promo kod
              </h2>
              <p className="text-xs text-white/40 mt-0.5">
                Kod za preporuku — vendor ga daje parovima, ti pratiš aktivacije i
                proviziju. Radi i za vendore van direktorijuma.
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
            <label className={labelCls}>Kod</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
              placeholder="npr. FOTOTAJNA"
              className={`${inputCls} font-mono tracking-wider`}
              maxLength={20}
            />
            <p className="text-[10px] text-white/30 mt-1.5">
              4–20 znakova, slova A-Z i brojevi. Ne sme počinjati sa „HU“.
            </p>
          </div>

          <div>
            <label className={labelCls}>Vendor</label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              disabled={loading}
              placeholder="npr. Foto Tajna"
              className={inputCls}
              maxLength={120}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Popust</label>
              <div className="grid grid-cols-2 gap-2">
                {([5, 10] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPercent(p)}
                    disabled={loading}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 ${
                      percent === p
                        ? "bg-[#AE343F] text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Provizija / kupovini</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  value={commissionRsd}
                  onChange={(e) => setCommissionRsd(e.target.value)}
                  disabled={loading}
                  placeholder="0"
                  min={0}
                  max={100000}
                  className={`${inputCls} pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">
                  din
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Kontakt <span className="opacity-50">(opciono)</span>
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              disabled={loading}
              placeholder="telefon / email / IG"
              className={inputCls}
              maxLength={160}
            />
          </div>

          <div>
            <label className={labelCls}>
              Napomena <span className="opacity-50">(opciono)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              placeholder="npr. dogovoreno na sajmu, isplata kvartalno"
              className={inputCls}
              maxLength={300}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#AE343F] hover:bg-[#8d2a33] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 text-sm font-semibold transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Kreiranje...
              </>
            ) : (
              <>Napravi kod</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
