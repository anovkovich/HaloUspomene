"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import type { PremiumThemeType } from "@/app/pozivnica/[slug]/types";

interface PremiumStepAIPhotoProps {
  premiumTheme: PremiumThemeType | "";
  premiumCity: string;
  premiumCar: string;
  coupleDescription: string;
  aiCoupleImageUrl: string;
  bride: string;
  groom: string;
  onThemeChange: (theme: PremiumThemeType) => void;
  onCityChange: (city: string) => void;
  onCarChange: (car: string) => void;
  onDescriptionChange: (desc: string) => void;
  onImageGenerated: (url: string) => void;
}

const LOADING_MESSAGES = [
  "Kreiramo vašu ilustraciju...",
  "Dodajemo magiju...",
  "Primenjujemo stil...",
  "Skoro gotovo...",
];

const THEMES: {
  id: PremiumThemeType;
  name: string;
  subtitle: string;
  features: string[];
  preview: string;
}[] = [
  {
    id: "watercolor",
    name: "Luxury Romance",
    subtitle: "Birane ilustracije i luksuz na najvišem nivou",
    features: ["Akvarel pozadina", "Retro automobil", "Parallax efekat"],
    preview: "/images/premium/watercolor-invitation/backgrounds/Grand-palace.png",
  },
  {
    id: "line_art",
    name: "Modern Parallax",
    subtitle: "Vaša AI ilustracija i parallax papirni svet",
    features: ["AI portret para", "Line art stil", "Paper parallax"],
    preview: "/images/premium/themes/line-art-preview.webp",
  },
];

const CITIES = [
  { id: "grand_palace", label: "Grand Palace", img: "/images/premium/watercolor-invitation/backgrounds/Grand-palace.png" },
];

const CARS = [
  { id: "old_mercedes", label: "Old Mercedes", img: "/images/premium/watercolor-invitation/cars/Old-Mercedes.png" },
  { id: "mercedes_190_sl", label: "Mercedes 190 SL", img: "/images/premium/watercolor-invitation/cars/Mercedes-190-SL.png" },
  { id: "new_rolls_royce", label: "Rolls Royce", img: "/images/premium/watercolor-invitation/cars/New-Rolls-Royce.png" },
  { id: "old_rolls_royce", label: "Old Rolls Royce", img: "/images/premium/watercolor-invitation/cars/Old-Rolls-Royce.png" },
  { id: "vw_beetle", label: "VW Buba", img: "/images/premium/watercolor-invitation/cars/VW-Beetle.png" },
];

function ScrollableCards({
  items,
  selected,
  onSelect,
  label,
  imageMode = "cover",
}: {
  items: { id: string; label: string; img?: string }[];
  selected: string;
  onSelect: (id: string) => void;
  label: string;
  imageMode?: "cover" | "contain";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B7355]">{label}</p>
        <div className="flex gap-1">
          <button type="button" onClick={() => scroll("left")} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400">
            <ChevronLeft size={16} />
          </button>
          <button type="button" onClick={() => scroll("right")} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`relative shrink-0 w-24 h-20 rounded-xl border-2 flex flex-col items-center justify-end gap-1 overflow-hidden transition-all ${
              selected === item.id
                ? "border-[#d4af37] shadow-md shadow-[#d4af37]/15"
                : "border-stone-200 hover:border-[#d4af37]/30"
            }`}
            style={{ scrollSnapAlign: "start" }}
          >
            {item.img ? (
              <img
                src={item.img}
                alt={item.label}
                className={`absolute inset-0 w-full h-full ${imageMode === "contain" ? "object-contain p-1" : "object-cover"}`}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {selected === item.id && (
              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#d4af37] flex items-center justify-center z-10">
                <Check size={12} className="text-white" />
              </div>
            )}
            <span className="relative z-10 text-[11px] font-medium text-white text-center leading-tight px-1 pb-2 drop-shadow-md">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Structured couple description builder ──────────────────────────────────

const BRIDE_HAIR_COLOR = [
  { value: "blonde", label: "Plava" },
  { value: "brown", label: "Smeđa" },
  { value: "black", label: "Crna" },
  { value: "red", label: "Crvena" },
  { value: "auburn", label: "Kestenjasta" },
];
const BRIDE_HAIR_STYLE = [
  { value: "long straight", label: "Duga ravna" },
  { value: "long wavy", label: "Duga talasasta" },
  { value: "long curly", label: "Duga kovrdžava" },
  { value: "medium length", label: "Srednje dužine" },
  { value: "short", label: "Kratka" },
  { value: "updo bun", label: "Punđa" },
];
const GROOM_HAIR_COLOR = [
  { value: "blonde", label: "Plava" },
  { value: "brown", label: "Smeđa" },
  { value: "black", label: "Crna" },
  { value: "dark brown", label: "Tamnosmeđa" },
  { value: "gray", label: "Seda" },
];
const GROOM_LOOK = [
  { value: "short neat hair, clean shaven", label: "Kratka kosa, obrijan" },
  { value: "short neat hair, short beard", label: "Kratka kosa, kratka brada" },
  { value: "short neat hair, full beard", label: "Kratka kosa, puna brada" },
  { value: "short textured hair, clean shaven", label: "Moderna frizura, obrijan" },
  { value: "short textured hair, stubble", label: "Moderna frizura, neobrijana" },
  { value: "short textured hair, short beard", label: "Moderna frizura, kratka brada" },
  { value: "slicked back hair, clean shaven", label: "Začešljana kosa, obrijan" },
  { value: "slicked back hair, beard", label: "Začešljana kosa, brada" },
  { value: "curly short hair, clean shaven", label: "Kovrdžava, obrijan" },
  { value: "curly short hair, beard", label: "Kovrdžava, brada" },
  { value: "bald, clean shaven", label: "Ćelav, obrijan" },
  { value: "bald, beard", label: "Ćelav, brada" },
  { value: "short hair, mustache", label: "Kratka kosa, brkovi" },
];

function DescSelect({ label, options, value, onChange }: {
  label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#8B7355]/60 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-[#232323] focus:outline-none focus:border-[#d4af37]/50 transition-colors appearance-none cursor-pointer"
      >
        <option value="">— izaberi —</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function CoupleDescriptionBuilder({ value, onChange }: { value: string; onChange: (desc: string) => void }) {
  const [bhc, setBhc] = useState("");
  const [bhs, setBhs] = useState("");
  const [ghc, setGhc] = useState("");
  const [gl, setGl] = useState("");

  const build = (a: string, b: string, c: string, d: string) => {
    const parts: string[] = [];
    if (a || b) parts.push(`bride with ${[b, a].filter(Boolean).join(" ")} hair`);
    if (c || d) {
      const gp = [];
      if (c) gp.push(`${c} hair`);
      if (d) gp.push(d);
      parts.push(`groom with ${gp.join(", ")}`);
    }
    return parts.join(", ");
  };

  const set = (field: string, val: string) => {
    const n = { bhc: field === "bhc" ? val : bhc, bhs: field === "bhs" ? val : bhs, ghc: field === "ghc" ? val : ghc, gl: field === "gl" ? val : gl };
    if (field === "bhc") setBhc(val);
    if (field === "bhs") setBhs(val);
    if (field === "ghc") setGhc(val);
    if (field === "gl") setGl(val);
    onChange(build(n.bhc, n.bhs, n.ghc, n.gl));
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#d4af37]/5 rounded-2xl p-4 border border-[#d4af37]/10">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#d4af37] mb-3">Mlada</p>
        <div className="grid grid-cols-2 gap-3">
          <DescSelect label="Boja kose" options={BRIDE_HAIR_COLOR} value={bhc} onChange={(v) => set("bhc", v)} />
          <DescSelect label="Frizura" options={BRIDE_HAIR_STYLE} value={bhs} onChange={(v) => set("bhs", v)} />
        </div>
      </div>
      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8B7355] mb-3">Mladoženja</p>
        <div className="grid grid-cols-2 gap-3">
          <DescSelect label="Boja kose" options={GROOM_HAIR_COLOR} value={ghc} onChange={(v) => set("ghc", v)} />
          <DescSelect label="Frizura i brada" options={GROOM_LOOK} value={gl} onChange={(v) => set("gl", v)} />
        </div>
      </div>
    </div>
  );
}

export default function PremiumStepAIPhoto({
  premiumTheme,
  premiumCity,
  premiumCar,
  coupleDescription,
  aiCoupleImageUrl,
  bride,
  groom,
  onThemeChange,
  onCityChange,
  onCarChange,
  onDescriptionChange,
  onImageGenerated,
}: PremiumStepAIPhotoProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [generationCount, setGenerationCount] = useState(0);
  const [limitResetTime, setLimitResetTime] = useState<string | null>(null);
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const MAX_GENERATIONS = 5;
  const TTL_HOURS = 20;

  // localStorage key based on couple name
  const cacheKey = `premium_gen_${bride.toLowerCase()}_${groom.toLowerCase()}`;

  // Load cached state on mount
  React.useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return;
      const data = JSON.parse(cached);
      const expiresAt = new Date(data.expiresAt).getTime();
      if (Date.now() > expiresAt) {
        // Expired — clear and start fresh
        localStorage.removeItem(cacheKey);
        return;
      }
      if (data.count) setGenerationCount(data.count);
      if (data.images?.length) {
        setImageHistory(data.images);
        // Restore last selected image if none is set
        if (!aiCoupleImageUrl && data.images.length > 0) {
          onImageGenerated(data.images[data.images.length - 1]);
        }
      }
      setLimitResetTime(data.expiresAt);
    } catch {}
  }, [cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to localStorage whenever count or history changes
  const saveCache = React.useCallback(
    (count: number, images: string[]) => {
      try {
        const existing = localStorage.getItem(cacheKey);
        let expiresAt: string;
        if (existing) {
          const parsed = JSON.parse(existing);
          expiresAt = parsed.expiresAt;
        } else {
          expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000).toISOString();
        }
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ count, images, expiresAt }),
        );
        setLimitResetTime(expiresAt);
      } catch {}
    },
    [cacheKey],
  );

  React.useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!coupleDescription.trim()) return;
    if (generationCount >= MAX_GENERATIONS) {
      setShowLimitPopup(true);
      return;
    }
    if (aiCoupleImageUrl && !imageHistory.includes(aiCoupleImageUrl)) {
      setImageHistory((prev) => [...prev, aiCoupleImageUrl]);
    }
    setIsGenerating(true);
    setGenerationError("");
    setLoadingMsgIndex(0);
    try {
      const res = await fetch("/api/premium-pozivnica/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: "line_art",
          coupleDescription: coupleDescription.trim(),
          bride,
          groom,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      onImageGenerated(data.resultUrl);
      const newHistory = imageHistory.includes(data.resultUrl)
        ? imageHistory
        : [...imageHistory, data.resultUrl];
      const newCount = generationCount + 1;
      setImageHistory(newHistory);
      setGenerationCount(newCount);
      saveCache(newCount, newHistory);
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Greška pri generisanju.");
    } finally {
      setIsGenerating(false);
    }
  };
  // Format remaining time for limit popup
  const formatResetTime = () => {
    if (!limitResetTime) return "";
    const diff = new Date(limitResetTime).getTime() - Date.now();
    if (diff <= 0) return "uskoro";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `za ${hours}h ${mins}min`;
    return `za ${mins} minuta`;
  };

  return (
    <div>
      {/* Limit reached popup */}
      {showLimitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowLimitPopup(false)} />
          <motion.div
            className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl border border-[#d4af37]/30"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <button type="button" onClick={() => setShowLimitPopup(false)} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 text-lg">✕</button>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-[#d4af37]" />
              </div>
              <h3 className="text-lg font-serif text-[#232323] mb-2">
                Iskorišćeno svih {MAX_GENERATIONS} pokušaja
              </h3>
              <p className="text-sm text-[#8B7355] mb-1">
                Limit se resetuje {formatResetTime()}.
              </p>
              <p className="text-xs text-[#8B7355]/60">
                Možete izabrati neku od prethodno generisanih verzija.
              </p>
            </div>
          </motion.div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-serif text-[#232323] mb-1">
          Kakvu premium pozivnicu želite?
        </h3>
        <p className="text-sm text-[#8B7355]">
          Izaberite stil koji najbolje odgovara vašem venčanju.
        </p>
      </div>

      {/* Theme selection */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        {THEMES.map((theme) => {
          const isSelected = premiumTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onThemeChange(theme.id)}
              className={`relative rounded-2xl border-2 text-left transition-all overflow-hidden ${
                isSelected
                  ? "border-[#d4af37] shadow-lg shadow-[#d4af37]/20"
                  : "border-stone-200 hover:border-[#d4af37]/40"
              }`}
            >
              {/* Preview image */}
              <div className="relative w-full h-20 overflow-hidden">
                <img
                  src={theme.preview}
                  alt={theme.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#d4af37] flex items-center justify-center shadow-lg">
                    <Check size={14} className="text-white" />
                  </div>
                )}
                <p className="absolute bottom-2 left-3 right-3 text-sm font-bold text-white drop-shadow-lg leading-tight">
                  {theme.name}
                </p>
              </div>
              {/* Details */}
              <div className="p-3">
                <p className="text-[11px] text-[#8B7355]">{theme.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Conditional content based on theme */}
      {premiumTheme === "watercolor" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent mb-6" />
          <ScrollableCards
            items={CITIES}
            selected={premiumCity}
            onSelect={onCityChange}
            label="Izaberite pozadinu"
          />
          <ScrollableCards
            items={CARS}
            selected={premiumCar}
            onSelect={onCarChange}
            label="Izaberite vozilo"
            imageMode="contain"
          />
        </motion.div>
      )}

      {premiumTheme === "line_art" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent mb-2" />
          <CoupleDescriptionBuilder
            value={coupleDescription}
            onChange={onDescriptionChange}
          />

          {/* Generate / Regenerate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !coupleDescription.trim() || generationCount >= MAX_GENERATIONS}
            className="w-full flex items-center justify-center gap-2 mt-4 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#c5a028] text-white font-medium text-sm shadow-lg shadow-[#d4af37]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {LOADING_MESSAGES[loadingMsgIndex]}
              </>
            ) : aiCoupleImageUrl ? (
              <>
                <RefreshCw size={16} />
                Generiši ponovo
                <span className="ml-1 text-xs opacity-70">({generationCount}/{MAX_GENERATIONS})</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generiši ilustraciju
              </>
            )}
          </button>
          {generationCount >= MAX_GENERATIONS && (
            <p className="text-[10px] text-[#8B7355]/60 text-center mt-1">Iskorišćeno svih {MAX_GENERATIONS} pokušaja</p>
          )}

          {generationError && (
            <p className="text-xs text-red-500 mt-2 text-center">{generationError}</p>
          )}

          {/* Image version tabs — always show when there's at least one image */}
          {aiCoupleImageUrl && !isGenerating && (() => {
            // Build full list: history + current (deduplicated)
            const allImages = [...imageHistory];
            if (!allImages.includes(aiCoupleImageUrl)) allImages.push(aiCoupleImageUrl);
            return (
              <div className="mt-3">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onImageGenerated(url)}
                      className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        url === aiCoupleImageUrl
                          ? "border-[#d4af37] shadow-md shadow-[#d4af37]/20"
                          : "border-stone-200 hover:border-[#d4af37]/40"
                      }`}
                    >
                      <img src={url} alt={`Verzija ${i + 1}`} className="w-full h-full object-cover" style={{ mixBlendMode: "multiply" }} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Loading skeleton */}
          {isGenerating && !aiCoupleImageUrl && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-[#d4af37]/20">
              <div className="w-full h-64 bg-gradient-to-r from-[#d4af37]/5 via-[#d4af37]/10 to-[#d4af37]/5 animate-pulse flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37] animate-spin mx-auto mb-3" />
                  <p className="text-xs text-[#8B7355]">15-60 sekundi</p>
                </div>
              </div>
            </div>
          )}

          {/* Image preview */}
          {aiCoupleImageUrl && (
            <motion.div
              className="mt-4 rounded-2xl overflow-hidden border border-[#d4af37]/20 bg-white"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isGenerating ? (
                <div className="w-full h-64 bg-gradient-to-r from-[#d4af37]/5 via-[#d4af37]/10 to-[#d4af37]/5 animate-pulse flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 size={28} className="mx-auto text-[#d4af37] animate-spin mb-3" />
                    <p className="text-sm text-[#8B7355]">{LOADING_MESSAGES[loadingMsgIndex]}</p>
                  </div>
                </div>
              ) : (
                <img
                  src={aiCoupleImageUrl}
                  alt="AI ilustracija para"
                  className="max-h-96 mx-auto"
                  style={{ mixBlendMode: "multiply", backgroundColor: "#ffffff" }}
                />
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
