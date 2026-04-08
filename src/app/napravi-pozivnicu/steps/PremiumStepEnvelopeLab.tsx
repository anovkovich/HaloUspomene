"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { EnvelopeItem } from "@/app/pozivnica/[slug]/types";

type ItemType = EnvelopeItem["type"];

interface PremiumStepEnvelopeLabProps {
  envelopeItems: EnvelopeItem[];
  envelopeStyle: "classic" | "wing";
  onItemsChange: (items: EnvelopeItem[]) => void;
  onStyleChange: (style: "classic" | "wing") => void;
}

const ITEM_DEFS: { type: ItemType; label: string; src: string }[] = [
  { type: "clover", label: "Detelina", src: "/images/premium/envelope-details/clover.webp" },
  { type: "dried_flower", label: "Suvo cveće", src: "/images/premium/envelope-details/dried-white-flower.webp" },
  { type: "champagne", label: "Šampanjac", src: "/images/premium/envelope-details/Champagne toast in vintage Polaroid.png" },
  { type: "boutonniere", label: "Butonjerka", src: "/images/premium/envelope-details/Rustic wedding boutonniere in Polaroid.png" },
  { type: "bouquet", label: "Buket", src: "/images/premium/envelope-details/Vintage Biedermeier-style wedding bouquet.png" },
  { type: "rings", label: "Burme", src: "/images/premium/envelope-details/Wedding rings on textured fabric.png" },
  { type: "tulips", label: "Lale", src: "/images/premium/envelope-details/a37bb0a0-62d9-4bfe-b52d-a69e6954687d.png" },
  { type: "roses", label: "Ruže", src: "/images/premium/envelope-details/835f4bca-7963-46d3-8245-6a615b27c997.png" },
  { type: "gold_bow", label: "Mašna", src: "/images/premium/envelope-details/1f06d143-7d86-402a-81cc-688836ff367a.png" },
];

// Predefined snap zones — 5 positions: sides + bottom arc
const SNAP_ZONES: { x: number; y: number; label: string }[] = [
  { x: 10, y: 50, label: "Levo" },
  { x: 25, y: 80, label: "Dole levo" },
  { x: 50, y: 88, label: "Dole centar" },
  { x: 75, y: 80, label: "Dole desno" },
  { x: 90, y: 50, label: "Desno" },
];

export default function PremiumStepEnvelopeLab({
  envelopeItems,
  envelopeStyle,
  onItemsChange,
  onStyleChange,
}: PremiumStepEnvelopeLabProps) {
  const [draggingItem, setDraggingItem] = useState<ItemType | null>(null);
  const [polaroidOpen, setPolaroidOpen] = useState(false);
  const envelopeRef = useRef<HTMLDivElement>(null);

  const getItemInZone = useCallback(
    (zone: number): EnvelopeItem | undefined => {
      return envelopeItems.find((item) => item.zone === zone);
    },
    [envelopeItems],
  );

  const getItemDef = (type: ItemType) =>
    ITEM_DEFS.find((d) => d.type === type)!;

  const isItemPlaced = useCallback(
    (type: ItemType): boolean => {
      return envelopeItems.some((item) => item.type === type);
    },
    [envelopeItems],
  );

  const handleZoneClick = (zoneIndex: number) => {
    if (!draggingItem) return;

    // Place item in zone (replace if zone occupied)
    const newItems = envelopeItems.filter(
      (item) => item.zone !== zoneIndex && item.type !== draggingItem,
    );
    newItems.push({ type: draggingItem, zone: zoneIndex });
    onItemsChange(newItems);
    setDraggingItem(null);
  };

  const removeItemFromZone = (zoneIndex: number) => {
    onItemsChange(envelopeItems.filter((item) => item.zone !== zoneIndex));
  };

  const handleItemBarClick = (type: ItemType) => {
    if (draggingItem === type) {
      setDraggingItem(null);
    } else {
      setDraggingItem(type);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h3 className="text-xl font-serif text-[#232323] mb-1">Envelope Lab</h3>
        <p className="text-sm text-[#8B7355]">
          Izaberite stil koverte i dekorativne elemente za otvaranje.
        </p>
      </div>

      {/* Envelope style switcher */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => onStyleChange("classic")}
          className={`flex-1 flex flex-col items-center justify-between gap-2 p-4 rounded-xl border-2 transition-all ${
            envelopeStyle === "classic"
              ? "border-[#d4af37] bg-[#d4af37]/5 shadow-md shadow-[#d4af37]/15"
              : "border-stone-200 hover:border-[#d4af37]/30"
          }`}
        >
          {/* Classic envelope mini icon */}
          <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
            <rect x="1" y="1" width="46" height="30" rx="2" fill="#f5ead6" stroke="#d4af37" strokeWidth="0.8" opacity="0.8" />
            <path d="M1 1 L24 18 L47 1" stroke="#d4af37" strokeWidth="0.8" fill="none" opacity="0.5" />
          </svg>
          <span className="text-xs font-medium text-[#232323]">Klasična</span>
        </button>
        <button
          type="button"
          onClick={() => onStyleChange("wing")}
          className={`flex-1 flex flex-col items-center justify-between gap-2 p-4 rounded-xl border-2 transition-all ${
            envelopeStyle === "wing"
              ? "border-[#d4af37] bg-[#d4af37]/5 shadow-md shadow-[#d4af37]/15"
              : "border-stone-200 hover:border-[#d4af37]/30"
          }`}
        >
          {/* Wing envelope mini icon */}
          <svg width="48" height="38" viewBox="0 0 48 48" fill="none">
            {/* White card base */}
            <rect x="2" y="2" width="44" height="44" rx="1" fill="white" stroke="#e8e0d0" strokeWidth="0.5"/>
            {/* Left wing — flat on outer left (x=2), semicircle curves inward to center */}
            <path d="M2 2 A22 22 0 0 1 2 46 Z" fill="#f0e8d8" stroke="#d4af37" strokeWidth="0.7"/>
            {/* Right wing — flat on outer right (x=46), semicircle curves inward to center */}
            <path d="M46 2 A22 22 0 0 0 46 46 Z" fill="#ede5d5" stroke="#d4af37" strokeWidth="0.7"/>
          </svg>
          <span className="text-xs font-medium text-[#232323]">Moderna</span>
        </button>
      </div>

      {/* Polaroid accordion */}
      <div className="border border-stone-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setPolaroidOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-stone-50 transition-colors"
        >
          <span className="text-sm font-medium text-[#232323]">
            Dodaj iskačuće polaroid slicice
          </span>
          <ChevronDown
            size={16}
            className={`text-[#8B7355] transition-transform duration-300 ${polaroidOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence initial={false}>
          {polaroidOpen && (
            <motion.div
              key="polaroid-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2">
                {/* Envelope preview */}
                <div
                  ref={envelopeRef}
                  className="relative w-full aspect-[4/3] mb-4"
                >
                  {/* Invitation card (center) */}
                  <div className="absolute top-[20%] left-[15%] right-[15%] bottom-[10%] bg-white/90 rounded-lg border border-stone-200/50 shadow-sm flex items-center justify-center">
                    <span className="text-xs text-stone-300 font-serif">Pozivnica</span>
                  </div>

                  {/* Snap zones */}
                  {SNAP_ZONES.map((zone, i) => {
                    const placed = getItemInZone(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          placed ? removeItemFromZone(i) : handleZoneClick(i)
                        }
                        className={`absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-xl transition-all ${
                          placed
                            ? "border-2 border-[#d4af37]/50 bg-[#d4af37]/10"
                            : draggingItem
                              ? "border-2 border-dashed border-[#d4af37]/60 bg-[#d4af37]/10 animate-pulse"
                              : "border-2 border-dashed border-stone-300/50"
                        }`}
                        style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                        title={placed ? `${getItemDef(placed.type).label} — kliknite za uklanjanje` : zone.label}
                      >
                        {placed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-full h-full p-1"
                          >
                            <img
                              src={getItemDef(placed.type).src}
                              alt={getItemDef(placed.type).label}
                              className="w-full h-full object-contain"
                            />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Items bar */}
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                  {ITEM_DEFS.map((item) => {
                    const placed = isItemPlaced(item.type);
                    const isSelected = draggingItem === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => handleItemBarClick(item.type)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all w-20 ${
                          isSelected
                            ? "border-[#d4af37] bg-[#d4af37]/10 shadow-md shadow-[#d4af37]/15"
                            : placed
                              ? "border-[#d4af37]/30 bg-[#d4af37]/5 opacity-60"
                              : "border-stone-200 hover:border-[#d4af37]/30"
                        }`}
                      >
                        <img
                          src={item.src}
                          alt={item.label}
                          className="w-10 h-10 object-contain"
                        />
                        <span className="text-[10px] text-[#8B7355] leading-tight text-center">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}

                </div>

                {draggingItem && (
                  <p className="text-xs text-[#d4af37] text-center mt-3 animate-pulse">
                    Kliknite na zonu na koverti da postavite &quot;{getItemDef(draggingItem).label}&quot;
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
