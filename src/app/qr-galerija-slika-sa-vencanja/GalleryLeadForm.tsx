"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import DatePicker from "@/components/ui/DatePicker";
import { PhoneAuthField } from "@/components/verification/PhoneAuthField";
import type { BypassInfo } from "@/lib/bypass-token";
import {
  useRecaptcha,
  RecaptchaDisclosure,
} from "@/components/forms/RecaptchaProvider";
import { createGalleryCouple } from "./actions";

const GalleryLeadForm: React.FC<{ bypassInfo?: BypassInfo }> = ({
  bypassInfo,
}) => {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"buy" | "inquiry">("buy");
  // Self-serve gallery: created slug + one-time password → pay to activate.
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const { execute: executeRecaptcha } = useRecaptcha();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    location: "",
  });
  const [phoneTrustToken, setPhoneTrustToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!bypassInfo && !phoneTrustToken) {
      toast.error('Verifikujte broj telefona klikom na dugme "Kod" kako biste dobili SMS kod.');
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
      const formattedDate = formData.date
        ? new Date(formData.date).toLocaleDateString("sr-Latn-RS", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Nije navedeno";

      // Standalone gallery → self-serve create → pay to activate.
      let recaptchaToken: string;
      try {
        recaptchaToken = await executeRecaptcha("create_gallery");
      } catch {
        setError("Provera neuspešna. Osvežite stranicu i pokušajte ponovo.");
        setIsLoading(false);
        return;
      }

      // Reuses the same QuickRegister mechanism as the planner (proper couple
      // + portal auto-login); gallery stays locked until payment.
      const phonePrefix = bypassInfo?.callingCode || "+381";
      const created = await createGalleryCouple({
        name: formData.name,
        phone: `${phonePrefix}${formData.phone}`,
        eventDate: formData.date || undefined,
        recaptchaToken,
        phoneTrustToken,
        bypassToken: bypassInfo?.token,
      });
      if (!created.ok) {
        throw new Error(created.error || "Slanje nije uspelo. Pokušajte ponovo.");
      }

      setCreatedSlug(created.slug);
      setCreatedPassword(created.password);

      // Admin awareness email (best-effort — the record already exists).
      const emailSubject =
        mode === "buy"
          ? `QR galerija - PLAĆANJE U TOKU: ${formData.name}`
          : `QR galerija - upit: ${formData.name}`;
      const emailNote =
        mode === "buy"
          ? "Korisnik je krenuo na stranicu za plaćanje. Aktivira se automatski po uplati."
          : "Korisnik je poslao upit za podršku.";

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: emailSubject,
          from_name: "HALO Uspomene",
          name: formData.name,
          telefon: `${bypassInfo?.callingCode || "+381"}${formData.phone}`,
          datum_dogadjaja: formattedDate,
          lokacija: formData.location || "Nije navedeno",
          slug: created.slug,
          napomena: emailNote,
        }),
      }).catch(() => {});

      // If buy mode, redirect directly to payment
      if (mode === "buy") {
        router.push(`/placanje/galerija/${created.slug}`);
        return;
      }

      setCreatedSlug(created.slug);
      setCreatedPassword(created.password);
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

  if (isSubmitted) {
    // Self-serve gallery → pay to activate + reveal access password.
    if (createdSlug) {
      return (
        <div className="bg-white/5 backdrop-blur-md p-8 sm:p-12 md:p-16 rounded-[2rem] md:rounded-[3rem] border border-white/10 text-center">
          <div className="w-24 h-24 bg-[#AE343F] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#AE343F]/40">
            <CheckCircle2 size={48} className="text-[#F5F4DC]" />
          </div>
          <h3 className="text-4xl font-serif text-[#F5F4DC] mb-4">
            Vaša galerija je spremna!
          </h3>
          <p className="text-[#F5F4DC]/60 text-lg mb-8">
            Aktivirajte je uplatom — čim je obradimo, QR galerija je vaša.
          </p>
          <a
            href={`/placanje/galerija/${createdSlug}`}
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-[#AE343F] hover:bg-[#8A2A32] text-white font-bold text-lg transition-colors"
          >
            Plati i aktiviraj galeriju →
          </a>
          {createdPassword && (
            <div className="mt-8 mx-auto max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5F4DC]/40 mb-1">
                Lozinka za pristup
              </p>
              <p className="font-mono text-lg font-bold text-[#F5F4DC] mb-2">
                {createdPassword}
              </p>
              <p className="text-xs leading-relaxed text-[#F5F4DC]/50">
                Sačuvajte je — sa njom upravljate galerijom nakon aktivacije.
              </p>
            </div>
          )}
        </div>
      );
    }

    // Inquiry flow - show success with password and payment option
    return (
      <div className="bg-white/5 backdrop-blur-md p-8 sm:p-12 md:p-16 rounded-[2rem] md:rounded-[3rem] border border-white/10 text-center">
        <div className="w-24 h-24 bg-[#AE343F] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#AE343F]/40">
          <CheckCircle2 size={48} className="text-[#F5F4DC]" />
        </div>
        <h3 className="text-4xl font-serif text-[#F5F4DC] mb-4">
          Hvala Vam, {formData.name.split(" ")[0]}!
        </h3>
        <p className="text-[#F5F4DC]/60 text-lg mb-8">
          Vaš upit je primljen. Javljamo se u najkraćem roku.
        </p>
        {createdSlug && (
          <a
            href={`/placanje/galerija/${createdSlug}`}
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-[#AE343F] hover:bg-[#8A2A32] text-white font-bold text-lg transition-colors mb-6"
          >
            Ili platite odmah →
          </a>
        )}
        {createdPassword && (
          <div className="mt-4 mx-auto max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5F4DC]/40 mb-1">
              Lozinka za pristup
            </p>
            <p className="font-mono text-lg font-bold text-[#F5F4DC] mb-2">
              {createdPassword}
            </p>
            <p className="text-xs leading-relaxed text-[#F5F4DC]/50">
              Sačuvajte je — sa njom upravljate galerijom nakon aktivacije.
            </p>
          </div>
        )}
      </div>
    );
  }

  const isFormValid =
    formData.name &&
    formData.phone &&
    formData.date &&
    (bypassInfo || phoneTrustToken);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white/5 backdrop-blur-md p-6 sm:p-10 md:p-14 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl relative"
    >

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
            <User size={14} className="text-[#AE343F]" /> Vaše Ime *
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
            <Calendar size={14} className="text-[#AE343F]" /> Datum Venčanja *
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
            <Phone size={14} className="text-[#AE343F]" /> Broj Telefona *
          </label>
          <PhoneAuthField
            bypassInfo={bypassInfo}
            variant="dark"
            required
            value={formData.phone}
            onChange={(v) => setFormData((prev) => ({ ...prev, phone: v }))}
            onVerified={(token) => setPhoneTrustToken(token)}
            onUnverified={() => setPhoneTrustToken("")}
          />
        </div>

        {/* Lokacija */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <MapPin size={14} className="text-[#AE343F]" /> Grad / Lokacija
          </label>
          <input
            type="text"
            placeholder="npr. Beograd, hotel / sala"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none focus:border-[#AE343F] transition-colors placeholder:text-white/50"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            disabled={isLoading}
          />
        </div>
      </div>

      {/* CTA section */}
      <div className="pt-6 border-t border-white/10 flex flex-col items-center gap-4">
        {/* Primary - Buy now */}
        <button
          type="submit"
          disabled={isLoading}
          onClick={() => {
            if (!isFormValid) {
              toast.error("Molimo popunite sva obavezna polja pre nastavka.");
              return;
            }
            setMode("buy");
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-lg shadow-[#AE343F]/25 disabled:opacity-50"
        >
          {isLoading && mode === "buy" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Priprema...
            </>
          ) : (
            <>
              Plati odmah i kreni
              <CreditCard size={16} />
            </>
          )}
        </button>

        {/* Secondary - Inquiry link */}
        <button
          type="submit"
          disabled={isLoading}
          onClick={() => {
            if (!isFormValid) {
              toast.error("Molimo popunite sva obavezna polja pre nastavka.");
              return;
            }
            setMode("inquiry");
          }}
          className="group inline-flex items-center gap-1.5 text-xs text-[#F5F4DC]/45 hover:text-[#F5F4DC]/70 transition-colors disabled:opacity-50"
        >
          {isLoading && mode === "inquiry" ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <>
              Stupite u kontakt sa timom za podršku i sva pitanja
              <Send size={12} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        {/* reCAPTCHA disclosure at the very bottom */}
        <RecaptchaDisclosure className="text-[10px] text-[#F5F4DC]/40 mt-4" />
      </div>
    </form>
  );
};

export default GalleryLeadForm;
