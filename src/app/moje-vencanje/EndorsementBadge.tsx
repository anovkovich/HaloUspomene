import React from "react";
import { getEndorsementLevel } from "./types";

interface Props {
  count: number;
  size?: "sm" | "md";
}

const LEVELS = [
  { icon: "◇", label: "Novi", color: "text-[#232323]/30" },
  { icon: "◈", label: "Verifikovan", color: "text-[#232323]/50" },
  { icon: "💎", label: "Preporučen", color: "text-blue-500" },
  { icon: "👑", label: "Top preporuka", color: "text-[#d4af37]" },
];

export default function EndorsementBadge({ count, size = "sm" }: Props) {
  const level = getEndorsementLevel(count);
  const { icon, label, color } = LEVELS[level];

  if (size === "sm") {
    return (
      <span className={`${color} text-[10px] shrink-0`} title={label}>
        {icon}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${color} bg-[#232323]/5`}
    >
      {icon} {label}
    </span>
  );
}
