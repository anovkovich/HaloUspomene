"use client";

import { useEffect, useState } from "react";
import { Star, ExternalLink, Copy, Check } from "lucide-react";

const GOOGLE_REVIEW_URL = "https://g.page/r/CSLwRdnVlsunEAE/review";

function isInstagramBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Instagram/i.test(ua);
}

export default function RecenzijaClient() {
  const [isInstagram, setIsInstagram] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const insta = isInstagramBrowser();
    setIsInstagram(insta);

    // If not Instagram in-app browser, redirect immediately
    if (!insta) {
      window.location.href = GOOGLE_REVIEW_URL;
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_REVIEW_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = GOOGLE_REVIEW_URL;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // While detecting, show minimal loading
  if (isInstagram === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4DC]">
        <div className="animate-pulse text-[#AE343F]">
          <Star className="w-10 h-10 fill-current" />
        </div>
      </div>
    );
  }

  // Non-Instagram: show fallback while redirect happens
  if (!isInstagram) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F4DC] px-6">
        <p className="text-[#78716c] font-[family-name:var(--font-josefin-sans)]">
          Preusmeravanje na Google recenzije...
        </p>
        <a
          href={GOOGLE_REVIEW_URL}
          className="mt-4 text-[#AE343F] underline text-sm"
        >
          Kliknite ovde ako se stranica ne otvori
        </a>
      </div>
    );
  }

  // Instagram in-app browser: show instructions
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F4DC] px-6 py-12">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Stars */}
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className="w-8 h-8 text-[#d4af37] fill-[#d4af37]"
            />
          ))}
        </div>

        {/* Title */}
        <h1
          className="text-3xl text-[#232323] font-[family-name:var(--font-cormorant)]"
          style={{ fontWeight: 500 }}
        >
          Ostavite Recenziju
        </h1>

        <p className="text-[#78716c] font-[family-name:var(--font-josefin-sans)] text-sm leading-relaxed">
          Instagram ne podržava otvaranje Google recenzija direktno. Molimo vas
          otvorite ovu stranicu u vašem browseru.
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-px bg-[#AE343F] opacity-30" />
          <span className="text-[#AE343F] opacity-50 text-sm">&#9829;</span>
          <div className="w-12 h-px bg-[#AE343F] opacity-30" />
        </div>

        {/* Instructions */}
        <div className="bg-white/60 rounded-2xl p-6 space-y-4 text-left">
          <p className="text-[#232323] font-[family-name:var(--font-josefin-sans)] text-sm font-medium">
            Kako da otvorite u browseru:
          </p>
          <ol className="space-y-3 text-[#78716c] font-[family-name:var(--font-josefin-sans)] text-sm">
            <li className="flex gap-3">
              <span className="text-[#AE343F] font-bold shrink-0">1.</span>
              <span>
                Dodirnite <strong>⋯</strong> (tri tačke) u gornjem desnom uglu
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#AE343F] font-bold shrink-0">2.</span>
              <span>
                Izaberite{" "}
                <strong>&quot;Open in browser&quot;</strong> ili{" "}
                <strong>&quot;Otvori u browseru&quot;</strong>
              </span>
            </li>
          </ol>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-[#AE343F] text-white rounded-xl font-[family-name:var(--font-josefin-sans)] text-sm tracking-wide hover:bg-[#952d36] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Otvori Google Recenzije
          </a>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-white/80 text-[#232323] rounded-xl font-[family-name:var(--font-josefin-sans)] text-sm tracking-wide hover:bg-white transition-colors border border-[#e5e5e5]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Link kopiran!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Kopiraj link
              </>
            )}
          </button>
        </div>

        {/* Branding */}
        <p className="text-[#a8a29e] font-[family-name:var(--font-josefin-sans)] text-xs tracking-widest uppercase">
          halouspomene.rs
        </p>
      </div>
    </div>
  );
}
