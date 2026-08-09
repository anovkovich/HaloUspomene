"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Images,
  ExternalLink,
  QrCode,
  CalendarPlus,
  Receipt,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import type { MarkPaidTarget } from "@/lib/admin-mark-paid";
import { encodeToBase64 } from "@/lib/encoding";
import {
  buildReceiptItems,
  currentPriceTable,
  type ReceiptFlags,
} from "@/lib/receipt-items";
import { formatPrice } from "@/data/pricing";
import ShareLinkButton from "./ShareLinkButton";
import { downloadGalleryQR, galleryShareUrl } from "@/lib/gallery-qr";
import { galleryPhase, type GalleryPhase } from "@/lib/gallery-lifecycle";
import { isGalleryOnlyCouple } from "@/lib/gallery-only";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";
const ACCENT = "#7c3aed";

/** Subset of the admin couple row this tab needs. Structurally satisfied by the
 *  `Couple` shape in page.tsx, which is what actually gets passed in. */
export interface GalleryCouple {
  slug: string;
  couple_names: { bride: string; groom: string; full_display: string };
  event_date: string;
  potvrde_password?: string;
  paid_for_gallery?: boolean;
  paid_for_raspored?: boolean;
  paid_for_audio?: boolean;
  premium_paid?: boolean;
  draft?: boolean;
  gallery_extra_days?: number;
  gallery_purged_at?: string;
  gallery_key?: string;
  standalone_gallery?: boolean;
  receipt_valid?: boolean;
  custom_discount?: number;
  receipt_custom_items?: ReceiptCustomItem[];
  created_at?: string;
}

/** A saved extra receipt line, in the same shape /racun reads (`l`abel, `p`rice). */
export interface ReceiptCustomItem {
  l: string;
  p: number;
}

interface Props {
  couples: GalleryCouple[];
  shareStats: Record<string, { visit_count: number; last_visited_at?: string }>;
  bankAccountIdx: number;
  copiedSlug: string | null;
  onToggleGallery: (slug: string, current: boolean) => void;
  onExtendGallery: (slug: string, current: number) => void;
  onDelete: (slug: string) => void;
  onCreated: () => void | Promise<void>;
  /** Flips receipt_valid on the couple so /racun accepts the link. */
  onGenerateReceipt: (slug: string) => void | Promise<void>;
  /** Opens the shared "Označi kao plaćeno" modal, which writes the order that
   *  shows up on the Uplate tab. Same flow as the Pozivnice tab. */
  onMarkPaid: (target: MarkPaidTarget) => void;
  onDiscount: (slug: string, amount: number) => void;
  /** Persists the extra receipt lines onto the couple. Called on blur / remove,
   *  so an admin who types a line and walks away still has it tomorrow. */
  onSaveItems: (slug: string, items: ReceiptCustomItem[]) => void | Promise<void>;
  onCopiedSlug: (slug: string) => void;
}

interface CustomItemDraft {
  label: string;
  price: string;
}

const PHASE_LABEL: Record<GalleryPhase, string> = {
  before: "Pre događaja",
  upload: "Gosti šalju slike",
  access: "Preuzimanje u toku",
  "last-access": "Poslednji dan pristupa",
  grace: "Pristup istekao",
  expired: "Slike obrisane",
  unknown: "Bez datuma",
};

const PHASE_CLASS: Record<GalleryPhase, string> = {
  before: "bg-white/10 text-white/60",
  upload: "bg-emerald-500/15 text-emerald-300",
  access: "bg-violet-500/15 text-violet-300",
  "last-access": "bg-amber-500/15 text-amber-300",
  grace: "bg-orange-500/15 text-orange-300",
  expired: "bg-white/5 text-white/40",
  unknown: "bg-red-500/15 text-red-300",
};

/** Custom items the admin typed, cleaned into receipt line items. */
function cleanCustomItems(drafts: CustomItemDraft[]): ReceiptCustomItem[] {
  return drafts
    .map((it) => ({ l: it.label.trim(), p: Math.round(Number(it.price) || 0) }))
    .filter((it) => it.l.length > 0);
}

/** Saved items → editable drafts. The price becomes a string because the input
 *  is controlled and must be able to hold an empty value while being typed. */
function toDrafts(saved: ReceiptCustomItem[] | undefined): CustomItemDraft[] {
  return (saved ?? []).map((it) => ({ label: it.l, price: String(it.p) }));
}

/**
 * Frozen quote: the line items are snapshotted into the payload (`v: 2`), so a
 * later pricing.json edit can never change an already-sent receipt — the NBS IPS
 * QR on /racun encodes exactly this total.
 *
 * Module scope, not a closure over component state: it stamps `Date.now()` and
 * only ever runs from a click handler, so the render pass stays pure.
 */
function buildGalleryReceiptUrl(
  c: GalleryCouple,
  opts: { customItems: CustomItemDraft[]; bankAccountIdx: number }
) {
  const ci = cleanCustomItems(opts.customItems);
  const data: Record<string, unknown> = {
    kind: "galerija",
    s: c.slug,
    par: c.couple_names?.full_display || c.slug,
    datum: c.event_date,
    // Discount lives on the couple (same as the Pozivnice tab), so the number
    // on the receipt matches what the admin sees in the dropdown.
    d: c.custom_discount ?? 0,
    ba: opts.bankAccountIdx,
    t: Date.now(),
    ...(ci.length ? { ci } : {}),
  };
  const { items, bundleDiscount } = buildReceiptItems(
    data as unknown as ReceiptFlags,
    currentPriceTable()
  );
  return `${SITE_URL}/racun?d=${encodeToBase64({ ...data, v: 2, li: items, bd: bundleDiscount })}`;
}

/** What the client will be asked to pay — base gallery + extras − discount.
 *  Prefills the mark-paid modal, so it must match the receipt exactly. */
function galleryReceiptTotal(
  drafts: CustomItemDraft[],
  discount: number
): number {
  const ciSum = cleanCustomItems(drafts).reduce((acc, it) => acc + it.p, 0);
  return Math.max(0, currentPriceTable().galerija + ciSum - discount);
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("sr-RS", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function GalleryAdminTab({
  couples,
  shareStats,
  bankAccountIdx,
  copiedSlug,
  onToggleGallery,
  onExtendGallery,
  onDelete,
  onCreated,
  onGenerateReceipt,
  onMarkPaid,
  onDiscount,
  onSaveItems,
  onCopiedSlug,
}: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);


  // Create form
  const [createName, setCreateName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{
    slug: string;
    password: string;
    galleryKey?: string;
  } | null>(null);

  // Origin marker, not the derived lock: a client who later buys an invitation
  // should stay visible here too, so the gallery still has an admin home.
  const galleries = useMemo(
    () => couples.filter((c) => c.standalone_gallery),
    [couples]
  );

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

  function resetCreateForm() {
    setCreateName("");
    setCreatePhone("");
    setCreateDate("");
    setCreateError("");
    setCreated(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    const res = await fetch("/api/admin/galleries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: createName.trim(),
        phone: createPhone.trim(),
        eventDate: createDate.trim(),
      }),
    });
    setCreating(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setCreateError(err.error ?? "Greška pri kreiranju");
      return;
    }
    const data = (await res.json()) as {
      slug: string;
      password: string;
      galleryKey?: string;
    };
    setCreated(data);
    await onCreated();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          <span className="hidden sm:inline">Samostalne QR galerije</span>
          <span className="sm:hidden">QR galerije</span> ({galleries.length})
        </h2>
        <button
          onClick={() => {
            resetCreateForm();
            setShowCreate(true);
          }}
          className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nova galerija</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      {galleries.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-16 px-6 text-center">
          <Images size={28} className="mx-auto text-white/30 mb-3" />
          <p className="text-sm text-white/60 mb-1">
            Još nema samostalnih galerija
          </p>
          <p className="text-xs text-white/40">
            Klikni &bdquo;Nova galerija&ldquo; da generišeš pristup, lozinku i QR
            kod za klijenta.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {galleries.map((c) => {
          const isRevealed = revealed.has(c.slug);
          const extraDays = c.gallery_extra_days ?? 0;
          const phase = galleryPhase(c.event_date, extraDays);
          // Keyed link — the one the client forwards to guests; it also works
          // before the event. The QR button below stays key-less on purpose.
          const guestUrl = galleryShareUrl(c.slug, c.gallery_key);
          const portalUrl = `${SITE_URL}/moje-vencanje/`;
          const paid = c.paid_for_gallery ?? false;
          const upgraded = !isGalleryOnlyCouple(c);

          return (
            <div
              key={c.slug}
              className={`rounded-xl px-4 py-4 sm:px-5 ${
                !paid
                  ? "bg-white/[0.02] border border-white/10 opacity-70"
                  : phase === "expired"
                    ? "bg-white/[0.03] border border-white/10 opacity-75"
                    : "bg-white/5 border border-[#7c3aed]/30"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <h3 className="text-base font-semibold text-white truncate">
                    {c.couple_names?.full_display || c.slug}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${PHASE_CLASS[phase]}`}
                  >
                    {PHASE_LABEL[phase]}
                  </span>
                  {!paid && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300">
                      Nije plaćeno
                    </span>
                  )}
                  {extraDays > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                      +{extraDays} dan(a)
                    </span>
                  )}
                  {upgraded && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#AE343F]/20 text-[#f0a0a8]"
                      title="Klijent je dokupio još nešto — portal mu je otključan"
                    >
                      Dokupio
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => downloadGalleryQR(c.slug)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                    title="Preuzmi QR kod za goste"
                  >
                    <QrCode size={15} />
                  </button>
                  <button
                    onClick={() => onExtendGallery(c.slug, extraDays)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                    title="Produži pristup za +1 dan"
                  >
                    <CalendarPlus size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(c.slug)}
                    className="p-2 rounded-lg hover:bg-red-500/15 text-white/40 hover:text-red-300 transition-colors cursor-pointer"
                    title="Obriši"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="mt-1 text-xs text-white/40">
                /{c.slug} · {formatDate(c.event_date)}
                {c.gallery_purged_at && (
                  <span className="ml-2 text-white/30">
                    · obrisano {formatDate(c.gallery_purged_at)}
                  </span>
                )}
              </div>

              {/* Credentials */}
              <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg px-3 py-1.5 flex-1 basis-full sm:basis-[260px] min-w-0">
                  <ExternalLink size={11} className="text-white/40 shrink-0" />
                  <code className="text-[11px] text-white/70 truncate flex-1 min-w-0">
                    {portalUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(portalUrl, `portal-${c.slug}`)}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Kopiraj link portala"
                  >
                    {copied === `portal-${c.slug}` ? (
                      <Check size={11} className="text-emerald-400" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg px-3 py-1.5 shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">
                    Lozinka
                  </span>
                  <code className="text-[12px] font-mono text-white/80">
                    {isRevealed ? (c.potvrde_password ?? "—") : "••••••"}
                  </code>
                  <button
                    onClick={() => toggleReveal(c.slug)}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                    title={isRevealed ? "Sakrij" : "Prikaži"}
                  >
                    {isRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>
                  <button
                    onClick={() =>
                      copyToClipboard(c.potvrde_password ?? "", `pin-${c.slug}`)
                    }
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                    title="Kopiraj lozinku"
                  >
                    {copied === `pin-${c.slug}` ? (
                      <Check size={11} className="text-emerald-400" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                </div>

                <ShareLinkButton
                  productKind="couple"
                  slug={c.slug}
                  directUrl={portalUrl}
                />

                {shareStats[c.slug]?.visit_count ? (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] text-green-400/70 shrink-0"
                    title="Klijent je otvorio share link"
                  >
                    <Eye size={10} /> {shareStats[c.slug].visit_count}×
                  </span>
                ) : null}
              </div>

              {/* Guest URL + paid toggle */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg px-3 py-1.5 flex-1 basis-full sm:basis-[260px] min-w-0">
                  <Images size={11} className="text-white/40 shrink-0" />
                  <code className="text-[11px] text-white/70 truncate flex-1 min-w-0">
                    {guestUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(guestUrl, `guest-${c.slug}`)}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Kopiraj link za goste"
                  >
                    {copied === `guest-${c.slug}` ? (
                      <Check size={11} className="text-emerald-400" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => onToggleGallery(c.slug, paid)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                    paid
                      ? "bg-[#7c3aed]/20 text-violet-300 hover:bg-[#7c3aed]/30"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                  title="Uključi/isključi plaćenu galeriju"
                >
                  {paid ? "Galerija aktivna" : "Galerija ugašena"}
                </button>
              </div>

              {/* Receipt — same flow as the Pozivnice tab: generate → copy →
                  mark paid (which writes the order onto the Uplate tab). */}
              <GalleryReceiptDropdown
                couple={c}
                copiedSlug={copiedSlug}
                onGenerate={async (items) => {
                  const url = buildGalleryReceiptUrl(c, {
                    customItems: items,
                    bankAccountIdx,
                  });
                  await onGenerateReceipt(c.slug);
                  await navigator.clipboard.writeText(url);
                  onCopiedSlug(c.slug);
                }}
                onCopy={async (items) => {
                  const url = buildGalleryReceiptUrl(c, {
                    customItems: items,
                    bankAccountIdx,
                  });
                  await navigator.clipboard.writeText(url);
                  onCopiedSlug(c.slug);
                }}
                onPaid={(items) =>
                  onMarkPaid({
                    slug: c.slug,
                    name: c.couple_names?.full_display || c.slug,
                    premium: false,
                    kind: "galerija",
                    defaultTier: "default",
                    prefillAmount: galleryReceiptTotal(items, c.custom_discount ?? 0),
                    prefillLabel: "QR galerija — žiralna uplata",
                    slugEditable: false,
                    source: { type: "couple" },
                  })
                }
                onDiscount={(amount) => onDiscount(c.slug, amount)}
                onSaveItems={(items) => onSaveItems(c.slug, items)}
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
          {created ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-white mb-1">
                Galerija je kreirana
              </h3>
              <p className="text-xs text-white/50 mb-4">
                Pošalji klijentu jedan link — na njemu su slug, lozinka, portal i
                link za goste. QR kod preuzmi iz liste.
              </p>

              <div className="mb-5">
                <ShareLinkButton
                  productKind="couple"
                  slug={created.slug}
                  directUrl={`${SITE_URL}/moje-vencanje/`}
                />
              </div>

              <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">
                Ili ručno
              </div>

              <div className="space-y-2">
                {[
                  { label: "Portal za klijenta", value: `${SITE_URL}/moje-vencanje/` },
                  { label: "Slug", value: created.slug },
                  { label: "Lozinka", value: created.password },
                  {
                    label: "Link za goste",
                    value: galleryShareUrl(created.slug, created.galleryKey),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="bg-white/[0.04] rounded-lg px-3 py-2"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-0.5">
                      {row.label}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-[12px] text-white/80 truncate flex-1 min-w-0">
                        {row.value}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(row.value, `new-${row.label}`)
                        }
                        className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Kopiraj"
                      >
                        {copied === `new-${row.label}` ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    resetCreateForm();
                  }}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  Kreiraj još jednu
                </button>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    resetCreateForm();
                  }}
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
                >
                  Gotovo
                </button>
              </div>
            </div>
          ) : (
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleCreate}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-white mb-1">
                Nova samostalna galerija
              </h3>
              <p className="text-xs text-white/50 mb-5">
                Generiše pristup i lozinku, i odmah je aktivira kao plaćenu.
                Klijent vidi samo galeriju u portalu.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">
                    Ime klijenta
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Marija Jovanović"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#7c3aed]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">
                    Telefon klijenta
                  </label>
                  <input
                    type="tel"
                    required
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="+381 6X XXX XXXX"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#7c3aed]"
                  />
                  <p className="mt-1 text-[10px] text-white/30">
                    Na ovaj broj idu SMS podsetnici pre brisanja galerije.
                  </p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">
                    Datum događaja
                  </label>
                  <DatePicker
                    value={createDate}
                    onChange={setCreateDate}
                    variant="dark"
                    accentColor={ACCENT}
                    placeholder="Izaberite datum događaja"
                    showQuickActions={false}
                  />
                  <p className="mt-1 text-[10px] text-white/30">
                    Gosti šalju slike na dan događaja i dan posle; klijent
                    preuzima do 4 dana posle.
                  </p>
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
                  disabled={creating || !createDate}
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {creating ? "Kreiram..." : "Kreiraj galeriju"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Mirrors ReceiptDropdown on the Pozivnice tab so the receipt lifecycle is the
 * same everywhere: generate → copy link → mark paid (which writes the order the
 * Uplate tab lists) → discount. The only difference is what sits above those
 * actions: instead of the retro-phone / dobrodošlica toggles, a gallery receipt
 * takes free-form extra lines (zahvalnice, štampa stalaka, …).
 */
function GalleryReceiptDropdown({
  couple,
  copiedSlug,
  onGenerate,
  onCopy,
  onPaid,
  onDiscount,
  onSaveItems,
}: {
  couple: GalleryCouple;
  copiedSlug: string | null;
  onGenerate: (items: CustomItemDraft[]) => void;
  onCopy: (items: CustomItemDraft[]) => void;
  onPaid: (items: CustomItemDraft[]) => void;
  onDiscount: (amount: number) => void;
  onSaveItems: (items: ReceiptCustomItem[]) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  // Seeded from the couple, so reopening the panel (or the whole admin, days
  // later) shows the same extras the client was quoted.
  const [items, setItems] = useState<CustomItemDraft[]>(() =>
    toDrafts(couple.receipt_custom_items),
  );
  const ref = useRef<HTMLDivElement>(null);

  /** Writes the current lines to the couple. Called on blur and on remove
   *  rather than per keystroke: one save per edited field, no debounce. */
  function persist(next: CustomItemDraft[]) {
    onSaveItems(cleanCustomItems(next));
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isCopied = copiedSlug === couple.slug;
  const isActive = couple.receipt_valid;
  const total = galleryReceiptTotal(items, couple.custom_discount ?? 0);

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
        {isCopied ? "✓ Link kopiran!" : isActive ? "Račun aktivan" : "Račun"}
        <svg
          width="10" height="10" viewBox="0 0 16 16" fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 mb-1 rounded-lg overflow-hidden shadow-xl z-30"
          style={{ backgroundColor: "#2a2a2a", border: "1px solid rgba(255,255,255,0.1)", minWidth: 320 }}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <span className="text-[11px] text-white/50">QR galerija fotografija</span>
            <span className="text-[11px] text-white/40 tabular-nums">
              {formatPrice(currentPriceTable().galerija)}
            </span>
          </div>

          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-1.5 px-4 py-1.5 border-b border-white/5">
              <input
                type="text"
                value={it.label}
                onChange={(e) =>
                  setItems((prev) => prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                }
                onBlur={() => persist(items)}
                placeholder="npr. Izrada zahvalnica"
                className="flex-1 min-w-0 text-[11px] text-white/70 bg-white/5 border border-white/10 rounded px-2 py-1 outline-none focus:border-white/20"
              />
              <input
                type="number"
                min={0}
                step={500}
                value={it.price}
                onChange={(e) =>
                  setItems((prev) => prev.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))
                }
                onBlur={() => persist(items)}
                placeholder="0"
                className="w-16 text-[11px] text-white/60 bg-white/5 border border-white/10 rounded px-2 py-1 text-right outline-none focus:border-white/20"
              />
              <button
                onClick={() => {
                  // Computed outside the updater: persist() is a side effect and
                  // React may run a state updater twice in dev StrictMode.
                  const next = items.filter((_, j) => j !== i);
                  setItems(next);
                  persist(next);
                }}
                className="p-1 rounded text-white/30 hover:text-red-300 cursor-pointer transition-colors"
                title="Ukloni"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}

          <button
            onClick={() => setItems((prev) => [...prev, { label: "", price: "" }])}
            className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-white/50 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5"
          >
            <Plus size={11} /> Dodaj stavku
          </button>

          <button
            onClick={() => { onGenerate(items); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <Receipt size={12} className="text-yellow-400" />
            {isActive ? "Regeneriši račun" : "Generiši račun"}
          </button>

          {isActive && (
            <button
              onClick={() => { onCopy(items); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <Copy size={12} className="text-green-400" />
              Kopiraj link
            </button>
          )}

          {isActive && (
            <button
              onClick={() => { onPaid(items); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-red-400/70 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <Check size={12} />
              Označi kao plaćeno
            </button>
          )}

          <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/30">Popust:</span>
              <input
                type="number"
                min={0}
                step={500}
                value={couple.custom_discount ?? 0}
                onChange={(e) => onDiscount(parseInt(e.target.value) || 0)}
                className="w-16 text-[11px] text-white/60 bg-white/5 border border-white/10 rounded px-2 py-1 text-right outline-none focus:border-white/20"
              />
              <span className="text-[10px] text-white/30">din</span>
            </div>
            <span className="text-[11px] text-white/70 tabular-nums">
              = {formatPrice(total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
