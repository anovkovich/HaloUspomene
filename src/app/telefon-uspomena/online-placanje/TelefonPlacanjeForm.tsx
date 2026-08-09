"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Loader2,
  AlertCircle,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import DatePicker from "@/components/ui/DatePicker";
import { PhoneAuthField } from "@/components/verification/PhoneAuthField";
import type { BypassInfo } from "@/lib/bypass-token";
import {
  useRecaptcha,
  RecaptchaDisclosure,
} from "@/components/forms/RecaptchaProvider";
import { createTelefonRental, loadFullDates } from "./actions";

const TelefonPlacanjeForm: React.FC<{ bypassInfo?: BypassInfo }> = ({
  bypassInfo,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullDates, setFullDates] = useState<string[]>([]);
  const { execute: executeRecaptcha } = useRecaptcha();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    city: "",
    dobrodoslica: false,
  });
  const [phoneTrustToken, setPhoneTrustToken] = useState("");

  // Booked-out dates, so the buyer sees the conflict before paying rather than
  // after. The server re-checks on submit — this list is only a courtesy.
  useEffect(() => {
    loadFullDates()
      .then(setFullDates)
      .catch(() => {});
  }, []);

  const dateTaken = !!formData.date && fullDates.includes(formData.date);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!bypassInfo && !phoneTrustToken) {
      toast.error(
        'Verifikujte broj telefona klikom na dugme "Kod" kako biste dobili SMS kod.',
      );
      return;
    }
    if (dateTaken) {
      toast.error("Taj datum je već rezervisan. Izaberite drugi.");
      return;
    }
    setIsLoading(true);

    try {
      let recaptchaToken: string;
      try {
        recaptchaToken = await executeRecaptcha("create_telefon");
      } catch {
        setError("Provera neuspešna. Osvežite stranicu i pokušajte ponovo.");
        setIsLoading(false);
        return;
      }

      const phonePrefix = bypassInfo?.callingCode || "+381";
      const created = await createTelefonRental({
        name: formData.name,
        phone: `${phonePrefix}${formData.phone}`,
        date: formData.date,
        city: formData.city,
        dobrodoslica: formData.dobrodoslica,
        recaptchaToken,
        phoneTrustToken,
        bypassToken: bypassInfo?.token,
      });
      if (!created.ok) {
        // A date can fill up between page load and submit — refresh the list so
        // the calendar immediately reflects what the server just refused.
        loadFullDates().then(setFullDates).catch(() => {});
        throw new Error(created.error);
      }

      // Heads-up mail so a shipment is never missed while the payment settles.
      // Best-effort: the reservation row already exists and shows up in admin
      // either way, so a failure here must not block the checkout.
      const web3Key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
      if (web3Key) {
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: web3Key,
            subject: `Retro telefon - PLAĆANJE U TOKU: ${formData.name}`,
            from_name: "HALO Uspomene",
            name: formData.name,
            telefon: `${phonePrefix}${formData.phone}`,
            datum_dogadjaja: formData.date,
            grad_isporuke: formData.city,
            dobrodoslica: formData.dobrodoslica ? "Da" : "Ne",
            rezervacija: created.id,
            napomena:
              "Klijent je krenuo na plaćanje. Rezervacija se automatski označava kao plaćena po uplati.",
          }),
        }).catch(() => {});
      }

      router.push(`/placanje/telefon/${created.id}/`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Došlo je do greške. Pokušajte ponovo.",
      );
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.phone &&
    formData.date &&
    formData.city &&
    !dateTaken &&
    (bypassInfo || phoneTrustToken);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white/5 backdrop-blur-md p-6 sm:p-10 rounded-[2rem] border border-white/10 shadow-2xl"
    >
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span className="text-sm leading-relaxed">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        {/* Ime */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <User size={14} className="text-[#AE343F]" /> Ime i prezime *
          </label>
          <input
            required
            type="text"
            placeholder="Ime i prezime"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none focus:border-[#AE343F] transition-colors placeholder:text-white/40"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
          />
        </div>

        {/* Datum */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <Calendar size={14} className="text-[#AE343F]" /> Datum događaja *
          </label>
          <DatePicker
            value={formData.date}
            onChange={(date) => setFormData({ ...formData, date })}
            placeholder="Izaberite datum"
          />
          {dateTaken && (
            <p className="text-xs text-red-300 leading-relaxed pl-1">
              Za taj datum su oba telefona već rezervisana. Izaberite drugi
              datum ili nam pišite pa vam javimo prvi slobodan termin.
            </p>
          )}
        </div>

        {/* Telefon */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <Phone size={14} className="text-[#AE343F]" /> Broj telefona *
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

        {/* Grad — seeds the shipping note on the rental record. */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest pl-1">
            <MapPin size={14} className="text-[#AE343F]" /> Grad *
          </label>
          <input
            required
            type="text"
            placeholder="npr. Beograd — hotel / sala"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#F5F4DC] text-lg focus:outline-none focus:border-[#AE343F] transition-colors placeholder:text-white/40"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Gratis dodatak */}
      <label className="flex items-start gap-3 cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <input
          type="checkbox"
          checked={formData.dobrodoslica}
          onChange={(e) =>
            setFormData({ ...formData, dobrodoslica: e.target.checked })
          }
          className="mt-0.5 cursor-pointer accent-[#AE343F]"
          disabled={isLoading}
        />
        <span className="text-sm text-[#F5F4DC]/75 leading-relaxed">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#F5F4DC]">
            <Sparkles size={13} className="text-[#d4af37]" />
            Personalizovana audio dobrodošlica
          </span>
          <span className="ml-2 text-[11px] uppercase tracking-widest text-[#d4af37]">
            gratis
          </span>
          <br />
          Vaša lična poruka koju gosti čuju kada podignu slušalicu. Tekst
          dogovaramo porukom nakon rezervacije.
        </span>
      </label>

      <div className="pt-6 border-t border-white/10 flex flex-col items-center gap-4">
        <button
          type="submit"
          disabled={isLoading}
          onClick={() => {
            if (!isFormValid && !dateTaken) {
              toast.error("Molimo popunite sva obavezna polja pre nastavka.");
            }
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-lg shadow-[#AE343F]/25 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Priprema…
            </>
          ) : (
            <>
              Nastavi na plaćanje
              <CreditCard size={16} />
            </>
          )}
        </button>
        <p className="text-[11px] text-[#F5F4DC]/40 text-center leading-relaxed">
          Na sledećem koraku birate karticu ili plaćanje preko IPS QR koda.
          Termin je rezervisan tek kada uplata bude potvrđena.
        </p>
        <RecaptchaDisclosure className="text-[10px] text-[#F5F4DC]/40" />
      </div>
    </form>
  );
};

export default TelefonPlacanjeForm;
