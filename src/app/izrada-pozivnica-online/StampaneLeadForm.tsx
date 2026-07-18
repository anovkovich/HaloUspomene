"use client";

import React, { useState } from "react";
import {
  User,
  Phone,
  Calendar,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import { PhoneVerificationField } from "@/components/verification/PhoneVerificationField";
import {
  useRecaptcha,
  RecaptchaDisclosure,
} from "@/components/forms/RecaptchaProvider";

/**
 * Lead form for requesting hand-made PRINTED invitations and/or thank-you cards
 * with QR codes. Mirrors GalleryLeadForm/CarRentalLeadForm: phone verification
 * (Infobip via /api/contact) + reCAPTCHA, then a client-side Web3Forms submit
 * (Cloudflare blocks server-side requests to web3forms from Vercel).
 */
const StampaneLeadForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { execute: executeRecaptcha } = useRecaptcha();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    wantPozivnice: true,
    wantZahvalnice: false,
    note: "",
    acceptedTerms: false,
  });
  const [phoneTrustToken, setPhoneTrustToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.wantPozivnice && !formData.wantZahvalnice) {
      setError("Izaberite bar jedno: pozivnice ili zahvalnice.");
      return;
    }
    if (!phoneTrustToken) {
      setError("Verifikujte broj telefona pre slanja upita.");
      return;
    }
    const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
    if (!WEB3FORMS_KEY) {
      setError(
        "Forma trenutno nije dostupna. Pišite na halouspomene@gmail.com.",
      );
      return;
    }
    setIsLoading(true);

    try {
      let recaptchaToken: string;
      try {
        recaptchaToken = await executeRecaptcha("contact");
      } catch {
        setError("Provera neuspešna. Osvežite stranicu i pokušajte ponovo.");
        setIsLoading(false);
        return;
      }

      const verifyRes = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+381${formData.phone}`,
          phoneTrustToken,
          recaptchaToken,
        }),
      });

      const verifyData = (await verifyRes.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!verifyRes.ok || !verifyData.ok) {
        throw new Error(verifyData.error || "Provera nije uspela.");
      }

      const formattedDate = formData.date
        ? new Date(formData.date).toLocaleDateString("sr-Latn-RS", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Nije navedeno";

      const zeli = [
        formData.wantPozivnice ? "Pozivnice" : null,
        formData.wantZahvalnice ? "Zahvalnice" : null,
      ]
        .filter(Boolean)
        .join(" + ");

      // Web3Forms is called from the client because Cloudflare blocks
      // server-side requests to api.web3forms.com from Vercel.
      const w3 = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Štampane pozivnice/zahvalnice - ${formData.name} - ${formattedDate}`,
          from_name: "HALO Uspomene",
          name: formData.name,
          telefon: `+381${formData.phone}`,
          datum_dogadjaja: formattedDate,
          zeli: zeli || "Nije navedeno",
          napomena: formData.note || "—",
          paket: "Štampane pozivnice i zahvalnice sa QR kodom",
        }),
      });

      const w3Data = (await w3.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
      };

      if (!w3.ok || !w3Data.success) {
        throw new Error(
          w3Data.message || "Slanje nije uspelo. Pokušajte ponovo.",
        );
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Došlo je do greške pri slanju. Pokušajte ponovo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setError(null);
    setFormData({
      name: "",
      phone: "",
      date: "",
      wantPozivnice: true,
      wantZahvalnice: false,
      note: "",
      acceptedTerms: false,
    });
    setPhoneTrustToken("");
  };

  if (isSubmitted) {
    return (
      <div className="bg-white/5 backdrop-blur-md p-8 sm:p-12 md:p-16 rounded-[2rem] md:rounded-[3rem] border border-white/10 text-center">
        <div className="w-24 h-24 bg-[#AE343F] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#AE343F]/40">
          <CheckCircle2 size={48} className="text-[#F5F4DC]" />
        </div>
        <h3 className="text-4xl font-serif text-[#F5F4DC] mb-4">
          Hvala Vam, {formData.name.split(" ")[0]}!
        </h3>
        <p className="text-[#F5F4DC]/60 text-lg mb-8">
          Vaš upit za štampane pozivnice / zahvalnice je uspešno primljen. <br />
          Javljamo se u najkraćem roku sa ponudom i detaljima.
        </p>
        <button
          onClick={resetForm}
          className="btn btn-outline border-white/20 text-white hover:bg-white hover:text-[#232323] rounded-full px-12"
        >
          Pošalji novi upit
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 bg-white/5 backdrop-blur-md p-6 sm:p-10 md:p-16 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl relative"
    >
      <div className="flex items-center gap-3 text-[#F5F4DC]/80 text-sm">
        <MessageCircle size={16} className="text-[#AE343F] shrink-0" />
        <span>
          Pošaljite upit za{" "}
          <strong className="text-white">
            štampane pozivnice i/ili zahvalnice
          </strong>{" "}
          sa QR kodom — bez obaveze.
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {/* Ime */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <User size={14} className="text-[#AE343F]" /> Vaše Ime
          </label>
          <input
            required
            type="text"
            placeholder="Ime i Prezime"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none focus:border-[#AE343F] transition-colors placeholder:text-white/50"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
          />
        </div>

        {/* Datum */}
        <div className="space-y-3 mt-1">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <Calendar size={14} className="text-[#AE343F]" /> Datum Događaja
          </label>
          <DatePicker
            value={formData.date}
            onChange={(date) => setFormData({ ...formData, date })}
            placeholder="Izaberite datum"
          />
        </div>

        {/* Telefon */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <Phone size={14} className="text-[#AE343F]" /> Broj Telefona
          </label>
          <PhoneVerificationField
            variant="dark"
            required
            disabled={isLoading}
            value={formData.phone}
            onChange={(v) => {
              setFormData((prev) => ({ ...prev, phone: v }));
              if (phoneTrustToken) setPhoneTrustToken("");
            }}
            onVerified={(token) => setPhoneTrustToken(token)}
            onUnverified={() => setPhoneTrustToken("")}
          />
        </div>

        {/* Napomena */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <MessageCircle size={14} className="text-[#AE343F]" /> Napomena
            (opciono)
          </label>
          <input
            type="text"
            placeholder="npr. okvirna količina, stil…"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none focus:border-[#AE343F] transition-colors placeholder:text-white/50"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Šta vas zanima */}
      <div className="space-y-4">
        <p className="text-white text-xs font-bold uppercase tracking-widest pl-1">
          Šta vas zanima?
        </p>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-3 text-[#F5F4DC]/90 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={formData.wantPozivnice}
              onChange={(e) =>
                setFormData({ ...formData, wantPozivnice: e.target.checked })
              }
              disabled={isLoading}
              className="w-4 h-4 accent-[#AE343F] cursor-pointer"
            />
            Štampane pozivnice sa QR
          </label>
          <label className="flex items-center gap-3 text-[#F5F4DC]/90 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={formData.wantZahvalnice}
              onChange={(e) =>
                setFormData({ ...formData, wantZahvalnice: e.target.checked })
              }
              disabled={isLoading}
              className="w-4 h-4 accent-[#AE343F] cursor-pointer"
            />
            Zahvalnice sa QR (galerija)
          </label>
        </div>
      </div>

      {/* Saglasnost */}
      <div className="flex items-start gap-3">
        <input
          required
          type="checkbox"
          id="acceptedTermsStampane"
          checked={formData.acceptedTerms}
          onChange={(e) =>
            setFormData({ ...formData, acceptedTerms: e.target.checked })
          }
          disabled={isLoading}
          className="mt-1 w-4 h-4 accent-[#AE343F] cursor-pointer shrink-0"
        />
        <label
          htmlFor="acceptedTermsStampane"
          className="text-[#F5F4DC]/90 text-sm cursor-pointer leading-relaxed"
        >
          Saglasan/na sam da me kontaktirate povodom ovog upita za štampane
          pozivnice / zahvalnice.
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading || !phoneTrustToken}
        className="btn bg-[#AE343F] hover:bg-[#8A2A32] btn-lg w-full min-h-[48px] h-16 sm:h-20 rounded-2xl text-[#F5F4DC] text-base sm:text-lg font-bold shadow-2xl shadow-[#AE343F]/40 group relative overflow-hidden border-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="relative z-10 flex items-center gap-3">
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Slanje...
            </>
          ) : (
            <>
              Pošalji upit
              <Send
                size={20}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </>
          )}
        </span>
        {!isLoading && (
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        )}
      </button>
      <RecaptchaDisclosure className="text-[10px] text-[#F5F4DC]/70 text-center" />
    </form>
  );
};

export default StampaneLeadForm;
