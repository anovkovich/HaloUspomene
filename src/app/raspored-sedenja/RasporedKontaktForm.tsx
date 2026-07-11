"use client";

import { useState } from "react";
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Calendar,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import { PhoneVerificationField } from "@/components/verification/PhoneVerificationField";
import {
  useRecaptcha,
  RecaptchaDisclosure,
} from "@/components/forms/RecaptchaProvider";

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

const labelClass =
  "block text-[10px] uppercase tracking-[0.2em] text-[#F5F4DC]/40 mb-2";
const inputClass =
  "w-full bg-transparent border-b border-[#F5F4DC]/15 py-3 px-1 text-[#F5F4DC] placeholder:text-[#F5F4DC]/30 focus:outline-none focus:border-[#AE343F] transition-colors text-base";

export default function RasporedKontaktForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTrustToken, setPhoneTrustToken] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  // Pay-first self-serve: the record is created immediately; the couple pays to
  // activate, then logs in with this PIN.
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [createdPin, setCreatedPin] = useState<string | null>(null);

  const { execute: executeRecaptcha } = useRecaptcha();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!WEB3FORMS_KEY) {
      setError("Forma trenutno nije dostupna. Pišite na halouspomene@gmail.com.");
      return;
    }
    if (!phoneTrustToken) {
      setError("Verifikujte broj telefona pre slanja upita.");
      return;
    }

    setSubmitting(true);
    try {
      let recaptchaToken: string;
      try {
        recaptchaToken = await executeRecaptcha("contact");
      } catch {
        setError("Provera neuspešna. Osvežite stranicu i pokušajte ponovo.");
        return;
      }

      // Verify recaptcha + phone trust, auto-create the standalone seating
      // record, and get back the slug + PIN to include in the admin email.
      const requestRes = await fetch("/api/raspored-sedenja/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: `+381${phone}`,
          eventName: eventName.trim(),
          eventDate: eventDate || undefined,
          phoneTrustToken,
          recaptchaToken,
        }),
      });
      const requestData = (await requestRes.json().catch(() => ({}))) as {
        ok?: boolean;
        slug?: string;
        password?: string;
        error?: string;
      };
      if (!requestRes.ok || !requestData.ok || !requestData.slug) {
        setError(
          requestData.error ||
            "Slanje nije uspelo. Pokušajte ponovo.",
        );
        return;
      }

      setCreatedSlug(requestData.slug);
      if (typeof requestData.password === "string")
        setCreatedPin(requestData.password);

      const formattedDate = eventDate
        ? new Date(eventDate).toLocaleDateString("sr-Latn-RS", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Nije naveden";

      const siteOrigin =
        typeof window !== "undefined" ? window.location.origin : "";
      const accessUrl = `${siteOrigin}/raspored-sedenja/${requestData.slug}`;

      // Admin notification — record is already created server-side, this is
      // just so admin knows to share URL+PIN with the client.
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Raspored sedenja - upit za ${eventName.trim()}`,
          from_name: "HALO Uspomene",
          name: name.trim(),
          telefon: `+381${phone}`,
          tip_eventa: eventName.trim(),
          datum_eventa: formattedDate,
          paket: "Standalone raspored sedenja za organizatore",
          slug: requestData.slug,
          pin: requestData.password,
          pristupni_link: accessUrl,
          napomena:
            "Pristup je VEC kreiran. Posaljite klijentu URL + PIN telefonom/SMS-om.",
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
      };

      if (!res.ok || !data.success) {
        setError(data.message || "Slanje nije uspelo. Pokušajte ponovo.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Greška pri slanju. Pokušajte ponovo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#AE343F]/15 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-[#AE343F]" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif text-[#F5F4DC] mb-3">
          Vaš alat je spreman!
        </h3>
        <p className="text-[#F5F4DC]/60 max-w-md mx-auto leading-relaxed mb-7">
          Aktivirajte pristup uplatom — čim je obradimo, prijavljujete se PIN-om
          i alat je vaš.
        </p>
        {createdSlug && (
          <a
            href={`/placanje/raspored/${createdSlug}`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#AE343F] hover:bg-[#8A2A32] text-white font-semibold text-base transition-colors"
          >
            Plati i aktiviraj alat →
          </a>
        )}
        {createdPin && (
          <div className="mt-8 mx-auto max-w-sm rounded-2xl border border-[#F5F4DC]/15 bg-[#F5F4DC]/[0.04] p-5 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5F4DC]/40 mb-1">
              PIN za prijavu
            </p>
            <p className="font-mono text-xl font-bold text-[#F5F4DC] mb-2 tracking-widest">
              {createdPin}
            </p>
            <p className="text-xs leading-relaxed text-[#F5F4DC]/50">
              Sačuvajte ga — posle uplate prijavljujete se ovim PIN-om na{" "}
              <span className="font-semibold text-[#F5F4DC]/70">
                /raspored-sedenja/{createdSlug}
              </span>
              .
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <User size={10} className="text-[#AE343F]" />
              Vaše ime *
            </span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ime i prezime"
            disabled={submitting}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <Phone size={10} className="text-[#AE343F]" />
              Broj telefona *
            </span>
          </label>
          <PhoneVerificationField
            variant="dark"
            required
            disabled={submitting}
            value={phone}
            onChange={(v) => {
              setPhone(v);
              if (phoneTrustToken) setPhoneTrustToken("");
            }}
            onVerified={(token) => setPhoneTrustToken(token)}
            onUnverified={() => setPhoneTrustToken("")}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Tip / ime eventa *</label>
          <input
            type="text"
            required
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="npr. Konferencija Beograd 2026"
            disabled={submitting}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={10} className="text-[#AE343F]" />
              Datum eventa (opciono)
            </span>
          </label>
          <DatePicker
            value={eventDate}
            onChange={setEventDate}
            placeholder="Izaberite datum"
            variant="dark"
            showQuickActions={false}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-[#ff6b6b]">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <RecaptchaDisclosure className="text-[10px] text-[#F5F4DC]/30" />

      <div>
        <button
          type="submit"
          disabled={submitting || !phoneTrustToken}
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#AE343F] hover:bg-[#8A2A32] disabled:opacity-50 text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-xl shadow-[#AE343F]/20"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Šaljem upit...
            </>
          ) : (
            <>
              Pošalji upit
              <Send size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
