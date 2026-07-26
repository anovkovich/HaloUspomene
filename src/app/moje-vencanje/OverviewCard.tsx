"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Wallet,
  Users,
  Download,
  Copy,
  Check,
  AlertCircle,
  Clock,
  QrCode,
  X,
  Sparkles,
  Mail,
  Hourglass,
  Star,
  Heart,
  ArrowRight,
} from "lucide-react";
import {
  loadOverviewAction,
  getWeddingDataForPDF,
} from "./actions";
import type { ActiveView } from "./Sidebar";
import type { ChecklistItem, PortalBudget } from "./types";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";

interface Props {
  coupleInfo: {
    slug: string;
    bride: string;
    groom: string;
    eventDate: string;
    scriptFont: string;
    draft: boolean;
    hasInvitationData: boolean;
    premium: boolean;
    premiumPaid: boolean;
  };
  checklist: ChecklistItem[];
  budget: PortalBudget;
  onNavigate: (view: ActiveView) => void;
}

function daysUntil(dateStr: string): number {
  // Calendar-day comparison: an event later today returns 0 ("danas"), not 1.
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86_400_000));
}

/** Serbian numeric declension: pick the right noun form for a count. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function formatTimestamp(ts: string): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Shared, cheap entrance animation for top-level sections. */
const sectionMotion = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: "easeOut" as const },
});

export default function OverviewCard({
  coupleInfo,
  checklist,
  budget,
  onNavigate,
}: Props) {
  const [guestStats, setGuestStats] = useState<{
    attending: number;
    notAttending: number;
    totalGuests: number;
    uncategorized: number;
    notInvited: number;
    unlinkedConfirmations: number;
    recentResponses: {
      name: string;
      attending: string;
      guestCount: string;
      timestamp: string;
    }[];
  } | null>(null);
  const [audioStats, setAudioStats] = useState<{
    count: number;
    totalDurationMs: number;
    paidForAudio: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [paidForRaspored, setPaidForRaspored] = useState(false);
  const [pdfModal, setPdfModal] = useState<{
    weddingData: WeddingData;
    slug: string;
    hasEnabledPhones: boolean;
  } | null>(null);
  const [pdfIncludeQR, setPdfIncludeQR] = useState(true);
  const [pdfIncludePhones, setPdfIncludePhones] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  useEffect(() => {
    loadOverviewAction().then((result) => {
      if (result) {
        setGuestStats(result.guestStats);
        setAudioStats(result.audioStats);
        setPaidForRaspored(result.paidForRaspored);
      }
      setLoading(false);
    });
  }, []);

  const handleCopyLink = useCallback(() => {
    const path = coupleInfo.premium
      ? `premium-pozivnica/${coupleInfo.slug}`
      : `pozivnica/${coupleInfo.slug}`;
    navigator.clipboard.writeText(`https://halouspomene.rs/${path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [coupleInfo.slug, coupleInfo.premium]);

  const handleDownloadPDF = useCallback(async () => {
    setPdfLoading(true);
    const result = await getWeddingDataForPDF();
    setPdfLoading(false);
    if (!result) return;
    const phones = (result.weddingData.contact_phone ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const hasEnabledPhones = phones.some(
      (_, i) => result.weddingData.show_numbers?.[i] === true,
    );
    setPdfIncludeQR(true);
    setPdfIncludePhones(hasEnabledPhones);
    setPdfModal({
      weddingData: result.weddingData,
      slug: result.slug,
      hasEnabledPhones,
    });
  }, []);

  const handleConfirmPdfDownload = useCallback(async () => {
    if (!pdfModal) return;
    setPdfDownloading(true);
    try {
      const { generateInvitationPDF } = await import(
        "@/app/pozivnica/[slug]/generateInvitationPDF"
      );
      await generateInvitationPDF(
        pdfModal.weddingData,
        pdfModal.slug,
        pdfModal.weddingData.paid_for_pdf ?? false,
        pdfModal.weddingData.useCyrillic ?? false,
        {
          includeQR: pdfIncludeQR,
          includePhones: pdfModal.hasEnabledPhones && pdfIncludePhones,
        },
      );
      setPdfModal(null);
    } finally {
      setPdfDownloading(false);
    }
  }, [pdfModal, pdfIncludeQR, pdfIncludePhones]);

  const handleDownloadFlyer = useCallback(async () => {
    const { generateAudioFlyerPDF } =
      await import("@/lib/audio-utils/generateAudioFlyerPDF");
    await generateAudioFlyerPDF(
      coupleInfo.slug,
      `${coupleInfo.bride} & ${coupleInfo.groom}`,
      "#AE343F",
      false,
    );
  }, [coupleInfo]);

  const handleDownloadSeatQR = useCallback(async () => {
    const QRCode = await import("qrcode");
    const url = `https://halouspomene.rs/pozivnica/${coupleInfo.slug}/gde-sedim`;
    const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 2, color: { dark: "#232323", light: "#ffffff" } });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `gde-sedim-${coupleInfo.slug}.png`;
    a.click();
  }, [coupleInfo.slug]);

  const handleDownloadRsvpQR = useCallback(async () => {
    const QRCode = await import("qrcode");
    const url = `https://halouspomene.rs/rsvp/pozivnica-${coupleInfo.slug}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 2, color: { dark: "#232323", light: "#ffffff" } });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `rsvp-${coupleInfo.slug}.png`;
    a.click();
  }, [coupleInfo.slug]);

  // Derived stats
  const days = daysUntil(coupleInfo.eventDate);
  const completedCount = checklist.filter((i) => i.completed).length;
  const checklistPct =
    checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

  const EUR_RATE = 117.5;
  const totalPlanned = budget.categories.reduce(
    (s, c) => s + (c.currency === "EUR" ? c.planned * EUR_RATE : c.planned),
    0,
  );
  const totalSpent = budget.categories.reduce(
    (s, c) => s + (c.currency === "EUR" ? c.spent * EUR_RATE : c.spent),
    0,
  );
  const budgetBase =
    (budget.totalBudget
      ? budget.totalBudgetCurrency === "EUR"
        ? budget.totalBudget * EUR_RATE
        : budget.totalBudget
      : totalPlanned) || 1;
  const budgetPct = Math.min(100, (totalSpent / budgetBase) * 100);
  const budgetOver = totalSpent > budgetBase;

  // Alerts
  const alerts: { text: string; action: () => void }[] = [];
  if (guestStats) {
    if (guestStats.unlinkedConfirmations > 0) {
      alerts.push({
        text: `${guestStats.unlinkedConfirmations} ${plural(
          guestStats.unlinkedConfirmations,
          "nepovezana potvrda gostiju",
          "nepovezane potvrde gostiju",
          "nepovezanih potvrda gostiju",
        )}`,
        action: () => onNavigate("guests"),
      });
    }
    if (guestStats.notInvited > 0) {
      alerts.push({
        text: `${guestStats.notInvited} ${plural(
          guestStats.notInvited,
          "nepozvan gost",
          "nepozvana gosta",
          "nepozvanih gostiju",
        )}`,
        action: () => onNavigate("guests"),
      });
    }
    if (guestStats.uncategorized > 0) {
      alerts.push({
        text: `${guestStats.uncategorized} ${plural(
          guestStats.uncategorized,
          "nekategorisan gost",
          "nekategorisana gosta",
          "nekategorisanih gostiju",
        )}`,
        action: () => onNavigate("guests"),
      });
    }
  }
  // Upcoming checklist items (items in nearest uncompleted group)
  const upcomingCount = checklist.filter((i) => !i.completed).length;
  if (upcomingCount > 0 && upcomingCount <= 10) {
    alerts.push({
      text: `${upcomingCount} ${plural(
        upcomingCount,
        "preostala stavka na checklisti",
        "preostale stavke na checklisti",
        "preostalih stavki na checklisti",
      )}`,
      action: () => onNavigate("checklist"),
    });
  }

  const hasValidDate =
    !!coupleInfo.eventDate && !isNaN(new Date(coupleInfo.eventDate).getTime());

  const statCardClass =
    "group relative bg-white rounded-2xl border border-[#232323]/10 p-5 text-left shadow-[0_1px_3px_rgba(35,35,35,0.06)] hover:shadow-[0_10px_28px_-10px_rgba(174,52,63,0.28)] hover:border-[#AE343F]/35 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer";

  const smallActionClass =
    "flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-white border border-[#232323]/12 text-[#232323]/80 shadow-[0_1px_2px_rgba(35,35,35,0.05)] hover:border-[#AE343F]/40 hover:text-[#AE343F] hover:shadow-[0_4px_12px_-4px_rgba(174,52,63,0.25)] transition-all cursor-pointer";

  return (
    <div className="space-y-5">
      {/* Countdown hero */}
      <motion.div
        {...sectionMotion(0)}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-white to-[#fdfcf2] border border-[#d4af37]/30 shadow-[0_18px_40px_-18px_rgba(174,52,63,0.25)] text-center"
      >
        {/* gold hairline + soft glow */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[28rem] max-w-full rounded-full bg-[#d4af37]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/2 -translate-x-1/2 h-48 w-[24rem] max-w-full rounded-full bg-[#AE343F]/[0.06] blur-3xl" />

        <div className="relative px-6 py-9 sm:py-11">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#d4af37]/70" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#232323]/60 flex items-center gap-2">
              <Heart size={11} className="text-[#AE343F] fill-[#AE343F]/20" />
              Do venčanja
              <Heart size={11} className="text-[#AE343F] fill-[#AE343F]/20" />
            </p>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#d4af37]/70" />
          </div>

          {hasValidDate ? (
            <>
              <p className="font-serif text-7xl sm:text-8xl font-semibold text-[#AE343F] leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(174,52,63,0.12)]">
                {days}
              </p>
              <p className="mt-3 font-serif text-xl text-[#232323]/80 italic">
                {days === 1 ? "dan" : "dana"}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2.5">
                <span className="h-1 w-1 rounded-full bg-[#d4af37]" />
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#232323]/70">
                  {new Date(coupleInfo.eventDate).toLocaleDateString("sr-Latn-RS", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <span className="h-1 w-1 rounded-full bg-[#d4af37]" />
              </div>
            </>
          ) : (
            <>
              <p className="font-serif text-7xl sm:text-8xl font-semibold text-[#232323]/30 leading-none tracking-tight">
                XX
              </p>
              <p className="mt-3 font-serif text-xl text-[#232323]/50 italic">dana</p>
              <div className="mt-4 flex items-center justify-center gap-2.5">
                <span className="h-1 w-1 rounded-full bg-[#d4af37]/50" />
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#232323]/45">
                  XX. XX. XXXX.
                </p>
                <span className="h-1 w-1 rounded-full bg-[#d4af37]/50" />
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        {...sectionMotion(0.06)}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {/* Checklist */}
        <button onClick={() => onNavigate("checklist")} className={statCardClass}>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#AE343F]/10 group-hover:bg-[#AE343F]/15 transition-colors">
              <CheckCircle2 size={16} className="text-[#AE343F]" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#232323]/60">
              Checklista
            </span>
          </div>
          <div className="flex items-end justify-between mb-2.5">
            <p className="font-serif text-[2rem] font-semibold text-[#232323] leading-none">
              {completedCount}
              <span className="text-[#232323]/40 font-normal text-xl">
                /{checklist.length}
              </span>
            </p>
            <span className="text-[11px] font-semibold text-[#AE343F]/80 mb-0.5">
              {Math.round(checklistPct)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-[#232323]/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#AE343F] to-[#8A2A32] transition-all"
              style={{ width: `${checklistPct}%` }}
            />
          </div>
        </button>

        {/* Budget */}
        <button onClick={() => onNavigate("budget")} className={statCardClass}>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#AE343F]/10 group-hover:bg-[#AE343F]/15 transition-colors">
              <Wallet size={16} className="text-[#AE343F]" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#232323]/60">
              Budžet
            </span>
          </div>
          <div className="flex items-end justify-between mb-2.5">
            <p className="font-serif text-[2rem] font-semibold text-[#232323] leading-none">
              {totalSpent > 0 ? `${Math.round(totalSpent / 1000)}K` : "—"}
              {totalPlanned > 0 && (
                <span className="text-[#232323]/40 font-normal text-xl">
                  {" "}
                  / {Math.round(budgetBase / 1000)}K
                </span>
              )}
            </p>
            {totalSpent > 0 && (
              <span
                className={`text-[11px] font-semibold mb-0.5 ${budgetOver ? "text-red-600" : "text-[#AE343F]/80"}`}
              >
                {Math.round(budgetPct)}%
              </span>
            )}
          </div>
          <div
            className={`h-1.5 rounded-full overflow-hidden ${budgetOver ? "bg-red-500/20" : "bg-[#232323]/8"}`}
          >
            <div
              className={`h-full rounded-full transition-all ${
                budgetOver
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-[#AE343F] to-[#8A2A32]"
              }`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </button>

        {/* Guests */}
        <button onClick={() => onNavigate("guests")} className={statCardClass}>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#AE343F]/10 group-hover:bg-[#AE343F]/15 transition-colors">
              <Users size={16} className="text-[#AE343F]" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#232323]/60">
              Gosti
            </span>
          </div>
          {loading ? (
            <span className="loading loading-spinner loading-xs text-[#AE343F]" />
          ) : guestStats ? (
            <>
              <p className="font-serif text-[2rem] font-semibold text-[#232323] mb-1.5 leading-none">
                {guestStats.totalGuests}
              </p>
              <p className="text-xs text-[#232323]/65">
                <span className="font-semibold text-[#AE343F]/90">
                  {guestStats.attending}
                </span>{" "}
                potvrđenih · {guestStats.notAttending} odbijanja
              </p>
            </>
          ) : (
            <p className="font-serif text-[2rem] font-semibold text-[#232323]/35">—</p>
          )}
        </button>

        {/* Vendors */}
        <button onClick={() => onNavigate("vendors")} className={statCardClass}>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]/15 group-hover:bg-[#d4af37]/25 transition-colors">
              <Star size={16} className="text-[#d4af37]" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#232323]/60">
              Vendori
            </span>
          </div>
          <p className="text-[13px] text-[#232323]/65 leading-relaxed">
            Pronađite fotografe, DJ-eve, sale, torte i druge vendore u vašem gradu.
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#AE343F] opacity-0 group-hover:opacity-100 transition-opacity">
            Pogledaj <ArrowRight size={11} />
          </span>
        </button>

        {/* Alerts inline */}
        <div className="relative bg-white rounded-2xl border border-[#d4af37]/25 p-5 shadow-[0_1px_3px_rgba(35,35,35,0.06)] hover:border-[#d4af37]/45 transition-colors col-span-2 lg:col-span-4">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]/15">
              <AlertCircle size={16} className="text-[#AE343F]" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#232323]/60">
              {alerts.length > 0 ? "Pažnja" : "Nema upozorenja"}
            </span>
          </div>
          {loading ? (
            <span className="loading loading-spinner loading-xs text-[#d4af37]" />
          ) : alerts.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {alerts.map((alert, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#d4af37] shrink-0" />
                  <button
                    onClick={alert.action}
                    className="text-left text-xs text-[#232323]/80 hover:text-[#AE343F] hover:underline transition-colors cursor-pointer"
                  >
                    {alert.text}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-green-700 flex items-center gap-1.5">
              <Check size={12} />
              Sve izgleda u redu
            </p>
          )}
        </div>
      </motion.div>

      {/* Upgrade CTA — visible only for draft couples that haven't submitted invitation form yet */}
      {coupleInfo.draft && !coupleInfo.hasInvitationData && (
        <motion.div
          {...sectionMotion(0.1)}
          className="relative overflow-hidden bg-gradient-to-br from-[#fffdf5] to-[#f5f4dc] rounded-3xl border border-[#d4af37]/40 p-6 shadow-[0_14px_32px_-16px_rgba(212,175,55,0.4)]"
        >
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
          <div className="flex items-start gap-3 mb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d4af37]/15 shrink-0">
              <Sparkles size={18} className="text-[#d4af37]" />
            </span>
            <div>
              <p className="font-serif text-xl text-[#232323] mb-1">
                Nadogradite u pravu pozivnicu
              </p>
              <p className="text-sm text-[#232323]/70 leading-relaxed">
                Trenutno koristite samo planer. Završite kreiranje stvarne
                pozivnice — naš tim će vas kontaktirati radi naplate i
                aktivacije.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href={`/napravi-pozivnicu?upgrade=${coupleInfo.slug}&premium=true`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#d4af37] to-[#c5a028] text-white border border-[#d4af37] shadow-sm hover:shadow-md hover:from-[#c5a028] hover:to-[#b8972e] transition-all"
            >
              <Sparkles size={15} />
              Premium AI pozivnica
            </Link>
            <Link
              href={`/napravi-pozivnicu?upgrade=${coupleInfo.slug}`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-[#AE343F] text-white border border-[#AE343F] shadow-sm hover:shadow-md hover:bg-[#962d36] transition-all"
            >
              <Mail size={15} />
              Klasična pozivnica
            </Link>
          </div>
        </motion.div>
      )}

      {/* In-progress banner — already submitted upgrade, waiting for admin */}
      {coupleInfo.draft && coupleInfo.hasInvitationData && (
        <motion.div
          {...sectionMotion(0.1)}
          className="bg-[#d4af37]/10 rounded-2xl border border-[#d4af37]/35 p-5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d4af37]/15 shrink-0">
              <Hourglass size={17} className="text-[#d4af37]" />
            </span>
            <div>
              <p className="font-serif text-lg text-[#232323] mb-1">
                Vaša nadogradnja je u obradi
              </p>
              <p className="text-sm text-[#232323]/70">
                Primili smo sve podatke za vašu pozivnicu — uskoro ćemo vas
                kontaktirati radi naplate i aktivacije.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div
        {...sectionMotion(0.12)}
        className="bg-white rounded-3xl border border-[#232323]/10 p-5 sm:p-6 shadow-[0_1px_3px_rgba(35,35,35,0.06)]"
      >
        <div className="flex items-center gap-3 mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#232323]/60">
            Brze akcije
          </p>
          <span className="h-px flex-1 bg-gradient-to-r from-[#d4af37]/40 to-transparent" />
        </div>
        <button
          onClick={() => {
            if (coupleInfo.draft) {
              toast("Dostupno nakon kreiranja pozivnice — naš tim će vas kontaktirati");
              return;
            }
            handleDownloadRsvpQR();
          }}
          className={`flex items-center gap-3 w-full px-4 py-3.5 mb-3 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
            coupleInfo.draft
              ? "bg-[#F5F4DC]/40 border-[#232323]/10 text-[#232323]/50"
              : "bg-[#AE343F]/[0.05] border-[#AE343F]/20 text-[#232323]/85 hover:border-[#AE343F]/45 hover:bg-[#AE343F]/[0.08] hover:text-[#AE343F] hover:shadow-[0_6px_16px_-6px_rgba(174,52,63,0.3)]"
          }`}
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${
              coupleInfo.draft ? "bg-[#232323]/5" : "bg-[#AE343F]/10"
            }`}
          >
            <QrCode
              size={16}
              className={coupleInfo.draft ? "text-[#232323]/40" : "text-[#AE343F]"}
            />
          </span>
          <span className="hidden sm:inline text-left flex-1">
            Dodajte QR za online potvrde na vaše štampane pozivnice
          </span>
          <span className="sm:hidden text-left flex-1">
            QR potvrda za papirne pozivnice
          </span>
          {!coupleInfo.draft && (
            <Download size={14} className="shrink-0 opacity-60" />
          )}
        </button>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {coupleInfo.draft ? (
            <>
              {[
                { icon: <Copy size={13} />, label: "Pozivnica" },
                { icon: <Download size={13} />, label: "PDF pozivnica" },
                { icon: <QrCode size={13} />, label: "QR Gde sedim" },
                { icon: <QrCode size={13} />, label: "Audio flyer" },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => {
                    toast("Dostupno nakon kreiranja pozivnice — naš tim će vas kontaktirati");
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-[#F5F4DC]/40 border border-[#232323]/10 text-[#232323]/50 cursor-pointer transition-colors"
                >
                  {btn.icon}
                  {btn.label}
                </button>
              ))}
            </>
          ) : (
            <>
              <button onClick={handleCopyLink} className={smallActionClass}>
                {copied ? (
                  <Check size={13} className="text-green-600" />
                ) : (
                  <Copy size={13} />
                )}
                {copied ? "Kopirano!" : "Pozivnica"}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className={`${smallActionClass} disabled:opacity-60 disabled:cursor-wait`}
              >
                <Download size={13} />
                {pdfLoading ? "Učitavanje..." : "PDF pozivnica"}
              </button>
              <button
                onClick={() => {
                  if (!paidForRaspored) {
                    toast("Raspored sedenja nije aktiviran");
                    return;
                  }
                  handleDownloadSeatQR();
                }}
                className={smallActionClass}
              >
                <QrCode size={13} />
                QR Gde sedim
              </button>
              <button
                onClick={() => {
                  if (!audioStats?.paidForAudio) {
                    toast("Audio knjiga nije aktivirana");
                    return;
                  }
                  handleDownloadFlyer();
                }}
                className={smallActionClass}
              >
                <QrCode size={13} />
                Audio flyer
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Recent RSVP */}
      {guestStats && guestStats.recentResponses.length > 0 && (
        <motion.div
          {...sectionMotion(0.16)}
          className="bg-white rounded-3xl border border-[#232323]/10 p-5 sm:p-6 shadow-[0_1px_3px_rgba(35,35,35,0.06)]"
        >
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#232323]/60">
              Poslednje potvrde
            </p>
            <span className="h-px flex-1 bg-gradient-to-r from-[#d4af37]/40 to-transparent" />
            <button
              onClick={() => onNavigate("guests")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#AE343F] hover:underline cursor-pointer shrink-0"
            >
              Sve potvrde
              <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-0.5">
            {guestStats.recentResponses.map((r, i, arr) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F4DC]/40 transition-colors"
                style={{
                  opacity:
                    i === arr.length - 1 ? 0.6 : i === arr.length - 2 ? 0.8 : 1,
                }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ring-1 ${
                    r.attending === "Da"
                      ? "bg-[#AE343F]/10 ring-[#AE343F]/20"
                      : "bg-[#232323]/8 ring-[#232323]/15"
                  }`}
                >
                  {r.attending === "Da" ? (
                    <Check
                      size={11}
                      className="text-[#AE343F]"
                      strokeWidth={3}
                    />
                  ) : (
                    <span className="text-[9px] text-[#232323]/60 font-bold">
                      ✕
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-[#232323] flex-1 truncate">
                  {r.name}
                </span>
                <span className="text-[11px] text-[#232323]/55 shrink-0">
                  <Clock size={10} className="inline mr-0.5 -mt-px" />
                  {formatTimestamp(r.timestamp)}
                </span>
                {r.attending === "Da" && (
                  <span className="text-[11px] font-semibold text-[#AE343F] bg-[#AE343F]/8 rounded-full px-2 py-0.5 shrink-0">
                    {parseInt(r.guestCount) || 1} os.
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
      {/* PDF download options modal */}
      {pdfModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4"
          onClick={() => !pdfDownloading && setPdfModal(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
            <button
              onClick={() => setPdfModal(null)}
              disabled={pdfDownloading}
              className="absolute top-4 right-4 text-[#232323]/60 hover:text-[#232323] transition-colors cursor-pointer disabled:opacity-40"
            >
              <X size={18} />
            </button>

            <h3 className="font-serif text-xl text-[#232323] mb-1">
              Preuzmi PDF pozivnicu
            </h3>
            <p className="text-xs text-[#232323]/55 mb-5">
              Izaberi šta da uključimo u pozivnicu.
            </p>

            <div className="space-y-2 mb-6">
              <label className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-[#F5F4DC]/50 border border-[#232323]/12 cursor-pointer hover:border-[#AE343F]/40 transition-colors">
                <input
                  type="checkbox"
                  checked={pdfIncludeQR}
                  onChange={(e) => setPdfIncludeQR(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#AE343F] cursor-pointer"
                />
                <span className="flex-1">
                  <span className="block text-sm font-medium text-[#232323]">
                    QR kod za potvrdu dolaska
                  </span>
                  <span className="block text-[11px] text-[#232323]/55 mt-0.5">
                    Skeniranjem gosti idu direktno na formu za potvrdu dolaska.
                  </span>
                </span>
              </label>

              {pdfModal.hasEnabledPhones && (
                <label className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-[#F5F4DC]/50 border border-[#232323]/12 cursor-pointer hover:border-[#AE343F]/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={pdfIncludePhones}
                    onChange={(e) => setPdfIncludePhones(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#AE343F] cursor-pointer"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-[#232323]">
                      Brojevi telefona
                    </span>
                    <span className="block text-[11px] text-[#232323]/55 mt-0.5">
                      Prikazuje brojeve koji su uključeni u admin panelu.
                    </span>
                  </span>
                </label>
              )}
            </div>

            <button
              onClick={handleConfirmPdfDownload}
              disabled={pdfDownloading}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#AE343F] text-white text-sm font-semibold shadow-[0_6px_16px_-6px_rgba(174,52,63,0.5)] hover:bg-[#962d36] transition-colors disabled:opacity-60 disabled:cursor-wait cursor-pointer"
            >
              <Download size={15} />
              {pdfDownloading ? "Generisanje..." : "Preuzmi PDF"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
