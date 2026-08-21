"use client";

import { useState } from "react";
import { Camera, Check, Images, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { prepareImageForUpload } from "@/lib/image-utils";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";

const MAX_IMAGES = 3;

interface UploadImage {
  url: string;
  pathname: string;
}

interface Props {
  token: string;
  displayName: string;
  eventDate: string;
  initialImages: UploadImage[];
}

function formatEventDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  // Explicit Latin subtag: bare "sr-RS" resolves to Cyrillic in ICU.
  return d.toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SlikeClient({
  token,
  displayName,
  eventDate,
  initialImages,
}: Props) {
  const [images, setImages] = useState<UploadImage[]>(initialImages);
  const [busy, setBusy] = useState<null | "upload" | "delete">(null);
  const { confirm, dialog } = useConfirmDialog({ variant: "light" });

  const remaining = MAX_IMAGES - images.length;
  const date = formatEventDate(eventDate);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    // Reset immediately so picking the same file twice still fires onChange.
    e.target.value = "";
    if (picked.length === 0 || busy) return;

    const files = picked.slice(0, remaining);
    if (picked.length > files.length)
      toast.warning(`Možete otpremiti još ${remaining} — višak je preskočen.`);

    setBusy("upload");
    // Sequential on purpose: the server appends to a list it reads first, so
    // parallel uploads would race and one would overwrite the other.
    for (const file of files) {
      try {
        const prepared = await prepareImageForUpload(file);
        const fd = new FormData();
        fd.append("image", prepared);
        const res = await fetch(`/api/upload-link/${token}`, {
          method: "POST",
          body: fd,
        });
        const data = (await res.json().catch(() => ({}))) as {
          images?: UploadImage[];
          error?: string;
        };
        if (!res.ok) {
          toast.error(data.error || "Otpremanje nije uspelo");
          break;
        }
        if (data.images) setImages(data.images);
      } catch {
        toast.error(`Nismo uspeli da obradimo sliku "${file.name}"`);
      }
    }
    setBusy(null);
  }

  async function handleDelete(img: UploadImage) {
    if (busy) return;
    const ok = await confirm({
      title: "Obrisati sliku?",
      message: "Možete otpremiti drugu umesto nje.",
      confirmLabel: "Obriši",
      danger: true,
    });
    if (!ok) return;

    setBusy("delete");
    try {
      const res = await fetch(`/api/upload-link/${token}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathname: img.pathname }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        images?: UploadImage[];
        error?: string;
      };
      if (!res.ok) toast.error(data.error || "Brisanje nije uspelo");
      else if (data.images) setImages(data.images);
    } catch {
      toast.error("Brisanje nije uspelo");
    }
    setBusy(null);
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:py-16">
      <header className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-sm mb-4">
          <Images size={22} className="text-[#AE343F]" />
        </div>
        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#AE343F] font-medium mb-2">
          HaloUspomene · Fotografije za pozivnicu
        </p>
        <h1 className="text-2xl sm:text-3xl font-serif font-light mb-2">
          Otpremite svoje fotografije
        </h1>
        <p className="text-base sm:text-lg text-[#232323]/70">
          <span className="font-medium text-[#232323]">{displayName}</span>
          {date && (
            <>
              <span className="mx-2 text-[#232323]/30">·</span>
              {date}
            </>
          )}
        </p>
      </header>

      <section className="bg-white rounded-2xl border border-[#232323]/10 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-wider text-[#232323]/50 font-semibold">
            Slike ({images.length}/{MAX_IMAGES})
          </h2>
          {images.length === MAX_IMAGES && (
            <span className="inline-flex items-center gap-1.5 text-xs text-green-700">
              <Check size={14} /> Sve je otpremljeno
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {Array.from({ length: MAX_IMAGES }).map((_, i) => {
            const img = images[i];
            return (
              <div
                key={img?.pathname ?? `prazno-${i}`}
                className="relative aspect-square rounded-xl overflow-hidden border border-[#232323]/10 bg-[#F5F4DC]/60"
              >
                {img ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`Fotografija ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDelete(img)}
                      disabled={!!busy}
                      aria-label={`Obriši fotografiju ${i + 1}`}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#232323]/20">
                    <Camera size={22} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {remaining > 0 ? (
          <label
            className={`flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-medium text-sm transition-colors ${
              busy
                ? "bg-[#232323]/10 text-[#232323]/40 cursor-default"
                : "bg-[#AE343F] hover:bg-[#8A2A32] text-white cursor-pointer"
            }`}
          >
            {busy === "upload" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Otpremanje…
              </>
            ) : (
              <>
                <Camera size={16} /> Dodaj fotografiju
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={!!busy}
              onChange={handleFiles}
            />
          </label>
        ) : (
          <p className="text-sm text-center text-[#232323]/60">
            Hvala! Fotografije smo primili — javite nam ako želite izmenu.
          </p>
        )}

        <p className="text-xs text-[#232323]/50 mt-4 leading-relaxed">
          Najviše {MAX_IMAGES} fotografije. Slike se automatski smanjuju pre
          slanja, pa možete da birate direktno iz galerije telefona (radi i
          iPhone HEIC format). Link možete otvoriti ponovo i zameniti sliku kad
          god poželite.
        </p>
      </section>
      {dialog}
    </main>
  );
}
