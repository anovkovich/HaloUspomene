"use client";

import { Sparkles, Lock, Phone, Mail } from "lucide-react";
import { formatPrice, getPremiumPrice } from "@/data/pricing";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";

export default function PremiumLockedScreen({
  slug,
  data,
}: {
  slug: string;
  data: WeddingData;
}) {
  const { bride, groom } = data.couple_names;

  return (
    <div className="min-h-screen bg-[#fffdf5] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Blurred preview hint */}
        <div className="relative mb-8 rounded-3xl overflow-hidden border border-[#d4af37]/20 shadow-lg">
          <div className="aspect-[3/4] bg-gradient-to-b from-[#d4af37]/10 to-[#fffdf5] blur-sm scale-105 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-serif text-[#d4af37]/40">
                {bride} & {groom}
              </p>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-[#d4af37]" />
              </div>
              <h1 className="text-2xl font-serif text-[#232323] mb-2">
                Premium pozivnica zaključana
              </h1>
              <p className="text-sm text-[#8B7355] mb-6">
                Preview period je istekao. Platite da otključate vašu premium
                pozivnicu.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#c5a028] text-white font-medium text-sm shadow-lg shadow-[#d4af37]/25 mb-4">
                <Sparkles size={16} />
                {formatPrice(getPremiumPrice())}
              </div>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-3">
          <a
            href="tel:+381600000000"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#d4af37]/30 text-[#d4af37] text-sm font-medium hover:bg-[#d4af37]/5 transition-all"
          >
            <Phone size={16} />
            Pozovite nas
          </a>
          <a
            href="mailto:halouspomene@gmail.com"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-stone-200 text-[#8B7355] text-sm font-medium hover:border-[#d4af37]/30 transition-all"
          >
            <Mail size={16} />
            halouspomene@gmail.com
          </a>
          <p className="text-xs text-stone-400 mt-4">
            Već ste platili? Kontaktirajte nas da vam otključamo pozivnicu.
          </p>
        </div>
      </div>
    </div>
  );
}
