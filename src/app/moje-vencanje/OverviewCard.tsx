"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import PrintChoiceModal from "@/components/portal/PrintChoiceModal";
import PrintCard from "@/components/portal/PrintCard";
import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  CheckCircle2,
  Wallet,
  Users,
  Download,
  Copy,
  Check,
  Clock,
  X,
  Sparkles,
  Mail,
  Hourglass,
  Star,
  Heart,
  ArrowRight,
  ChevronRight,
  CalendarPlus,
  Minus,
  Plus,
  ClipboardList,
  UserCheck,
} from "lucide-react";
import {
  loadOverviewAction,
  getWeddingDataForPDF,
  extendRsvpDeadlineAction,
} from "./actions";
import type { ActiveView } from "./Sidebar";
import type { ChecklistItem, PortalBudget } from "./types";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";

// Povlači i „Listu zvanica" sa sobom (deli birač i dijalog odgovora), pa se
// učitava tek kad par klikne prečicu — Pregled se ne debljа zbog nje.
const QuickAnswerModal = dynamic(() => import("./QuickAnswerModal"), {
  ssr: false,
});

interface Props {
  coupleInfo: {
    slug: string;
    bride: string;
    groom: string;
    eventDate: string;
    submitUntil: string;
    scriptFont: string;
    draft: boolean;
    hasInvitationData: boolean;
    premium: boolean;
    premiumPaid: boolean;
  };
  checklist: ChecklistItem[];
  budget: PortalBudget;
  /** `guestsSubView` picks which tab the Gosti view opens on (default: potvrde). */
  onNavigate: (
    view: ActiveView,
    opts?: { guestsSubView?: "potvrde" | "lista" },
  ) => void;
  /** Lifts a freshly extended RSVP deadline back to the portal shell. */
  onSubmitUntilChange?: (submitUntil: string) => void;
}

/** Same cap the server enforces — the stepper must not offer what it will reject. */
const MAX_EXTENSION_DAYS = 30;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
  onSubmitUntilChange,
}: Props) {
  const [guestStats, setGuestStats] = useState<{
    attending: number;
    notAttending: number;
    totalGuests: number;
    uncategorized: number;
    notInvited: number;
    unlinkedConfirmations: number;
    inviteeCount: number;
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
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendDays, setExtendDays] = useState(7);
  const [extending, setExtending] = useState(false);
  const [paidForRaspored, setPaidForRaspored] = useState(false);
  const [paidForGallery, setPaidForGallery] = useState(false);
  const [pdfModal, setPdfModal] = useState<{
    weddingData: WeddingData;
    slug: string;
    hasEnabledPhones: boolean;
  } | null>(null);
  const [pdfIncludeQR, setPdfIncludeQR] = useState(true);
  const [pdfIncludePhones, setPdfIncludePhones] = useState(true);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [quickAnswerOpen, setQuickAnswerOpen] = useState(false);

  const refreshOverview = useCallback(() => {
    return loadOverviewAction().then((result) => {
      if (result) {
        setGuestStats(result.guestStats);
        setAudioStats(result.audioStats);
        setPaidForRaspored(result.paidForRaspored);
        setPaidForGallery(result.paidForGallery);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    refreshOverview();
  }, [refreshOverview]);

  const handleCopyLink = useCallback(() => {
    const path = coupleInfo.premium
      ? `premium-pozivnica/${coupleInfo.slug}`
      : `pozivnica/${coupleInfo.slug}`;
    navigator.clipboard.writeText(`https://halouspomene.rs/${path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [coupleInfo.slug, coupleInfo.premium]);

  const [printChoice, setPrintChoice] = useState<
    "potvrde" | "pozivnica" | "galerija" | "audio" | null
  >(null);

  const downloadQrPng = useCallback(async (url: string, file: string) => {
    const QRCode = await import("qrcode");
    const dataUrl = await QRCode.toDataURL(url, {
      width: 1400, margin: 2, color: { dark: "#232323", light: "#ffffff" },
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = file;
    a.click();
  }, []);

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

  const handleDownloadPDF = useCallback(async () => {
    const result = await getWeddingDataForPDF();
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





  /* ── Rok za potvrde dolaska ─────────────────────────────────
   *  The couple only ever sees this on the last day of the deadline or after
   *  it has run out — that is when a guest calls saying "the form is closed".
   *  Once the deadline already sits on the wedding day there is nothing left
   *  to extend, so the button stays hidden. */
  const deadline = useMemo(() => {
    const d = new Date(coupleInfo.submitUntil);
    if (!coupleInfo.submitUntil || isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysLeft = Math.round((d.getTime() - today.getTime()) / 86_400_000);

    const event = new Date(coupleInfo.eventDate);
    const eventValid = !isNaN(event.getTime());
    if (eventValid) event.setHours(0, 0, 0, 0);
    const eventPassed = eventValid && event.getTime() < today.getTime();
    const atEventDate = eventValid && d.getTime() >= event.getTime();
    const maxDays = eventValid
      ? Math.min(
          MAX_EXTENSION_DAYS,
          Math.round((event.getTime() - Math.max(d.getTime(), today.getTime())) / 86_400_000),
        )
      : MAX_EXTENSION_DAYS;

    return {
      daysLeft,
      display: formatDate(coupleInfo.submitUntil),
      canExtend: daysLeft <= 0 && !eventPassed && !atEventDate && maxDays >= 1,
      maxDays: Math.max(1, maxDays),
    };
  }, [coupleInfo.submitUntil, coupleInfo.eventDate]);

  const handleExtendDeadline = useCallback(async () => {
    if (extending) return;
    setExtending(true);
    try {
      const result = await extendRsvpDeadlineAction(extendDays);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onSubmitUntilChange?.(result.submitUntil);
      setExtendOpen(false);
      toast.success(
        result.capped
          ? `Rok je produžen do dana venčanja — ${formatDate(result.submitUntil)}.`
          : `Rok za potvrde je produžen do ${formatDate(result.submitUntil)}.`,
      );
    } catch {
      toast.error("Greška pri produžavanju roka. Pokušajte ponovo.");
    } finally {
      setExtending(false);
    }
  }, [extending, extendDays, onSubmitUntilChange]);

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

  return (
    <div className="space-y-8">
      {/* Countdown hero */}
      <motion.div
        {...sectionMotion(0)}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-white to-[#fdfcf2] border border-[#d4af37]/30 shadow-[0_18px_40px_-18px_rgba(174,52,63,0.25)] text-center"
      >
        {/* gold hairline + soft glow */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[28rem] max-w-full rounded-full bg-[#d4af37]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/2 -translate-x-1/2 h-48 w-[24rem] max-w-full rounded-full bg-[#AE343F]/[0.06] blur-3xl" />

        <div className="relative px-6 py-6 sm:py-7">
          <div className="flex items-center justify-center gap-3 mb-4">
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
              <p className="font-serif text-6xl sm:text-7xl font-semibold text-[#AE343F] leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(174,52,63,0.12)]">
                {days}
              </p>
              <p className="mt-1.5 font-serif text-lg text-[#232323]/80 italic">
                {days === 1 ? "dan" : "dana"}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2.5">
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
              <p className="font-serif text-6xl sm:text-7xl font-semibold text-[#232323]/30 leading-none tracking-tight">
                XX
              </p>
              <p className="mt-1.5 font-serif text-lg text-[#232323]/50 italic">dana</p>
              <div className="mt-3 flex items-center justify-center gap-2.5">
                <span className="h-1 w-1 rounded-full bg-[#d4af37]/50" />
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#232323]/45">
                  XX. XX. XXXX.
                </p>
                <span className="h-1 w-1 rounded-full bg-[#d4af37]/50" />
              </div>
            </>
          )}

          {!coupleInfo.draft && (
            <div className="mt-5 flex justify-center">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-white/70 border border-[#232323]/12 text-[#232323]/80 hover:border-[#AE343F]/40 hover:text-[#AE343F] transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check size={13} className="text-green-600" />
                ) : (
                  <Copy size={13} />
                )}
                {copied ? "Link je kopiran" : "Kopiraj link pozivnice"}
              </button>
            </div>
          )}

          {!coupleInfo.draft && deadline?.canExtend && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-[11px] text-[#232323]/55">
                {deadline.daysLeft === 0
                  ? `Danas je poslednji dan za potvrde dolaska (${deadline.display})`
                  : `Rok za potvrde dolaska je istekao ${deadline.display}`}
              </p>

              {extendOpen && (
                <div className="flex items-center gap-1 rounded-full border border-[#d4af37]/45 bg-white px-1.5 py-1 shadow-[0_2px_8px_-4px_rgba(174,52,63,0.3)]">
                  <button
                    type="button"
                    onClick={() => setExtendDays((d) => Math.max(1, d - 1))}
                    disabled={extending || extendDays <= 1}
                    aria-label="Jedan dan manje"
                    className="h-7 w-7 flex items-center justify-center rounded-full text-[#232323]/70 hover:bg-[#F5F4DC] hover:text-[#AE343F] disabled:opacity-35 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="min-w-[5.5rem] text-center text-xs font-semibold text-[#232323]">
                    {extendDays}{" "}
                    <span className="font-normal text-[#232323]/60">
                      {plural(extendDays, "dan", "dana", "dana")}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setExtendDays((d) => Math.min(deadline.maxDays, d + 1))
                    }
                    disabled={extending || extendDays >= deadline.maxDays}
                    aria-label="Jedan dan više"
                    className="h-7 w-7 flex items-center justify-center rounded-full text-[#232323]/70 hover:bg-[#F5F4DC] hover:text-[#AE343F] disabled:opacity-35 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!extendOpen) {
                    setExtendDays(Math.min(7, deadline.maxDays));
                    setExtendOpen(true);
                    return;
                  }
                  handleExtendDeadline();
                }}
                disabled={extending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#AE343F] text-white hover:bg-[#962c36] disabled:opacity-60 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <CalendarPlus size={13} />
                {extending
                  ? "Čuvanje..."
                  : extendOpen
                    ? "Produži rok!"
                    : "Produži rok za potvrde"}
              </button>

              {extendOpen && !extending && (
                <button
                  type="button"
                  onClick={() => setExtendOpen(false)}
                  className="text-[11px] text-[#232323]/45 hover:text-[#232323]/70 transition-colors cursor-pointer"
                >
                  Otkaži
                </button>
              )}
            </div>
          )}
        </div>
      {printChoice && (
        <PrintChoiceModal
          title={
            printChoice === "potvrde"
              ? "QR za potvrde dolaska"
              : printChoice === "galerija"
                ? "QR za galeriju"
                : printChoice === "audio"
                  ? "QR za audio knjigu"
                  : "Dizajn pozivnice za štampu"
          }
          fileLabel={
            printChoice === "pozivnica" ? "Preuzmi dizajn — PDF" : "Samo QR kod — PNG"
          }
          fileIcon={printChoice === "pozivnica" ? "doc" : "image"}
          fileHint={
            printChoice === "pozivnica"
              ? "Spreman za štampu u bilo kojoj štampariji."
              : "Za ubacivanje u vaš dizajn ili samostalnu štampu."
          }
          offerText={
            printChoice === "potvrde"
              ? "Štampane pozivnice sa QR kodom za potvrde dolaska, izrađene po vašoj želji."
              : printChoice === "galerija"
                ? "Štampane zahvalnice sa QR kodom galerije — gosti skeniranjem ostavljaju svoje fotografije."
                : printChoice === "audio"
                  ? "Štampane kartice sa QR kodom — gosti skeniranjem snimaju audio poruke."
                  : "Gotove, odštampane pozivnice po vašem dizajnu — mi ih izrađujemo i štampamo."
          }
          order={{
            product:
              printChoice === "potvrde"
                ? "Pozivnice sa QR kodom za potvrde dolaska"
                : printChoice === "galerija"
                  ? "Zahvalnice sa QR kodom galerije"
                  : printChoice === "audio"
                    ? "Kartice sa QR kodom za audio knjigu"
                    : "Odštampane pozivnice po dizajnu",
            slug: coupleInfo.slug,
            displayName: `${coupleInfo.bride} & ${coupleInfo.groom}`.trim(),
            eventDate: coupleInfo.eventDate,
          }}
          onDownload={() => {
            if (printChoice === "potvrde") handleDownloadRsvpQR();
            else if (printChoice === "galerija")
              downloadQrPng(
                `https://halouspomene.rs/pozivnica/${coupleInfo.slug}/galerija/`,
                `qr-galerija-${coupleInfo.slug}.png`,
              );
            else if (printChoice === "audio")
              downloadQrPng(
                `https://halouspomene.rs/pozivnica/${coupleInfo.slug}/audio-knjiga/`,
                `qr-audio-${coupleInfo.slug}.png`,
              );
            else handleDownloadPDF();
          }}
          onClose={() => setPrintChoice(null)}
        />
      )}

      </motion.div>

      {/* Lista zvanica CTA — svakom paru koji je još nije započeo. Parovima sa
       *  rasporedom sedenja dodaje se i rečenica o njemu: njihovi gosti u
       *  raspored ulaze preko potvrda, pa je lista prirodan prvi korak.
       *  Stoji PRE statusne trake — dok liste nema, to je sledeći potez. */}
      {!loading && guestStats?.inviteeCount === 0 && (
        <motion.div
          {...sectionMotion(0.1)}
          className="relative overflow-hidden rounded-2xl bg-white border border-[#d4af37]/40 p-5 shadow-[0_10px_26px_-18px_rgba(174,52,63,0.35)]"
        >
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AE343F]/10 shrink-0">
              <ClipboardList size={18} className="text-[#AE343F]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-lg text-[#232323] mb-1">
                Napravite listu zvanica
              </p>
              <p className="text-[13px] text-[#232323]/70 leading-relaxed">
                Upišite koga zovete — po porodicama i grupama, sa kumovima i
                ostalim ulogama. Spisak vidite samo vi, a potvrde koje stignu
                povezuju se sa njim, pa uvek znate ko još nije odgovorio.
                {paidForRaspored &&
                  " Zvanice koje potvrde dolazak odmah možete rasporediti u rasporedu sedenja."}
              </p>
              <button
                onClick={() => onNavigate("guests", { guestsSubView: "lista" })}
                className="mt-3.5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#AE343F] text-white shadow-[0_6px_16px_-8px_rgba(174,52,63,0.6)] hover:bg-[#962d36] transition-colors cursor-pointer"
              >
                <Plus size={15} />
                Dodaj listu zvanica
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Prečica za ručni odgovor — najčešća radnja u portalu: zvanica javi
       *  usmeno, par to upiše. Bez ovoga se do dijaloga stizalo tek kroz
       *  Gosti → Lista zvanica → traženje osobe → zeleno dugme na redu.
       *  Stoji IZNAD trake sa brojkama: brojke se samo čitaju, ovo je radnja.
       *  Ima smisla tek kad lista postoji (inače stoji CTA za pravljenje liste). */}
      {!loading && (guestStats?.inviteeCount ?? 0) > 0 && (
        <motion.div {...sectionMotion(0.12)}>
          <button
            onClick={() => setQuickAnswerOpen(true)}
            className="group w-full text-left flex items-center gap-3 rounded-xl border border-[#4a8a5c]/40 bg-[#4a8a5c]/[0.07] px-4 py-3 hover:bg-[#4a8a5c]/[0.12] hover:border-[#4a8a5c]/60 transition-colors cursor-pointer"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#4a8a5c]/40 bg-white text-[#4a8a5c] shrink-0">
              <UserCheck size={17} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#232323] flex items-center gap-1.5">
                Javila se zvanica?
                <ArrowRight
                  size={13}
                  className="text-[#4a8a5c] transition-transform group-hover:translate-x-0.5"
                />
              </p>
              <p className="text-[12px] text-[#232323]/60">
                Upišite potvrdu ili otkazivanje umesto nje — ulazi u potvrde
                gostiju isto kao da je sama popunila formu.
              </p>
            </div>
          </button>
        </motion.div>
      )}

      {quickAnswerOpen && (
        <QuickAnswerModal
          draft={coupleInfo.draft}
          onClose={() => setQuickAnswerOpen(false)}
          onSaved={refreshOverview}
        />
      )}

      {/* Status band: 3 numeric stats fused with the Pažnja strip. Bez naslova —
       *  brojke se čitaju same, a poziv iznad nosi pažnju. */}
      <motion.div {...sectionMotion(0.14)}>
        <div className="rounded-2xl bg-white border border-[#232323]/8 overflow-hidden shadow-[0_1px_3px_rgba(35,35,35,0.05)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#232323]/8">
            {/* Checklista */}
            <button
              onClick={() => onNavigate("checklist")}
              className="text-left p-4 sm:p-5 hover:bg-[#F5F4DC]/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <CheckCircle2 size={16} className="text-[#AE343F]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#232323]/55">
                  Checklista
                </span>
              </div>
              <p className="font-serif text-[1.9rem] font-semibold text-[#232323] leading-none">
                {completedCount}
                <span className="text-[#232323]/40 font-normal text-xl">
                  /{checklist.length}
                </span>
              </p>
              <div className="h-[3px] rounded-full overflow-hidden bg-[#232323]/10 mt-2.5">
                <div
                  className="h-full rounded-full bg-[#AE343F]"
                  style={{ width: `${checklistPct}%` }}
                />
              </div>
              <p className="text-[12px] text-[#232323]/55 mt-2">
                {Math.round(checklistPct)}% završeno
              </p>
            </button>

            {/* Budžet */}
            <button
              onClick={() => onNavigate("budget")}
              className="text-left p-4 sm:p-5 hover:bg-[#F5F4DC]/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Wallet size={16} className="text-[#AE343F]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#232323]/55">
                  Budžet
                </span>
              </div>
              <p
                className="font-serif text-[1.9rem] font-semibold leading-none"
                style={{ color: budgetOver ? "#dc2626" : "#232323" }}
              >
                {totalSpent > 0 ? `${Math.round(totalSpent / 1000)}K` : "—"}
                {totalPlanned > 0 && (
                  <span className="text-[#232323]/40 font-normal text-xl">
                    {" "}
                    / {Math.round(budgetBase / 1000)}K
                  </span>
                )}
              </p>
              <div
                className={`h-[3px] rounded-full overflow-hidden mt-2.5 ${budgetOver ? "bg-red-500/20" : "bg-[#232323]/10"}`}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${budgetPct}%`,
                    backgroundColor: budgetOver ? "#dc2626" : "#AE343F",
                  }}
                />
              </div>
              <p
                className="text-[12px] mt-2"
                style={{ color: budgetOver ? "#dc2626" : "rgba(35,35,35,0.55)" }}
              >
                {totalSpent > 0 ? `${Math.round(budgetPct)}% budžeta` : "—"}
              </p>
            </button>

            {/* Gosti */}
            <button
              onClick={() => onNavigate("guests")}
              className="text-left p-4 sm:p-5 hover:bg-[#F5F4DC]/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Users size={16} className="text-[#AE343F]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#232323]/55">
                  Gosti
                </span>
              </div>
              {loading ? (
                <span className="loading loading-spinner loading-xs text-[#AE343F]" />
              ) : guestStats ? (
                <>
                  <p className="font-serif text-[1.9rem] font-semibold text-[#232323] leading-none">
                    {guestStats.totalGuests}
                  </p>
                  <p className="text-[12px] text-[#232323]/60 mt-2.5">
                    <span className="font-semibold text-[#AE343F]/90">
                      {guestStats.attending}
                    </span>{" "}
                    potvrđenih · {guestStats.notAttending} odbijanja
                  </p>
                </>
              ) : (
                <p className="font-serif text-[1.9rem] font-semibold text-[#232323]/35">
                  —
                </p>
              )}
            </button>
          </div>

          {/* Pažnja strip — alerts as the band's footer */}
          <div className="bg-[#F5F4DC] border-t border-[#232323]/8">
            {loading ? (
              <div className="px-5 py-3">
                <span className="loading loading-spinner loading-xs text-[#d4af37]" />
              </div>
            ) : alerts.length > 0 ? (
              <ul>
                {alerts.map((alert, i) => (
                  <li key={i} className={i > 0 ? "border-t border-[#232323]/[0.06]" : ""}>
                    <button
                      onClick={alert.action}
                      className="w-full flex items-center gap-2.5 px-5 py-2.5 text-left hover:bg-white/40 transition-colors cursor-pointer"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37] shrink-0" />
                      <span className="flex-1 text-[13px] text-[#232323]/80">
                        {alert.text}
                      </span>
                      <ChevronRight size={15} className="text-[#232323]/35 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-3 text-center text-[13px] text-[#232323]/50 flex items-center justify-center gap-1.5">
                Sve je u redu <Check size={13} className="text-[#d4af37]" />
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Vendor band — demoted from a fake stat to a signpost row */}
      <motion.div {...sectionMotion(0.15)}>
        <button
          onClick={() => onNavigate("vendors")}
          className="group w-full text-left flex items-center gap-3 pl-4 pr-2 py-2.5 border-l-2 border-[#AE343F] rounded-r-lg hover:bg-[#F5F4DC]/40 transition-colors cursor-pointer"
        >
          <Star size={16} className="text-[#d4af37] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#232323] flex items-center gap-1.5">
              Imenik vendora
              <ArrowRight
                size={13}
                className="text-[#AE343F] transition-transform group-hover:translate-x-0.5"
              />
            </p>
            <p className="text-[12px] text-[#232323]/60">
              Fotografi, DJ-evi, sale, dekoracija — proverene preporuke.
            </p>
          </div>
        </button>
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

      {/* Materijali za štampu — print-product shelf */}
      <motion.div {...sectionMotion(0.2)}>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#232323]/45">
            Materijali za štampu
          </p>
          <span className="h-px flex-1 bg-[#d4af37]/35" />
        </div>
        <p className="text-[12px] text-[#232323]/55 mb-3">
          QR kodovi i zahvalnice, spremni za štampariju.
        </p>

        <div className="relative rounded-2xl bg-[#F5F4DC] p-4 sm:p-5">
          {coupleInfo.draft && (
            <div
              className="absolute inset-0 z-10 rounded-2xl bg-[#F5F4DC]/70 backdrop-blur-[1px] flex items-center justify-center px-6 text-center cursor-pointer"
              onClick={() =>
                toast("Dostupno kada vaša pozivnica bude gotova")
              }
            >
              <p className="text-[13px] font-medium text-[#232323]/70">
                Dostupno kada vaša pozivnica bude gotova.
              </p>
            </div>
          )}
          <div
            className={
              coupleInfo.draft
                ? "opacity-55 pointer-events-none space-y-2.5"
                : "space-y-2.5"
            }
          >
            <PrintCard
              featured
              title="QR za potvrde dolaska"
              sub="Dodajte na štampane pozivnice — gosti skeniraju i potvrđuju online."
              formats={["PNG"]}
              offerPill="štampamo za vas"
              onClick={() => setPrintChoice("potvrde")}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <PrintCard
                title="QR — Gde sedim"
                sub="Gosti pronalaze svoje mesto."
                formats={["PNG"]}
                locked={!paidForRaspored}
                lockLabel="Uz raspored sedenja"
                onClick={() =>
                  paidForRaspored
                    ? handleDownloadSeatQR()
                    : toast("Raspored sedenja nije aktiviran")
                }
              />
              <PrintCard
                title="QR za galeriju"
                sub="Gosti šalju svoje fotografije."
                formats={["PNG"]}
                offerPill="štampamo za vas"
                locked={!paidForGallery}
                lockLabel="Uz galeriju fotografija"
                onClick={() =>
                  paidForGallery
                    ? setPrintChoice("galerija")
                    : toast("Galerija fotografija nije aktivirana")
                }
              />
              <PrintCard
                title="QR za audio knjigu"
                sub="Gosti ostavljaju glasovnu poruku."
                formats={["PNG"]}
                offerPill="štampamo za vas"
                locked={!audioStats?.paidForAudio}
                lockLabel="Uz audio knjigu"
                onClick={() =>
                  audioStats?.paidForAudio
                    ? setPrintChoice("audio")
                    : toast("Audio knjiga nije aktivirana")
                }
              />
              <PrintCard
                title="Dizajn pozivnice za štampu"
                sub="Preuzmite dizajn svoje pozivnice, spreman za štampu."
                formats={["PDF"]}
                offerPill="štampamo za vas"
                onClick={() => setPrintChoice("pozivnica")}
              />
            </div>

          </div>
        </div>
      </motion.div>

      {/* Poslednje potvrde — flat feed, no card chrome */}
      {guestStats && (
        <motion.div {...sectionMotion(0.25)}>
          <div className="flex items-center gap-3 mb-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#232323]/45">
              Poslednje potvrde
            </p>
            <span className="h-px flex-1 bg-[#d4af37]/35" />
            <button
              onClick={() => onNavigate("guests")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#AE343F] hover:underline cursor-pointer shrink-0"
            >
              Sve potvrde
              <ArrowRight size={11} />
            </button>
          </div>
          {guestStats.recentResponses.length > 0 ? (
            <div>
              {guestStats.recentResponses.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-[#232323]/[0.07]" : ""}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      r.attending === "Da" ? "bg-[#AE343F]/10" : "bg-[#232323]/8"
                    }`}
                  >
                    {r.attending === "Da" ? (
                      <Check size={11} className="text-[#AE343F]" strokeWidth={3} />
                    ) : (
                      <span className="text-[9px] text-[#232323]/50 font-bold">✕</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#232323] flex-1 truncate">
                    {r.name}
                  </span>
                  {r.attending === "Da" && (
                    <span className="text-[11px] font-semibold text-[#AE343F] bg-[#AE343F]/8 rounded-full px-2 py-0.5 shrink-0">
                      {parseInt(r.guestCount) || 1} os.
                    </span>
                  )}
                  <span className="text-[11px] text-[#232323]/50 shrink-0">
                    <Clock size={10} className="inline mr-0.5 -mt-px" />
                    {formatTimestamp(r.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#232323]/50 py-3">
              Još nema potvrda — podelite link pozivnice.
            </p>
          )}
        </motion.div>
      )}
      {/* Print format sheet — PNG vs A6 flyer (potvrde / gde-sedim) */}

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
              Preuzmi dizajn za štampu
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

/** A "print product" card for the Materijali za štampu shelf. White paper look,
 *  tight radius, accent top edge; gated (unpaid) variant desaturates + shows a
 *  gold lock chip but stays visible to upsell. */
