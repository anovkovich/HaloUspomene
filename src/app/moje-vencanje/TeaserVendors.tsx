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
  ArrowRight,
} from "lucide-react";
import { VENDOR_CATEGORIES } from "./vendors";
import type { VendorCategory } from "./types";

const CATEGORY_ICONS: Record<VendorCategory, React.ReactNode> = {
  venue: <Building2 size={22} />,
  music: <Music size={22} />,
  "photo-video": <Camera size={22} />,
  cake: <Cake size={22} />,
  decoration: <Sparkles size={22} />,
  flowers: <Flower2 size={22} />,
  fireworks: <Flame size={22} />,
  dress: <TrainFrontTunnel size={22} />,
  makeup: <Palette size={22} />,
  rings: <CircleDot size={22} />,
  gifts: <Gift size={22} />,
};

export default function TeaserVendors() {
  return (
    <div className="mb-8">
      <h3 className="font-serif text-lg text-[#232323] mb-3 flex items-center gap-2">
        <Sparkles size={18} className="text-[#AE343F]" />
        Vendori DEMO
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none">
        {VENDOR_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="snap-start shrink-0 w-36 bg-white rounded-xl border border-[#232323]/10 p-4 flex flex-col items-center gap-2 text-center shadow-sm"
          >
            <div className="text-[#AE343F]">{CATEGORY_ICONS[cat.id]}</div>
            <p className="text-sm font-semibold text-[#232323] leading-tight">
              {cat.labelPlural}
            </p>
            <p className="text-xs text-[#232323]/40">{cat.count} vendora</p>
          </div>
        ))}
        {/* CTA card */}
        <div className="snap-start shrink-0 w-36 bg-[#AE343F]/5 rounded-xl border border-[#AE343F]/20 p-4 flex flex-col items-center justify-center gap-2 text-center">
          <ArrowRight size={20} className="text-[#AE343F]" />
          <p className="text-xs font-semibold text-[#AE343F]">
            Prijavite se za pun pristup
          </p>
        </div>
      </div>
    </div>
  );
}
