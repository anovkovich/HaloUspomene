"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import QuickStartForm from "@/app/planiranje-vencanja/QuickStartForm";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function QuickRegisterModal({ open, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = setTimeout(() => closeBtnRef.current?.focus(), 50);
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
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Brza registracija — Moje Venčanje"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed z-[81] left-1/2 -translate-x-1/2 bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 w-full sm:max-w-lg sm:px-4"
          >
            <div className="relative bg-[#F5F4DC] border-t-2 sm:border border-[#d4af37]/40 sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
              {/* Close */}
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Zatvori"
                className="absolute top-3 right-3 z-10 p-2 text-[#232323]/50 hover:text-[#AE343F] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AE343F] rounded-full"
              >
                <X size={20} />
              </button>

              <div className="p-6 sm:p-8 pt-8">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d4af37]/15 border border-[#d4af37]/40 rounded-full mb-4">
                    <Sparkles size={12} className="text-[#AE343F]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8a6d1f]">
                      Besplatno · 10 sekundi
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#232323] mb-2">
                    Otvorite Moje Venčanje
                  </h2>
                  <p className="text-sm text-[#232323]/65 leading-relaxed max-w-md mx-auto">
                    Kontakti vendora, Preporuke parova, Checklista i Budžet
                    kalkulator
                  </p>
                </div>

                <QuickStartForm variant="light" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
