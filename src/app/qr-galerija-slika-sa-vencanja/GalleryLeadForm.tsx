"use client";

import React, { useState } from "react";
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import DatePicker from "@/components/ui/DatePicker";
import { PhoneVerificationField } from "@/components/verification/PhoneVerificationField";
import {
  useRecaptcha,
  RecaptchaDisclosure,
} from "@/components/forms/RecaptchaProvider";
import { createGalleryCouple } from "./actions";

const GalleryLeadForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Self-serve gallery: created slug + one-time password → pay to activate.
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const { execute: executeRecaptcha } = useRecaptcha();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    location: "",
    withInvitation: false,
    acceptedTerms: false,
  });
  const [phoneTrustToken, setPhoneTrustToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phoneTrustToken) {
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

      // Buyer wants the full package (invitation + gallery) → keep the lead
      // flow; the Kompletan paket already bundles the gallery, so we don't sell
      // a standalone gallery here.
      if (formData.withInvitation) {
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

        const w3 = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `QR galerija + pozivnica - ${formData.name} - ${formattedDate}`,
            from_name: "HALO Uspomene",
            name: formData.name,
            telefon: `+381${formData.phone}`,
            datum_dogadjaja: formattedDate,
            lokacija: formData.location || "Nije navedeno",
            i_pozivnica: "Da",
            paket: "QR galerija + zainteresovan za pozivnicu",
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
        return;
      }

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
      const created = await createGalleryCouple({
        name: formData.name,
        phone: `+381${formData.phone}`,
        eventDate: formData.date || undefined,
        recaptchaToken,
        phoneTrustToken,
      });
      if (!created.ok) {
        throw new Error(created.error || "Slanje nije uspelo. Pokušajte ponovo.");
      }

      setCreatedSlug(created.slug);
      setCreatedPassword(created.password);

      // Admin awareness email (best-effort — the record already exists).
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `QR galerija (self-serve) - ${formData.name} - ${formattedDate}`,
          from_name: "HALO Uspomene",
          name: formData.name,
          telefon: `+381${formData.phone}`,
          datum_dogadjaja: formattedDate,
          lokacija: formData.location || "Nije navedeno",
          slug: created.slug,
          paket: "QR galerija (self-serve — čeka uplatu)",
        }),
      }).catch(() => {});

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
    setCreatedSlug(null);
    setCreatedPassword(null);
    setError(null);
    setFormData({
      name: "",
      phone: "",
      date: "",
      location: "",
      withInvitation: false,
      acceptedTerms: false,
    });
    setPhoneTrustToken("");
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

    // Lead flow (wanted the full package too).
    return (
      <div className="bg-white/5 backdrop-blur-md p-8 sm:p-12 md:p-16 rounded-[2rem] md:rounded-[3rem] border border-white/10 text-center">
        <div className="w-24 h-24 bg-[#AE343F] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#AE343F]/40">
          <CheckCircle2 size={48} className="text-[#F5F4DC]" />
        </div>
        <h3 className="text-4xl font-serif text-[#F5F4DC] mb-4">
          Hvala Vam, {formData.name.split(" ")[0]}!
        </h3>
        <p className="text-[#F5F4DC]/60 text-lg mb-8">
          Vaš upit je uspešno primljen. <br />
          Javljamo se u najkraćem roku sa svim informacijama i aktivacijom.
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
          <strong className="text-white">QR galeriju fotografija</strong> — bez
          obaveze.
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
            <Calendar size={14} className="text-[#AE343F]" /> Datum Venčanja
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

      {/* Checkboxes */}
      <div className="space-y-4">
        {/* Uz pozivnicu? */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="withInvitation"
            checked={formData.withInvitation}
            onChange={(e) =>
              setFormData({ ...formData, withInvitation: e.target.checked })
            }
            disabled={isLoading}
            className="mt-1 w-4 h-4 accent-[#AE343F] cursor-pointer shrink-0"
          />
          <label
            htmlFor="withInvitation"
            className="text-[#F5F4DC]/90 text-sm cursor-pointer leading-relaxed"
          >
            Zainteresovan/a sam i za digitalnu pozivnicu / raspored sedenja uz
            galeriju.
          </label>
        </div>

        {/* Saglasnost */}
        <div className="flex items-start gap-3">
          <input
            required
            type="checkbox"
            id="acceptedTerms"
            checked={formData.acceptedTerms}
            onChange={(e) =>
              setFormData({ ...formData, acceptedTerms: e.target.checked })
            }
            disabled={isLoading}
            className="mt-1 w-4 h-4 accent-[#AE343F] cursor-pointer shrink-0"
          />
          <label
            htmlFor="acceptedTerms"
            className="text-[#F5F4DC]/90 text-sm cursor-pointer leading-relaxed"
          >
            Saglasan/na sam da me kontaktirate povodom ovog upita za QR galeriju.
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.name || !formData.phone || !formData.acceptedTerms}
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
              Pošalji upit za galeriju
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

export default GalleryLeadForm;
