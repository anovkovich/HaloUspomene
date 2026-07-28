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
  Users,
  LayoutGrid,
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

function formatMoney(n: number): string {
  return n.toLocaleString("sr-RS");
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

  // Bottom navigation — main sections, mirroring the standard portal (Checklista
  // and Budžet live in the top pills, NOT here). Gosti + Raspored are the
  // existing standalone pages; the rest are portal tabs.
  type NavItem = {
    key: string;
    label: string;
    icon: React.ReactNode;
  } & ({ tab: TabKey } | { href: string });

  const navItems: NavItem[] = [
    { key: "pregled", label: "Pregled", icon: <LayoutDashboard size={20} />, tab: "pregled" },
    {
      key: "gosti",
      label: "Gosti",
      icon: <Users size={20} />,
      href: `/raspored-sedenja/${slug}/gosti`,
    },
  ];
  if (hasAudio)
    navItems.push({ key: "utisci", label: "Utisci", icon: <Mic size={20} />, tab: "utisci" });
  if (hasGallery)
    navItems.push({ key: "galerija", label: "Galerija", icon: <Images size={20} />, tab: "galerija" });
  navItems.push({ key: "meni", label: "Meni", icon: <UtensilsCrossed size={20} />, tab: "meni" });
  navItems.push({
    key: "raspored",
    label: "Raspored",
    icon: <LayoutGrid size={20} />,
    href: `/raspored-sedenja/${slug}`,
  });

  const days = daysUntil(eventDate);
  const fillPct =
    seatingStats && seatingStats.totalSeats > 0
      ? Math.round((seatingStats.assignedSeats / seatingStats.totalSeats) * 100)
      : 0;

  const checkDone = checklist.filter((i) => i.completed).length;
  const checkTotal = checklist.length;
  const checkPct = checkTotal ? Math.round((checkDone / checkTotal) * 100) : 0;

  const plannedTotal =
    budget.categories.reduce((s, c) => s + (c.planned || 0), 0) ||
    budget.totalBudget ||
    0;
  const spentTotal = budget.categories.reduce((s, c) => s + (c.spent || 0), 0);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6] pb-28"
      style={{ ...BRAND_VARS, color: "var(--theme-text)" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex justify-start mb-3">
            <Link
              href={`/raspored-sedenja/${slug}`}
              className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-60"
              style={{ color: "var(--theme-text-light)" }}
            >
              <ChevronLeft size={15} />
              Nazad na raspored
            </Link>
          </div>
          <h1
            className="font-script text-4xl sm:text-5xl mb-4"
            style={{ color: "var(--theme-primary)" }}
          >
            {eventName}
          </h1>

          {/* Top pills — Checklista / Budžet, like the standard portal */}
          <div className="flex items-center justify-center gap-2.5">
            <Pill
              label="Checklista"
              activeState={active === "planer"}
              onClick={() => setActive("planer")}
            />
            <Pill
              label="Budžet"
              activeState={active === "budzet"}
              onClick={() => setActive("budzet")}
            />
          </div>
        </div>

        {/* Tab content */}
        {active === "pregled" && (
          <div className="space-y-4">
            {/* Countdown / key stats */}
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
                label="Datum"
                value={
                  eventDate
                    ? new Date(eventDate).toLocaleDateString("sr-RS")
                    : "—"
                }
                icon={<LayoutDashboard size={18} />}
              />
              <StatTile
                label="Gostiju (sa pratiocima)"
                value={String(guestCount)}
                icon={<Users size={18} />}
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
            </div>

            {/* Checklista + Budžet summary cards (tap to open) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setActive("planer")}
                className="text-left rounded-2xl bg-white border p-5 shadow-sm hover:bg-[#faf9f6] transition-colors cursor-pointer"
                style={{ borderColor: "var(--theme-border)" }}
              >
                <div
                  className="flex items-center gap-2 mb-3 text-xs uppercase tracking-wider"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  <ListChecks size={16} style={{ color: "var(--theme-primary)" }} />
                  Checklista
                </div>
                <div className="flex items-end justify-between mb-2">
                  <p className="font-serif text-2xl">
                    {checkDone}
                    <span style={{ color: "var(--theme-text-light)" }}>
                      /{checkTotal}
                    </span>
                  </p>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--theme-primary)" }}
                  >
                    {checkPct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-black/8 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${checkPct}%`,
                      backgroundColor: "var(--theme-primary)",
                    }}
                  />
                </div>
              </button>

              <button
                onClick={() => setActive("budzet")}
                className="text-left rounded-2xl bg-white border p-5 shadow-sm hover:bg-[#faf9f6] transition-colors cursor-pointer"
                style={{ borderColor: "var(--theme-border)" }}
              >
                <div
                  className="flex items-center gap-2 mb-3 text-xs uppercase tracking-wider"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  <Wallet size={16} style={{ color: "var(--theme-primary)" }} />
                  Budžet
                </div>
                {plannedTotal > 0 || spentTotal > 0 ? (
                  <>
                    <p className="font-serif text-2xl mb-1">
                      {formatMoney(spentTotal)}
                      <span
                        className="text-base"
                        style={{ color: "var(--theme-text-light)" }}
                      >
                        {" "}
                        / {formatMoney(plannedTotal)} RSD
                      </span>
                    </p>
                    <div className="h-1.5 rounded-full bg-black/8 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${plannedTotal ? Math.min(100, Math.round((spentTotal / plannedTotal) * 100)) : 0}%`,
                          backgroundColor: "var(--theme-primary)",
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <p
                    className="font-serif text-2xl"
                    style={{ color: "var(--theme-text-light)" }}
                  >
                    —
                  </p>
                )}
              </button>
            </div>

            {/* Guest-facing page link */}
            <Link
              href={`/raspored-sedenja/${slug}/gde-sedim`}
              target="_blank"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: "var(--theme-primary)" }}
            >
              <Armchair size={15} />
              Otvori stranicu za goste (Gde sedim / Utisci / Galerija)
              <ChevronRight size={14} />
            </Link>
          </div>
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
          {navItems.map((item) => {
            const isActive = "tab" in item && active === item.tab;
            const cls =
              "flex flex-col items-center gap-1 flex-1 py-2 transition-colors";
            const color = isActive
              ? "var(--theme-primary)"
              : "var(--theme-text-light)";
            return "tab" in item ? (
              <button
                key={item.key}
                onClick={() => setActive(item.tab)}
                className={cls}
                style={{ color }}
              >
                {item.icon}
                <span className="text-[10px] font-medium font-raleway">
                  {item.label}
                </span>
              </button>
            ) : (
              <Link
                key={item.key}
                href={item.href}
                className={cls}
                style={{ color }}
              >
                {item.icon}
                <span className="text-[10px] font-medium font-raleway">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Pill({
  label,
  activeState,
  onClick,
}: {
  label: string;
  activeState: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
      style={
        activeState
          ? { backgroundColor: "var(--theme-primary)", color: "#fff" }
          : {
              backgroundColor: "#fff",
              color: "var(--theme-text)",
              border: "1px solid var(--theme-border)",
            }
      }
    >
      {label}
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
