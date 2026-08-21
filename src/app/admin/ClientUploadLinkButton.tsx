"use client";

import { useState } from "react";
import { Check, Copy, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  productKind: "couple" | "birthday";
  slug: string;
  /** Brand accent — burgundy for couples, coral for birthdays. */
  accent?: string;
}

interface UploadLink {
  token: string;
  visit_count: number;
  upload_count: number;
}

/** Mints (or re-fetches) the client-facing photo-upload link for this product
 *  and shows it for copying. The token is stable per product, so clicking
 *  again never invalidates a link already sent to the client. */
export default function ClientUploadLinkButton({
  productKind,
  slug,
  accent = "#AE343F",
}: Props) {
  const [link, setLink] = useState<UploadLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = link
    ? `${typeof window === "undefined" ? "" : window.location.origin}/slike/${link.token}/`
    : "";

  async function generate() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/upload-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_kind: productKind, slug }),
      });
      if (!res.ok) throw new Error("failed");
      setLink((await res.json()) as UploadLink);
    } catch {
      toast.error("Nije uspelo generisanje linka");
    }
    setLoading(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopiranje nije uspelo — link je iznad, kopirajte ručno");
    }
  }

  if (!link) {
    return (
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
        title="Link koji klijent otvara da sam otpremi slike"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <LinkIcon size={13} />}
        Link za klijenta
      </button>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2">
        <code className="flex-1 min-w-0 truncate px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[11px] font-mono text-white/70">
          {url}
        </code>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white transition-colors cursor-pointer"
          style={{ backgroundColor: accent }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Kopirano" : "Kopiraj"}
        </button>
      </div>
      <p className="text-[10px] text-white/40">
        Klijent otvara link i otprema do 3 slike — ne treba mu lozinka.
        {link.visit_count > 0 && ` Otvoreno ${link.visit_count}×.`}
        {link.upload_count > 0 && ` Otpremljeno ${link.upload_count}.`}
      </p>
    </div>
  );
}
