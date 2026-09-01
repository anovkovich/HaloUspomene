"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cake, Sparkles } from "lucide-react";
import { trackEvent } from "@/utils/analytics";

interface BirthdayTypeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BirthdayTypeModal({
  open,
  onClose,
}: BirthdayTypeModalProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const pick = (type: "child" | "eighteenth") => {
    trackEvent("birthday_type_selected", { type });
    onClose();
    router.push(
      type === "child" ? "/napravi-deciju-pozivnicu" : "/napravi-punoletstvo",
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="birthday-type-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="birthday-type-title"
        >
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Zatvori"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="px-6 sm:px-10 pt-10 pb-6 text-center">
              <h2
                id="birthday-type-title"
                className="text-2xl sm:text-3xl font-serif text-[#232323] mb-2"
              >
                Kakvu pozivnicu pravimo?
              </h2>
              <p className="text-sm text-stone-500">
                Izaberite tip rođendanske pozivnice — nastavićete na odgovarajuću formu.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 px-6 sm:px-10 pb-10">
              <button
                type="button"
                onClick={() => pick("child")}
                className="group relative bg-gradient-to-br from-[#FFF4EC] to-[#FFEBE0] hover:from-[#FFEDE0] hover:to-[#FFDECC] border-2 border-[#FF6B6B]/15 hover:border-[#FF6B6B]/40 rounded-2xl p-6 text-left transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FF6B6B] text-white flex items-center justify-center mb-4 shadow-md shadow-[#FF6B6B]/25">
                  <Cake size={22} />
                </div>
                <h3 className="font-serif text-lg text-[#232323] mb-1">
                  Dečiji rođendan
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed mb-3">
                  Za mališane 1–5 godina. Vesele boje, ilustracije, mape, forma za potvrdu dolaska i odbrojavanje.
                </p>
                <span className="inline-block text-xs font-semibold text-[#FF6B6B] uppercase tracking-widest">
                  Započni →
                </span>
              </button>

              <button
                type="button"
                onClick={() => pick("eighteenth")}
                className="group relative bg-gradient-to-br from-[#FFF8E1] to-[#FFF1C4] hover:from-[#FFF1C4] hover:to-[#FFE99A] border-2 border-[#d4af37]/25 hover:border-[#d4af37]/50 rounded-2xl p-6 text-left transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#d4af37] text-white flex items-center justify-center mb-4 shadow-md shadow-[#d4af37]/25">
                  <Sparkles size={22} />
                </div>
                <h3 className="font-serif text-lg text-[#232323] mb-1">
                  Punoletstvo
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed mb-3">
                  18. rođendan u elegantnom stilu — moderne boje, koverta dobrodošlice, mape, forma za potvrdu dolaska i odbrojavanje.
                </p>
                <span className="inline-block text-xs font-semibold text-[#b8942a] uppercase tracking-widest">
                  Započni →
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
