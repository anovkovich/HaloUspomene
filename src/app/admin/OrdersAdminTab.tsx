"use client";

import { useEffect, useState } from "react";
import {
  Check,
  X,
  Loader2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { formatPrice } from "@/data/pricing";
import { KIND_LABEL_SR, productUrl } from "@/lib/payments/product-urls";
import type { PaymentKind } from "@/lib/orders";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";

/**
 * Tiers used for products that have no `kind` of their own. A retro-phone
 * rental recorded MANUALLY (admin "Označi kao plaćeno") is filed under
 * `pozivnica` and would otherwise render as "Pozivnica · retro_telefon"; these
 * labels stand on their own instead. Self-serve phone orders don't come through
 * here — they carry the real `telefon` kind and read straight off KIND_LABEL_SR.
 */
const STANDALONE_TIER_LABEL: Record<string, string> = {
  retro_telefon: "Retro telefon",
};

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

  /** Removes a row that never saw money (odbijeno / isteklo / čeka). The server
   *  refuses anything paid, so a mis-click can't erase the money trail. */
  async function remove(orderId: string) {
    const row = orders.find((o) => o.orderId === orderId);
    const ok = await confirm({
      title: "Obriši uplatu iz evidencije?",
      message: `${orderId}${row ? ` — ${formatPrice(row.amountRsd)}` : ""}\nOvo briše zapis potpuno i ne može da se vrati.`,
      danger: true,
      confirmLabel: "Obriši",
    });
    if (!ok) return;

    setBusy(orderId);
    try {
      const r = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
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
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
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
            <OrderCard
              key={o.orderId}
              o={o}
              busy={busy === o.orderId}
              onAct={act}
              onRemove={remove}
            />
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
              <OrderCard
                key={o.orderId}
                o={o}
                busy={busy === o.orderId}
                onAct={act}
                onRemove={remove}
                compact
              />
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
  onRemove,
  compact = false,
}: {
  o: OrderRow;
  busy: boolean;
  onAct: (orderId: string, action: "approve" | "reject") => void;
  onRemove: (orderId: string) => void;
  compact?: boolean;
}) {
  const st = STATUS_LABEL[o.status] ?? {
    label: o.status,
    cls: "bg-white/10 text-white/50",
  };
  const showActions = o.status === "review" || o.status === "pending";
  // Mirrors the server rule in `isDeletableStatus` (src/lib/orders.ts): anything
  // that saw money stays as the audit trail and is refused there anyway.
  const canRemove = !["paid", "unlocked", "refunded", "revoked"].includes(
    o.status,
  );

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
              {STANDALONE_TIER_LABEL[o.tier] ?? (
                <>
                  {KIND_LABEL_SR[o.kind]}
                  {o.tier === "custom"
                    ? " · Vaša kombinacija"
                    : o.tier !== "default"
                      ? ` · ${o.tier}`
                      : ""}
                </>
              )}
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
                  title="Odbij — ostaje u istoriji"
                  className="flex items-center gap-1 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-300 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              </>
            ))}
          {canRemove && !busy && (
            <button
              onClick={() => onRemove(o.orderId)}
              title="Obriši iz evidencije — nepovratno"
              className="p-1.5 rounded-lg text-white/25 hover:text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer"
              aria-label="Obriši uplatu"
            >
              <Trash2 size={14} />
            </button>
          )}
          {busy && !showActions && (
            <Loader2 size={16} className="animate-spin text-white/50" />
          )}
        </div>
      </div>
    </div>
  );
}

