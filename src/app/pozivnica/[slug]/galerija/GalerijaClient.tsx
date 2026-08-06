"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Camera, X, Upload, Loader2, ImageOff, Images, CalendarClock, QrCode } from "lucide-react";
import type { GalleryPhoto, GalleryStack } from "@/lib/gallery";
import type { GalleryPhase } from "@/lib/gallery-lifecycle";
import { prepareImageForUpload } from "@/lib/image-utils";

interface Props {
  slug: string;
  coupleNames: string;
  useCyrillic: boolean;
  phase: GalleryPhase;
  /** Per-guest piles, grouped server-side. Preferred — the payload then scales
   *  with the number of guests, not the number of photos. */
  initialStacks?: GalleryStack[];
  /** Raw rows, grouped in the browser. Fallback for callers that still pass them. */
  initialPhotos: GalleryPhoto[];
  /** ISO event date — drives the "opens on …" copy in the before state. */
  eventDate?: string;
  /** Present when the visitor arrived through the couple's forwarded link.
   *  Passed on to the upload endpoints so they allow the pre-event window. */
  galleryKey?: string;
  /** When true, render without the full-page chrome (no min-h-screen / gradient
   *  background / couple-names header) so it can be embedded as a hub tab. */
  embedded?: boolean;
  /** API base for the gallery endpoints. Defaults to the couple namespace;
   *  the standalone seating hub passes `/api/raspored-sedenja/${slug}`. */
  apiBase?: string;
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
        beforeTitle: "Галерија се отвара на дан венчања",
        beforeLead:
          "Тог дана овде шаљете фотографије које сте направили телефоном — све стижу младенцима на једно место.",
        opensOn: (d: string) => `Отвара се ${d}`,
        saveLink: "Сачувајте овај линк или задржите QR код — требаће вам тог дана.",
        howTitle: "Како то иде",
        step1: "Отворите овај линк или скенирајте QR",
        step1d: "Без апликације и без регистрације.",
        step2: "Изаберите слике са телефона",
        step2d: "Упишете своје име и пошаљете — то је све.",
        step3: "Младенци их преузимају",
        step3d: "Након слављa скидају све одједном.",
        upsell: "И ви можете овако — QR галерија за ваше слављe",
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
        beforeTitle: "Galerija se otvara na dan venčanja",
        beforeLead:
          "Tog dana ovde šaljete fotografije koje ste napravili telefonom — sve stižu mladencima na jedno mesto.",
        opensOn: (d: string) => `Otvara se ${d}`,
        saveLink: "Sačuvajte ovaj link ili zadržite QR kod — trebaće vam tog dana.",
        howTitle: "Kako to ide",
        step1: "Otvorite ovaj link ili skenirajte QR",
        step1d: "Bez aplikacije i bez registracije.",
        step2: "Izaberite slike sa telefona",
        step2d: "Upišete svoje ime i pošaljete — to je sve.",
        step3: "Mladenci ih preuzimaju",
        step3d: "Nakon slavlja skidaju sve odjednom.",
        upsell: "I vi možete ovako — QR galerija za vaše slavlje",
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

/** Browser-side fallback grouping, for callers that still pass raw rows.
 *  Rows arrive newest-first, so first sighting of a name is its cover. */
function stacksFromPhotos(photos: GalleryPhoto[]): GalleryStack[] {
  const map = new Map<string, GalleryStack>();
  for (const p of photos) {
    const name = p.guestName || "Gost";
    const hit = map.get(name);
    if (hit) hit.count++;
    else map.set(name, { name, count: 1, coverUrl: p.url });
  }
  return Array.from(map.values());
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
  initialStacks,
  initialPhotos,
  eventDate,
  galleryKey,
  embedded = false,
  apiBase,
}: Props) {
  const t = useMemo(() => strings(useCyrillic), [useCyrillic]);
  const base = apiBase ?? `/api/pozivnica/${slug}`;

  const openDateLabel = useMemo(() => {
    if (!eventDate) return null;
    const d = new Date(eventDate);
    if (Number.isNaN(d.getTime())) return null;
    // Explicit script subtag: bare "sr-RS" resolves to Cyrillic in ICU, which
    // would print a Cyrillic month in the middle of a Latin page.
    return d.toLocaleDateString(useCyrillic ? "sr-Cyrl-RS" : "sr-Latn-RS", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [eventDate, useCyrillic]);

  // The view draws one pile per guest — a cover, a count and a name. That is
  // what the server sends (grouped in Mongo), so the payload scales with the
  // number of guests instead of the number of photos. `initialPhotos` is the
  // fallback for callers that still hand over rows.
  const [groups, setGroups] = useState<GalleryStack[]>(
    () => initialStacks ?? stacksFromPhotos(initialPhotos)
  );
  const totalPhotos = useMemo(
    () => groups.reduce((sum, g) => sum + g.count, 0),
    [groups]
  );

  /** Fold this device's just-uploaded photos into its own pile. */
  function bumpOwnStack(name: string, addedCount: number, coverUrl: string) {
    const key = name || "Gost";
    setGroups((prev) => {
      const idx = prev.findIndex((g) => g.name === key);
      if (idx === -1) return [{ name: key, count: addedCount, coverUrl }, ...prev];
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        count: next[idx].count + addedCount,
        coverUrl,
      };
      // Newest activity floats to the front, matching the server's ordering.
      const [moved] = next.splice(idx, 1);
      return [moved, ...next];
    });
  }

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
        `${base}/galerija/upload/sign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileType: mime, k: galleryKey }),
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
        `${base}/galerija/upload/confirm`,
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
            k: galleryKey,
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
    [base, galleryKey, slug, guestName, caption]
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
      bumpOwnStack(guestName.trim(), added.length, added[added.length - 1].url);

      // Remember the name; if it changed, rename this device's earlier photos.
      const finalName = guestName.trim();
      const prevName = savedNameRef.current;
      try {
        localStorage.setItem("hu_gallery_name", finalName);
      } catch {
        /* ignore */
      }
      if (prevName && prevName !== finalName && uploaderIdRef.current) {
        fetch(`${base}/galerija/rename`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploaderId: uploaderIdRef.current,
            name: finalName,
            k: galleryKey,
          }),
        }).catch(() => {});
        // relabel the pile locally right away
        setGroups((prev) =>
          prev.map((g) => (g.name === prevName ? { ...g, name: finalName } : g))
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
  }, [files, guestName, t, uploadOne, base, galleryKey]);

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
      className={
        embedded
          ? ""
          : "min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]"
      }
      style={{ color: "var(--theme-text)" }}
    >
      <div
        className={
          embedded ? "max-w-3xl mx-auto" : "max-w-3xl mx-auto px-4 py-10 sm:py-14"
        }
      >
        {/* Header — hidden when embedded (the hub provides its own). */}
        {!embedded && (
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
          {showGrid && totalPhotos > 0 && (
            <p className="mt-3 font-raleway text-sm" style={{ color: "var(--theme-text-muted)" }}>
              {t.count(totalPhotos)} · {groups.length} {groups.length === 1 ? t.guest : t.guests}
            </p>
          )}
        </div>
        )}

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

        {/* Before the event: the QR was scanned early (the couple's forwarded
            link opens the window instead). Explain what this is and what to do
            on the day, rather than showing a single dead line. */}
        {phase === "before" && (
          <div className="max-w-md mx-auto py-6">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
                style={{ backgroundColor: "color-mix(in srgb, var(--theme-primary) 10%, transparent)" }}
              >
                <CalendarClock size={26} style={{ color: "var(--theme-primary)" }} strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-2xl mb-3" style={{ color: "var(--theme-primary)" }}>
                {t.beforeTitle}
              </h2>
              {openDateLabel && (
                <p className="font-raleway text-sm mb-3" style={{ color: "var(--theme-primary)" }}>
                  {t.opensOn(openDateLabel)}
                </p>
              )}
              <p className="font-serif text-base leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>
                {t.beforeLead}
              </p>
            </div>

            <div
              className="rounded-2xl px-5 py-6 mb-6"
              style={{ backgroundColor: "color-mix(in srgb, var(--theme-primary) 5%, transparent)" }}
            >
              <p
                className="font-raleway uppercase tracking-[0.18em] text-[11px] text-center mb-5"
                style={{ color: "var(--theme-text-muted)" }}
              >
                {t.howTitle}
              </p>
              <ol className="space-y-4">
                {[
                  { n: 1, icon: QrCode, title: t.step1, desc: t.step1d },
                  { n: 2, icon: Camera, title: t.step2, desc: t.step2d },
                  { n: 3, icon: Images, title: t.step3, desc: t.step3d },
                ].map(({ n, icon: Icon, title, desc }) => (
                  <li key={n} className="flex gap-3">
                    <div
                      className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "color-mix(in srgb, var(--theme-primary) 12%, transparent)" }}
                    >
                      <Icon size={16} style={{ color: "var(--theme-primary)" }} strokeWidth={1.6} />
                    </div>
                    <div>
                      <div className="font-raleway text-sm" style={{ color: "var(--theme-text)" }}>
                        {title}
                      </div>
                      <p className="font-raleway text-xs leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>
                        {desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-center font-raleway text-xs" style={{ color: "var(--theme-text-muted)" }}>
              {t.saveLink}
            </p>
          </div>
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
                const many = g.count > 1;
                return (
                  // Non-interactive on purpose: the public view only shows that
                  // photos were shared, not the photos themselves (privacy).
                  <div
                    key={g.name}
                    className="relative aspect-square"
                    aria-label={`${g.name} — ${g.count}`}
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
                        src={g.coverUrl}
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
                      <Images size={11} /> {g.count}
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

        {/* Subtle upsell — a guest at someone's wedding is a warm lead, but the
            couple's own page is not the place to shout. One quiet line, and only
            on the public page (never inside the seating hub tab). */}
        {!embedded && (
          <p className="text-center mt-16 pt-8" style={{ borderTop: "1px solid var(--theme-border-light)" }}>
            <a
              href="/qr-galerija-slika-sa-vencanja/"
              className="font-raleway text-xs opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: "var(--theme-text-muted)" }}
            >
              {t.upsell} →
            </a>
          </p>
        )}
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
