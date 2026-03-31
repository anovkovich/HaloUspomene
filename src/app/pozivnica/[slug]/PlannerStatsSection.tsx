"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Wallet, Store, ChevronDown } from "lucide-react";
import type { PortalData, ChecklistGroup } from "@/app/moje-vencanje/types";
import { GROUP_LABELS, GROUP_ORDER } from "@/app/moje-vencanje/defaults";

interface PlannerStatsSectionProps {
  slug: string;
  themeVariables: Record<string, string>;
  useCyrillic: boolean;
}

const budgetCategoryLabels: Record<string, { latin: string; cyrillic: string }> = {
  venue: { latin: "Venue", cyrillic: "Lokacija" },
  music: { latin: "Music", cyrillic: "Muzika" },
  photo: { latin: "Photography", cyrillic: "Fotografija" },
  cake: { latin: "Cake", cyrillic: "Torta" },
  decoration: { latin: "Decoration", cyrillic: "Dekoracija" },
  flowers: { latin: "Flowers", cyrillic: "Cveće" },
  dress: { latin: "Dress", cyrillic: "Haljina" },
  invitations: { latin: "Invitations", cyrillic: "Pozivnice" },
  transportation: { latin: "Transportation", cyrillic: "Prevoz" },
  accommodation: { latin: "Accommodation", cyrillic: "Smeštaj" },
  gifts: { latin: "Gifts", cyrillic: "Pokloni" },
  makeup: { latin: "Makeup", cyrillic: "Šminka" },
  other: { latin: "Other", cyrillic: "Ostalo" },
};

function formatCurrency(amount: number, currency: string = "RSD"): string {
  if (currency === "EUR") {
    return `€${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  return `${amount.toLocaleString("sr-RS")} din`;
}

export default function PlannerStatsSection({
  slug,
  themeVariables,
  useCyrillic,
}: PlannerStatsSectionProps) {
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<"checklist" | "budget" | "vendors" | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Partial<Record<ChecklistGroup, boolean>>>({
    "12+": true,
    "9-12": true,
    "6-9": true,
    "3-6": true,
    "1-3": true,
    "2-weeks": true,
    "day-before": true,
    "wedding-day": true,
    custom: true,
  });

  useEffect(() => {
    async function fetchPortalData() {
      try {
        const response = await fetch(`/api/portal/${slug}`, {
          method: "GET",
        });

        if (!response.ok) {
          // Portal data might not exist yet, which is fine
          setLoading(false);
          return;
        }

        const data: PortalData = await response.json();
        setPortalData(data);
      } catch (err) {
        console.error("Failed to fetch portal data:", err);
        setError(null); // Don't show error to guests, just skip the section
      } finally {
        setLoading(false);
      }
    }

    fetchPortalData();
  }, [slug]);

  if (loading || !portalData) {
    return null;
  }

  const checklist = portalData.checklist || [];
  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const checklistProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const budget = portalData.budget || { totalBudget: 0, categories: [] };
  const categories = budget.categories || [];
  const totalPlanned = categories.reduce((sum, cat) => sum + cat.planned, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalRemaining = totalPlanned - totalSpent;
  const currencyType = budget.totalBudgetCurrency || "RSD";

  const vendorFavorites = portalData.vendorFavorites || [];

  const toggleSection = (section: "checklist" | "budget" | "vendors") => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const themeText = themeVariables["--theme-text"] || "#232323";
  const themePrimary = themeVariables["--theme-primary"] || "#AE343F";
  const themeSurface = themeVariables["--theme-surface"] || "#f5f4dc";
  const themeBorder = themeVariables["--theme-border"] || "rgba(0,0,0,0.1)";

  return (
    <div suppressHydrationWarning>
      <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 sm:gap-8 pb-2">
        {/* Mobile: flex container with horizontal scroll | Desktop: 3-column grid */}
        {/* Checklist Stats */}
        <button
          onClick={() => toggleSection("checklist")}
          className="p-6 sm:p-8 rounded-2xl border text-left transition-all hover:border-opacity-100 flex-shrink-0 md:flex-shrink min-w-[280px] md:min-w-0"
          style={{
            backgroundColor: themeSurface,
            borderColor: expandedSection === "checklist" ? themePrimary : themeBorder,
          }}
        >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${themePrimary}15` }}
              >
                <CheckCircle2 size={20} style={{ color: themePrimary }} />
              </div>
              <h3
                className="text-lg font-serif"
                style={{ color: themePrimary }}
              >
                {useCyrillic ? "Задаци" : "Checklist"}
              </h3>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-2xl font-serif" style={{ color: themeText }}>
                  {completedCount}/{totalCount}
                </span>
                <span className="text-sm" style={{ color: `${themeText}80` }}>
                  {Math.round(checklistProgress)}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: `${themePrimary}20` }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${checklistProgress}%`,
                    backgroundColor: themePrimary,
                  }}
                />
              </div>
            </div>

            <p className="text-xs" style={{ color: `${themeText}60` }}>
              {useCyrillic ? `${completedCount} од ${totalCount} задатака завршено` : `${completedCount} of ${totalCount} tasks completed`}
            </p>
          </button>

        {/* Budget Stats */}
        <button
          onClick={() => toggleSection("budget")}
          className="p-6 sm:p-8 rounded-2xl border text-left transition-all hover:border-opacity-100 flex-shrink-0 md:flex-shrink min-w-[280px] md:min-w-0"
          style={{
            backgroundColor: themeSurface,
            borderColor: expandedSection === "budget" ? themePrimary : themeBorder,
          }}
        >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${themePrimary}15` }}
              >
                <Wallet size={20} style={{ color: themePrimary }} />
              </div>
              <h3
                className="text-lg font-serif"
                style={{ color: themePrimary }}
              >
                {useCyrillic ? "Буџет" : "Budget"}
              </h3>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: `${themeText}80` }}>
                  {useCyrillic ? "Планирано:" : "Planned:"}
                </span>
                <span className="text-sm font-semibold" style={{ color: themeText }}>
                  {formatCurrency(totalPlanned, currencyType)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: `${themeText}80` }}>
                  {useCyrillic ? "Потрошено:" : "Spent:"}
                </span>
                <span className="text-sm font-semibold" style={{ color: themeText }}>
                  {formatCurrency(totalSpent, currencyType)}
                </span>
              </div>
              <div
                className="pt-2 border-t flex justify-between"
                style={{ borderColor: themeBorder }}
              >
                <span className="text-xs font-semibold" style={{ color: themePrimary }}>
                  {useCyrillic ? "Преостало:" : "Remaining:"}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{
                    color: totalRemaining >= 0 ? themePrimary : "#dc2626",
                  }}
                >
                  {formatCurrency(totalRemaining, currencyType)}
                </span>
              </div>
            </div>

            <p className="text-xs" style={{ color: `${themeText}60` }}>
              {useCyrillic
                ? `${categories.length} категорија буџета`
                : `${categories.length} budget categories`}
            </p>
          </button>

        {/* Vendor Favorites */}
        <button
          onClick={() => toggleSection("vendors")}
          className="p-6 sm:p-8 rounded-2xl border text-left transition-all hover:border-opacity-100 flex-shrink-0 md:flex-shrink min-w-[280px] md:min-w-0"
          style={{
            backgroundColor: themeSurface,
            borderColor: expandedSection === "vendors" ? themePrimary : themeBorder,
          }}
        >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${themePrimary}15` }}
              >
                <Store size={20} style={{ color: themePrimary }} />
              </div>
              <h3
                className="text-lg font-serif"
                style={{ color: themePrimary }}
              >
                {useCyrillic ? "Продавци" : "Vendors"}
              </h3>
            </div>

            <div className="mb-4">
              <span className="text-2xl font-serif" style={{ color: themeText }}>
                {vendorFavorites.length}
              </span>
              <p className="text-xs mt-1" style={{ color: `${themeText}60` }}>
                {useCyrillic
                  ? `омиљених продаваца у плану`
                  : `favorite vendors saved`}
              </p>
            </div>

            <p className="text-xs" style={{ color: `${themeText}60` }}>
              {useCyrillic
                ? "Пронашли сте добре партнере!"
                : "You've found great partners!"}
            </p>
          </button>
      </div>

      {/* Expanded Details Sections */}
      {expandedSection === "checklist" && (
        <div className="mt-8">
          <h4 className="text-sm font-semibold mb-4" style={{ color: themePrimary }}>
            Checklist
          </h4>
          <div className="space-y-2">
            {GROUP_ORDER.map((group) => {
              const groupItems = checklist.filter((item) => item.group === group);
              if (groupItems.length === 0) return null;

              const isCollapsed = collapsedGroups[group] ?? false;
              const groupCompleted = groupItems.filter((i) => i.completed).length;

              return (
                <div
                  key={group}
                  className="border rounded-lg overflow-hidden"
                  style={{ borderColor: themeBorder }}
                >
                  <button
                    onClick={() =>
                      setCollapsedGroups((p) => ({ ...p, [group]: !isCollapsed }))
                    }
                    className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                    style={{
                      backgroundColor: `${themeSurface}80`,
                    }}
                  >
                    <span className="text-sm font-semibold" style={{ color: themeText }}>
                      {GROUP_LABELS[group]}
                      <span
                        className="ml-2 text-xs font-normal"
                        style={{ color: `${themeText}60` }}
                      >
                        {groupCompleted}/{groupItems.length}
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      style={{
                        color: `${themeText}60`,
                        transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)",
                        transition: "transform 0.3s",
                      }}
                    />
                  </button>

                  {!isCollapsed && (
                    <div
                      className="px-4 py-2 space-y-2"
                      style={{ backgroundColor: themeSurface }}
                    >
                      {groupItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            disabled
                            className="mt-1"
                            style={{ accentColor: themePrimary }}
                          />
                          <span
                            className="text-sm flex-1"
                            style={{
                              color: item.completed ? `${themeText}60` : themeText,
                              textDecoration: item.completed ? "line-through" : "none",
                            }}
                          >
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {expandedSection === "vendors" && (
        <div className="mt-8">
          <h4 className="text-sm font-semibold mb-4" style={{ color: themePrimary }}>
            Vendors
          </h4>
          {vendorFavorites.length === 0 ? (
            <p className="text-xs" style={{ color: `${themeText}60` }}>
              No favorite vendors saved yet.
            </p>
          ) : (
            <div className="space-y-2">
              {vendorFavorites.map((vendorId) => (
                <div
                  key={vendorId}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: `${themeSurface}80`,
                    borderLeft: `3px solid ${themePrimary}`,
                  }}
                >
                  <span className="text-sm" style={{ color: themeText }}>
                    {vendorId}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Budget Breakdown by Category */}
      {expandedSection === "budget" && categories.length > 0 && (
        <div className="mt-8">
          <h4
            className="text-sm font-semibold mb-4"
            style={{ color: themePrimary }}
          >
            {useCyrillic ? "По категоријама:" : "By category:"}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories
              .filter((cat) => cat.planned > 0 || cat.spent > 0)
              .sort((a, b) => b.planned - a.planned)
              .map((cat) => {
                const labels =
                  budgetCategoryLabels[cat.id] ||
                  budgetCategoryLabels[cat.name.toLowerCase().replace(/\s+/g, "-")];
                const label = labels
                  ? useCyrillic
                    ? labels.cyrillic
                    : labels.latin
                  : cat.name;

                const spent = cat.spent || 0;
                const planned = cat.planned || 0;
                const progress = planned > 0 ? (spent / planned) * 100 : 0;
                const remaining = planned - spent;

                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-xl border"
                    style={{
                      backgroundColor: `${themeSurface}80`,
                      borderColor: themeBorder,
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className="text-sm font-serif"
                        style={{ color: themeText }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: themePrimary }}
                      >
                        {Math.round(progress)}%
                      </span>
                    </div>

                    <div
                      className="h-1.5 rounded-full overflow-hidden mb-2"
                      style={{ backgroundColor: `${themePrimary}20` }}
                    >
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: themePrimary,
                        }}
                      />
                    </div>

                    <div className="text-xs space-y-0.5">
                      <div
                        className="flex justify-between"
                        style={{ color: `${themeText}80` }}
                      >
                        <span>{useCyrillic ? "Планирано:" : "Planned:"}</span>
                        <span>{formatCurrency(planned, currencyType)}</span>
                      </div>
                      <div
                        className="flex justify-between"
                        style={{ color: `${themeText}80` }}
                      >
                        <span>{useCyrillic ? "Потрошено:" : "Spent:"}</span>
                        <span>{formatCurrency(spent, currencyType)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
