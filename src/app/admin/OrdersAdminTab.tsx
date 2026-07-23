"use client";

import { useEffect, useState } from "react";
import {
  Check,
  X,
  Loader2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Ticket,
  Gift,
  Copy,
} from "lucide-react";
import { formatPrice } from "@/data/pricing";
import { KIND_LABEL_SR, productUrl } from "@/lib/payments/product-urls";
import type { PaymentKind } from "@/lib/orders";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import VendorPromoModal from "./VendorPromoModal";

interface OrderRow {
  orderId: string;
  kind: PaymentKind;
  slug: string;
  tier: string;
  rail: "card" | "ips" | null;
  status: string;
  amountRsd: number;
  amountEur: number;
  ipsRef: string;
  payerName: string | null;
  approvedBy: string | null;
  adminNote: string | null;
  createdAt: string;
  notifiedAt: string | null;
  dupWarning: boolean;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Čeka", cls: "bg-white/10 text-white/60" },
  review: { label: "Za overu", cls: "bg-amber-500/20 text-amber-300" },
  paid: { label: "Plaćeno (kartica)", cls: "bg-blue-500/20 text-blue-300" },
  unlocked: { label: "Plaćeno", cls: "bg-green-500/20 text-green-300" },
  canceled: { label: "Odbijeno", cls: "bg-white/5 text-white/35" },
  expired: { label: "Isteklo", cls: "bg-white/5 text-white/35" },
  refunded: { label: "Refundirano", cls: "bg-red-500/20 text-red-300" },
  revoked: { label: "Povučeno", cls: "bg-red-500/20 text-red-300" },
};

function ageLabel(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "sada";
  if (mins < 60) return `pre ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `pre ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `pre ${days} d`;
}

export default function OrdersAdminTab({
  onNeedsLogin,
  onCountChange,
}: {
  onNeedsLogin: () => void;
  onCountChange?: (n: number) => void;
}) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const { confirm, prompt, dialog } = useConfirmDialog({ variant: "dark" });

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/orders");
      if (r.status === 401) {
        onNeedsLogin();
        return;
      }
      const d = await r.json();
      if (Array.isArray(d.orders)) {
        setOrders(d.orders);
        onCountChange?.(
          d.orders.filter((o: OrderRow) => o.status === "review").length,
        );
      }
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

  async function act(orderId: string, action: "approve" | "reject") {
    let adminNote: string | undefined;
    if (action === "reject") {
      const note = await prompt({
        title: "Odbij uplatu",
        input: {
          label: "Razlog odbijanja (opciono) — biće vidljiv samo tebi",
          optional: true,
        },
        confirmLabel: "Odbij",
        danger: true,
      });
      if (note === null) return; // cancelled
      adminNote = note || undefined;
    } else {
      const row = orders.find((o) => o.orderId === orderId);
      const ok = await confirm({
        title: "Odobri uplatu",
        message: "Aktivirati pristup za ovaj order?",
        warning: row?.dupWarning
          ? "Postoji već plaćen order za isti proizvod — proveri duplu uplatu."
          : undefined,
        confirmLabel: "Odobri",
      });
      if (!ok) return;
    }

    setBusy(orderId);
    try {
      const r = await fetch(`/api/admin/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNote }),
      });
      if (r.status === 401) {
        onNeedsLogin();
        return;
      }
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        alert(d.error || "Greška. Pokušaj ponovo.");
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <p className="text-white/40 py-10 text-center">Učitavanje…</p>;
  }

  const actionable = orders.filter(
    (o) => o.status === "review" || o.status === "pending",
  );
  const history = orders.filter(
    (o) => o.status !== "review" && o.status !== "pending",
  );

  return (
    <div>
      {dialog}
      <VendorPromoSection onNeedsLogin={onNeedsLogin} />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          Uplate {actionable.length > 0 && `(${actionable.length})`}
        </h2>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-white/45 hover:text-white/80 transition-colors cursor-pointer"
        >
          <RefreshCw size={12} /> Osveži
        </button>
      </div>

      {orders.length === 0 && (
        <p className="text-center text-sm text-white/40 py-10">
          Još nema uplata.
        </p>
      )}

      {actionable.length > 0 && (
        <div className="space-y-3 mb-8">
          {actionable.map((o) => (
            <OrderCard key={o.orderId} o={o} busy={busy === o.orderId} onAct={act} />
          ))}
        </div>
      )}

      {history.length > 0 && (
        <>
          <span className="text-[10px] text-white/30 uppercase tracking-wider">
            Istorija
          </span>
          <div className="space-y-2 mt-2">
            {history.map((o) => (
              <OrderCard key={o.orderId} o={o} busy={false} onAct={act} compact />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function OrderCard({
  o,
  busy,
  onAct,
  compact = false,
}: {
  o: OrderRow;
  busy: boolean;
  onAct: (orderId: string, action: "approve" | "reject") => void;
  compact?: boolean;
}) {
  const st = STATUS_LABEL[o.status] ?? {
    label: o.status,
    cls: "bg-white/10 text-white/50",
  };
  const showActions = o.status === "review" || o.status === "pending";

  return (
    <div
      className={`rounded-xl px-4 py-3 border ${
        o.dupWarning
          ? "bg-amber-950/30 border-amber-500/30"
          : compact
            ? "bg-white/5 border-white/5 opacity-70"
            : "bg-white/5 border-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${st.cls}`}
            >
              {st.label}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
              {KIND_LABEL_SR[o.kind]}
              {o.tier === "custom"
                ? " · Vaša kombinacija"
                : o.tier !== "default"
                  ? ` · ${o.tier}`
                  : ""}
            </span>
            {o.rail && (
              <span className="text-[10px] text-white/35 uppercase">
                {o.rail === "card" ? "kartica" : "IPS"}
              </span>
            )}
            {o.dupWarning && (
              <span className="flex items-center gap-1 text-[10px] text-amber-300">
                <AlertTriangle size={11} /> proveri duplu uplatu
              </span>
            )}
          </div>
          <div className="text-sm text-white/80 font-medium">
            {o.payerName || o.slug}
          </div>
          <div className="text-xs text-white/40 flex items-center gap-2 flex-wrap">
            <a
              href={productUrl(o.kind, o.slug)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-white/70 transition-colors"
            >
              /{o.slug} <ExternalLink size={10} />
            </a>
            <span>· poziv na br. {o.ipsRef}</span>
            <span>· {ageLabel(o.createdAt)}</span>
          </div>
          {o.adminNote && (
            <div className="text-[11px] text-white/35 mt-1">
              Napomena: {o.adminNote}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-white">
            {formatPrice(o.amountRsd)}
          </span>
          {showActions &&
            (busy ? (
              <Loader2 size={18} className="animate-spin text-white/50" />
            ) : (
              <>
                <button
                  onClick={() => onAct(o.orderId, "approve")}
                  className="flex items-center gap-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Check size={13} /> Odobri
                </button>
                <button
                  onClick={() => onAct(o.orderId, "reject")}
                  className="flex items-center gap-1 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-300 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              </>
            ))}
        </div>
      </div>
    </div>
  );
}

interface VendorPromoRow {
  code: string;
  vendorName: string;
  contact: string;
  note: string;
  percent: 5 | 10 | 75;
  commissionRsd: number;
  active: boolean;
  createdAt: string;
  type: "vendor" | "friend";
  maxUses: number | null;
  activations: number;
  owedRsd: number;
  usedUp: boolean;
}

function VendorPromoSection({ onNeedsLogin }: { onNeedsLogin: () => void }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<VendorPromoRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [genBusy, setGenBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { confirm, dialog } = useConfirmDialog({ variant: "dark" });

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
      setLoaded(true);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  // Lazy-load the list only when the section is first expanded.
  useEffect(() => {
    if (open && !loaded) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  async function generateFriend(percent: 50 | 75) {
    setGenBusy(true);
    try {
      const r = await fetch("/api/admin/vendor-promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "friend", percent }),
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
    <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03]">
      {dialog}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white/80">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Ticket size={15} className="text-[#AE343F]" />
          Vendor promo kodovi
          {loaded && rows.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
              {rows.length}
            </span>
          )}
        </span>
        {loaded && totalOwed > 0 && (
          <span className="text-xs text-white/45">
            duguješ ukupno{" "}
            <span className="font-semibold text-white/70">
              {formatPrice(totalOwed)}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#AE343F] hover:bg-[#8d2a33] text-white px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus size={14} /> Vendor kod
            </button>
            <button
              onClick={() => generateFriend(75)}
              disabled={genBusy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white/80 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            >
              {genBusy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Gift size={14} />
              )}{" "}
              Prijatelj 75%
            </button>
            <button
              onClick={() => generateFriend(50)}
              disabled={genBusy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white/80 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            >
              {genBusy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Gift size={14} />
              )}{" "}
              Prijatelj 50%
            </button>
          </div>

          {loading ? (
            <p className="text-white/40 py-4 text-center text-sm">Učitavanje…</p>
          ) : rows.length === 0 ? (
            <p className="text-white/40 py-4 text-center text-sm">
              Još nema vendor kodova.
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
                    {r.type !== "friend" && (
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
