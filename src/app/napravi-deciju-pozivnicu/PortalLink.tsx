"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function PortalLink() {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleGo = () => {
    const trimmed = slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed) return;
    router.push(
      `/deciji-rodjendan/${trimmed}/prijava?next=/deciji-rodjendan/${trimmed}/portal`,
    );
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="portal-slug-link">
        stranicu za praćenje potvrda
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-stone-300 hover:text-stone-500 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-serif text-stone-800 mb-1">
              Praćenje potvrda
            </h3>
            <p className="text-sm text-stone-400 mb-5">
              Unesite slug vašeg događaja iz linka pozivnice
            </p>

            <div className="flex items-center gap-1 mb-4">
              <span className="text-xs text-stone-300 shrink-0">
                /deciji-rodjendan/
              </span>
              <input
                ref={inputRef}
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGo();
                }}
                placeholder="ime-datum"
                className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 outline-none focus:border-[#FF6B6B] transition-colors"
              />
            </div>

            <button
              onClick={handleGo}
              disabled={!slug.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-30 cursor-pointer"
              style={{ backgroundColor: "#FF6B6B" }}
            >
              Otvori portal
            </button>
          </div>
        </div>
      )}
    </>
  );
}
