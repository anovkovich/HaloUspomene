"use client";

import React, { useState } from "react";
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
          subject: `CUSTOM POZIVNICA - ${formData.name} & ${formData.partnerName}`,
          from_name: "HALO Uspomene - POZIVNICE",
          ime_mladenaca: `${formData.name}`,
          email: formData.email,
          telefon: formData.phone || "Nije naveden",
          datum_vencanja: formattedDate,
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
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf9f6] to-[#f5f0eb]">
      {/* Header */}
      <div className="text-center pt-20 pb-8 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1a1a1a] mb-4">
            Magija počinje ovde
          </h1>
          <p className="text-stone-500 text-lg leading-relaxed">
            Želite jedinstvenu digitalnu pozivnicu za Vaše venčanje? Ispunite
            formu ispod i mi ćemo Vam kreirat personalizovanu web stranicu koju
            možete podeliti sa gostima.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          {isSubmitted ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl text-center border border-stone-100">
              <div className="w-20 h-20 bg-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle2 size={40} className="text-white" />
              </div>
              <h3 className="text-3xl font-serif text-[#1a1a1a] mb-4">
                Hvala Vam, {formData.name.split(" ")[0]}!
              </h3>
              <p className="text-stone-500 text-lg mb-2">
                Vaš zahtev za pozivnicu je uspešno primljen.
              </p>
              <p className="text-stone-400 mb-8">
                Javićemo Vam se uskoro sa predlogom dizajna i svim detaljima.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="px-8 py-3 bg-[#1a1a1a] text-white text-sm uppercase tracking-widest hover:bg-[#333] transition-colors rounded-full"
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
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 rounded-full mb-4">
                  <Sparkles size={16} className="text-[#d4af37]" />
                  <span className="text-sm font-medium text-[#d4af37]">
                    NAJPOVOLJNIJA IZRADA
                  </span>
                  <Sparkles size={16} className="text-[#d4af37]" />
                </div>
                <h2 className="text-2xl font-serif text-[#1a1a1a]">
                  Zatražite Vašu Pozivnicu
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
                      <User size={14} className="text-[#d4af37]" />
                      Vaše ime
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ime i prezime"
                      className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all placeholder:text-stone-300"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-stone-400 mb-2">
                      <Mail size={14} className="text-[#d4af37]" />
                      Email adresa
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="vas@email.com"
                      className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all placeholder:text-stone-300"
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
                      <Phone size={14} className="text-[#d4af37]" />
                      Telefon (opciono)
                    </label>
                    <input
                      type="tel"
                      placeholder="+381 60 123 4567"
                      className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all placeholder:text-stone-300"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  {/* Wedding date */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-stone-400 mb-2">
                      <Calendar size={14} className="text-[#d4af37]" />
                      Datum venčanja (opciono)
                    </label>
                    <DatePicker
                      value={formData.weddingDate}
                      onChange={(date) =>
                        setFormData({ ...formData, weddingDate: date })
                      }
                      placeholder="Izaberite datum"
                      variant="light"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-stone-400 mb-2">
                    <MessageSquare size={14} className="text-[#d4af37]" />
                    Dodatne želje ili napomene (opciono)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Ukoliko imate neke posebne želje ili napomene, napišite ih ovde..."
                    className="w-full bg-[#faf9f6] border border-stone-200 rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all placeholder:text-stone-300 resize-none"
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
                  className="w-full py-4 bg-[#1a1a1a] text-white text-sm uppercase tracking-widest font-medium hover:bg-[#333] transition-all rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
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
                Odgovorićemo Vam u roku od 24 sata sa predlogom i cenom.
              </p>
            </form>
          )}
        </div>
      </div>

      <Link href="/" className="mt-8 flex items-center justify-center">
        <img
          // src="/images/logo.png"
          src="/images/full-logo.png"
          alt="Halo Uspomene LOGO"
          className="h-26 mb-1"
        />
      </Link>
    </div>
  );
}
