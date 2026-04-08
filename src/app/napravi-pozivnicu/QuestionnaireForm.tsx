"use client";

import React, { useState, useRef } from "react";
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
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import {
  pricing,
  formatPrice,
  getPremiumPrice,
  isPremiumPromoActive,
} from "@/data/pricing";
import {
  THEME_CONFIGS,
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

const PremiumStepAIPhoto = dynamic(
  () => import("./steps/PremiumStepAIPhoto"),
  { ssr: false },
);
const PremiumStepEnvelopeLab = dynamic(
  () => import("./steps/PremiumStepEnvelopeLab"),
  { ssr: false },
);

const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

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
  // Step 2
  event_date: string; // combined "YYYY-MM-DDTHH:MM"
  event_date_only: string; // "YYYY-MM-DD" for DatePicker
  event_time: string; // "HH:MM" for time select
  submit_until: string; // formatted text e.g. "31. Avgusta 2026."
  submit_until_date: string; // "YYYY-MM-DD" for DatePicker
  contact_phone: string;
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
  { key: "ai_photo", title: "Stil pozivnice" },
  { key: "envelope_lab", title: "Envelope Lab" },
  { key: "date_rsvp", title: "Datum i rok za prijavu" },
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
  event_date: "",
  event_date_only: "",
  event_time: "18:00",
  submit_until: "",
  submit_until_date: "",
  contact_phone: "",
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

const EXTRAS = [
  {
    key: "extra_raspored" as const,
    label: "Raspored sedenja",
    price: `+${formatPrice(pricing.pozivnica.raspored.price)}`,
  },
  {
    key: "extra_audio" as const,
    label: "Audio knjiga utisaka",
    price: `+${formatPrice(pricing.pozivnica.audio.price)}`,
  },
  {
    key: "extra_usb_kaseta" as const,
    label: "USB retro kaseta",
    price: `+${formatPrice(pricing.addons.find((a) => a.id === "usb_kaseta")!.price)}`,
  },
  {
    key: "extra_usb_bocica" as const,
    label: "USB u bočici",
    price: `+${formatPrice(pricing.addons.find((a) => a.id === "usb_bocica")!.price)}`,
  },
];

function ExtrasAccordion({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  const count = EXTRAS.filter(({ key }) => formData[key]).length;
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 pt-5 border-t border-stone-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-stone-300 group-hover:text-stone-400 transition-colors">
            Dodatne usluge (opciono)
          </span>
          {count > 0 && (
            <span className="w-4 h-4 rounded-full bg-[var(--accent,#AE343F)] text-white text-[9px] font-bold flex items-center justify-center">
              {count}
            </span>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className={`text-stone-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {EXTRAS.filter(
            ({ key }) =>
              key !== "extra_usb_kaseta" && key !== "extra_usb_bocica",
          ).map(({ key, label, price }) => (
            <label
              key={key}
              className="flex items-center gap-2.5 py-0.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={formData[key]}
                onChange={(e) => updateField(key, e.target.checked)}
                className="w-3.5 h-3.5 accent-[var(--accent,#AE343F)] cursor-pointer shrink-0 opacity-60"
              />
              <span className="text-xs text-stone-400 group-hover:text-stone-500 transition-colors">
                {label}
              </span>
              <span className="text-[10px] text-stone-300 ml-auto shrink-0">
                {price}
              </span>
            </label>
          ))}
          {/* USB options — nested under audio, mutually exclusive */}
          <div
            className={`ml-5 space-y-2 ${!formData.extra_audio ? "opacity-50 pointer-events-none" : ""}`}
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
                className="flex items-center gap-2.5 py-0.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={formData[key]}
                  onChange={(e) => {
                    updateField(key, e.target.checked);
                    if (e.target.checked) updateField(other, false);
                  }}
                  className="w-3.5 h-3.5 accent-[var(--accent,#AE343F)] cursor-pointer shrink-0 opacity-60"
                />
                <span
                  className={`text-xs transition-colors ${!formData.extra_audio ? "text-stone-300" : "text-stone-400 group-hover:text-stone-500"}`}
                >
                  {label}
                </span>
                <span className="text-[10px] text-stone-300 ml-auto shrink-0">
                  {price}
                </span>
              </label>
            ))}
          </div>
          {/* Sum + discount */}
          {(() => {
            let sum = pricing.pozivnica.website.price;
            if (formData.extra_raspored)
              sum += pricing.pozivnica.raspored.price;
            if (formData.extra_audio) sum += pricing.pozivnica.audio.price;
            if (formData.extra_usb_kaseta)
              sum += pricing.addons.find((a) => a.id === "usb_kaseta")!.price;
            if (formData.extra_usb_bocica)
              sum += pricing.addons.find((a) => a.id === "usb_bocica")!.price;
            const isFullBundle =
              formData.extra_raspored && formData.extra_audio;
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
          <p className="text-[10px] text-stone-300 mt-2">
            <a href="/cene" className="text-[var(--accent,#AE343F)]/60 hover:underline">
              Pogledajte detaljne cene
            </a>
          </p>
        </div>
      )}
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
        {formData.premium ? (
          <>
            <div className="flex items-baseline gap-3">
              <p className={`text-2xl font-bold ${tc.priceText}`}>
                {formatPrice(getPremiumPrice())}
              </p>
              {isPremiumPromoActive() && (
                <span className={`text-sm line-through opacity-50 ${tc.priceText}`}>
                  {formatPrice((pricing.premium as any).price)}
                </span>
              )}
            </div>
            <p className={`text-xs mt-1.5 ${tc.priceSubtext}`}>
              Luksuzne pozivnice sa animacijama, jedinstvene i personalizovane, sa AI generisanim ilustracijama na osnovu Vašeg opisa mladenaca i modernim kovertama na ekranu dobrodošlice.
            </p>
          </>
        ) : (
          <>
            <p className={`text-2xl font-bold ${tc.priceText}`}>
              Cena pozivnice je od {formatPrice(pricing.pozivnica.website.price)}
            </p>
            <p className={`font-semibold text-sm mt-2 ${tc.priceSubtext}`}>
              <small>
                Kompletni paket sa rasporedom sedenja i audio knjigom:{" "}
                {formatPrice(pricing.pozivnica.bundlePrice)}
              </small>
            </p>
          </>
        )}
      </div>

      {/* Live preview section */}
      <a
        href="/pozivnica/ana-dejan"
        target="_blank"
        rel="noopener noreferrer"
        className={`mb-6 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg transition-colors text-xs sm:text-sm font-medium text-center ${
          formData.premium
            ? "bg-gradient-to-r from-[#d4af37] to-[#c5a028] text-white hover:from-[#c5a028] hover:to-[#b89520]"
            : "bg-[var(--accent,#AE343F)] text-white hover:bg-[var(--accent-dark,#932d35)]"
        }`}
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

      {/* Extras accordion or premium included note */}
      {formData.premium ? (
        <div className="mt-8 pt-5 border-t border-[#d4af37]/15">
          <button
            type="button"
            className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#d4af37] cursor-help inline-flex items-center gap-1.5 relative"
            onClick={(e) => {
              const tip = e.currentTarget.querySelector("[data-tip]");
              if (tip) tip.classList.toggle("hidden");
            }}
          >
            Sve dodatne usluge su uključene uz Premium pozivnicu!
            <HelpCircle size={12} className="opacity-60" />
            <span
              data-tip
              className="hidden absolute bottom-full left-0 mb-2 p-3 bg-white rounded-xl border border-[#d4af37]/20 shadow-lg text-xs text-[#8B7355] text-left normal-case tracking-normal whitespace-normal w-[250px] z-50 pointer-events-none"
            >
              Raspored sedenja, audio knjiga utisaka, prilagođena boja teme i
              svi dodaci su uključeni u Premium AI paket.
            </span>
          </button>
        </div>
      ) : (
        <ExtrasAccordion formData={formData} updateField={updateField} />
      )}
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
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
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
            <div className="group relative">
              <HelpCircle size={14} className="text-stone-400 cursor-help" />
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-stone-800 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                Da vas kontaktiramo ukoliko nešto zatreba. Međutim, možete uneti
                i dva broja razdvojena zarezom i staviti napomenu ako ih želite
                na PDF pozivnici!
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800" />
              </div>
            </div>
          </div>
          <PhoneTagInput
            value={formData.contact_phone}
            onChange={(v) => updateField("contact_phone", v)}
          />
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

  const themes = Object.entries(THEME_CONFIGS) as [
    ThemeType,
    (typeof THEME_CONFIGS)[ThemeType],
  ][];
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
                active ? "border-[var(--accent,#AE343F)]/30 shadow-sm" : "border-stone-100"
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
              <Plus size={10} className="inline -mt-0.5" /> pored &ldquo;Polazak od
              kuće&rdquo;.
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
      <div className="space-y-6">
        {/* Info box */}
        <div className="bg-[var(--accent,#AE343F)]/5 border border-[var(--accent,#AE343F)]/15 rounded-2xl px-5 py-4 text-sm text-[#8B2833] leading-relaxed">
          <p className="font-semibold mb-1">🎉 Skoro sve je spremno!</p>
          <p>
            Nakon kreiranja pozivnice, na portalu <strong>Moje Venčanje</strong>{" "}
            možete pratiti potvrde gostiju, organizovati raspored sedenja,
            planirati budžet i još mnogo toga. Kredencijale za prijavu ćete
            dobiti zajedno sa pozivnicom.
          </p>
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

// ─── Raw JSON generator ───────────────────────────────────────────────────────

function generateRawJson(formData: FormData): string {
  const eventDate = new Date(formData.event_date);
  const dd = String(eventDate.getDate()).padStart(2, "0");
  const mm = String(eventDate.getMonth() + 1).padStart(2, "0");
  const autoPassword = `${formData.groom}${dd}${mm}`;

  const json = {
    theme: formData.theme,
    scriptFont: formData.scriptFont,
    useCyrillic: formData.useCyrillic,
    potvrde_password: autoPassword,
    couple_names: {
      bride: formData.bride,
      groom: formData.groom,
      full_display: formData.full_display,
    },
    event_date: formData.event_date,
    submit_until: formData.submit_until_date,
    tagline: formData.tagline,
    thankYouFooter: formData.thankYouFooter,
    locations: formData.locations
      .filter((l) => l.enabled && (l.type === "hall" || l.type === "church"))
      .map((l) => {
        const query = [l.name, l.address].filter(Boolean).join(", ");
        return {
          name: l.name,
          address: l.address,
          map_url: query ? `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : "",
          type: l.type,
        };
      }),
    timeline: [...formData.locations]
      .filter((l) => l.enabled)
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((l) => {
        const typeToIcon: Record<string, string> = {
          home: "Home",
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
    countdown_enabled: formData.countdown_enabled,
    map_enabled: formData.map_enabled,
    paid_for_raspored: formData.extra_raspored,
    paid_for_audio: formData.extra_audio,
    paid_for_audio_USB: formData.extra_usb_kaseta
      ? "kaseta"
      : formData.extra_usb_bocica
        ? "bocica"
        : "",
    paid_for_pdf: false,
    draft: true,
    ...(formData.custom_primary_color
      ? { custom_primary_color: formData.custom_primary_color }
      : {}),
    ...(formData.custom_background_color
      ? { custom_background_color: formData.custom_background_color }
      : {}),
  };
  return JSON.stringify(json, null, 2);
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function QuestionnaireForm({
  onPremiumChange,
}: {
  onPremiumChange?: (isPremium: boolean) => void;
}) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Notify parent about premium mode changes
  React.useEffect(() => {
    onPremiumChange?.(formData.premium);
  }, [formData.premium, onPremiumChange]);

  // Read URL params from /cene page
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.toString()) {
      setFormData((prev) => ({
        ...prev,
        extra_raspored: params.get("raspored") === "1" || prev.extra_raspored,
        extra_audio: params.get("audio") === "1" || prev.extra_audio,
        extra_usb_kaseta:
          params.get("usb_kaseta") === "1" || prev.extra_usb_kaseta,
        extra_usb_bocica:
          params.get("usb_bocica") === "1" || prev.extra_usb_bocica,
      }));
    }
  }, []);

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
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      // Async background whitening — fire and forget when leaving this step
      if (formData.ai_couple_image_url && formData.premium_theme === "line_art") {
        fetch("/api/premium-pozivnica/whiten-bg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: formData.ai_couple_image_url }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.resultUrl && d.resultUrl !== formData.ai_couple_image_url) {
              updateField("ai_couple_image_url", d.resultUrl);
            }
          })
          .catch(() => {});
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
  };
  const goPrev = () => {
    setStepError("");
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
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

  const [premiumSlug, setPremiumSlug] = useState("");

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      if (formData.premium) {
        // Premium flow: create couple in MongoDB directly
        const res = await fetch("/api/premium-pozivnica/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bride: formData.bride,
            groom: formData.groom,
            full_display: formData.full_display,
            useCyrillic: formData.useCyrillic,
            event_date: formData.event_date,
            submit_until_date: formData.submit_until_date,
            theme: formData.theme,
            scriptFont: formData.scriptFont,
            premium_theme: formData.premium_theme,
            ai_couple_image_url: formData.ai_couple_image_url,
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
            locations: formData.locations
              .filter(
                (l) =>
                  l.enabled && (l.type === "hall" || l.type === "church"),
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
                  home: "Home",
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
          }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Greška pri kreiranju pozivnice");
        setPremiumSlug(data.slug);
        setIsSubmitted(true);
        return;
      }

      // Classic flow: send via Web3Forms
      const formattedDate = formData.event_date
        ? new Date(formData.event_date).toLocaleDateString(
            formData.useCyrillic ? "sr-Cyrl-RS" : "sr-Latn-RS",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            },
          )
        : "";

      const payload: Record<string, string> = {
        access_key: WEB3FORMS_ACCESS_KEY || "",
        subject: `Nova Pozivnica - ${formData.full_display} - ${formattedDate}`,
        from_name: "Halo Pozivnice",

        // ── Human-readable essentials ──
        Par: formData.full_display,
        "Datum venčanja": `${formattedDate}, ${formData.event_time}h`,
        "Rok za prijavu": formData.submit_until,
        "Kontakt telefon": `+381${formData.contact_phone}`,
        "Raspored sedenja": formData.extra_raspored ? "✅ DA" : "❌ Ne",
        "Audio knjiga": formData.extra_audio ? "✅ DA" : "❌ Ne",
        "USB suvenir": formData.extra_usb_kaseta
          ? "USB retro kaseta"
          : formData.extra_usb_bocica
            ? "USB u bočici"
            : "❌ Ne",
        "Prilagođena boja": formData.custom_primary_color
          ? `${formData.custom_primary_color} / bg: ${formData.custom_background_color || "auto"}`
          : "❌ Ne",
        "⚠️⚠️⚠️ NAPOMENA ⚠️⚠️⚠️": formData.wishes || "(nema)",

        // ── JSON for admin panel (copy-paste) ──
        "📋 JSON": generateRawJson(formData),
      };

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Došlo je do greške");

      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Došlo je do greške pri slanju. Pokušajte ponovo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (isSubmitted) {
    const successAccent = formData.premium ? "#d4af37" : "#AE343F";
    const successTextMuted = formData.premium ? "#8B7355" : "#8B2833";
    return (
      <div className={`p-12 text-center max-w-2xl mx-auto ${getThemeClasses(formData.premium).card}`}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
          style={{ backgroundColor: successAccent, boxShadow: `0 10px 25px ${successAccent}40` }}
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
            ? "Uspešno smo primili sve podatke za vašu Premium AI pozivnicu."
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
        {formData.premium && premiumSlug && (
          <a
            href={`/premium-pozivnica/${premiumSlug}`}
            className="inline-flex items-center gap-2 px-6 py-3 mb-6 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#c5a028] text-white font-medium text-sm shadow-lg shadow-[#d4af37]/25 hover:from-[#c5a028] hover:to-[#b89520] transition-all"
          >
            <Sparkles size={16} />
            Pogledajte preview pozivnice
          </a>
        )}
        <p style={{ color: successTextMuted }} className="text-sm">
          {formData.premium
            ? "Vaša pozivnica je vidljiva 2 minuta. Nakon toga će biti zaključana do uplate."
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
            onThemeChange={(theme) => updateField("premium_theme", theme)}
            onCityChange={(city) => updateField("premium_city", city)}
            onCarChange={(car) => updateField("premium_car", car)}
            onDescriptionChange={(desc) => updateField("couple_description", desc)}
            onImageGenerated={(url) => updateField("ai_couple_image_url", url)}
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
        return <Step2 formData={formData} updateField={updateField} />;
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

  const formTopRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={formTopRef}
      className="max-w-2xl mx-auto"
      style={{ "--accent": accent, "--accent-dark": accentDark } as React.CSSProperties}
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
            <button
              type="button"
              onClick={handlePremiumToggle}
              className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-2xl border text-xs sm:text-sm font-medium transition-all ${
                formData.premium
                  ? "bg-gradient-to-r from-[#d4af37] to-[#c5a028] border-[#d4af37] text-white shadow-lg shadow-[#d4af37]/25"
                  : "border-[#d4af37]/40 text-[#d4af37] hover:border-[#d4af37] hover:bg-[#d4af37]/5 animate-[premiumGlow_2s_ease-in-out_infinite]"
              }`}
            >
              <Sparkles size={14} className={formData.premium ? "" : "animate-spin"} style={formData.premium ? {} : { animationDuration: "3s" }} />
              Premium
            </button>
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
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl transition-all font-medium text-sm ${tc.buttonPrimary}`}
            >
              Dalje
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl transition-all font-medium text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${tc.buttonPrimary}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Slanje...
                </>
              ) : (
                <>
                  Pošalji zahtev
                  <Send size={14} />
                </>
              )}
            </button>
          )}
        </div>
        {stepError && (
          <p className={`text-xs text-center px-4 pb-4 sm:px-8 sm:pb-6 ${tc.errorText}`}>{stepError}</p>
        )}
      </div>
    </div>
  );
}
