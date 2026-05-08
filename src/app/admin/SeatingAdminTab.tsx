"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Armchair,
  ExternalLink,
  Users,
  Calendar,
  User,
  Phone,
  Receipt,
} from "lucide-react";
import type { StandaloneSeating } from "@/lib/standalone-seating";
import { encodeToBase64 } from "@/lib/encoding";
import DatePicker from "@/components/ui/DatePicker";

interface Props {
  onNeedsLogin: () => void;
  bankAccountIdx: number;
}

type AdminSeating = StandaloneSeating & {
  seatingStats?: { totalSeats: number; assignedSeats: number } | null;
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export default function SeatingAdminTab({ onNeedsLogin, bankAccountIdx }: Props) {
  const [seatings, setSeatings] = useState<AdminSeating[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [receiptCopiedSlug, setReceiptCopiedSlug] = useState<string | null>(
    null,
  );

  // Create form state
  const [createOwnerName, setCreateOwnerName] = useState("");
  const [createOwnerPhone, setCreateOwnerPhone] = useState("");
  const [createName, setCreateName] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/seatings");
    if (res.status === 401) {
      onNeedsLogin();
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setSeatings(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    const res = await fetch("/api/admin/seatings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerName: createOwnerName.trim(),
        ownerPhone: createOwnerPhone.trim(),
        eventName: createName.trim(),
        eventDate: createDate.trim() || undefined,
      }),
    });
    setCreating(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setCreateError(err.error ?? "Greška pri kreiranju");
      return;
    }
    setCreateOwnerName("");
    setCreateOwnerPhone("");
    setCreateName("");
    setCreateDate("");
    setShowCreate(false);
    await load();
  }

  async function handleToggleActive(slug: string, current: boolean) {
    const next = !current;
    setSeatings((prev) =>
      prev.map((s) => (s.slug === slug ? { ...s, active: next } : s)),
    );
    const res = await fetch(`/api/admin/seatings/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (!res.ok) {
      // revert on error
      setSeatings((prev) =>
        prev.map((s) => (s.slug === slug ? { ...s, active: current } : s)),
      );
    }
  }

  async function handleDelete() {
    if (!deleteSlug) return;
    if (confirmDeleteText !== deleteSlug) return;
    const res = await fetch(`/api/admin/seatings/${deleteSlug}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSeatings((prev) => prev.filter((s) => s.slug !== deleteSlug));
    }
    setDeleteSlug(null);
    setConfirmDeleteText("");
  }

  async function copyToClipboard(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  function toggleReveal(slug: string) {
    setRevealed((prev) => {
      const n = new Set(prev);
      if (n.has(slug)) n.delete(slug);
      else n.add(slug);
      return n;
    });
  }

  function urlFor(slug: string) {
    return `${SITE_URL}/raspored-sedenja/${slug}`;
  }

  function buildReceiptUrl(s: StandaloneSeating) {
    const data: Record<string, unknown> = {
      kind: "raspored",
      s: s.slug,
      par: s.eventName,
      datum: s.eventDate,
      d: s.custom_discount ?? 0,
      ba: bankAccountIdx,
      t: Date.now(),
    };
    return `${SITE_URL}/racun?d=${encodeToBase64(data)}`;
  }

  async function patchSeating(slug: string, body: Record<string, unknown>) {
    return fetch(`/api/admin/seatings/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function handleGenerateReceipt(slug: string) {
    const now = new Date().toISOString();
    setSeatings((prev) =>
      prev.map((s) =>
        s.slug === slug
          ? { ...s, receipt_valid: true, receipt_created: now }
          : s,
      ),
    );
    const res = await patchSeating(slug, {
      receipt_valid: true,
      receipt_created: now,
    });
    if (!res.ok) {
      setSeatings((prev) =>
        prev.map((s) =>
          s.slug === slug ? { ...s, receipt_valid: false } : s,
        ),
      );
      alert(`Greška: Račun nije generisan (${res.status})`);
    }
  }

  async function handleInvalidateReceipt(slug: string) {
    setSeatings((prev) =>
      prev.map((s) =>
        s.slug === slug ? { ...s, receipt_valid: false } : s,
      ),
    );
    await patchSeating(slug, { receipt_valid: false });
  }

  async function handleSetDiscount(slug: string, amount: number) {
    setSeatings((prev) =>
      prev.map((s) =>
        s.slug === slug ? { ...s, custom_discount: amount } : s,
      ),
    );
    await patchSeating(slug, { custom_discount: amount });
  }

  async function copyReceiptLink(s: StandaloneSeating) {
    const url = buildReceiptUrl(s);
    await navigator.clipboard.writeText(url);
    setReceiptCopiedSlug(s.slug);
    setTimeout(() => setReceiptCopiedSlug(null), 2500);
  }

  if (loading) return <p className="text-white/40">Učitavanje...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          <span className="hidden sm:inline">Standalone raspored sedenja</span>
          <span className="sm:hidden">Raspored sedenja</span>
          {" "}({seatings.length})
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Novi pristup</span><span className="sm:hidden">Novi</span>
        </button>
      </div>

      {/* Empty state */}
      {seatings.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-16 px-6 text-center">
          <Armchair size={28} className="mx-auto text-white/30 mb-3" />
          <p className="text-sm text-white/60 mb-1">Još nema kreiranih pristupa</p>
          <p className="text-xs text-white/40">
            Klikni „Novi pristup" da generišeš link i 6-cifarni PIN za klijenta.
          </p>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {seatings.map((s) => {
          const isRevealed = revealed.has(s.slug);
          const url = urlFor(s.slug);
          const eventDate = s.eventDate ? new Date(s.eventDate) : null;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const eventDay = eventDate ? new Date(eventDate) : null;
          eventDay?.setHours(0, 0, 0, 0);
          const isPast = eventDay ? eventDay < today : false;

          return (
            <div
              key={s.slug}
              className={`rounded-xl px-4 py-4 sm:px-5 ${
                !s.active
                  ? "bg-white/[0.02] border border-white/10 opacity-60"
                  : isPast
                    ? "bg-white/[0.03] border border-white/10 opacity-75"
                    : "bg-white/5 border border-[#2563eb]/30"
              }`}
            >
              {/* Top row: title (+ status badges) on the left, actions on the right */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <h3 className="text-base font-semibold text-white truncate">
                    {s.eventName}
                  </h3>
                  {!s.active && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-300 shrink-0">
                      Onemogućen
                    </span>
                  )}
                  {isPast && s.active && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/50 shrink-0">
                      Prošao
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleActive(s.slug, s.active)}
                    className={`text-[11px] px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      s.active
                        ? "bg-white/5 text-white/60 hover:bg-white/10"
                        : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                    }`}
                  >
                    {s.active ? "Onemogući" : "Aktiviraj"}
                  </button>
                  <button
                    onClick={() => setDeleteSlug(s.slug)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                    title="Obriši (cascade delete)"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Metadata: owner, phone, date, guests, seating stats */}
              <div className="mt-1 flex items-center gap-x-3 gap-y-1 text-xs text-white/50 flex-wrap">
                {s.ownerName && (
                  <span className="flex items-center gap-1.5">
                    <User size={11} /> {s.ownerName}
                  </span>
                )}
                {s.ownerPhone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={11} /> {s.ownerPhone}
                  </span>
                )}
                {eventDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={11} />{" "}
                    {eventDate.toLocaleDateString("sr-RS")}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users size={11} /> {s.guests.length} gostiju
                </span>
                {s.seatingStats && (
                  <span className="flex items-center gap-1.5">
                    <Armchair size={11} />
                    {s.seatingStats.assignedSeats}/
                    {s.seatingStats.totalSeats} raspoređeno
                    {s.seatingStats.totalSeats > 0 && (
                      <span className="inline-block w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <span
                          className="block h-full bg-[#2563eb] rounded-full transition-all"
                          style={{
                            width: `${Math.round((s.seatingStats.assignedSeats / s.seatingStats.totalSeats) * 100)}%`,
                          }}
                        />
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Credentials block — wraps top→bottom on narrow viewports */}
              <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                {/* URL */}
                <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg px-3 py-1.5 flex-1 basis-full sm:basis-[260px] min-w-0">
                  <ExternalLink size={11} className="text-white/40 shrink-0" />
                  <code className="text-[11px] text-white/70 truncate flex-1 min-w-0">
                    {url}
                  </code>
                  <button
                    onClick={() => copyToClipboard(url, `url-${s.slug}`)}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Kopiraj URL"
                  >
                    {copied === `url-${s.slug}` ? (
                      <Check size={11} className="text-emerald-400" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                </div>

                {/* Password */}
                <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg px-3 py-1.5 shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">
                    PIN
                  </span>
                  <code className="text-[12px] font-mono tabular-nums text-white/80 tracking-widest">
                    {isRevealed ? s.password : "••••••"}
                  </code>
                  <button
                    onClick={() => toggleReveal(s.slug)}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                    title={isRevealed ? "Sakrij" : "Prikaži"}
                  >
                    {isRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>
                  <button
                    onClick={() =>
                      copyToClipboard(s.password, `pin-${s.slug}`)
                    }
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                    title="Kopiraj PIN"
                  >
                    {copied === `pin-${s.slug}` ? (
                      <Check size={11} className="text-emerald-400" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                </div>

                {/* Combined copy (URL + PIN block for sharing) */}
                <button
                  onClick={() =>
                    copyToClipboard(
                      `Pristup za raspored sedenja:\n${url}\nPIN: ${s.password}`,
                      `combo-${s.slug}`,
                    )
                  }
                  className="text-[11px] px-3 py-1.5 rounded bg-[#2563eb]/15 text-[#60a5fa] hover:bg-[#2563eb]/25 transition-colors cursor-pointer shrink-0"
                >
                  {copied === `combo-${s.slug}`
                    ? "Kopirano!"
                    : "Kopiraj za slanje"}
                </button>
              </div>

              <SeatingReceiptDropdown
                seating={s}
                copiedSlug={receiptCopiedSlug}
                onGenerate={async () => {
                  await handleGenerateReceipt(s.slug);
                  await copyReceiptLink({
                    ...s,
                    receipt_valid: true,
                    receipt_created: new Date().toISOString(),
                  });
                }}
                onCopy={() => copyReceiptLink(s)}
                onPaid={() => handleInvalidateReceipt(s.slug)}
                onDiscount={(amount) => handleSetDiscount(s.slug, amount)}
              />
            </div>
          );
        })}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowCreate(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreate}
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-white mb-1">
              Novi standalone pristup
            </h3>
            <p className="text-xs text-white/50 mb-5">
              Generiše slug + 6-cifarni PIN. Klijent dobija pristup samo
              preko URL-a + PIN-a koje ti manuelno deliš.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">
                    Ime klijenta
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={createOwnerName}
                    onChange={(e) => setCreateOwnerName(e.target.value)}
                    placeholder="Marko Petrović"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#2563eb]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">
                    Telefon klijenta (opciono)
                  </label>
                  <input
                    type="tel"
                    value={createOwnerPhone}
                    onChange={(e) => setCreateOwnerPhone(e.target.value)}
                    placeholder="+381 6X XXX XXXX"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#2563eb]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">
                  Ime eventa
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="npr. Konferencija Beograd 2026"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#2563eb]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">
                  Datum eventa (opciono)
                </label>
                <DatePicker
                  value={createDate}
                  onChange={setCreateDate}
                  variant="dark"
                  accentColor="#2563eb"
                  placeholder="Izaberite datum eventa"
                  showQuickActions={false}
                />
              </div>
            </div>

            {createError && (
              <p className="text-xs text-red-400 mt-3">{createError}</p>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Otkaži
              </button>
              <button
                type="submit"
                disabled={creating}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                {creating ? "Kreiram..." : "Kreiraj pristup"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteSlug && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setDeleteSlug(null);
            setConfirmDeleteText("");
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1a1a] border border-red-500/20 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-white mb-1">
              Obriši pristup?
            </h3>
            <p className="text-xs text-white/60 mb-4">
              Ovo trajno briše seating record + sve goste + sačuvani layout
              stolova. Nema undo.
            </p>
            <p className="text-xs text-white/40 mb-2">
              Otkucaj slug{" "}
              <code className="text-[#60a5fa]">{deleteSlug}</code> da
              potvrdiš:
            </p>
            <input
              type="text"
              value={confirmDeleteText}
              onChange={(e) => setConfirmDeleteText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-500/50 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setDeleteSlug(null);
                  setConfirmDeleteText("");
                }}
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Otkaži
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmDeleteText !== deleteSlug}
                className="bg-red-500/20 hover:bg-red-500/30 disabled:opacity-30 text-red-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
              >
                Trajno obriši
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SeatingReceiptDropdown({
  seating,
  copiedSlug,
  onGenerate,
  onCopy,
  onPaid,
  onDiscount,
}: {
  seating: StandaloneSeating;
  copiedSlug: string | null;
  onGenerate: () => void;
  onCopy: () => void;
  onPaid: () => void;
  onDiscount: (amount: number) => void;
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

  const isCopied = copiedSlug === seating.slug;
  const isActive = seating.receipt_valid;

  return (
    <div ref={ref} className="relative mt-2 pt-2 border-t border-white/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-[10px] cursor-pointer transition-colors ${
          isActive
            ? "text-green-400 hover:text-green-300"
            : "text-white/30 hover:text-white/50"
        }`}
      >
        <Receipt size={11} />
        {isCopied
          ? "✓ Link kopiran!"
          : isActive
            ? "Račun aktivan"
            : "Račun"}
        <svg
          width="10"
          height="10"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 mb-1 rounded-lg overflow-hidden shadow-xl z-30"
          style={{
            backgroundColor: "#2a2a2a",
            border: "1px solid rgba(255,255,255,0.1)",
            minWidth: 220,
          }}
        >
          <button
            onClick={() => {
              onGenerate();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <Receipt size={12} className="text-yellow-400" />
            {isActive ? "Regeneriši račun" : "Generiši račun"}
          </button>

          {isActive && (
            <button
              onClick={() => {
                onCopy();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <Copy size={12} className="text-green-400" />
              Kopiraj link
            </button>
          )}

          {isActive && (
            <button
              onClick={() => {
                onPaid();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-red-400/70 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <Check size={12} />
              Označi kao plaćeno
            </button>
          )}

          <div className="px-4 py-2.5 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/30">Popust:</span>
              <input
                type="number"
                min={0}
                step={500}
                value={seating.custom_discount ?? 0}
                onChange={(e) => onDiscount(parseInt(e.target.value) || 0)}
                className="w-16 text-[11px] text-white/60 bg-white/5 border border-white/10 rounded px-2 py-1 text-right outline-none focus:border-white/20"
              />
              <span className="text-[10px] text-white/30">din</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
