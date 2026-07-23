"use client";

import { useState, useEffect, type ReactNode } from "react";
import { CreditCard, Landmark, CheckCircle2, Loader2, AlertCircle, ChevronDown, Tag } from "lucide-react";
import { formatPrice } from "@/data/pricing";
import { NbsQrCode } from "@/lib/nbs-qr";
import { useRecaptcha, RecaptchaDisclosure } from "@/components/forms/RecaptchaProvider";
import { createCardCheckout } from "@/app/placanje/[kind]/[slug]/actions";
import { openCheckout } from "@/lib/payments/lemon-overlay";
import type { PaymentKind } from "@/lib/orders";

interface CheckoutLine {
  l: string;
  rsd: number;
  eur: number;
}

interface CheckoutPanelProps {
  kind: PaymentKind;
  slug: string;
  orderId: string;
  ipsRef: string;
  displayName: string;
  tierLabel: string;
  amountRsd: number;
  /** Frozen EUR equivalent. Not rendered — the panel quotes dinars, which is
   *  what LS charges — but kept on the props so bringing a EUR hint back is a
   *  one-liner. Every line in `lines` carries its own `eur` too. */
  amountEur: number;
  lines: CheckoutLine[];
  tierId: string;
  cardEnabled: boolean;
  /** The promo code the server validated + applied (undefined = none). */
  promoCode?: string;
  /** Master switch — when false, the promo UI is fully hidden. */
  promoEnabled?: boolean;
  /** Custom (partial-combo) checkout: hide the card accordion entirely — this
   *  amount can only be paid via IPS (manual admin approval). */
  ipsOnly?: boolean;
  /** Card upsell for the full package shown above IPS on the custom checkout.
   *  Only passed when the package costs MORE than the combo (a genuine upsell);
   *  the page omits it entirely when it would be a downsell. */
  upsell?: { label: string; rsd: number; href: string };
}

export default function CheckoutPanel({
  kind,
  slug,
  orderId,
  ipsRef,
  displayName,
  tierLabel,
  amountRsd,
  lines,
  tierId,
  cardEnabled,
  promoCode,
  promoEnabled = false,
  ipsOnly = false,
  upsell,
}: CheckoutPanelProps) {
  const { execute: executeRecaptcha } = useRecaptcha();

  // Promo carry-over: a code enters via ?promo= (from the RSVP-success CTA). If
  // the server applied one, remember it; if a stored code exists and none is in
  // the URL, retry it once; if a URL code was rejected, drop the dead code.
  useEffect(() => {
    if (!promoEnabled) return; // fully inert until the promo flow launches
    if (promoCode) {
      try {
        localStorage.setItem("hu_promo", promoCode);
      } catch {}
      return;
    }
    const url = new URL(window.location.href);
    if (url.searchParams.get("promo")) {
      try {
        localStorage.removeItem("hu_promo");
      } catch {}
      return;
    }
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("hu_promo");
    } catch {}
    if (stored) {
      url.searchParams.set("promo", stored);
      window.location.replace(url.toString());
    }
  }, [promoCode, promoEnabled]);

  const promoDiscountRsd = -(lines.find((l) => l.rsd < 0)?.rsd ?? 0);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");

  const applyPromoCode = () => {
    const code = promoInput.trim();
    if (!code) return;
    const url = new URL(window.location.href);
    url.searchParams.set("promo", code);
    window.location.href = url.toString();
  };

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [payerName, setPayerName] = useState(displayName);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  // Which payment method is expanded. When card is unavailable (pre-KYC) the
  // IPS accordion opens by default since it's the only option.
  const [open, setOpen] = useState<"card" | "ips" | null>(
    cardEnabled ? null : "ips",
  );

  const startCard = async () => {
    setCardError(null);
    setCardLoading(true);
    try {
      const res = await createCardCheckout(kind, slug, tierId, promoCode);
      if (res.url) {
        openCheckout(res.url, `/placanje/${kind}/${slug}/hvala/?order=${orderId}`);
        return;
      }
      setCardError(res.error || "Kartično plaćanje trenutno nije dostupno.");
    } catch {
      setCardError("Kartično plaćanje trenutno nije dostupno.");
    } finally {
      setCardLoading(false);
    }
  };

  const submitNotify = async () => {
    setError(null);
    setSubmitting(true);
    try {
      let token: string;
      try {
        token = await executeRecaptcha("payment_notify");
      } catch {
        setError("Provera neuspešna. Osvežite stranicu i pokušajte ponovo.");
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/placanje/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          payerName: payerName.trim(),
          recaptcha_token: token,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Slanje nije uspelo. Pokušajte ponovo.");
      }

      // Order is now in the admin review queue (authoritative). Fire the
      // admin-notification email best-effort from the client — Cloudflare
      // blocks server-side Web3Forms from Vercel, and delivery is not required.
      const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
      if (WEB3FORMS_KEY) {
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `[UPLATA] ${kind}/${slug} — ${amountRsd} din — RO ${ipsRef}`,
            from_name: "HALO Uspomene — Uplate",
            uplatilac: payerName.trim() || displayName,
            paket: tierLabel,
            iznos: `${amountRsd} din`,
            poziv_na_broj: ipsRef,
            porudzbina: orderId,
            proizvod: `${kind} / ${slug}`,
            admin_link: "https://halouspomene.rs/admin/?tab=uplate",
          }),
        }).catch(() => {
          /* doorbell only — the review queue is the source of truth */
        });
      }

      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Došlo je do greške. Pokušajte ponovo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4DC] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Header */}
        <div className="bg-[#AE343F] text-[#F5F4DC] px-7 pt-7 pb-6 text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase opacity-80 mb-2">
            Plaćanje
          </p>
          <h1 className="text-2xl font-serif mb-1">{tierLabel}</h1>
          <p className="text-sm opacity-80">{displayName}</p>
        </div>

        <div className="px-7 py-6">
          {/* Line items */}
          <div className="space-y-2 mb-4">
            {lines.map((line, i) => (
              <div
                key={i}
                className={`flex justify-between text-sm ${
                  line.rsd < 0 ? "text-green-700" : "text-[#232323]"
                }`}
              >
                <span>{line.l}</span>
                <span className="font-medium">{formatPrice(line.rsd)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-gray-300 my-4" />
          <div className="flex justify-between items-baseline mb-6">
            <span className="text-sm font-bold tracking-wider text-[#232323]">
              UKUPNO
            </span>
            <span className="text-2xl font-bold text-[#AE343F]">
              {formatPrice(amountRsd)}
            </span>
          </div>

          {!done &&
            (promoCode || promoEnabled) &&
            (promoCode ? (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 mb-5">
                <Tag size={15} className="text-green-600 shrink-0" />
                <span className="text-[13px] text-green-800 font-medium">
                  Promo kôd primenjen
                  {promoDiscountRsd > 0
                    ? ` — ušteda ${formatPrice(promoDiscountRsd)}`
                    : ""}
                </span>
              </div>
            ) : !promoOpen ? (
              <button
                type="button"
                onClick={() => setPromoOpen(true)}
                className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-[#AE343F] transition-colors mb-5"
              >
                <Tag size={13} /> Imate promo kôd?
              </button>
            ) : (
              <div className="flex gap-2 mb-5">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyPromoCode()}
                  placeholder="Promo kôd"
                  className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm text-[#232323] uppercase placeholder:normal-case focus:outline-none focus:border-[#AE343F] transition-colors"
                />
                <button
                  type="button"
                  onClick={applyPromoCode}
                  disabled={!promoInput.trim()}
                  className="rounded-xl bg-[#AE343F] hover:bg-[#8A2A32] text-white px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Primeni
                </button>
              </div>
            ))}

          {done ? (
            <div className="rounded-2xl bg-green-50 border border-green-200 p-5 text-center">
              <CheckCircle2 className="mx-auto mb-2 text-green-600" size={32} />
              <p className="font-semibold text-green-800 mb-1">
                Primili smo obaveštenje o uplati
              </p>
              <p className="text-sm text-green-700">
                Aktiviraćemo vam pristup čim proverimo uplatu — obično u roku od
                1 sata. Javićemo vam porukom.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Upsell (custom checkout): pay the full package on card, instant */}
              {upsell && (
                <a
                  href={upsell.href}
                  className="block rounded-2xl border-2 border-[#AE343F]/30 bg-[#AE343F]/[0.04] hover:bg-[#AE343F]/[0.07] p-4 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard size={18} className="text-[#AE343F]" />
                    <span className="font-semibold text-[#232323]">
                      Uzmi ceo {upsell.label} karticom
                    </span>
                  </div>
                  <p className="text-[13px] text-[#232323]/65 leading-relaxed">
                    {formatPrice(upsell.rsd)} — aktivno <strong>odmah</strong>. Ili
                    platite svoju kombinaciju ispod.
                  </p>
                </a>
              )}

              {/* Card rail — always shown; disabled until LS is live (flag off) */}
              {!ipsOnly && (
                <PayAccordion
                  open={open === "card"}
                  onToggle={() => setOpen(open === "card" ? null : "card")}
                  disabled={!cardEnabled}
                  disabledNote="Uskoro"
                  icon={<CreditCard size={18} className="text-[#AE343F]" />}
                  title="Plati karticom i aktiviraj odmah"
                  subtitle={
                    <>
                      Aktivacija je <strong>odmah</strong>, čim plaćanje prođe.
                    </>
                  }
                >
                  <button
                    type="button"
                    onClick={startCard}
                    disabled={cardLoading}
                    className="w-full flex items-center justify-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-2xl py-3.5 font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {cardLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Otvaramo plaćanje…
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        Nastavi na plaćanje
                      </>
                    )}
                  </button>
                  {cardError && (
                    <p className="text-[12px] text-[#AE343F] text-center mt-2">
                      {cardError}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 text-center mt-2.5 leading-relaxed">
                    Za kartice iz inostranstva procesor plaćanja može dodati PDV
                    vaše zemlje na prikazanu cenu.
                  </p>
                </PayAccordion>
              )}

              {/* IPS rail */}
              <PayAccordion
                open={open === "ips"}
                onToggle={() => setOpen(open === "ips" ? null : "ips")}
                icon={<Landmark size={18} className="text-[#AE343F]" />}
                title="Plati iz mBanking aplikacije"
                subtitle={
                  <>
                    Skenirajte IPS kod i uplatu obrađujemo u roku od{" "}
                    <strong>sat vremena</strong>!
                  </>
                }
              >
                <NbsQrCode
                  total={amountRsd}
                  couple={displayName}
                  receiptNo={ipsRef}
                  bankAccountIdx={0}
                  hideTopDivider
                />

                {!notifyOpen ? (
                  <div className="mt-3">
                    <p className="text-[12px] text-[#232323] font-medium text-center mb-2">
                      Pustili ste uplatu? Zatražite obradu odmah!
                    </p>
                    <button
                      type="button"
                      onClick={() => setNotifyOpen(true)}
                      className="w-full border-2 border-[#AE343F] text-[#AE343F] hover:bg-[#AE343F] hover:text-white rounded-2xl py-3 font-semibold transition-colors"
                    >
                      Zatraži obradu
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Ime i prezime uplatioca
                    </label>
                    <input
                      type="text"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      disabled={submitting}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[#232323] focus:outline-none focus:border-[#AE343F] transition-colors"
                      placeholder="Kako glasi ime na uplati"
                    />
                    {error && (
                      <div className="flex items-center gap-2 text-[#AE343F] text-sm">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={submitNotify}
                      disabled={submitting || !payerName.trim()}
                      className="w-full flex items-center justify-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-2xl py-3 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Slanje...
                        </>
                      ) : (
                        "Pošalji zahtev"
                      )}
                    </button>
                  </div>
                )}
              </PayAccordion>
            </div>
          )}

          <RecaptchaDisclosure className="text-[10px] text-gray-400 text-center mt-5" />
        </div>
      </div>
    </div>
  );
}

/** A collapsible payment-method card. Collapsed shows header + subtitle down to
 *  the dashed divider; clicking the header reveals the content below. */
function PayAccordion({
  open,
  onToggle,
  icon,
  title,
  subtitle,
  children,
  disabled = false,
  disabledNote,
}: {
  open: boolean;
  onToggle: () => void;
  icon: ReactNode;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  disabledNote?: string;
}) {
  const expanded = open && !disabled;
  return (
    <div
      className={`rounded-2xl border transition-colors ${
        disabled
          ? "border-gray-200 opacity-55"
          : expanded
            ? "border-[#AE343F]/40"
            : "border-gray-200"
      }`}
    >
      <button
        type="button"
        onClick={disabled ? undefined : onToggle}
        disabled={disabled}
        className={`w-full text-left px-5 pt-4 pb-3 ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2 text-[#232323]">
          {icon}
          <span className="font-semibold flex-1">{title}</span>
          {disabled ? (
            disabledNote && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {disabledNote}
              </span>
            )
          ) : (
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          )}
        </div>
        <p className="text-[12px] text-gray-500 mt-1">{subtitle}</p>
      </button>
      <div className="px-5">
        <div className="border-t border-dashed border-gray-300" />
      </div>
      {expanded && <div className="px-5 pb-5 pt-4">{children}</div>}
    </div>
  );
}
