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
  Sparkles,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import { validateStep } from "@/lib/wizard-validation";
import {
  punoletstvoValidators,
  STEP_KEYS,
  type PunoletstvoGender,
  type PunoletstvoTheme,
} from "./validators";
import { PhoneVerificationField } from "@/components/verification/PhoneVerificationField";
import {
  useRecaptcha,
  RecaptchaDisclosure,
} from "@/components/forms/RecaptchaProvider";

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

type ScriptFont =
  | "great-vibes"
  | "dancing-script"
  | "alex-brush"
  | "parisienne"
  | "allura"
  | "marck-script"
  | "caveat"
  | "bad-script";

interface FormData {
  honoree_name: string;
  honoree_surname: string;
  gender: PunoletstvoGender;
  event_date_only: string;
  event_time: string;
  submit_until_date: string;
  submit_until: string;
  contact_phone: string;
  phone_trust_token: string;
  location_name: string;
  location_address: string;
  theme: PunoletstvoTheme;
  scriptFont: ScriptFont;
  tagline: string;
  countdown_enabled: boolean;
  map_enabled: boolean;
  wishes: string;
}

const TOTAL_STEPS = 4;

const STEP_TITLES = [
  "Slavljenik",
  "Datum i lokacija",
  "Dizajn",
  "Poslednji korak",
];

const SCRIPT_FONTS: { key: ScriptFont; name: string; cssVar: string; description: string }[] = [
  { key: "great-vibes", name: "Great Vibes", cssVar: "var(--font-great-vibes)", description: "Elegantni ukošeni script" },
  { key: "dancing-script", name: "Dancing Script", cssVar: "var(--font-dancing-script)", description: "Opušten i prijateljski" },
  { key: "alex-brush", name: "Alex Brush", cssVar: "var(--font-alex-brush)", description: "Kaligrafska kičica" },
  { key: "parisienne", name: "Parisienne", cssVar: "var(--font-parisienne)", description: "Romantičan francuski stil" },
  { key: "allura", name: "Allura", cssVar: "var(--font-allura)", description: "Klasičan svečani script" },
  { key: "marck-script", name: "Marck Script", cssVar: "var(--font-marck-script)", description: "Elegantna ćirilica" },
  { key: "caveat", name: "Caveat", cssVar: "var(--font-caveat)", description: "Tečna ćirilica rukopisa" },
  { key: "bad-script", name: "Bad Script", cssVar: "var(--font-bad-script)", description: "Opuštena ćirilica" },
];

const THEME_CARDS: {
  key: PunoletstvoTheme;
  name: string;
  gender: PunoletstvoGender;
  primary: string;
  accent: string;
  bg: string;
}[] = [
  {
    key: "white_gold_burgundy",
    name: "White · Gold · Burgundy",
    gender: "female",
    primary: "#800020",
    accent: "#d4af37",
    bg: "#fffdf5",
  },
  {
    key: "white_gold_navy",
    name: "White · Gold · Navy",
    gender: "male",
    primary: "#0A1F44",
    accent: "#d4af37",
    bg: "#fffdf5",
  },
];

const defaultFormData: FormData = {
  honoree_name: "",
  honoree_surname: "",
  gender: "female",
  event_date_only: "",
  event_time: "20:00",
  submit_until_date: "",
  submit_until: "",
  contact_phone: "",
  phone_trust_token: "",
  location_name: "",
  location_address: "",
  theme: "white_gold_burgundy",
  scriptFont: "great-vibes",
  tagline: "Imam čast pozvati Vas na moj osamnaesti rođendan",
  countdown_enabled: true,
  map_enabled: true,
  wishes: "",
};

// ─── Shared UI ──────────────────────────────────────────────────────────────

const GOLD = "#d4af37";

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
        className={`relative w-10 h-6 sm:w-11 sm:h-6 rounded-full transition-colors duration-200 flex-shrink-0 mt-0.5 flex items-center ${checked ? "bg-[#AE343F]" : "bg-stone-200"}`}
      >
        <div
          className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "sm:translate-x-6 translate-x-5" : "translate-x-1"}`}
        />
      </div>
      <span className="text-stone-600 text-xs sm:text-sm leading-tight">{label}</span>
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

// ─── Preview card ───────────────────────────────────────────────────────────

function PunoletstvoPreview({
  theme,
  scriptFont,
  honoreeName,
  honoreeSurname,
}: {
  theme: PunoletstvoTheme;
  scriptFont: ScriptFont;
  honoreeName: string;
  honoreeSurname: string;
}) {
  const cfg = THEME_CARDS.find((c) => c.key === theme)!;
  const fontCfg = SCRIPT_FONTS.find((f) => f.key === scriptFont)!;
  const displayName =
    [honoreeName, honoreeSurname].filter(Boolean).join(" ") || "Ime Slavljenika";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-stone-200"
      style={{ backgroundColor: cfg.bg, minHeight: 280 }}
    >
      <div className="absolute top-3 right-3 z-10">
        <span
          className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full"
          style={{ backgroundColor: cfg.accent + "22", color: cfg.primary }}
        >
          Preview
        </span>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-[280px] py-10 px-6 text-center">
        <p
          className="text-[10px] uppercase tracking-[0.35em] mb-3"
          style={{ color: cfg.primary, opacity: 0.7 }}
        >
          18. rođendan
        </p>

        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-8" style={{ backgroundColor: cfg.accent }} />
          <Sparkles size={14} style={{ color: cfg.accent }} />
          <div className="h-px w-8" style={{ backgroundColor: cfg.accent }} />
        </div>

        <h2
          className="text-5xl sm:text-6xl leading-tight"
          style={{ color: cfg.primary, fontFamily: fontCfg.cssVar }}
        >
          {displayName}
        </h2>

        <div className="flex items-center gap-3 mt-4">
          <div className="h-px w-12" style={{ backgroundColor: cfg.primary, opacity: 0.3 }} />
          <span style={{ color: cfg.accent, fontSize: 14 }}>✦</span>
          <div className="h-px w-12" style={{ backgroundColor: cfg.primary, opacity: 0.3 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Time picker ────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 18 }, (_, i) => i + 7); // 07..24
const MINUTES = ["00", "15", "30", "45"];

function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (t: string) => void;
}) {
  const [h, m] = value.split(":") ?? ["20", "00"];

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
        title="Slavljenik"
        desc="Unesite osnovne podatke o slavljeniku."
      />
      <div className="space-y-6">
        <Field label="Ime">
          <TextInput
            value={formData.honoree_name}
            onChange={(v) => updateField("honoree_name", v)}
            placeholder="npr. Marija"
          />
        </Field>

        <Field label="Prezime">
          <TextInput
            value={formData.honoree_surname}
            onChange={(v) => updateField("honoree_surname", v)}
            placeholder="npr. Petrović"
          />
        </Field>

        <div>
          <p className={labelCls}>Pol slavljenika</p>
          <div className="flex gap-3 mt-1">
            {[
              { val: "female" as const, label: "Devojka 👑", color: "#800020" },
              { val: "male" as const, label: "Momak 🎩", color: "#0A1F44" },
            ].map(({ val, label, color }) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  updateField("gender", val);
                  // Auto-switch theme to matching palette
                  updateField(
                    "theme",
                    val === "female" ? "white_gold_burgundy" : "white_gold_navy",
                  );
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
          <p className="text-xs text-stone-400 mt-2">
            Boje pozivnice će biti predložene po polu — možete ih menjati u koraku Dizajn.
          </p>
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
      <StepHeading title="Datum i lokacija" desc="Kada i gde je proslava?" />
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
              <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">Prikaz:</span>
              <span className="text-sm text-stone-600 font-medium">{formData.submit_until}</span>
            </div>
          )}
        </div>

        <Field label="Naziv lokacije">
          <TextInput
            value={formData.location_name}
            onChange={(v) => updateField("location_name", v)}
            placeholder="npr. Restoran Bela Reka"
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
        </Field>
      </div>
      <RecaptchaDisclosure className="mt-4 text-[10px] text-stone-400 text-center" />
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
  return (
    <div>
      <StepHeading title="Dizajn" desc="Boje i script font — pregled se ažurira uživo." />

      <div className="mb-6">
        <p className={labelCls + " mb-3"}>Pregled pozivnice</p>
        <PunoletstvoPreview
          theme={formData.theme}
          scriptFont={formData.scriptFont}
          honoreeName={formData.honoree_name}
          honoreeSurname={formData.honoree_surname}
        />
      </div>

      <div className="mb-8">
        <p className={labelCls + " mb-2"}>Font za ime</p>
        <div className="relative">
          <select
            value={formData.scriptFont}
            onChange={(e) => updateField("scriptFont", e.target.value as ScriptFont)}
            className="w-full appearance-none bg-white border border-stone-200 rounded-xl px-4 py-3 pr-10 text-stone-800 text-sm font-medium outline-none focus:border-[#AE343F] focus:ring-2 focus:ring-[#AE343F]/10 transition-all cursor-pointer"
          >
            {SCRIPT_FONTS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.name} — {f.description}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <p className={labelCls + " mb-3"}>Boje pozivnice</p>
      <div className="grid grid-cols-2 gap-3">
        {THEME_CARDS.map((cfg) => (
          <button
            key={cfg.key}
            type="button"
            onClick={() => updateField("theme", cfg.key)}
            className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              formData.theme === cfg.key
                ? "border-[#AE343F] shadow-md"
                : "border-stone-100 hover:border-stone-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full border border-black/5"
                style={{ backgroundColor: cfg.primary }}
              />
              <div
                className="w-6 h-6 rounded-full border border-black/5"
                style={{ backgroundColor: cfg.accent }}
              />
              <div
                className="w-6 h-6 rounded-full border border-black/10"
                style={{ backgroundColor: "#ffffff" }}
              />
            </div>
            <p className="text-sm font-semibold text-stone-700">{cfg.name}</p>
            <p className="text-xs text-stone-400">
              {cfg.gender === "female" ? "Devojka" : "Momak"} (predlog)
            </p>
            {formData.theme === cfg.key && (
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

function Step4({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div>
      <StepHeading title="Poslednji korak!" desc="Dodajte lični pečat i pošaljite zahtev." />
      <div className="space-y-6">
        <div className="bg-[#AE343F]/5 border border-[#AE343F]/15 rounded-2xl px-5 py-4 text-sm text-[#7A242C] leading-relaxed">
          <p className="font-semibold mb-1">🥂 Skoro sve je spremno!</p>
          <p>
            Klasičan omot, RSVP formu i odbrojavanje ćemo podesiti mi — vi samo
            kliknite <em>Pošalji zahtev</em> i mi ćemo se pobrinuti za sve.
          </p>
        </div>

        <Field label="Tagline (poruka na pozivnici)">
          <textarea
            className="w-full border-b border-stone-200 focus:border-[#AE343F] bg-transparent py-2.5 px-1 text-stone-800 text-base outline-none transition-colors placeholder:text-stone-300 resize-none"
            rows={2}
            value={formData.tagline}
            onChange={(e) => updateField("tagline", e.target.value)}
            placeholder="npr. Imam čast pozvati Vas na moj osamnaesti rođendan"
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
            className="w-full border-b border-stone-200 focus:border-[#AE343F] bg-transparent py-2.5 px-1 text-stone-800 text-base outline-none transition-colors placeholder:text-stone-300 resize-none"
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

// ─── Main form ──────────────────────────────────────────────────────────────

export default function PunoletstvoQuestionnaireForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);
  const { execute: executeRecaptcha } = useRecaptcha();

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (stepError) setStepError(null);
  };

  const goNext = () => {
    const key = STEP_KEYS[step - 1];
    const err = validateStep(punoletstvoValidators, key, formData);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const goPrev = () => {
    setStepError(null);
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleSubmit = async () => {
    for (const k of STEP_KEYS) {
      const msg = validateStep(punoletstvoValidators, k, formData);
      if (msg) {
        const badStep = STEP_KEYS.indexOf(k) + 1;
        setStep(badStep);
        setStepError(msg);
        return;
      }
    }
    setStepError(null);
    setError(null);
    setIsSubmitting(true);
    try {
      let recaptchaToken: string;
      try {
        recaptchaToken = await executeRecaptcha("create_punoletstvo");
      } catch {
        setError("Provera neuspešna. Osvežite stranicu i pokušajte ponovo.");
        setIsSubmitting(false);
        return;
      }

      // 1) Persist as draft in MongoDB (mirrors wedding classic flow).
      const punoletstvoApiPayload = {
        theme: formData.theme,
        scriptFont: formData.scriptFont,
        gender: formData.gender,
        honoree_name: formData.honoree_name,
        honoree_surname: formData.honoree_surname,
        event_date: formData.event_date_only
          ? `${formData.event_date_only}T${formData.event_time}:00`
          : "",
        submit_until: formData.submit_until_date,
        tagline: formData.tagline,
        location: {
          name: formData.location_name,
          address: formData.location_address,
        },
        countdown_enabled: formData.countdown_enabled,
        map_enabled: formData.map_enabled,
        contact_phone: `+381${formData.contact_phone}`,
        phone_trust_token: formData.phone_trust_token,
        recaptcha_token: recaptchaToken,
      };
      const res = await fetch("/api/punoletstvo/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(punoletstvoApiPayload),
      });
      const created = await res.json();
      if (!res.ok) throw new Error(created.error || "Greška pri kreiranju pozivnice");

      setIsSubmitted(true);

      // 2) Notify admin from client (Web3Forms blocks server requests).
      if (WEB3FORMS_ACCESS_KEY) {
        const formattedDate = formData.event_date_only
          ? new Date(formData.event_date_only + "T12:00:00").toLocaleDateString(
              "sr-Latn-RS",
              { weekday: "long", year: "numeric", month: "long", day: "numeric" },
            )
          : "";
        const genderLabel = formData.gender === "female" ? "Devojka" : "Momak";
        const themeLabel =
          formData.theme === "white_gold_burgundy"
            ? "White · Gold · Burgundy"
            : "White · Gold · Navy";
        const displayName = [formData.honoree_name, formData.honoree_surname]
          .filter(Boolean)
          .join(" ");

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `🥂 Nova punoletstvo pozivnica — ${displayName}`,
            from_name: "Halo Punoletstvo",
            "Ime i prezime": displayName,
            Slug: created.slug,
            Pol: genderLabel,
            "Datum proslave": `${formattedDate}, ${formData.event_time}h`,
            "Rok za prijavu": formData.submit_until,
            Lokacija: `${formData.location_name}, ${formData.location_address}`,
            "Kontakt telefon": `+381${formData.contact_phone}`,
            Boje: themeLabel,
            Napomena: formData.wishes || "(nema)",
            "Admin link": `https://halouspomene.rs/admin/rodjendan/${created.slug}`,
            "JSON podaci": JSON.stringify(punoletstvoApiPayload, (k, v) => k === "recaptcha_token" ? undefined : v, 2),
          }),
        }).catch(() => {});
      }
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
    const displayName = [formData.honoree_name, formData.honoree_surname]
      .filter(Boolean)
      .join(" ");
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-12 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-[#AE343F] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#AE343F]/25">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-serif text-[#AE343F] mb-4">Hvala!</h2>
        <p className="text-[#7A242C] text-lg mb-3">
          Uspešno smo primili podatke za punoletstvo pozivnicu za {displayName}.
        </p>
        {formData.event_date_only && (
          <p className="text-[#AE343F]/70 mb-8">
            Proslava:{" "}
            {new Date(formData.event_date_only + "T12:00:00").toLocaleDateString(
              "sr-Latn-RS",
              { day: "numeric", month: "long", year: "numeric" },
            )}
          </p>
        )}
        <p className="text-[#7A242C] text-sm">
          Uskoro ćemo napraviti pozivnicu i kontaktirati vas. 🥂
        </p>
      </div>
    );
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div ref={formTopRef} className="max-w-2xl mx-auto scroll-mt-4">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-[#7A242C]">
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
            {step === 1 && <Step1 formData={formData} updateField={updateField} />}
            {step === 2 && <Step2 formData={formData} updateField={updateField} />}
            {step === 3 && <Step3 formData={formData} updateField={updateField} />}
            {step === 4 && <Step4 formData={formData} updateField={updateField} />}
          </motion.div>
        </AnimatePresence>

        {stepError && (
          <div className="mx-8 mb-4 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{stepError}</span>
          </div>
        )}

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
              disabled={
                STEP_KEYS[step - 1] === "date_location" &&
                !formData.phone_trust_token
              }
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#AE343F] text-white hover:bg-[#952c35] transition-all font-medium text-sm shadow-md shadow-[#AE343F]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Dalje
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#AE343F] text-white hover:bg-[#952c35] transition-all font-medium text-sm shadow-md shadow-[#AE343F]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

      {/* Decorative flourish */}
      <div className="flex items-center justify-center gap-3 mt-10 text-stone-300">
        <div className="h-px w-10 bg-current" />
        <Sparkles size={14} style={{ color: GOLD }} />
        <div className="h-px w-10 bg-current" />
      </div>
    </div>
  );
}
