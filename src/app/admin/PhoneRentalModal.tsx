"use client";

import { useEffect, useState, useRef } from "react";
import { Phone, Calendar, Trash2, Copy, Check, X } from "lucide-react";
import type { PhoneRental } from "@/lib/phone-rentals";

interface PhoneRentalModalProps {
  onClose: () => void;
  bankAccountIdx: number;
}

export default function PhoneRentalModal({ onClose, bankAccountIdx }: PhoneRentalModalProps) {
  const [rentals, setRentals] = useState<PhoneRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [contactName, setContactName] = useState("");
  const [rentalDate, setRentalDate] = useState("");
  const [dobrodoslica, setDobrodoslica] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/admin/phone-rentals")
      .then((r) => r.json())
      .then((data) => {
        setRentals(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleAddRental() {
    if (!contactName.trim() || !rentalDate) {
      alert("Popunite sva polja");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/phone-rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: contactName,
          rental_date: rentalDate,
          dobrodoslica: dobrodoslica || undefined,
        }),
      });
      if (res.ok) {
        const newRental = await res.json();
        setRentals((prev) => [...prev, newRental].sort((a, b) => new Date(a.rental_date).getTime() - new Date(b.rental_date).getTime()));
        setContactName("");
        setRentalDate("");
        setDobrodoslica(false);
      }
    } catch (error) {
      console.error("Error adding rental:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRental(id: string) {
    if (!confirm("Obriši iznajmljivanje?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/phone-rentals/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRentals((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Error deleting rental:", error);
    } finally {
      setDeleting(false);
    }
  }

  function downloadIcs(dateStr: string, summary: string, filename: string) {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateFormatted = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${dateFormatted}`,
      `DTEND;VALUE=DATE:${dateFormatted}`,
      `SUMMARY:${summary}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function buildReceiptUrl(rental: PhoneRental) {
    const d = new Date(rental.rental_date);
    const pad = (n: number) => String(n).padStart(2, "0");
    const data = {
      s: rental.id, // tel-xxx
      par: rental.contact_name,
      datum: rental.rental_date,
      r: 0,
      a: 0,
      uk: 0,
      ub: 0,
      rp: 1, // retro phone
      pd: rental.dobrodoslica ? 1 : 0, // dobrodoslica addon
      cc: 0,
      ig: 0,
      d: rental.custom_discount ?? 0,
      ba: bankAccountIdx,
      t: Date.now(),
    };
    return `https://halouspomene.rs/racun?d=${btoa(unescape(encodeURIComponent(JSON.stringify(data))))}`;
  }

  async function handleGenerateReceipt(id: string) {
    const now = new Date().toISOString();
    const res = await fetch(`/api/admin/phone-rentals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receipt_valid: true, receipt_created: now }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRentals((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  }

  async function handleCopyReceiptUrl(id: string) {
    const rental = rentals.find((r) => r.id === id);
    if (!rental) return;
    const url = buildReceiptUrl(rental);
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  async function handleMarkPaid(id: string) {
    const res = await fetch(`/api/admin/phone-rentals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receipt_valid: false }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRentals((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  }

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[#1a1a1a] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-white/60" />
            <h2 className="text-xl font-semibold text-white">Iznajmljivanje telefona</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add Form */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white/80">Novo iznajmljivanje</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Ime osobe"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#AE343F]"
              />
              <input
                type="date"
                value={rentalDate}
                onChange={(e) => setRentalDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#AE343F]"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dobrodoslica"
                  checked={dobrodoslica}
                  onChange={(e) => setDobrodoslica(e.target.checked)}
                  className="rounded cursor-pointer"
                />
                <label htmlFor="dobrodoslica" className="text-xs text-white/70 cursor-pointer">
                  Dobrodošlica (1.000 din)
                </label>
              </div>
              <button
                onClick={handleAddRental}
                disabled={saving}
                className="w-full bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Dodajem..." : "Dodaj"}
              </button>
            </div>
          </div>

          {/* Rentals List */}
          {loading ? (
            <p className="text-white/40 text-sm">Učitavanje...</p>
          ) : rentals.length === 0 ? (
            <p className="text-white/40 text-sm">Nema iznajmljivanja</p>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/80">Lista ({rentals.length})</h3>
              {rentals.map((rental) => {
                const rentalDateObj = new Date(rental.rental_date);
                const formattedRentalDate = rentalDateObj.toLocaleDateString("sr-RS", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div key={rental.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{rental.contact_name}</p>
                          {rental.dobrodoslica && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                              Dobrodošlica
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50 mt-1">
                          📅 {formattedRentalDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Calendar pickup */}
                        <button
                          onClick={() =>
                            downloadIcs(
                              rental.rental_date,
                              `Iznajmljivanje telefona — ${rental.contact_name}`,
                              `iznajmljivanje-${rental.id}.ics`
                            )
                          }
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                          title="Dodaj u kalendar"
                        >
                          <Calendar size={14} />
                        </button>

                        {/* Receipt */}
                        <ReceiptDropdownMini
                          rental={rental}
                          copiedId={copiedId}
                          onGenerate={() => handleGenerateReceipt(rental.id)}
                          onCopy={() => handleCopyReceiptUrl(rental.id)}
                          onPaid={() => handleMarkPaid(rental.id)}
                        />

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteRental(rental.id)}
                          disabled={deleting}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-white/40 hover:text-red-400 disabled:opacity-50"
                          title="Obriši"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReceiptDropdownMini({
  rental,
  copiedId,
  onGenerate,
  onCopy,
  onPaid,
}: {
  rental: PhoneRental;
  copiedId: string | null;
  onGenerate: () => void;
  onCopy: () => void;
  onPaid: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isCopied = copiedId === rental.id;
  const isActive = rental.receipt_valid;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors text-[10px] flex items-center gap-1 cursor-pointer ${
          isActive ? "text-yellow-400 hover:text-yellow-300" : "text-white/30 hover:text-white/50"
        }`}
      >
        🧾
      </button>

      {open && (
        <div
          className="absolute bottom-full right-0 mb-1 rounded-lg overflow-hidden shadow-xl z-50"
          style={{ backgroundColor: "#2a2a2a", border: "1px solid rgba(255,255,255,0.1)", minWidth: 180 }}
        >
          <button
            onClick={() => {
              onGenerate();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors"
          >
            📋 {isActive ? "Regeneriši" : "Generiši"}
          </button>

          {isActive && (
            <>
              <button
                onClick={() => {
                  onCopy();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors border-t border-white/5"
              >
                {isCopied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {isCopied ? "✓ Kopiran!" : "Kopiraj link"}
              </button>

              <button
                onClick={() => {
                  onPaid();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-red-400/70 hover:bg-white/5 cursor-pointer transition-colors border-t border-white/5"
              >
                <Check size={12} /> Označi kao plaćeno
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
