import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Globe,
  Instagram,
  MapPin,
  Heart,
} from "lucide-react";
import type { Vendor } from "./types";
import EndorsementBadge from "./EndorsementBadge";

interface VendorCardProps {
  vendor: Vendor;
  isFav: boolean;
  isHighlighted: boolean;
  categoryIcon: React.ReactNode;
  onToggleFavorite: (id: string) => void;
  onSelect: (vendor: Vendor) => void;
}

function VendorCardInner({
  vendor,
  isFav,
  isHighlighted,
  categoryIcon,
  onToggleFavorite,
  onSelect,
}: VendorCardProps) {
  return (
    <div
      onClick={() => onSelect(vendor)}
      className={`border rounded-xl p-4 hover:shadow-sm transition-all overflow-hidden relative cursor-pointer ${
        isHighlighted
          ? "border-[#d4af37]/50 bg-gradient-to-br from-[#d4af37]/5 to-[#d4af37]/10 ring-1 ring-[#d4af37]/25 shadow-[0_0_12px_rgba(212,175,55,0.08)]"
          : "border-[#232323]/8 hover:border-[#AE343F]/20"
      }`}
    >
      {/* Heart button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(vendor.id);
        }}
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

      <div className="mb-2 pr-6">
        <p className="text-sm font-semibold text-[#232323] truncate flex items-center gap-1.5">
          <span className="text-[#AE343F] shrink-0">{categoryIcon}</span>
          {vendor.name}
          <EndorsementBadge count={vendor.endorsementCount ?? 0} />
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

      {/* Bio (truncated to 1 line) */}
      <p className={`text-[10px] line-clamp-1 mb-2 ${vendor.bio ? "text-[#232323]/45" : "text-[#232323]/20"}`}>
        {vendor.bio || "-"}
      </p>

      {/* Contact labels (display only — clickable in modal) */}
      <div className="flex flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1 text-[10px] cursor-default select-none ${vendor.phone ? "text-[#232323]/50" : "text-[#232323]/20"}`}>
          <Phone size={11} /> Pozovi
        </span>
        <span className={`inline-flex items-center gap-1 text-[10px] cursor-default select-none ${vendor.website ? "text-[#232323]/50" : "text-[#232323]/20"}`}>
          <Globe size={11} /> Sajt
        </span>
        <span className={`inline-flex items-center gap-1 text-[10px] cursor-default select-none ${vendor.instagram ? "text-[#232323]/50" : "text-[#232323]/20"}`}>
          <Instagram size={11} /> IG
        </span>
      </div>
    </div>
  );
}

export const VendorCard = React.memo(VendorCardInner);
