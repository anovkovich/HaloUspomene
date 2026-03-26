import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Phone,
  Globe,
  Instagram,
  MapPin,
  Heart,
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
} from "lucide-react";
import type { VendorCategory, Vendor } from "./types";
import { toggleEndorsementAction } from "./actions";
import EndorsementBadge from "./EndorsementBadge";

const CATEGORY_ICONS: Record<VendorCategory, React.ReactNode> = {
  venue: <Building2 size={20} />,
  music: <Music size={20} />,
  "photo-video": <Camera size={20} />,
  cake: <Cake size={20} />,
  decoration: <Sparkles size={20} />,
  flowers: <Flower2 size={20} />,
  fireworks: <Flame size={20} />,
  dress: <TrainFrontTunnel size={20} />,
  makeup: <Palette size={20} />,
  rings: <CircleDot size={20} />,
  gifts: <Gift size={20} />,
};

const CATEGORY_LABELS: Record<VendorCategory, string> = {
  venue: "Sala",
  music: "Muzika",
  "photo-video": "Foto/Video",
  cake: "Torta",
  decoration: "Dekoracija",
  flowers: "Cveće",
  fireworks: "Vatromet/Efekti",
  dress: "Venčanica",
  makeup: "Šminka",
  rings: "Burme",
  gifts: "Pokloni",
};

interface Props {
  vendor: Vendor | null;
  isFav: boolean;
  isEndorsed: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onToggleEndorsement: React.Dispatch<React.SetStateAction<string[]>>;
  onVendorsChange: React.Dispatch<React.SetStateAction<Vendor[]>>;
}

export default function VendorDetailModal({
  vendor,
  isFav,
  isEndorsed,
  onClose,
  onToggleFavorite,
  onToggleEndorsement,
  onVendorsChange,
}: Props) {
  const [faviconLoaded, setFaviconLoaded] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  // Reset favicon state when vendor changes
  useEffect(() => {
    setFaviconLoaded(false);
    setFaviconError(false);
  }, [vendor?.id]);

  // Escape key + body scroll lock
  useEffect(() => {
    if (!vendor) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [vendor, onClose]);

  const showFavicon = vendor?.website && faviconLoaded && !faviconError;

  return (
    <AnimatePresence>
      {vendor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 pt-[10vh]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hidden favicon probe */}
            {vendor.website && !faviconError && (
              <img
                src={`https://www.google.com/s2/favicons?domain=${vendor.website}&sz=64`}
                alt=""
                className="hidden"
                onLoad={() => setFaviconLoaded(true)}
                onError={() => setFaviconError(true)}
              />
            )}

            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-[#232323]/5 px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                {showFavicon ? (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${vendor.website}&sz=64`}
                    alt=""
                    width={24}
                    height={24}
                    className="rounded-sm shrink-0"
                  />
                ) : (
                  <span className="text-[#AE343F] shrink-0">
                    {CATEGORY_ICONS[vendor.category]}
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="text-base font-serif font-semibold text-[#232323] truncate">
                    {vendor.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 bg-[#232323]/5 rounded-full text-[10px] text-[#232323]/50">
                      {CATEGORY_LABELS[vendor.category]}
                    </span>
                    {vendor.musicType && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-[#232323]/5 rounded-full text-[10px] text-[#232323]/50">
                        {vendor.musicType}
                      </span>
                    )}
                    {vendor.serviceType && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-[#232323]/5 rounded-full text-[10px] text-[#232323]/50">
                        {vendor.serviceType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onToggleFavorite(vendor.id)}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    isFav
                      ? "text-[#AE343F]"
                      : "text-[#232323]/20 hover:text-[#AE343F]/50"
                  }`}
                  aria-label={
                    isFav ? "Ukloni iz favorita" : "Dodaj u favorite"
                  }
                >
                  <Heart size={18} fill={isFav ? "#AE343F" : "none"} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-[#232323]/30 hover:text-[#232323]/60 hover:bg-[#232323]/5 transition-colors cursor-pointer"
                  aria-label="Zatvori"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              {/* City */}
              <div className="flex items-center gap-1.5 text-sm text-[#232323]/60">
                <MapPin size={14} />
                {vendor.city}
              </div>

              {/* Bio */}
              <p className="text-sm leading-relaxed" style={{ color: vendor.bio ? "rgba(35,35,35,0.7)" : "rgba(35,35,35,0.35)" }}>
                {vendor.bio || "Ovaj vendor trenutno nema opis — slobodno ih kontaktirajte putem kontakata ispod."}
              </p>

              {/* Capacity (venues only — musicType/serviceType moved to header chips) */}
              {vendor.capacity && (
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#232323]/5 rounded-full text-xs text-[#232323]/60">
                    Br. mesta: {vendor.capacity}
                  </span>
                </div>
              )}

              {/* Endorsement */}
              <div className="flex items-center justify-between py-2 border-t border-b border-[#232323]/5">
                <EndorsementBadge
                  count={vendor.endorsementCount ?? 0}
                  size="md"
                />
                <button
                  onClick={async () => {
                    if (!vendor) return;
                    const wasEndorsed = isEndorsed;
                    const delta = wasEndorsed ? -1 : 1;
                    // Optimistic update endorsements list
                    onToggleEndorsement((prev) =>
                      wasEndorsed
                        ? prev.filter((id) => id !== vendor.id)
                        : [...prev, vendor.id],
                    );
                    // Optimistic update vendor endorsementCount
                    onVendorsChange((prev) =>
                      prev.map((v) =>
                        v.id === vendor.id
                          ? { ...v, endorsementCount: (v.endorsementCount ?? 0) + delta }
                          : v,
                      ),
                    );
                    const result = await toggleEndorsementAction(vendor.id);
                    if ("error" in result) {
                      // Revert both
                      onToggleEndorsement((prev) =>
                        wasEndorsed
                          ? [...prev, vendor.id]
                          : prev.filter((id) => id !== vendor.id),
                      );
                      onVendorsChange((prev) =>
                        prev.map((v) =>
                          v.id === vendor.id
                            ? { ...v, endorsementCount: (v.endorsementCount ?? 0) - delta }
                            : v,
                        ),
                      );
                    }
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    isEndorsed
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "bg-[#232323]/5 text-[#232323]/50 hover:bg-[#232323]/10"
                  }`}
                >
                  {isEndorsed ? "✓ Vaša preporuka" : "◈ Preporuči"}
                </button>
              </div>

              {/* Contact buttons */}
              <div className="space-y-2 pt-2">
                {/* Phone + Website row */}
                <div className="flex gap-2">
                  {vendor.phone ? (
                    <a
                      href={`tel:${vendor.phone.replace(/\s/g, "")}`}
                      className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl bg-[#AE343F] text-white text-sm font-medium hover:bg-[#AE343F]/90 transition-colors"
                    >
                      <Phone size={15} />
                      Pozovi
                    </a>
                  ) : (
                    <span className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl bg-[#232323]/8 text-[#232323]/25 text-sm font-medium cursor-default select-none">
                      <Phone size={15} />
                      Pozovi
                    </span>
                  )}
                  {vendor.website ? (
                    <a
                      href={`https://${vendor.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl bg-[#232323] text-white text-sm font-medium hover:bg-[#232323]/85 transition-colors"
                    >
                      <Globe size={15} />
                      Sajt
                    </a>
                  ) : (
                    <span className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl bg-[#232323]/8 text-[#232323]/25 text-sm font-medium cursor-default select-none">
                      <Globe size={15} />
                      Sajt
                    </span>
                  )}
                </div>

                {/* Instagram */}
                {vendor.instagram ? (
                  <a
                    href={`https://instagram.com/${vendor.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Instagram size={15} />
                    {vendor.instagram}
                  </a>
                ) : (
                  <span className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#232323]/8 text-[#232323]/25 text-sm font-medium cursor-default select-none">
                    <Instagram size={15} />
                    Instagram
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
