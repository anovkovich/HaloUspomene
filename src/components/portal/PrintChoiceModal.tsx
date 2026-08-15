"use client";

import { useState } from "react";
import {
  X,
  FileImage,
  FileText,
  Printer,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";

/**
 * Two ways to get the printed thing: take the file and do it yourself, or have
 * us make it.
 *
 * Replaces the old "PNG or ready-made A6 PDF" sheet. The A6 template was our
 * design sitting next to the client's own stationery and it read as amateur;
 * the second slot now offers the real printed product instead. Deliberately
 * carries no price — the per-piece rate belongs in `pricing.json` first.
 *
 * The order button does NOT send the client to a contact form: we already hold
 * everything a quote needs (who they are, the date, the phone), so the click
 * mails us directly and the client just gets told we'll be in touch. Web3Forms
 * is called from the BROWSER on purpose — Cloudflare blocks server-side calls
 * to it from Vercel (same reason `/api/placanje/notify` fires its mail client
 * side).
 */
export interface PrintOrderContext {
  /** What they want printed, e.g. "Pozivnice sa QR kodom". */
  product: string;
  slug: string;
  displayName: string;
  eventDate?: string;
  phone?: string;
}

export default function PrintChoiceModal({
  title,
  fileLabel,
  fileHint,
  fileIcon = "image",
  offerText,
  order,
  onDownload,
  onClose,
}: {
  title: string;
  /** e.g. "Samo QR kod — PNG" */
  fileLabel: string;
  fileHint: string;
  /** "image" for a QR PNG, "doc" for a PDF design. */
  fileIcon?: "image" | "doc";
  /** Omit when this artefact has no print-order offer — the caller should then
   *  skip the sheet entirely and download directly. */
  offerText?: string;
  order?: PrintOrderContext;
  onDownload: () => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function submitOrder() {
    if (!order) return;
    setState("sending");
    const key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
    if (!key) {
      setState("error");
      return;
    }
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: key,
          subject: `[ŠTAMPA] ${order.product} — ${order.displayName}`,
          from_name: "HALO Uspomene — Zahtev za štampu",
          proizvod: order.product,
          narucilac: order.displayName,
          slug: order.slug,
          datum_dogadjaja: order.eventDate || "—",
          telefon: order.phone || "—",
          napomena: "Klijent je zatražio štampu iz portala. Kontaktirati radi dogovora.",
        }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#232323]/60 hover:text-[#232323] transition-colors cursor-pointer"
          aria-label="Zatvori"
        >
          <X size={18} />
        </button>

        {state === "sent" ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
              <Check size={26} className="text-green-600" />
            </div>
            <h3 className="font-serif text-xl text-[#232323] mb-2">
              Zahtev je poslat
            </h3>
            <p className="text-sm text-[#232323]/65 leading-relaxed mb-5">
              Imamo sve vaše podatke — javićemo vam se uskoro radi dogovora oko
              izgleda, količine i cene.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#AE343F] hover:bg-[#8A2A32] transition-colors cursor-pointer"
            >
              U redu
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-serif text-xl text-[#232323] mb-1">{title}</h3>
            <p className="text-xs text-[#232323]/55 mb-5">
              Preuzmite fajl i odštampajte sami, ili to prepustite nama.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  onDownload();
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#232323]/12 text-left hover:border-[#AE343F]/40 hover:bg-[#F5F4DC]/40 transition-colors cursor-pointer"
              >
                {fileIcon === "doc" ? (
                  <FileText size={20} className="text-[#AE343F] shrink-0" />
                ) : (
                  <FileImage size={20} className="text-[#AE343F] shrink-0" />
                )}
                <span>
                  <span className="block text-sm font-semibold text-[#232323]">
                    {fileLabel}
                  </span>
                  <span className="block text-[11px] text-[#232323]/55">
                    {fileHint}
                  </span>
                </span>
              </button>

              {offerText && order && (
                <button
                  onClick={submitOrder}
                  disabled={state === "sending"}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#d4af37]/45 bg-[#d4af37]/[0.06] text-left hover:bg-[#d4af37]/[0.12] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {state === "sending" ? (
                    <Loader2
                      size={20}
                      className="text-[#AE343F] shrink-0 animate-spin"
                    />
                  ) : (
                    <Printer size={20} className="text-[#AE343F] shrink-0" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#232323]">
                      Naručite štampu kod nas
                    </span>
                    <span className="block text-[11px] text-[#232323]/55">
                      {offerText}
                    </span>
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-[#232323]/35 shrink-0"
                  />
                </button>
              )}

              {state === "error" && (
                <p className="text-[11px] text-[#AE343F] text-center">
                  Slanje nije uspelo. Pišite nam na halouspomene@gmail.com.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
