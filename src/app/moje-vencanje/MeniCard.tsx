"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  UtensilsCrossed,
  Wine,
  Plus,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";
import { loadMeniAction, saveMeniAction } from "./actions";
import type { MeniData, MeniItem } from "@/app/pozivnica/[slug]/types";

const FOOD_CATS = [
  { v: "predjelo", l: "Predjelo" },
  { v: "glavno", l: "Glavno jelo" },
  { v: "desert", l: "Desert" },
  { v: "ostalo", l: "Ostalo" },
];
const DRINK_CATS = [
  { v: "alkoholno", l: "Alkoholno" },
  { v: "bezalkoholno", l: "Bezalkoholno" },
  { v: "toplo", l: "Topli napitak" },
  { v: "ostalo", l: "Ostalo" },
];

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type Which = "food" | "drinks";

function Section({
  title,
  icon,
  items,
  cats,
  onAdd,
  onUpdate,
  onRemove,
  addLabel,
}: {
  title: string;
  icon: React.ReactNode;
  items: MeniItem[];
  cats: { v: string; l: string }[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<MeniItem>) => void;
  onRemove: (id: string) => void;
  addLabel: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#232323]/10 p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-4 text-[#AE343F]">
        {icon}
        <h3 className="font-serif text-xl text-[#232323]">{title}</h3>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-[#232323]/50 mb-4">
          Još nema stavki. Dodajte prvu ispod.
        </p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-[#faf9f6] rounded-xl p-3 border border-[#232323]/8"
          >
            <input
              type="text"
              value={item.naziv}
              placeholder="Naziv (npr. Punjena teletina)"
              maxLength={80}
              onChange={(e) => onUpdate(item.id, { naziv: e.target.value })}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#232323]/12 text-sm text-[#232323] focus:outline-none focus:border-[#AE343F]"
            />
            <select
              value={item.kategorija}
              onChange={(e) => onUpdate(item.id, { kategorija: e.target.value })}
              className="px-3 py-2 rounded-lg border border-[#232323]/12 text-sm text-[#232323] bg-white focus:outline-none focus:border-[#AE343F] cursor-pointer"
            >
              {cats.map((c) => (
                <option key={c.v} value={c.v}>
                  {c.l}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={item.opis ?? ""}
              placeholder="Opis (opciono)"
              maxLength={120}
              onChange={(e) => onUpdate(item.id, { opis: e.target.value })}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#232323]/12 text-sm text-[#232323] focus:outline-none focus:border-[#AE343F]"
            />
            <button
              onClick={() => onRemove(item.id)}
              aria-label="Obriši stavku"
              className="shrink-0 self-end sm:self-auto p-2 rounded-lg text-[#232323]/40 hover:text-[#AE343F] hover:bg-[#AE343F]/8 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#AE343F] bg-[#AE343F]/8 hover:bg-[#AE343F]/14 transition-colors"
      >
        <Plus size={15} />
        {addLabel}
      </button>
    </div>
  );
}

export default function MeniCard() {
  const [food, setFood] = useState<MeniItem[]>([]);
  const [drinks, setDrinks] = useState<MeniItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    loadMeniAction().then((m) => {
      setFood(m?.food ?? []);
      setDrinks(m?.drinks ?? []);
      setLoading(false);
    });
  }, []);

  const setListFor = (which: Which) => (which === "food" ? setFood : setDrinks);

  const addItem = (which: Which) => {
    const item: MeniItem = {
      id: uid(),
      kategorija: which === "food" ? "predjelo" : "alkoholno",
      naziv: "",
      opis: "",
    };
    setListFor(which)((p) => [...p, item]);
    setDirty(true);
  };

  const updateItem = (which: Which, id: string, patch: Partial<MeniItem>) => {
    setListFor(which)((p) =>
      p.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
    setDirty(true);
  };

  const removeItem = (which: Which, id: string) => {
    setListFor(which)((p) => p.filter((it) => it.id !== id));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const cleanFood = food.filter((i) => i.naziv.trim());
    const cleanDrinks = drinks.filter((i) => i.naziv.trim());
    const payload: MeniData = {
      ...(cleanFood.length ? { food: cleanFood } : {}),
      ...(cleanDrinks.length ? { drinks: cleanDrinks } : {}),
    };
    const res = await saveMeniAction(payload);
    setSaving(false);
    if (res && "ok" in res && res.ok) {
      setFood(cleanFood);
      setDrinks(cleanDrinks);
      setDirty(false);
      toast.success("Meni je sačuvan");
    } else {
      toast.error((res && "error" in res && res.error) || "Greška pri čuvanju");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-[#AE343F]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#232323]">
            Meni
          </h2>
          <p className="text-sm text-[#232323]/60 mt-1 max-w-xl">
            Besplatan dodatak — dodajte jela i/ili pića. Gosti ih vide u „Meni”
            tabu kada skeniraju QR kod sa panoa dobrodošlice. Možete dodati samo
            piće, samo hranu, ili oboje.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#AE343F] hover:bg-[#8A2A32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Čuvanje…" : dirty ? "Sačuvaj meni" : "Sačuvano"}
        </button>
      </div>

      <Section
        title="Hrana"
        icon={<UtensilsCrossed size={20} />}
        items={food}
        cats={FOOD_CATS}
        onAdd={() => addItem("food")}
        onUpdate={(id, patch) => updateItem("food", id, patch)}
        onRemove={(id) => removeItem("food", id)}
        addLabel="Dodaj jelo"
      />

      <Section
        title="Piće"
        icon={<Wine size={20} />}
        items={drinks}
        cats={DRINK_CATS}
        onAdd={() => addItem("drinks")}
        onUpdate={(id, patch) => updateItem("drinks", id, patch)}
        onRemove={(id) => removeItem("drinks", id)}
        addLabel="Dodaj piće"
      />
    </div>
  );
}
