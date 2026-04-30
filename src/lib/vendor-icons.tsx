import React from "react";
import {
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
import type { VendorCategory } from "@/app/moje-vencanje/types";

export function categoryIcon(
  category: VendorCategory,
  size: number = 16,
): React.ReactNode {
  switch (category) {
    case "venue":
      return <Building2 size={size} />;
    case "music":
      return <Music size={size} />;
    case "photo-video":
      return <Camera size={size} />;
    case "cake":
      return <Cake size={size} />;
    case "decoration":
      return <Sparkles size={size} />;
    case "flowers":
      return <Flower2 size={size} />;
    case "fireworks":
      return <Flame size={size} />;
    case "dress":
      return <TrainFrontTunnel size={size} />;
    case "makeup":
      return <Palette size={size} />;
    case "rings":
      return <CircleDot size={size} />;
    case "gifts":
      return <Gift size={size} />;
  }
}
