"use client";

import React, { useRef, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveBudgetAction } from "./actions";
import type { PortalBudget, BudgetCategory } from "./types";

interface Props {
  budget: PortalBudget;
  setBudget: React.Dispatch<React.SetStateAction<PortalBudget>>;
}

export default function BudgetCard({ budget, setBudget }: Props) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const totalPlanned = budget.categories.reduce((s, c) => s + c.planned, 0);
  const totalSpent = budget.categories.reduce((s, c) => s + c.spent, 0);
  const remaining = (budget.totalBudget || totalPlanned) - totalSpent;

  return (
    <div className="bg-white rounded-2xl border border-[#232323]/10 p-6 shadow-sm">
      <h3 className="font-serif text-lg text-[#232323] mb-4">Budžet</h3>

      {/* Total budget input */}
      <div className="mb-5">
        <label className="text-xs text-[#232323]/50 mb-1 block">
          Ukupan budžet (RSD)
        </label>
        <input
          type="number"
          value={budget.totalBudget || ""}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            updateBudget((prev) => ({ ...prev, totalBudget: val }));
          }}
          placeholder="npr. 1500000"
          className="input input-bordered w-full bg-white border-[#232323]/15 focus:border-[#AE343F] focus:outline-none"
        />
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {budget.categories.map((cat) => {
          const barPct =
            cat.planned > 0
              ? Math.min(100, (cat.spent / cat.planned) * 100)
              : 0;
          const isOver = cat.spent > cat.planned && cat.planned > 0;

          return (
            <div key={cat.id} className="group">
              <div className="flex items-center gap-2 mb-1.5">
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
                {cat.isCustom && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#232323]/30 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-1.5">
                <div>
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
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    className="input input-sm input-bordered w-full bg-white border-[#232323]/10 text-sm focus:border-[#AE343F] focus:outline-none"
                  />
                </div>
                <div>
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
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    className="input input-sm input-bordered w-full bg-white border-[#232323]/10 text-sm focus:border-[#AE343F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-[#232323]/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOver ? "bg-red-500" : "bg-[#AE343F]"
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
        className="btn btn-sm btn-ghost text-[#AE343F] mt-4 w-full"
      >
        <Plus size={16} />
        Dodaj kategoriju
      </button>

      {/* Summary */}
      <div className="mt-5 pt-4 border-t border-[#232323]/10 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-[#232323]/60">Ukupno planirano</span>
          <span className="font-medium text-[#232323]">
            {totalPlanned.toLocaleString("sr-RS")} RSD
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#232323]/60">Ukupno potrošeno</span>
          <span className="font-medium text-[#232323]">
            {totalSpent.toLocaleString("sr-RS")} RSD
          </span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-[#232323]">Preostalo</span>
          <span className={remaining < 0 ? "text-red-500" : "text-[#AE343F]"}>
            {remaining.toLocaleString("sr-RS")} RSD
          </span>
        </div>
      </div>
    </div>
  );
}
