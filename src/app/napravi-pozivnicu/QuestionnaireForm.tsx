"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import * as Sentry from "@sentry/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Heart,
  HelpCircle,
  X,
  Plus,
  Trash2,
  Sparkles,
  Music,
  Info,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import FeatureInfoModal, {
  type FeatureInfoKey,
} from "@/components/ui/FeatureInfoModal";
import {
  pricing,
  formatPrice,
  getPremiumPrice,
  getPremiumRasporedPrice,
  getPremiumAudioPrice,
} from "@/data/pricing";
import {
  THEME_CONFIGS,
  WEDDING_THEME_KEYS,
  SCRIPT_FONT_CONFIGS,
  getThemeCSSVariables,
  getThemeConfig,
  buildCustomColorOverrides,
  blendHex,
} from "@/app/pozivnica/[slug]/constants";
import type {
  ThemeType,
  ScriptFontType,
  PremiumThemeType,
  EnvelopeItem,
} from "@/app/pozivnica/[slug]/types";
import { getThemeClasses } from "./premium-theme";
import dynamic from "next/dynamic";
import { PhoneVerificationField } from "@/components/verification/PhoneVerificationField";
import { BypassPhoneInput } from "@/components/verification/BypassPhoneInput";
import type { BypassInfo } from "./FormPageWrapper";
import {
  useRecaptcha,
  RecaptchaDisclosure,
} from "@/components/forms/RecaptchaProvider";

const PremiumStepAIPhoto = dynamic(() => import("./steps/PremiumStepAIPhoto"), {
  ssr: false,
});
const PremiumStepEnvelopeLab = dynamic(
  () => import("./steps/PremiumStepEnvelopeLab"),
  { ssr: false },
);

const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

// Whitened blobs from /api/premium-pozivnica/whiten-bg are written to
// `premium/whitened/{slug}/...`, while raw generated blobs live at
// `premium/results/{couple}/...`. The presence of the whitened path is
// the only ground-truth signal that fal.ai birefnet actually succeeded —
// the endpoint silently echoes the raw URL on any failure, so we can't
// just trust that resultUrl is set.
const isUrlWhitened = (url: string | undefined): boolean =>
  !!url && url.includes("/premium/whitened/");

// ─── Font categorization ──────────────────────────────────────────────────────

// Fonts hidden in Cyrillic mode (Latin-only; great-vibes works for both)
const LATIN_ONLY_FONTS = new Set<ScriptFontType>([
  "dancing-script",
  "alex-brush",
  "parisienne",
  "allura",
]);

// Fonts hidden in Latin mode (Cyrillic-specific)
const CYRILLIC_ONLY_FONTS = new Set<ScriptFontType>([
  "marck-script",
  "caveat",
  "bad-script",
]);

// ─── Date/text helpers ────────────────────────────────────────────────────────

const MONTHS_GEN = [
  "Januara",
  "Februara",
  "Marta",
  "Aprila",
  "Maja",
  "Juna",
  "Jula",
  "Avgusta",
  "Septembra",
  "Oktobra",
  "Novembra",
  "Decembra",
];

const MONTHS_DISPLAY = [
  "Januar",
  "Februar",
  "Mart",
  "April",
  "Maj",
  "Jun",
  "Jul",
  "Avgust",
  "Septembar",
  "Oktobar",
  "Novembar",
  "Decembar",
];

function toSerbianDeadline(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}. ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}.`;
}

function formatPreviewDate(dateStr: string): string {
  if (!dateStr) return "13 . 09 . 2026";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day} . ${month} . ${d.getFullYear()}`;
}

// ─── Form data types ──────────────────────────────────────────────────────────

type LocationType = "home" | "church" | "hall" | "ceremony";

interface LocationItem {
  type: LocationType;
  enabled: boolean;
  name: string;
  address: string;
  time: string;
}

interface FormData {
  // Step 1
  bride: string;
  groom: string;
  full_display: string;
  useCyrillic: boolean;
  // Premium AI
  premium: boolean;
  premium_theme: PremiumThemeType | "";
  ai_couple_image_url: string;
  premium_city: string;
  premium_car: string;
  couple_description: string;
  envelope_items: EnvelopeItem[];
  envelope_style: "classic" | "wing";
  envelope_rose_petals: boolean;
  // Extras
  extra_raspored: boolean;
  extra_audio: boolean;
  extra_usb_kaseta: boolean;
  extra_usb_bocica: boolean;
  extra_images: boolean;
  // File handles for user-uploaded gallery photos. Held in memory only;
  // pushed to Vercel Blob in handleSubmit after the couple is created.
  pendingImages: File[];
  extra_music: boolean;
  // Audio blob fetched from YouTube via /api/pozivnica/music-fetch. Same
  // pattern as pendingImages — kept in memory, uploaded on final submit.
  pendingMusic: {
    blob: Blob;
    title: string;
    sourceUrl: string;
    mime: string;
  } | null;
  // Step 2
  event_date: string; // combined "YYYY-MM-DDTHH:MM"
  event_date_only: string; // "YYYY-MM-DD" for DatePicker
  event_time: string; // "HH:MM" for time select
  submit_until: string; // formatted text e.g. "31. Avgusta 2026."
  submit_until_date: string; // "YYYY-MM-DD" for DatePicker
  contact_phone: string;
  contact_phone_secondary: string;
  /** Optional label shown next to the primary phone on the invitation.
   *  Empty = don't show the phone on the invitation. */
  contact_phone_name: string;
  /** Optional label shown next to the secondary phone on the invitation. */
  contact_phone_secondary_name: string;
  phone_trust_token: string;
  // Step 3
  theme: ThemeType;
  scriptFont: ScriptFontType;
  custom_primary_color: string; // "" means no custom color
  custom_background_color: string; // "" means no custom background
  // Step 4
  locations: LocationItem[];
  // Step 5
  tagline: string;
  thankYouFooter: string;
  // Step 7
  countdown_enabled: boolean;
  map_enabled: boolean;
  wishes: string;
}

// Step keys for validation — independent of step number
type StepKey =
  | "couple_info"
  | "ai_photo"
  | "envelope_lab"
  | "date_rsvp"
  | "design"
  | "locations"
  | "personal"
  | "settings";

const CLASSIC_STEPS: { key: StepKey; title: string }[] = [
  { key: "couple_info", title: "Informacije o paru" },
  { key: "date_rsvp", title: "Datum i rok za prijavu" },
  { key: "design", title: "Dizajn" },
  { key: "locations", title: "Lokacije" },
  { key: "personal", title: "Lični detalji" },
  { key: "settings", title: "Podešavanja" },
];

const PREMIUM_STEPS: { key: StepKey; title: string }[] = [
  { key: "couple_info", title: "Informacije o paru" },
  { key: "date_rsvp", title: "Datum i rok za prijavu" },
  { key: "ai_photo", title: "Stil pozivnice" },
  { key: "envelope_lab", title: "Envelope Lab" },
  { key: "locations", title: "Lokacije" },
  { key: "personal", title: "Lični detalji" },
  { key: "settings", title: "Podešavanja" },
];

function getSteps(isPremium: boolean) {
  if (!isPremium) return CLASSIC_STEPS;
  return PREMIUM_STEPS;
}

function getStepKey(step: number, isPremium: boolean): StepKey {
  const steps = getSteps(isPremium);
  return steps[step - 1]?.key ?? "couple_info";
}

const defaultFormData: FormData = {
  bride: "",
  groom: "",
  full_display: "",
  useCyrillic: false,
  premium: false,
  premium_theme: "",
  ai_couple_image_url: "",
  premium_city: "",
  premium_car: "",
  couple_description: "",
  envelope_items: [],
  envelope_style: "classic",
  envelope_rose_petals: false,
  extra_raspored: false,
  extra_audio: false,
  extra_usb_kaseta: false,
  extra_usb_bocica: false,
  extra_images: false,
  pendingImages: [],
  extra_music: false,
  pendingMusic: null,
  event_date: "",
  event_date_only: "",
  event_time: "18:00",
  submit_until: "",
  submit_until_date: "",
  contact_phone: "",
  contact_phone_secondary: "",
  contact_phone_name: "",
  contact_phone_secondary_name: "",
  phone_trust_token: "",
  theme: "classic_rose",
  scriptFont: "great-vibes",
  custom_primary_color: "",
  custom_background_color: "",
  locations: [
    { type: "home", enabled: false, name: "", address: "", time: "" },
    { type: "church", enabled: false, name: "", address: "", time: "" },
    { type: "hall", enabled: true, name: "", address: "", time: "" },
    { type: "ceremony", enabled: false, name: "", address: "", time: "" },
  ],
  tagline: "",
  thankYouFooter: "",
  countdown_enabled: true,
  map_enabled: true,
  wishes: "",
};

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const inputCls =
  "w-full border-b border-stone-200 focus:border-[var(--accent,#AE343F)] bg-transparent py-2.5 px-1 text-stone-800 text-base outline-none transition-colors placeholder:text-stone-300";

const labelCls =
  "block text-xs font-bold uppercase tracking-[0.18em] text-stone-400 mb-1.5";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className="text-xs text-stone-400 mt-1.5">{hint}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="text"
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 sm:w-11 sm:h-6 rounded-full transition-colors duration-200 flex-shrink-0 flex items-center ${checked ? "bg-[var(--accent,#AE343F)]" : "bg-stone-200"}`}
      >
        <div
          className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "sm:translate-x-6 translate-x-5" : "translate-x-1"}`}
        />
      </div>
      <span className="text-stone-600 text-xs sm:text-sm leading-tight">
        {label}
      </span>
    </label>
  );
}

// Reusable inline file picker for the user-facing gallery feature.
// Used by ExtrasAccordion (classic, max 3, paid 600 din) and PremiumStepAIPhoto
// (Fountain theme, max 2, included in price). Files stay in client state until
// the form's final submit, where they get pushed to Vercel Blob.
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

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-selecting the same file after removal
    if (picked.length === 0) return;

    const accepted: File[] = [];
    for (const f of picked) {
      if (!f.type.startsWith("image/")) {
        setError("Samo slike su dozvoljene.");
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError("Slika je veća od 5MB.");
        continue;
      }
      accepted.push(f);
    }
    const next = [...files, ...accepted].slice(0, max);
    onChange(next);
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
            className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors hover:bg-white/60"
            style={{
              borderColor: `rgba(${accentRgb}, 0.4)`,
              color: accentHex,
            }}
          >
            <Plus size={20} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Dodaj
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePick}
        className="hidden"
      />
      <p className="text-[11px] text-stone-500">
        {files.length}/{max} slika · do 5MB po slici · JPG, PNG, WebP
      </p>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// Subtle click-to-toggle info tooltip. Hover-only tooltips don't work on
// touch devices — most of our visitors are on mobile, so we wire it to a
// real button + click state and let CSS group-hover layer on as a
// desktop convenience.
function InfoTooltip({ text, ariaLabel }: { text: string; ariaLabel: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        aria-label={ariaLabel}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
      >
        <HelpCircle size={14} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 z-20 w-60 rounded-md bg-stone-800 text-white text-[11px] leading-relaxed px-2.5 py-2 shadow-lg pointer-events-none"
        >
          {text}
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-800 rotate-45" />
        </span>
      )}
    </span>
  );
}

// Tiny optional "label for this phone" input shown directly under each
// phone field. When the user fills it in, the matching phone shows up on
// the invitation with this label (e.g. "Mama mlade — +381..."). Empty
// label = phone stays hidden on the invitation (admin can flip later).
function PhoneNameInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="mt-2 space-y-1">
      <label className="block text-[11px] uppercase tracking-wider text-stone-400">
        Ime za prikaz na pozivnici (opciono)
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-stone-200 focus:border-[var(--accent,#AE343F)] py-1.5 px-1 text-sm text-stone-800 outline-none placeholder:text-stone-300 transition-colors"
        maxLength={40}
      />
      <p className="text-[10px] text-stone-400 italic leading-relaxed">
        Ako popunite, broj će se prikazati na pozivnici ispod RSVP forme.
      </p>
    </div>
  );
}

// Pastes a YouTube link, fetches the audio via /api/pozivnica/music-fetch
// (which streams it back as audio/mp4 with the title in an X-Music-Title
// Base64 header), and stashes the resulting Blob in form state for the
// final-step upload. Idempotent: the input is cleared once the audio is
// ready, and the user can hit "Ukloni" to start over.
export function MusicPicker({
  pending,
  onReady,
  onClear,
  accentHex,
  accentRgb,
}: {
  pending: FormData["pendingMusic"];
  onReady: (m: NonNullable<FormData["pendingMusic"]>) => void;
  onClear: () => void;
  accentHex: string;
  accentRgb: string;
}) {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "fetching" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isRetry, setIsRetry] = useState(false);

  // Re-derive the preview src from the in-memory Blob. Revoked on cleanup so
  // we don't leak object URLs each time the user re-picks a song.
  React.useEffect(() => {
    if (!pending) {
      setPreviewSrc(null);
      return;
    }
    const u = URL.createObjectURL(pending.blob);
    setPreviewSrc(u);
    return () => URL.revokeObjectURL(u);
  }, [pending]);

  // Single user-facing copy for every failure mode. We deliberately do
  // not surface raw browser/API error text on this page — users find it
  // confusing (often English, often technical).
  const FRIENDLY_ERROR =
    "Preuzimanje nije uspelo. Pokušajte još jednom ili probajte drugu pesmu.";

  // Carries a retry hint up out of the inner attempt so handleFetch can
  // decide whether to make a second attempt. 5xx + network = retriable,
  // 4xx = permanent (video itself is broken/forbidden, or rate limit).
  class FetchError extends Error {
    retriable: boolean;
    constructor(retriable: boolean) {
      super(FRIENDLY_ERROR);
      this.retriable = retriable;
    }
  }

  const attemptFetch = async (trimmed: string) => {
    let res: Response;
    try {
      res = await fetch("/api/pozivnica/music-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
    } catch {
      throw new FetchError(true);
    }
    if (!res.ok) {
      // Drain the body so the connection can be reused, but ignore
      // whatever the server said — we always show our friendly copy.
      await res.json().catch(() => ({}));
      throw new FetchError(res.status >= 500);
    }
    const titleB64 = res.headers.get("X-Music-Title") || "";
    let title = "Nepoznata pesma";
    try {
      // atob decodes Base64 → binary string; decodeURIComponent + escape
      // round-trips through UTF-8 so Cyrillic / emoji titles survive.
      title = decodeURIComponent(escape(atob(titleB64))) || title;
    } catch {
      /* keep default */
    }
    const mime = res.headers.get("Content-Type") || "audio/mp4";
    const blob = await res.blob();
    onReady({ blob, title, sourceUrl: trimmed, mime });
  };

  const handleFetch = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Nalepi YouTube link.");
      setState("error");
      return;
    }
    setError(null);
    setIsRetry(false);
    setState("fetching");
    try {
      await attemptFetch(trimmed);
      setUrl("");
      setState("idle");
      setIsRetry(false);
    } catch (err) {
      if (err instanceof FetchError && err.retriable) {
        // Brief pause so the failing yt-dlp / loader.to backend has a
        // moment to recover (cold-start, transient CDN drop, etc.) —
        // then one silent retry. The overlay copy switches to
        // "Ponovni pokušaj..." so the user knows we're still working.
        setIsRetry(true);
        await new Promise((r) => setTimeout(r, 1200));
        try {
          await attemptFetch(trimmed);
          setUrl("");
          setState("idle");
          setIsRetry(false);
          return;
        } catch {
          setError(FRIENDLY_ERROR);
          setState("error");
          setIsRetry(false);
          return;
        }
      }
      setError(FRIENDLY_ERROR);
      setState("error");
      setIsRetry(false);
    }
  };

  if (pending && previewSrc) {
    return (
      <div className="space-y-2">
        <div
          className="flex items-start gap-3 p-3 rounded-lg bg-white/70"
          style={{ border: `1px solid rgba(${accentRgb}, 0.25)` }}
        >
          <Music
            size={18}
            style={{ color: accentHex }}
            className="shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold truncate"
              style={{ color: accentHex }}
              title={pending.title}
            >
              {pending.title}
            </p>
            <audio
              controls
              src={previewSrc}
              className="w-full mt-2 h-9"
              preload="metadata"
            />
          </div>
          <button
            type="button"
            onClick={onClear}
            aria-label="Ukloni pesmu"
            className="shrink-0 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-stone-50 mt-0.5"
          >
            <X size={14} className="text-stone-600" />
          </button>
        </div>
      </div>
    );
  }

  const isFetching = state === "fetching";
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder="https://www.youtube.com/watch?v=..."
          disabled={isFetching}
          className="flex-1 min-w-0 bg-white border rounded-lg px-3 py-2 text-sm outline-none transition-colors disabled:opacity-50"
          style={{
            borderColor: `rgba(${accentRgb}, ${state === "error" ? 0.5 : 0.25})`,
          }}
        />
        <button
          type="button"
          onClick={handleFetch}
          disabled={isFetching || !url.trim()}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: accentHex }}
        >
          {isFetching ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Preuzimamo...
            </>
          ) : (
            "Pripremi"
          )}
        </button>
      </div>
      {error && state === "error" && (
        <p className="text-[11px] text-red-500">{error}</p>
      )}
      {isFetching &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm"
            // role=alertdialog + aria-busy so screen readers announce the wait
            role="alertdialog"
            aria-busy="true"
            aria-live="polite"
            // pointer-events: auto (default on this div) catches every click
            // / tap on the page beneath while the fetch is in flight.
            style={{ cursor: "wait" }}
          >
            <div
              className="flex flex-col items-center gap-4 rounded-2xl bg-white px-7 py-7 shadow-2xl max-w-[320px] mx-4 text-center"
              style={{ border: `1px solid rgba(${accentRgb}, 0.25)` }}
            >
              <Loader2
                size={36}
                className="animate-spin"
                style={{ color: accentHex }}
              />
              <div className="space-y-1.5">
                <p
                  className="text-sm font-semibold"
                  style={{ color: accentHex }}
                >
                  {isRetry ? "Ponovni pokušaj..." : "Preuzimanje pesme..."}
                </p>
                <p className="text-[12px] text-stone-600 leading-relaxed">
                  {isRetry
                    ? "Prvi pokušaj nije uspeo — pokušavamo još jednom."
                    : "Može trajati 20–45 sekundi. Molimo sačekajte."}
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function ExtrasAccordion({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  const isPremium = formData.premium;

  const rasporedPrice = isPremium
    ? getPremiumRasporedPrice()
    : pricing.pozivnica.raspored.price;
  const audioPrice = isPremium
    ? getPremiumAudioPrice()
    : pricing.pozivnica.audio.price;

  const imagesAddonPrice = pricing.addons.find((a) => a.id === "images")!.price;
  const musicAddonPrice = pricing.addons.find(
    (a) => a.id === "background_music",
  )!.price;

  // In premium mode, raspored/audio show the premium-bundled price with the
  // original classic price struck through; USBs keep their regular pricing.
  // extra_images is classic-only — premium Fountain offers a free 2-photo
  // gallery rendered in the Fountain step, other premium themes have none.
  // Galerija + Music render first so USBs (nested-rendered after the map)
  // stay directly under Audio knjiga. Music is available for both tiers;
  // Galerija stays classic-only.
  const extras = [
    ...(!isPremium
      ? [
          {
            key: "extra_images" as const,
            label: "Galerija fotografija",
            price: `+${formatPrice(imagesAddonPrice)}`,
            originalPrice: undefined,
          },
        ]
      : []),
    {
      key: "extra_music" as const,
      label: "Muzika u pozadini",
      price: `+${formatPrice(musicAddonPrice)}`,
      originalPrice: undefined,
    },
    {
      key: "extra_raspored" as const,
      label: "Raspored sedenja",
      price: `+${formatPrice(rasporedPrice)}`,
      originalPrice:
        isPremium && pricing.pozivnica.raspored.price > rasporedPrice
          ? pricing.pozivnica.raspored.price
          : undefined,
    },
    {
      key: "extra_audio" as const,
      label: "Audio knjiga utisaka",
      price: `+${formatPrice(audioPrice)}`,
      originalPrice:
        isPremium && pricing.pozivnica.audio.price > audioPrice
          ? pricing.pozivnica.audio.price
          : undefined,
    },
    {
      key: "extra_usb_kaseta" as const,
      label: "USB retro kaseta",
      price: `+${formatPrice(pricing.addons.find((a) => a.id === "usb_kaseta")!.price)}`,
      originalPrice: undefined,
    },
    {
      key: "extra_usb_bocica" as const,
      label: "USB u bočici",
      price: `+${formatPrice(pricing.addons.find((a) => a.id === "usb_bocica")!.price)}`,
      originalPrice: undefined,
    },
  ];

  const count = extras.filter(({ key }) => formData[key]).length;
  const [open, setOpen] = useState(() => count > 0);
  const [infoOpen, setInfoOpen] = useState<FeatureInfoKey>(null);
  const [musicTipOpen, setMusicTipOpen] = useState(false);

  const accentHex = isPremium ? "#d4af37" : "#AE343F";
  const accentRgb = isPremium ? "212,175,55" : "174,52,63";

  const openInfo = (
    e: React.MouseEvent | React.KeyboardEvent,
    key: "raspored" | "audio",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setInfoOpen(key);
  };

  const infoKeyFor = (key: string): "raspored" | "audio" | null => {
    if (key === "extra_raspored") return "raspored";
    if (key === "extra_audio") return "audio";
    return null;
  };

  return (
    <div
      className="mt-8 rounded-2xl overflow-hidden"
      style={{
        backgroundColor: `rgba(${accentRgb}, 0.04)`,
        border: `1px solid rgba(${accentRgb}, 0.18)`,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between cursor-pointer group px-4 sm:px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <Sparkles
            size={14}
            style={{ color: accentHex }}
            className="shrink-0"
          />
          <span
            className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em]"
            style={{ color: accentHex }}
          >
            {isPremium ? "Premium dodaci" : "Dodatne usluge"}
          </span>
          {count > 0 ? (
            <span
              className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-white text-[10px] font-bold"
              style={{ backgroundColor: accentHex }}
            >
              {count} izabrano
            </span>
          ) : (
            <span className="text-[10px] text-stone-500 font-medium uppercase tracking-wider">
              · opciono
            </span>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: accentHex }}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {!open && (
        <div className="px-4 sm:px-5 pb-3 -mt-1.5 text-[12px] text-stone-600 leading-relaxed">
          Raspored sedenja, audio knjiga utisaka i USB suveniri —{" "}
          <span className="font-medium" style={{ color: accentHex }}>
            kliknite za detalje
          </span>
          .
        </div>
      )}

      {open && (
        <div className="px-4 sm:px-5 pb-4 space-y-2.5">
          {extras
            .filter(
              ({ key }) =>
                key !== "extra_usb_kaseta" && key !== "extra_usb_bocica",
            )
            .map(({ key, label, price, originalPrice }) => {
              const info = infoKeyFor(key);
              const isOn = formData[key];
              return (
                <React.Fragment key={key}>
                  <label
                    className="flex items-center gap-3 py-1.5 px-2.5 rounded-lg cursor-pointer group bg-white/60 hover:bg-white transition-colors"
                    style={{
                      border: `1px solid rgba(${accentRgb}, ${isOn ? 0.25 : 0.1})`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={(e) => updateField(key, e.target.checked)}
                      className="w-4 h-4 cursor-pointer shrink-0"
                      style={{ accentColor: accentHex }}
                    />
                    <span className="text-sm text-stone-700 font-medium">
                      {label}
                    </span>
                    {key === "extra_music" && (
                      <span className="relative inline-flex">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMusicTipOpen((v) => !v);
                          }}
                          onBlur={() =>
                            setTimeout(() => setMusicTipOpen(false), 120)
                          }
                          aria-label="Više informacija o muzici u pozadini"
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                        >
                          <Info size={13} />
                        </button>
                        {musicTipOpen && (
                          <span
                            role="tooltip"
                            className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 z-20 w-60 rounded-md bg-stone-800 text-white text-[11px] leading-relaxed px-2.5 py-2 shadow-lg pointer-events-none"
                          >
                            Maksimalno 6 minuta. Vlasništvo i autorska prava nad
                            muzikom su vaša odgovornost.
                            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-800 rotate-45" />
                          </span>
                        )}
                      </span>
                    )}
                    {info && (
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Saznajte više o ${label}`}
                        onClick={(e) => openInfo(e, info)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            openInfo(e, info);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide cursor-pointer transition-colors"
                        style={{
                          color: accentHex,
                          backgroundColor: `rgba(${accentRgb}, 0.08)`,
                          border: `1px solid rgba(${accentRgb}, 0.2)`,
                        }}
                      >
                        <HelpCircle size={10} />
                        Šta je ovo?
                      </span>
                    )}
                    <span className="ml-auto flex items-baseline gap-1.5 shrink-0">
                      {originalPrice != null && (
                        <span className="text-[11px] text-stone-400 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                      <span
                        className="text-xs font-semibold"
                        style={{ color: accentHex }}
                      >
                        {price}
                      </span>
                    </span>
                  </label>
                  {key === "extra_images" && isOn && (
                    <div className="ml-5 mr-1 mt-1 mb-2">
                      <ImagePicker
                        files={formData.pendingImages}
                        onChange={(files) =>
                          updateField("pendingImages", files)
                        }
                        max={3}
                        accentHex={accentHex}
                        accentRgb={accentRgb}
                      />
                    </div>
                  )}
                  {key === "extra_music" && isOn && (
                    <div className="ml-5 mr-1 mt-1 mb-2">
                      <MusicPicker
                        pending={formData.pendingMusic}
                        onReady={(m) => updateField("pendingMusic", m)}
                        onClear={() => updateField("pendingMusic", null)}
                        accentHex={accentHex}
                        accentRgb={accentRgb}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          {/* USB options — nested under audio, mutually exclusive */}
          <div
            className={`ml-5 space-y-2 ${!formData.extra_audio ? "opacity-40 pointer-events-none" : ""}`}
          >
            {[
              {
                key: "extra_usb_kaseta" as const,
                other: "extra_usb_bocica" as const,
                label: "USB retro kaseta",
                price: `+${formatPrice(pricing.addons.find((a) => a.id === "usb_kaseta")!.price)}`,
              },
              {
                key: "extra_usb_bocica" as const,
                other: "extra_usb_kaseta" as const,
                label: "USB u bočici",
                price: `+${formatPrice(pricing.addons.find((a) => a.id === "usb_bocica")!.price)}`,
              },
            ].map(({ key, other, label, price }) => (
              <label
                key={key}
                className="flex items-center gap-3 py-1 px-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={formData[key]}
                  onChange={(e) => {
                    updateField(key, e.target.checked);
                    if (e.target.checked) updateField(other, false);
                  }}
                  className="w-3.5 h-3.5 cursor-pointer shrink-0"
                  style={{ accentColor: accentHex }}
                />
                <span className="text-xs text-stone-600">{label}</span>
                <span
                  className="text-[11px] ml-auto shrink-0 font-medium"
                  style={{ color: accentHex }}
                >
                  {price}
                </span>
              </label>
            ))}
          </div>
          {/* Sum + discount */}
          {(() => {
            let sum = isPremium
              ? getPremiumPrice()
              : pricing.pozivnica.website.price;
            if (formData.extra_raspored) sum += rasporedPrice;
            if (formData.extra_audio) sum += audioPrice;
            if (formData.extra_usb_kaseta)
              sum += pricing.addons.find((a) => a.id === "usb_kaseta")!.price;
            if (formData.extra_usb_bocica)
              sum += pricing.addons.find((a) => a.id === "usb_bocica")!.price;
            // Galerija fotografija — classic-only add-on. Premium Fountain
            // bundles it free; other premium themes don't offer it.
            if (!isPremium && formData.extra_images) sum += imagesAddonPrice;
            // Muzika u pozadini — flat add-on for both tiers.
            if (formData.extra_music) sum += musicAddonPrice;
            // Classic bundle discount only — Premium prices already encode it.
            const isFullBundle =
              !isPremium && formData.extra_raspored && formData.extra_audio;
            const discount = isFullBundle
              ? pricing.pozivnica.bundleFullPrice -
                pricing.pozivnica.bundlePrice
              : 0;
            const total = sum - discount;
            return (
              <div className="mt-3 pt-3 border-t border-stone-100 space-y-1">
                {isFullBundle && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-green-600">
                      Popust (kompletni paket)
                    </span>
                    <span className="text-[10px] text-green-600 font-medium">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-medium">
                    Ukupno
                  </span>
                  <span className="text-xs text-[var(--accent,#AE343F)] font-bold">
                    {isFullBundle && (
                      <span className="line-through text-stone-300 font-normal mr-1.5">
                        {formatPrice(sum)}
                      </span>
                    )}
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            );
          })()}
          <p className="text-[11px] text-stone-500 mt-2.5">
            <a
              href="/cene"
              className="hover:underline font-medium"
              style={{ color: accentHex }}
            >
              Pogledajte detaljne cene →
            </a>
          </p>
        </div>
      )}

      <div
        style={
          {
            "--cene-accent": accentHex,
            "--cene-accent-rgb": accentRgb,
          } as React.CSSProperties
        }
      >
        <FeatureInfoModal
          feature={infoOpen}
          onClose={() => setInfoOpen(null)}
        />
      </div>
    </div>
  );
}

function StepHeading({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-serif text-stone-800 mb-1">{title}</h2>
      {desc && <p className="text-stone-400 text-sm">{desc}</p>}
    </div>
  );
}

// ─── Invitation preview (Step 3) ──────────────────────────────────────────────

function InvitationPreview({
  theme,
  scriptFont,
  bride,
  groom,
  eventDate,
  useCyrillic,
  customPrimaryColor,
  customBackgroundColor,
}: {
  theme: ThemeType;
  scriptFont: ScriptFontType;
  bride: string;
  groom: string;
  eventDate: string;
  useCyrillic: boolean;
  customPrimaryColor?: string;
  customBackgroundColor?: string;
}) {
  const baseCssVars = getThemeCSSVariables(theme, scriptFont);
  const cssVars =
    customPrimaryColor || customBackgroundColor
      ? {
          ...baseCssVars,
          ...buildCustomColorOverrides(
            customPrimaryColor || baseCssVars["--theme-primary"],
            customBackgroundColor || undefined,
          ),
        }
      : baseCssVars;
  const config = getThemeConfig(theme);

  const brideName = bride || "Mladini";
  const groomName = groom || "Mladoženjini";
  const dateDisplay = formatPreviewDate(eventDate.split("T")[0]);
  const celebrateLove = useCyrillic ? "Прославите Љубав" : "Celebrate Love";

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        ...(cssVars as React.CSSProperties),
        backgroundColor: "var(--theme-surface)",
        minHeight: "300px",
      }}
    >
      {/* Preview label */}
      <div className="absolute top-3 right-3 z-10">
        <span
          className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full"
          style={{
            backgroundColor: "var(--theme-primary-muted)",
            color: "var(--theme-primary)",
          }}
        >
          Preview
        </span>
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center min-h-[300px] py-10 px-6 text-center">
        {/* Subtitle */}
        <div className="flex items-center gap-2 mb-7">
          <p
            className="font-elegant uppercase tracking-[0.4em] text-[9px]"
            style={{ color: "var(--theme-text-light)" }}
          >
            {celebrateLove}
          </p>
        </div>

        {/* Names */}
        <div className="flex flex-col items-center w-full">
          <h2
            className="font-script text-5xl leading-[0.88] drop-shadow-sm"
            style={{ color: "var(--theme-text)" }}
          >
            {brideName}
          </h2>

          <div className="flex items-center justify-center gap-5 my-4 w-full px-6">
            <div
              className="h-px flex-1 max-w-[80px]"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--theme-primary))",
                opacity: 0.4,
              }}
            />
            <Heart
              size={16}
              style={{ color: "var(--theme-primary)", opacity: 0.65 }}
              fill="currentColor"
            />
            <div
              className="h-px flex-1 max-w-[80px]"
              style={{
                background:
                  "linear-gradient(to left, transparent, var(--theme-primary))",
                opacity: 0.4,
              }}
            />
          </div>

          <h2
            className="font-script text-5xl leading-[0.88] drop-shadow-sm"
            style={{ color: "var(--theme-text)" }}
          >
            {groomName}
          </h2>
        </div>

        {/* Date */}
        <div className="mt-8 relative">
          <span
            className="font-serif tracking-[0.15em] text-lg px-8 py-4 block"
            style={{ color: "var(--theme-text)" }}
          >
            {dateDisplay}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  const tc = getThemeClasses(formData.premium);

  return (
    <div>
      {/* Pricing section */}
      <div className={`mb-3 p-5 ${tc.pricingBox}`}>
        <a
          href={formData.premium ? "/cene?premium=1" : "/cene"}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-between gap-3 text-sm font-semibold ${tc.priceText} hover:opacity-80 transition-opacity`}
        >
          <span>Pogledajte cenovnik i pakete</span>
          <ChevronRight size={18} className="flex-shrink-0" />
        </a>
      </div>

      {/* Live preview section — classic only */}
      {!formData.premium && (
        <a
          href="/pozivnica/ana-dejan"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg transition-colors text-xs sm:text-sm font-medium text-center bg-[var(--accent,#AE343F)] text-white hover:bg-[var(--accent-dark,#932d35)]"
        >
          <span>Pogledajte live primer pozivnice</span>
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <Field label="Ime mlade">
          <TextInput
            value={formData.bride}
            onChange={(v) => updateField("bride", v)}
            placeholder="npr. Ana"
          />
        </Field>
        <Field label="Ime mladoženje">
          <TextInput
            value={formData.groom}
            onChange={(v) => updateField("groom", v)}
            placeholder="npr. Marko"
          />
        </Field>
      </div>
      <Field label="Prikaz para (na pozivnici)">
        <TextInput
          value={formData.full_display}
          onChange={(v) => updateField("full_display", v)}
          placeholder="npr. Ana & Marko"
        />
      </Field>
      <div className="mt-6">
        <p className={labelCls}>Pismo</p>
        <div className="flex gap-3 mt-1">
          {[
            { val: false, label: "Latinica" },
            { val: true, label: "Ćirilica" },
          ].map(({ val, label }) => (
            <button
              key={label}
              type="button"
              disabled={formData.premium && val === true}
              onClick={() => updateField("useCyrillic", val)}
              className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                formData.premium && val === true
                  ? "border-stone-100 text-stone-300 cursor-not-allowed opacity-50"
                  : formData.useCyrillic === val
                    ? formData.premium
                      ? "bg-gradient-to-r from-[#d4af37] to-[#c5a028] border-[#d4af37] text-white"
                      : "bg-[var(--accent,#AE343F)] border-[var(--accent,#AE343F)] text-white"
                    : "border-stone-200 text-stone-500 hover:border-stone-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {formData.useCyrillic && (
          <p className="text-xs text-stone-400 mt-2">
            Za ćirilicu je dostupan ograničen broj kaligrafskih fontova (4
            umesto 5).
          </p>
        )}
      </div>

      {/* Extras accordion — also rendered in premium, with gold accent + discounted prices */}
      <ExtrasAccordion formData={formData} updateField={updateField} />
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 13 }, (_, i) => i + 9); // 09–21
const MINUTES = ["00", "15", "30", "45"];

function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (t: string) => void;
}) {
  const parts = value.split(":");
  const h = parts[0] || "";
  const m = parts[1] || "";
  const minRef = useRef<HTMLInputElement>(null);
  const hrRef = useRef<HTMLInputElement>(null);

  const digitCls =
    "w-8 bg-transparent text-center text-stone-800 text-base outline-none font-medium placeholder:text-stone-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  const handleHour = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    const clamped =
      digits.length === 2
        ? String(Math.min(Number(digits), 23)).padStart(2, "0")
        : digits;
    onChange(`${clamped}:${m}`);
    if (clamped.length === 2) minRef.current?.focus();
  };

  const handleMinute = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    const clamped =
      digits.length === 2
        ? String(Math.min(Number(digits), 59)).padStart(2, "0")
        : digits;
    onChange(`${h}:${clamped}`);
  };

  const handleMinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !m) {
      e.preventDefault();
      hrRef.current?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center border-b border-stone-200 focus-within:border-[var(--accent,#AE343F)] transition-colors py-2.5 px-1">
      <input
        ref={hrRef}
        type="text"
        inputMode="numeric"
        className={digitCls}
        value={h}
        onChange={(e) => handleHour(e.target.value)}
        placeholder="HH"
        maxLength={2}
      />
      <span className="text-stone-400 font-bold text-base select-none">:</span>
      <input
        ref={minRef}
        type="text"
        inputMode="numeric"
        className={digitCls}
        value={m}
        onChange={(e) => handleMinute(e.target.value)}
        onKeyDown={handleMinKeyDown}
        placeholder="MM"
        maxLength={2}
      />
    </div>
  );
}

function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (t: string) => void;
}) {
  const [h, m] = value.split(":") ?? ["18", "00"];

  const selectCls =
    "bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 text-base outline-none focus:border-[var(--accent,#AE343F)] transition-colors cursor-pointer appearance-none text-center font-medium";

  return (
    <div className="flex items-center gap-2">
      <select
        className={selectCls + " w-20"}
        value={h}
        onChange={(e) => onChange(`${e.target.value}:${m}`)}
      >
        {HOURS.map((hr) => (
          <option key={hr} value={String(hr).padStart(2, "0")}>
            {String(hr).padStart(2, "0")}
          </option>
        ))}
      </select>
      <span className="text-stone-400 font-bold text-lg select-none">:</span>
      <select
        className={selectCls + " w-20"}
        value={m}
        onChange={(e) => onChange(`${h}:${e.target.value}`)}
      >
        {MINUTES.map((min) => (
          <option key={min} value={min}>
            {min}
          </option>
        ))}
      </select>
      <span className="text-stone-500 text-sm ml-1">h</span>
    </div>
  );
}

function PhoneTagInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const tags = value ? value.split(",").filter((t) => t.trim()) : [];
  const [draft, setDraft] = useState("");

  const commitTag = (raw: string) => {
    const cleaned = raw.replace(/[^0-9 ]/g, "").trim();
    if (!cleaned) return;
    const next = tags.length ? `${value},${cleaned}` : cleaned;
    onChange(next);
    setDraft("");
  };

  const removeTag = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx).join(","));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw.includes(",")) {
      commitTag(raw.replace(",", ""));
      return;
    }
    setDraft(raw.replace(/^\+?381/, "").replace(/\D/g, ""));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitTag(draft);
    }
    if (e.key === "Backspace" && !draft && tags.length) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 focus-within:border-[var(--accent,#AE343F)] transition-colors py-1">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-sm text-stone-700"
        >
          +381 {tag.trim()}
          <button
            type="button"
            onClick={() => removeTag(i)}
            className="text-stone-400 hover:text-[var(--accent,#AE343F)] transition-colors"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      {tags.length < 2 && (
        <div className="flex items-center flex-1 min-w-[120px]">
          <span className="py-1.5 pl-1 pr-2 text-stone-400 text-base select-none">
            +381
          </span>
          <input
            type="tel"
            className="flex-1 bg-transparent py-1.5 pr-1 text-stone-800 text-base outline-none placeholder:text-stone-300"
            placeholder={tags.length ? "Drugi broj" : "6X XXX XXXX"}
            value={draft}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (draft.trim()) commitTag(draft);
            }}
          />
        </div>
      )}
    </div>
  );
}

function Step2({
  formData,
  updateField,
  bypassInfo,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  bypassInfo?: BypassInfo;
}) {
  const [showSecondaryPhone, setShowSecondaryPhone] = useState(
    !!formData.contact_phone_secondary,
  );
  const secondaryPrefix = bypassInfo?.callingCode || "+381";
  const secondaryStripRegex = new RegExp(
    `^\\+?${secondaryPrefix.replace(/^\+/, "")}`,
  );
  const handleWeddingDateChange = (dateOnly: string) => {
    updateField("event_date_only", dateOnly);
    updateField(
      "event_date",
      dateOnly ? `${dateOnly}T${formData.event_time}` : "",
    );
  };

  const handleTimeChange = (time: string) => {
    updateField("event_time", time);
    if (formData.event_date_only) {
      updateField("event_date", `${formData.event_date_only}T${time}`);
    }
  };

  const handleDeadlineDateChange = (dateOnly: string) => {
    updateField("submit_until_date", dateOnly);
    updateField("submit_until", toSerbianDeadline(dateOnly));
  };

  return (
    <div>
      <StepHeading
        title="Datum i rok za prijavu"
        desc="Izaberite datum venčanja i krajnji rok za RSVP."
      />
      <div className="space-y-8">
        {/* Wedding date + time */}
        <div>
          <p className={labelCls}>Datum venčanja</p>
          <DatePicker
            value={formData.event_date_only}
            onChange={handleWeddingDateChange}
            placeholder="Izaberite datum"
            variant="light"
            accentColor={formData.premium ? "#d4af37" : undefined}
            showQuickActions={false}
          />
        </div>

        <div>
          <p className={labelCls}>Vreme skupa u sali</p>
          <TimePicker value={formData.event_time} onChange={handleTimeChange} />
        </div>

        {/* Deadline */}
        <div>
          <p className={labelCls}>Rok za potvrdu dolaska</p>
          <DatePicker
            value={formData.submit_until_date}
            onChange={handleDeadlineDateChange}
            placeholder="Izaberite krajnji datum"
            variant="light"
            accentColor={formData.premium ? "#d4af37" : undefined}
            showQuickActions={false}
          />
          {formData.submit_until && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">
                Prikaz:
              </span>
              <span className="text-sm text-stone-600 font-medium">
                {formData.submit_until}
              </span>
            </div>
          )}
        </div>

        {/* Contact phone */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <label className={labelCls + " !mb-0"}>Vaš kontakt telefon</label>
            <InfoTooltip
              ariaLabel="Više informacija o kontakt telefonu"
              text="Koristimo ga da Vas kontaktiramo ukoliko nešto zatreba. Možete dodati još jedan broj i imena koja će se prikazati na pozivnici."
            />
          </div>
          {bypassInfo ? (
            <BypassPhoneInput
              value={formData.contact_phone}
              onChange={(v) => updateField("contact_phone", v)}
              callingCode={bypassInfo.callingCode}
              countryLabel={bypassInfo.countryLabel}
            />
          ) : (
            <PhoneVerificationField
              value={formData.contact_phone}
              onChange={(v) => {
                updateField("contact_phone", v);
                if (formData.phone_trust_token) {
                  updateField("phone_trust_token", "");
                }
              }}
              onVerified={(token) => updateField("phone_trust_token", token)}
              onUnverified={() => updateField("phone_trust_token", "")}
            />
          )}
          {formData.contact_phone &&
            (bypassInfo || formData.phone_trust_token) && (
              <PhoneNameInput
                value={formData.contact_phone_name}
                onChange={(v) => updateField("contact_phone_name", v)}
                placeholder="Ime čiji je broj ..."
              />
            )}
          {bypassInfo || formData.phone_trust_token ? (
            showSecondaryPhone ? (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs text-stone-500">
                    Drugi broj za pozivnicu (neće biti verifikovan)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      updateField("contact_phone_secondary", "");
                      setShowSecondaryPhone(false);
                    }}
                    className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    Ukloni
                  </button>
                </div>
                <div className="flex items-center border-b border-stone-200 focus-within:border-[var(--accent,#AE343F)] transition-colors">
                  <span className="py-1.5 pl-1 pr-2 text-stone-400 text-base select-none">
                    {secondaryPrefix}
                  </span>
                  <input
                    type="tel"
                    autoFocus
                    className="flex-1 bg-transparent py-1.5 pr-1 text-stone-800 text-base outline-none placeholder:text-stone-300"
                    placeholder="6X XXX XXXX"
                    value={formData.contact_phone_secondary}
                    onChange={(e) =>
                      updateField(
                        "contact_phone_secondary",
                        e.target.value
                          .replace(secondaryStripRegex, "")
                          .replace(/\D/g, "")
                          .replace(/^0+/, ""),
                      )
                    }
                  />
                </div>
                {formData.contact_phone_secondary && (
                  <PhoneNameInput
                    value={formData.contact_phone_secondary_name}
                    onChange={(v) =>
                      updateField("contact_phone_secondary_name", v)
                    }
                    placeholder="Ime čiji je broj ..."
                  />
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSecondaryPhone(true)}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 py-2.5 text-xs font-medium text-stone-500 hover:border-[var(--accent,#AE343F)] hover:text-[var(--accent,#AE343F)] transition-colors"
              >
                <Plus size={14} />
                Dodaj drugi broj za pozivnicu (opciono)
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function Step3({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  const [showColorModal, setShowColorModal] = useState(false);
  const [tempPrimaryColor, setTempPrimaryColor] = useState(
    formData.custom_primary_color || "#AE343F",
  );
  const [tempBackgroundColor, setTempBackgroundColor] = useState(
    formData.custom_background_color || "#F5F4DC",
  );

  const colorInputRef = React.useRef<HTMLInputElement>(null);
  const bgInputRef = React.useRef<HTMLInputElement>(null);

  const themes = WEDDING_THEME_KEYS.map(
    (key) =>
      [key, THEME_CONFIGS[key]] as [
        ThemeType,
        (typeof THEME_CONFIGS)[ThemeType],
      ],
  );
  const fonts = Object.entries(SCRIPT_FONT_CONFIGS) as [
    ScriptFontType,
    (typeof SCRIPT_FONT_CONFIGS)[ScriptFontType],
  ][];

  const isCyrillic = formData.useCyrillic;

  const isFontDisabled = (fontKey: ScriptFontType) => {
    if (isCyrillic) return LATIN_ONLY_FONTS.has(fontKey);
    return CYRILLIC_ONLY_FONTS.has(fontKey);
  };

  const availableFonts = fonts.filter(([key]) => !isFontDisabled(key));
  const selectedFontCfg = SCRIPT_FONT_CONFIGS[formData.scriptFont];

  return (
    <div>
      <StepHeading
        title="Dizajn"
        desc="Izaberite temu i font — pregled se ažurira uživo."
      />

      {/* Live preview */}
      <div className="mb-6">
        <p className={labelCls + " mb-3"}>Pregled pozivnice</p>
        <InvitationPreview
          theme={formData.theme}
          scriptFont={formData.scriptFont}
          bride={formData.bride}
          groom={formData.groom}
          eventDate={formData.event_date}
          useCyrillic={formData.useCyrillic}
          customPrimaryColor={formData.custom_primary_color}
          customBackgroundColor={formData.custom_background_color}
        />
        {formData.useCyrillic && (
          <p className="text-xs text-stone-400 mt-2">
            * Ukoliko niste uneli podatke ćirilicom, mi ćemo ih konvertovati za
            finalni proizvod — ovo je samo pregled.
          </p>
        )}
      </div>

      {/* Font dropdown — right below preview */}
      <div className="mb-8">
        <p className={labelCls + " mb-2"}>Kaligrafski font</p>
        <div className="relative">
          <select
            value={formData.scriptFont}
            onChange={(e) =>
              updateField("scriptFont", e.target.value as ScriptFontType)
            }
            className="w-full appearance-none bg-white border border-stone-200 rounded-xl px-4 py-3 pr-10 text-stone-800 text-sm font-medium outline-none focus:border-[var(--accent,#AE343F)] focus:ring-2 focus:ring-[var(--accent,#AE343F)]/10 transition-all cursor-pointer"
          >
            {availableFonts.map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.name} — {cfg.description}
              </option>
            ))}
          </select>
          {/* Chevron */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        {selectedFontCfg && (
          <p className="text-xs text-stone-400 mt-1.5 pl-1">
            {selectedFontCfg.description}
          </p>
        )}
      </div>

      {/* Theme selector */}
      <p className={labelCls + " mb-3"}>Tema pozivnice</p>
      <div className="grid grid-cols-2 gap-3">
        {themes.map(([key, cfg]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              updateField("theme", key);
              updateField("custom_primary_color", "");
              updateField("custom_background_color", "");
            }}
            className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
              formData.theme === key && !formData.custom_primary_color
                ? "border-[var(--accent,#AE343F)] shadow-md"
                : "border-stone-100 hover:border-stone-200"
            }`}
          >
            <div
              className="w-8 h-8 rounded-full mb-2 border border-black/5"
              style={{ backgroundColor: cfg.colors.primary }}
            />
            <p className="text-sm font-semibold text-stone-700">{cfg.name}</p>
            <p className="text-xs text-stone-400">{cfg.symbolism}</p>
            {formData.theme === key && !formData.custom_primary_color && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--accent,#AE343F)] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </button>
        ))}

        {/* 6th card: Custom colors (primary + background) */}
        <button
          type="button"
          onClick={() => {
            updateField("theme", "classic_rose");
            const initPrimary = formData.custom_primary_color || "#AE343F";
            if (!formData.custom_primary_color) {
              setTempPrimaryColor(initPrimary);
            } else {
              setTempPrimaryColor(formData.custom_primary_color);
            }
            if (!formData.custom_background_color) {
              const autoBg = blendHex("#FFFFFF", initPrimary, 0.06);
              setTempBackgroundColor(autoBg);
            } else {
              setTempBackgroundColor(formData.custom_background_color);
            }
            setShowColorModal(true);
          }}
          className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
            formData.custom_primary_color
              ? "border-[var(--accent,#AE343F)] shadow-md"
              : "border-stone-100 hover:border-stone-200"
          }`}
        >
          {/* Two color swatches (simplified) */}
          <div className="flex gap-2.5 mb-3">
            <div
              className="w-8 h-8 rounded-full border border-black/10 shadow-sm"
              style={{
                background: formData.custom_primary_color
                  ? formData.custom_primary_color
                  : "linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff)",
              }}
            />
            <div
              className="w-8 h-8 rounded-full border border-black/10 shadow-sm"
              style={{
                background: formData.custom_background_color
                  ? formData.custom_background_color
                  : "#F5F4DC",
              }}
            />
          </div>

          <p className="text-sm font-semibold text-stone-700">
            Prilagođena boja
          </p>
          <p className="text-xs text-stone-400">Izaberi svoju</p>

          {/* Selected indicator */}
          {formData.custom_primary_color && (
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--accent,#AE343F)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          )}
        </button>
      </div>

      {/* Pricing note for custom color */}
      {(formData.custom_primary_color || formData.custom_background_color) &&
        (() => {
          const customColorAddon = pricing.addons.find(
            (addon) => addon.id === "custom_color",
          );
          const price = customColorAddon
            ? formatPrice(customColorAddon.price)
            : "600 din";
          return (
            <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800">
              ℹ️ Za prilagođenu boju biće vam naplaćeno dodatnih{" "}
              <strong>{price}</strong>.
            </div>
          );
        })()}

      {/* Color picker modal */}
      <AnimatePresence>
        {showColorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowColorModal(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-stone-800">
                  Prilagođena boja
                </h2>
                <p className="text-sm text-stone-400 mt-1">
                  Izaberite boje za svoju temu
                </p>
              </div>

              {/* Color pickers */}
              <div className="space-y-4">
                {/* Accent color */}
                <div>
                  <label className={labelCls}>Akcenti</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={tempPrimaryColor}
                      onChange={(e) => setTempPrimaryColor(e.target.value)}
                      className="w-16 h-16 rounded-xl border-2 border-stone-200 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-mono text-stone-600">
                        {tempPrimaryColor.toUpperCase()}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        Glavna boja teme
                      </p>
                    </div>
                  </div>
                </div>

                {/* Background color */}
                <div>
                  <label className={labelCls}>Pozadina</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={tempBackgroundColor}
                      onChange={(e) => setTempBackgroundColor(e.target.value)}
                      className="w-16 h-16 rounded-xl border-2 border-stone-200 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-mono text-stone-600">
                        {tempBackgroundColor.toUpperCase()}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        Boja pozadine pozivnice
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-2xl overflow-hidden border border-stone-200 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
                  Pregled
                </p>
                <div
                  className="rounded-lg p-4 space-y-2 text-center"
                  style={{
                    background: tempBackgroundColor,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full mx-auto shadow-sm"
                    style={{ background: tempPrimaryColor }}
                  />
                  <p
                    className="text-sm font-semibold"
                    style={{ color: tempPrimaryColor }}
                  >
                    Prilagođena boja
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowColorModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50 transition-colors"
                >
                  Otkaži
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateField("custom_primary_color", tempPrimaryColor);
                    updateField("custom_background_color", tempBackgroundColor);
                    setShowColorModal(false);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--accent,#AE343F)] text-white font-semibold hover:bg-[var(--accent-dark,#8B2833)] transition-colors"
                >
                  Potvrdi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

const VENUE_DEFS: {
  type: LocationType;
  emoji: string;
  title: string;
  subtitle: string;
  namePlaceholder: string;
  addressPlaceholder: string;
  timePlaceholder: string;
}[] = [
  {
    type: "home",
    emoji: "🏠",
    title: "Polazak od kuće",
    subtitle: "Početna tačka vašeg svadbenog dana",
    namePlaceholder: "npr. Kuća Jovanovića",
    addressPlaceholder: "npr. Cara Dušana 12, Novi Sad",
    timePlaceholder: "npr. 14:00",
  },
  {
    type: "church",
    emoji: "⛪",
    title: "Venčanje u crkvi",
    subtitle: "Crkvena ceremonija venčanja",
    namePlaceholder: "npr. Crkva Svetog Nikole",
    addressPlaceholder: "npr. Trg Slobode 7, Novi Sad",
    timePlaceholder: "npr. 15:30",
  },
  {
    type: "hall",
    emoji: "🎊",
    title: "Svečana sala / restoran",
    subtitle: "Proslava u sali uz muziku i ples",
    namePlaceholder: "npr. Restoran Elegance",
    addressPlaceholder: "npr. Futoška 44, Novi Sad",
    timePlaceholder: "npr. 18:00",
  },
  {
    type: "ceremony",
    emoji: "💍",
    title: "Građansko venčanje",
    subtitle: "Ceremonijalno venčanje kod matičara",
    namePlaceholder: "npr. Matičarska služba / restoran Vila Mir",
    addressPlaceholder: "npr. Bulevar Mihajla Pupina 25",
    timePlaceholder: "npr. 16:00",
  },
];

function Step4({
  formData,
  toggleLocation,
  updateLocation,
  addDuplicateHome,
  removeDuplicateHome,
}: {
  formData: FormData;
  toggleLocation: (i: number) => void;
  updateLocation: (
    i: number,
    f: "name" | "address" | "time",
    v: string,
  ) => void;
  addDuplicateHome: () => void;
  removeDuplicateHome: (i: number) => void;
}) {
  // Build render list: pair each location with its VENUE_DEF template
  const defByType = Object.fromEntries(
    VENUE_DEFS.map((d) => [d.type, d]),
  ) as Record<LocationType, (typeof VENUE_DEFS)[number]>;
  const items: {
    loc: LocationItem;
    def: (typeof VENUE_DEFS)[number];
    idx: number;
    isDuplicate: boolean;
  }[] = [];
  for (let i = 0; i < formData.locations.length; i++) {
    const loc = formData.locations[i];
    const def = defByType[loc.type];
    const isDuplicate =
      loc.type === "home" &&
      i > 0 &&
      formData.locations[i - 1]?.type === "home";
    items.push({ loc, def, idx: i, isDuplicate });
  }

  // Check if a second home already exists
  const homeCount = formData.locations.filter((l) => l.type === "home").length;
  const firstHomeIdx = formData.locations.findIndex((l) => l.type === "home");
  const firstHomeEnabled =
    firstHomeIdx >= 0 && formData.locations[firstHomeIdx].enabled;

  return (
    <div>
      <StepHeading
        title="Lokacije"
        desc="Uključite lokacije koje su deo vašeg dana i popunite detalje."
      />

      <div className="space-y-3">
        {items.map(({ loc, def, idx, isDuplicate }) => {
          const active = loc.enabled;
          const homeLabel = isDuplicate ? "Polazak od kuće (2)" : def.title;
          const homeSubtitle = isDuplicate
            ? "Druga početna tačka (npr. mladina kuća)"
            : def.subtitle;

          return (
            <div
              key={`${loc.type}-${idx}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                active
                  ? "border-[var(--accent,#AE343F)]/30 shadow-sm"
                  : "border-stone-100"
              }`}
            >
              {/* Header row */}
              <div
                className={`flex items-center flex-wrap gap-3 sm:gap-4 px-4 sm:px-5 py-4 transition-colors ${
                  active ? "bg-[var(--accent,#AE343F)]/5" : "bg-stone-50/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleLocation(idx)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  {/* Toggle circle */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                      active
                        ? "border-[var(--accent,#AE343F)] bg-[var(--accent,#AE343F)]"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {active && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  <p
                    className={`font-semibold text-sm ${active ? "text-stone-800" : "text-stone-400"}`}
                  >
                    {homeLabel}
                  </p>
                </button>

                {/* Add second home button */}
                {loc.type === "home" &&
                  active &&
                  !isDuplicate &&
                  homeCount < 2 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addDuplicateHome();
                      }}
                      className="group relative flex items-center justify-center w-7 h-7 rounded-full border border-dashed border-stone-300 hover:border-[var(--accent,#AE343F)] hover:bg-[var(--accent,#AE343F)]/5 transition-colors shrink-0"
                      title="Dodaj drugi polazak"
                    >
                      <Plus
                        size={14}
                        className="text-stone-400 group-hover:text-[var(--accent,#AE343F)] transition-colors"
                      />
                    </button>
                  )}

                {/* Remove duplicate home button */}
                {isDuplicate && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDuplicateHome(idx);
                    }}
                    className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-red-50 transition-colors shrink-0"
                    title="Ukloni drugi polazak"
                  >
                    <Trash2
                      size={14}
                      className="text-stone-400 hover:text-red-500 transition-colors"
                    />
                  </button>
                )}
              </div>

              {/* Expanded fields */}
              {active && (
                <div className="px-5 pb-5 pt-3 space-y-4 bg-white">
                  <div className="grid grid-cols-[1fr_100px] gap-4 items-end">
                    <Field label="Naziv">
                      <TextInput
                        value={loc.name}
                        onChange={(v) => updateLocation(idx, "name", v)}
                        placeholder={
                          isDuplicate
                            ? "npr. Kuća Petrovića"
                            : def.namePlaceholder
                        }
                      />
                    </Field>
                    <div>
                      <label className={labelCls}>Vreme</label>
                      <TimeInput
                        value={loc.time}
                        onChange={(v) => updateLocation(idx, "time", v)}
                      />
                    </div>
                  </div>
                  <Field label="Adresa">
                    <TextInput
                      value={loc.address}
                      onChange={(v) => updateLocation(idx, "address", v)}
                      placeholder={
                        isDuplicate
                          ? "npr. Bulevar Oslobođenja 5, Novi Sad"
                          : def.addressPlaceholder
                      }
                    />
                  </Field>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!formData.premium && (
        <>
          {/* Hint about adding second home */}
          {firstHomeEnabled && homeCount < 2 && (
            <p className="text-xs text-stone-400 mt-3 text-center">
              Imate dva polaska? Kliknite{" "}
              <Plus size={10} className="inline -mt-0.5" /> pored &ldquo;Polazak
              od kuće&rdquo;.
            </p>
          )}

          <p className="text-xs text-stone-300 mt-4 text-center">
            Google Maps linkove dodajemo mi nakon prijema upitnika.
          </p>
        </>
      )}
    </div>
  );
}

function Step5({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div>
      <StepHeading
        title="Lični detalji"
        desc="Personalizovana poruka i zahvalnica na pozivnici."
      />
      <div className="space-y-6">
        <Field label="Tagline (citat / poruka pozivnice)">
          <textarea
            className="w-full border-b border-stone-200 focus:border-[var(--accent,#AE343F)] bg-transparent py-2.5 px-1 text-stone-800 text-base outline-none transition-colors placeholder:text-stone-300 resize-none"
            rows={3}
            maxLength={220}
            value={formData.tagline}
            onChange={(e) => updateField("tagline", e.target.value)}
            placeholder="npr. Najlepše priče se ne pišu same — pomozite nam da naše novo poglavlje otvorimo na najlepši način!"
          />
          <p className="text-xs text-stone-300 text-right">
            {formData.tagline.length}/220
          </p>
        </Field>
        <Field label="Zahvalnica (poruka na dnu pozivnice)">
          <textarea
            className="w-full border-b border-stone-200 focus:border-[var(--accent,#AE343F)] bg-transparent py-2.5 px-1 text-stone-800 text-base outline-none transition-colors placeholder:text-stone-300 resize-none"
            rows={3}
            maxLength={120}
            value={formData.thankYouFooter}
            onChange={(e) => updateField("thankYouFooter", e.target.value)}
            placeholder="npr. Naša radost je potpuna samo uz ljude koje volimo! Hvala što ste tu."
          />
          <p className="text-xs text-stone-300 text-right">
            {formData.thankYouFooter.length}/120
          </p>
        </Field>
      </div>
    </div>
  );
}

// ─── Step 6 ───────────────────────────────────────────────────────────────────

function Step6({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div>
      <StepHeading
        title="Poslednji korak!"
        desc="Izaberite šta želite da se prikaže na pozivnici. RSVP formu za potvrdu dolaska ćemo podesiti mi."
      />
      <div className="space-y-6 -mt-4">
        {/* Info box */}
        <div>
          <p className="text-[11px] text-stone-400 leading-relaxed text-center mb-0">
            Slanjem zahteva prihvatate politiku odustanka navedenu u podnožju
            sajta.
          </p>
          <div className="bg-[var(--accent,#AE343F)]/5 border border-[var(--accent,#AE343F)]/15 rounded-2xl px-5 py-4 text-sm text-[#8B2833] leading-relaxed">
            <p className="font-semibold mb-1">🎉 Skoro sve je spremno!</p>
            <p>
              Nakon kreiranja pozivnice, na portalu{" "}
              <strong>Moje Venčanje</strong> možete pratiti potvrde gostiju,
              organizovati raspored sedenja, planirati budžet i još mnogo toga.
              Kredencijale za prijavu ćete dobiti zajedno sa pozivnicom.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <p className={labelCls}>Šta prikazati gostima?</p>

          <Toggle
            checked={formData.countdown_enabled}
            onChange={(v) => updateField("countdown_enabled", v)}
            label="Odbrojavanje do venčanja (dani, sati, minuti, sekunde)"
          />
          <Toggle
            checked={formData.map_enabled}
            onChange={(v) => updateField("map_enabled", v)}
            label="Interaktivna google mapa do lokacija venčanja (crkva & sala)"
          />
        </div>

        <Field label="Posebne napomene ili zahtevi (opciono)">
          <textarea
            className="w-full border-b border-stone-200 focus:border-[var(--accent,#AE343F)] bg-transparent py-2.5 px-1 text-stone-800 text-base outline-none transition-colors placeholder:text-stone-300 resize-none"
            rows={3}
            value={formData.wishes}
            onChange={(e) => updateField("wishes", e.target.value)}
            placeholder="Ovde napišite ukoliko imate posebne zahteve ili napomene..."
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function QuestionnaireForm({
  onPremiumChange,
  upgradeSlug,
  lockPremiumToggle,
  initialFormData,
  bypassInfo,
}: {
  onPremiumChange?: (isPremium: boolean) => void;
  upgradeSlug?: string;
  lockPremiumToggle?: boolean;
  initialFormData?: Partial<FormData>;
  bypassInfo?: BypassInfo;
}) {
  const isUpgrade = !!upgradeSlug;
  const { execute: executeRecaptcha } = useRecaptcha();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(() => ({
    ...defaultFormData,
    ...(initialFormData ?? {}),
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Drives the dynamic spinner copy on the submit button so the user knows
  // *what* we're doing during the multi-stage submit
  // (create → upload images → upload music).
  const [submitPhase, setSubmitPhase] = useState<
    null | "creating" | "uploading-images" | "uploading-music"
  >(null);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  }>({ current: 0, total: 0 });

  // Warn the user if they try to close the tab / hit back while the multi-stage
  // submit is mid-flight. The image upload loop runs *after* the create call
  // succeeds, and a couple created without its photos still works but is harder
  // to recover (admin has to upload manually); guarding here makes accidental
  // close less likely.
  React.useEffect(() => {
    if (!isSubmitting) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isSubmitting]);
  // Tracks whether the line_art background-whitening fire-and-forget is still
  // running. Submit is blocked while this is true so users can't ship a raw
  // (white-bg) Pollinations URL into a transparent-bg theme.
  const [isWhitening, setIsWhitening] = useState(false);
  const whitenTokenRef = useRef(0);
  const formTopRef = useRef<HTMLDivElement>(null);

  // Notify parent about premium mode changes
  React.useEffect(() => {
    onPremiumChange?.(formData.premium);
  }, [formData.premium, onPremiumChange]);

  // Reset the AI generation attempt counter when entering an upgrade flow.
  // Returning users coming via the "Nadogradi" link from the portal start
  // with a fresh budget — otherwise they'd inherit any attempts spent in a
  // previous (incomplete) session under the same couple name.
  React.useEffect(() => {
    if (!isUpgrade) return;
    try {
      const cacheKey = `premium_gen_${formData.bride.toLowerCase()}_${formData.groom.toLowerCase()}`;
      localStorage.removeItem(cacheKey);
    } catch {}
    // Run once per upgrade-mode mount; bride/groom come from initialFormData
    // and don't change during the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpgrade]);

  // Read URL params from /cene page (skip in upgrade mode — initialFormData is authoritative)
  React.useEffect(() => {
    if (isUpgrade) return;
    const params = new URLSearchParams(window.location.search);
    if (params.toString()) {
      const wantsPremium = params.get("premium") === "1";
      setFormData((prev) => ({
        ...prev,
        premium: wantsPremium || prev.premium,
        // Premium flow doesn't support Cyrillic; mirror handlePremiumToggle.
        useCyrillic: wantsPremium ? false : prev.useCyrillic,
        extra_raspored: params.get("raspored") === "1" || prev.extra_raspored,
        extra_audio: params.get("audio") === "1" || prev.extra_audio,
        extra_usb_kaseta:
          params.get("usb_kaseta") === "1" || prev.extra_usb_kaseta,
        extra_usb_bocica:
          params.get("usb_bocica") === "1" || prev.extra_usb_bocica,
      }));
    }
  }, [isUpgrade]);

  // Prepopulate hall venue time if it's already enabled
  React.useEffect(() => {
    const hallIdx = formData.locations.findIndex((l) => l.type === "hall");
    if (hallIdx < 0) return;
    const hallVenue = formData.locations[hallIdx];
    if (
      hallVenue.enabled &&
      formData.event_time &&
      hallVenue.time !== formData.event_time
    ) {
      setFormData((prev) => {
        const locations = [...prev.locations];
        const hi = locations.findIndex((l) => l.type === "hall");
        if (hi >= 0)
          locations[hi] = { ...locations[hi], time: prev.event_time };
        return { ...prev, locations };
      });
    }
  }, [formData.event_time]);

  const updateField = <K extends keyof FormData>(
    key: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };

      // Auto-generate full_display when bride/groom names change
      if (key === "bride" || key === "groom") {
        const bride = key === "bride" ? (value as string) : prev.bride;
        const groom = key === "groom" ? (value as string) : prev.groom;
        const autoGen = `${prev.bride} & ${prev.groom}`;
        if (prev.full_display === "" || prev.full_display === autoGen) {
          updated.full_display = `${bride} & ${groom}`;
        }
      }

      // Clear USB extras when audio is unchecked
      if (key === "extra_audio" && !value) {
        updated.extra_usb_kaseta = false;
        updated.extra_usb_bocica = false;
      }

      // Drop the buffered audio Blob when the user un-checks Music. Keeps
      // the form state honest so the submit flow doesn't try to upload an
      // orphaned song the user backed out of.
      if (key === "extra_music" && !value) {
        updated.pendingMusic = null;
      }

      // Auto-switch font when language changes
      if (key === "useCyrillic") {
        const toCyrillic = value as boolean;
        if (toCyrillic && LATIN_ONLY_FONTS.has(prev.scriptFont)) {
          updated.scriptFont = "marck-script";
        } else if (!toCyrillic && CYRILLIC_ONLY_FONTS.has(prev.scriptFont)) {
          updated.scriptFont = "great-vibes";
        }
      }

      return updated;
    });
  };

  const [stepError, setStepError] = useState("");

  const handlePremiumToggle = () => {
    if (!formData.premium) {
      updateField("premium", true);
      updateField("useCyrillic", false);
    } else {
      updateField("premium", false);
    }
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const steps = getSteps(formData.premium);
  const totalSteps = steps.length;
  const currentStepKey = getStepKey(step, formData.premium);

  // When toggling premium off while on a premium-only step, jump to step 1
  React.useEffect(() => {
    if (step > totalSteps) {
      setStep(1);
    }
  }, [formData.premium, step, totalSteps]);

  const goNext = () => {
    const key = currentStepKey;
    if (key === "couple_info") {
      if (!formData.bride.trim() || !formData.groom.trim()) {
        setStepError("Unesite imena mladenaca pre nego što nastavite.");
        return;
      }
    }
    if (key === "ai_photo") {
      if (!formData.premium_theme) {
        setStepError("Izaberite stil pozivnice pre nego što nastavite.");
        return;
      }
      // line_art (Modern Parallax) is built around the AI couple illustration —
      // can't proceed without one, otherwise the rendered invitation has a
      // visible empty hero spot.
      if (
        formData.premium_theme === "line_art" &&
        !formData.ai_couple_image_url
      ) {
        setStepError("Generišite ilustraciju para pre nego što nastavite.");
        return;
      }
      // watercolor (Luxury Romance) renders a city background + a vintage car —
      // both are required for the theme to look complete.
      if (formData.premium_theme === "watercolor") {
        if (!formData.premium_city) {
          setStepError("Izaberite pozadinu pre nego što nastavite.");
          return;
        }
        if (!formData.premium_car) {
          setStepError("Izaberite vozilo pre nego što nastavite.");
          return;
        }
      }
      // Async background whitening — fires when leaving this step. Only treat
      // it as a real success if the response URL points at the whitened blob
      // path; the endpoint echoes the raw URL on any internal failure.
      if (
        formData.ai_couple_image_url &&
        formData.premium_theme === "line_art" &&
        !isUrlWhitened(formData.ai_couple_image_url)
      ) {
        const myToken = ++whitenTokenRef.current;
        const sourceUrl = formData.ai_couple_image_url;
        setIsWhitening(true);
        fetch("/api/premium-pozivnica/whiten-bg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: sourceUrl,
            bride: formData.bride,
            groom: formData.groom,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            // Drop stale responses (user regenerated and re-fired whitening)
            if (whitenTokenRef.current !== myToken) return;
            if (isUrlWhitened(d.resultUrl)) {
              updateField("ai_couple_image_url", d.resultUrl);
            }
            setIsWhitening(false);
          })
          .catch(() => {
            if (whitenTokenRef.current !== myToken) return;
            setIsWhitening(false);
          });
      }
    }
    // envelope_lab has no mandatory validation
    if (key === "date_rsvp") {
      if (!formData.event_date_only) {
        setStepError("Izaberite datum venčanja.");
        return;
      }
      if (!formData.submit_until_date) {
        setStepError("Izaberite rok za potvrdu dolaska.");
        return;
      }
      if (!formData.contact_phone.trim()) {
        setStepError("Unesite vaš kontakt telefon.");
        return;
      }
      if (!bypassInfo && !formData.phone_trust_token) {
        setStepError(
          "Verifikujte kontakt telefon putem SMS koda pre nego što nastavite.",
        );
        return;
      }
    }
    if (key === "locations") {
      const incomplete = formData.locations.find(
        (l) => l.enabled && (!l.time || !/^\d{2}:\d{2}$/.test(l.time)),
      );
      if (incomplete) {
        setStepError("Unesite vreme za sve uključene lokacije.");
        return;
      }
    }
    if (key === "personal" && !formData.tagline.trim()) {
      setStepError("Unesite tagline poruku za pozivnicu.");
      return;
    }
    setStepError("");
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps));
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };
  const goPrev = () => {
    setStepError("");
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const toggleLocation = (idx: number) =>
    setFormData((prev) => {
      const locations = [...prev.locations];
      const wasEnabled = locations[idx].enabled;
      locations[idx] = { ...locations[idx], enabled: !locations[idx].enabled };
      // Prepopulate time for hall venue when enabling
      if (
        !wasEnabled &&
        locations[idx].type === "hall" &&
        formData.event_time
      ) {
        locations[idx] = { ...locations[idx], time: formData.event_time };
      }
      // If disabling the first home, also remove any duplicate home
      if (wasEnabled && locations[idx].type === "home" && idx === 0) {
        const dupeIdx = locations.findIndex(
          (l, i) => i > 0 && l.type === "home",
        );
        if (dupeIdx > 0) locations.splice(dupeIdx, 1);
      }
      return { ...prev, locations };
    });

  const addDuplicateHome = () =>
    setFormData((prev) => {
      const hasTwo =
        prev.locations.filter((l) => l.type === "home").length >= 2;
      if (hasTwo) return prev;
      // Insert right after first home
      const firstHomeIdx = prev.locations.findIndex((l) => l.type === "home");
      const locations = [...prev.locations];
      locations.splice(firstHomeIdx + 1, 0, {
        type: "home",
        enabled: true,
        name: "",
        address: "",
        time: "",
      });
      return { ...prev, locations };
    });

  const removeDuplicateHome = (idx: number) =>
    setFormData((prev) => {
      const locations = prev.locations.filter((_, i) => i !== idx);
      return { ...prev, locations };
    });

  const updateLocation = (
    idx: number,
    field: "name" | "address" | "time",
    value: string,
  ) =>
    setFormData((prev) => {
      const locations = [...prev.locations];
      locations[idx] = { ...locations[idx], [field]: value };
      return { ...prev, locations };
    });

  const handleSubmit = async () => {
    // line_art needs an AI illustration at all
    if (
      formData.premium &&
      formData.premium_theme === "line_art" &&
      !formData.ai_couple_image_url
    ) {
      setError("Generišite ilustraciju para pre nego što pošaljete zahtev.");
      return;
    }
    // If background whitening is in flight, wait it out
    if (
      formData.premium &&
      formData.premium_theme === "line_art" &&
      isWhitening
    ) {
      setError(
        "Sačekajte još malo dok se slika u pozadini obradi i pripremi za pozivnicu.",
      );
      return;
    }
    setError(null);
    setIsSubmitting(true);
    setSubmitPhase("creating");

    // Hard gate: for line_art, ai_couple_image_url MUST point at the
    // whitened blob path before we persist. The fire-and-forget whiten
    // from goNext can fail silently (FAL_KEY missing, fal.ai timeout,
    // birefnet FAILED, sharp crash) and leave the raw blob URL in form
    // state. Re-run whiten synchronously here as a last-chance retry.
    let aiCoupleImageUrl = formData.ai_couple_image_url;
    if (
      formData.premium &&
      formData.premium_theme === "line_art" &&
      aiCoupleImageUrl &&
      !isUrlWhitened(aiCoupleImageUrl)
    ) {
      try {
        const res = await fetch("/api/premium-pozivnica/whiten-bg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: aiCoupleImageUrl,
            bride: formData.bride,
            groom: formData.groom,
          }),
        });
        const d = await res.json();
        if (!isUrlWhitened(d?.resultUrl)) {
          setError(
            "Slika nije uspešno obrađena. Vratite se na korak za ilustraciju i kliknite 'Generiši ponovo' pa Dalje.",
          );
          setIsSubmitting(false);
          return;
        }
        aiCoupleImageUrl = d.resultUrl;
        setFormData((prev) => ({ ...prev, ai_couple_image_url: d.resultUrl }));
      } catch {
        setError(
          "Greška pri obradi slike. Sačekajte par sekundi i pokušajte ponovo.",
        );
        setIsSubmitting(false);
        return;
      }
    }

    let recaptchaToken: string;
    try {
      recaptchaToken = await executeRecaptcha("create_invitation");
    } catch {
      setError("Provera neuspešna. Osvežite stranicu i pokušajte ponovo.");
      setIsSubmitting(false);
      return;
    }

    const phonePrefix = bypassInfo?.callingCode || "+381";
    // Build the phone list + parallel name/show arrays. A blank name means
    // the user didn't opt in to displaying that phone on the invitation,
    // so show_numbers[i] stays false (admin can flip it later). Arrays
    // stay aligned with the comma-split contact_phone string so the
    // pozivnica page can zip them by index.
    const phoneEntries: Array<{
      phone: string;
      name: string;
    }> = [];
    if (formData.contact_phone) {
      phoneEntries.push({
        phone: `${phonePrefix}${formData.contact_phone}`,
        name: formData.contact_phone_name.trim(),
      });
    }
    if (formData.contact_phone_secondary) {
      phoneEntries.push({
        phone: `${phonePrefix}${formData.contact_phone_secondary}`,
        name: formData.contact_phone_secondary_name.trim(),
      });
    }
    const combinedPhone = phoneEntries.map((e) => e.phone).join(",");
    const anyName = phoneEntries.some((e) => e.name !== "");
    // Only send the arrays when at least one name is present — otherwise
    // we'd be overwriting the couple's stored defaults with empty arrays.
    const phoneShowNumbers = anyName
      ? phoneEntries.map((e) => e.name !== "")
      : undefined;
    const phoneNumberNames = anyName
      ? phoneEntries.map((e) => e.name)
      : undefined;

    // Photo gallery gating + per-tier cap. Classic = 3 (paid add-on, gated by
    // the extras checkbox); Premium Fountain = 2 (bundled, gated only by the
    // user having queued at least one file); other premium themes = none.
    const isFountainGallery =
      formData.premium &&
      formData.premium_theme === "fountain" &&
      formData.pendingImages.length > 0;
    const isClassicGallery = !formData.premium && formData.extra_images;
    const imagesCap = formData.premium ? 2 : 3;
    const imagesToUpload =
      isClassicGallery || isFountainGallery
        ? formData.pendingImages.slice(0, imagesCap)
        : [];

    // Sequential upload helper. Runs *after* couple creation succeeds. Each
    // failure logs to Sentry and continues — couple link is fine without the
    // photo, admin can upload missing ones via the admin panel.
    const uploadPendingImages = async (slug: string) => {
      if (imagesToUpload.length === 0) return;
      setSubmitPhase("uploading-images");
      setUploadProgress({ current: 0, total: imagesToUpload.length });
      for (let i = 0; i < imagesToUpload.length; i++) {
        setUploadProgress({ current: i, total: imagesToUpload.length });
        const fd = new FormData();
        fd.append("image", imagesToUpload[i]);
        try {
          const r = await fetch(
            `/api/pozivnica/${encodeURIComponent(slug)}/images-upload`,
            { method: "POST", body: fd },
          );
          if (!r.ok) {
            const j = await r.json().catch(() => ({}));
            throw new Error(j.error || `Upload failed (${r.status})`);
          }
        } catch (err) {
          Sentry.captureException(err, {
            tags: { feature: "images-upload" },
            extra: { slug, idx: i, total: imagesToUpload.length },
          });
        }
      }
      setUploadProgress({
        current: imagesToUpload.length,
        total: imagesToUpload.length,
      });
    };

    // Background music upload. Same best-effort posture as images: on failure
    // log to Sentry, don't block the success screen. Admin can re-upload via
    // the admin panel using either a file or another YouTube link.
    const paidForMusic = formData.extra_music && formData.pendingMusic !== null;
    const uploadPendingMusic = async (slug: string) => {
      if (!paidForMusic || !formData.pendingMusic) return;
      setSubmitPhase("uploading-music");
      const fd = new FormData();
      // Filename here is purely informational — the server derives the
      // pathname from the slug and MIME type.
      const ext = formData.pendingMusic.mime.includes("mp4")
        ? "m4a"
        : formData.pendingMusic.mime.includes("mpeg")
          ? "mp3"
          : "audio";
      const file = new File([formData.pendingMusic.blob], `song.${ext}`, {
        type: formData.pendingMusic.mime,
      });
      fd.append("audio", file);
      fd.append("title", formData.pendingMusic.title);
      fd.append("source_url", formData.pendingMusic.sourceUrl);
      try {
        const r = await fetch(
          `/api/pozivnica/${encodeURIComponent(slug)}/music-upload`,
          { method: "POST", body: fd },
        );
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || `Music upload failed (${r.status})`);
        }
      } catch (err) {
        Sentry.captureException(err, {
          tags: { feature: "music-upload" },
          extra: { slug },
        });
      }
    };

    try {
      if (formData.premium) {
        // Premium flow: upgrade-or-create depending on isUpgrade
        const premiumUrl = isUpgrade
          ? `/api/premium-pozivnica/${encodeURIComponent(upgradeSlug!)}/upgrade`
          : "/api/premium-pozivnica/create";
        const premiumPayload = {
          bride: formData.bride,
          groom: formData.groom,
          full_display: formData.full_display,
          useCyrillic: formData.useCyrillic,
          event_date: formData.event_date,
          submit_until_date: formData.submit_until_date,
          theme: formData.theme,
          scriptFont: formData.scriptFont,
          premium_theme: formData.premium_theme,
          ai_couple_image_url: aiCoupleImageUrl,
          premium_city: formData.premium_city,
          premium_car: formData.premium_car,
          couple_description: formData.couple_description,
          envelope_items: formData.envelope_items,
          envelope_style: formData.envelope_style,
          envelope_rose_petals: formData.envelope_rose_petals,
          tagline: formData.tagline,
          thankYouFooter: formData.thankYouFooter,
          countdown_enabled: formData.countdown_enabled,
          map_enabled: formData.map_enabled,
          custom_primary_color: formData.custom_primary_color,
          custom_background_color: formData.custom_background_color,
          contact_phone: combinedPhone,
          phone_trust_token: formData.phone_trust_token,
          ...(phoneShowNumbers ? { show_numbers: phoneShowNumbers } : {}),
          ...(phoneNumberNames ? { number_names: phoneNumberNames } : {}),
          paid_for_images: isFountainGallery,
          paid_for_music: formData.extra_music,
          ...(bypassInfo ? { bypass_token: bypassInfo.token } : {}),
          recaptcha_token: recaptchaToken,
          locations: formData.locations
            .filter(
              (l) => l.enabled && (l.type === "hall" || l.type === "church"),
            )
            .map((l) => ({
              name: l.name,
              address: l.address,
              map_url: "",
              type: l.type,
            })),
          timeline: [...formData.locations]
            .filter((l) => l.enabled)
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((l) => {
              const typeToIcon: Record<string, string> = {
                home: "HouseHeart",
                church: "Church",
                ceremony: "Heart",
                hall: "Utensils",
              };
              const typeToWhat: Record<string, string> = {
                home: "Polazak od kuće",
                church: "Crkveno venčanje",
                ceremony: "Građansko venčanje",
                hall: "Skup u svečanoj sali",
              };
              return {
                title: l.name,
                time: l.time,
                description: l.address,
                what: typeToWhat[l.type] || "",
                icon: typeToIcon[l.type] || "MapPin",
              };
            }),
        };
        const res = await fetch(premiumUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(premiumPayload),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Greška pri kreiranju pozivnice");

        // Send admin notification from client (Web3Forms blocks server-side requests).
        // Fire-and-forget *before* the upload loop so admin gets notified even
        // if a photo upload hangs at the very end.
        if (WEB3FORMS_ACCESS_KEY) {
          const subject = isUpgrade
            ? `🌟 NADOGRADNJA u PREMIUM - ${formData.bride} & ${formData.groom}`
            : `🌟 Nova PREMIUM Pozivnica - ${formData.bride} & ${formData.groom}`;
          fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_key: WEB3FORMS_ACCESS_KEY,
              subject,
              from_name: "Halo Pozivnice Premium",
              Par: `${formData.bride} & ${formData.groom}`,
              Slug: data.slug,
              Tip: isUpgrade
                ? "Upgrade postojećeg draft-a (planiranje-vencanja)"
                : "Novo kreiranje",
              "AI Tema": formData.premium_theme || "(nije izabrana)",
              "Galerija (Fountain)": isFountainGallery
                ? `✅ ${imagesToUpload.length} slika`
                : "❌ Ne",
              "Muzika u pozadini": paidForMusic
                ? `✅ "${formData.pendingMusic?.title || ""}"`
                : formData.extra_music
                  ? "✅ (bez pesme — admin da uploaduje)"
                  : "❌ Ne",
              "Preview URL": `https://halouspomene.rs/premium-pozivnica/${data.slug}`,
              "Admin link": `https://halouspomene.rs/admin/${data.slug}`,
              "JSON podaci": JSON.stringify(
                premiumPayload,
                (k, v) => (k === "recaptcha_token" ? undefined : v),
                2,
              ),
            }),
          }).catch(() => {});
        }

        // Cleanup: delete ALL draft blobs (the whitened version is already saved separately)
        fetch("/api/premium-pozivnica/cleanup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bride: formData.bride,
            groom: formData.groom,
          }),
        }).catch(() => {});

        // Submission complete — drop the entire generation cache (count,
        // images, expiresAt). Next visit starts fresh, so users don't carry
        // over a spent attempt counter into a future upgrade or re-creation.
        try {
          const cacheKey = `premium_gen_${formData.bride.toLowerCase()}_${formData.groom.toLowerCase()}`;
          localStorage.removeItem(cacheKey);
        } catch {}

        // Push Fountain gallery files to Vercel Blob. User waits on the
        // spinner through this phase.
        await uploadPendingImages(data.slug);
        // Then push background music (if any). Single-file, similar pattern.
        await uploadPendingMusic(data.slug);

        setIsSubmitted(true);
        return;
      }

      // Classic flow: save to MongoDB, notify admin via Web3Forms
      const typeToIcon: Record<string, string> = {
        home: "HouseHeart",
        church: "Church",
        ceremony: "Heart",
        hall: "Utensils",
      };
      const typeToWhat: Record<string, string> = {
        home: "Polazak od kuće",
        church: "Crkveno venčanje",
        ceremony: "Građansko venčanje",
        hall: "Skup u svečanoj sali",
      };

      const classicUrl = isUpgrade
        ? `/api/pozivnica/${encodeURIComponent(upgradeSlug!)}/upgrade`
        : "/api/pozivnica/create";
      const classicApiPayload = {
        bride: formData.bride,
        groom: formData.groom,
        full_display: formData.full_display,
        useCyrillic: formData.useCyrillic,
        event_date: formData.event_date,
        submit_until_date: formData.submit_until_date,
        theme: formData.theme,
        scriptFont: formData.scriptFont,
        tagline: formData.tagline,
        thankYouFooter: formData.thankYouFooter,
        countdown_enabled: formData.countdown_enabled,
        map_enabled: formData.map_enabled,
        paid_for_raspored: formData.extra_raspored,
        paid_for_audio: formData.extra_audio,
        paid_for_audio_USB: formData.extra_usb_kaseta
          ? "kaseta"
          : formData.extra_usb_bocica
            ? "bocica"
            : "",
        paid_for_images: isClassicGallery,
        paid_for_music: formData.extra_music,
        custom_primary_color: formData.custom_primary_color || undefined,
        custom_background_color: formData.custom_background_color || undefined,
        contact_phone: combinedPhone,
        phone_trust_token: formData.phone_trust_token,
        ...(phoneShowNumbers ? { show_numbers: phoneShowNumbers } : {}),
        ...(phoneNumberNames ? { number_names: phoneNumberNames } : {}),
        ...(bypassInfo ? { bypass_token: bypassInfo.token } : {}),
        recaptcha_token: recaptchaToken,
        locations: formData.locations
          .filter(
            (l) => l.enabled && (l.type === "hall" || l.type === "church"),
          )
          .map((l) => ({ name: l.name, address: l.address, type: l.type })),
        timeline: [...formData.locations]
          .filter((l) => l.enabled)
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((l) => ({
            title: l.name,
            time: l.time,
            description: l.address,
            what: typeToWhat[l.type] || "",
            icon: typeToIcon[l.type] || "MapPin",
          })),
      };
      const res = await fetch(classicUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classicApiPayload),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Greška pri kreiranju pozivnice");

      // Notify admin (fire-and-forget from client — Web3Forms blocks server requests).
      // Fires before the upload loop so admin gets notified even if an upload hangs.
      if (WEB3FORMS_ACCESS_KEY) {
        const subject = isUpgrade
          ? `📬 NADOGRADNJA Pozivnice - ${formData.full_display}`
          : `📬 Nova Pozivnica - ${formData.full_display}`;
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject,
            from_name: "Halo Pozivnice",
            Par: formData.full_display,
            Slug: data.slug,
            Tip: isUpgrade
              ? "Upgrade postojećeg draft-a (planiranje-vencanja)"
              : "Novo kreiranje",
            "Kontakt telefon": combinedPhone,
            "Raspored sedenja": formData.extra_raspored ? "✅ DA" : "❌ Ne",
            "Audio knjiga": formData.extra_audio ? "✅ DA" : "❌ Ne",
            "USB suvenir": formData.extra_usb_kaseta
              ? "USB retro kaseta"
              : formData.extra_usb_bocica
                ? "USB u bočici"
                : "❌ Ne",
            "Galerija fotografija": isClassicGallery
              ? `✅ DA (${imagesToUpload.length} slika)`
              : "❌ Ne",
            "Muzika u pozadini": paidForMusic
              ? `✅ "${formData.pendingMusic?.title || ""}"`
              : formData.extra_music
                ? "✅ (bez pesme — admin da uploaduje)"
                : "❌ Ne",
            Napomena: formData.wishes || "(nema)",
            "Admin link": `https://halouspomene.rs/admin/${data.slug}`,
            "JSON podaci": JSON.stringify(
              classicApiPayload,
              (k, v) => (k === "recaptcha_token" ? undefined : v),
              2,
            ),
          }),
        }).catch(() => {});
      }

      // Push gallery files to Vercel Blob. User waits on the spinner.
      await uploadPendingImages(data.slug);
      // Then push background music (if any).
      await uploadPendingMusic(data.slug);

      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Došlo je do greške pri slanju. Pokušajte ponovo.",
      );
    } finally {
      setIsSubmitting(false);
      setSubmitPhase(null);
    }
  };

  // Success screen
  if (isSubmitted) {
    const successAccent = formData.premium ? "#d4af37" : "#AE343F";
    const successTextMuted = formData.premium ? "#8B7355" : "#8B2833";
    return (
      <div
        className={`p-12 text-center max-w-2xl mx-auto ${getThemeClasses(formData.premium).card}`}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
          style={{
            backgroundColor: successAccent,
            boxShadow: `0 10px 25px ${successAccent}40`,
          }}
        >
          {formData.premium ? (
            <Sparkles size={40} className="text-white" />
          ) : (
            <CheckCircle2 size={40} className="text-white" />
          )}
        </div>
        <h2
          className="text-3xl font-serif mb-4"
          style={{ color: successAccent }}
        >
          Hvala, {formData.bride} i {formData.groom}!
        </h2>
        <p className="text-lg mb-3" style={{ color: successTextMuted }}>
          {formData.premium
            ? "Uspešno smo primili sve podatke za vašu Premium pozivnicu."
            : "Uspešno smo primili sve podatke za vašu pozivnicu."}
        </p>
        {formData.event_date_only && (
          <p className="text-[var(--accent,#AE343F)]/70 mb-8">
            Venčanje:{" "}
            {new Date(
              formData.event_date_only + "T12:00:00",
            ).toLocaleDateString(
              formData.useCyrillic ? "sr-Cyrl-RS" : "sr-Latn-RS",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            )}
          </p>
        )}
        <p style={{ color: successTextMuted }} className="text-sm">
          {formData.premium
            ? "Uskoro ćemo vam se javiti sa detaljima vaše premium pozivnice."
            : "Uskoro ćemo napraviti vašu pozivnicu i kontaktirati vas."}
        </p>
      </div>
    );
  }

  const progress = ((step - 1) / (totalSteps - 1)) * 100;
  const tc = getThemeClasses(formData.premium);

  // Map step key to component
  const renderStep = () => {
    const key = currentStepKey;
    switch (key) {
      case "couple_info":
        return <Step1 formData={formData} updateField={updateField} />;
      case "ai_photo":
        return (
          <PremiumStepAIPhoto
            premiumTheme={formData.premium_theme}
            premiumCity={formData.premium_city}
            premiumCar={formData.premium_car}
            coupleDescription={formData.couple_description}
            aiCoupleImageUrl={formData.ai_couple_image_url}
            bride={formData.bride}
            groom={formData.groom}
            pendingImages={formData.pendingImages}
            onThemeChange={(theme) => updateField("premium_theme", theme)}
            onCityChange={(city) => updateField("premium_city", city)}
            onCarChange={(car) => updateField("premium_car", car)}
            onDescriptionChange={(desc) =>
              updateField("couple_description", desc)
            }
            onImageGenerated={(url) => updateField("ai_couple_image_url", url)}
            onPendingImagesChange={(files) =>
              updateField("pendingImages", files)
            }
          />
        );
      case "envelope_lab":
        return (
          <PremiumStepEnvelopeLab
            envelopeItems={formData.envelope_items}
            envelopeStyle={formData.envelope_style}
            onItemsChange={(items) => updateField("envelope_items", items)}
            onStyleChange={(s) => updateField("envelope_style", s)}
          />
        );
      case "date_rsvp":
        return (
          <Step2
            formData={formData}
            updateField={updateField}
            bypassInfo={bypassInfo}
          />
        );
      case "design":
        return <Step3 formData={formData} updateField={updateField} />;
      case "locations":
        return (
          <Step4
            formData={formData}
            toggleLocation={toggleLocation}
            updateLocation={updateLocation}
            addDuplicateHome={addDuplicateHome}
            removeDuplicateHome={removeDuplicateHome}
          />
        );
      case "personal":
        return <Step5 formData={formData} updateField={updateField} />;
      case "settings":
        return <Step6 formData={formData} updateField={updateField} />;
      default:
        return null;
    }
  };

  // Accent color: gold for premium, red for classic
  const accent = formData.premium ? "#d4af37" : "#AE343F";
  const accentDark = formData.premium ? "#c5a028" : "#8B2833";

  return (
    <div
      ref={formTopRef}
      className="max-w-2xl mx-auto scroll-mt-4"
      style={
        {
          "--accent": accent,
          "--accent-dark": accentDark,
        } as React.CSSProperties
      }
    >
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className={`text-sm font-medium ${tc.stepTitle}`}>
            {steps[step - 1]?.title}
          </span>
          <span
            className={`text-xs font-bold uppercase tracking-[0.18em] ${tc.stepCounter}`}
          >
            Korak {step} od {totalSteps}
          </span>
        </div>
        <div
          className={`w-full h-1.5 rounded-full overflow-hidden ${tc.progressTrack}`}
        >
          <motion.div
            className={`h-full rounded-full ${tc.progressBar}`}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex justify-between mt-3">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                i + 1 <= step ? tc.dotActive : tc.dotInactive
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card */}
      <div className={`overflow-hidden ${tc.card}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="p-4 sm:p-8"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mx-4 sm:mx-8 mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation */}
        <div className="px-4 pb-4 sm:px-8 sm:pb-8 flex justify-between items-center gap-3">
          {step === 1 ? (
            lockPremiumToggle ? (
              <div
                className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-2xl border text-xs sm:text-sm font-medium ${
                  formData.premium
                    ? "bg-gradient-to-r from-[#d4af37] to-[#c5a028] border-[#d4af37] text-white shadow-lg shadow-[#d4af37]/25"
                    : "bg-[#AE343F]/5 border-[#AE343F]/30 text-[#AE343F]"
                }`}
                title="Tip pozivnice je zaključan za nadogradnju"
              >
                <Sparkles size={14} />
                {formData.premium
                  ? "Nadogradnja u Premium"
                  : "Nadogradnja u Klasik"}
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePremiumToggle}
                className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-2xl border text-xs sm:text-sm font-medium transition-all ${
                  formData.premium
                    ? "bg-gradient-to-r from-[#d4af37] to-[#c5a028] border-[#d4af37] text-white shadow-lg shadow-[#d4af37]/25"
                    : "border-[#d4af37]/40 text-[#d4af37] hover:border-[#d4af37] hover:bg-[#d4af37]/5 animate-[premiumGlow_2s_ease-in-out_infinite]"
                }`}
              >
                <Sparkles
                  size={14}
                  className={formData.premium ? "" : "animate-spin"}
                  style={formData.premium ? {} : { animationDuration: "3s" }}
                />
                Premium
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={goPrev}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-medium text-sm ${tc.buttonSecondary}`}
            >
              <ChevronLeft size={16} />
              Nazad
            </button>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={goNext}
              disabled={
                currentStepKey === "date_rsvp" &&
                !bypassInfo &&
                !formData.phone_trust_token
              }
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl transition-all font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed ${tc.buttonPrimary}`}
            >
              Dalje
              <ChevronRight size={16} />
            </button>
          ) : (
            (() => {
              const waitingForAiImage =
                formData.premium &&
                formData.premium_theme === "line_art" &&
                (!formData.ai_couple_image_url || isWhitening);
              // URL is the ground-truth: if it's not on the whitened blob path,
              // submit will trigger a synchronous whiten retry. Don't disable the
              // button for that — the click is what kicks the retry off.
              return (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || waitingForAiImage}
                  className={`flex items-center gap-2 px-8 py-3 rounded-2xl transition-all font-medium text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${tc.buttonPrimary}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {submitPhase === "uploading-images"
                        ? `Otpremamo slike (${Math.min(
                            uploadProgress.current + 1,
                            uploadProgress.total,
                          )}/${uploadProgress.total})...`
                        : submitPhase === "uploading-music"
                          ? "Otpremamo muziku..."
                          : submitPhase === "creating"
                            ? "Kreiramo pozivnicu..."
                            : "Slanje..."}
                    </>
                  ) : waitingForAiImage ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Pripremamo sliku...
                    </>
                  ) : (
                    <>
                      Pošalji zahtev
                      <Send size={14} />
                    </>
                  )}
                </button>
              );
            })()
          )}
        </div>
        {stepError && (
          <p
            className={`text-xs text-center px-4 pb-4 sm:px-8 sm:pb-6 ${tc.errorText}`}
          >
            {stepError}
          </p>
        )}
        {isSubmitting && (
          <p className="text-xs text-center px-4 pb-4 sm:px-8 sm:pb-6 text-stone-500">
            Molimo ne zatvarajte stranicu — slanje je u toku.
          </p>
        )}
        {step === totalSteps &&
          !isSubmitting &&
          formData.premium &&
          formData.premium_theme === "line_art" &&
          (!formData.ai_couple_image_url || isWhitening) && (
            <p className="text-xs text-center px-4 pb-4 sm:px-8 sm:pb-6 text-[#8B7355]">
              Sačekajte još malo dok se slika u pozadini obradi i pripremi za
              pozivnicu.
            </p>
          )}
      </div>
    </div>
  );
}
