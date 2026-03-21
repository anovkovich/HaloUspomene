"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  LogOut,
  CheckCircle2,
  Wallet,
  ArrowLeft,
  Download,
  Users,
  LayoutDashboard,
  Mic,
} from "lucide-react";
import { verifyAuth, loadPortalDataAction } from "./actions";
import type { ChecklistItem, PortalBudget } from "./types";
import ChecklistCard from "./ChecklistCard";
import BudgetCard from "./BudgetCard";
import {
  getDefaultChecklist,
  getDefaultBudgetCategories,
  GROUP_ORDER,
  GROUP_LABELS,
} from "./defaults";

type AppState = "loading" | "guest" | "auth";
type MobileTab = "checklist" | "budget";

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export default function MojeVencanjeClient() {
  const [state, setState] = useState<AppState>("loading");
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("checklist");

  // PWA install
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isStandalone, setIsStandalone] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstall, setShowIOSInstall] = useState(false);
  const [mobilePrompt, setMobilePrompt] = useState(false);
  const [skipInstall, setSkipInstall] = useState(false);

  // Auth data
  const [coupleInfo, setCoupleInfo] = useState<{
    slug: string;
    bride: string;
    groom: string;
    eventDate: string;
    scriptFont: string;
  } | null>(null);

  // Portal data
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [budget, setBudget] = useState<PortalBudget>({
    totalBudget: 0,
    categories: [],
  });

  // Read tab from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "budget") setMobileTab("budget");
  }, []);

  // Auto-login on mount
  useEffect(() => {
    const savedSlug = getCookie("moje_vencanje_slug");
    if (savedSlug) {
      setSlug(savedSlug);
      verifyAuth().then(async (result) => {
        if (result?.ok && result.slug) {
          setCoupleInfo({
            slug: result.slug,
            bride: result.bride!,
            groom: result.groom!,
            eventDate: result.eventDate!,
            scriptFont: result.scriptFont ?? "great-vibes",
          });
          const data = await loadPortalDataAction();
          if (data) {
            setChecklist(data.checklist);
            setBudget(data.budget);
          }
          setState("auth");
        } else {
          setState("guest");
        }
      });
    } else {
      setState("guest");
    }
  }, []);

  // PWA install prompt
  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);
    const mobile = window.innerWidth < 768;
    if (mobile && !standalone) setMobilePrompt(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoginLoading(true);

      try {
        const trimmedSlug = slug.trim().toLowerCase();
        const res = await fetch(
          `/api/moje-vencanje/auth/${encodeURIComponent(trimmedSlug)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          },
        );
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "Greška pri prijavljivanju");
          setLoginLoading(false);
          return;
        }

        setCoupleInfo({
          slug: trimmedSlug,
          bride: json.couple.bride,
          groom: json.couple.groom,
          eventDate: json.couple.eventDate,
          scriptFont: json.couple.scriptFont ?? "great-vibes",
        });

        const data = await loadPortalDataAction();
        if (data) {
          setChecklist(data.checklist);
          setBudget(data.budget);
        }
        setState("auth");
      } catch {
        setError("Greška pri povezivanju sa serverom");
      } finally {
        setLoginLoading(false);
      }
    },
    [slug, password],
  );

  const handleLogout = useCallback(() => {
    document.cookie =
      "moje_vencanje_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "moje_vencanje_slug=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setCoupleInfo(null);
    setChecklist([]);
    setBudget({ totalBudget: 0, categories: [] });
    setPassword("");
    setState("guest");
  }, []);

  const handleInstall = useCallback(async () => {
    if (installPrompt) {
      const prompt = installPrompt as any;
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === "accepted") setInstallPrompt(null);
    } else if (isIOS) {
      setShowIOSInstall(true);
    }
  }, [installPrompt, isIOS]);

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-[#F5F4DC] flex items-center justify-center pt-24">
        <span className="loading loading-spinner loading-lg text-[#AE343F]" />
      </div>
    );
  }

  const canInstall = !isStandalone && (installPrompt !== null || isIOS);

  const completedCount = checklist.filter((i) => i.completed).length;
  const totalSpent = budget.categories.reduce((s, c) => s + c.spent, 0);
  const totalPlanned = budget.categories.reduce((s, c) => s + c.planned, 0);

  return (
    <div className="min-h-screen bg-[#F5F4DC]">
      {/* ── Simple Navbar ──────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#F5F4DC]/90 backdrop-blur-lg border-b border-[#232323]/5">
        <div className="container mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#232323]/50 hover:text-[#232323] transition-colors [@media(display-mode:standalone)]:hidden"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Početna</span>
          </Link>

          <Link
            href="/moje-vencanje"
            className="absolute left-1/2 -translate-x-1/2"
          >
            <Image
              src="/images/full-logo.png"
              alt="HALO Uspomene"
              width={3519}
              height={1798}
              className="h-10 w-auto"
            />
          </Link>

          <div className="w-16" />
        </div>
      </nav>

      <div
        className={`pt-20 md:pt-28 px-4 [@media(display-mode:standalone)]:pt-[4.5rem] pb-16 ${state === "auth" ? "[@media(display-mode:standalone)]:pb-24" : ""}`}
      >
        <div className="max-w-5xl mx-auto">
          {/* ── Hero / Title ─────────────────────────────────────── */}
          {state === "guest" && (
            <>
              <div className="text-center mb-10">
                <Heart className="mx-auto mb-4 text-[#AE343F]" size={36} />
                <h1 className="font-serif text-4xl md:text-5xl text-[#232323] mb-3">
                  Vaše venčanje, na jednom mestu
                </h1>
                <p className="text-[#232323]/60 max-w-lg mx-auto">
                  Besplatan planer za organizaciju venčanja — checklista i
                  praćenje budžeta za sve parove koji koriste HALO Uspomene.
                </p>
              </div>

              {/* ── Mobile install prompt ──────────────────── */}
              {mobilePrompt && !skipInstall && (
                <div className="max-w-xs mx-auto mb-14 flex flex-col items-center gap-4">
                  <button
                    onClick={handleInstall}
                    className="w-full px-8 py-3 text-sm font-semibold tracking-[0.15em] uppercase text-white bg-[#AE343F] rounded-full hover:bg-[#932d35] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Preuzmite aplikaciju
                  </button>
                  <button
                    onClick={() => setSkipInstall(true)}
                    className="text-xs text-[#232323]/30 hover:text-[#232323]/50 transition-colors"
                  >
                    Nastavi u pretraživaču
                  </button>
                </div>
              )}

              {/* ── Login Form (stacked, luxury) ──────────────── */}
              <form
                onSubmit={handleLogin}
                className={`max-w-xs mx-auto mb-14 flex flex-col items-center gap-5 ${mobilePrompt && !skipInstall ? "hidden" : ""}`}
              >
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="'Slug' Vaše pozivnice"
                  autoComplete="off"
                  data-1p-ignore
                  className="w-full bg-transparent border-b border-[#d4af37]/40 px-0 py-3 text-center text-sm tracking-wide text-[#232323] placeholder:text-[#232323]/25 focus:border-[#d4af37] focus:outline-none transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:#232323] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Lozinka"
                  autoComplete="off"
                  data-1p-ignore
                  className="w-full bg-transparent border-b border-[#d4af37]/40 px-0 py-3 text-center text-sm tracking-wide text-[#232323] placeholder:text-[#232323]/25 focus:border-[#d4af37] focus:outline-none transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:#232323] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                  required
                />
                {error && <p className="text-xs text-[#AE343F]">{error}</p>}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="mt-1 px-10 py-2.5 text-xs font-semibold tracking-[0.2em] uppercase text-[#d4af37] border border-[#d4af37]/40 rounded-full hover:bg-[#d4af37] hover:text-white transition-all duration-500"
                >
                  {loginLoading ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    "Prijavite se"
                  )}
                </button>
              </form>

              {canInstall && !(mobilePrompt && !skipInstall) && (
                <div className="text-center mb-6">
                  <button
                    onClick={handleInstall}
                    className="inline-flex items-center gap-2 text-xs text-[#232323]/40 hover:text-[#232323]/60 transition-colors"
                  >
                    <Download size={14} />
                    Instalirajte kao aplikaciju za brži pristup
                  </button>
                </div>
              )}

              {/* ── Subtle upsell note ─────────────────────────── */}
              <p
                className={`text-center text-xs text-[#232323]/30 italic mb-6 ${mobilePrompt && !skipInstall ? "hidden" : ""}`}
              >
                Ovo je samo kratak pregled — prijavom dobijate potpun planer sa
                čuvanjem podataka, prilagođenim stavkama i praćenjem u realnom
                vremenu.{" "}
                <Link
                  href="/napravi-pozivnicu"
                  className="text-[#d4af37] hover:text-[#b8972e] underline underline-offset-2 not-italic transition-colors"
                >
                  Naručite pozivnicu
                </Link>
              </p>

              {/* ── Teaser Cards ─────────────────────────────────── */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <TeaserChecklist />
                <TeaserBudget />
              </div>
            </>
          )}

          {/* ── Authenticated ────────────────────────────────────── */}
          {state === "auth" && coupleInfo && (
            <>
              {/* Couple heading */}
              <div className="text-center mb-8 pwa-heading-section">
                <h1
                  className="font-serif text-3xl md:text-4xl text-[#232323] mb-1 pwa-script-heading"
                  style={
                    {
                      "--couple-script-font": `var(--font-${coupleInfo.scriptFont})`,
                    } as React.CSSProperties
                  }
                >
                  {coupleInfo.bride} & {coupleInfo.groom}
                </h1>
                <p className="text-[#232323]/50 text-sm [@media(display-mode:standalone)]:hidden">
                  {new Date(coupleInfo.eventDate).toLocaleDateString(
                    "sr-Latn-RS",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                  {" · "}
                  još {daysUntil(coupleInfo.eventDate)} dana
                </p>
                <Link
                  href={`/pozivnica/${coupleInfo.slug}/portal`}
                  className="mt-3 inline-flex items-center gap-1.5 px-5 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#AE343F] border border-[#AE343F]/30 rounded-full hover:bg-[#AE343F] hover:text-[#F5F4DC] transition-all duration-300 [@media(display-mode:standalone)]:hidden"
                >
                  Organizacija gostiju
                </Link>
                <br className="[@media(display-mode:standalone)]:hidden" />
                <button
                  onClick={handleLogout}
                  className="mt-2 text-xs text-[#232323]/40 hover:text-[#AE343F] transition-colors inline-flex items-center gap-1 [@media(display-mode:standalone)]:hidden"
                >
                  <LogOut size={12} /> Odjavite se
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-xl mx-auto">
                <div className="bg-white rounded-xl border border-[#232323]/10 p-4 text-center">
                  <CheckCircle2
                    size={20}
                    className="mx-auto mb-1 text-[#AE343F]"
                  />
                  <p className="text-2xl font-bold text-[#232323]">
                    {completedCount}/{checklist.length}
                  </p>
                  <p className="text-xs text-[#232323]/50">Završeno</p>
                </div>
                <div className="bg-white rounded-xl border border-[#232323]/10 p-4 text-center">
                  <Wallet size={20} className="mx-auto mb-1 text-[#AE343F]" />
                  <p className="text-2xl font-bold text-[#232323]">
                    {totalSpent.toLocaleString("sr-RS")}
                  </p>
                  <p className="text-xs text-[#232323]/50">
                    od {totalPlanned.toLocaleString("sr-RS")} RSD
                  </p>
                </div>
              </div>

              {/* Mobile tab switcher (browser only, hidden in PWA) */}
              <div className="flex md:hidden justify-center gap-2 mb-6 [@media(display-mode:standalone)]:hidden">
                <button
                  onClick={() => setMobileTab("checklist")}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                    mobileTab === "checklist"
                      ? "bg-[#AE343F] text-[#F5F4DC]"
                      : "bg-white text-[#232323]/60 border border-[#232323]/10"
                  }`}
                >
                  Checklista
                </button>
                <button
                  onClick={() => setMobileTab("budget")}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                    mobileTab === "budget"
                      ? "bg-[#AE343F] text-[#F5F4DC]"
                      : "bg-white text-[#232323]/60 border border-[#232323]/10"
                  }`}
                >
                  Budžet
                </button>
              </div>

              {/* Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <div
                  className={`${mobileTab !== "checklist" ? "hidden md:block" : ""}`}
                >
                  <ChecklistCard
                    checklist={checklist}
                    setChecklist={setChecklist}
                  />
                </div>
                <div
                  className={`${mobileTab !== "budget" ? "hidden md:block" : ""}`}
                >
                  <BudgetCard budget={budget} setBudget={setBudget} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Mobile bottom nav (auth) ── */}
      {state === "auth" && coupleInfo && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#232323]/10 hidden [@media(display-mode:standalone)_and_(max-width:767px)]:flex flex-col"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex justify-around items-center h-14">
            <button
              onClick={() => { setMobileTab("checklist"); window.scrollTo({ top: 0 }); }}
              className={`flex flex-col items-center gap-0.5 py-1 ${
                mobileTab === "checklist"
                  ? "text-[#AE343F]"
                  : "text-[#232323]/35"
              }`}
            >
              <CheckCircle2 size={20} />
              <span className="text-[10px] font-medium">Checklista</span>
            </button>
            <button
              onClick={() => { setMobileTab("budget"); window.scrollTo({ top: 0 }); }}
              className={`flex flex-col items-center gap-0.5 py-1 ${
                mobileTab === "budget" ? "text-[#AE343F]" : "text-[#232323]/35"
              }`}
            >
              <Wallet size={20} />
              <span className="text-[10px] font-medium">Budžet</span>
            </button>
            <Link
              href={`/pozivnica/${coupleInfo.slug}/portal`}
              className="flex flex-col items-center gap-0.5 py-1 text-[#232323]/35"
            >
              <Users size={20} />
              <span className="text-[10px] font-medium">Gosti</span>
            </Link>
            <Link
              href={`/pozivnica/${coupleInfo.slug}/audio-knjiga/slusaj`}
              className="flex flex-col items-center gap-0.5 py-1 text-[#232323]/35"
            >
              <Mic size={20} />
              <span className="text-[10px] font-medium">Audio</span>
            </Link>
            <Link
              href={`/pozivnica/${coupleInfo.slug}/raspored-sedenja`}
              className="flex flex-col items-center gap-0.5 py-1 text-[#232323]/35"
            >
              <LayoutDashboard size={20} />
              <span className="text-[10px] font-medium">Raspored</span>
            </Link>
          </div>
        </nav>
      )}

      {/* ── iOS install instructions ── */}
      {showIOSInstall && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30"
          onClick={() => setShowIOSInstall(false)}
        >
          <div
            className="bg-white rounded-t-2xl p-6 w-full max-w-md"
            style={{
              paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#232323]/15 rounded-full mx-auto mb-5" />
            <h3 className="font-serif text-lg text-[#232323] text-center mb-4">
              Instalirajte aplikaciju
            </h3>
            <div className="space-y-4 text-sm text-[#232323]/70">
              <div className="flex items-start gap-3">
                <span className="bg-[#AE343F]/10 text-[#AE343F] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </span>
                <p>
                  Pritisnite <strong>Share</strong> dugme u Safari-ju
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-[#AE343F]/10 text-[#AE343F] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </span>
                <p>
                  Izaberite <strong>&ldquo;Add to Home Screen&rdquo;</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-[#AE343F]/10 text-[#AE343F] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </span>
                <p>
                  Pritisnite <strong>&ldquo;Add&rdquo;</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSInstall(false)}
              className="btn btn-sm btn-ghost text-[#232323]/50 w-full mt-5"
            >
              Zatvori
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Teaser Components ──────────────────────────────────────────── */

function TeaserChecklist() {
  const allItems = getDefaultChecklist();
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progressPct =
    allItems.length > 0 ? (checkedCount / allItems.length) * 100 : 0;

  // Group items by group (exclude custom)
  const groups = GROUP_ORDER.filter((g) => g !== "custom")
    .map((g) => ({
      label: GROUP_LABELS[g],
      items: allItems.filter((i) => i.group === g),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="bg-white rounded-2xl border border-[#232323]/10 p-6 shadow-sm relative overflow-hidden">
      <h3 className="font-serif text-lg text-[#232323] mb-3 flex items-center gap-2">
        <CheckCircle2 size={18} className="text-[#AE343F]" />
        Checklista DEMO
      </h3>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-[#232323]/40 mb-1">
          <span>
            {checkedCount} od {allItems.length}
          </span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2 bg-[#232323]/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#AE343F] rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-4 max-h-[420px] overflow-hidden relative">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-[#232323]/40 uppercase tracking-wider mb-2">
              {group.label}
            </p>
            <div className="space-y-2">
              {group.items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 cursor-pointer group/item"
                >
                  <input
                    type="checkbox"
                    checked={!!checked[item.id]}
                    onChange={() =>
                      setChecked((p) => ({ ...p, [item.id]: !p[item.id] }))
                    }
                    className="checkbox checkbox-sm border-[#232323]/20 [--chkbg:#AE343F] [--chkfg:#F5F4DC]"
                  />
                  <span
                    className={`text-sm transition-colors ${
                      checked[item.id]
                        ? "line-through text-[#232323]/30"
                        : "text-[#232323]/70 group-hover/item:text-[#232323]"
                    }`}
                  >
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
    </div>
  );
}

function TeaserBudget() {
  const fakeCategories = getDefaultBudgetCategories();
  const fakePlanned = [
    350000, 280000, 120000, 150000, 80000, 90000, 60000, 45000, 25000, 30000,
    200000, 35000,
  ];
  const fakeSpent = [350000, 195000, 60000, 100000, 55000, 0, 0, 0, 0, 0, 0, 0];
  const totalPlanned = fakePlanned.reduce((s, v) => s + v, 0);
  const totalSpent = fakeSpent.reduce((s, v) => s + v, 0);

  return (
    <div className="bg-white rounded-2xl border border-[#232323]/10 p-6 shadow-sm relative overflow-hidden">
      <h3 className="font-serif text-lg text-[#232323] mb-3 flex items-center gap-2">
        <Wallet size={18} className="text-[#AE343F]" />
        Budžet DEMO
      </h3>

      {/* Totals */}
      <div className="flex justify-between items-baseline mb-5 pb-3 border-b border-[#232323]/5">
        <div>
          <p className="text-xs text-[#232323]/40">Ukupan budžet</p>
          <p className="text-xl font-bold text-[#232323]">
            1.465.000{" "}
            <span className="text-xs font-normal text-[#232323]/40">RSD</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#232323]/40">Potrošeno</p>
          <p className="text-xl font-bold text-[#AE343F]">
            {totalSpent.toLocaleString("sr-RS")}{" "}
            <span className="text-xs font-normal text-[#232323]/40">RSD</span>
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3.5 max-h-[360px] overflow-hidden relative">
        {fakeCategories.map((cat, i) => {
          const planned = fakePlanned[i];
          const spent = fakeSpent[i];
          const pct = planned > 0 ? Math.min(100, (spent / planned) * 100) : 0;
          const isOver = spent > planned && planned > 0;

          return (
            <div key={cat.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#232323]/70">{cat.name}</span>
                <span className="text-[#232323]/40 text-xs">
                  {spent.toLocaleString("sr-RS")} /{" "}
                  {planned.toLocaleString("sr-RS")}
                </span>
              </div>
              <div className="h-2 bg-[#232323]/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isOver ? "bg-red-500" : "bg-[#AE343F]"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
    </div>
  );
}
