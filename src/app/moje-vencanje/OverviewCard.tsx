"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Wallet,
  Users,
  Mic,
  ExternalLink,
  Download,
  Copy,
  Check,
  AlertCircle,
  Clock,
  QrCode,
  X,
  Armchair,
} from "lucide-react";
import { loadOverviewAction, getWeddingDataForPDF, loadSeatingStatsAction } from "./actions";
import type { ActiveView } from "./Sidebar";
import type { ChecklistItem, PortalBudget } from "./types";

interface Props {
  coupleInfo: {
    slug: string;
    bride: string;
    groom: string;
    eventDate: string;
    scriptFont: string;
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
      <div className="bg-white rounded-2xl border border-[#232323]/10 p-6 shadow-sm text-center">
        <p className="text-[10px] uppercase tracking-widest text-[#232323]/30 mb-2">
          Do venčanja
        </p>
        <p className="font-serif text-5xl text-[#AE343F] mb-1">{days}</p>
        <p className="text-sm text-[#232323]/40">
          {days === 1 ? "dan" : "dana"} ·{" "}
          {new Date(coupleInfo.eventDate).toLocaleDateString("sr-Latn-RS", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Checklist */}
        <button
          onClick={() => onNavigate("checklist")}
          className="bg-white rounded-xl border border-[#232323]/8 p-4 text-left hover:border-[#AE343F]/20 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={15} className="text-[#AE343F]" />
            <span className="text-xs font-medium text-[#232323]/50">
              Checklista
            </span>
          </div>
          <p className="text-lg font-bold text-[#232323] mb-1.5">
            {completedCount}
            <span className="text-[#232323]/25 font-normal">
              /{checklist.length}
            </span>
          </p>
          <div className="h-1.5 rounded-full overflow-hidden bg-[#AE343F]/8">
            <div
              className="h-full rounded-full bg-[#AE343F] transition-all"
              style={{ width: `${checklistPct}%` }}
            />
          </div>
        </button>

        {/* Budget */}
        <button
          onClick={() => onNavigate("budget")}
          className="bg-white rounded-xl border border-[#232323]/8 p-4 text-left hover:border-[#AE343F]/20 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={15} className="text-[#AE343F]" />
            <span className="text-xs font-medium text-[#232323]/50">
              Budžet
            </span>
          </div>
          <p className="text-lg font-bold text-[#232323] mb-1.5">
            {totalSpent > 0 ? `${Math.round(totalSpent / 1000)}K` : "—"}
            {totalPlanned > 0 && (
              <span className="text-[#232323]/25 font-normal">
                {" "}
                / {Math.round(budgetBase / 1000)}K
              </span>
            )}
          </p>
          <div
            className={`h-1.5 rounded-full overflow-hidden ${budgetOver ? "bg-red-500/15" : "bg-[#AE343F]/8"}`}
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
          className="bg-white rounded-xl border border-[#232323]/8 p-4 text-left hover:border-[#AE343F]/20 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users size={15} className="text-[#AE343F]" />
            <span className="text-xs font-medium text-[#232323]/50">Gosti</span>
          </div>
          {loading ? (
            <span className="loading loading-spinner loading-xs text-[#AE343F]" />
          ) : guestStats ? (
            <>
              <p className="text-lg font-bold text-[#232323]">
                {guestStats.totalGuests}
              </p>
              <p className="text-[10px] text-[#232323]/30">
                {guestStats.attending} potvrđenih · {guestStats.notAttending}{" "}
                odbijanja
              </p>
            </>
          ) : (
            <p className="text-sm text-[#232323]/25">—</p>
          )}
        </button>

        {/* Alerts inline */}
        <div className="bg-white rounded-xl border border-[#232323]/8 p-4 hover:border-[#d4af37]/20 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={15} className="text-[#AE343F]" />
            <span className="text-xs font-medium text-[#232323]/50">
              Pažnja
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
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs bg-[#d4af37]/5 border border-[#d4af37]/10 text-[#232323]/55 hover:border-[#d4af37]/25 transition-colors cursor-pointer"
                >
                  <AlertCircle size={12} className="text-[#d4af37] shrink-0" />
                  <span className="truncate">{alert.text}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-green-600/60 flex items-center gap-1.5">
              <Check size={12} />
              Sve izgleda u redu
            </p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-[#232323]/10 p-4 shadow-sm">
        <p className="text-[10px] uppercase tracking-widest text-[#232323]/30 mb-3">
          Brze akcije
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link
            href={`/pozivnica/${coupleInfo.slug}`}
            target="_blank"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-[#F5F4DC]/50 border border-[#232323]/8 text-[#232323]/60 hover:border-[#AE343F]/20 hover:text-[#AE343F] transition-colors"
          >
            <ExternalLink size={12} />
            Pozivnica
          </Link>
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-[#F5F4DC]/50 border border-[#232323]/8 text-[#232323]/60 hover:border-[#AE343F]/20 hover:text-[#AE343F] transition-colors cursor-pointer"
          >
            {copied ? (
              <Check size={12} className="text-green-600" />
            ) : (
              <Copy size={12} />
            )}
            {copied ? "Kopirano!" : "Kopiraj link"}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-[#F5F4DC]/50 border border-[#232323]/8 text-[#232323]/60 hover:border-[#AE343F]/20 hover:text-[#AE343F] transition-colors cursor-pointer"
          >
            <Download size={12} />
            PDF pozivnica
          </button>
          <button
            onClick={handleDownloadFlyer}
            disabled={!audioStats?.paidForAudio}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-[#F5F4DC]/50 border border-[#232323]/8 text-[#232323]/60 hover:border-[#AE343F]/20 hover:text-[#AE343F] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#232323]/8 disabled:hover:text-[#232323]/60"
            title={
              !audioStats?.paidForAudio
                ? "Audio knjiga nije aktivirana"
                : "Preuzmi A6 flyer sa QR kodom"
            }
          >
            <QrCode size={12} />
            Audio flyer
          </button>
        </div>
      </div>

      {/* Recent RSVP */}
      {guestStats && guestStats.recentResponses.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#232323]/10 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-[#232323]/30">
              Poslednje potvrde
            </p>
            <button
              onClick={() => onNavigate("guests")}
              className="text-[10px] text-[#AE343F] hover:underline cursor-pointer"
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
                    i === arr.length - 1 ? 0.3 : i === arr.length - 2 ? 0.6 : 1,
                }}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    r.attending === "Da" ? "bg-[#AE343F]/10" : "bg-[#232323]/5"
                  }`}
                >
                  {r.attending === "Da" ? (
                    <Check
                      size={8}
                      className="text-[#AE343F]"
                      strokeWidth={3}
                    />
                  ) : (
                    <span className="text-[7px] text-[#232323]/30 font-bold">
                      ✕
                    </span>
                  )}
                </div>
                <span className="text-sm text-[#232323] flex-1 truncate">
                  {r.name}
                </span>
                <span className="text-[10px] text-[#232323]/20 shrink-0">
                  <Clock size={9} className="inline mr-0.5" />
                  {formatTimestamp(r.timestamp)}
                </span>
                {r.attending === "Da" && (
                  <span className="text-[10px] text-[#AE343F]/60 shrink-0">
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
                  className="absolute top-4 right-4 text-[#232323]/30 hover:text-[#232323]/60 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>

                <h3 className="font-serif text-lg text-[#232323] mb-5">
                  Raspored gostiju
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#F5F4DC]/50 border border-[#232323]/6">
                    <span className="text-sm text-[#232323]/60 flex items-center gap-2">
                      <Users size={14} className="text-[#AE343F]" />
                      Ukupno dolazi
                    </span>
                    <span className="text-sm font-bold text-[#232323]">
                      {seatingModal.totalGuests}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-green-50 border border-green-200/50">
                    <span className="text-sm text-[#232323]/60 flex items-center gap-2">
                      <Armchair size={14} className="text-green-600" />
                      Raspoređeno
                    </span>
                    <span className="text-sm font-bold text-green-700">
                      {seatingModal.seated}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200/50">
                    <span className="text-sm text-[#232323]/60 flex items-center gap-2">
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
