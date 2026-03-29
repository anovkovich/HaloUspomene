"use client";

import React, { useState, useRef, useCallback } from "react";
import { Plus, Trash2, Banknote, Euro } from "lucide-react";
import { saveBudgetAction } from "./actions";
import type { PortalBudget, BudgetCategory } from "./types";

const EUR_RATE = 117.5;

interface Props {
  budget: PortalBudget;
  setBudget: React.Dispatch<React.SetStateAction<PortalBudget>>;
}

function formatK(value: number): string {
  if (value === 0) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs < 1000) return `${sign}${abs.toLocaleString("sr-RS")}`;
  const k = abs / 1000;
  return `${sign}${k < 10 ? k.toFixed(1) : k.toFixed(0)}K`;
}

function toRSD(value: number, currency?: "RSD" | "EUR"): number {
  return currency === "EUR" ? value * EUR_RATE : value;
}

export default function BudgetCard({ budget, setBudget }: Props) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const debouncedSave = useCallback((updated: PortalBudget) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveBudgetAction(updated);
    }, 300);
  }, []);

  const updateBudget = useCallback(
    (fn: (prev: PortalBudget) => PortalBudget) => {
      setBudget((prev) => {
        const next = fn(prev);
        debouncedSave(next);
        return next;
      });
    },
    [setBudget, debouncedSave]
  );

  const updateCategory = useCallback(
    (id: string, field: keyof Pick<BudgetCategory, "name" | "planned" | "spent">, value: string | number) => {
      updateBudget((prev) => ({
        ...prev,
        categories: prev.categories.map((c) =>
          c.id === id ? { ...c, [field]: value } : c
        ),
      }));
    },
    [updateBudget]
  );

  const toggleCurrency = useCallback(
    (id: string) => {
      updateBudget((prev) => ({
        ...prev,
        categories: prev.categories.map((c) => {
          if (c.id !== id) return c;
          const from = c.currency ?? "RSD";
          const to = from === "RSD" ? "EUR" : "RSD";
          const planned =
            from === "RSD"
              ? Math.round((c.planned / EUR_RATE) * 10) / 10
              : Math.round(c.planned * EUR_RATE * 10) / 10;
          const spent =
            from === "RSD"
              ? Math.round((c.spent / EUR_RATE) * 10) / 10
              : Math.round(c.spent * EUR_RATE * 10) / 10;
          return { ...c, currency: to, planned, spent };
        }),
      }));
    },
    [updateBudget]
  );

  const addCategory = useCallback(() => {
    updateBudget((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: "",
          planned: 0,
          spent: 0,
          isCustom: true,
        },
      ],
    }));
  }, [updateBudget]);

  const deleteCategory = useCallback(
    (id: string) => {
      updateBudget((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.id !== id),
      }));
    },
    [updateBudget]
  );

  const toggleTotalCurrency = useCallback(() => {
    updateBudget((prev) => {
      const from = prev.totalBudgetCurrency ?? "RSD";
      const to = from === "RSD" ? "EUR" : "RSD";
      const converted =
        from === "RSD"
          ? Math.round((prev.totalBudget / EUR_RATE) * 10) / 10
          : Math.round(prev.totalBudget * EUR_RATE * 10) / 10;
      return { ...prev, totalBudget: converted, totalBudgetCurrency: to };
    });
  }, [updateBudget]);

  // All sums converted to RSD
  const totalBudgetRSD = toRSD(budget.totalBudget, budget.totalBudgetCurrency);
  const totalPlanned = budget.categories.reduce((s, c) => s + toRSD(c.planned, c.currency), 0);
  const totalSpent = budget.categories.reduce((s, c) => s + toRSD(c.spent, c.currency), 0);
  const remaining = (totalBudgetRSD || totalPlanned) - totalSpent;
  const totalCurr = budget.totalBudgetCurrency ?? "RSD";

  return (
    <div className="bg-white rounded-2xl border border-[#232323]/10 p-6 shadow-sm">
      <h3 className="font-serif text-lg text-[#232323] mb-4">Budžet</h3>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-[#232323]/40 mb-0.5">Planirano</p>
          <p className="text-sm font-bold text-[#232323]">
            {formatK(totalCurr === "EUR" ? totalPlanned / EUR_RATE : totalPlanned)} <span className="text-[10px] font-normal text-[#232323]/30">{totalCurr}</span>
          </p>
        </div>
        <div className="rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-[#232323]/40 mb-0.5">Potrošeno</p>
          <p className="text-sm font-bold text-[#232323]">
            {formatK(totalCurr === "EUR" ? totalSpent / EUR_RATE : totalSpent)} <span className="text-[10px] font-normal text-[#232323]/30">{totalCurr}</span>
          </p>
        </div>
        <div className="rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-[#232323]/40 mb-0.5">Preostalo</p>
          <p className={`text-sm font-bold ${remaining < 0 ? "text-red-500" : "text-green-600"}`}>
            {formatK(totalCurr === "EUR" ? remaining / EUR_RATE : remaining)} <span className="text-[10px] font-normal text-[#232323]/30">{totalCurr}</span>
          </p>
        </div>
      </div>

      {/* Total budget input */}
      <div className="mb-5">
        <label className="text-xs text-[#232323]/50 mb-1 block">
          Ukupan budžet ({totalCurr})
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={budget.totalBudget || ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              updateBudget((prev) => ({ ...prev, totalBudget: val }));
            }}
            placeholder={totalCurr === "EUR" ? "npr. 12500" : "npr. 1500000"}
            step={totalCurr === "EUR" ? "0.1" : "1"}
            className="input input-bordered flex-1 bg-white border-[#232323]/15 focus:border-[#AE343F] focus:outline-none"
          />
          <button
            onClick={toggleTotalCurrency}
            className="shrink-0 px-3 rounded-lg border border-[#232323]/10 text-[#232323]/40 hover:text-[#AE343F] hover:border-[#AE343F]/30 transition-colors cursor-pointer"
            title={`Prebaci na ${totalCurr === "RSD" ? "EUR" : "RSD"}`}
          >
            {totalCurr === "RSD" ? <Banknote size={18} /> : <Euro size={18} />}
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {budget.categories.map((cat) => {
          const barPct =
            cat.planned > 0
              ? Math.min(100, (cat.spent / cat.planned) * 100)
              : 0;
          const isOver = cat.spent > cat.planned && cat.planned > 0;
          const hasValues = cat.planned > 0 || cat.spent > 0;
          const curr = cat.currency ?? "RSD";

          return (
            <div key={cat.id} className="border border-[#232323]/8 rounded-xl p-3.5 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 mb-2">
                {cat.isCustom ? (
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) =>
                      updateCategory(cat.id, "name", e.target.value)
                    }
                    placeholder="Naziv kategorije"
                    className="input input-sm input-bordered flex-1 bg-white border-[#232323]/10 text-sm font-medium focus:border-[#AE343F] focus:outline-none"
                  />
                ) : (
                  <span className="text-sm font-medium text-[#232323] flex-1">
                    {cat.name}
                  </span>
                )}
                <span className="text-[10px] text-[#232323]/30 shrink-0">{curr}</span>
                <button
                  onClick={() => {
                    if (hasValues) return;
                    if (confirmDeleteId === cat.id) {
                      deleteCategory(cat.id);
                      setConfirmDeleteId(null);
                    } else {
                      setConfirmDeleteId(cat.id);
                      setTimeout(() => setConfirmDeleteId((c) => c === cat.id ? null : c), 3000);
                    }
                  }}
                  disabled={hasValues}
                  className={`shrink-0 transition-all cursor-pointer p-0.5 ${
                    hasValues
                      ? "text-[#232323]/10 cursor-not-allowed"
                      : confirmDeleteId === cat.id
                      ? "text-red-500 scale-110"
                      : "text-[#232323]/30 hover:text-red-500"
                  }`}
                  title={hasValues ? "Obrišite vrednosti pre uklanjanja" : confirmDeleteId === cat.id ? "Klikni ponovo za brisanje" : "Ukloni kategoriju"}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex gap-2 mb-1.5 items-end">
                <div className="flex-1">
                  <label className="text-[10px] text-[#232323]/40 mb-0.5 block">
                    Planirano
                  </label>
                  <input
                    type="number"
                    value={cat.planned || ""}
                    onChange={(e) =>
                      updateCategory(
                        cat.id,
                        "planned",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    step={curr === "EUR" ? "0.1" : "1"}
                    className="input input-sm input-bordered w-full bg-white border-[#232323]/10 text-sm focus:border-[#AE343F] focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => toggleCurrency(cat.id)}
                  className="shrink-0 mb-0.5 p-1.5 rounded-lg border border-[#232323]/10 text-[#232323]/40 hover:text-[#AE343F] hover:border-[#AE343F]/30 transition-colors cursor-pointer"
                  title={`Prebaci na ${curr === "RSD" ? "EUR" : "RSD"}`}
                >
                  {curr === "RSD" ? <Banknote size={14} /> : <Euro size={14} />}
                </button>
                <div className="flex-1">
                  <label className="text-[10px] text-[#232323]/40 mb-0.5 block">
                    Potrošeno
                  </label>
                  <input
                    type="number"
                    value={cat.spent || ""}
                    onChange={(e) =>
                      updateCategory(
                        cat.id,
                        "spent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    step={curr === "EUR" ? "0.1" : "1"}
                    className="input input-sm input-bordered w-full bg-white border-[#232323]/10 text-sm focus:border-[#AE343F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Progress bar */}
              <div className={`h-2 rounded-full overflow-hidden ${isOver ? "bg-red-500/15" : "bg-[#AE343F]/8"}`}>
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOver
                      ? "bg-red-500"
                      : barPct >= 90
                        ? "bg-[#d4af37]"
                        : "bg-[#AE343F]"
                  }`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add category */}
      <button
        onClick={addCategory}
        className="btn btn-sm text-[#AE343F] border border-[#AE343F]/20 bg-transparent hover:bg-[#AE343F]/5 mt-4 w-full cursor-pointer"
      >
        <Plus size={16} />
        Dodaj kategoriju
      </button>
    </div>
  );
}
