"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check, ChevronDown, Link as LinkIcon, Share2 } from "lucide-react";

export type ShareProductKind = "couple" | "birthday" | "seating";

interface Props {
  productKind: ShareProductKind;
  slug: string;
  /** The clean per-product URL — used as the "Direktan link" secondary option. */
  directUrl: string;
}

/** Split-button that copies a share-page link (`/pristup/{token}/`) by
 *  default — bezbedan za Instagram jer recipient kopira čisti link iz
 *  share stranice umesto direktnog. Chevron menu exposes the legacy
 *  "Direktan link" copy as a secondary option. */
export default function ShareLinkButton({
  productKind,
  slug,
  directUrl,
}: Props) {
  const [copied, setCopied] = useState<"share" | "direct" | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  async function copyShareLink() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_kind: productKind, slug }),
      });
      if (!res.ok) throw new Error("Failed to create share link");
      const data = (await res.json()) as { token: string };
      const url = `${window.location.origin}/pristup/${data.token}/`;
      await navigator.clipboard.writeText(url);
      setCopied("share");
      setTimeout(() => setCopied(null), 2500);
    } catch {
      // Fallback: copy direct URL so the admin doesn't end up with nothing.
      try {
        await navigator.clipboard.writeText(directUrl);
        setCopied("direct");
        setTimeout(() => setCopied(null), 2500);
      } catch {
        /* clipboard unavailable */
      }
    } finally {
      setBusy(false);
    }
  }

  async function copyDirect() {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(directUrl);
      setCopied("direct");
      setTimeout(() => setCopied(null), 2500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        type="button"
        onClick={copyShareLink}
        disabled={busy}
        className="p-1.5 rounded-l-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white cursor-pointer disabled:opacity-40"
        title="Kopiraj link za deljenje (bezbedan za Instagram chat)"
      >
        {copied === "share" ? (
          <Check size={14} className="text-green-400" />
        ) : copied === "direct" ? (
          <Check size={14} className="text-white/60" />
        ) : (
          <Share2 size={14} />
        )}
      </button>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-0.5 py-1.5 rounded-r-lg hover:bg-white/10 transition-colors text-white/30 hover:text-white cursor-pointer border-l border-white/10"
        title="Više opcija"
      >
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-30 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-xl py-1 min-w-[230px]">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void copyShareLink();
            }}
            className="w-full flex items-start gap-2 px-3 py-2 text-[11px] text-white/80 hover:bg-white/5 cursor-pointer text-left"
          >
            <Share2 size={12} className="text-green-400 mt-0.5 shrink-0" />
            <span className="flex-1">
              <span className="block">Link za deljenje</span>
              <span className="block text-[9px] text-white/40 mt-0.5">
                Bezbedan za Instagram — gosti dobijaju čist link
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={copyDirect}
            className="w-full flex items-start gap-2 px-3 py-2 text-[11px] text-white/70 hover:bg-white/5 cursor-pointer text-left border-t border-white/5"
          >
            <LinkIcon size={12} className="text-white/40 mt-0.5 shrink-0" />
            <span className="flex-1">
              <span className="block">Direktan link</span>
              <span className="block text-[9px] text-white/40 mt-0.5">
                Sirovi URL — može da puca u IG chat-u
              </span>
            </span>
          </button>
          <div className="border-t border-white/5 mt-1 pt-1.5 px-3 pb-1.5">
            <Copy size={10} className="inline text-white/30 mr-1" />
            <span className="text-[9px] text-white/40">
              {copied === "share"
                ? "Share link kopiran"
                : copied === "direct"
                  ? "Direktan link kopiran"
                  : "Klik kopira u clipboard"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
