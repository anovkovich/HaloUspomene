"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Heart,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import { pricing, formatPrice } from "@/data/pricing";
import {
  THEME_CONFIGS,
  SCRIPT_FONT_CONFIGS,
  getThemeCSSVariables,
  getThemeConfig,
} from "@/app/pozivnica/[slug]/constants";
import type { ThemeType, ScriptFontType } from "@/app/pozivnica/[slug]/types";

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

const TOTAL_STEPS = 6;

const STEP_TITLES = [
  "Informacije o paru",
  "Datum i rok za prijavu",
  "Dizajn",
  "Lokacije",
  "Lični detalji",
  "Podešavanja",
];

const defaultFormData: FormData = {
  bride: "",
  groom: "",
  full_display: "",
  useCyrillic: false,
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
  locations: [
    { type: "home", enabled: false, name: "", address: "", time: "" },
    { type: "church", enabled: false, name: "", address: "", time: "" },
    { type: "ceremony", enabled: false, name: "", address: "", time: "" },
    { type: "hall", enabled: true, name: "", address: "", time: "" },
  ],
  tagline: "",
  thankYouFooter: "",
  countdown_enabled: true,
  map_enabled: true,
  wishes: "",
};

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const inputCls =
  "w-full border-b border-stone-200 focus:border-[#AE343F] bg-transparent py-2.5 px-1 text-stone-800 text-base outline-none transition-colors placeholder:text-stone-300";

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
    <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 sm:w-11 sm:h-6 rounded-full transition-colors duration-200 flex-shrink-0 mt-0.5 flex items-center ${checked ? "bg-[#AE343F]" : "bg-stone-200"}`}
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
            <span className="w-4 h-4 rounded-full bg-[#AE343F] text-white text-[9px] font-bold flex items-center justify-center">
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
                className="w-3.5 h-3.5 accent-[#AE343F] cursor-pointer shrink-0 opacity-60"
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
                  className="w-3.5 h-3.5 accent-[#AE343F] cursor-pointer shrink-0 opacity-60"
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
                  <span className="text-xs text-[#AE343F] font-bold">
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
            <a href="/cene" className="text-[#AE343F]/60 hover:underline">
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
}: {
  theme: ThemeType;
  scriptFont: ScriptFontType;
  bride: string;
  groom: string;
  eventDate: string;
  useCyrillic: boolean;
}) {
  const cssVars = getThemeCSSVariables(theme, scriptFont);
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
  return (
    <div>
      {/* Pricing section */}
      <div className="mb-3 p-5 bg-[#AE343F]/5 border border-[#AE343F]/15 rounded-2xl">
        <p className="text-2xl font-bold align-end text-[#AE343F]">
          Cena pozivnice je od {formatPrice(pricing.pozivnica.website.price)}
        </p>
        <p className="font-semibold text-sm text-[#8B2833] mt-2">
          <small>
            Kompletni paket sa rasporedom sedenja i audio knjigom:{" "}
            {formatPrice(pricing.pozivnica.bundlePrice)}
          </small>
        </p>
      </div>

      {/* Live preview section */}
      <a
        href="/pozivnica/sara-nikola"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 inline-flex justify-between w-full gap-2 px-4 py-2.5 bg-[#AE343F] text-white rounded-lg hover:bg-[#932d35] transition-colors text-sm font-medium"
      >
        <span>🎁 Pogledajte live primer pozivnice:</span>
        <span className="inline-flex items-center gap-2">
          Otvori u novom tabu
          <svg
            className="w-4 h-4"
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
        </span>
      </a>

      <StepHeading
        title="Informacije o paru"
        desc="Unesite ime i prezime mladenaca."
      />

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
              onClick={() => updateField("useCyrillic", val)}
              className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                formData.useCyrillic === val
                  ? "bg-[#AE343F] border-[#AE343F] text-white"
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

      {/* Extras accordion */}
      <ExtrasAccordion formData={formData} updateField={updateField} />
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 13 }, (_, i) => i + 9); // 09–21
const MINUTES = ["00", "15", "30", "45"];

function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (t: string) => void;
}) {
  const [h, m] = value.split(":") ?? ["18", "00"];

  const selectCls =
    "bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 text-base outline-none focus:border-[#AE343F] transition-colors cursor-pointer appearance-none text-center font-medium";

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
        <Field label="Vaš kontakt telefon (za naš tim, nije na pozivnici)">
          <div className="flex items-center border-b border-stone-200 focus-within:border-[#AE343F] transition-colors">
            <span className="py-2.5 pl-1 pr-2 text-stone-400 text-base select-none">
              +381
            </span>
            <input
              type="tel"
              className="flex-1 bg-transparent py-2.5 pr-1 text-stone-800 text-base outline-none placeholder:text-stone-300"
              placeholder="6X XXX XXXX"
              value={formData.contact_phone}
              onChange={(e) =>
                updateField(
                  "contact_phone",
                  e.target.value.replace(/^\+?381/, ""),
                )
              }
            />
          </div>
        </Field>
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
            className="w-full appearance-none bg-white border border-stone-200 rounded-xl px-4 py-3 pr-10 text-stone-800 text-sm font-medium outline-none focus:border-[#AE343F] focus:ring-2 focus:ring-[#AE343F]/10 transition-all cursor-pointer"
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
            onClick={() => updateField("theme", key)}
            className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
              formData.theme === key
                ? "border-[#AE343F] shadow-md"
                : "border-stone-100 hover:border-stone-200"
            }`}
          >
            <div
              className="w-8 h-8 rounded-full mb-2 border border-black/5"
              style={{ backgroundColor: cfg.colors.primary }}
            />
            <p className="text-sm font-semibold text-stone-700">{cfg.name}</p>
            <p className="text-xs text-stone-400">{cfg.symbolism}</p>
            {formData.theme === key && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#AE343F] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </button>
        ))}
      </div>
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
    subtitle:
      "Ukoliko imate dva polaska, drugi unesite u napomeni na poslednjem koraku",
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
    type: "ceremony",
    emoji: "💍",
    title: "Građansko venčanje",
    subtitle: "Ceremonijalno venčanje kod matičara",
    namePlaceholder: "npr. Matičarska služba / restoran Vila Mir",
    addressPlaceholder: "npr. Bulevar Mihajla Pupina 25",
    timePlaceholder: "npr. 16:00",
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
];

function Step4({
  formData,
  toggleLocation,
  updateLocation,
}: {
  formData: FormData;
  toggleLocation: (i: number) => void;
  updateLocation: (
    i: number,
    f: "name" | "address" | "time",
    v: string,
  ) => void;
}) {
  return (
    <div>
      <StepHeading
        title="Lokacije"
        desc="Uključite lokacije koje su deo vašeg dana i popunite detalje."
      />

      <div className="space-y-3">
        {VENUE_DEFS.map((def, i) => {
          const loc = formData.locations[i];
          const active = loc.enabled;

          return (
            <div
              key={def.type}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                active ? "border-[#AE343F]/30 shadow-sm" : "border-stone-100"
              }`}
            >
              {/* Header row — always visible, click to toggle */}
              <button
                type="button"
                onClick={() => toggleLocation(i)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
                  active ? "bg-[#AE343F]/5" : "bg-stone-50/60 hover:bg-stone-50"
                }`}
              >
                {/* Toggle circle */}
                <div
                  className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                    active
                      ? "border-[#AE343F] bg-[#AE343F]"
                      : "border-stone-300 bg-white"
                  }`}
                >
                  {active && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                <span className="text-xl shrink-0">{def.emoji}</span>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm ${active ? "text-stone-800" : "text-stone-400"}`}
                  >
                    {def.title}
                  </p>
                  <p className="text-xs text-stone-400 truncate">
                    {def.subtitle}
                  </p>
                </div>

                {/* Time badge when filled */}
                {active && loc.time && (
                  <span className="text-xs font-bold text-[#AE343F] bg-[#AE343F]/10 px-2.5 py-1 rounded-full shrink-0">
                    {loc.time}
                  </span>
                )}
              </button>

              {/* Expanded fields */}
              {active && (
                <div className="px-5 pb-5 pt-3 space-y-4 bg-white">
                  <div className="grid grid-cols-[1fr_100px] gap-4 items-end">
                    <Field label="Naziv">
                      <TextInput
                        value={loc.name}
                        onChange={(v) => updateLocation(i, "name", v)}
                        placeholder={def.namePlaceholder}
                      />
                    </Field>
                    <div>
                      <label className={labelCls}>Vreme</label>
                      <input
                        type="text"
                        className={inputCls + " text-center"}
                        value={loc.time}
                        onChange={(e) =>
                          updateLocation(i, "time", e.target.value)
                        }
                        placeholder={def.timePlaceholder}
                      />
                    </div>
                  </div>
                  <Field label="Adresa">
                    <TextInput
                      value={loc.address}
                      onChange={(v) => updateLocation(i, "address", v)}
                      placeholder={def.addressPlaceholder}
                    />
                  </Field>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-stone-300 mt-4 text-center">
        Google Maps linkove dodajemo mi nakon prijema upitnika.
      </p>
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
        <Field label="Tagline (citat / poruka u heroju pozivnice)">
          <textarea
            className="w-full border-b border-stone-200 focus:border-[#AE343F] bg-transparent py-2.5 px-1 text-stone-800 text-base outline-none transition-colors placeholder:text-stone-300 resize-none"
            rows={3}
            value={formData.tagline}
            onChange={(e) => updateField("tagline", e.target.value)}
            placeholder="npr. Najlepše priče se ne pišu same — pomozite nam da naše novo poglavlje otvorimo na najlepši način!"
          />
        </Field>
        <Field label="Zahvalnica (poruka na dnu pozivnice)">
          <textarea
            className="w-full border-b border-stone-200 focus:border-[#AE343F] bg-transparent py-2.5 px-1 text-stone-800 text-base outline-none transition-colors placeholder:text-stone-300 resize-none"
            rows={3}
            value={formData.thankYouFooter}
            onChange={(e) => updateField("thankYouFooter", e.target.value)}
            placeholder="npr. Naša radost je potpuna samo uz ljude koje volimo! Hvala što ste tu."
          />
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
        <div className="bg-[#AE343F]/5 border border-[#AE343F]/15 rounded-2xl px-5 py-4 text-sm text-[#8B2833] leading-relaxed">
          <p className="font-semibold mb-1">🎉 Skoro sve je spremno!</p>
          <p>
            Google formu za prijavljivanje gostiju, odbrojavanje i mapu ćemo
            podesiti sami — vi samo kliknite <em>Pošalji zahtev</em> i mi ćemo
            se pobrinuti za sve tehničke detalje.
          </p>
        </div>

        <div className="space-y-5">
          <p className={labelCls}>Šta prikazati gostima?</p>
          <div></div>

          <Toggle
            checked={formData.countdown_enabled}
            onChange={(v) => updateField("countdown_enabled", v)}
            label="Odbrojavanje do venčanja (dani, sati, minuti, sekunde)"
          />
          <Toggle
            checked={formData.map_enabled}
            onChange={(v) => updateField("map_enabled", v)}
            label="Interaktivna google mapa do lokacije sale"
          />
        </div>

        <Field label="Posebne napomene ili zahtevi (opciono)">
          <textarea
            className="w-full border-b border-stone-200 focus:border-[#AE343F] bg-transparent py-2.5 px-1 text-stone-800 text-base outline-none transition-colors placeholder:text-stone-300 resize-none"
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
      .map((l) => ({
        name: l.name,
        address: l.address,
        map_url: "",
        type: l.type,
      })),
    timeline: formData.locations
      .filter((l) => l.enabled)
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
    paid_for_audio_USB: formData.extra_usb_kaseta ? "kaseta" : formData.extra_usb_bocica ? "bocica" : "",
    paid_for_pdf: false,
    draft: false,
  };
  return JSON.stringify(json, null, 2);
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function QuestionnaireForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const hallVenue = formData.locations[3];
    if (
      hallVenue.enabled &&
      formData.event_time &&
      hallVenue.time !== formData.event_time
    ) {
      setFormData((prev) => {
        const locations = [...prev.locations];
        locations[3] = { ...locations[3], time: prev.event_time };
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

  const goNext = () => {
    if (step === 1 && (!formData.bride.trim() || !formData.groom.trim())) {
      setStepError("Unesite imena mladenaca pre nego što nastavite.");
      return;
    }
    setStepError("");
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const goPrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const toggleLocation = (idx: number) =>
    setFormData((prev) => {
      const locations = [...prev.locations];
      const wasEnabled = locations[idx].enabled;
      locations[idx] = { ...locations[idx], enabled: !locations[idx].enabled };
      // Prepopulate time for hall venue when enabling
      if (!wasEnabled && idx === 3 && formData.event_time) {
        locations[idx] = { ...locations[idx], time: formData.event_time };
      }
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
    setError(null);
    setIsSubmitting(true);
    try {
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

      // ── Build bill ──────────────────────────────────────────────────
      const billItems: {
        label: string;
        amount: string;
        bold?: boolean;
        discount?: boolean;
      }[] = [];
      let billTotal = 0;

      billItems.push({
        label: "Website pozivnica",
        amount: formatPrice(pricing.pozivnica.website.price),
      });
      billTotal += pricing.pozivnica.website.price;

      billItems.push({ label: "PDF pozivnica za štampu", amount: "BESPLATNO" });

      if (formData.extra_raspored) {
        billItems.push({
          label: "Raspored sedenja",
          amount: formatPrice(pricing.pozivnica.raspored.price),
        });
        billTotal += pricing.pozivnica.raspored.price;
      }
      if (formData.extra_audio) {
        billItems.push({
          label: "Audio knjiga utisaka",
          amount: formatPrice(pricing.pozivnica.audio.price),
        });
        billTotal += pricing.pozivnica.audio.price;
      }
      if (formData.extra_usb_kaseta) {
        const usb = pricing.addons.find((a) => a.id === "usb_kaseta")!;
        billItems.push({
          label: "USB retro kaseta",
          amount: formatPrice(usb.price),
        });
        billTotal += usb.price;
      }
      if (formData.extra_usb_bocica) {
        const usb = pricing.addons.find((a) => a.id === "usb_bocica")!;
        billItems.push({
          label: "USB u bočici",
          amount: formatPrice(usb.price),
        });
        billTotal += usb.price;
      }

      const isBundle = formData.extra_raspored && formData.extra_audio;
      if (isBundle) {
        const discount =
          pricing.pozivnica.bundleFullPrice - pricing.pozivnica.bundlePrice;
        billItems.push({
          label: "Popust (kompletni paket)",
          amount: `-${formatPrice(discount)}`,
          discount: true,
        });
        billTotal -= discount;
      }

      const receiptData = JSON.stringify({
        par: formData.full_display,
        datum: formattedDate,
        ...(formData.extra_raspored ? { r: 1 } : {}),
        ...(formData.extra_audio ? { a: 1 } : {}),
        ...(formData.extra_usb_kaseta ? { uk: 1 } : {}),
        ...(formData.extra_usb_bocica ? { ub: 1 } : {}),
      });
      const receiptUrl = `https://halouspomene.rs/racun?d=${btoa(unescape(encodeURIComponent(receiptData)))}`;

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
        "⚠️⚠️⚠️ NAPOMENA ⚠️⚠️⚠️": formData.wishes || "(nema)",

        // ── Bill ──
        "🧾 Račun": receiptUrl,

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
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-12 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-[#AE343F] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#AE343F]/25">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-serif text-[#AE343F] mb-4">
          Hvala, {formData.bride} i {formData.groom}!
        </h2>
        <p className="text-[#8B2833] text-lg mb-3">
          Uspešno smo primili sve podatke za vašu pozivnicu.
        </p>
        {formData.event_date_only && (
          <p className="text-[#AE343F]/70 mb-8">
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
        <p className="text-[#8B2833] text-sm">
          Uskoro ćemo napraviti vašu pozivnicu i kontaktirati vas.
        </p>
      </div>
    );
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-[#8B2833]">
            {STEP_TITLES[step - 1]}
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#AE343F]">
            Korak {step} od {TOTAL_STEPS}
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#AE343F]/15 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#AE343F] rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex justify-between mt-3">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                i + 1 <= step ? "bg-[#AE343F]" : "bg-[#AE343F]/25"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="p-8"
          >
            {step === 1 && (
              <Step1 formData={formData} updateField={updateField} />
            )}
            {step === 2 && (
              <Step2 formData={formData} updateField={updateField} />
            )}
            {step === 3 && (
              <Step3 formData={formData} updateField={updateField} />
            )}
            {step === 4 && (
              <Step4
                formData={formData}
                toggleLocation={toggleLocation}
                updateLocation={updateLocation}
              />
            )}
            {step === 5 && (
              <Step5 formData={formData} updateField={updateField} />
            )}
            {step === 6 && (
              <Step6 formData={formData} updateField={updateField} />
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mx-8 mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation */}
        <div className="px-8 pb-8 flex justify-between items-center">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm"
          >
            <ChevronLeft size={16} />
            Nazad
          </button>

          {step < TOTAL_STEPS ? (
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#AE343F] text-white hover:bg-[#8B2833] transition-all font-medium text-sm shadow-md shadow-[#AE343F]/20"
              >
                Dalje
                <ChevronRight size={16} />
              </button>
              {stepError && (
                <p className="text-xs text-[#AE343F]">{stepError}</p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#AE343F] text-white hover:bg-[#8B2833] transition-all font-medium text-sm shadow-md shadow-[#AE343F]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Slanje...
                </>
              ) : (
                <>
                  Pošalji zahtev
                  <Send size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
