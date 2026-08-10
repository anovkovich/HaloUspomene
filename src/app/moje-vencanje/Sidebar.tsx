import React from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut, ExternalLink, Lock, Sparkles } from "lucide-react";
import { type ActiveView, getNavItems } from "./nav-items";
import { coupleDisplayName } from "@/lib/couple-display-name";

export type { ActiveView } from "./nav-items";

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  coupleInfo: {
    slug: string;
    bride: string;
    groom: string;
    eventDate: string;
    scriptFont: string;
    draft: boolean;
    paidForGallery?: boolean;
    galleryOnly?: boolean;
  };
  checklistStats: { completed: number; total: number };
  budgetStats: { spent: number; planned: number };
  onLogout: () => void;
  onDraftAction?: () => void;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86_400_000));
}

export default function Sidebar({
  activeView,
  onViewChange,
  coupleInfo,
  onLogout,
  onDraftAction,
}: SidebarProps) {
  const hasDate = coupleInfo.eventDate && !isNaN(new Date(coupleInfo.eventDate).getTime());
  const days = hasDate ? daysUntil(coupleInfo.eventDate) : null;
  const eventDateFormatted = hasDate
    ? new Date(coupleInfo.eventDate).toLocaleDateString("sr-Latn-RS", { day: "numeric", month: "short" })
    : null;

  const navItems = getNavItems({
    paidForGallery: coupleInfo.paidForGallery,
    galleryOnly: coupleInfo.galleryOnly,
  });

  const unlockedItems = navItems.filter((i) => !i.locked);
  const lockedItems = navItems.filter((i) => i.locked);

  return (
    <aside className="fixed left-0 top-0 w-60 h-screen bg-[#F5F4DC] border-r border-[#232323]/15 flex flex-col z-40 overflow-y-auto">
      {/* Couple info */}
      <div className="px-5 pt-6 pb-4 border-b border-[#232323]/10">
        <h2
          className="font-serif text-lg text-[#232323] leading-tight whitespace-nowrap truncate"
          style={
            {
              "--couple-script-font": `var(--font-${coupleInfo.scriptFont})`,
            } as React.CSSProperties
          }
        >
          {coupleDisplayName(coupleInfo)}
        </h2>
        <p className="text-xs text-[#232323]/60 mt-1">
          {hasDate ? `${eventDateFormatted} · još ${days}d` : "Datum nije unet"}
        </p>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Unlocked items */}
        {unlockedItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-[#AE343F]/12 text-[#AE343F] border-l-2 border-[#AE343F] pl-[10px]"
                  : "text-[#232323]/85 hover:bg-white/70 hover:text-[#232323] hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}

        {/* Locked items section (gallery-only users) */}
        {lockedItems.length > 0 && (
          <>
            <div className="border-t border-[#232323]/10 my-3" />
            {lockedItems.map((item) => {
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => onViewChange(item.view)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-[#232323]/5 text-[#232323]/50"
                      : "text-[#232323]/45 hover:bg-white/50 hover:text-[#232323]/55"
                  }`}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  <Lock size={13} className="text-[#232323]/35" />
                </button>
              );
            })}

            {/* Upsell CTA card */}
            <div className="mt-3 mx-1 p-3 rounded-xl bg-gradient-to-br from-white/80 to-white/40 border border-[#232323]/8">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles size={12} className="text-[#d4af37]" />
                <span className="text-[11px] font-medium text-[#232323]/70">
                  Uz digitalnu pozivnicu
                </span>
              </div>
              <p className="text-[10px] text-[#232323]/50 leading-relaxed mb-2">
                Kompletan planer za venčanje dolazi uz naše pakete pozivnica.
              </p>
              <Link
                href="/cene"
                className="text-[10px] font-medium text-[#AE343F] hover:underline"
              >
                Pogledajte pakete →
              </Link>
            </div>
          </>
        )}

        {/* Separator + external links (hidden for gallery-only users) */}
        {!coupleInfo.galleryOnly && (
          <>
            <div className="border-t border-[#232323]/10 my-3" />
            {coupleInfo.draft ? (
              <button
                onClick={onDraftAction}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#232323]/50 cursor-pointer transition-all duration-200 hover:bg-white/70 hover:text-[#232323]/75"
              >
                <LayoutDashboard size={18} />
                <span className="flex-1 text-left">Raspored</span>
              </button>
            ) : (
              <Link
                href={`/pozivnica/${coupleInfo.slug}/raspored-sedenja`}
                target="_blank"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#232323]/85 cursor-pointer transition-all duration-200 hover:bg-white/70 hover:text-[#232323] hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                <LayoutDashboard size={18} />
                <span className="flex-1">Raspored</span>
                <ExternalLink size={12} className="text-[#232323]/50" />
              </Link>
            )}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-2 border-t border-[#232323]/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#232323]/65 hover:text-[#AE343F] transition-colors"
        >
          <LogOut size={16} />
          Odjavite se
        </button>
      </div>
    </aside>
  );
}
