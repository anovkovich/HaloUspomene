"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import type { BirthdayThemeType, BirthdayGender, BirthdayFontType } from "@/app/deciji-rodjendan/[slug]/types";
import {
  BIRTHDAY_THEME_CONFIGS,
  BIRTHDAY_FONT_CONFIGS,
  getBirthdayThemeCSSVariables,
} from "@/app/deciji-rodjendan/[slug]/constants";
import { SceneDecorations } from "@/app/deciji-rodjendan/[slug]/components/Illustrations";

const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

// ─── Date helpers ───────────────────────────────────────────────────────────

const MONTHS_GEN = [
  "Januara", "Februara", "Marta", "Aprila", "Maja", "Juna",
  "Jula", "Avgusta", "Septembra", "Oktobra", "Novembra", "Decembra",
];

function toSerbianDeadline(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}. ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}.`;
}

// ─── Form data ──────────────────────────────────────────────────────────────

interface FormData {
  child_name: string;
  parent_names: string;
  age: number;
  gender: BirthdayGender;
  event_date_only: string;
  event_time: string;
  submit_until_date: string;
  submit_until: string;
  contact_phone: string;
  location_name: string;
  location_address: string;
  theme: BirthdayThemeType;
  displayFont: BirthdayFontType;
  tagline: string;
  countdown_enabled: boolean;
  map_enabled: boolean;
  wishes: string;
}

const TOTAL_STEPS = 4;

const STEP_TITLES = [
  "Informacije o detetu",
  "Datum i lokacija",
  "Dizajn",
  "Poslednji korak",
];

const defaultFormData: FormData = {
  child_name: "",
  parent_names: "",
  age: 1,
  gender: "boy",
  event_date_only: "",
  event_time: "16:00",
  submit_until_date: "",
  submit_until: "",
  contact_phone: "",
  location_name: "",
  location_address: "",
  theme: "boy_adventure",
  displayFont: "fredoka",
  tagline: "",
  countdown_enabled: true,
  map_enabled: true,
  wishes: "",
};

// ─── Shared UI helpers ──────────────────────────────────────────────────────

const inputCls =
  "w-full border-b border-stone-200 focus:border-[#FF6B6B] bg-transparent py-2.5 px-1 text-stone-800 text-base outline-none transition-colors placeholder:text-stone-300";

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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
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
        className={`relative w-10 h-6 sm:w-11 sm:h-6 rounded-full transition-colors duration-200 flex-shrink-0 mt-0.5 flex items-center ${checked ? "bg-[#FF6B6B]" : "bg-stone-200"}`}
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

function StepHeading({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-serif text-stone-800 mb-1">{title}</h2>
      {desc && <p className="text-stone-400 text-sm">{desc}</p>}
    </div>
  );
}

// ─── Birthday preview ───────────────────────────────────────────────────────

function BirthdayPreview({
  theme,
  displayFont,
  childName,
  age,
  gender,
}: {
  theme: BirthdayThemeType;
  displayFont: BirthdayFontType;
  childName: string;
  age: number;
  gender: BirthdayGender;
}) {
  const cssVars = getBirthdayThemeCSSVariables(theme, displayFont);
  const config = BIRTHDAY_THEME_CONFIGS[theme];

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        ...(cssVars as React.CSSProperties),
        backgroundColor: "var(--theme-surface)",
        minHeight: "280px",
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

      <div className="relative flex flex-col items-center justify-center min-h-[280px] py-8 px-6 text-center">
        {/* Age badge */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{
            background: `linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))`,
          }}
        >
          <span
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "var(--theme-display-font)" }}
          >
            {age}
          </span>
        </div>

        {/* Birthday label */}
        <p
          className="text-xs uppercase tracking-[0.3em] mb-3"
          style={{ color: "var(--theme-text-light)" }}
        >
          {age === 1 ? "prvi rođendan" : `${age}. rođendan`}
        </p>

        {/* Child name */}
        <h2
          className="text-4xl sm:text-5xl font-bold leading-tight"
          style={{
            color: "var(--theme-text)",
            fontFamily: "var(--theme-display-font)",
          }}
        >
          {childName || "Ime Deteta"}
        </h2>

        {/* Decorative line */}
        <div className="flex items-center gap-3 mt-4">
          <div
            className="h-px w-12"
            style={{ backgroundColor: "var(--theme-primary)", opacity: 0.3 }}
          />
          <span style={{ color: "var(--theme-secondary)", fontSize: 16 }}>&#9733;</span>
          <div
            className="h-px w-12"
            style={{ backgroundColor: "var(--theme-primary)", opacity: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Time picker ────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 13 }, (_, i) => i + 9);
const MINUTES = ["00", "15", "30", "45"];

function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (t: string) => void;
}) {
  const [h, m] = value.split(":") ?? ["16", "00"];

  const selectCls =
    "bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 text-base outline-none focus:border-[#FF6B6B] transition-colors cursor-pointer appearance-none text-center font-medium";

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

// ─── Steps ──────────────────────────────────────────────────────────────────

function Step1({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div>
      <StepHeading
        title="Informacije o detetu"
        desc="Unesite osnovne podatke o slavljeniku."
      />

      <div className="space-y-6">
        <Field label="Ime deteta">
          <TextInput
            value={formData.child_name}
            onChange={(v) => updateField("child_name", v)}
            placeholder="npr. Marko"
          />
        </Field>

        <Field label="Roditelji">
          <TextInput
            value={formData.parent_names}
            onChange={(v) => updateField("parent_names", v)}
            placeholder="npr. Mama Ana i tata Petar"
          />
        </Field>

        <div>
          <p className={labelCls}>Koji rođendan?</p>
          <div className="flex gap-2 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => updateField("age", n)}
                className={`w-12 h-12 rounded-xl border text-lg font-bold transition-all cursor-pointer ${
                  formData.age === n
                    ? "bg-[#FF6B6B] border-[#FF6B6B] text-white"
                    : "border-stone-200 text-stone-500 hover:border-stone-300"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className={labelCls}>Pol deteta</p>
          <div className="flex gap-3 mt-1">
            {[
              { val: "boy" as const, label: "Dečak 👦", color: "#4ECDC4" },
              { val: "girl" as const, label: "Devojčica 👧", color: "#FF6B9D" },
            ].map(({ val, label, color }) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  updateField("gender", val);
                  // Auto-switch theme when gender changes
                  const currentThemeGender = BIRTHDAY_THEME_CONFIGS[formData.theme].gender;
                  if (val !== currentThemeGender && currentThemeGender !== "neutral") {
                    const firstTheme = Object.entries(BIRTHDAY_THEME_CONFIGS).find(
                      ([, cfg]) => cfg.gender === val || cfg.gender === "neutral",
                    );
                    if (firstTheme) updateField("theme", firstTheme[0] as BirthdayThemeType);
                  }
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  formData.gender === val
                    ? "text-white"
                    : "border-stone-200 text-stone-500 hover:border-stone-300"
                }`}
                style={
                  formData.gender === val
                    ? { backgroundColor: color, borderColor: color }
                    : {}
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
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
  return (
    <div>
      <StepHeading
        title="Datum i lokacija"
        desc="Kada i gde je proslava?"
      />
      <div className="space-y-8">
        <div>
          <p className={labelCls}>Datum proslave</p>
          <DatePicker
            value={formData.event_date_only}
            onChange={(v) => updateField("event_date_only", v)}
            placeholder="Izaberite datum"
            variant="light"
            showQuickActions={false}
          />
        </div>

        <div>
          <p className={labelCls}>Vreme proslave</p>
          <TimePicker
            value={formData.event_time}
            onChange={(v) => updateField("event_time", v)}
          />
        </div>

        <div>
          <p className={labelCls}>Rok za potvrdu dolaska</p>
          <DatePicker
            value={formData.submit_until_date}
            onChange={(v) => {
              updateField("submit_until_date", v);
              updateField("submit_until", toSerbianDeadline(v));
            }}
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

        <Field label="Naziv lokacije">
          <TextInput
            value={formData.location_name}
            onChange={(v) => updateField("location_name", v)}
            placeholder="npr. Igraonica Jungle / Restoran Zvezdica"
          />
        </Field>

        <Field label="Adresa lokacije">
          <TextInput
            value={formData.location_address}
            onChange={(v) => updateField("location_address", v)}
            placeholder="npr. Bulevar Mihajla Pupina 12, Novi Sad"
          />
        </Field>

        <Field label="Vaš kontakt telefon (za naš tim, nije na pozivnici)">
          <div className="flex items-center border-b border-stone-200 focus-within:border-[#FF6B6B] transition-colors">
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

function Step3({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  const themes = Object.entries(BIRTHDAY_THEME_CONFIGS) as [
    BirthdayThemeType,
    (typeof BIRTHDAY_THEME_CONFIGS)[BirthdayThemeType],
  ][];

  // Filter themes by gender (show matching + neutral)
  const filteredThemes = themes.filter(
    ([, cfg]) =>
      cfg.gender === formData.gender || cfg.gender === "neutral",
  );

  const fonts = Object.entries(BIRTHDAY_FONT_CONFIGS) as [
    BirthdayFontType,
    (typeof BIRTHDAY_FONT_CONFIGS)[BirthdayFontType],
  ][];

  return (
    <div>
      <StepHeading
        title="Dizajn"
        desc="Izaberite temu i font — pregled se ažurira uživo."
      />

      {/* Live preview */}
      <div className="mb-6">
        <p className={labelCls + " mb-3"}>Pregled pozivnice</p>
        <BirthdayPreview
          theme={formData.theme}
          displayFont={formData.displayFont}
          childName={formData.child_name}
          age={formData.age}
          gender={formData.gender}
        />
      </div>

      {/* Font dropdown */}
      <div className="mb-8">
        <p className={labelCls + " mb-2"}>Font za ime</p>
        <div className="relative">
          <select
            value={formData.displayFont}
            onChange={(e) =>
              updateField("displayFont", e.target.value as BirthdayFontType)
            }
            className="w-full appearance-none bg-white border border-stone-200 rounded-xl px-4 py-3 pr-10 text-stone-800 text-sm font-medium outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/10 transition-all cursor-pointer"
          >
            {fonts.map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.name} — {cfg.description}
              </option>
            ))}
          </select>
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
      </div>

      {/* Theme selector */}
      <p className={labelCls + " mb-3"}>Tema pozivnice</p>
      <div className="grid grid-cols-2 gap-3">
        {filteredThemes.map(([key, cfg]) => (
          <button
            key={key}
            type="button"
            onClick={() => updateField("theme", key)}
            className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              formData.theme === key
                ? "border-[#FF6B6B] shadow-md"
                : "border-stone-100 hover:border-stone-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full border border-black/5"
                style={{ backgroundColor: cfg.colors.primary }}
              />
              <div
                className="w-6 h-6 rounded-full border border-black/5"
                style={{ backgroundColor: cfg.colors.secondary }}
              />
            </div>
            <p className="text-sm font-semibold text-stone-700">{cfg.name}</p>
            <p className="text-xs text-stone-400">
              {cfg.gender === "boy" ? "Dečak" : cfg.gender === "girl" ? "Devojčica" : "Neutralno"}
            </p>
            {formData.theme === key && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#FF6B6B] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step4({
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
        desc="Dodajte lični pečat i pošaljite zahtev."
      />
      <div className="space-y-6">
        <div className="bg-[#FF6B6B]/5 border border-[#FF6B6B]/15 rounded-2xl px-5 py-4 text-sm text-[#E55A5A] leading-relaxed">
          <p className="font-semibold mb-1">🎉 Skoro sve je spremno!</p>
          <p>
            Mapu, RSVP formu i odbrojavanje ćemo podesiti mi — vi samo
            kliknite <em>Pošalji zahtev</em> i mi ćemo se pobrinuti za sve.
          </p>
        </div>

        <Field label="Tagline (poruka na pozivnici)">
          <textarea
            className="w-full border-b border-stone-200 focus:border-[#FF6B6B] bg-transparent py-2.5 px-1 text-stone-800 text-base outline-none transition-colors placeholder:text-stone-300 resize-none"
            rows={2}
            value={formData.tagline}
            onChange={(e) => updateField("tagline", e.target.value)}
            placeholder="npr. Naša mala zvezda slavi prvi rođendan!"
          />
        </Field>

        <div className="space-y-5">
          <p className={labelCls}>Šta prikazati gostima?</p>
          <Toggle
            checked={formData.countdown_enabled}
            onChange={(v) => updateField("countdown_enabled", v)}
            label="Odbrojavanje do proslave (dani, sati, minuti, sekunde)"
          />
          <Toggle
            checked={formData.map_enabled}
            onChange={(v) => updateField("map_enabled", v)}
            label="Interaktivna google mapa do lokacije"
          />
        </div>

        <Field label="Posebne napomene ili zahtevi (opciono)">
          <textarea
            className="w-full border-b border-stone-200 focus:border-[#FF6B6B] bg-transparent py-2.5 px-1 text-stone-800 text-base outline-none transition-colors placeholder:text-stone-300 resize-none"
            rows={3}
            value={formData.wishes}
            onChange={(e) => updateField("wishes", e.target.value)}
            placeholder="Ovde napišite ukoliko imate posebne zahteve..."
          />
        </Field>
      </div>
    </div>
  );
}

// ─── JSON generator ─────────────────────────────────────────────────────────

function generateBirthdayJson(formData: FormData): string {
  const json = {
    theme: formData.theme,
    gender: formData.gender,
    displayFont: formData.displayFont,
    child_name: formData.child_name,
    parent_names: formData.parent_names,
    age: formData.age,
    event_date: formData.event_date_only
      ? `${formData.event_date_only}T${formData.event_time}:00`
      : "",
    submit_until: formData.submit_until_date,
    tagline: formData.tagline,
    location: {
      name: formData.location_name,
      address: formData.location_address,
      map_url: "",
    },
    countdown_enabled: formData.countdown_enabled,
    map_enabled: formData.map_enabled,
    admin_password: "",
    draft: false,
  };
  return JSON.stringify(json, null, 2);
}

// ─── Main form ──────────────────────────────────────────────────────────────

export default function BirthdayQuestionnaireForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof FormData>(
    key: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const goPrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const formattedDate = formData.event_date_only
        ? new Date(formData.event_date_only + "T12:00:00").toLocaleDateString(
            "sr-Latn-RS",
            { weekday: "long", year: "numeric", month: "long", day: "numeric" },
          )
        : "";

      const genderLabel =
        formData.gender === "boy" ? "Dečak" : formData.gender === "girl" ? "Devojčica" : "Neutralno";

      const payload: Record<string, string> = {
        access_key: WEB3FORMS_ACCESS_KEY || "",
        subject: `Novi Rođendan - ${formData.child_name} (${formData.age}. rođendan)`,
        from_name: "Halo Rođendani",

        "Ime deteta": formData.child_name,
        Roditelji: formData.parent_names,
        Uzrast: `${formData.age}. rođendan`,
        Pol: genderLabel,
        "Datum proslave": `${formattedDate}, ${formData.event_time}h`,
        "Rok za prijavu": formData.submit_until,
        Lokacija: `${formData.location_name}, ${formData.location_address}`,
        "Kontakt telefon": `+381${formData.contact_phone}`,
        "Napomena": formData.wishes || "(nema)",
        "📋 JSON": generateBirthdayJson(formData),
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
        <div className="w-20 h-20 bg-[#FF6B6B] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#FF6B6B]/25">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-serif text-[#FF6B6B] mb-4">
          Hvala!
        </h2>
        <p className="text-[#E55A5A] text-lg mb-3">
          Uspešno smo primili podatke za pozivnicu za {formData.child_name}.
        </p>
        {formData.event_date_only && (
          <p className="text-[#FF6B6B]/70 mb-8">
            Proslava:{" "}
            {new Date(
              formData.event_date_only + "T12:00:00",
            ).toLocaleDateString("sr-Latn-RS", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
        <p className="text-[#E55A5A] text-sm">
          Uskoro ćemo napraviti pozivnicu i kontaktirati vas. 🎉
        </p>
      </div>
    );
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  const currentThemeConfig = BIRTHDAY_THEME_CONFIGS[formData.theme];

  // Sync page background with selected theme
  useEffect(() => {
    const main = document.querySelector(".birthday-form-page") as HTMLElement;
    if (main) {
      main.style.backgroundColor = currentThemeConfig.colors.background;
    }
    return () => {
      if (main) main.style.backgroundColor = "";
    };
  }, [currentThemeConfig.colors.background]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Floating illustrations — updates with selected theme */}
      <SceneDecorations
        illustration={currentThemeConfig.illustration}
        confetti={currentThemeConfig.colors.confetti}
      />
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-[#E55A5A]">
            {STEP_TITLES[step - 1]}
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF6B6B]">
            Korak {step} od {TOTAL_STEPS}
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#FF6B6B]/15 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#FF6B6B] rounded-full"
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
                i + 1 <= step ? "bg-[#FF6B6B]" : "bg-[#FF6B6B]/25"
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
              <Step4 formData={formData} updateField={updateField} />
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
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm cursor-pointer"
          >
            <ChevronLeft size={16} />
            Nazad
          </button>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#FF6B6B] text-white hover:bg-[#E55A5A] transition-all font-medium text-sm shadow-md shadow-[#FF6B6B]/20 cursor-pointer"
            >
              Dalje
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#FF6B6B] text-white hover:bg-[#E55A5A] transition-all font-medium text-sm shadow-md shadow-[#FF6B6B]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
