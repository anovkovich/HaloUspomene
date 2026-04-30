"use client";

import { useState } from "react";
import { Lock, X, Mail, Copy, Check } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function UpgradeModal({ onClose }: Props) {
  const [emailCopied, setEmailCopied] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4"
        style={{ backgroundColor: "var(--theme-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:opacity-60 transition-opacity"
          style={{ color: "var(--theme-text-light)" }}
        >
          <X size={15} />
        </button>

        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "color-mix(in srgb, var(--theme-primary) 12%, var(--theme-background))" }}
        >
          <Lock size={26} style={{ color: "var(--theme-primary)" }} />
        </div>

        <div className="text-center">
          <p
            className="font-raleway font-semibold text-base mb-1"
            style={{ color: "var(--theme-text)" }}
          >
            Ovo je demo verzija koja dozvoljava samo nekoliko stolova i
            postavljanje jedne osobe. Za puno korišćenje ove funkcionalnosti
            koja organizaciju sedenja čini jednostavnom, <br />{" "}
            kontaktirajte nas!
          </p>
          <p
            className="font-raleway text-xs leading-relaxed mt-4"
            style={{ color: "var(--theme-text-light)" }}
          >
            Raspored sedenja za samo <strong>1.990</strong> din
          </p>
        </div>

        <div className="w-full flex flex-col gap-2 mt-1">
          <div className="flex items-center w-full py-2.5 px-3 rounded-lg text-xs font-raleway font-medium border border-var(--theme-primary)">
            <Mail size={13} className="shrink-0 mr-2" />
            <span className="flex-1">halouspomene@gmail.com</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText("halouspomene@gmail.com");
                setEmailCopied(true);
                setTimeout(() => setEmailCopied(false), 2000);
              }}
              className="shrink-0 ml-2 hover:opacity-70 transition-opacity cursor-pointer"
              title="Kopiraj email"
            >
              {emailCopied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>

          <a
            href="https://www.instagram.com/halo_uspomene"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-raleway font-medium transition-opacity hover:opacity-80"
            style={{
              border: "1px solid var(--theme-border-light)",
              backgroundColor: "var(--theme-primary)",
              color: "white",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            @halouspomene
          </a>
        </div>
      </div>
    </div>
  );
}
