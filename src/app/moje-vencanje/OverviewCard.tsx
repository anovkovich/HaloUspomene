"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  CheckCircle2,
  Wallet,
  Users,
  Mic,
  Download,
  Copy,
  Check,
  AlertCircle,
  Clock,
  QrCode,
  X,
  Armchair,
  Sparkles,
  Mail,
  Hourglass,
} from "lucide-react";
import {
  loadOverviewAction,
  getWeddingDataForPDF,
  loadSeatingStatsAction,
} from "./actions";
import type { ActiveView } from "./Sidebar";
import type { ChecklistItem, PortalBudget } from "./types";

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
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function formatDuration(ms: number) {
  const s = Math.round(ms / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
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
  const [seatingModal, setSeatingModal] = useState<{
    totalGuests: number;
    seated: number;
    notSeated: number;
    slug: string;
  } | null>(null);
  const [seatingLoading, setSeatingLoading] = useState(false);

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
    navigator.clipboard.writeText(
      `https://halouspomene.rs/pozivnica/${coupleInfo.slug}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [coupleInfo.slug]);

  const handleDownloadPDF = useCallback(async () => {
    const result = await getWeddingDataForPDF();
    if (!result) return;
    const { generateInvitationPDF } =
      await import("@/app/pozivnica/[slug]/generateInvitationPDF");
    generateInvitationPDF(
      result.weddingData,
      result.slug,
      result.weddingData.paid_for_pdf ?? false,
      result.weddingData.useCyrillic ?? false,
    );
  }, []);

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

  const handleOpenSeatingModal = useCallback(async () => {
    setSeatingLoading(true);
    const stats = await loadSeatingStatsAction();
    if (stats) setSeatingModal(stats);
    setSeatingLoading(false);
  }, []);

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
  if (guestStats && guestStats.uncategorized > 0) {
    alerts.push({
      text: `${guestStats.uncategorized} nekategorisanih gostiju`,
      action: handleOpenSeatingModal,
    });
  }
  // Upcoming checklist items (items in nearest uncompleted group)
  const upcomingCount = checklist.filter((i) => !i.completed).length;
  if (upcomingCount > 0 && upcomingCount <= 10) {
    alerts.push({
      text: `${upcomingCount} preostalih stavki na checklisti`,
      action: () => onNavigate("checklist"),
    });
  }

  return (
    <div className="space-y-4">
      {/* Countdown */}
      <div className="bg-white rounded-2xl border border-[#232323]/25 p-7 shadow-md text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#232323]/70 mb-3">
          Do venčanja
        </p>
        {coupleInfo.eventDate && !isNaN(new Date(coupleInfo.eventDate).getTime()) ? (
          <>
            <p className="font-serif text-6xl font-semibold text-[#AE343F] mb-2 leading-none">{days}</p>
            <p className="text-base text-[#232323]/85">
              {days === 1 ? "dan" : "dana"} ·{" "}
              {new Date(coupleInfo.eventDate).toLocaleDateString("sr-Latn-RS", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </>
        ) : (
          <>
            <p className="font-serif text-6xl font-semibold text-[#232323]/35 mb-2 leading-none">XX</p>
            <p className="text-base text-[#232323]/60">
              dana · XX. XX. XXXX.
            </p>
          </>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Checklist */}
        <button
          onClick={() => onNavigate("checklist")}
          className="bg-white rounded-xl border border-[#232323]/25 p-5 text-left shadow-sm hover:border-[#AE343F]/50 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={17} className="text-[#AE343F]" />
            <span className="text-sm font-semibold text-[#232323]/85">
              Checklista
            </span>
          </div>
          <p className="font-serif text-3xl font-semibold text-[#232323] mb-2 leading-none">
            {completedCount}
            <span className="text-[#232323]/50 font-normal text-2xl">
              /{checklist.length}
            </span>
          </p>
          <div className="h-2 rounded-full overflow-hidden bg-[#AE343F]/20">
            <div
              className="h-full rounded-full bg-[#AE343F] transition-all"
              style={{ width: `${checklistPct}%` }}
            />
          </div>
        </button>

        {/* Budget */}
        <button
          onClick={() => onNavigate("budget")}
          className="bg-white rounded-xl border border-[#232323]/25 p-5 text-left shadow-sm hover:border-[#AE343F]/50 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={17} className="text-[#AE343F]" />
            <span className="text-sm font-semibold text-[#232323]/85">
              Budžet
            </span>
          </div>
          <p className="font-serif text-3xl font-semibold text-[#232323] mb-2 leading-none">
            {totalSpent > 0 ? `${Math.round(totalSpent / 1000)}K` : "—"}
            {totalPlanned > 0 && (
              <span className="text-[#232323]/50 font-normal text-2xl">
                {" "}
                / {Math.round(budgetBase / 1000)}K
              </span>
            )}
          </p>
          <div
            className={`h-2 rounded-full overflow-hidden ${budgetOver ? "bg-red-500/25" : "bg-[#AE343F]/20"}`}
          >
            <div
              className={`h-full rounded-full transition-all ${budgetOver ? "bg-red-500" : "bg-[#AE343F]"}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </button>

        {/* Guests */}
        <button
          onClick={() => onNavigate("guests")}
          className="bg-white rounded-xl border border-[#232323]/25 p-5 text-left shadow-sm hover:border-[#AE343F]/50 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-3">
            <Users size={17} className="text-[#AE343F]" />
            <span className="text-sm font-semibold text-[#232323]/85">Gosti</span>
          </div>
          {loading ? (
            <span className="loading loading-spinner loading-xs text-[#AE343F]" />
          ) : guestStats ? (
            <>
              <p className="font-serif text-3xl font-semibold text-[#232323] mb-1 leading-none">
                {guestStats.totalGuests}
              </p>
              <p className="text-xs text-[#232323]/70">
                {guestStats.attending} potvrđenih · {guestStats.notAttending}{" "}
                odbijanja
              </p>
            </>
          ) : (
            <p className="font-serif text-3xl font-semibold text-[#232323]/40">—</p>
          )}
        </button>

        {/* Alerts inline */}
        <div className="bg-white rounded-xl border border-[#232323]/25 p-5 shadow-sm hover:border-[#d4af37]/50 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={17} className="text-[#AE343F]" />
            <span className="text-sm font-semibold text-[#232323]/85">
              {alerts.length > 0 ? "Pažnja" : "Nema upozorenja"}
            </span>
          </div>
          {loading ? (
            <span className="loading loading-spinner loading-xs text-[#d4af37]" />
          ) : alerts.length > 0 ? (
            <div className="space-y-1.5">
              {alerts.map((alert, i) => (
                <button
                  key={i}
                  onClick={alert.action}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#232323]/85 hover:border-[#d4af37]/45 transition-colors cursor-pointer"
                >
                  <AlertCircle size={12} className="text-[#d4af37] shrink-0" />
                  <span className="truncate">{alert.text}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-green-700 flex items-center gap-1.5">
              <Check size={12} />
              Sve izgleda u redu
            </p>
          )}
        </div>
      </div>

      {/* Upgrade CTA — visible only for draft couples that haven't submitted invitation form yet */}
      {coupleInfo.draft && !coupleInfo.hasInvitationData && (
        <div className="bg-gradient-to-br from-[#fffdf5] to-[#f5f4dc] rounded-2xl border-2 border-[#d4af37]/40 p-6 shadow-md">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles size={20} className="text-[#d4af37] shrink-0 mt-0.5" />
            <div>
              <p className="font-serif text-lg text-[#232323] mb-1">
                Nadogradite u pravu pozivnicu
              </p>
              <p className="text-sm text-[#232323]/75 leading-relaxed">
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
        </div>
      )}

      {/* In-progress banner — already submitted upgrade, waiting for admin */}
      {coupleInfo.draft && coupleInfo.hasInvitationData && (
        <div className="bg-[#d4af37]/10 rounded-2xl border border-[#d4af37]/35 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Hourglass size={18} className="text-[#d4af37] shrink-0 mt-0.5" />
            <div>
              <p className="font-serif text-base text-[#232323] mb-1">
                Vaša nadogradnja je u obradi
              </p>
              <p className="text-sm text-[#232323]/75">
                Primili smo sve podatke za vašu pozivnicu — uskoro ćemo vas
                kontaktirati radi naplate i aktivacije.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-[#232323]/25 p-5 shadow-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#232323]/70 mb-4">
          Brze akcije
        </p>
        <button
          onClick={() => {
            if (coupleInfo.draft) {
              toast("Dostupno nakon kreiranja pozivnice — naš tim će vas kontaktirati");
              return;
            }
            handleDownloadRsvpQR();
          }}
          className={`flex items-center justify-center gap-2 w-full px-4 py-3 mb-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors ${
            coupleInfo.draft
              ? "bg-[#F5F4DC]/50 border-[#232323]/15 text-[#232323]/55 cursor-pointer"
              : "bg-[#F5F4DC]/50 border-[#232323]/15 text-[#232323]/85 hover:border-[#AE343F]/40 hover:text-[#AE343F] cursor-pointer"
          }`}
        >
          <QrCode size={14} className="shrink-0" />
          <span className="hidden sm:inline">
            Dodajte QR za online potvrde na vaše štampane pozivnice
          </span>
          <span className="sm:hidden">QR potvrda za papirne pozivnice</span>
        </button>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {coupleInfo.draft ? (
            <>
              {[
                { icon: <Copy size={12} />, label: "Pozivnica" },
                { icon: <Download size={12} />, label: "PDF pozivnica" },
                { icon: <QrCode size={12} />, label: "QR Gde sedim" },
                { icon: <QrCode size={12} />, label: "Audio flyer" },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => {
                    toast("Dostupno nakon kreiranja pozivnice — naš tim će vas kontaktirati");
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-[#F5F4DC]/50 border border-[#232323]/15 text-[#232323]/55 cursor-pointer transition-colors"
                >
                  {btn.icon}
                  {btn.label}
                </button>
              ))}
            </>
          ) : (
            <>
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-[#F5F4DC]/50 border border-[#232323]/15 text-[#232323]/85 hover:border-[#AE343F]/40 hover:text-[#AE343F] transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check size={12} className="text-green-600" />
                ) : (
                  <Copy size={12} />
                )}
                {copied ? "Kopirano!" : "Pozivnica"}
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-[#F5F4DC]/50 border border-[#232323]/15 text-[#232323]/85 hover:border-[#AE343F]/40 hover:text-[#AE343F] transition-colors cursor-pointer"
              >
                <Download size={12} />
                PDF pozivnica
              </button>
              <button
                onClick={() => {
                  if (!paidForRaspored) {
                    toast("Raspored sedenja nije aktiviran");
                    return;
                  }
                  handleDownloadSeatQR();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-[#F5F4DC]/50 border border-[#232323]/15 text-[#232323]/85 hover:border-[#AE343F]/40 hover:text-[#AE343F] transition-colors cursor-pointer"
              >
                <QrCode size={12} />
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
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-[#F5F4DC]/50 border border-[#232323]/15 text-[#232323]/85 hover:border-[#AE343F]/40 hover:text-[#AE343F] transition-colors cursor-pointer"
              >
                <QrCode size={12} />
                Audio flyer
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent RSVP */}
      {guestStats && guestStats.recentResponses.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#232323]/25 p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#232323]/70">
              Poslednje potvrde
            </p>
            <button
              onClick={() => onNavigate("guests")}
              className="text-xs font-semibold text-[#AE343F] hover:underline cursor-pointer"
            >
              Sve potvrde
            </button>
          </div>
          <div className="space-y-1">
            {guestStats.recentResponses.map((r, i, arr) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{
                  opacity:
                    i === arr.length - 1 ? 0.6 : i === arr.length - 2 ? 0.8 : 1,
                }}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    r.attending === "Da" ? "bg-[#AE343F]/15" : "bg-[#232323]/15"
                  }`}
                >
                  {r.attending === "Da" ? (
                    <Check
                      size={8}
                      className="text-[#AE343F]"
                      strokeWidth={3}
                    />
                  ) : (
                    <span className="text-[7px] text-[#232323]/60 font-bold">
                      ✕
                    </span>
                  )}
                </div>
                <span className="text-sm text-[#232323] flex-1 truncate">
                  {r.name}
                </span>
                <span className="text-xs text-[#232323]/65 shrink-0">
                  <Clock size={10} className="inline mr-0.5" />
                  {formatTimestamp(r.timestamp)}
                </span>
                {r.attending === "Da" && (
                  <span className="text-xs font-semibold text-[#AE343F]/90 shrink-0">
                    {parseInt(r.guestCount) || 1} os.
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Seating stats modal */}
      {(seatingModal || seatingLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => !seatingLoading && setSeatingModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {seatingLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="loading loading-spinner loading-md text-[#AE343F]" />
              </div>
            ) : seatingModal ? (
              <>
                <button
                  onClick={() => setSeatingModal(null)}
                  className="absolute top-4 right-4 text-[#232323]/60 hover:text-[#232323] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>

                <h3 className="font-serif text-lg text-[#232323] mb-5">
                  Raspored gostiju
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#F5F4DC]/50 border border-[#232323]/15">
                    <span className="text-sm text-[#232323]/85 flex items-center gap-2">
                      <Users size={14} className="text-[#AE343F]" />
                      Ukupno dolazi
                    </span>
                    <span className="text-sm font-bold text-[#232323]">
                      {seatingModal.totalGuests}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-green-50 border border-green-200/50">
                    <span className="text-sm text-[#232323]/85 flex items-center gap-2">
                      <Armchair size={14} className="text-green-600" />
                      Raspoređeno
                    </span>
                    <span className="text-sm font-bold text-green-700">
                      {seatingModal.seated}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200/50">
                    <span className="text-sm text-[#232323]/85 flex items-center gap-2">
                      <AlertCircle size={14} className="text-amber-500" />
                      Neraspoređeno
                    </span>
                    <span className="text-sm font-bold text-amber-600">
                      {seatingModal.notSeated}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/pozivnica/${seatingModal.slug}/raspored-sedenja`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#AE343F] text-white text-sm font-medium hover:bg-[#962d36] transition-colors"
                >
                  <Armchair size={15} />
                  Otvori raspored sedenja
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
}
