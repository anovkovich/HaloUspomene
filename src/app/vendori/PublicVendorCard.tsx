"use client";

import React from "react";
import { MapPin } from "lucide-react";

interface Props {
  name: string;
  city: string;
  categoryIcon: React.ReactNode;
  onSelect: () => void;
}

function PublicVendorCardInner({
  name,
  city,
  categoryIcon,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="border border-[#232323]/20 hover:border-[#AE343F]/50 hover:shadow-md rounded-xl p-4 text-left transition-all w-full bg-white"
    >
      <p className="text-sm font-semibold text-[#232323] flex items-center gap-2">
        <span className="text-[#AE343F] shrink-0">{categoryIcon}</span>
        <span className="truncate">{name}</span>
      </p>
      <p className="text-xs text-[#232323]/60 mt-1.5 flex items-center gap-1">
        <MapPin size={11} />
        {city}
      </p>
    </button>
  );
}

export const PublicVendorCard = React.memo(PublicVendorCardInner);
