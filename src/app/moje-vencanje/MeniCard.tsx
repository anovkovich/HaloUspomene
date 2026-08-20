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
  QrCode,
} from "lucide-react";
import { loadMeniAction, saveMeniAction } from "./actions";
import InfoTooltip from "@/components/ui/InfoTooltip";
import type { MeniData, MeniItem } from "@/app/pozivnica/[slug]/types";

interface MeniCardProps {
  /** Data actions default to the couple namespace; the standalone owner portal
   *  passes seating-scoped equivalents. */
  loadAction?: typeof loadMeniAction;
  saveAction?: typeof saveMeniAction;
  /** Overrides the description under the heading. The default below names the
   *  pano dobrodošlice, which is the only route to a wedding menu; products
   *  where a second QR also reaches it pass their own wording. */
  description?: string;
}

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

export default function MeniCard({
  loadAction = loadMeniAction,
  saveAction = saveMeniAction,
  description,
}: MeniCardProps = {}) {
  const [food, setFood] = useState<MeniItem[]>([]);
  const [drinks, setDrinks] = useState<MeniItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  /** Shown after a save: the menu is stored, but guests still need a QR code to
   *  reach it. Explained here rather than in the toast because it is the one
   *  thing that decides whether the menu is ever seen. */
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => {
    loadAction().then((m) => {
      setFood(m?.food ?? []);
      setDrinks(m?.drinks ?? []);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const res = await saveAction(payload);
    setSaving(false);
    if (res && "ok" in res && res.ok) {
      setFood(cleanFood);
      setDrinks(cleanDrinks);
      setDirty(false);
      setSavedNote(true);
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
            {description ?? (
              <>
                Besplatan dodatak — dodajte jela i/ili pića. Gosti ih vide u
                „Meni” tabu kada skeniraju QR kod sa{" "}
                <InfoTooltip label="panoa dobrodošlice">
                  <span className="mb-2 block font-medium text-[#232323]">
                    Šta je QR pano dobrodošlice
                  </span>
                  Tabla koju stavite na ulaz u salu. Gost je skenira telefonom i
                  odmah vidi za kojim stolom sedi, plan cele sale i vaš meni —
                  bez aplikacije i bez registracije.
                  <span className="mt-2 block">
                    „Gde sedim” radi zato što ste goste rasporedili našim alatom
                    za raspored sedenja — bez rasporeda pano nema šta da pokaže.
                  </span>
                  <span className="mt-2 block">
                    Isti QR kod ne mora da stoji samo na panou: možete ga
                    odštampati i na zahvalnicama na stolovima.
                  </span>
                </InfoTooltip>
                {". Možete dodati samo piće, samo hranu, ili oboje."}
              </>
            )}
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

      {savedNote && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#d4af37]/40 bg-[#F5F4DC]/50 p-4">
          <QrCode size={16} className="mt-0.5 shrink-0 text-[#d4af37]" />
          <div className="text-sm text-[#232323]/80">
            <p className="mb-1 font-medium text-[#232323]">
              Sačuvano — a evo kako meni stiže do gostiju
            </p>
            <p className="leading-relaxed">
              Do menija se dolazi isključivo skeniranjem QR koda — sa panoa
              dobrodošlice na ulazu ili sa zahvalnice na stolu. Ako već koristite
              raspored sedenja, galeriju ili audio knjigu, QR koji delite
              gostima sam prikazuje i meni, bez ijednog dodatnog koda. Ako
              nijedno od toga nije aktivirano, meni je sačuvan i čeka vas ovde,
              ali gosti još nemaju odakle da ga otvore.
            </p>
            <button
              type="button"
              onClick={() => setSavedNote(false)}
              className="mt-2 cursor-pointer text-xs text-[#232323]/50 underline transition-colors hover:text-[#232323]/75"
            >
              U redu, razumem
            </button>
          </div>
        </div>
      )}

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
