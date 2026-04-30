"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, MapPin, Lock, ArrowRight } from "lucide-react";
import type { PublicVendor } from "@/lib/vendors";

interface Props {
  vendor: PublicVendor | null;
  categoryLabel: string;
  categoryIcon: React.ReactNode;
  onClose: () => void;
}

export default function TeaserDrawer({
  vendor,
  categoryLabel,
  categoryIcon,
  onClose,
}: Props) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Lock body scroll, manage focus, listen for ESC while drawer is open.
  useEffect(() => {
    if (!vendor) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the close button on next tick (after motion mount)
    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [vendor, onClose]);

  const hasTeaser = Boolean(vendor?.bioTeaser?.trim());

  return (
    <AnimatePresence>
      {vendor && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Pregled vendora ${vendor.name}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed z-[71] left-1/2 -translate-x-1/2 bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Close */}
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Zatvori"
              className="absolute top-3 right-3 p-2 text-[#232323]/50 hover:text-[#AE343F] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AE343F] rounded-full"
            >
              <X size={20} />
            </button>

            <div className="p-6 pt-7">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3 pr-8">
                <span className="text-[#AE343F] shrink-0 mt-0.5">
                  {categoryIcon}
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif text-xl text-[#232323] truncate">
                    {vendor.name}
                  </h3>
                  <p className="text-xs text-[#232323]/60 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} />
                      {vendor.city}
                    </span>
                    <span className="text-[#232323]/30">·</span>
                    <span>{categoryLabel}</span>
                  </p>
                </div>
              </div>

              {/* Bio teaser — clean truncation with fade-to-white at bottom.
                  Pattern: Medium / Substack paywall reveal.
                  - Server-side truncated to 2 sentences (no leak via DOM)
                  - line-clamp-3 caps visual height
                  - Fade overlay hides cutoff edge & any line-clamp ellipsis
                  - No fake/blurred placeholder text — lock card below
                    carries the "more behind" signal */}
              {hasTeaser && (
                <div className="mt-4 mb-5 relative">
                  <p className="text-sm text-[#232323]/85 leading-relaxed line-clamp-2">
                    {vendor.bioTeaser}
                  </p>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent via-white/50 to-white"
                  />
                </div>
              )}

              {/* Locked features list */}
              <div className="bg-[#F5F4DC]/50 border border-[#232323]/10 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-[#232323] mb-2 flex items-center gap-1.5">
                  <Lock size={12} className="text-[#AE343F]" />
                  Dostupno posle besplatne registracije
                </p>
                <ul className="text-xs text-[#232323]/70 space-y-1">
                  <li>· Kompletan opis i detalji</li>
                  <li>· Telefon, sajt, Instagram vendora</li>
                  <li>· Preporuke parova (endorsement sistem)</li>
                  <li>· Dodavanje u omiljene</li>
                </ul>
              </div>

              {/* CTAs */}
              <Link
                href="/moje-vencanje"
                onClick={onClose}
                className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] rounded-xl w-full border-none flex items-center justify-center gap-2 min-h-[48px]"
              >
                Otključaj u Moje Venčanje
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
