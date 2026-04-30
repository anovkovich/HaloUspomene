"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Phone,
  Instagram,
  Lock,
  Calendar,
  Loader2,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import { signupAction } from "./actions";
import { PhoneVerificationField } from "@/components/verification/PhoneVerificationField";
import {
  useRecaptcha,
  RecaptchaDisclosure,
} from "@/components/forms/RecaptchaProvider";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

type Variant = "light" | "dark";

const THEMES = {
  dark: {
    label: "text-[#F5F4DC]/40",
    helper: "text-[#F5F4DC]/25",
    disclosure: "text-[#F5F4DC]/20",
    inputWrap:
      "bg-white/5 border border-white/10 focus-within:border-[#AE343F]",
    input:
      "bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-[#AE343F]",
    igPrefix: "text-[#F5F4DC]/40",
    successCard: "bg-white/5 border border-white/10",
    successTitle: "text-[#F5F4DC]",
    successSubtitle: "text-[#F5F4DC]/50",
    successValue: "text-[#F5F4DC]",
    successSlug: "text-[#F5F4DC]/60",
    successFootnote: "text-[#F5F4DC]/20",
  },
  light: {
    label: "text-[#232323]/55",
    helper: "text-[#232323]/50",
    disclosure: "text-[#232323]/40",
    inputWrap:
      "bg-[#232323]/5 border border-[#232323]/15 focus-within:border-[#AE343F]",
    input:
      "bg-[#232323]/5 border border-[#232323]/15 text-[#232323] placeholder:text-[#232323]/30 focus:border-[#AE343F]",
    igPrefix: "text-[#232323]/45",
    successCard: "bg-[#232323]/5 border border-[#232323]/15",
    successTitle: "text-[#232323]",
    successSubtitle: "text-[#232323]/55",
    successValue: "text-[#232323]",
    successSlug: "text-[#232323]/70",
    successFootnote: "text-[#232323]/45",
  },
} as const;

interface QuickStartFormProps {
  variant?: Variant;
}

export default function QuickStartForm({
  variant = "dark",
}: QuickStartFormProps = {}) {
  const t = THEMES[variant];
  const savedSlug = typeof document !== "undefined" ? getCookie("moje_vencanje_slug") : undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    slug: string;
    bride: string;
    groom: string;
  } | null>(null);

  const [bride, setBride] = useState("");
  const [groom, setGroom] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTrustToken, setPhoneTrustToken] = useState("");
  const [instagram, setInstagram] = useState("");
  const [password, setPassword] = useState("");
  const { execute: executeRecaptcha } = useRecaptcha();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!phone) {
      setError("Unesite broj telefona.");
      return;
    }
    if (!phoneTrustToken) {
      setError("Verifikujte broj telefona pre kreiranja naloga.");
      return;
    }

    setLoading(true);

    let recaptchaToken = "";
    try {
      recaptchaToken = await executeRecaptcha("quickstart");
    } catch {
      setError("Provera neuspešna. Osvežite stranicu i pokušajte ponovo.");
      setLoading(false);
      return;
    }

    const result = await signupAction({
      bride,
      groom,
      eventDate,
      phone,
      instagram,
      password,
      recaptchaToken,
      phoneTrustToken,
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess({
      slug: result.slug,
      bride: bride.trim(),
      groom: groom.trim(),
    });
    setLoading(false);

    // Send notification email client-side (Web3Forms blocks server-side requests via Cloudflare)
    const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
    if (WEB3FORMS_KEY) {
      const b = bride.trim();
      const g = groom.trim();
      const dateStr = eventDate
        ? new Date(eventDate).toLocaleDateString("sr-Latn-RS", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Nije unesen";
      const contact = [
        phone ? `Telefon: +381${phone}` : "",
        instagram ? `Instagram: @${instagram.replace(/^@/, "")}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Novi par — ${b} & ${g} — Planer registracija`,
          from_name: "HALO Uspomene — Planer",
          par: `${b} & ${g}`,
          slug: result.slug,
          datum_vencanja: dateStr,
          kontakt: contact,
          stranica: "https://halouspomene.rs/moje-vencanje",
        }),
      }).catch(() => {});
    }
  }

  // Already registered — show login link
  if (savedSlug) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-[#AE343F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-[#AE343F]" />
        </div>
        <p className={`${t.successTitle} font-serif text-lg mb-2`}>
          Već imate nalog
        </p>
        <p className={`text-sm ${t.successSubtitle} mb-6`}>
          Vaš slug:{" "}
          <span className={`font-mono ${t.successSlug}`}>{savedSlug}</span>
        </p>
        <Link
          href="/moje-vencanje"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-xl font-semibold transition-colors"
        >
          <LogIn size={16} />
          Uđite u planer
        </Link>
      </div>
    );
  }

  // Success — show credentials
  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-green-400" />
        </div>
        <p className={`${t.successTitle} font-serif text-xl mb-2`}>
          Nalog kreiran!
        </p>
        <p className={`text-sm ${t.successSubtitle} mb-6`}>
          {success.bride} & {success.groom} — sve je spremno.
        </p>

        <div className={`${t.successCard} rounded-xl p-4 mb-6 text-left space-y-2`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs ${t.label} uppercase tracking-wider`}>
              Vaš slug
            </span>
            <span className={`font-mono text-sm ${t.successValue}`}>
              {success.slug}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs ${t.label} uppercase tracking-wider`}>
              Lozinka
            </span>
            <span className={`text-sm ${t.successSubtitle}`}>
              ona koju ste uneli
            </span>
          </div>
        </div>

        <Link
          href="/moje-vencanje"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-xl font-bold transition-colors text-base"
        >
          Uđite u planer
          <ArrowRight size={18} />
        </Link>

        <p className={`text-[10px] ${t.successFootnote} mt-4`}>
          Isprobajte odmah, a naš tim će vas kontaktirati za pozivnicu.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Names */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${t.label} mb-2`}>
            <User size={12} className="text-[#AE343F]" />
            Ime mlade *
          </label>
          <input
            type="text"
            required
            name="bride_ignore"
            autoComplete="off"
            value={bride}
            onChange={(e) => setBride(e.target.value)}
            placeholder="Ana"
            className={`w-full ${t.input} rounded-xl px-4 py-3 focus:outline-none transition-colors`}
            disabled={loading}
          />
        </div>
        <div>
          <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${t.label} mb-2`}>
            <User size={12} className="text-[#AE343F]" />
            Ime mladoženje *
          </label>
          <input
            type="text"
            required
            name="groom_ignore"
            autoComplete="off"
            value={groom}
            onChange={(e) => setGroom(e.target.value)}
            placeholder="Dejan"
            className={`w-full ${t.input} rounded-xl px-4 py-3 focus:outline-none transition-colors`}
            disabled={loading}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${t.label} mb-2`}>
          <Lock size={12} className="text-[#AE343F]" />
          Lozinka za pristup *
        </label>
        <input
          type="text"
          required
          name="pw_ignore"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Najmanje 4 karaktera"
          minLength={4}
          className={`w-full ${t.input} rounded-xl px-4 py-3 focus:outline-none transition-colors`}
          style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
          disabled={loading}
        />
        <p className={`text-[10px] ${t.helper} mt-1.5 pl-1`}>
          Ovom lozinkom ćete se prijavljivati na stranicu MOJE VENČANJE
        </p>
      </div>

      {/* Contact — phone (required) + instagram (optional) */}
      <div>
        <p className={`text-xs font-bold uppercase tracking-widest ${t.label} mb-3`}>
          Kontakt telefon *{" "}
          <span className={`${t.disclosure} normal-case tracking-normal font-normal`}>
            Instagram je opcioni
          </span>
        </p>
        <div className="space-y-3">
          <PhoneVerificationField
            variant={variant}
            disabled={loading}
            value={phone}
            onChange={(v) => {
              setPhone(v);
              if (phoneTrustToken) setPhoneTrustToken("");
            }}
            onVerified={(token) => setPhoneTrustToken(token)}
            onUnverified={() => setPhoneTrustToken("")}
          />
          <div className={`flex items-center ${t.inputWrap} rounded-xl transition-colors overflow-hidden`}>
            <span className={`flex items-center gap-2 pl-4 pr-2 ${t.igPrefix} shrink-0`}>
              <Instagram size={14} className="text-[#AE343F]" />
              <span className="text-sm">@</span>
            </span>
            <input
              type="text"
              name="ig_ignore"
              autoComplete="off"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
              placeholder="instagram_username"
              className={`flex-1 bg-transparent py-3 pr-4 ${
                variant === "dark"
                  ? "text-white placeholder:text-white/20"
                  : "text-[#232323] placeholder:text-[#232323]/30"
              } focus:outline-none`}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Date — DatePicker */}
      <div>
        <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${t.label} mb-2`}>
          <Calendar size={12} className="text-[#AE343F]" />
          Datum venčanja
          <span className={`${t.disclosure} normal-case tracking-normal font-normal`}>
            (opciono)
          </span>
        </label>
        <DatePicker
          value={eventDate}
          onChange={(date) => setEventDate(date)}
          placeholder="Izaberite datum"
          showQuickActions={false}
          variant={variant}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-base font-bold transition-all bg-[#AE343F] hover:bg-[#8A2A32] text-white shadow-xl shadow-[#AE343F]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Kreiranje naloga...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Kreiraj nalog
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className={`text-center text-[10px] ${t.disclosure} leading-relaxed`}>
        Isprobajte odmah, a naš tim će vas kontaktirati za pozivnicu.
      </p>
      <RecaptchaDisclosure className={`text-center text-[9px] ${t.disclosure}`} />
    </form>
  );
}
