"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ListChecks,
  Wallet,
  Mic,
  Images,
  ChevronLeft,
  UtensilsCrossed,
  Users,
  LayoutGrid,
  ChevronRight,
  Lock,
  QrCode,
  X,
  FileImage,
  FileText,
  Heart,
} from "lucide-react";
import { generateQrFlyerPDF } from "@/lib/qr-flyer";
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
  const [qrModal, setQrModal] = useState<"gallery" | "audio" | null>(null);

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

  // Guest-facing hub URL (absolute — QR is printed on thank-you cards).
  const siteBase =
    process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";
  const hubUrl = (tab: string) =>
    `${siteBase}/raspored-sedenja/${slug}/gde-sedim/?tab=${tab}`;

  // Copy + URLs for each QR option (used by the download modal + the flyer PDF).
  const QR_META = {
    gallery: {
      label: "Foto galerija",
      url: hubUrl("gallery"),
      pngName: `qr-galerija-${slug}.png`,
      pdfName: `flajer-galerija-${slug}.pdf`,
      flyerTitle: "Podelite fotografije",
      lines: [
        "Skenirajte QR kod i dodajte",
        "svoje fotografije sa događaja —",
        "direktno sa telefona, bez aplikacije.",
      ],
      bottom: "Vaše fotografije, zajednička uspomena",
    },
    audio: {
      label: "Audio utisci",
      url: hubUrl("utisci"),
      pngName: `qr-utisci-${slug}.png`,
      pdfName: `flajer-utisci-${slug}.pdf`,
      flyerTitle: "Ostavite audio poruku",
      lines: [
        "Skenirajte QR kod i snimite kratku",
        "poruku ili čestitku —",
        "direktno sa telefona, bez aplikacije.",
      ],
      bottom: "Vaš glas je najlepša uspomena",
    },
  } as const;

  async function downloadQR(url: string, filename: string) {
    const QRCode = (await import("qrcode")).default;
    const dataUrl = await QRCode.toDataURL(url, {
      width: 1400,
      margin: 2,
      color: { dark: "#232323", light: "#ffffff" },
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 1000);
  }

  async function downloadFlyer(key: "gallery" | "audio") {
    const m = QR_META[key];
    await generateQrFlyerPDF({
      eventName,
      url: m.url,
      title: m.flyerTitle,
      lines: [...m.lines],
      thankYou:
        "Hvala što ste svojim prisustvom ulepšali naš poseban dan.",
      bottom: m.bottom,
      filename: m.pdfName,
    });
  }

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
  // Utisci + Galerija are always shown; when not purchased the tab renders a
  // locked message (the portal is the client's single destination either way).
  navItems.push({ key: "utisci", label: "Utisci", icon: <Mic size={20} />, tab: "utisci" });
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
  const budgetPct = plannedTotal
    ? Math.min(100, Math.round((spentTotal / plannedTotal) * 100))
    : 0;

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
          <div className="space-y-5">
            {/* Hero — countdown (cream/gold, the page's emotional anchor) */}
            <div
              className="rounded-3xl px-6 py-8 text-center"
              style={{
                background:
                  "linear-gradient(160deg, #FDFCF2 0%, var(--theme-surface) 100%)",
                border: "1px solid rgba(212,175,55,0.35)",
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div
                  className="h-px w-10"
                  style={{ backgroundColor: "rgba(212,175,55,0.5)" }}
                />
                <Heart size={13} fill="#d4af37" style={{ color: "#d4af37" }} />
                <div
                  className="h-px w-10"
                  style={{ backgroundColor: "rgba(212,175,55,0.5)" }}
                />
              </div>

              {days === null ? (
                <p
                  className="font-serif text-2xl"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Datum događaja nije postavljen
                </p>
              ) : days > 0 ? (
                <>
                  <p
                    className="font-raleway text-[11px] uppercase tracking-[0.18em] mb-1"
                    style={{ color: "var(--theme-text-light)" }}
                  >
                    Do događaja
                  </p>
                  <p
                    className="font-serif leading-none"
                    style={{ fontSize: 60, fontWeight: 600, color: "var(--theme-text)" }}
                  >
                    {days}
                  </p>
                  <p
                    className="font-serif text-base"
                    style={{ color: "var(--theme-text-light)" }}
                  >
                    {days === 1 ? "dan" : "dana"}
                  </p>
                </>
              ) : days === 0 ? (
                <p
                  className="font-script text-4xl"
                  style={{ color: "var(--theme-primary)" }}
                >
                  Srećno slavlje!
                </p>
              ) : (
                <p
                  className="font-serif text-2xl"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Događaj je prošao
                </p>
              )}

              {eventDate && (
                <p
                  className="font-raleway text-xs uppercase tracking-[0.12em] mt-3"
                  style={{ color: "#b9962f" }}
                >
                  {new Date(eventDate)
                    .toLocaleDateString("sr-RS", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                    .toUpperCase()}
                </p>
              )}
            </div>

            {/* Brojke — one split white card */}
            <div
              className="rounded-2xl bg-white border grid grid-cols-2 overflow-hidden"
              style={{
                borderColor: "var(--theme-border)",
                boxShadow: "0 1px 3px rgba(35,35,35,0.06)",
              }}
            >
              <div className="py-4 px-3 text-center">
                <p
                  className="font-serif text-3xl leading-none"
                  style={{ color: "var(--theme-text)" }}
                >
                  {guestCount}
                </p>
                <p
                  className="font-raleway text-[10px] uppercase tracking-wider mt-1.5"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Gostiju · sa pratiocima
                </p>
              </div>
              <div
                className="py-4 px-3 text-center"
                style={{ borderLeft: "1px solid rgba(35,35,35,0.08)" }}
              >
                <p
                  className="font-serif text-3xl leading-none"
                  style={{ color: "var(--theme-text)" }}
                >
                  {seatingStats ? (
                    <>
                      {seatingStats.assignedSeats}
                      <span style={{ color: "var(--theme-text-light)" }}>
                        /{seatingStats.totalSeats}
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </p>
                {seatingStats && seatingStats.totalSeats > 0 && (
                  <div
                    className="h-1 rounded-full mx-auto mt-2 overflow-hidden"
                    style={{ width: 64, backgroundColor: "rgba(35,35,35,0.08)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${fillPct}%`,
                        backgroundColor: "var(--theme-primary)",
                      }}
                    />
                  </div>
                )}
                <p
                  className="font-raleway text-[10px] uppercase tracking-wider mt-1.5"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Raspoređena mesta
                </p>
              </div>
            </div>

            {/* Planiranje */}
            <div>
              <SectionHeader title="Planiranje" />
              <div className="grid grid-cols-2 gap-3">
                <PlanCard
                  title="Checklista"
                  icon={<ListChecks size={16} />}
                  fraction={`${checkDone}/${checkTotal}`}
                  pct={checkPct}
                  barColor="var(--theme-primary)"
                  onClick={() => setActive("planer")}
                />
                <PlanCard
                  title="Budžet"
                  icon={<Wallet size={16} />}
                  fraction={`${formatCompact(spentTotal)}/${formatCompact(plannedTotal)}`}
                  pct={budgetPct}
                  barColor="#d4af37"
                  empty={plannedTotal === 0 && spentTotal === 0}
                  onClick={() => setActive("budzet")}
                />
              </div>
            </div>

            {/* Zahvalnice — distinct burgundy band with print-style cards */}
            {(hasGallery || hasAudio) && (
              <div
                className="rounded-3xl px-4 py-5 relative overflow-hidden"
                style={{ backgroundColor: "var(--theme-primary)" }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.10), transparent 60%)",
                  }}
                />
                <div className="relative text-center mb-4">
                  <p
                    className="font-script text-3xl leading-tight"
                    style={{ color: "var(--theme-surface)" }}
                  >
                    Zahvalnice
                  </p>
                  <p
                    className="font-raleway text-[11px] mt-0.5"
                    style={{ color: "rgba(245,244,220,0.72)" }}
                  >
                    QR kodovi za vaše stolove — spremni za štampu
                  </p>
                </div>
                <div
                  className={`relative grid gap-2.5 ${
                    hasGallery && hasAudio ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {hasGallery && (
                    <PrintCard
                      label="Foto galerija"
                      onClick={() => setQrModal("gallery")}
                    />
                  )}
                  {hasAudio && (
                    <PrintCard
                      label="Audio utisci"
                      onClick={() => setQrModal("audio")}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Stranica za goste — quiet utility row */}
            <a
              href={`/raspored-sedenja/${slug}/gde-sedim`}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 transition-colors hover:bg-[#faf9f6]"
              style={{ border: "1px solid rgba(174,52,63,0.3)" }}
            >
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--theme-text)" }}
                >
                  Stranica za goste
                </p>
                <p
                  className="text-[11px]"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Gde sedim · Utisci · Galerija
                </p>
              </div>
              <ChevronRight size={18} style={{ color: "var(--theme-primary)" }} />
            </a>
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

        {active === "utisci" &&
          (hasAudio ? (
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
          ) : (
            <LockedTab
              title="Audio knjiga utisaka"
              message="Gosti ostavljaju glasovne poruke koje vi slušate i čuvate. Ova opcija nije uključena za vaš događaj."
            />
          ))}

        {active === "galerija" &&
          (hasGallery ? (
            <GalleryCard
              slug={slug}
              loadAction={galleryLoad}
              deleteAction={galleryDelete}
              downloadBase={`/api/raspored-sedenja/${slug}/galerija/download`}
            />
          ) : (
            <LockedTab
              title="QR foto galerija"
              message="Gosti dodaju fotografije skeniranjem QR koda, a vi ih preuzimate. Ova opcija nije uključena za vaš događaj."
            />
          ))}
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

      {/* QR download modal — choose bare QR or a print-ready A6 flyer */}
      {qrModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
          onClick={() => setQrModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl p-6 relative bg-white"
          >
            <button
              type="button"
              onClick={() => setQrModal(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5"
              style={{ color: "rgba(35,35,35,0.5)" }}
              aria-label="Zatvori"
            >
              <X size={16} />
            </button>

            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: "rgba(174,52,63,0.12)" }}
            >
              <QrCode size={20} style={{ color: "#AE343F" }} />
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: "#232323" }}>
              QR — {QR_META[qrModal].label}
            </h3>
            <p
              className="text-xs leading-relaxed mb-5"
              style={{ color: "rgba(35,35,35,0.6)" }}
            >
              Kako želite da preuzmete kod za goste?
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  downloadQR(QR_META[qrModal].url, QR_META[qrModal].pngName);
                  setQrModal(null);
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border text-left hover:bg-[#faf9f6] transition-colors cursor-pointer"
                style={{ borderColor: "rgba(35,35,35,0.14)" }}
              >
                <FileImage size={20} style={{ color: "#AE343F" }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#232323" }}>
                    Samo QR kod (PNG)
                  </p>
                  <p className="text-xs" style={{ color: "rgba(35,35,35,0.55)" }}>
                    Sliku sami ubacite u svoj dizajn
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  downloadFlyer(qrModal);
                  setQrModal(null);
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border text-left hover:bg-[#faf9f6] transition-colors cursor-pointer"
                style={{ borderColor: "rgba(35,35,35,0.14)" }}
              >
                <FileText size={20} style={{ color: "#AE343F" }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#232323" }}>
                    Gotov flajer za zahvalnicu (A6 PDF)
                  </p>
                  <p className="text-xs" style={{ color: "rgba(35,35,35,0.55)" }}>
                    Dizajn sa QR kodom i uputstvom — spremno za štampu
                  </p>
                </div>
              </button>
            </div>

            {hasAudio && hasGallery && (
              <p
                className="text-[11px] leading-relaxed mt-4 p-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(174,52,63,0.06)",
                  color: "rgba(35,35,35,0.65)",
                }}
              >
                <strong>Napomena:</strong> imate i audio i foto — preuzmite oba
                flajera i odštampajte ih <strong>dvostrano</strong> na jednoj A6
                kartici (foto s jedne, audio s druge strane).
              </p>
            )}
          </div>
        </div>
      )}
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

function formatCompact(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1)}k`;
  }
  return String(Math.round(n));
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-2.5">
      <p
        className="font-raleway text-[11px] uppercase tracking-[0.15em] shrink-0"
        style={{ color: "var(--theme-text-light)" }}
      >
        {title}
      </p>
      <div
        className="h-px flex-1"
        style={{ backgroundColor: "var(--theme-border)" }}
      />
    </div>
  );
}

function PlanCard({
  title,
  icon,
  fraction,
  pct,
  barColor,
  empty,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  fraction: string;
  pct: number;
  barColor: string;
  empty?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative text-left rounded-2xl bg-white border p-4 shadow-sm hover:bg-[#faf9f6] transition-colors cursor-pointer"
      style={{ borderColor: "var(--theme-border)" }}
    >
      <ChevronRight
        size={15}
        className="absolute top-3 right-3"
        style={{ color: "var(--theme-text-light)" }}
      />
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
        style={{ backgroundColor: "var(--theme-surface)" }}
      >
        <span style={{ color: "var(--theme-primary)" }}>{icon}</span>
      </div>
      <p
        className="text-[13px] font-semibold"
        style={{ color: "var(--theme-text)" }}
      >
        {title}
      </p>
      {empty ? (
        <p
          className="font-serif text-xl mt-0.5"
          style={{ color: "var(--theme-text-light)" }}
        >
          —
        </p>
      ) : (
        <>
          <div className="flex items-baseline justify-between mt-0.5">
            <p
              className="font-serif text-xl leading-none"
              style={{ color: "var(--theme-text)" }}
            >
              {fraction}
            </p>
            <span
              className="text-[11px]"
              style={{ color: "var(--theme-text-light)" }}
            >
              {pct}%
            </span>
          </div>
          <div
            className="h-1 rounded-full mt-1.5 overflow-hidden"
            style={{ backgroundColor: "rgba(35,35,35,0.08)" }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, backgroundColor: barColor }}
            />
          </div>
        </>
      )}
    </button>
  );
}

function PrintCard({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl p-1.5 cursor-pointer"
      style={{ backgroundColor: "var(--theme-surface)" }}
    >
      <div
        className="rounded-lg px-3 py-4 flex flex-col items-center text-center"
        style={{ border: "1.5px dashed rgba(174,52,63,0.35)" }}
      >
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-2">
          <QrCode size={20} style={{ color: "#232323" }} />
        </div>
        <p
          className="font-serif text-[15px] font-semibold"
          style={{ color: "#232323" }}
        >
          {label}
        </p>
        <p
          className="font-raleway text-[9px] uppercase tracking-[0.1em] mt-0.5"
          style={{ color: "#b9962f" }}
        >
          PNG · A6 PDF
        </p>
      </div>
    </button>
  );
}

function LockedTab({ title, message }: { title: string; message: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-16 px-6">
      <div
        className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "var(--theme-primary-muted, rgba(174,52,63,0.12))" }}
      >
        <Lock size={24} style={{ color: "var(--theme-primary)" }} />
      </div>
      <h2 className="font-serif text-xl mb-2" style={{ color: "var(--theme-text)" }}>
        {title}
      </h2>
      <p
        className="text-sm leading-relaxed mb-5"
        style={{ color: "var(--theme-text-light)" }}
      >
        {message}
      </p>
      <a
        href="mailto:halouspomene@gmail.com"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--theme-primary)" }}
      >
        Kontaktirajte nas da dodamo
      </a>
    </div>
  );
}

