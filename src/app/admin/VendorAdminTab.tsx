"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Star,
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
  MapPin,
  Check,
} from "lucide-react";
import { CITIES, CATEGORY_META } from "@/app/moje-vencanje/vendor-constants";
import {
  loadHighlightedVendorsAction,
  setHighlightedVendorsAction,
  loadVendorsAction,
} from "@/app/moje-vencanje/actions";
import type { VendorCategory, Vendor, VendorCategoryMeta } from "@/app/moje-vencanje/types";

const CATEGORY_ICONS: Record<VendorCategory, React.ReactNode> = {
  venue: <Building2 size={14} />,
  music: <Music size={14} />,
  "photo-video": <Camera size={14} />,
  cake: <Cake size={14} />,
  decoration: <Sparkles size={14} />,
  flowers: <Flower2 size={14} />,
  fireworks: <Flame size={14} />,
  dress: <TrainFrontTunnel size={14} />,
  makeup: <Palette size={14} />,
  rings: <CircleDot size={14} />,
  gifts: <Gift size={14} />,
};

export default function VendorAdminTab() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<VendorCategoryMeta[]>([]);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | null>(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([loadHighlightedVendorsAction(), loadVendorsAction()]).then(
      ([ids, vendorData]) => {
        setHighlighted(new Set(ids));
        setVendors(vendorData.vendors);
        setCategoryCounts(vendorData.categories);
        setLoading(false);
      },
    );
  }, []);

  const filtered = useMemo(() => {
    let result = vendors;
    if (selectedCategory) result = result.filter((v) => v.category === selectedCategory);
    if (selectedCity) result = result.filter((v) => v.city === selectedCity);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((v) => v.name.toLowerCase().includes(q));
    }
    return result;
  }, [selectedCategory, selectedCity, search]);

  function toggleHighlight(id: string) {
    setHighlighted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    await setHighlightedVendorsAction(Array.from(highlighted));
    setSaving(false);
  }

  if (loading) return <p className="text-white/40">Učitavanje vendora...</p>;

  const highlightedVendors = vendors.filter((v) => highlighted.has(v.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">
          Vendori — Preporučeni ({highlighted.size})
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#b8972e] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Check size={16} />
          {saving ? "Čuvam..." : "Sačuvaj"}
        </button>
      </div>

      {/* Currently highlighted */}
      {highlightedVendors.length > 0 && (
        <div className="mb-6 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Star size={12} fill="#d4af37" />
            Trenutno preporučeni
          </p>
          <div className="flex flex-wrap gap-2">
            {highlightedVendors.map((v) => (
              <button
                key={`hl-${v.id}`}
                onClick={() => toggleHighlight(v.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37]/20 border border-[#d4af37]/30 rounded-full text-xs text-white/80 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-colors cursor-pointer"
              >
                {CATEGORY_ICONS[v.category]}
                {v.name}
                <span className="text-white/30">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži vendore..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/25 focus:border-[#d4af37] focus:outline-none transition-colors"
          />
        </div>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 px-3 py-2 focus:border-[#d4af37] focus:outline-none"
        >
          <option value="">Svi gradovi</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            !selectedCategory
              ? "bg-[#d4af37] text-white"
              : "bg-white/5 text-white/40 hover:text-white/60"
          }`}
        >
          Sve ({vendors.length})
        </button>
        {categoryCounts.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-[#d4af37] text-white"
                : "bg-white/5 text-white/40 hover:text-white/60"
            }`}
          >
            {CATEGORY_ICONS[cat.id]}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="text-xs text-white/30 mb-3">
        {filtered.length} vendora{selectedCity && ` u gradu ${selectedCity}`}
      </p>

      <div className="space-y-1">
        {filtered.map((vendor) => {
          const isHl = highlighted.has(vendor.id);
          return (
            <button
              key={vendor.id}
              onClick={() => toggleHighlight(vendor.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left cursor-pointer ${
                isHl
                  ? "bg-[#d4af37]/15 border border-[#d4af37]/30"
                  : "bg-white/3 border border-transparent hover:bg-white/5"
              }`}
            >
              <Star
                size={16}
                fill={isHl ? "#d4af37" : "none"}
                className={isHl ? "text-[#d4af37] shrink-0" : "text-white/15 shrink-0"}
              />
              <span className="text-white/30 shrink-0">{CATEGORY_ICONS[vendor.category]}</span>
              <span className={`text-sm flex-1 truncate ${isHl ? "text-white font-medium" : "text-white/60"}`}>
                {vendor.name}
              </span>
              <span className="text-[10px] text-white/25 flex items-center gap-1 shrink-0">
                <MapPin size={9} />
                {vendor.city}
              </span>
              {vendor.website && (
                <span className="text-[10px] text-white/20 shrink-0 hidden sm:block">
                  {vendor.website}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
