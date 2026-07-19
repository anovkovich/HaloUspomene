"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Package,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MessageCircle,
  ChevronDown,
  Tent,
  Wine,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import DatePicker from "@/components/ui/DatePicker";
import { PhoneVerificationField } from "@/components/verification/PhoneVerificationField";
import {
  useRecaptcha,
  RecaptchaDisclosure,
} from "@/components/forms/RecaptchaProvider";

/* ═══════════════════════════════════════════════════════════════════════════
   EQUIPMENT OPTIONS
═══════════════════════════════════════════════════════════════════════════ */

const PACKAGE_OPTIONS = [
  "Starter (1 paviljon + 3 stola) — 55€/dan",
  "Komplet (2 paviljona + 6 stolova) — 105€/dan",
  "Vikend Komplet (2 paviljona + 6 stolova) — 205€/vikend",
  "Drugačija kombinacija",
];

const OCCASION_OPTIONS = [
  "Doček svatova",
  "Polazak od kuće",
  "Ceremonija na otvorenom",
  "Koktel prijem",
  "Proslava u dvorištu",
  "Drugo",
];

const DURATION_OPTIONS = [
  "Jedan dan",
  "Vikend (petak–nedelja)",
  "Više dana (navedite u poruci)",
];

/* ═══════════════════════════════════════════════════════════════════════════
   DROPDOWN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  icon,
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
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none hover:border-[#AE343F]/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-3">
          {icon && <span className="text-[#AE343F]/60">{icon}</span>}
          <span className={value ? "text-[#F5F4DC]" : "text-white/50"}>
            {value || placeholder}
          </span>
        </span>
        <ChevronDown
          size={20}
          className={`text-[#AE343F] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#232323] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden max-h-64 overflow-y-auto">
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

/* ═══════════════════════════════════════════════════════════════════════════
   QUANTITY SELECTOR
═══════════════════════════════════════════════════════════════════════════ */

interface QuantitySelectorProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  disabled?: boolean;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  label,
  icon,
  value,
  onChange,
  max = 10,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <span className="text-[#AE343F]">{icon}</span>
        <span className="text-[#F5F4DC]/80 text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={disabled || value === 0}
          className="w-8 h-8 rounded-full bg-white/5 text-[#F5F4DC] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold"
        >
          −
        </button>
        <span className="w-8 text-center font-serif text-xl text-[#F5F4DC]">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={disabled || value === max}
          className="w-8 h-8 rounded-full bg-white/5 text-[#F5F4DC] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN FORM COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

const EquipmentRentalLeadForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"package" | "custom">("package");
  const { execute: executeRecaptcha } = useRecaptcha();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    location: "",
    package: "",
    occasion: "",
    duration: "",
    message: "",
    acceptedTerms: false,
    // Custom quantities
    paviljoni: 0,
    barskiStolovi: 0,
    ventilatori: 0,
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
        "Forma trenutno nije dostupna. Pišite na halouspomene@gmail.com."
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
        }
      );

      // Build equipment string
      let equipmentStr = "";
      if (formMode === "package") {
        equipmentStr = formData.package || "Nije navedeno";
      } else {
        const items = [];
        if (formData.paviljoni > 0)
          items.push(`${formData.paviljoni}× paviljon`);
        if (formData.barskiStolovi > 0)
          items.push(`${formData.barskiStolovi}× barski sto`);
        if (formData.ventilatori > 0)
          items.push(`${formData.ventilatori}× ventilator`);
        equipmentStr = items.length > 0 ? items.join(", ") : "Nije navedeno";
      }

      const w3 = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Najam opreme za venčanje - ${formData.name} - ${formattedDate}`,
          from_name: "HALO Uspomene",
          name: formData.name,
          telefon: `+381${formData.phone}`,
          datum_dogadjaja: formattedDate,
          lokacija: formData.location,
          oprema: equipmentStr,
          prilika: formData.occasion || "Nije navedeno",
          trajanje: formData.duration || "Nije navedeno",
          poruka: formData.message || "Bez dodatne poruke",
          paket: "Iznajmljivanje opreme za venčanje (paviljoni, stolovi, ventilatori)",
        }),
      });

      const w3Data = (await w3.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
      };

      if (!w3.ok || !w3Data.success) {
        throw new Error(
          w3Data.message || "Slanje nije uspelo. Pokušajte ponovo."
        );
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Došlo je do greške pri slanju. Pokušajte ponovo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setError(null);
    setFormMode("package");
    setFormData({
      name: "",
      phone: "",
      date: "",
      location: "",
      package: "",
      occasion: "",
      duration: "",
      message: "",
      acceptedTerms: false,
      paviljoni: 0,
      barskiStolovi: 0,
      ventilatori: 0,
    });
    setPhoneTrustToken("");
  };

  /* ═══════════════════════════════════════════════════════════════════════
     SUCCESS STATE
  ═══════════════════════════════════════════════════════════════════════ */

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
          primljen.
          <br />
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

  /* ═══════════════════════════════════════════════════════════════════════
     FORM
  ═══════════════════════════════════════════════════════════════════════ */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white/5 backdrop-blur-md p-6 sm:p-10 md:p-14 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl relative"
    >
      {/* Header */}
      <div className="flex items-center gap-3 text-[#F5F4DC]/80 text-sm">
        <MessageCircle size={16} className="text-[#AE343F] shrink-0" />
        <span>
          Pošaljite upit za{" "}
          <strong className="text-white">najam opreme</strong> za vaše venčanje
          — bez obaveze.
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {/* Name */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <User size={14} className="text-[#AE343F]" /> Vaše ime
          </label>
          <input
            required
            type="text"
            placeholder="Ime i prezime"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none focus:border-[#AE343F] transition-colors placeholder:text-white/50"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            disabled={isLoading}
          />
        </div>

        {/* Date */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <Calendar size={14} className="text-[#AE343F]" /> Datum događaja
          </label>
          <DatePicker
            value={formData.date}
            onChange={(date) => setFormData({ ...formData, date })}
            placeholder="Izaberite datum"
          />
        </div>

        {/* Phone */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <Phone size={14} className="text-[#AE343F]" /> Broj telefona
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

        {/* Location */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <MapPin size={14} className="text-[#AE343F]" /> Grad / lokacija
          </label>
          <input
            required
            type="text"
            placeholder="npr. Novi Sad, Veternik"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none focus:border-[#AE343F] transition-colors placeholder:text-white/50"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Equipment selection mode toggle */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
          <Package size={14} className="text-[#AE343F]" /> Izbor opreme
        </label>
        <div className="flex gap-2 p-1 bg-white/5 rounded-full w-fit">
          <button
            type="button"
            onClick={() => setFormMode("package")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              formMode === "package"
                ? "bg-[#AE343F] text-white shadow-lg"
                : "text-white/60 hover:text-white"
            }`}
          >
            Izaberi paket
          </button>
          <button
            type="button"
            onClick={() => setFormMode("custom")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              formMode === "custom"
                ? "bg-[#AE343F] text-white shadow-lg"
                : "text-white/60 hover:text-white"
            }`}
          >
            Prilagodi količine
          </button>
        </div>

        {/* Package selection OR Custom quantities */}
        {formMode === "package" ? (
          <Dropdown
            value={formData.package}
            onChange={(value) => {
              if (value === "Drugačija kombinacija") {
                setFormMode("custom");
                setFormData({ ...formData, package: "" });
              } else {
                setFormData({ ...formData, package: value });
              }
            }}
            options={PACKAGE_OPTIONS}
            placeholder="Izaberite paket"
            disabled={isLoading}
          />
        ) : (
          <div className="bg-white/5 rounded-2xl overflow-hidden">
            <QuantitySelector
              label="Paviljon 3×3m (30€/dan)"
              icon={<Tent size={18} />}
              value={formData.paviljoni}
              onChange={(v) => setFormData({ ...formData, paviljoni: v })}
              disabled={isLoading}
              max={4}
            />
            <QuantitySelector
              label="Barski sto 80cm (10€/dan)"
              icon={<Wine size={18} />}
              value={formData.barskiStolovi}
              onChange={(v) => setFormData({ ...formData, barskiStolovi: v })}
              disabled={isLoading}
              max={12}
            />
            <QuantitySelector
              label="Ventilator (uskoro)"
              icon={<Wind size={18} />}
              value={formData.ventilatori}
              onChange={(v) => setFormData({ ...formData, ventilatori: v })}
              disabled={true}
              max={0}
            />
          </div>
        )}
      </div>

      {/* Occasion & Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        <div className="space-y-3">
          <label className="text-white text-xs font-bold uppercase tracking-widest pl-1">
            Prilika (opciono)
          </label>
          <Dropdown
            value={formData.occasion}
            onChange={(value) => setFormData({ ...formData, occasion: value })}
            options={OCCASION_OPTIONS}
            placeholder="Izaberite priliku"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-3">
          <label className="text-white text-xs font-bold uppercase tracking-widest pl-1">
            Trajanje najma
          </label>
          <Dropdown
            value={formData.duration}
            onChange={(value) => setFormData({ ...formData, duration: value })}
            options={DURATION_OPTIONS}
            placeholder="Izaberite trajanje"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Additional message */}
      <div className="space-y-3">
        <label className="text-white text-xs font-bold uppercase tracking-widest pl-1">
          Dodatna poruka (opciono)
        </label>
        <textarea
          placeholder="Napišite ako imate posebne zahteve ili pitanja..."
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#F5F4DC] text-base focus:outline-none focus:border-[#AE343F] transition-colors placeholder:text-white/50 resize-none"
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          disabled={isLoading}
        />
      </div>

      {/* Terms checkbox */}
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
          Saglasan/na sam da me kontaktirate povodom ovog upita za najam opreme.
        </label>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading || !formData.name || !formData.date || !formData.phone || !formData.location || !formData.acceptedTerms}
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
              Pošalji upit za opremu
              <Send
                size={20}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </>
          )}
        </span>
        {!isLoading && (
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        )}
      </button>

      <RecaptchaDisclosure className="text-[10px] text-[#F5F4DC]/70 text-center" />
    </form>
  );
};

export default EquipmentRentalLeadForm;
