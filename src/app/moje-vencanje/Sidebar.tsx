import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Wallet,
  Star,
  Users,
  Mic,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  Home,
} from "lucide-react";

export type ActiveView = "overview" | "checklist" | "budget" | "vendors" | "audio" | "guests";

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
  };
  checklistStats: { completed: number; total: number };
  budgetStats: { spent: number; planned: number };
  onLogout: () => void;
  onDraftAction?: () => void;
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

const NAV_ITEMS: {
  view: ActiveView;
  label: string;
  icon: React.ReactNode;
}[] = [
  { view: "overview", label: "Pregled", icon: <Home size={18} /> },
  { view: "checklist", label: "Checklista", icon: <CheckCircle2 size={18} /> },
  { view: "budget", label: "Budžet", icon: <Wallet size={18} /> },
  { view: "vendors", label: "Vendori", icon: <Star size={18} /> },
  { view: "audio", label: "Audio knjiga", icon: <Mic size={18} /> },
  { view: "guests", label: "Gosti", icon: <Users size={18} /> },
];

export default function Sidebar({
  activeView,
  onViewChange,
  coupleInfo,
  checklistStats,
  budgetStats,
  onLogout,
  onDraftAction,
}: SidebarProps) {
  const hasDate = coupleInfo.eventDate && !isNaN(new Date(coupleInfo.eventDate).getTime());
  const days = hasDate ? daysUntil(coupleInfo.eventDate) : null;
  const eventDateFormatted = hasDate
    ? new Date(coupleInfo.eventDate).toLocaleDateString("sr-Latn-RS", { day: "numeric", month: "short" })
    : null;

  return (
    <aside className="fixed left-0 top-0 w-60 h-screen bg-[#F5F4DC] border-r border-[#232323]/8 flex flex-col z-40 overflow-y-auto">
      {/* Couple info */}
      <div className="px-5 pt-6 pb-4 border-b border-[#232323]/5">
        <h2
          className="font-serif text-lg text-[#232323] leading-tight whitespace-nowrap truncate"
          style={
            {
              "--couple-script-font": `var(--font-${coupleInfo.scriptFont})`,
            } as React.CSSProperties
          }
        >
          {coupleInfo.bride} & {coupleInfo.groom}
        </h2>
        <p className="text-xs text-[#232323]/40 mt-1">
          {hasDate ? `${eventDateFormatted} · još ${days}d` : "Datum nije unet"}
        </p>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-[#AE343F]/5 text-[#AE343F] border-l-2 border-[#AE343F] pl-[10px]"
                  : "text-[#232323]/50 hover:bg-white/70 hover:text-[#232323] hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}

        {/* Separator */}
        <div className="border-t border-[#232323]/5 my-3" />

        {/* External links */}
        {coupleInfo.draft ? (
          <button
            onClick={onDraftAction}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#232323]/30 cursor-pointer transition-all duration-200 hover:bg-white/70 hover:text-[#232323]/50"
          >
            <LayoutDashboard size={18} />
            <span className="flex-1 text-left">Raspored</span>
          </button>
        ) : (
          <Link
            href={`/pozivnica/${coupleInfo.slug}/raspored-sedenja`}
            target="_blank"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#232323]/50 cursor-pointer transition-all duration-200 hover:bg-white/70 hover:text-[#232323] hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <LayoutDashboard size={18} />
            <span className="flex-1">Raspored</span>
            <ExternalLink size={12} className="text-[#232323]/20" />
          </Link>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-2 border-t border-[#232323]/5">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#232323]/40 hover:text-[#AE343F] transition-colors"
        >
          <LogOut size={16} />
          Odjavite se
        </button>
      </div>
    </aside>
  );
}
