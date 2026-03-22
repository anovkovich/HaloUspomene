"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";

const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

export default function NotFound() {
  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
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
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `UPIT - ${formData.name} (${formData.service || "nije navedeno"})`,
          from_name: "HALO Uspomene - Upit",
          ime: formData.name,
          email: formData.email,
          telefon: `+381${formData.phone}`,
          servis: formData.service || "Nije navedeno",
          poruka: formData.message || "Bez dodatne poruke",
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Došlo je do greške");
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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center"
      style={{ backgroundColor: "#F5F4DC", color: "#232323" }}
    >
      <div className="max-w-lg mx-auto w-full space-y-8">
        {/* Title */}
        <h1
          className="font-script text-5xl sm:text-6xl"
          style={{ color: "#AE343F" }}
        >
          Halo Uspomene
        </h1>

        {/* Heart divider */}
        <div className="flex items-center justify-center gap-4">
          <div
            className="h-px w-10"
            style={{ backgroundColor: "#d4af37", opacity: 0.5 }}
          />
          <Heart size={14} style={{ color: "#d4af37" }} fill="currentColor" />
          <div
            className="h-px w-10"
            style={{ backgroundColor: "#d4af37", opacity: 0.5 }}
          />
        </div>

        {/* Description */}
        <p
          className="font-serif text-base sm:text-lg leading-relaxed"
          style={{ color: "#555" }}
        >
          Stranica koju tražite više ne postoji. Ukoliko želite goste da
          pozovete našom website pozivnicom i lako organizujete raspored
          sedenja, da iznajmite naš retro telefon uspomena, ili pak da image
          samo njegovu digitalnu verziju — kontaktirajte nas popunjavanjem ove
          jednostavne forme
        </p>

        {/* CTA button */}
        {!isSubmitted && (
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-elegant text-sm uppercase tracking-[0.2em] transition-all hover:opacity-80"
            style={{
              backgroundColor: "#AE343F",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(174,52,63,0.25)",
            }}
          >
            {formOpen ? "Sakrij kontakt formu" : "Prikaži kontakt formu"}
          </button>
        )}

        {/* Expandable form */}
        {formOpen && !isSubmitted && (
          <form onSubmit={handleSubmit} className="text-left space-y-5 pt-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ChevronDown size={14} style={{ color: "#aaa" }} />
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: "#aaa" }}
              >
                Pošaljite upit
              </span>
              <ChevronDown size={14} style={{ color: "#aaa" }} />
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="flex items-center gap-2 text-xs uppercase tracking-widest mb-1.5"
                  style={{ color: "#999" }}
                >
                  <User size={12} style={{ color: "#AE343F" }} /> Vaše ime
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ime i prezime"
                  className="w-full bg-white border border-stone-200 rounded-xl py-3 px-4 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#AE343F] transition-all placeholder:text-stone-300"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  className="flex items-center gap-2 text-xs uppercase tracking-widest mb-1.5"
                  style={{ color: "#999" }}
                >
                  <Mail size={12} style={{ color: "#AE343F" }} /> Email
                </label>
                <input
                  required
                  type="email"
                  placeholder="vas@email.com"
                  className="w-full bg-white border border-stone-200 rounded-xl py-3 px-4 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#AE343F] transition-all placeholder:text-stone-300"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="flex items-center gap-2 text-xs uppercase tracking-widest mb-1.5"
                  style={{ color: "#999" }}
                >
                  <Phone size={12} style={{ color: "#AE343F" }} /> Telefon
                </label>
                <div className="flex items-center bg-white border border-stone-200 rounded-xl focus-within:border-[#AE343F] transition-all">
                  <span className="py-3 pl-4 pr-2 text-stone-400 text-sm select-none">
                    +381
                  </span>
                  <input
                    required
                    type="tel"
                    placeholder="6X XXX XXXX"
                    className="flex-1 bg-transparent py-3 pr-4 text-sm text-[#1a1a1a] focus:outline-none placeholder:text-stone-300"
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

              <div>
                <label
                  className="flex items-center gap-2 text-xs uppercase tracking-widest mb-1.5"
                  style={{ color: "#999" }}
                >
                  <Calendar size={12} style={{ color: "#AE343F" }} /> Datum
                  (opciono)
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

            <div>
              <label
                className="block text-xs uppercase tracking-widest mb-1.5"
                style={{ color: "#999" }}
              >
                Zanima me
              </label>
              <select
                value={formData.service}
                onChange={(e) =>
                  setFormData({ ...formData, service: e.target.value })
                }
                disabled={isLoading}
                className="w-full bg-white border border-stone-200 rounded-xl py-3 px-4 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#AE343F] transition-all"
              >
                <option value="" hidden>
                  Odaberite servis
                </option>
                <option value="Website Pozivnica">Website Pozivnica</option>
                <option value="Audio Knjiga Uspomena">
                  Audio Knjiga Uspomena
                </option>
                <option value="Generalno pitanje">Generalno pitanje</option>
              </select>
            </div>

            <div>
              <label
                className="flex items-center gap-2 text-xs uppercase tracking-widest mb-1.5"
                style={{ color: "#999" }}
              >
                <MessageSquare size={12} style={{ color: "#AE343F" }} />{" "}
                Napomena (opciono)
              </label>
              <textarea
                rows={3}
                placeholder="Posebne želje ili pitanja..."
                className="w-full bg-white border border-stone-200 rounded-xl py-3 px-4 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#AE343F] transition-all placeholder:text-stone-300 resize-none"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-full text-sm uppercase tracking-[0.15em] font-medium transition-all hover:opacity-80 flex items-center justify-center gap-3 disabled:opacity-50"
              style={{ backgroundColor: "#AE343F", color: "#fff" }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Slanje...
                </>
              ) : (
                <>
                  <Send size={16} /> Pošalji zahtev
                </>
              )}
            </button>
          </form>
        )}

        {/* Success state */}
        {isSubmitted && (
          <div className="space-y-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: "#AE343F" }}
            >
              <CheckCircle2 size={28} className="text-white" />
            </div>
            <p className="font-serif text-xl" style={{ color: "#AE343F" }}>
              Hvala, {formData.name.split(" ")[0]}!
            </p>
            <p className="text-sm" style={{ color: "#888" }}>
              Vaš upit je primljen. Javićemo Vam se uskoro.
            </p>
            <Link
              href="/"
              className="inline-block text-sm uppercase tracking-widest transition-opacity hover:opacity-60"
              style={{ color: "#AE343F" }}
            >
              Nazad na početnu
            </Link>
          </div>
        )}

        {/* Logo footer */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <Link
            href="/"
            className="inline-block opacity-60 hover:opacity-100 transition-opacity"
          >
            <Image
              src="/images/full-logo.png"
              alt="Halo Uspomene"
              width={3519}
              height={1798}
              className="h-12 w-auto mx-auto"
            />
          </Link>
          <p
            className="font-elegant text-xs uppercase tracking-widest"
            style={{ color: "#aaa" }}
          >
            halouspomene.rs
          </p>
        </div>
      </div>
    </div>
  );
}
