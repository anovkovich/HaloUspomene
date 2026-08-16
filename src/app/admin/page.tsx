"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Pencil, Users, Armchair, Mic, Receipt, Copy, Check, Heart, Cake, Star, Phone, X, Globe, Eye, Search, QrCode, CalendarPlus, Wallet, Images, Ticket } from "lucide-react";
import { encodeToBase64 } from "@/lib/encoding";
import { downloadGalleryQR } from "@/lib/gallery-qr";
import { isGalleryOnlyCouple } from "@/lib/gallery-only";
import {
  buildReceiptItems,
  currentPriceTable,
  receiptTotal,
  type ReceiptFlags,
} from "@/lib/receipt-items";
import type { MarkPaidTarget } from "@/lib/admin-mark-paid";
import { getAudioPrice } from "@/data/pricing";
import DeleteModal from "./DeleteModal";
import BirthdayAdminList from "./BirthdayAdminList";
import VendorAdminTab from "./VendorAdminTab";
import SeatingAdminTab from "./SeatingAdminTab";
import GalleryAdminTab from "./GalleryAdminTab";
import PhoneAdminTab from "./PhoneAdminTab";
import OrdersAdminTab from "./OrdersAdminTab";
import PromoAdminTab from "./PromoAdminTab";
import PaymentRefSearch, { type RefHit } from "./PaymentRefSearch";
import FocusNotice from "./FocusNotice";
import { issueReceiptRef } from "@/lib/issue-receipt-ref";
import BypassLinkModal from "./BypassLinkModal";
import ShareLinkButton from "./ShareLinkButton";
import SortMenu, { type AdminSortMode } from "./SortMenu";
import DatePicker from "@/components/ui/DatePicker";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  galleryDayOffset,
  GALLERY_PURGE_DAY,
} from "@/lib/gallery-lifecycle";
import {
  startOfToday,
  sortByEventTimeline,
  firstPastIndex,
} from "@/lib/event-timeline";

type AdminTab =
  | "pozivnice"
  | "rodjendani"
  | "raspored-sedenja"
  | "galerija"
  | "telefon"
  | "uplate"
  | "promo"
  | "vendori";

/** Exactly 8 tabs: 2 rows of 4 on desktop, 4 rows of 2 on phones. Adding a 9th
 *  breaks that grid — rebalance the layout rather than letting a row dangle. */
const TABS: ReadonlyArray<{
  id: AdminTab;
  label: string;
  icon: typeof Heart;
  activeBg: string;
}> = [
  { id: "pozivnice", label: "Pozivnice", icon: Heart, activeBg: "bg-[#AE343F]" },
  { id: "rodjendani", label: "Rođendani", icon: Cake, activeBg: "bg-[#FF6B6B]" },
  { id: "raspored-sedenja", label: "Raspored sedenja", icon: Armchair, activeBg: "bg-[#2563eb]" },
  { id: "galerija", label: "Galerija", icon: Images, activeBg: "bg-[#7c3aed]" },
  { id: "telefon", label: "Retro telefon", icon: Phone, activeBg: "bg-[#0d9488]" },
  { id: "uplate", label: "Uplate", icon: Wallet, activeBg: "bg-[#16a34a]" },
  { id: "promo", label: "Promo kodovi", icon: Ticket, activeBg: "bg-[#db2777]" },
  { id: "vendori", label: "Vendori", icon: Star, activeBg: "bg-[#d4af37]" },
];

const BANK_ACCOUNTS = [
  { raw: "340000003258405791", display: "340-0000032584057-91", label: "Erste (340)" },
  { raw: "170001040456500004", display: "170-0010404565000-04", label: "UniCredit (170)" },
  { raw: "160600000143665585", display: "160-6000001436655-85", label: "Intesa (160)" },
];

interface Couple {
  slug: string;
  couple_names: { bride: string; groom: string; full_display: string };
  event_date: string;
  theme: string;
  paid_for_raspored?: boolean;
  paid_for_audio?: boolean;
  paid_for_gallery?: boolean;
  gallery_extra_days?: number;
  /** Demo/primer pozivnica — nas materijal, ne klijent. */
  example?: boolean;
  gallery_purged_at?: string;
  standalone_gallery?: boolean;
  potvrde_password?: string;
  paid_for_images?: boolean;
  paid_for_music?: boolean;
  paid_for_audio_USB?: "" | "kaseta" | "bocica";
  custom_primary_color?: string;
  custom_background_color?: string;
  premium?: boolean;
  premium_paid?: boolean;
  premium_theme?: string;
  premium_status?: "u_izradi" | "isporuceno";
  premium_custom_bg_note?: string;
  draft?: boolean;
  receipt_valid?: boolean;
  receipt_created?: string;
  custom_discount?: number;
  created_at?: string;
}

type SortMode = AdminSortMode;

/** Target of the "Označi kao plaćeno" modal — either a couple's receipt or a
 *  custom receipt with no couple behind it. */

/** Latin-ASCII slug from a free-text custom-receipt recipient name. */
function slugifyPar(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/č|ć/g, "c")
      .replace(/š/g, "s")
      .replace(/ž/g, "z")
      .replace(/đ/g, "dj")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "custom"
  );
}

/** Receipt URL for a couple. Module scope, not a closure over component state:
 *  it stamps `Date.now()` and is only ever called from event handlers, so the
 *  render pass must stay free of it. `bankAccountIdx` comes in as an argument. */
async function buildReceiptUrl(
  c: Couple,
  bankAccountIdx: number,
  extras?: { retro_phone?: boolean; dobrodoslica?: boolean; customItems?: Array<{l: string; p: number}> },
) {
  const data: Record<string, unknown> = {
    s: c.slug,
    par: c.couple_names?.full_display || c.slug,
    datum: c.event_date,
    r: c.paid_for_raspored ? 1 : 0,
    a: c.paid_for_audio ? 1 : 0,
    uk: c.paid_for_audio_USB === "kaseta" ? 1 : 0,
    ub: c.paid_for_audio_USB === "bocica" ? 1 : 0,
    rp: extras?.retro_phone ? 1 : 0,
    pd: extras?.dobrodoslica ? 1 : 0,
    cc: c.custom_primary_color || c.custom_background_color ? 1 : 0,
    ig: c.paid_for_images ? 1 : 0,
    g: c.paid_for_gallery ? 1 : 0,
    mu: c.paid_for_music ? 1 : 0,
    p: c.premium ? 1 : 0,
    d: c.custom_discount ?? 0,
    ba: bankAccountIdx,
    t: Date.now(),
  };
  if (extras?.customItems?.length) data.ci = extras.customItems;
  const { items, bundleDiscount } = buildReceiptItems(
    data as unknown as ReceiptFlags,
    currentPriceTable(),
  );
  const total =
    items.reduce((s, i) => s + i.p, 0) -
    bundleDiscount -
    (c.custom_discount ?? 0);

  // Zavedi poziv na broj pre nego što se link sastavi — `t` sme da se pomeri.
  data.t = await issueReceiptRef({
    kind: "pozivnica",
    slug: c.slug,
    displayName: c.couple_names?.full_display || c.slug,
    amountRsd: total,
    items: items.map((i) => ({ l: i.l, p: i.p })),
    bankAccountIdx,
    t: data.t as number,
  });

  return `https://halouspomene.rs/racun?d=${encodeToBase64({ ...data, v: 2, li: items, bd: bundleDiscount })}`;
}

/** Receipt total (base flags, no dropdown extras) — prefill for the manual
 *  order amount in the mark-paid modal. */
function receiptTotalFor(c: Couple): number {
  const data: Record<string, unknown> = {
    s: c.slug,
    r: c.paid_for_raspored ? 1 : 0,
    a: c.paid_for_audio ? 1 : 0,
    uk: c.paid_for_audio_USB === "kaseta" ? 1 : 0,
    ub: c.paid_for_audio_USB === "bocica" ? 1 : 0,
    cc: c.custom_primary_color || c.custom_background_color ? 1 : 0,
    ig: c.paid_for_images ? 1 : 0,
    g: c.paid_for_gallery ? 1 : 0,
    mu: c.paid_for_music ? 1 : 0,
    p: c.premium ? 1 : 0,
    d: c.custom_discount ?? 0,
  };
  return receiptTotal(data as unknown as ReceiptFlags, currentPriceTable());
}

/** Closest event to today first; on a tie the future one wins. Module scope so
 *  the `Date.now()` reference point never runs during render. */

/**
 * Days left before the guest photos are purged, or null when there is nothing
 * to warn about (no gallery, already purged, or the window hasn't closed yet).
 *
 * This deadline is the reason just-finished weddings must stay visible: photos
 * are gone at d6 and the only other warning is an SMS to the couple. Shown as a
 * row badge rather than encoded in sort position, so it survives every sort
 * mode and the collapsed-history toggle.
 */
/**
 * Names the premium themes carry in the customer wizard
 * (`napravi-pozivnicu/steps/PremiumStepAIPhoto.tsx`).
 *
 * A premium couple's `theme` always says `luxury_gold` — the classic palette
 * they never see — so the pill showed the same useless word on every premium
 * row. The premium theme is what actually differs, and naming it exactly as the
 * wizard does keeps admin and customer speaking one language. `disney_pixar` is
 * retired, kept only so old records still render a name.
 */
const PREMIUM_THEME_LABEL: Record<string, string> = {
  watercolor: "Luxury Romance",
  line_art: "Modern Parallax",
  fountain: "Royal Fountain",
  disney_pixar: "Disney (povučena)",
};

function galleryPurgeCountdown(c: Couple): number | null {
  if (!c.paid_for_gallery || c.gallery_purged_at) return null;
  const d = galleryDayOffset(c.event_date);
  if (d === null || d < 0) return null;
  const purgeDay = GALLERY_PURGE_DAY + (c.gallery_extra_days ?? 0);
  const left = purgeDay - d;
  return left >= 0 ? left : null;
}


interface CoupleStats {
  rsvp: { attending: number; declined: number; totalGuests: number } | null;
  seating: { totalSeats: number; assignedSeats: number } | null;
  audio: { messageCount: number } | null;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("pozivnice");
  const tabInitializedRef = useRef(false);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [stats, setStats] = useState<Record<string, CoupleStats>>({});
  const [shareStats, setShareStats] = useState<Record<string, { visit_count: number; last_visited_at?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [bankAccountIdx, setBankAccountIdx] = useState(0); // default: Erste (340)
  const [showCustomReceipt, setShowCustomReceipt] = useState(false);
  const [markPaid, setMarkPaid] = useState<MarkPaidTarget | null>(null);
  /** Brojac koji tera OrdersAdminTab da se ponovo montira i povuce listu, kad
   *  je uplata zavedena a mi smo vec na tabu Uplate. */
  const [uplateReload, setUplateReload] = useState(0);
  const [showBypassLink, setShowBypassLink] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("event_proximity");
  const [search, setSearch] = useState("");
  const [uplateCount, setUplateCount] = useState(0);


  // Standalone gallery clients live on the Galerija tab. Filtered by the derived
  // predicate, not the raw marker, so one who later buys an invitation comes
  // back into this list on their own.
  const invitationCouples = useMemo(
    () => couples.filter((c) => !isGalleryOnlyCouple(c)),
    [couples]
  );

  const sortedCouples = useMemo(() => {
    if (sortMode === "newest") return invitationCouples; // API already returns created_at desc
    return sortByEventTimeline(invitationCouples, (c) => c.event_date, startOfToday());
  }, [invitationCouples, sortMode]);

  // Diacritic-insensitive search over name, slug and theme.
  const filteredCouples = useMemo(() => {
    const q = search.trim();
    if (!q) return sortedCouples;
    const norm = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const nq = norm(q);
    return sortedCouples.filter((c) =>
      norm(
        [
          c.slug,
          c.couple_names?.full_display,
          c.couple_names?.bride,
          c.couple_names?.groom,
          c.theme,
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(nq),
    );
  }, [sortedCouples, search]);

  /* ── Prošla venčanja: razdelnik + sklapanje ──────────────────────────
   * Half the list is permanent history the admin scrolls past daily, so it
   * collapses by default. Two rules keep the collapse honest:
   *   - events inside the 7-day HOT window stay visible even when collapsed —
   *     that is the gallery-purge (d6) and audio-download week, and hiding a
   *     purge countdown behind a click is exactly the failure we rejected when
   *     we dropped the two-mode sort split;
   *   - an active search overrides the collapse, so a query never silently
   *     misses a match.
   */
  const [showOlderPast, setShowOlderPast] = useState(false);
  /* Demo pozivnice (`example: true`) su nas materijal, ne klijenti — stoje na
   * dnu i sklopljene su, da svakodnevni pregled ne bi pocinjao tudjim imenima
   * koja nikad nista ne traze. Pretraga ih i dalje nalazi. */
  const [showDemo, setShowDemo] = useState(false);

  const agendaMode = sortMode === "event_proximity";
  const searching = search.trim().length > 0;

  const {
    visibleCouples,
    dividerAt,
    hiddenOlderCount,
    pastCount,
    demoCount,
    demoDividerIndex,
  } = useMemo(() => {
    const boundary = startOfToday();
    const hotCutoff = boundary - 7 * 86_400_000;

    // Demo rows leave the main list entirely and come back appended at the end.
    const demos = filteredCouples.filter((c) => c.example);
    const real = filteredCouples.filter((c) => !c.example);
    const withDemos = <T,>(rows: T[]) =>
      showDemo || searching ? [...rows, ...(demos as unknown as T[])] : rows;

    const isPastRow = (c: Couple) =>
      !!c.event_date && new Date(c.event_date).getTime() < boundary;
    const total = real.filter(isPastRow).length;

    // Divider only in agenda mode — any other order scatters past rows, so a
    // divider there would be a lie.
    if (!agendaMode) {
      return {
        visibleCouples: withDemos(real),
        dividerAt: -1,
        hiddenOlderCount: 0,
        pastCount: total,
        demoCount: demos.length,
        demoDividerIndex: showDemo || searching ? real.length : -1,
      };
    }

    const keep =
      searching || showOlderPast
        ? real
        : real.filter(
            (c) =>
              !isPastRow(c) ||
              new Date(c.event_date!).getTime() >= hotCutoff,
          );

    return {
      visibleCouples: withDemos(keep),
      dividerAt: firstPastIndex(keep, (c) => c.event_date, boundary),
      hiddenOlderCount: real.length - keep.length,
      pastCount: total,
      demoCount: demos.length,
      demoDividerIndex: showDemo || searching ? keep.length : -1,
    };
  }, [filteredCouples, agendaMode, searching, showOlderPast, showDemo]);
  /** Postavlja se pretragom po pozivu na broj: vodi na tab te stavke i suzi
   *  njegovu listu na nju. Čisti se ručnim klikom na bilo koji tab. */
  const [focus, setFocus] = useState<{
    kind: string;
    slug: string;
    ref: string;
  } | null>(null);

  /** Koji tab pokriva koji proizvod. Self-serve porudžbina ide u Uplate — tamo
   *  je i dugme za odobravanje, što je i razlog zbog kojeg se broj traži. */
  function tabForHit(hit: { kind: string; source: string }): AdminTab {
    if (hit.source === "placanje") return "uplate";
    switch (hit.kind) {
      case "rodjendan":
      case "punoletstvo":
        return "rodjendani";
      case "raspored":
        return "raspored-sedenja";
      case "galerija":
      case "dogadjaj":
        return "galerija";
      case "telefon":
        return "telefon";
      default:
        return "pozivnice";
    }
  }

  function openFromRef(hit: RefHit) {
    const tab = tabForHit(hit);
    setActiveTab(tab);
    setFocus({
      kind: hit.source === "placanje" ? "order" : hit.kind,
      slug: hit.source === "placanje" ? hit.ref : hit.slug,
      ref: hit.ref,
    });
    // Pozivnice tab već ima filter koji hvata i slug — nema smisla dupli.
    if (tab === "pozivnice" && hit.kind === "pozivnica") setSearch(hit.slug);
  }

  /** Fokus za tab koji pokriva date `kind`-ove, inače null (lista puna). */
  function focusSlugFor(...kinds: string[]): string | null {
    return focus && kinds.includes(focus.kind) ? focus.slug : null;
  }

  const [customReceipts, setCustomReceipts] = useState<Array<{ id: string; par: string; datum?: string; items: Array<{l: string; p: number}>; ba: number; created_at: string }>>([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Hydration guard: the modals below must not render during SSR. This is the
    // one legitimate "sync from an external system (the browser) on mount" case,
    // so the compiler's set-state-in-effect warning is a false positive here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Read tab from URL on mount, then mirror activeTab → ?tab= on changes.
  // Reading happens in useEffect (not in useState init) because the SSR pass
  // has no `window`, so a lazy initializer would always default to "pozivnice"
  // and the mirror effect would strip the param on hydration.
  useEffect(() => {
    if (!tabInitializedRef.current) {
      tabInitializedRef.current = true;
      const t = new URLSearchParams(window.location.search).get("tab");
      // Validated against TABS rather than a hand-written list, so a new tab is
      // deep-linkable the moment it is registered.
      const known = TABS.find((tab) => tab.id === t);
      if (known)
        // Same false positive as `mounted` above: the URL is external state and
        // it can only be read after mount (no `window` during SSR).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveTab(known.id);
      return;
    }
    const url = new URL(window.location.href);
    if (activeTab === "pozivnice") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", activeTab);
    }
    window.history.replaceState({}, "", url.toString());
  }, [activeTab]);

  useEffect(() => {
    fetch("/api/admin/couples")
      .then(async (r) => {
        if (r.status === 401) {
          setNeedsLogin(true);
          setLoading(false);
          return null;
        }
        if (!r.ok) {
          console.error("Admin couples fetch failed:", r.status);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data)) {
          setCouples(data);
          // Load stats async
          fetch("/api/admin/stats")
            .then((r) => r.json())
            .then((s) => setStats(s))
            .catch(() => {});
          // Load custom receipts
          fetch("/api/admin/custom-receipts")
            .then((r) => r.json())
            .then((d) => { if (Array.isArray(d)) setCustomReceipts(d); })
            .catch(() => {});
          // Load share-link visit stats
          fetch("/api/admin/share-links?kind=couple")
            .then((r) => r.json())
            .then((m) => {
              if (m && typeof m === "object") setShareStats(m);
            })
            .catch(() => {});
          // Load pending-payment count for the Uplate tab badge
          fetch("/api/admin/orders?status=review")
            .then((r) => r.json())
            .then((d) => {
              if (Array.isArray(d?.orders)) setUplateCount(d.orders.length);
            })
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (needsLogin)
    return (
      <LoginForm
        onSuccess={() => {
          setNeedsLogin(false);
          setLoading(true);
          window.location.reload();
        }}
      />
    );
  if (loading) return <p className="text-white/40">Učitavanje...</p>;


  async function handleToggleDraft(slug: string, current: boolean) {
    const newVal = !current;
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, draft: newVal } : c
      )
    );
    const res = await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft: newVal }),
    });
    if (!res.ok) {
      setCouples((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, draft: current } : c
        )
      );
    }
  }

  // Premium ops safety net: mark the hand-crafted asset (watercolor custom bg /
  // line_art HQ illustration) as delivered once the admin swaps it in.
  async function handleMarkDelivered(slug: string) {
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, premium_status: "isporuceno" } : c
      )
    );
    const res = await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ premium_status: "isporuceno" }),
    });
    if (!res.ok) {
      setCouples((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, premium_status: "u_izradi" } : c
        )
      );
    }
  }

  async function handleToggleRaspored(slug: string, current: boolean) {
    const newVal = !current;
    // Optimistic update
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, paid_for_raspored: newVal } : c
      )
    );
    const res = await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid_for_raspored: newVal }),
    });
    if (!res.ok) {
      // Revert on error
      setCouples((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, paid_for_raspored: current } : c
        )
      );
    }
  }

  async function handleToggleAudio(slug: string, current: boolean) {
    const newVal = !current;
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, paid_for_audio: newVal } : c
      )
    );
    const res = await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid_for_audio: newVal }),
    });
    if (!res.ok) {
      setCouples((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, paid_for_audio: current } : c
        )
      );
    }
  }

  async function handleToggleGallery(slug: string, current: boolean) {
    const newVal = !current;
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, paid_for_gallery: newVal } : c
      )
    );
    const res = await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid_for_gallery: newVal }),
    });
    if (!res.ok) {
      setCouples((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, paid_for_gallery: current } : c
        )
      );
    }
  }

  // Grant the couple +1 day of gallery access before the system purge.
  async function handleExtendGallery(slug: string, current: number) {
    const newVal = current + 1;
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, gallery_extra_days: newVal } : c
      )
    );
    const res = await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gallery_extra_days: newVal }),
    });
    if (res.ok) {
      alert(`Pristup galeriji produžen — ukupno +${newVal} dan(a).`);
    } else {
      setCouples((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, gallery_extra_days: current } : c
        )
      );
    }
  }

  /** Refetch after the Galerija tab creates a client, so the new row shows up. */
  async function reloadCouples() {
    const res = await fetch("/api/admin/couples");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) setCouples(data);
  }

  async function handleMarkPaidDone(mode: "linked" | "recorded") {
    if (!markPaid) return;
    if (markPaid.source.type === "couple") {
      await handleInvalidateReceipt(markPaid.slug);
    } else if (markPaid.source.type === "custom") {
      const id = markPaid.source.id;
      await fetch(`/api/admin/custom-receipts/${id}`, { method: "DELETE" }).catch(
        () => {},
      );
      setCustomReceipts((prev) => prev.filter((x) => x.id !== id));
    } else {
      await markPaid.source.onInvalidate();
    }
    if (mode === "linked") {
      // Approving an order runs unlock() server-side (draft/paid_* flags) —
      // re-fetch so the toggles in the list reflect the new state. Applies to
      // a custom receipt linked to a real couple's order too.
      fetch("/api/admin/couples")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (Array.isArray(d)) setCouples(d);
        })
        .catch(() => {});
    }
    setMarkPaid(null);

    // Uplata je upravo zavedena — pokazi je. `onDone` se zove tek posle uspesnog
    // odgovora servera, pa ovde nema skoka na tab bez zapisa iza sebe.
    //
    // Ako smo na drugom tabu, prelazak sam montira OrdersAdminTab i on povuce
    // listu. Ako smo VEC na Uplatama, komponenta ostaje montirana i njen `load()`
    // iz useEffect([]) se ne bi ponovo pokrenuo — zato brojac ide u `key`, sto
    // je iznudi ponovno montiranje. Zato se brojac uvek uvecava.
    setFocus(null); // suzenje iz pretrage bi sakrilo bas novu uplatu
    setActiveTab("uplate");
    setUplateReload((n) => n + 1);
  }

  async function handleGenerateReceipt(slug: string) {
    const now = new Date().toISOString();
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, receipt_valid: true, receipt_created: now } : c
      )
    );
    try {
      const res = await fetch(`/api/admin/couples/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt_valid: true, receipt_created: now }),
      });
      if (!res.ok) {
        console.error(`Failed to set receipt_valid: ${res.status} ${res.statusText}`);
        alert(`Greška: Nisu mogli podesiti račun (${res.status})`);
        // Revert optimistic update
        setCouples((prev) =>
          prev.map((c) =>
            c.slug === slug ? { ...c, receipt_valid: false } : c
          )
        );
      }
    } catch (error) {
      console.error("Error generating receipt:", error);
      alert("Greška: Problem sa konekcijom");
      // Revert optimistic update
      setCouples((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, receipt_valid: false } : c
        )
      );
    }
  }

  async function handleInvalidateReceipt(slug: string) {
    const couple = couples.find((c) => c.slug === slug);

    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, receipt_valid: false } : c
      )
    );

    await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receipt_valid: false }),
    });

    // Also mark phone rental as paid if it exists
    if (couple?.couple_names?.full_display) {
      await fetch("/api/admin/phone-rentals/by-contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: couple.couple_names.full_display,
          receipt_valid: false,
        }),
      }).catch(() => {}); // Silently fail if phone rental doesn't exist
    }
  }

  async function handleSetDiscount(slug: string, amount: number) {
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, custom_discount: amount } : c
      )
    );
    await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ custom_discount: amount }),
    });
  }

  /** Persists the Galerija tab's free-form receipt lines onto the couple, the
   *  same way the discount above is stored — so the quote, the "Kopiraj link"
   *  rebuild and the mark-paid prefill all read from one saved source instead of
   *  from React state that a reload wipes. */
  async function handleSaveReceiptItems(
    slug: string,
    items: { l: string; p: number }[],
  ) {
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, receipt_custom_items: items } : c
      )
    );
    await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receipt_custom_items: items }),
    });
  }

  function daysUntil(dateStr: string) {
    // Compare local calendar days (ignore time-of-day) so an event at 22:00
    // doesn't show "za 1 dan" when it's already today. Math.round absorbs
    // sub-millisecond drift from DST transitions.
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
    if (diff > 0) return `za ${diff} dana`;
    if (diff === 0) return "danas!";
    return `pre ${Math.abs(diff)} dana`;
  }

  return (
    <div>
      {/* The availability calendar used to sit here, collapsed, above every tab.
          It now lives inside the Retro telefon tab where it means something. */}

      {/* Bank account selector + custom receipt */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-xs text-white/30">Žiro račun:</span>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          {BANK_ACCOUNTS.map((acc, i) => (
            <button
              key={i}
              onClick={() => setBankAccountIdx(i)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                bankAccountIdx === i
                  ? "bg-[#AE343F] text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
              title={acc.display}
            >
              {acc.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCustomReceipt(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <Receipt size={12} /> Prilagođeni račun
        </button>
        <button
          onClick={() => setShowBypassLink(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
          title="Generiši link za inostranog klijenta — preskače SMS verifikaciju"
        >
          <Globe size={12} /> Bypass link
        </button>
      </div>

      <BypassLinkModal
        open={showBypassLink}
        onClose={() => setShowBypassLink(false)}
      />

      {/* Custom receipts list */}
      {customReceipts.length > 0 && (
        <div className="mb-6 space-y-2">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Prilagođeni računi</span>
          {focus?.kind === "custom" && (
            <FocusNotice
              paymentRef={focus.ref}
              count={customReceipts.filter((r) => r.id === focus.slug).length}
              onClear={() => setFocus(null)}
            />
          )}
          {customReceipts
            .filter((r) => focus?.kind !== "custom" || r.id === focus.slug)
            .map((r) => {
            const total = r.items.reduce((s, i) => s + i.p, 0);
            const url = `https://halouspomene.rs/racun?d=${encodeToBase64({ custom: 1, id: r.id, par: r.par, datum: r.datum, ba: r.ba, t: new Date(r.created_at).getTime(), d: 0, ci: r.items })}`;
            return (
              <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <Receipt size={13} className="text-yellow-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white/80 font-medium">{r.par}</span>
                  <span className="text-xs text-white/30 ml-2">{total.toLocaleString("sr-RS")} din</span>
                </div>
                <span className="text-[10px] text-white/25 shrink-0">
                  {new Date(r.created_at).toLocaleDateString("sr-RS")}
                </span>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(url);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors cursor-pointer"
                  title="Kopiraj link"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={() =>
                    setMarkPaid({
                      slug: slugifyPar(r.par),
                      name: r.par,
                      premium: false,
                      prefillAmount: total,
                      prefillLabel: `Prilagođeni račun — ${r.par}`.slice(0, 120),
                      slugEditable: true,
                      source: { type: "custom", id: r.id },
                    })
                  }
                  className="p-1.5 rounded-lg hover:bg-green-500/20 text-white/30 hover:text-green-400 transition-colors cursor-pointer"
                  title="Označi kao plaćeno — zabeleži u tab Uplate (briše račun)"
                >
                  <Check size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pretraga po pozivu na broj — jedini globalni search, iznad tabova.
          Filter po imenu je i dalje unutar Pozivnice taba, radi drugi posao. */}
      <PaymentRefSearch
        onOpen={openFromRef}
        onNeedsLogin={() => setNeedsLogin(true)}
      />

      {/* Tab bar — 4 rows of 2 on phones, 2 rows of 4 from lg up */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 mb-6 sm:mb-8 bg-white/5 rounded-xl p-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const badge = tab.id === "uplate" && uplateCount > 0 ? uplateCount : null;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setFocus(null); // ručna navigacija poništava suženje iz pretrage
              }}
              className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? `text-white ${tab.activeBg}`
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <Icon size={14} className="shrink-0" />
              <span className="truncate">{tab.label}</span>
              {badge && (
                <span className="absolute top-1 right-1 sm:static sm:ml-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full bg-[#16a34a] text-white">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "uplate" ? (
        <OrdersAdminTab
          key={uplateReload}
          onNeedsLogin={() => setNeedsLogin(true)}
          onCountChange={setUplateCount}
          focusRef={focusSlugFor("order")}
          focusLabel={focus?.ref}
          onClearFocus={() => setFocus(null)}
        />
      ) : activeTab === "promo" ? (
        <PromoAdminTab onNeedsLogin={() => setNeedsLogin(true)} />
      ) : activeTab === "telefon" ? (
        <PhoneAdminTab
          bankAccountIdx={bankAccountIdx}
          couples={couples}
          onNeedsLogin={() => setNeedsLogin(true)}
          onMarkPaid={setMarkPaid}
          focusSlug={focusSlugFor("telefon")}
          focusLabel={focus?.ref}
          onClearFocus={() => setFocus(null)}
        />
      ) : activeTab === "vendori" ? (
        <>
          <div className="mb-4">
            <Link
              href="/admin/vendors"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[#AE343F] text-white hover:bg-[#AE343F]/90 transition-colors"
            >
              <Star size={14} /> Upravljaj vendorima (DB)
            </Link>
          </div>
          <VendorAdminTab />
        </>
      ) : activeTab === "raspored-sedenja" ? (
        <SeatingAdminTab
          onNeedsLogin={() => setNeedsLogin(true)}
          bankAccountIdx={bankAccountIdx}
          onMarkPaid={setMarkPaid}
          focusSlug={focusSlugFor("raspored")}
          focusLabel={focus?.ref}
          onClearFocus={() => setFocus(null)}
        />
      ) : activeTab === "galerija" ? (
        <GalleryAdminTab
          couples={couples}
          shareStats={shareStats}
          bankAccountIdx={bankAccountIdx}
          copiedSlug={copiedSlug}
          onToggleGallery={handleToggleGallery}
          onExtendGallery={handleExtendGallery}
          onDelete={setDeleteSlug}
          onCreated={reloadCouples}
          onGenerateReceipt={handleGenerateReceipt}
          onMarkPaid={setMarkPaid}
          onDiscount={handleSetDiscount}
          onSaveItems={handleSaveReceiptItems}
          onCopiedSlug={(slug) => {
            setCopiedSlug(slug);
            setTimeout(() => setCopiedSlug(null), 2500);
          }}
          focusSlug={focusSlugFor("galerija", "dogadjaj")}
          focusLabel={focus?.ref}
          onClearFocus={() => setFocus(null)}
        />
      ) : activeTab === "rodjendani" ? (
        <BirthdayAdminList
          onNeedsLogin={() => setNeedsLogin(true)}
          bankAccountIdx={bankAccountIdx}
          onMarkPaid={setMarkPaid}
          focusSlug={focusSlugFor("rodjendan", "punoletstvo")}
          focusLabel={focus?.ref}
          onClearFocus={() => setFocus(null)}
        />
      ) : (
      <>
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3 flex-wrap">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Pozivnice (
            {search.trim()
              ? `${filteredCouples.length}/${invitationCouples.length}`
              : invitationCouples.length}
            )
          </h2>
          <SortMenu
            value={sortMode}
            onChange={setSortMode}
            dateLabel="Po datumu venčanja"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push("/admin/nova")}
            className="flex items-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Nova pozivnica</span><span className="sm:hidden">Nova</span>
          </button>
        </div>
      </div>

      {/* Search / filter */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretraži po imenu, slug-u ili temi..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#AE343F]/60 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/80 transition-colors cursor-pointer"
            title="Obriši pretragu"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {filteredCouples.length === 0 && (
          <p className="text-center text-sm text-white/40 py-10">
            Nema pozivnica za: {search.trim()}
          </p>
        )}
        {visibleCouples.map((c, idx) => {
          const s = stats[c.slug];
          const eventDate = c.event_date ? new Date(c.event_date) : null;
          const today = new Date();
          const isToday = eventDate ? eventDate.toDateString() === today.toDateString() : false;
          const isPast = eventDate ? eventDate < today && !isToday : false;
          const daysSince = isPast && eventDate
            ? Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          const isExpired = daysSince > 5;
          const isQuickStart = !c.theme;
          const purgeIn = galleryPurgeCountdown(c);

          return (
            <React.Fragment key={c.slug}>
            {idx === demoDividerIndex && demoCount > 0 && (
              <div className="flex items-center gap-3 pt-3 pb-1">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                  Demo pozivnice ({demoCount})
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
            )}
            {idx === dividerAt && (
              <div className="flex items-center gap-3 pt-3 pb-1">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                  Prošla venčanja ({pastCount})
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
            )}
            <div
              className={`rounded-xl px-4 py-4 sm:px-5 ${
                isQuickStart
                  ? "bg-indigo-950/30 border border-dashed border-indigo-400/30"
                  : isExpired
                  ? "bg-red-950/40 border border-red-500/25 opacity-70"
                  : isPast
                  ? "bg-white/5 opacity-50 border border-white/10"
                  : isToday
                  ? "bg-white/5 border-2 border-[#AE343F]"
                  : c.premium
                  ? "bg-white/5 border-2 border-[#d4af37]/60"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              {/* Top row */}
              <div className="mb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${c.draft ? "bg-orange-400" : "bg-green-400"}`}
                        title={c.draft ? "Draft" : "Live"}
                      />
                      <span className="font-semibold text-white">
                        {c.couple_names?.full_display || c.slug}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 shrink-0">
                        {(c.premium && c.premium_theme
                          ? PREMIUM_THEME_LABEL[c.premium_theme] ??
                            c.premium_theme
                          : c.theme) || "—"}
                      </span>
                      {purgeIn !== null && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 shrink-0"
                          title="Fotografije gostiju se trajno brišu po isteku ovog roka"
                        >
                          {purgeIn === 0
                            ? "Galerija: brisanje danas"
                            : `Galerija: brisanje za ${purgeIn} d`}
                        </span>
                      )}
                      {c.standalone_gallery && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-violet-300 shrink-0"
                          title="Kupac samostalne QR galerije — vidi i tab Galerija"
                        >
                          QR galerija
                        </span>
                      )}
                      {c.premium && c.premium_status === "u_izradi" && (
                        <button
                          onClick={() => handleMarkDelivered(c.slug)}
                          title={
                            c.premium_custom_bg_note
                              ? `Pozadina po opisu: ${c.premium_custom_bg_note}\n\nKlik = označi finalnu verziju kao isporučenu`
                              : "Finalna ilustracija/pozadina u izradi — klik = označi kao isporučeno"
                          }
                          className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 shrink-0 cursor-pointer transition-colors"
                        >
                          ⚙ finalna u izradi
                        </button>
                      )}
                      <span
                        className={`text-[10px] shrink-0 ${isExpired ? "text-red-400/60" : isPast ? "text-white/30" : "text-white/60"}`}
                      >
                        {c.event_date ? daysUntil(c.event_date) : "—"}
                      </span>
                    </div>
                    <div className="text-xs text-white/40 truncate">
                      /{c.slug}{c.event_date ? <> &middot;{" "}
                      {new Date(c.event_date).toLocaleDateString("sr-RS", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}</> : null}
                      {shareStats[c.slug]?.visit_count ? (
                        <span className="ml-2 inline-flex items-center gap-1 text-green-400/70" title="Klijent je otvorio share link">
                          <Eye size={10} /> {shareStats[c.slug].visit_count}×
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <ShareLinkButton
                      productKind="couple"
                      slug={c.slug}
                      directUrl={`https://halouspomene.rs/${c.premium ? 'premium-pozivnica' : 'pozivnica'}/${c.slug}/`}
                    />
                    {c.paid_for_gallery && (
                      <>
                        <button
                          onClick={() => downloadGalleryQR(c.slug)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                          title="Preuzmi QR za galeriju"
                        >
                          <QrCode size={14} />
                        </button>
                        <button
                          onClick={() =>
                            handleExtendGallery(c.slug, c.gallery_extra_days ?? 0)
                          }
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white relative"
                          title={`Produži pristup galeriji +1 dan${
                            c.gallery_extra_days
                              ? ` (trenutno +${c.gallery_extra_days})`
                              : ""
                          }`}
                        >
                          <CalendarPlus size={14} />
                          {c.gallery_extra_days ? (
                            <span className="absolute -top-1 -right-1 text-[9px] bg-green-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">
                              {c.gallery_extra_days}
                            </span>
                          ) : null}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => router.push(`/admin/${c.slug}`)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                      title="Izmeni"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteSlug(c.slug)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-white/40 hover:text-red-400"
                      title="Obriši"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                {/* RSVP */}
                {s?.rsvp && (
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <Users size={12} />
                    <span>
                      <span className="text-green-400">{s.rsvp.attending} Da</span>
                      {" / "}
                      <span className="text-red-400">{s.rsvp.declined} Ne</span>
                      {" — "}
                      <span className="text-white/70">{s.rsvp.totalGuests} gostiju</span>
                    </span>
                  </div>
                )}

                {/* Seating */}
                {s?.seating && c.paid_for_raspored && (
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <Armchair size={12} />
                    <span>
                      {s.seating.assignedSeats}/{s.seating.totalSeats} raspoređeno
                    </span>
                    {s.seating.totalSeats > 0 && (
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#AE343F] rounded-full transition-all"
                          style={{
                            width: `${Math.round((s.seating.assignedSeats / s.seating.totalSeats) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Audio stats */}
                {s?.audio && c.paid_for_audio && (
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <Mic size={12} />
                    <span>
                      {s.audio.messageCount} {s.audio.messageCount === 1 ? "poruka" : "poruka"}
                    </span>
                  </div>
                )}
              </div>

              {/* Toggles — own row so the 4 switches don't cram the stats line on mobile */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2 sm:justify-end">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">Draft</span>
                    <button
                      onClick={() =>
                        handleToggleDraft(c.slug, !!c.draft)
                      }
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        c.draft ? "bg-orange-400" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          c.draft ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">Raspored</span>
                    <button
                      onClick={() =>
                        handleToggleRaspored(c.slug, !!c.paid_for_raspored)
                      }
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        c.paid_for_raspored ? "bg-green-500" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          c.paid_for_raspored ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">Audio</span>
                    <button
                      onClick={() =>
                        handleToggleAudio(c.slug, !!c.paid_for_audio)
                      }
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        c.paid_for_audio ? "bg-green-500" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          c.paid_for_audio ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">Galerija</span>
                    <button
                      onClick={() =>
                        handleToggleGallery(c.slug, !!c.paid_for_gallery)
                      }
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        c.paid_for_gallery ? "bg-green-500" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          c.paid_for_gallery ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

              {/* Receipt dropdown — own row, mirrors the Rođendani card */}
              <ReceiptDropdown
                couple={c}
                copiedSlug={copiedSlug}
                onGenerate={async (extras) => {
                  await handleGenerateReceipt(c.slug);

                  if (extras.retro_phone && c.event_date) {
                    const eventDate = new Date(c.event_date);
                    await fetch("/api/admin/phone-rentals", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        contact_name: c.couple_names?.full_display || c.slug,
                        rental_date: eventDate.toISOString().split("T")[0],
                        dobrodoslica: extras.dobrodoslica || false,
                        receipt_valid: true,
                        receipt_created: new Date().toISOString(),
                      }),
                    });
                  }

                  const url = await buildReceiptUrl(c, bankAccountIdx, extras);
                  await navigator.clipboard.writeText(url);
                  setCopiedSlug(c.slug);
                  setTimeout(() => setCopiedSlug(null), 2500);
                }}
                onCopy={async (extras) => {
                  const url = await buildReceiptUrl(c, bankAccountIdx, extras);
                  await navigator.clipboard.writeText(url);
                  setCopiedSlug(c.slug);
                  setTimeout(() => setCopiedSlug(null), 2500);
                }}
                onPaid={() =>
                  setMarkPaid({
                    slug: c.slug,
                    name: c.couple_names?.full_display || c.slug,
                    premium: !!c.premium,
                    prefillAmount: receiptTotalFor(c),
                    prefillLabel: c.premium
                      ? "Premium paket — žiralna uplata"
                      : "Žiralna uplata po računu",
                    slugEditable: false,
                    source: { type: "couple" },
                  })
                }
                onDiscount={(amount) => handleSetDiscount(c.slug, amount)}
              />
            </div>
            </React.Fragment>
          );
        })}
        {agendaMode && !searching && (hiddenOlderCount > 0 || showOlderPast) && (
          <button
            onClick={() => setShowOlderPast((v) => !v)}
            className="w-full mt-1 py-2.5 rounded-xl text-xs font-medium text-white/50 hover:text-white/80 border border-dashed border-white/12 hover:border-white/25 transition-colors cursor-pointer"
          >
            {showOlderPast
              ? "Sakrij starija venčanja"
              : `Prikaži starija venčanja (${hiddenOlderCount})`}
          </button>
        )}
        {!searching && demoCount > 0 && (
          <button
            onClick={() => setShowDemo((v) => !v)}
            className="w-full mt-1 py-2.5 rounded-xl text-xs font-medium text-white/50 hover:text-white/80 border border-dashed border-white/12 hover:border-white/25 transition-colors cursor-pointer"
          >
            {showDemo
              ? "Sakrij demo pozivnice"
              : `Prikaži demo pozivnice (${demoCount})`}
          </button>
        )}
      </div>

      </>
      )}

      {/* Modals sit OUTSIDE the tab ternary, next to BypassLinkModal. The
          custom-receipt list and the header buttons that open these render
          above the tab bar and are visible on every tab, so keeping the modals
          inside the Pozivnice branch left those controls dead everywhere else:
          the click set state, but the modal was never mounted to react to it. */}
      {markPaid && (
        <MarkPaidModal
          target={markPaid}
          onClose={() => setMarkPaid(null)}
          onDone={handleMarkPaidDone}
        />
      )}

      {mounted && showCustomReceipt && (
        <CustomReceiptModal
          bankAccountIdx={bankAccountIdx}
          onClose={() => setShowCustomReceipt(false)}
          onCreated={(receipt) => setCustomReceipts((prev) => [receipt, ...prev])}
        />
      )}

      {deleteSlug && (
        <DeleteModal
          slug={deleteSlug}
          onClose={() => setDeleteSlug(null)}
          onDeleted={() => {
            setCouples((c) => c.filter((x) => x.slug !== deleteSlug));
            setDeleteSlug(null);
          }}
        />
      )}
    </div>
  );
}

function ReceiptDropdown({
  couple,
  copiedSlug,
  onGenerate,
  onCopy,
  onPaid,
  onDiscount,
}: {
  couple: Couple;
  copiedSlug: string | null;
  onGenerate: (extras: { retro_phone: boolean; dobrodoslica: boolean }) => void;
  onCopy: (extras: { retro_phone: boolean; dobrodoslica: boolean }) => void;
  onPaid: () => void;
  onDiscount: (amount: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [retroPhone, setRetroPhone] = useState(false);
  const [dobrodoslica, setDobrodoslica] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isCopied = copiedSlug === couple.slug;
  const isActive = couple.receipt_valid;

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
          style={{ backgroundColor: "#2a2a2a", border: "1px solid rgba(255,255,255,0.1)", minWidth: 220 }}
        >
          {/* Retro Phone toggle */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <span className="text-[11px] text-white/50">Retro telefon ({getAudioPrice()})</span>
            <button
              onClick={() => {
                const next = !retroPhone;
                setRetroPhone(next);
                if (next) onDiscount(1500);
                else onDiscount(0);
              }}
              className={`w-8 h-[18px] rounded-full relative transition-colors ${retroPhone ? "bg-yellow-500" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${retroPhone ? "translate-x-3.5" : ""}`} />
            </button>
          </div>

          {/* Personalizovana dobrodošlica toggle */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <span className="text-[11px] text-white/50">Dobrodošlica (1.000)</span>
            <button
              onClick={() => setDobrodoslica((v) => !v)}
              className={`w-8 h-[18px] rounded-full relative transition-colors ${dobrodoslica ? "bg-yellow-500" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${dobrodoslica ? "translate-x-3.5" : ""}`} />
            </button>
          </div>

          {/* Generate / Regenerate */}
          <button
            onClick={() => { onGenerate({ retro_phone: retroPhone, dobrodoslica }); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <Receipt size={12} className="text-yellow-400" />
            {isActive ? "Regeneriši račun" : "Generiši račun"}
          </button>

          {/* Copy link */}
          {isActive && (
            <button
              onClick={() => { onCopy({ retro_phone: retroPhone, dobrodoslica }); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <Copy size={12} className="text-green-400" />
              Kopiraj link
            </button>
          )}

          {/* Mark as paid */}
          {isActive && (
            <button
              onClick={() => { onPaid(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-red-400/70 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <Check size={12} />
              Označi kao plaćeno
            </button>
          )}

          {/* Discount */}
          <div className="px-4 py-2.5 border-t border-white/5">
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
          </div>
        </div>
      )}
    </div>
  );
}

function MarkPaidModal({
  target,
  onClose,
  onDone,
}: {
  target: MarkPaidTarget;
  onClose: () => void;
  onDone: (mode: "linked" | "recorded") => void;
}) {
  interface PendingRow {
    orderId: string;
    kind: string;
    slug: string;
    tier: string;
    status: string;
    amountRsd: number;
    ipsRef: string;
    createdAt: string;
    dupWarning: boolean;
  }
  const [pending, setPending] = useState<PendingRow[] | null>(null);
  const [slug, setSlug] = useState(target.slug);
  const [amount, setAmount] = useState(
    target.prefillAmount > 0 ? String(target.prefillAmount) : "",
  );
  const [label, setLabel] = useState(target.prefillLabel);
  const [tier, setTier] = useState(
    target.defaultTier ?? (target.premium ? "premium" : "custom"),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialog } = useConfirmDialog({ variant: "dark" });
  const isCustom = target.source.type === "custom";

  useEffect(() => {
    fetch("/api/admin/orders?status=pending,review")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const rows: PendingRow[] = Array.isArray(d?.orders) ? d.orders : [];
        // Custom receipts have no real couple behind them (their slug is derived
        // from the free-text name), so filtering by it would always be empty —
        // show ALL open orders so the admin can link to whichever real order
        // this receipt was actually for.
        setPending(isCustom ? rows : rows.filter((o) => o.slug === target.slug));
      })
      .catch(() => setPending([]));
  }, [target.slug, isCustom]);

  async function link(o: PendingRow) {
    const ok = await confirm({
      title: "Poveži i odobri uplatu",
      message: `${o.orderId} — ${o.amountRsd.toLocaleString("sr-RS")} din${
        isCustom ? `\nProizvod: /${o.slug} (${o.kind})` : ""
      }\nAutomatski uključuje plaćene opcije na proizvodu.`,
      warning: o.dupWarning
        ? "Postoji već plaćen order za isti proizvod — proveri duplu uplatu."
        : undefined,
      confirmLabel: "Odobri",
    });
    if (!ok) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/orders/${o.orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setError(d.error || "Greška pri odobravanju.");
        return;
      }
      onDone("linked");
    } finally {
      setBusy(false);
    }
  }

  async function record() {
    const rsd = Math.round(Number(amount));
    if (!Number.isFinite(rsd) || rsd <= 0) {
      setError("Unesi ispravan iznos.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: target.kind ?? "pozivnica",
          slug,
          tier,
          amountRsd: rsd,
          label,
          adminNote:
            target.source.type === "custom"
              ? `Ručna evidencija — prilagođeni račun (${target.name})`
              : "Ručna evidencija — žiralna uplata",
        }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setError(d.error || "Greška pri beleženju.");
        return;
      }
      onDone("recorded");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Wallet size={16} className="text-green-400" /> Označi kao plaćeno
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="text-sm text-white/60">{target.name}</div>

        {/* Existing pending/review orders for this slug */}
        <div className="space-y-2">
          <span className="text-[11px] text-white/40 uppercase tracking-wider">
            Uplate na čekanju
          </span>
          {pending === null && (
            <p className="text-xs text-white/30">Učitavanje…</p>
          )}
          {pending !== null && pending.length === 0 && (
            <p className="text-xs text-white/30">
              {isCustom
                ? "Nema uplata na čekanju."
                : `Nema uplata na čekanju za /${target.slug}.`}
            </p>
          )}
          {pending?.map((o) => (
            <div
              key={o.orderId}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                o.dupWarning
                  ? "bg-amber-950/30 border-amber-500/30"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/80 font-medium">
                  {o.amountRsd.toLocaleString("sr-RS")} din
                  <span className="text-xs text-white/35 ml-2">
                    {o.status === "review" ? "za overu" : "čeka"} · {o.tier}
                  </span>
                </div>
                <div className="text-[11px] text-white/35 truncate">
                  {isCustom && (
                    <span className="text-white/55">/{o.slug} · </span>
                  )}
                  poziv na br. {o.ipsRef} ·{" "}
                  {new Date(o.createdAt).toLocaleDateString("sr-RS")}
                  {o.dupWarning && " · ⚠ proveri duplu uplatu"}
                </div>
              </div>
              <button
                onClick={() => link(o)}
                disabled={busy}
                className="flex items-center gap-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                <Check size={13} /> Poveži i odobri
              </button>
            </div>
          ))}
          {pending !== null && pending.length > 0 && (
            <p className="text-[11px] text-white/30">
              Odobravanje automatski uključuje plaćene opcije na proizvodu.
            </p>
          )}
        </div>

        {/* Manual ledger entry */}
        <div className="space-y-2 border-t border-white/10 pt-4">
          <span className="text-[11px] text-white/40 uppercase tracking-wider">
            Ili zabeleži novu uplatu (odmah obrađena)
          </span>
          {target.slugEditable && (
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="slug (za evidenciju)"
              className="w-full text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/25"
            />
          )}
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step={100}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Iznos u din"
              className="flex-1 text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/25"
            />
            {/* Only `pozivnica` has tiers — every other kind sells exactly one
                thing, so there is nothing to pick. */}
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              hidden={!!target.kind && target.kind !== "pozivnica"}
              className="text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg px-2 py-2 outline-none focus:border-white/25 cursor-pointer"
              style={{ backgroundColor: "#2a2a2a" }}
            >
              <option value="osnovni">Osnovni</option>
              <option value="kompletan">Kompletan</option>
              <option value="premium">Premium</option>
              <option value="custom">Kombinacija</option>
            </select>
          </div>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Opis uplate"
            className="w-full text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/25"
          />
          <button
            onClick={record}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-green-500/20 text-white/70 hover:text-green-300 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <Receipt size={13} /> Zabeleži kao plaćeno
          </button>
          <p className="text-[11px] text-white/30">
            Samo evidencija u tabu Uplate — ne menja opcije na proizvodu.
          </p>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
      {dialog}
    </div>
  );
}

function CustomReceiptModal({
  bankAccountIdx,
  onClose,
  onCreated,
}: {
  bankAccountIdx: number;
  onClose: () => void;
  onCreated: (receipt: { id: string; par: string; datum?: string; items: Array<{l: string; p: number}>; ba: number; created_at: string }) => void;
}) {
  const [par, setPar] = useState("");
  const [datum, setDatum] = useState("");
  const [items, setItems] = useState<Array<{l: string; p: number}>>([]);
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  function addItem() {
    const p = parseInt(price);
    if (!label.trim() || !p) return;
    setItems((prev) => [...prev, { l: label.trim(), p }]);
    setLabel("");
    setPrice("");
  }

  async function handleGenerate() {
    if (!par.trim() || !items.length || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/custom-receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ par: par.trim(), datum: datum || null, items, ba: bankAccountIdx }),
      });
      const { id } = await res.json();
      const created_at = new Date().toISOString();
      const data = { custom: 1, id, par: par.trim(), datum: datum || undefined, ba: bankAccountIdx, t: Date.now(), d: 0, ci: items };
      const url = `https://halouspomene.rs/racun?d=${encodeToBase64(data)}`;
      onCreated({ id, par: par.trim(), datum: datum || undefined, items, ba: bankAccountIdx, created_at });
      setGeneratedUrl(url);
      // Try clipboard — fall back gracefully on mobile PWA
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => onClose(), 2000);
      } catch {
        // Clipboard unavailable — show URL for manual copy
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleManualCopy() {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => onClose(), 1500);
    } catch { /* ignore */ }
  }

  const total = items.reduce((s, i) => s + i.p, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5"
        style={{ backgroundColor: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Receipt size={16} className="text-yellow-400" /> Prilagođeni račun
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Recipient */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-white/40 uppercase tracking-wider">Primalac / naziv</label>
          <input
            type="text"
            placeholder="npr. Marija i Petar"
            value={par}
            onChange={(e) => setPar(e.target.value)}
            className="w-full text-sm text-white/80 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/25"
          />
        </div>

        {/* Date (optional) */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-white/40 uppercase tracking-wider">Datum (opciono)</label>
          <DatePicker
            value={datum}
            onChange={setDatum}
            variant="dark"
            accentColor="#facc15"
            placeholder="Izaberite datum"
            minDate="2020-01-01"
            showQuickActions={false}
          />
        </div>

        {/* Items */}
        <div className="space-y-2">
          <label className="text-[11px] text-white/40 uppercase tracking-wider">Stavke</label>
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="flex-1 text-white/70 truncate">{item.l}</span>
              <span className="text-white/50 shrink-0">{item.p.toLocaleString("sr-RS")} din</span>
              <button onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))} className="text-red-400/60 hover:text-red-400 cursor-pointer">
                <X size={12} />
              </button>
            </div>
          ))}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Naziv stavke (npr. Muzika, Cveće...)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              className="w-full text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/25"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Cena u din"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                className="flex-1 text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/25"
              />
              <button
                onClick={addItem}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 text-sm cursor-pointer transition-colors"
              >+ Dodaj</button>
            </div>
          </div>
        </div>

        {/* Total preview */}
        {items.length > 0 && (
          <div className="flex justify-between text-sm border-t border-white/10 pt-3">
            <span className="text-white/40">Ukupno</span>
            <span className="text-white font-semibold">{total.toLocaleString("sr-RS")} din</span>
          </div>
        )}

        {/* Generate */}
        {/* Fallback URL for mobile where clipboard may fail */}
        {generatedUrl && (
          <div className="space-y-2">
            <input
              readOnly
              value={generatedUrl}
              onFocus={(e) => e.target.select()}
              className="w-full text-[10px] text-white/50 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
            />
            <button
              onClick={handleManualCopy}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium bg-green-500/20 hover:bg-green-500/30 text-green-300 cursor-pointer transition-colors"
            >
              {copied ? <><Check size={14} /> Kopirano! Zatvaranje...</> : <><Copy size={14} /> Kopiraj link</>}
            </button>
          </div>
        )}

        {!generatedUrl && (
          <button
            onClick={handleGenerate}
            disabled={!par.trim() || items.length === 0 || saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300"
          >
            {saving ? "Čuvanje..." : <><Receipt size={14} /> Generiši i kopiraj link</>}
          </button>
        )}
      </div>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">
        Admin Prijava
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin lozinka"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#AE343F]"
          autoFocus
        />
        {error && <p className="text-red-400 text-sm">Pogrešna lozinka</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-xl px-4 py-3 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Proveravam..." : "Prijavi se"}
        </button>
      </form>
    </div>
  );
}
