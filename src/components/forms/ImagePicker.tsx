"use client";

import React, { useRef, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { prepareImageForUpload, isHeic } from "@/lib/image-utils";

// Reusable inline file picker for the user-facing gallery feature. Shared by
// every builder that lets a client attach photos before the record exists:
// the wedding ExtrasAccordion (classic, max 3), PremiumStepAIPhoto (Fountain,
// max 2, included in price) and the rodjendan / punoletstvo photo step (max 3).
// Files stay in client state until the form's final submit, where they get
// pushed to Vercel Blob.
export function ImagePicker({
  files,
  onChange,
  max,
  accentHex,
  accentRgb,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  max: number;
  accentHex: string;
  accentRgb: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  // HEIC conversion + downscaling are CPU-heavy and run one file at a time, so
  // the picker reports the wait instead of looking frozen.
  const [busy, setBusy] = useState(false);
  // Object URLs are revoked when the file list changes so the browser doesn't
  // leak memory across re-renders.
  const [previews, setPreviews] = useState<string[]>([]);

  React.useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-selecting the same file after removal
    if (picked.length === 0) return;

    // Only process what still fits — decoding a photo the user can't add anyway
    // would just burn phone battery.
    const queue = picked.slice(0, Math.max(0, max - files.length));
    setBusy(true);
    const accepted: File[] = [];
    for (const f of queue) {
      if (!f.type.startsWith("image/") && !isHeic(f)) {
        setError("Samo slike su dozvoljene.");
        continue;
      }
      try {
        accepted.push(await prepareImageForUpload(f));
      } catch {
        // Undecodable by this browser (exotic format, corrupt file). Keep the
        // original if it is small enough to upload as it is.
        if (f.size > 5 * 1024 * 1024) {
          setError("Sliku nije moguće obraditi (maks. 5MB).");
          continue;
        }
        accepted.push(f);
      }
    }
    setBusy(false);
    onChange([...files, ...accepted].slice(0, max));
  };

  const removeAt = (i: number) => {
    setError(null);
    onChange(files.filter((_, idx) => idx !== i));
  };

  const canAdd = files.length < max;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {previews.map((src, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-lg overflow-hidden border bg-stone-50"
            style={{ borderColor: `rgba(${accentRgb}, 0.25)` }}
          >
            {/* Local object-URL preview of a user upload — next/image can't
                optimize a blob: URL, so a plain <img> is correct. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Slika ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Ukloni sliku"
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/95 shadow flex items-center justify-center hover:bg-white"
            >
              <X size={12} className="text-stone-700" />
            </button>
          </div>
        ))}
        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors hover:bg-white/60 disabled:opacity-60 disabled:cursor-wait"
            style={{
              borderColor: `rgba(${accentRgb}, 0.4)`,
              color: accentHex,
            }}
          >
            {busy ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {busy ? "Obrada" : "Dodaj"}
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        onChange={handlePick}
        className="hidden"
      />
      <p className="text-[11px] text-stone-500">
        {busy
          ? "Obrađujemo fotografije..."
          : `${files.length}/${max} slika · JPG, PNG, WebP, HEIC · automatski se smanjuju`}
      </p>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
