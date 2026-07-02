"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Camera, X, Upload, Loader2, ImageOff, Images } from "lucide-react";
import type { GalleryPhoto } from "@/lib/gallery";
import type { GalleryPhase } from "@/lib/gallery-lifecycle";
import { prepareImageForUpload } from "@/lib/image-utils";

interface Props {
  slug: string;
  coupleNames: string;
  useCyrillic: boolean;
  phase: GalleryPhase;
  initialPhotos: GalleryPhoto[];
}

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_BATCH = 20;
const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

function strings(cyr: boolean) {
  return cyr
    ? {
        gallery: "Наша галерија",
        add: "Додај фотографије",
        yourName: "Ваше име",
        caption: "Опис (опционо)",
        pick: "Изаберите фотографије",
        send: "Пошаљи",
        cancel: "Откажи",
        processing: "Обрада…",
        uploading: "Отпремање…",
        loadMore: "Учитај још",
        empty: "Још нема фотографија. Будите први!",
        beforeMsg:
          "Галерија још није отворена. Фотографије можете додати на дан венчања.",
        afterMsg: "Додавање фотографија је затворено. Хвала што сте поделили успомене!",
        expiredMsg: "Галерија више није доступна.",
        count: (n: number) => `${n} ${n === 1 ? "фотографија" : "фотографија"}`,
        guest: "гост",
        guests: "гостију",
        nameRequired: "Унесите ваше име.",
        thanks: "Хвала! Фотографије су додате.",
        back: "Назад",
      }
    : {
        gallery: "Naša galerija",
        add: "Dodaj fotografije",
        yourName: "Vaše ime",
        caption: "Opis (opciono)",
        pick: "Izaberite fotografije",
        send: "Pošalji",
        cancel: "Otkaži",
        processing: "Obrada…",
        uploading: "Otpremanje…",
        loadMore: "Učitaj još",
        empty: "Još nema fotografija. Budite prvi!",
        beforeMsg:
          "Galerija još nije otvorena. Fotografije možete dodati na dan venčanja.",
        afterMsg: "Dodavanje fotografija je zatvoreno. Hvala što ste podelili uspomene!",
        expiredMsg: "Galerija više nije dostupna.",
        count: (n: number) => `${n} ${n === 1 ? "fotografija" : "fotografija"}`,
        guest: "gost",
        guests: "gostiju",
        nameRequired: "Unesite vaše ime.",
        thanks: "Hvala! Fotografije su dodate.",
        back: "Nazad",
      };
}

function readStoredName(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("hu_gallery_name") || "";
  } catch {
    return "";
  }
}

function mimeOf(file: File): string {
  if (file.type) return file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_MIME[ext] ?? "";
}

export default function GalerijaClient({
  slug,
  coupleNames,
  useCyrillic,
  phase,
  initialPhotos,
}: Props) {
  const t = useMemo(() => strings(useCyrillic), [useCyrillic]);

  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);

  // Group by uploader — the public view shows one "stack" per guest, not every
  // photo flat (privacy + lighter load). photos are newest-first, so the first
  // time a name appears is its newest photo → groups ordered by recency.
  const groups = useMemo(() => {
    const map = new Map<string, GalleryPhoto[]>();
    for (const p of photos) {
      const key = p.guestName || "Gost";
      const arr = map.get(key);
      if (arr) arr.push(p);
      else map.set(key, [p]);
    }
    return Array.from(map.entries()).map(([name, ps]) => ({ name, photos: ps }));
  }, [photos]);

  const [modalOpen, setModalOpen] = useState(false);
  const [guestName, setGuestName] = useState<string>(readStoredName);
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    totalFiles: number;
    pct: number;
    stage: "processing" | "uploading";
  }>({
    done: 0,
    totalFiles: 0,
    pct: 0,
    stage: "processing",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Per-device identity: a random token in localStorage ties a guest's uploads
  // together (survives shared venue WiFi), pre-fills their name, and authorizes
  // renaming only their own photos.
  const uploaderIdRef = useRef<string>("");
  const savedNameRef = useRef<string | null>(null);
  useEffect(() => {
    // guestName is pre-filled via the lazy initializer; here we only set up the
    // device token (a side effect) and record the saved name for rename diffing.
    try {
      let uid = localStorage.getItem("hu_gallery_uid");
      if (!uid) {
        uid = crypto.randomUUID();
        localStorage.setItem("hu_gallery_uid", uid);
      }
      uploaderIdRef.current = uid;
      savedNameRef.current = localStorage.getItem("hu_gallery_name");
    } catch {
      /* localStorage unavailable (private mode) — feature degrades gracefully */
    }
  }, []);

  const canUpload = phase === "upload";
  const showGrid =
    phase === "upload" ||
    phase === "access" ||
    phase === "last-access" ||
    phase === "grace";

  // ── Upload ───────────────────────────────────────────────────────────────
  const putWithProgress = (url: string, file: File, onPct: (p: number) => void) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type || mimeOf(file));
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onPct(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`PUT ${xhr.status}`));
      xhr.onerror = () => reject(new Error("network"));
      xhr.send(file);
    });

  const uploadOne = useCallback(
    async (file: File): Promise<GalleryPhoto | null> => {
      // HEIC → JPEG + downscale (so every phone photo displays everywhere and
      // we store ~1MB instead of 8MB). CPU-heavy; shown as the "processing" stage.
      setProgress((prev) => ({ ...prev, stage: "processing", pct: 0 }));
      const processed = await prepareImageForUpload(file);
      const mime = "image/jpeg";
      setProgress((prev) => ({ ...prev, stage: "uploading", pct: 0 }));

      const signRes = await fetch(
        `/api/pozivnica/${slug}/galerija/upload/sign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileType: mime }),
        }
      );
      if (!signRes.ok) {
        const err = await signRes.json().catch(() => ({}));
        throw new Error(err.error || "sign failed");
      }
      const { uploadUrl, key, publicUrl } = await signRes.json();

      await putWithProgress(uploadUrl, processed, (p) =>
        setProgress((prev) => ({ ...prev, pct: p }))
      );

      const confirmRes = await fetch(
        `/api/pozivnica/${slug}/galerija/upload/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key,
            guestName: guestName.trim(),
            caption: caption.trim(),
            fileSize: processed.size,
            mimeType: mime,
            uploaderId: uploaderIdRef.current || undefined,
          }),
        }
      );
      if (!confirmRes.ok) {
        const err = await confirmRes.json().catch(() => ({}));
        throw new Error(err.error || "confirm failed");
      }
      const { id } = await confirmRes.json();
      return {
        _id: id,
        slug,
        key,
        url: publicUrl,
        guestName: guestName.trim(),
        caption: caption.trim(),
        fileSize: processed.size,
        mimeType: mime,
        approved: true,
        createdAt: new Date().toISOString(),
      };
    },
    [slug, guestName, caption]
  );

  const handleSubmit = useCallback(async () => {
    if (!guestName.trim()) {
      toast.error(t.nameRequired);
      return;
    }
    if (files.length === 0) return;

    setUploading(true);
    setProgress({ done: 0, totalFiles: files.length, pct: 0, stage: "processing" });
    const added: GalleryPhoto[] = [];
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      setProgress({ done: i, totalFiles: files.length, pct: 0, stage: "processing" });
      try {
        const photo = await uploadOne(files[i]);
        if (photo) added.push(photo);
      } catch {
        failed++;
      }
    }

    if (added.length > 0) {
      setPhotos((prev) => [...added.reverse(), ...prev]);

      // Remember the name; if it changed, rename this device's earlier photos.
      const finalName = guestName.trim();
      const prevName = savedNameRef.current;
      try {
        localStorage.setItem("hu_gallery_name", finalName);
      } catch {
        /* ignore */
      }
      if (prevName && prevName !== finalName && uploaderIdRef.current) {
        fetch(`/api/pozivnica/${slug}/galerija/rename`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploaderId: uploaderIdRef.current,
            name: finalName,
          }),
        }).catch(() => {});
        // regroup locally right away
        setPhotos((prev) =>
          prev.map((p) =>
            p.guestName === prevName ? { ...p, guestName: finalName } : p
          )
        );
      }
      savedNameRef.current = finalName;
    }
    setUploading(false);
    setModalOpen(false);
    setFiles([]);
    setCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (added.length > 0) toast.success(t.thanks);
    if (failed > 0) toast.error(`${failed} × ✕`);
  }, [files, guestName, t, uploadOne, slug]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    const valid: File[] = [];
    for (const f of picked) {
      const mime = mimeOf(f);
      if (!ALLOWED_MIME.has(mime)) {
        toast.error(`${f.name}: ${useCyrillic ? "неподржан формат" : "nepodržan format"}`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name}: ${useCyrillic ? "превелика (макс 10MB)" : "prevelika (maks 10MB)"}`);
        continue;
      }
      valid.push(f);
    }
    setFiles(valid.slice(0, MAX_BATCH));
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]"
      style={{ color: "var(--theme-text)" }}
    >
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl sm:text-5xl mb-2"
            style={{ fontFamily: "var(--theme-script-font)", color: "var(--theme-primary)" }}
          >
            {coupleNames}
          </h1>
          <p
            className="font-raleway uppercase tracking-[0.25em] text-xs"
            style={{ color: "var(--theme-text-muted)" }}
          >
            {t.gallery}
          </p>
          {showGrid && photos.length > 0 && (
            <p className="mt-3 font-raleway text-sm" style={{ color: "var(--theme-text-muted)" }}>
              {t.count(photos.length)} · {groups.length} {groups.length === 1 ? t.guest : t.guests}
            </p>
          )}
        </div>

        {/* Upload CTA (upload phase only) */}
        {canUpload && (
          <div className="text-center mb-10">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-raleway text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "var(--theme-primary)", boxShadow: "var(--theme-shadow)" }}
            >
              <Camera size={18} />
              {t.add}
            </button>
          </div>
        )}

        {/* Phase messages */}
        {phase === "before" && (
          <p className="text-center font-serif text-lg py-16" style={{ color: "var(--theme-text-muted)" }}>
            {t.beforeMsg}
          </p>
        )}
        {phase === "expired" && (
          <div className="text-center py-16" style={{ color: "var(--theme-text-muted)" }}>
            <ImageOff size={40} className="mx-auto mb-4 opacity-40" />
            <p className="font-serif text-lg">{t.expiredMsg}</p>
          </div>
        )}
        {(phase === "access" || phase === "last-access" || phase === "grace") && (
          <p className="text-center font-serif text-base mb-8" style={{ color: "var(--theme-text-muted)" }}>
            {t.afterMsg}
          </p>
        )}

        {/* Stacks — one per uploader (guests don't browse everyone's photos flat) */}
        {showGrid &&
          (groups.length === 0 ? (
            <p className="text-center font-serif text-lg py-16" style={{ color: "var(--theme-text-muted)" }}>
              {t.empty}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-7">
              {groups.map((g) => {
                const cover = g.photos[0];
                const many = g.photos.length > 1;
                return (
                  // Non-interactive on purpose: the public view only shows that
                  // photos were shared, not the photos themselves (privacy).
                  <div
                    key={g.name + cover._id}
                    className="relative aspect-square"
                    aria-label={`${g.name} — ${g.photos.length}`}
                  >
                    {/* piled cards behind the cover to read clearly as a stack */}
                    {many && (
                      <>
                        <span
                          className="absolute inset-0 rounded-xl bg-white shadow-md rotate-[6deg]"
                          style={{ border: "1px solid var(--theme-border-light)" }}
                        />
                        <span
                          className="absolute inset-0 rounded-xl bg-white shadow-md -rotate-[5deg]"
                          style={{ border: "1px solid var(--theme-border-light)" }}
                        />
                      </>
                    )}
                    {/* cover photo */}
                    <span className="absolute inset-0 rounded-xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-black/5 block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover.url}
                        alt={g.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </span>
                    {/* photo count (total in this stack) */}
                    <span
                      className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-white text-xs font-medium shadow"
                      style={{ backgroundColor: "var(--theme-primary)" }}
                    >
                      <Images size={11} /> {g.photos.length}
                    </span>
                    {/* uploader name */}
                    <span className="absolute bottom-0 inset-x-0 rounded-b-xl px-2 py-1.5 text-white text-xs font-raleway truncate text-left bg-gradient-to-t from-black/70 to-transparent">
                      {g.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
      </div>

      {/* Upload modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => !uploading && setModalOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl" style={{ color: "#232323" }}>
                {t.add}
              </h2>
              {!uploading && (
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={22} />
                </button>
              )}
            </div>

            {uploading ? (
              <div className="py-8 text-center">
                <Loader2 size={36} className="mx-auto mb-4 animate-spin" style={{ color: "var(--theme-primary)" }} />
                <p className="font-raleway text-sm text-gray-600 mb-3">
                  {progress.stage === "processing" ? t.processing : t.uploading}{" "}
                  {progress.done + 1}/{progress.totalFiles}
                </p>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${progress.pct}%`, backgroundColor: "var(--theme-primary)" }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder={t.yourName}
                  maxLength={60}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 font-raleway text-sm text-[#232323] focus:outline-none focus:border-gray-400"
                />
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t.caption}
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 font-raleway text-sm text-[#232323] focus:outline-none focus:border-gray-400"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPick}
                  className="hidden"
                  id="gallery-file-input"
                />
                <label
                  htmlFor="gallery-file-input"
                  className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <Upload size={26} className="text-gray-400" />
                  <span className="font-raleway text-sm text-gray-500">
                    {files.length > 0 ? `${files.length} ✓` : t.pick}
                  </span>
                </label>

                <button
                  onClick={handleSubmit}
                  disabled={files.length === 0 || !guestName.trim()}
                  className="w-full py-3.5 rounded-full font-raleway text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                >
                  {t.send}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
