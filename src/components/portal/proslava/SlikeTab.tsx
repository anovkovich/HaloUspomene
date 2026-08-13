"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Trash2 } from "lucide-react";

/**
 * Client-side management of the up-to-3 polaroid photos on the invitation.
 *
 * This is what makes the 600-din `slike` add-on worth selling: without it,
 * every purchase would queue a manual upload for us, which costs more than the
 * tier earns. Only punoletstvo renders the strip today, so the tab is shown
 * only there.
 */
const MAX = 3;

interface Props {
  slug: string;
  initialImages: Array<{ url: string; pathname: string }>;
  uploadAction: (
    slug: string,
    form: FormData,
  ) => Promise<{ ok: boolean; url?: string; pathname?: string; error?: string }>;
  deleteAction: (
    slug: string,
    url: string,
  ) => Promise<{ ok: boolean; error?: string }>;
}

export default function SlikeTab({
  slug,
  initialImages,
  uploadAction,
  deleteAction,
}: Props) {
  const [images, setImages] = useState(initialImages);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setBusy(true);
    const form = new FormData();
    form.append("image", file);
    const res = await uploadAction(slug, form);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    if (res.ok && res.url && res.pathname) {
      setImages((prev) => [...prev, { url: res.url!, pathname: res.pathname! }]);
    } else {
      setError(res.error ?? "Otpremanje nije uspelo");
    }
  }

  async function handleDelete(url: string) {
    setError("");
    setBusy(true);
    const res = await deleteAction(slug, url);
    setBusy(false);
    if (res.ok) setImages((prev) => prev.filter((i) => i.url !== url));
    else setError(res.error ?? "Brisanje nije uspelo");
  }

  return (
    <div className="space-y-4">
      <div
        className="p-4 rounded-2xl"
        style={{
          backgroundColor: "var(--theme-surface)",
          border: "1px solid var(--theme-border-light)",
        }}
      >
        <p className="text-sm font-bold" style={{ color: "var(--theme-text)" }}>
          Fotografije na pozivnici
        </p>
        <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
          Do {MAX} fotografije, prikazane kao polaroidi ispod naslova pozivnice.
          Promene se vide odmah.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {images.map((img) => (
          <div
            key={img.url}
            className="relative aspect-square rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--theme-border-light)" }}
          >
            <Image
              src={img.url}
              alt=""
              fill
              sizes="33vw"
              className="object-cover"
              unoptimized
            />
            <button
              onClick={() => handleDelete(img.url)}
              disabled={busy}
              aria-label="Obriši fotografiju"
              className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/55 text-white transition-opacity hover:opacity-80 disabled:opacity-40 cursor-pointer"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {images.length < MAX && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 transition-opacity hover:opacity-80 disabled:opacity-50 cursor-pointer"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1px dashed var(--theme-border)",
              color: "var(--theme-text-muted)",
            }}
          >
            {busy ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            <span className="text-xs">Dodaj</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handlePick}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
