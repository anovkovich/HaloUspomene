"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Building2,
  Music,
  Camera,
  Cake,
  Sparkles,
  Flower2,
  Flame,
  TrainFrontTunnel,
  Palette,
  CircleDot,
  Gift,
  Heart,
} from "lucide-react";
import { saveVendorFavoritesAction } from "./actions";
import type { VendorCategory, VendorCategoryMeta, Vendor } from "./types";
import { VendorCard } from "./VendorCard";
import VendorDetailModal from "./VendorDetailModal";

const CATEGORY_ICONS: Record<VendorCategory, React.ReactNode> = {
  venue: <Building2 size={16} />,
  music: <Music size={16} />,
  "photo-video": <Camera size={16} />,
  cake: <Cake size={16} />,
  decoration: <Sparkles size={16} />,
  flowers: <Flower2 size={16} />,
  fireworks: <Flame size={16} />,
  dress: <TrainFrontTunnel size={16} />,
  makeup: <Palette size={16} />,
  rings: <CircleDot size={16} />,
  gifts: <Gift size={16} />,
};

// Fisher-Yates shuffle (returns new array)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Props {
  vendors: Vendor[];
  categories: VendorCategoryMeta[];
  cities: string[];
  favorites: string[];
  onFavoritesChange: React.Dispatch<React.SetStateAction<string[]>>;
  highlighted: string[];
  myEndorsements: string[];
  onEndorsementsChange: React.Dispatch<React.SetStateAction<string[]>>;
  onVendorsChange: React.Dispatch<React.SetStateAction<Vendor[]>>;
}

export default function VendorDirectory({
  vendors,
  categories,
  cities,
  favorites,
  onFavoritesChange,
  highlighted,
  myEndorsements,
  onEndorsementsChange,
  onVendorsChange,
}: Props) {
  const [selectedCategory, setSelectedCategory] =
    useState<VendorCategory | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const selectedVendor = selectedVendorId
    ? vendors.find((v) => v.id === selectedVendorId) ?? null
    : null;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Shuffle order: set once, stable across vendor data updates
  const shuffleOrderRef = useRef<string[] | null>(null);
  if (shuffleOrderRef.current === null && vendors.length > 0) {
    shuffleOrderRef.current = shuffle(vendors.map((v) => v.id));
  }
  // When new vendors are added (not in shuffle order), append them
  useEffect(() => {
    if (!shuffleOrderRef.current || vendors.length === 0) return;
    const existing = new Set(shuffleOrderRef.current);
    const newIds = vendors.filter((v) => !existing.has(v.id)).map((v) => v.id);
    if (newIds.length > 0) {
      shuffleOrderRef.current = [...shuffleOrderRef.current, ...shuffle(newIds)];
    }
  }, [vendors]);

  // Map vendors by ID for fast lookup, apply stable shuffle order
  const vendorMap = useMemo(() => {
    const m = new Map<string, Vendor>();
    vendors.forEach((v) => m.set(v.id, v));
    return m;
  }, [vendors]);

  const shuffledVendors = useMemo(() => {
    if (!shuffleOrderRef.current) return vendors;
    return shuffleOrderRef.current
      .map((id) => vendorMap.get(id))
      .filter(Boolean) as Vendor[];
  }, [vendorMap]);

  const debouncedSave = useCallback((updated: string[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveVendorFavoritesAction(updated);
    }, 500);
  }, []);

  const toggleFavorite = useCallback(
    (vendorId: string) => {
      onFavoritesChange((prev) => {
        const next = prev.includes(vendorId)
          ? prev.filter((id) => id !== vendorId)
          : [...prev, vendorId];
        debouncedSave(next);
        return next;
      });
    },
    [onFavoritesChange, debouncedSave],
  );

  const highlightedSet = useMemo(() => new Set(highlighted), [highlighted]);
  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);
  const endorsementsSet = useMemo(
    () => new Set(myEndorsements),
    [myEndorsements],
  );

  // Sort order: computed once from initial data, stable across endorsement changes
  const sortedOrderRef = useRef<string[] | null>(null);
  if (sortedOrderRef.current === null && shuffledVendors.length > 0) {
    const hl = shuffledVendors.filter((v) => highlightedSet.has(v.id));
    const rest = shuffledVendors.filter((v) => !highlightedSet.has(v.id));
    const endorsed = rest
      .filter((v) => (v.endorsementCount ?? 0) > 0)
      .sort((a, b) => (b.endorsementCount ?? 0) - (a.endorsementCount ?? 0));
    const withBio = rest.filter((v) => (v.endorsementCount ?? 0) === 0 && v.bio);
    const noBio = rest.filter((v) => (v.endorsementCount ?? 0) === 0 && !v.bio);
    sortedOrderRef.current = [...hl, ...endorsed, ...withBio, ...noBio].map((v) => v.id);
  }

  const filtered = useMemo(() => {
    if (!sortedOrderRef.current) return [];

    // Apply filters to the stable sorted order
    const categoryMatch = selectedCategory
      ? (v: Vendor) => v.category === selectedCategory
      : () => true;
    const cityMatch = selectedCity
      ? (v: Vendor) => v.city === selectedCity
      : () => true;
    const searchMatch = search.trim()
      ? (() => {
          const q = search.trim().toLowerCase();
          return (v: Vendor) => v.name.toLowerCase().includes(q);
        })()
      : () => true;

    return sortedOrderRef.current
      .map((id) => vendorMap.get(id))
      .filter(
        (v): v is Vendor =>
          !!v && categoryMatch(v) && cityMatch(v) && searchMatch(v),
      );
  }, [selectedCategory, selectedCity, search, vendorMap]);

  const favoriteVendors = useMemo(
    () =>
      favorites
        .map((id) => vendors.find((v) => v.id === id))
        .filter(Boolean) as Vendor[],
    [favorites, vendors],
  );

  const categoryLabel = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.labelPlural
    : null;

  return (
    <div className="bg-white rounded-2xl border border-[#232323]/10 p-4 sm:p-6 shadow-sm overflow-hidden">
      <h3 className="font-serif text-lg text-[#232323] mb-4">
        Vendori{categoryLabel ? ` — ${categoryLabel}` : ""}
      </h3>

      {/* Favorites row */}
      {favoriteVendors.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-[#AE343F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Heart size={12} fill="#AE343F" />
            Vaši favoriti ({favoriteVendors.length})
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x scrollbar-none -mx-4 sm:-mx-6 px-4 sm:px-6">
            <AnimatePresence mode="popLayout">
              {favoriteVendors.map((vendor) => (
                <motion.div
                  key={`fav-${vendor.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    transition: { duration: 0.15 },
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="snap-start shrink-0 w-[140px] border border-[#AE343F]/20 bg-[#AE343F]/3 rounded-xl p-3 relative"
                >
                  <button
                    onClick={() => toggleFavorite(vendor.id)}
                    className="absolute top-2 right-2 text-[#AE343F] cursor-pointer"
                    aria-label="Ukloni iz favorita"
                  >
                    <Heart size={14} fill="#AE343F" />
                  </button>
                  <div className="text-[#AE343F] mb-1">
                    {CATEGORY_ICONS[vendor.category]}
                  </div>
                  <p className="text-xs font-semibold text-[#232323] truncate">
                    {vendor.name}
                  </p>
                  <p className="text-[10px] text-[#232323]/40">{vendor.city}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Search + City filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#232323]/30"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži vendore..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#232323]/10 rounded-lg focus:border-[#AE343F] focus:outline-none transition-colors"
          />
        </div>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="select select-sm bg-white border-[#232323]/10 text-sm focus:border-[#AE343F] focus:outline-none h-[42px] w-full sm:w-auto sm:min-w-[150px]"
        >
          <option value="">Svi gradovi</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Category pills */}
      <div className="mb-5 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex gap-1.5 overflow-x-auto pb-1 snap-x scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`snap-start shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !selectedCategory
                ? "bg-[#AE343F] text-white"
                : "bg-[#232323]/5 text-[#232323]/60 hover:bg-[#232323]/10"
            }`}
          >
            Svi
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
              }
              className={`snap-start shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-[#AE343F] text-white"
                  : "bg-[#232323]/5 text-[#232323]/60 hover:bg-[#232323]/10"
              }`}
            >
              {CATEGORY_ICONS[cat.id]}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-[#232323]/40 mb-4">
        {filtered.length} {filtered.length === 1 ? "vendor" : "vendora"}
        {selectedCity && ` u gradu ${selectedCity}`}
      </p>

      {/* Vendor grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[#232323]/30">
          <p className="text-sm">Nema rezultata za ovu pretragu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              isFav={favoritesSet.has(vendor.id)}
              isHighlighted={highlightedSet.has(vendor.id)}
              categoryIcon={CATEGORY_ICONS[vendor.category]}
              onToggleFavorite={toggleFavorite}
              onSelect={(v) => setSelectedVendorId(v.id)}
            />
          ))}
        </div>
      )}

      <VendorDetailModal
        vendor={selectedVendor}
        isFav={selectedVendor ? favoritesSet.has(selectedVendor.id) : false}
        isEndorsed={
          selectedVendor ? endorsementsSet.has(selectedVendor.id) : false
        }
        onClose={() => setSelectedVendorId(null)}
        onToggleFavorite={toggleFavorite}
        onToggleEndorsement={onEndorsementsChange}
        onVendorsChange={onVendorsChange}
      />
    </div>
  );
}
