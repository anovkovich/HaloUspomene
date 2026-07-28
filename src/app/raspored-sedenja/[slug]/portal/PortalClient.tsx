"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ListChecks,
  Wallet,
  Mic,
  Images,
  Armchair,
  ChevronLeft,
  UtensilsCrossed,
  ChevronRight,
} from "lucide-react";
import ChecklistCard from "@/app/moje-vencanje/ChecklistCard";
import BudgetCard from "@/app/moje-vencanje/BudgetCard";
import AudioCard from "@/app/moje-vencanje/AudioCard";
import GalleryCard from "@/app/moje-vencanje/GalleryCard";
import MeniCard from "@/app/moje-vencanje/MeniCard";
import type { ChecklistItem, PortalBudget } from "@/app/moje-vencanje/types";
import {
  saveChecklistAction,
  saveBudgetAction,
  loadMeniAction,
  saveMeniAction,
  loadAudioMessagesAction,
  refreshAudioMessagesAction,
  deleteAudioMsgAction,
  loadGalleryAction,
  deleteGalleryPhotoAction,
} from "./actions";

type TabKey = "pregled" | "planer" | "budzet" | "meni" | "utisci" | "galerija";

// HALO brand palette — the portal cards read these hard-coded, but the shell
// uses the tokens so the tab bar matches the guest hub.
const BRAND_VARS: React.CSSProperties = {
  "--theme-primary": "#AE343F",
  "--theme-surface": "#F5F4DC",
  "--theme-border": "rgba(35,35,35,0.18)",
  "--theme-text": "#232323",
  "--theme-text-light": "rgba(35,35,35,0.6)",
} as React.CSSProperties;

interface Props {
  slug: string;
  eventName: string;
  eventDate?: string;
  guestCount: number;
  seatingStats: { totalSeats: number; assignedSeats: number } | null;
  hasAudio: boolean;
  hasGallery: boolean;
  initialChecklist: ChecklistItem[];
  initialBudget: PortalBudget;
}

function daysUntil(eventDate?: string): number | null {
  if (!eventDate) return null;
  const ev = new Date(eventDate);
  if (isNaN(ev.getTime())) return null;
  ev.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((ev.getTime() - today.getTime()) / 86_400_000);
}

export default function PortalClient({
  slug,
  eventName,
  eventDate,
  guestCount,
  seatingStats,
  hasAudio,
  hasGallery,
  initialChecklist,
  initialBudget,
}: Props) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [budget, setBudget] = useState<PortalBudget>(initialBudget);
  const [active, setActive] = useState<TabKey>("pregled");

  // Bind the seating slug into the shared cards' action props.
  const checklistSave = (items: ChecklistItem[]) =>
    saveChecklistAction(slug, items);
  const budgetSave = (b: PortalBudget) => saveBudgetAction(slug, b);
  const audioLoad = () => loadAudioMessagesAction(slug);
  const audioRefresh = () => refreshAudioMessagesAction(slug);
  const audioDelete = (id: string, blobUrl: string) =>
    deleteAudioMsgAction(slug, id, blobUrl);
  const galleryLoad = (skip = 0, limit = 60) =>
    loadGalleryAction(slug, skip, limit);
  const galleryDelete = (id: string) => deleteGalleryPhotoAction(slug, id);
  const meniLoad = () => loadMeniAction(slug);
  const meniSave = (m: Parameters<typeof saveMeniAction>[1]) =>
    saveMeniAction(slug, m);

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "pregled", label: "Pregled", icon: <LayoutDashboard size={20} /> },
    { key: "planer", label: "Planer", icon: <ListChecks size={20} /> },
    { key: "budzet", label: "Budžet", icon: <Wallet size={20} /> },
    { key: "meni", label: "Meni", icon: <UtensilsCrossed size={20} /> },
  ];
  if (hasAudio)
    tabs.push({ key: "utisci", label: "Utisci", icon: <Mic size={20} /> });
  if (hasGallery)
    tabs.push({ key: "galerija", label: "Galerija", icon: <Images size={20} /> });

  const days = daysUntil(eventDate);
  const fillPct =
    seatingStats && seatingStats.totalSeats > 0
      ? Math.round((seatingStats.assignedSeats / seatingStats.totalSeats) * 100)
      : 0;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6] pb-28"
      style={{ ...BRAND_VARS, color: "var(--theme-text)" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/raspored-sedenja/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm mb-4 transition-opacity hover:opacity-60"
            style={{ color: "var(--theme-text-light)" }}
          >
            <ChevronLeft size={15} />
            Nazad na raspored
          </Link>
          <h1
            className="font-script text-4xl sm:text-5xl"
            style={{ color: "var(--theme-primary)" }}
          >
            {eventName}
          </h1>
        </div>

        {/* Tab content */}
        {active === "pregled" && (
          <>
            {/* Quick links — like the standard portal overview */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <ShortcutTile
                label="Planer"
                icon={<ListChecks size={18} />}
                onClick={() => setActive("planer")}
              />
              <ShortcutTile
                label="Budžet"
                icon={<Wallet size={18} />}
                onClick={() => setActive("budzet")}
              />
              <ShortcutTile
                label="Meni"
                icon={<UtensilsCrossed size={18} />}
                onClick={() => setActive("meni")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatTile
              label="Do događaja"
              value={
                days === null
                  ? "—"
                  : days > 0
                    ? `${days} ${days === 1 ? "dan" : "dana"}`
                    : days === 0
                      ? "Danas!"
                      : "Prošao"
              }
              icon={<LayoutDashboard size={18} />}
            />
            <StatTile
              label="Gostiju (sa pratiocima)"
              value={String(guestCount)}
              icon={<ListChecks size={18} />}
            />
            <StatTile
              label="Raspoređeno mesta"
              value={
                seatingStats
                  ? `${seatingStats.assignedSeats}/${seatingStats.totalSeats} (${fillPct}%)`
                  : "—"
              }
              icon={<Armchair size={18} />}
            />
            <StatTile
              label="Datum"
              value={
                eventDate
                  ? new Date(eventDate).toLocaleDateString("sr-RS")
                  : "—"
              }
              icon={<LayoutDashboard size={18} />}
            />
            <div className="sm:col-span-2 mt-2">
              <Link
                href={`/raspored-sedenja/${slug}/gde-sedim`}
                target="_blank"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: "var(--theme-primary)" }}
              >
                <Armchair size={15} />
                Otvori stranicu za goste (Gde sedim / Utisci / Galerija)
              </Link>
            </div>
            </div>
          </>
        )}

        {active === "planer" && (
          <ChecklistCard
            checklist={checklist}
            setChecklist={setChecklist}
            onSave={checklistSave}
          />
        )}

        {active === "budzet" && (
          <BudgetCard budget={budget} setBudget={setBudget} onSave={budgetSave} />
        )}

        {active === "meni" && (
          <MeniCard loadAction={meniLoad} saveAction={meniSave} />
        )}

        {active === "utisci" && hasAudio && (
          <AudioCard
            slug={slug}
            coupleNames={eventName}
            loadAction={audioLoad}
            refreshAction={audioRefresh}
            deleteAction={audioDelete}
            guestRecordUrl={{
              href: `/raspored-sedenja/${slug}/gde-sedim`,
              label: `halouspomene.rs/raspored-sedenja/${slug}/gde-sedim/`,
            }}
            showFlyer={false}
            showUsbPromo={false}
          />
        )}

        {active === "galerija" && hasGallery && (
          <GalleryCard
            slug={slug}
            loadAction={galleryLoad}
            deleteAction={galleryDelete}
            downloadBase={`/api/raspored-sedenja/${slug}/galerija/download`}
          />
        )}
      </div>

      {/* Fixed bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          backgroundColor: "var(--theme-surface)",
          borderTop: "1px solid var(--theme-border)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="max-w-4xl mx-auto flex justify-around items-center h-16">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className="flex flex-col items-center gap-1 flex-1 py-2 transition-colors"
              style={{
                color:
                  active === tab.key
                    ? "var(--theme-primary)"
                    : "var(--theme-text-light)",
              }}
            >
              {tab.icon}
              <span className="text-[10px] font-medium font-raleway">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function ShortcutTile({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white border p-4 shadow-sm transition-colors hover:bg-[#faf9f6] cursor-pointer"
      style={{ borderColor: "var(--theme-border)" }}
    >
      <span style={{ color: "var(--theme-primary)" }}>{icon}</span>
      <span
        className="text-xs font-medium font-raleway"
        style={{ color: "var(--theme-text)" }}
      >
        {label}
      </span>
      <ChevronRight
        size={13}
        style={{ color: "var(--theme-text-light)" }}
      />
    </button>
  );
}

function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl bg-white border p-5 shadow-sm"
      style={{ borderColor: "var(--theme-border)" }}
    >
      <div
        className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider"
        style={{ color: "var(--theme-text-light)" }}
      >
        <span style={{ color: "var(--theme-primary)" }}>{icon}</span>
        {label}
      </div>
      <p className="font-serif text-2xl" style={{ color: "var(--theme-text)" }}>
        {value}
      </p>
    </div>
  );
}
