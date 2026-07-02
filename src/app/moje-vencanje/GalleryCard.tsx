"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Images,
  Download,
  Trash2,
  X,
  Loader2,
  ImageOff,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
} from "lucide-react";
import { loadGalleryAction, deleteGalleryPhotoAction } from "./actions";
import type { GalleryPhoto } from "@/lib/gallery";
import type { GalleryPhase } from "@/lib/gallery-lifecycle";

interface Props {
  slug: string;
}

const PAGE = 12; // small batches so the grid streams in instead of loading 200 at once

function safeName(s: string): string {
  return s.replace(/[^a-zA-Z0-9Ѐ-ӿ-]+/g, "-").replace(/-+/g, "-");
}

/** Save a blob to disk. Cleanup is deferred — revoking the object URL or
 * removing the anchor synchronously right after click() cancels the download
 * in some browsers, especially for previewable types like images. */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 2000);
}

export default function GalleryCard({ slug }: Props) {
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [total, setTotal] = useState(0);
  const [canAccess, setCanAccess] = useState(true);
  const [phase, setPhase] = useState<GalleryPhase>("unknown");
  const [loadingMore, setLoadingMore] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [zipping, setZipping] = useState(false);

  const loadingRef = useRef(false);

  useEffect(() => {
    loadGalleryAction(0, PAGE).then((res) => {
      if (res) {
        setPhotos(res.photos);
        setTotal(res.total);
        setCanAccess(res.canAccess);
        setPhase(res.phase);
      }
      setLoading(false);
    });
  }, []);

  const hasMore = photos.length < total;

  const loadMore = useCallback(async () => {
    if (loadingRef.current || photos.length >= total) return;
    loadingRef.current = true;
    setLoadingMore(true);
    const res = await loadGalleryAction(photos.length, PAGE);
    if (res) {
      setPhotos((prev) => [...prev, ...res.photos]);
      setTotal(res.total);
    }
    setLoadingMore(false);
    loadingRef.current = false;
  }, [photos.length, total]);

  // Auto-load next batch when the sentinel scrolls into view.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const allLoadedSelected =
    photos.length > 0 && photos.every((p) => selected.has(p._id));
  const toggleSelectAll = useCallback(() => {
    setSelected((prev) =>
      photos.every((p) => prev.has(p._id))
        ? new Set()
        : new Set(photos.map((p) => p._id))
    );
  }, [photos]);

  const downloadSelected = useCallback(async () => {
    if (selected.size === 0) return;
    setZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const chosen = photos.filter((p) => selected.has(p._id));
      let i = 0;
      for (const p of chosen) {
        try {
          const res = await fetch(p.url);
          const blob = await res.blob();
          i++;
          zip.file(`${safeName(p.guestName || "gost")}-${i}.jpg`, blob);
        } catch {
          /* skip a failed fetch, keep zipping the rest */
        }
      }
      const content = await zip.generateAsync({ type: "blob" });
      triggerDownload(content, `galerija-${slug}.zip`);
    } finally {
      setZipping(false);
    }
  }, [selected, photos, slug]);

  const downloadOne = useCallback(async (photo: GalleryPhoto, index: number) => {
    try {
      const res = await fetch(photo.url);
      const blob = await res.blob();
      triggerDownload(blob, `${safeName(photo.guestName || "gost")}-${index + 1}.jpg`);
    } catch {
      toast.error("Greška pri preuzimanju");
    }
  }, []);

  const handleDelete = useCallback(async (photo: GalleryPhoto) => {
    setDeleting(photo._id);
    const res = await deleteGalleryPhotoAction(photo._id);
    if (res.success) {
      setPhotos((prev) => prev.filter((p) => p._id !== photo._id));
      setTotal((t) => Math.max(0, t - 1));
      setSelected((prev) => {
        const n = new Set(prev);
        n.delete(photo._id);
        return n;
      });
      setLightbox(null);
    } else {
      toast.error("Greška pri brisanju");
    }
    setDeleting(null);
  }, []);

  // ── Lightbox navigation ────────────────────────────────────────────────────
  const goPrev = useCallback(
    () => setLightbox((i) => (i === null ? null : Math.max(0, i - 1))),
    []
  );
  const goNext = useCallback(
    () =>
      setLightbox((i) =>
        i === null ? null : Math.min(photos.length - 1, i + 1)
      ),
    [photos.length]
  );
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, goPrev, goNext]);
  const touchStartX = useRef<number | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-[#AE343F]" size={32} />
      </div>
    );
  }

  // Access expired (d5) or photos purged (d6+)
  if (!canAccess) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6">
        {phase === "expired" ? (
          <>
            <ImageOff size={44} className="mx-auto mb-4 text-[#232323]/30" />
            <p className="font-serif text-xl text-[#232323] mb-2">
              Fotografije su obrisane
            </p>
            <p className="text-sm text-[#232323]/70 leading-relaxed">
              Galerija je sistemski očišćena nakon isteka roka za preuzimanje.
            </p>
          </>
        ) : (
          <>
            <Clock size={44} className="mx-auto mb-4 text-[#232323]/30" />
            <p className="font-serif text-xl text-[#232323] mb-2">
              Rok za preuzimanje je istekao
            </p>
            <p className="text-sm text-[#232323]/70 leading-relaxed">
              Fotografije se brišu na kraju dana. Ako vam još trebaju, javite se
              našem timu na{" "}
              <a href="mailto:halouspomene@gmail.com" className="text-[#AE343F] underline">
                halouspomene@gmail.com
              </a>
              .
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Images className="text-[#AE343F]" size={24} />
        <h1 className="font-serif text-2xl text-[#232323]">Galerija</h1>
      </div>
      <p className="text-sm text-[#232323]/70 mb-6">
        Fotografije koje su gosti podelili skeniranjem QR koda.
      </p>

      {photos.length === 0 ? (
        <div className="text-center py-16 text-[#232323]/60">
          <Images size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-serif text-lg">Još nema fotografija.</p>
          <p className="text-sm mt-1">
            {phase === "before"
              ? "Gosti mogu da dodaju fotografije na dan venčanja."
              : "Kada gosti dodaju fotografije, pojaviće se ovde."}
          </p>
        </div>
      ) : (
        <>
          {/* Toolbar: count + select-all + download selected */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#232323]/70">
                {total} {total === 1 ? "fotografija" : "fotografija"}
              </span>
              <button
                onClick={toggleSelectAll}
                className="inline-flex items-center gap-1.5 text-sm text-[#232323]/70 hover:text-[#232323] transition-colors"
              >
                <CheckCheck size={16} />
                {allLoadedSelected ? "Poništi izbor" : "Izaberi sve"}
              </button>
            </div>
            <button
              onClick={downloadSelected}
              disabled={selected.size === 0 || zipping}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#232323] text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {zipping ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {selected.size > 0
                ? `Preuzmi izabrane (${selected.size})`
                : "Preuzmi izabrane"}
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {photos.map((p, i) => {
              const isSel = selected.has(p._id);
              return (
                <div
                  key={p._id}
                  className={`relative aspect-square overflow-hidden rounded-lg bg-black/5 group ring-2 transition-all ${
                    isSel ? "ring-[#AE343F]" : "ring-transparent"
                  }`}
                >
                  <button
                    onClick={() => setLightbox(i)}
                    className="w-full h-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.caption || p.guestName}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(p._id);
                    }}
                    className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSel
                        ? "bg-[#AE343F] text-white"
                        : "bg-black/40 text-white/80 opacity-0 group-hover:opacity-100"
                    }`}
                    aria-label="Izaberi"
                  >
                    {isSel && <Check size={14} />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Auto-load sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-6">
              {loadingMore && (
                <Loader2 size={20} className="animate-spin text-[#AE343F]" />
              )}
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightbox !== null && photos[lightbox] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 50) (dx < 0 ? goNext : goPrev)();
            touchStartX.current = null;
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
          >
            <X size={28} />
          </button>

          {lightbox > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
              aria-label="Prethodna"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          {lightbox < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
              aria-label="Sledeća"
            >
              <ChevronRight size={28} />
            </button>
          )}

          <div
            className="max-w-full max-h-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[lightbox].url}
              alt={photos[lightbox].caption || photos[lightbox].guestName}
              className="max-w-full max-h-[72vh] object-contain rounded"
            />
            <div className="text-center mt-3 text-white/80">
              <p className="text-sm">{photos[lightbox].guestName}</p>
              {photos[lightbox].caption && (
                <p className="text-sm italic mt-0.5">{photos[lightbox].caption}</p>
              )}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => toggleSelect(photos[lightbox]._id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                  selected.has(photos[lightbox]._id)
                    ? "bg-[#AE343F] text-white"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                <Check size={16} />
                {selected.has(photos[lightbox]._id) ? "Izabrano" : "Izaberi"}
              </button>
              <button
                onClick={() => downloadOne(photos[lightbox], lightbox)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm hover:bg-white/25 transition-colors"
              >
                <Download size={16} />
                Preuzmi
              </button>
              <button
                onClick={() => handleDelete(photos[lightbox])}
                disabled={deleting === photos[lightbox]._id}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/80 text-white text-sm hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {deleting === photos[lightbox]._id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
