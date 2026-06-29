"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Car,
  Clock,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import { PhoneVerificationField } from "@/components/verification/PhoneVerificationField";
import {
  useRecaptcha,
  RecaptchaDisclosure,
} from "@/components/forms/RecaptchaProvider";

const VEHICLE_OPTIONS = [
  "Mercedes E Class",
  "Mercedes S Class (VIP limuzina)",
  "Mercedes GLE SUV",
  "Mercedes G Class",
  "Više vozila / svadbena kolona",
  "Nisam siguran — treba mi savet",
];

const SERVICE_OPTIONS = [
  "Po satu (min. 2h)",
  "Ceo dan (8h)",
  "Samo ceremonija i fotografisanje",
  "Transfer (dolazak / odlazak)",
];

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between bg-transparent border-b border-white/10 py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none hover:border-[#AE343F]/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={value ? "text-[#F5F4DC]" : "text-white/50"}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={20}
          className={`text-[#AE343F] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#232323] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 transition-all border-b border-white/5 last:border-b-0 ${
                value === option
                  ? "bg-[#AE343F]/20 text-[#AE343F] font-medium"
                  : "text-[#F5F4DC]/80 hover:bg-white/5 hover:text-[#F5F4DC]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CarRentalLeadForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { execute: executeRecaptcha } = useRecaptcha();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    location: "",
    vehicle: "",
    service: "",
    acceptedTerms: false,
  });
  const [phoneTrustToken, setPhoneTrustToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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

      const formattedDate = new Date(formData.date).toLocaleDateString(
        "sr-Latn-RS",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );

      // Web3Forms is called from the client because Cloudflare blocks
      // server-side requests to api.web3forms.com from Vercel.
      const w3 = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Najam vozila za venčanje - ${formData.name} - ${formattedDate}`,
          from_name: "HALO Uspomene",
          name: formData.name,
          telefon: `+381${formData.phone}`,
          datum_dogadjaja: formattedDate,
          lokacija: formData.location,
          vozilo: formData.vehicle || "Nije navedeno",
          tip_najma: formData.service || "Nije navedeno",
          paket: "Iznajmljivanje automobila za venčanje",
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
      location: "",
      vehicle: "",
      service: "",
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
          Vaš upit za{" "}
          {new Date(formData.date).toLocaleDateString("sr-Latn-RS")} je uspešno
          primljen. <br />
          Javljamo se u najkraćem roku sa potvrdom dostupnosti i ponudom.
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
          <strong className="text-white">najam luksuznog vozila</strong> na
          Vašem venčanju — bez obaveze.
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
            className="w-full bg-transparent border-b border-white/10 py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none focus:border-[#AE343F] transition-colors placeholder:text-white/50"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
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
            required
            type="text"
            placeholder="npr. Beograd, hotel / sala"
            className="w-full bg-transparent border-b border-white/10 py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none focus:border-[#AE343F] transition-colors placeholder:text-white/50"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            disabled={isLoading}
          />
        </div>

        {/* Vozilo */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <Car size={14} className="text-[#AE343F]" /> Vozilo
          </label>
          <Dropdown
            value={formData.vehicle}
            onChange={(value) => setFormData({ ...formData, vehicle: value })}
            options={VEHICLE_OPTIONS}
            placeholder="Izaberite vozilo"
            disabled={isLoading}
          />
        </div>

        {/* Tip najma */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <Clock size={14} className="text-[#AE343F]" /> Tip najma
          </label>
          <Dropdown
            value={formData.service}
            onChange={(value) => setFormData({ ...formData, service: value })}
            options={SERVICE_OPTIONS}
            placeholder="Izaberite tip najma"
            disabled={isLoading}
          />
        </div>
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
          Saglasan/na sam da me kontaktirate povodom ovog upita za najam vozila.
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
              Pošalji upit za vozilo
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

export default CarRentalLeadForm;
