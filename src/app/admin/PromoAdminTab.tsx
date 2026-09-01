"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  Gift,
  Copy,
  Pencil,
} from "lucide-react";
import { formatPrice } from "@/data/pricing";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import VendorPromoModal from "./VendorPromoModal";

/** Friend gift-code tiers, one button each. Each percent MUST have a matching LS
 *  discount code (`LS_FRIEND_DISCOUNT_CODE_<p>` env) or the card rail throws at
 *  checkout — see lsCodeForPercent in src/lib/payments/promo.ts. */
const FRIEND_PERCENTS = [75, 50, 20] as const;
type FriendPercent = (typeof FRIEND_PERCENTS)[number];

interface VendorPromoRow {
  code: string;
  vendorName: string;
  contact: string;
  note: string;
  percent: 5 | 10 | 20 | 50 | 75;
  commissionRsd: number;
  active: boolean;
  createdAt: string;
  type: "vendor" | "friend";
  maxUses: number | null;
  activations: number;
  owedRsd: number;
  usedUp: boolean;
}

export default function PromoAdminTab({
  onNeedsLogin,
}: {
  onNeedsLogin: () => void;
}) {
  const [rows, setRows] = useState<VendorPromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [genBusy, setGenBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { confirm, prompt, dialog } = useConfirmDialog({ variant: "dark" });

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/vendor-promos");
      if (r.status === 401) {
        onNeedsLogin();
        return;
      }
      const d = await r.json();
      if (Array.isArray(d.promos)) setRows(d.promos);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remove(code: string) {
    const ok = await confirm({
      title: "Obriši kod",
      message: `Ukloniti vendor kod „${code}“? Prošle aktivacije ostaju u evidenciji uplata.`,
      danger: true,
      confirmLabel: "Obriši",
    });
    if (!ok) return;
    setBusy(code);
    try {
      const r = await fetch(`/api/admin/vendor-promos/${encodeURIComponent(code)}`, {
        method: "DELETE",
      });
      if (r.status === 401) {
        onNeedsLogin();
        return;
      }
      if (r.ok) setRows((prev) => prev.filter((p) => p.code !== code));
    } finally {
      setBusy(null);
    }
  }

  async function generateFriend(percent: FriendPercent) {
    // Ask WHO it's for first — the generated code is random, so without a name
    // two gift codes in the list are indistinguishable. Optional: cancel aborts
    // the whole creation, an empty answer creates an unnamed code (renameable).
    const note = await prompt({
      title: `Prijatelj kod — ${percent}%`,
      message: "Kome je namenjen? Vidljivo je samo tebi, u ovoj listi.",
      input: { label: "Ime prijatelja", optional: true },
      confirmLabel: "Napravi kod",
    });
    if (note === null) return;

    setGenBusy(true);
    try {
      const r = await fetch("/api/admin/vendor-promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "friend", percent, note }),
      });
      if (r.status === 401) {
        onNeedsLogin();
        return;
      }
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.code) {
        await load();
        copyCode(d.code);
      }
    } finally {
      setGenBusy(false);
    }
  }

  /** Names (or renames) a code after the fact — also the only way to label the
   *  friend codes that existed before notes were a thing. */
  async function editNote(r: VendorPromoRow) {
    const note = await prompt({
      title: `Kome je ${r.code}?`,
      input: {
        label: "Ime prijatelja",
        defaultValue: r.note,
        optional: true,
      },
      confirmLabel: "Sačuvaj",
    });
    if (note === null) return;

    setBusy(r.code);
    try {
      const res = await fetch(
        `/api/admin/vendor-promos/${encodeURIComponent(r.code)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note }),
        },
      );
      if (res.status === 401) {
        onNeedsLogin();
        return;
      }
      if (res.ok) {
        setRows((prev) =>
          prev.map((p) => (p.code === r.code ? { ...p, note } : p)),
        );
      }
    } finally {
      setBusy(null);
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard blocked — user can select manually */
    }
  }

  // Ready-to-send message for a vendor partner — they forward the code to their
  // clients (couples). Copied verbatim so the founder never retypes it.
  async function copyVendorMessage(r: VendorPromoRow) {
    const msg =
      `Poštovani,\n\n` +
      `na osnovu našeg dogovora, kreiran je promo kod sa ${r.percent}% popusta ` +
      `na proizvode sa halouspomene.rs koji možete proslediti svojim klijentima (mladencima).\n\n` +
      `Promo kod: ${r.code}\n\n` +
      `Kod se unosi na stranici za plaćanje. Hvala na saradnji!\n\n` +
      `HaloUspomene`;
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(r.code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard blocked — user can select manually */
    }
  }

  const totalOwed = rows.reduce((s, r) => s + r.owedRsd, 0);

  return (
    <div>
      {dialog}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          Promo kodovi {rows.length > 0 && `(${rows.length})`}
        </h2>
        <div className="flex items-center gap-3">
          {totalOwed > 0 && (
            <span className="text-xs text-white/45">
              duguješ ukupno{" "}
              <span className="font-semibold text-white/70">
                {formatPrice(totalOwed)}
              </span>
            </span>
          )}
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs text-white/45 hover:text-white/80 transition-colors cursor-pointer"
          >
            <RefreshCw size={12} /> Osveži
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#AE343F] hover:bg-[#8d2a33] text-white px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
        >
          <Plus size={14} /> Vendor kod
        </button>
        {FRIEND_PERCENTS.map((p) => (
          <button
            key={p}
            onClick={() => generateFriend(p)}
            disabled={genBusy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white/80 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
          >
            {genBusy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Gift size={14} />
            )}{" "}
            Prijatelj {p}%
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/40 py-10 text-center text-sm">Učitavanje…</p>
      ) : rows.length === 0 ? (
        <p className="text-white/40 py-10 text-center text-sm">
          Još nema promo kodova.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.code}
              className={`rounded-xl px-3 py-2.5 border flex items-center justify-between gap-3 flex-wrap ${
                r.active
                  ? "bg-white/5 border-white/10"
                  : "bg-white/[0.02] border-white/5 opacity-60"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-semibold text-white tracking-wider">
                    {r.code}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#AE343F]/20 text-[#e39aa2]">
                    {r.percent}%
                  </span>
                  {r.type === "friend" && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                      <Gift size={10} /> prijatelj
                    </span>
                  )}
                  {r.type === "friend" && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        r.usedUp
                          ? "bg-white/10 text-white/40"
                          : "bg-blue-500/15 text-blue-300"
                      }`}
                    >
                      {r.usedUp ? "iskorišćen" : "neiskorišćen"}
                    </span>
                  )}
                  {!r.active && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                      neaktivan
                    </span>
                  )}
                </div>
                {r.type === "friend" ? (
                  <button
                    onClick={() => editNote(r)}
                    className="group flex items-center gap-1.5 text-xs mt-0.5 cursor-pointer"
                    title="Izmeni ime"
                  >
                    <span
                      className={
                        r.note ? "text-white/50" : "text-white/25 italic"
                      }
                    >
                      {r.note || "bez imena"}
                    </span>
                    <Pencil
                      size={11}
                      className="text-white/25 group-hover:text-white/60 transition-colors"
                    />
                  </button>
                ) : (
                  <div className="text-xs text-white/50 mt-0.5">
                    {r.vendorName}
                    {r.contact && (
                      <span className="text-white/30"> · {r.contact}</span>
                    )}
                  </div>
                )}
                <div className="text-[11px] text-white/35 mt-0.5">
                  {new Date(r.createdAt).toLocaleDateString("sr-RS")}
                  {r.type === "friend"
                    ? ` · ${r.activations} iskorišćenja`
                    : ` · ${r.activations} aktivacija · provizija ${formatPrice(r.commissionRsd)}`}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {r.type === "friend" ? (
                  <button
                    onClick={() => copyCode(r.code)}
                    className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    {copied === r.code ? (
                      <>
                        <Check size={13} className="text-emerald-400" /> kopirano
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> kopiraj
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => copyVendorMessage(r)}
                      className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
                      title="Kopiraj poruku sa kodom za vendora"
                    >
                      {copied === r.code ? (
                        <>
                          <Check size={13} className="text-emerald-400" /> kopirano
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> poruka
                        </>
                      )}
                    </button>
                    <span className="text-sm font-bold text-white">
                      {formatPrice(r.owedRsd)}
                    </span>
                  </>
                )}
                {busy === r.code ? (
                  <Loader2 size={16} className="animate-spin text-white/50" />
                ) : (
                  <button
                    onClick={() => remove(r.code)}
                    className="text-white/30 hover:text-red-300 transition-colors p-1 cursor-pointer"
                    aria-label="Obriši"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <VendorPromoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={load}
      />
    </div>
  );
}
