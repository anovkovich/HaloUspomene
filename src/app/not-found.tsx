"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";

const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

export default function NotFound() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    partnerName: "",
    email: "",
    phone: "",
    weddingDate: "",
    message: "",
    service: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formattedDate = formData.weddingDate
        ? new Date(formData.weddingDate).toLocaleDateString("sr-RS", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Nije navedeno";

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `UPIT - ${formData.name} (${formData.service || "nije navedeno"})`,
          from_name: "HALO Uspomene - Upit",
          ime: `${formData.name}`,
          email: formData.email,
          telefon: `+381${formData.phone}`,
          servis: formData.service || "Nije navedeno",
          poruka: formData.message || "Bez dodatne poruke",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Došlo je do greške");
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
      partnerName: "",
      email: "",
      phone: "",
      weddingDate: "",
      message: "",
      service: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]">
      {/* Header */}
      <div className="text-center pt-20 pb-8 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#AE343F] mb-4">
            Stranica nije pronađena
          </h1>
          <p className="text-[#8B2833] text-lg leading-relaxed">
            Stranica na kojoj ste tražili ne postoji. Ako Vas zanima jedan od
            naših servisa — Audio Knjiga Uspomena ili Website Pozivnica —
            ispunite formu i javićemo Vam se.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          {isSubmitted ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl text-center border border-stone-100">
              <div className="w-20 h-20 bg-[#AE343F] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle2 size={40} className="text-white" />
              </div>
              <h3 className="text-3xl font-serif text-[#AE343F] mb-4">
                Hvala Vam, {formData.name.split(" ")[0]}!
              </h3>
              <p className="text-stone-500 text-lg mb-2">
                Vaš upit je uspešno primljen.
              </p>
              <p className="text-stone-400 mb-8">Javićemo Vam se uskoro.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="px-8 py-3 bg-[#AE343F] text-white text-sm uppercase tracking-widest hover:bg-[#8B2833] transition-colors rounded-full"
                >
                  Nazad na početnu
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-stone-100"
            >
              {/* Decorative header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#AE343F]/10 rounded-full mb-4">
                  <Sparkles size={16} className="text-[#AE343F]" />
                  <span className="text-sm font-medium text-[#AE343F]">
                    KONTAKTIRAJTE NAS
                  </span>
                  <Sparkles size={16} className="text-[#AE343F]" />
                </div>
                <h2 className="text-2xl font-serif text-[#AE343F]">
                  Pošaljite upit
                </h2>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-100 rounded-xl text-red-600">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-6">
                {/* Names row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-stone-400 mb-2">
                      <User size={14} className="text-[#AE343F]" />
                      Vaše ime
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ime i prezime"
                      className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#AE343F] focus:ring-2 focus:ring-[#AE343F]/20 transition-all placeholder:text-stone-300"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-stone-400 mb-2">
                      <Mail size={14} className="text-[#AE343F]" />
                      Email adresa
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="vas@email.com"
                      className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#AE343F] focus:ring-2 focus:ring-[#AE343F]/20 transition-all placeholder:text-stone-300"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Contact row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-stone-400 mb-2">
                      <Phone size={14} className="text-[#AE343F]" />
                      Broj telefona
                    </label>
                    <div className="flex items-center bg-[#faf9f6] border border-stone-200 rounded-xl focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-[#d4af37]/20 transition-all">
                      <span className="py-3 pl-4 pr-2 text-stone-400 text-base select-none">
                        +381
                      </span>
                      <input
                        required
                        type="tel"
                        placeholder="6X XXX XXXX"
                        className="flex-1 bg-transparent py-3 pr-4 text-[#1a1a1a] focus:outline-none placeholder:text-stone-300"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value.replace(/^\+?381/, ""),
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Wedding date */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-stone-400 mb-2">
                      <Calendar size={14} className="text-[#AE343F]" />
                      Datum venčanja (opciono)
                    </label>
                    <DatePicker
                      value={formData.weddingDate}
                      onChange={(date) =>
                        setFormData({ ...formData, weddingDate: date })
                      }
                      placeholder="Izaberite datum"
                      variant="light"
                      showQuickActions={false}
                    />
                  </div>
                </div>

                {/* Service selector */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-stone-400 mb-2">
                    <span>Zanima me</span>
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) =>
                      setFormData({ ...formData, service: e.target.value })
                    }
                    disabled={isLoading}
                    className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#AE343F] focus:ring-2 focus:ring-[#AE343F]/20 transition-all"
                  >
                    <option value="" hidden>
                      Odaberite servis
                    </option>
                    <option value="Audio Knjiga Uspomena">
                      Audio Knjiga Uspomena
                    </option>
                    <option value="Website Pozivnica">
                      Website Pozivnica
                    </option>
                    <option value="Oboje / Nisam siguran">
                      Oboje / Nisam siguran
                    </option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-stone-400 mb-2">
                    <MessageSquare size={14} className="text-[#AE343F]" />
                    Dodatne želje ili napomene (opciono)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Ukoliko imate neke posebne želje ili napomene, napišite ih ovde..."
                    className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#AE343F] focus:ring-2 focus:ring-[#AE343F]/20 transition-all placeholder:text-stone-300 resize-none"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#AE343F] text-white text-sm uppercase tracking-widest font-medium hover:bg-[#8B2833] transition-all rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Slanje...
                    </>
                  ) : (
                    <>
                      <Send
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                      Pošalji zahtev
                    </>
                  )}
                </button>
              </div>

              {/* Footer note */}
              <p className="text-center text-stone-400 text-sm mt-6">
                Odgovorićemo Vam u roku od 24 sata.
              </p>
            </form>
          )}
        </div>
      </div>

      <Link href="/" className="mt-8 flex items-center justify-center">
        <Image
          src="/images/full-logo.png"
          alt="Halo Uspomene LOGO"
          width={3519}
          height={1798}
          className="h-26 mb-1 w-auto"
        />
      </Link>
    </div>
  );
}
