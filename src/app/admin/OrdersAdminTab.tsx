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
import FocusNotice from "./FocusNotice";

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
  /** LS-charged total incl. VAT (RSD) — the base LS takes its fee from. */
  lsTotalRsd: number | null;
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

/**
 * Procena Lemon Squeezy provizije. Tačan iznos NE stiže u webhook payloadu (LS
 * šalje samo total), vidi se tek na payoutu — zato je red u istoriji procena
 * ("~"). IPS i ručno evidentirane uplate ne plaćaju ništa i ne ulaze u račun.
 *
 * Kalibrisano na stvarnom payoutu od 28.08.2026 — TRI kartične transakcije
 * (4.500 + 4.799,45 sa PDV-om za stranog kupca + 100 test = 9.399,45 RSD):
 *   Earnings $91,92 · Fees $8,22 · Earnings RSD 9.399,85 ⇒ kurs 102,3 RSD/$
 *   (8,22 − 3 × 0,50) / 91,92 = 7,31 %
 * Gornja granica po objavljenom cenovniku je 8 % (5 % osnovno + 1,5 % strana
 * kartica + 1,5 % konverzija valute, jer se RSD naplaćuje preko USD) — izmereno
 * je nešto niže, verovatno jer neka od dve doplate ne pada na svaku uplatu.
 * PRERAČUNAJ obe konstante na sledećem payoutu: broj transakcija × 0,50 $ se
 * oduzme od Fees, ostatak podeli sa Earnings (USD).
 *
 * Osnovica je ono što je LS NAPLATIO (`lsTotalRsd`), dakle sa PDV-om koji LS
 * dodaje stranom kupcu — proviziju plaćamo i na taj deo, iako nam ne pripada.
 * Kad `lsTotalRsd` nema (order je pao u `review`, pa ga je admin odobrio ručno —
 * webhook u toj grani ne stigne da upiše `ls`), pada se na našu cenu, pa je
 * procena za tu uplatu manja od stvarne za proviziju na PDV.
 */
const LS_FEE_PERCENT = 0.073;
const LS_FEE_FIXED_RSD = 51; // ≈ 0,50 $ pri 102,3 RSD/$

/** Statuses that mean the money actually landed and stayed (refundirano /
 *  povučeno / odbijeno / isteklo namerno ne ulaze u mesečni zbir). */
const MONTH_SUM_STATUSES = new Set(["paid", "unlocked"]);

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("sr-Latn-RS", {
    month: "long",
    year: "numeric",
  });
}

/** Serbian numeric declension for the transaction count. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

interface MonthGroup {
  key: string;
  label: string;
  rows: OrderRow[];
  sumRsd: number;
  cardCount: number;
  feeRsd: number;
}

/** Splits an already newest-first list into month buckets with their totals. */
function groupByMonth(rows: OrderRow[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const o of rows) {
    const key = monthKey(o.createdAt);
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = {
        key,
        label: monthLabel(o.createdAt),
        rows: [],
        sumRsd: 0,
        cardCount: 0,
        feeRsd: 0,
      };
      groups.push(g);
    }
    g.rows.push(o);
    if (!MONTH_SUM_STATUSES.has(o.status)) continue;
    g.sumRsd += o.amountRsd;
    if (o.rail === "card") {
      g.cardCount += 1;
      g.feeRsd +=
        (o.lsTotalRsd ?? o.amountRsd) * LS_FEE_PERCENT + LS_FEE_FIXED_RSD;
    }
  }
  return groups;
}

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
  focusRef,
  focusLabel,
  onClearFocus,
}: {
  onNeedsLogin: () => void;
  onCountChange?: (n: number) => void;
  /** Poziv na broj iz pretrage — suzi listu na tu porudžbinu. */
  focusRef?: string | null;
  focusLabel?: string;
  onClearFocus?: () => void;
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

  // Fokus iz pretrage po pozivu na broj — suzi i actionable i istoriju, jer
  // tražena uplata može biti u bilo kojoj od njih.
  const visible = focusRef
    ? orders.filter((o) => o.ipsRef === focusRef || o.orderId === focusRef)
    : orders;
  const actionable = visible.filter(
    (o) => o.status === "review" || o.status === "pending",
  );
  const history = visible.filter(
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

      {focusRef && (
        <FocusNotice
          paymentRef={focusLabel ?? focusRef}
          count={visible.length}
          onClear={() => onClearFocus?.()}
        />
      )}

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
          {groupByMonth(history).map((g) => (
            <div key={g.key}>
              <MonthDivider group={g} />
              <div className="space-y-2">
                {g.rows.map((o) => (
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
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/** Month separator inside Istorija: naplaćeno u mesecu, pa procena LS provizije
 *  i neto iznos. Kada u mesecu nema nijedne kartične uplate, provizije nema. */
function MonthDivider({ group: g }: { group: MonthGroup }) {
  const fee = Math.round(g.feeRsd);
  return (
    <div className="flex items-baseline gap-3 flex-wrap mt-5 mb-2">
      <span className="text-[11px] uppercase tracking-wider text-white/45">
        {g.label}
      </span>
      <span className="h-px flex-1 min-w-6 bg-white/10 self-center" />
      <span className="text-sm font-semibold text-white/75 tabular-nums">
        {formatPrice(g.sumRsd)}
      </span>
      {g.cardCount > 0 && (
        <span
          className="text-[11px] text-white/35 tabular-nums"
          title="Procena: ~7,3% + 0,50 $ po transakciji, na iznos koji je LS naplatio (sa PDV-om ako je kupac iz inostranstva). Kalibrisano na payoutu od 28.08.2026. Tačan iznos vidiš tek na LS payoutu."
        >
          (− ~{formatPrice(fee)} LS provizija ·{" "}
          {g.cardCount}{" "}
          {plural(g.cardCount, "kartična", "kartične", "kartičnih")}{" "}
          {plural(g.cardCount, "uplata", "uplate", "uplata")} →{" "}
          {formatPrice(g.sumRsd - fee)} neto)
        </span>
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

