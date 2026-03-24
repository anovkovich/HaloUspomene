"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Phone,
  Globe,
  Instagram,
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
  MapPin,
  Heart,
} from "lucide-react";
import { VENDORS, VENDOR_CATEGORIES, CITIES } from "./vendors";
import { saveVendorFavoritesAction } from "./actions";
import type { VendorCategory, Vendor } from "./types";

// Shuffle once at module load (VENDORS is static)
const SHUFFLED_VENDORS = [...VENDORS];
for (let i = SHUFFLED_VENDORS.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [SHUFFLED_VENDORS[i], SHUFFLED_VENDORS[j]] = [
    SHUFFLED_VENDORS[j],
    SHUFFLED_VENDORS[i],
  ];
}

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

interface Props {
  favorites: string[];
  onFavoritesChange: React.Dispatch<React.SetStateAction<string[]>>;
  highlighted: string[];
}

export default function VendorDirectory({
  favorites,
  onFavoritesChange,
  highlighted,
}: Props) {
  const [selectedCategory, setSelectedCategory] =
    useState<VendorCategory | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [search, setSearch] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const filtered = useMemo(() => {
    let result = SHUFFLED_VENDORS;
    if (selectedCategory)
      result = result.filter((v) => v.category === selectedCategory);
    if (selectedCity) result = result.filter((v) => v.city === selectedCity);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((v) => v.name.toLowerCase().includes(q));
    }
    const hl = result.filter((v) => highlightedSet.has(v.id));
    const rest = result.filter((v) => !highlightedSet.has(v.id));
    return [...hl, ...rest];
  }, [
    selectedCategory,
    selectedCity,
    search,
    SHUFFLED_VENDORS,
    highlightedSet,
  ]);

  const favoriteVendors = useMemo(
    () =>
      favorites
        .map((id) => VENDORS.find((v) => v.id === id))
        .filter(Boolean) as Vendor[],
    [favorites],
  );

  const categoryLabel = selectedCategory
    ? VENDOR_CATEGORIES.find((c) => c.id === selectedCategory)?.labelPlural
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
          {CITIES.map((city) => (
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
          {VENDOR_CATEGORIES.map((cat) => (
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
          {filtered.map((vendor) => {
            const isFav = favoritesSet.has(vendor.id);
            const isHighlighted = highlightedSet.has(vendor.id);

            return (
              <div
                key={vendor.id}
                className={`border rounded-xl p-4 hover:shadow-sm transition-all overflow-hidden relative ${
                  isHighlighted
                    ? "border-[#d4af37]/50 bg-gradient-to-br from-[#d4af37]/5 to-[#d4af37]/10 ring-1 ring-[#d4af37]/25 shadow-[0_0_12px_rgba(212,175,55,0.08)]"
                    : "border-[#232323]/8 hover:border-[#AE343F]/20"
                }`}
              >
                {/* Heart button */}
                <motion.button
                  onClick={() => toggleFavorite(vendor.id)}
                  whileTap={{ scale: 1.4 }}
                  animate={isFav ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute top-3 right-3 cursor-pointer transition-colors ${
                    isFav
                      ? "text-[#AE343F]"
                      : "text-[#232323]/15 hover:text-[#AE343F]/50"
                  }`}
                  aria-label={isFav ? "Ukloni iz favorita" : "Dodaj u favorite"}
                >
                  <Heart size={18} fill={isFav ? "#AE343F" : "none"} />
                </motion.button>

                <div className="mb-3 pr-6">
                  <p className="text-sm font-semibold text-[#232323] truncate flex items-center gap-1.5">
                    <span className="text-[#AE343F] shrink-0">
                      {CATEGORY_ICONS[vendor.category]}
                    </span>
                    {vendor.name}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <p className="text-xs text-[#232323]/40 flex items-center gap-1">
                      <MapPin size={10} />
                      {vendor.city}
                    </p>
                    {vendor.capacity && (
                      <span className="text-xs text-[#232323]/40">
                        · Br. mesta: {vendor.capacity}
                      </span>
                    )}
                    {vendor.musicType && (
                      <span className="text-xs text-[#232323]/40">
                        · {vendor.musicType}
                      </span>
                    )}
                    {vendor.serviceType && (
                      <span className="text-xs text-[#232323]/40">
                        · {vendor.serviceType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact links */}
                <div className="flex flex-wrap gap-2">
                  {vendor.phone ? (
                    <a
                      href={`tel:${vendor.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1 text-[10px] text-[#232323]/50 hover:text-[#AE343F] transition-colors"
                    >
                      <Phone size={11} /> Pozovi
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#232323]/20 cursor-default select-none">
                      <Phone size={11} /> Pozovi
                    </span>
                  )}
                  {vendor.website ? (
                    <a
                      href={`https://${vendor.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-[#232323]/50 hover:text-[#AE343F] transition-colors"
                    >
                      <Globe size={11} /> Sajt
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#232323]/20 cursor-default select-none">
                      <Globe size={11} /> Sajt
                    </span>
                  )}
                  {vendor.instagram ? (
                    <a
                      href={`https://instagram.com/${vendor.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-[#232323]/50 hover:text-[#AE343F] transition-colors"
                    >
                      <Instagram size={11} /> IG
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#232323]/20 cursor-default select-none">
                      <Instagram size={11} /> IG
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
