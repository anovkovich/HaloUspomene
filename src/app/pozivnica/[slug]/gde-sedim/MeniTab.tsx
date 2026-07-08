"use client";

import React from "react";
import { UtensilsCrossed, Wine } from "lucide-react";
import type { MeniData, MeniItem } from "../types";

const FOOD_ORDER = ["predjelo", "glavno", "desert", "ostalo"];
const DRINK_ORDER = ["alkoholno", "bezalkoholno", "toplo", "ostalo"];

function labels(cyr: boolean) {
  return cyr
    ? {
        food: "Храна",
        drinks: "Пиће",
        foodCats: {
          predjelo: "Предјела",
          glavno: "Главна јела",
          desert: "Десерти",
          ostalo: "Остало",
        } as Record<string, string>,
        drinkCats: {
          alkoholno: "Алкохолна пића",
          bezalkoholno: "Безалкохолна пића",
          toplo: "Топли напици",
          ostalo: "Остало",
        } as Record<string, string>,
      }
    : {
        food: "Hrana",
        drinks: "Piće",
        foodCats: {
          predjelo: "Predjela",
          glavno: "Glavna jela",
          desert: "Deserti",
          ostalo: "Ostalo",
        } as Record<string, string>,
        drinkCats: {
          alkoholno: "Alkoholna pića",
          bezalkoholno: "Bezalkoholna pića",
          toplo: "Topli napici",
          ostalo: "Ostalo",
        } as Record<string, string>,
      };
}

function Group({
  items,
  order,
  catLabels,
}: {
  items: MeniItem[];
  order: string[];
  catLabels: Record<string, string>;
}) {
  // Any item whose kategorija isn't in the known order falls into "ostalo".
  const cats = [...order];
  return (
    <>
      {cats.map((cat) => {
        const catItems = items.filter((i) =>
          cat === "ostalo"
            ? !order.slice(0, -1).includes(i.kategorija)
            : i.kategorija === cat,
        );
        if (catItems.length === 0) return null;
        return (
          <div key={cat} className="mb-7">
            <p
              className="font-raleway text-[10px] uppercase tracking-[0.25em] mb-3 text-center"
              style={{ color: "var(--theme-text-light)" }}
            >
              {catLabels[cat] ?? cat}
            </p>
            <ul className="space-y-3">
              {catItems.map((item) => (
                <li key={item.id} className="text-center">
                  <p
                    className="font-serif text-lg leading-snug"
                    style={{ color: "var(--theme-text)" }}
                  >
                    {item.naziv}
                  </p>
                  {item.opis && (
                    <p
                      className="font-raleway text-sm mt-0.5"
                      style={{ color: "var(--theme-text-muted)" }}
                    >
                      {item.opis}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <div
        className="h-px w-8"
        style={{ backgroundColor: "var(--theme-border)" }}
      />
      <span
        className="inline-flex items-center gap-2 font-script text-2xl"
        style={{ color: "var(--theme-primary)" }}
      >
        {icon}
        {title}
      </span>
      <div
        className="h-px w-8"
        style={{ backgroundColor: "var(--theme-border)" }}
      />
    </div>
  );
}

export default function MeniTab({
  meni,
  useCyrillic,
}: {
  meni: MeniData;
  useCyrillic: boolean;
}) {
  const L = labels(useCyrillic);
  const food = meni.food ?? [];
  const drinks = meni.drinks ?? [];

  return (
    <div>
      {food.length > 0 && (
        <section className="mb-12">
          <SectionHeader icon={<UtensilsCrossed size={18} />} title={L.food} />
          <Group items={food} order={FOOD_ORDER} catLabels={L.foodCats} />
        </section>
      )}
      {drinks.length > 0 && (
        <section>
          <SectionHeader icon={<Wine size={18} />} title={L.drinks} />
          <Group items={drinks} order={DRINK_ORDER} catLabels={L.drinkCats} />
        </section>
      )}
    </div>
  );
}
