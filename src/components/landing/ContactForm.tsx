"use client";

import React, { useState } from "react";
import {
  Calendar,
  User,
  MapPin,
  Package,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Phone,
  MessageCircle,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import { analytics } from "@/utils/analytics";

// Web3Forms access key - get yours free at https://web3forms.com
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

const ContactForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    location: "",
    package: "Full Service",
    acceptedTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formattedDate = formData.date
        ? new Date(formData.date).toLocaleDateString("sr-RS", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "";

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `Nova rezervacija - ${formData.name} - ${formattedDate}`,
          from_name: "HALO Uspomene",
          name: formData.name,
          email: formData.email,
          datum_dogadjaja: formattedDate,
          lokacija: formData.location,
          paket:
            formData.package === "Full Service" ? "Full Service" : "Essential",
          opsti_uslovi: formData.acceptedTerms
            ? "Prihvaćeni"
            : "Nisu prihvaćeni",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Došlo je do greške");
      }

      setIsSubmitted(true);
      analytics.formSubmit("contact");
      analytics.packageClick(
        formData.package === "Full Service" ? "Full Service" : "Essential",
      );
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
      email: "",
      date: "",
      location: "",
      package: "Full Service",
      acceptedTerms: false,
    });
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
          Vaš upit za {new Date(formData.date).toLocaleDateString("sr-RS")} je
          uspešno primljen. <br />
          Odgovorićemo Vam u najkraćem roku sa potvrdom dostupnosti.
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
    <div>
      <form
        onSubmit={handleSubmit}
        className="space-y-10 bg-white/5 backdrop-blur-md p-6 sm:p-10 md:p-16 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl relative"
      >
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {/* Name Input */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-[#F5F4DC]/40 text-xs font-bold uppercase tracking-widest pl-1">
              <User size={14} className="text-[#AE343F]" /> Vaše Ime
            </label>
            <input
              required
              type="text"
              placeholder="Ime i Prezime"
              className="w-full bg-transparent border-b border-white/10 py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none focus:border-[#AE343F] transition-colors placeholder:text-white/20"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          {/* Date Input - Custom DatePicker */}
          <div className="space-y-3 mt-1">
            <label className="flex items-center gap-3 text-[#F5F4DC]/40 text-xs font-bold uppercase tracking-widest pl-1">
              <Calendar size={14} className="text-[#AE343F]" /> Datum Događaja
            </label>
            <DatePicker
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              placeholder="Izaberite datum"
            />
          </div>

          {/* Email Input */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-[#F5F4DC]/40 text-xs font-bold uppercase tracking-widest pl-1">
              <Send size={14} className="text-[#AE343F]" /> Email Adresa
            </label>
            <input
              required
              type="email"
              placeholder="primer@email.rs"
              className="w-full bg-transparent border-b border-white/10 py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none focus:border-[#AE343F] transition-colors placeholder:text-white/20"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          {/* Location Input */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-[#F5F4DC]/40 text-xs font-bold uppercase tracking-widest pl-1">
              <MapPin size={14} className="text-[#AE343F]" /> Lokacija /
              Restoran
            </label>
            <input
              required
              type="text"
              placeholder="npr. Beograd, Sala XY"
              className="w-full bg-transparent border-b border-white/10 py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none focus:border-[#AE343F] transition-colors placeholder:text-white/20"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          {/* Package Select */}
          <div className="md:col-span-2 space-y-3">
            <label className="flex items-center gap-3 text-[#F5F4DC]/40 text-xs font-bold uppercase tracking-widest pl-1">
              <Package size={14} className="text-[#AE343F]" /> Izaberite Paket
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["Essential", "Full Service"].map((pkg) => (
                <button
                  key={pkg}
                  type="button"
                  onClick={() => setFormData({ ...formData, package: pkg })}
                  disabled={isLoading}
                  className={`py-4 rounded-2xl border transition-all text-sm font-bold uppercase tracking-widest ${
                    formData.package === pkg
                      ? "bg-[#AE343F] border-[#AE343F] text-[#F5F4DC] shadow-lg shadow-[#AE343F]/20"
                      : "bg-white/5 border-white/10 text-[#F5F4DC]/40 hover:border-white/20"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {pkg} Paket
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Terms & Conditions Checkbox */}
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
            className="text-[#F5F4DC]/60 text-sm cursor-pointer leading-relaxed"
          >
            Pročitao/la sam i prihvatam{" "}
            <a
              href="/OP%C5%A0TI%20USLOVI%20NAJMA%20I%20KORI%C5%A0%C4%86ENJA%20AUDIO%20GUEST%20BOOK%20URE%C4%90AJA.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#AE343F] hover:text-[#c9454f] underline underline-offset-2 transition-colors"
            >
              opšte uslove najma i korišćenja uređaja
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
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
                Pošalji upit za termin
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
      </form>
    </div>
  );
};

export default ContactForm;
