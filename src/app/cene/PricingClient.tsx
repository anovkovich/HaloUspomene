"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Check,
  Globe,
  FileDown,
  LayoutDashboard,
  Mic,
  Phone,
  Heart,
  Sparkles,
  ArrowRight,
  BadgePercent,
  Info,
  ExternalLink,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import { pricing, formatPrice } from "@/data/pricing";

interface Feature {
  id: string;
  label: string;
  description: string;
  price: number;
  included?: boolean;
  icon: React.ReactNode;
  locked?: boolean;
  subitems?: { id: string; label: string; price: number; note: string }[];
  promo?: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    id: "website",
    label: "Website pozivnica",
    description:
      "Personalizovana web stranica za vaše venčanje sa animacijama, odbrojavanjem, lokacijom i RSVP formom.",
    price: pricing.pozivnica.website.price,
    icon: <Globe size={20} />,
    locked: true,
  },
  {
    id: "pdf",
    label: "PDF pozivnica",
    description:
      "Elegantna pozivnica spremna za štampu u A5 formatu sa svim detaljima venčanja.",
    price: pricing.pozivnica.pdf.price,
    included: true,
    icon: <FileDown size={20} />,
  },
  {
    id: "raspored",
    label: "Raspored sedenja",
    description:
      "Drag-and-drop editor za raspored stolova. Gosti mogu da pronađu svoje mesto putem linka.",
    price: pricing.pozivnica.raspored.price,
    icon: <LayoutDashboard size={20} />,
  },
  {
    id: "audio",
    label: "Digitalna audio knjiga",
    description:
      "Gosti skeniraju QR kod i snimaju audio poruke za mladence direktno sa telefona.",
    price: pricing.pozivnica.audio.price,
    icon: <Mic size={20} />,
    subitems: [
      {
        id: "usb_kaseta",
        label: pricing.addons.find((a) => a.id === "usb_kaseta")!.label,
        price: pricing.addons.find((a) => a.id === "usb_kaseta")!.price,
        note: "Fizički suvenir sa svim porukama",
      },
      {
        id: "usb_bocica",
        label: pricing.addons.find((a) => a.id === "usb_bocica")!.label,
        price: pricing.addons.find((a) => a.id === "usb_bocica")!.price,
        note: "Poruke u elegantnoj bočici",
      },
    ],
    promo: (
      <div
        className="mt-3 flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
        style={{
          backgroundColor: "rgba(174,52,63,0.06)",
          border: "1px solid rgba(174,52,63,0.12)",
        }}
      >
        <Phone size={16} className="text-[#AE343F] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#AE343F]">
            Želite pravi retro telefon?
          </span>{" "}
          <span className="text-[#232323]/60">
            Iznajmite naš autentični vintage telefon za potpuno iskustvo audio
            knjige utisaka.
          </span>
          <Link
            href="/#paketi"
            className="inline-flex items-center gap-1 ml-1 text-[#AE343F] font-medium hover:underline"
          >
            Pogledajte pakete <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    ),
  },
];

const FULL_PRICE = pricing.pozivnica.bundleFullPrice;
const BUNDLE_PRICE = pricing.pozivnica.bundlePrice;

export default function PricingClient() {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    website: true,
    pdf: true,
    raspored: false,
    audio: false,
  });
  const [selectedSubs, setSelectedSubs] = useState<Record<string, boolean>>({
    usb_kaseta: false,
    usb_bocica: false,
  });

  const toggle = (id: string) => {
    if (id === "website" || id === "pdf") return;
    setSelected((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (id === "audio" && !next.audio) {
        setSelectedSubs({ usb_kaseta: false, usb_bocica: false });
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelected({ website: true, pdf: true, raspored: true, audio: true });
  };

  const toggleSub = (id: string) => {
    setSelectedSubs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { subtotal, total, isBundle, subitemsTotal } = useMemo(() => {
    let subtotal = 0;
    for (const f of FEATURES) {
      if (selected[f.id] && !f.included) subtotal += f.price;
    }

    let subitemsTotal = 0;
    if (selected.audio) {
      for (const f of FEATURES) {
        if (f.subitems) {
          for (const sub of f.subitems) {
            if (selectedSubs[sub.id]) subitemsTotal += sub.price;
          }
        }
      }
    }

    const allMainSelected =
      selected.website && selected.raspored && selected.audio;
    const bundleDiscount = allMainSelected ? FULL_PRICE - BUNDLE_PRICE : 0;
    const total = subtotal - bundleDiscount + subitemsTotal;

    return {
      subtotal: subtotal + subitemsTotal,
      total,
      isBundle: allMainSelected,
      subitemsTotal,
    };
  }, [selected, selectedSubs]);

  const uncheckedCount = [selected.raspored, selected.audio].filter(
    (v) => !v,
  ).length;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]">
        {/* Pulsing checkbox animation */}
        <style>{`
        @keyframes checkbox-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(174,52,63,0.3); }
          50% { box-shadow: 0 0 0 6px rgba(174,52,63,0); }
        }
        .checkbox-pulse {
          animation: checkbox-pulse 2s ease-in-out infinite;
        }
      `}</style>

        <div className="max-w-3xl mx-auto px-4 pt-32 pb-20">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#AE343F] mb-3 leading-tight">
              Besplatna pozivnica za venčanje
            </h1>
            <h2 className="text-base sm:text-lg font-serif text-[#232323]/60 max-w-2xl mx-auto mb-6 leading-relaxed">
              Uz našu digitalnu pozivnicu dobijate{" "}
              <strong className="text-[#232323]/80">
                besplatnu pozivnicu za štampu
              </strong>
              , sa QR kodom za potvrdu dolaska — bez poziva, nikad lakše!
            </h2>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-10 bg-[#d4af37]/50" />
              <Heart size={14} className="text-[#d4af37]" fill="currentColor" />
              <div className="h-px w-10 bg-[#d4af37]/50" />
            </div>
            <p className="text-[#232323]/40 text-sm max-w-xl mx-auto">
              Sve što vam je potrebno za organizaciju savršenog venčanja — na
              jednom mestu. Odaberite pojedinačno ili uštedite sa kompletnim
              paketom.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3">
            {FEATURES.map((feature) => {
              const isOn = selected[feature.id];
              const isLocked = feature.locked || feature.included;
              const isCheckable = !isLocked && !isOn;

              return (
                <div key={feature.id}>
                  <button
                    onClick={() => toggle(feature.id)}
                    className={`w-full text-left rounded-2xl px-5 py-4 sm:px-6 sm:py-5 transition-all ${
                      isLocked ? "cursor-default" : "cursor-pointer"
                    } ${!isOn && !isLocked ? "hover:opacity-90" : ""}`}
                    style={{
                      backgroundColor: isOn ? "white" : "rgba(255,255,255,0.5)",
                      border: isOn
                        ? "2px solid rgba(174,52,63,0.2)"
                        : "2px solid rgba(174,52,63,0.08)",
                      opacity: isOn ? 1 : 0.75,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 transition-colors ${
                          isCheckable ? "checkbox-pulse" : ""
                        }`}
                        style={{
                          backgroundColor: isOn ? "#AE343F" : "transparent",
                          border: isOn
                            ? "none"
                            : "2px solid rgba(174,52,63,0.3)",
                        }}
                      >
                        {isOn && <Check size={14} className="text-white" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[#AE343F]">{feature.icon}</span>
                          <span className="font-semibold text-[#232323] text-base">
                            {feature.label}
                          </span>
                          {isCheckable && (
                            <span className="text-[10px] font-medium uppercase tracking-wide text-[#AE343F]/50 bg-[#AE343F]/5 px-2 py-0.5 rounded-full">
                              Dodaj
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#232323]/50 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex-shrink-0 text-right">
                        {feature.included ? (
                          <span className="text-xs font-semibold uppercase tracking-wide text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                            Besplatno
                          </span>
                        ) : (
                          <span
                            className={`font-semibold ${isOn ? "text-[#232323]" : "text-[#232323]/50"}`}
                          >
                            {formatPrice(feature.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Subitems */}
                  {feature.subitems && isOn && (
                    <div className="ml-10 sm:ml-16 mt-1 space-y-1">
                      {feature.subitems.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => toggleSub(sub.id)}
                          className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer"
                          style={{
                            backgroundColor: selectedSubs[sub.id]
                              ? "rgba(255,255,255,0.9)"
                              : "rgba(255,255,255,0.4)",
                            border: selectedSubs[sub.id]
                              ? "1px solid rgba(174,52,63,0.15)"
                              : "1px solid transparent",
                          }}
                        >
                          <div
                            className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                              !selectedSubs[sub.id] ? "checkbox-pulse" : ""
                            }`}
                            style={{
                              backgroundColor: selectedSubs[sub.id]
                                ? "#AE343F"
                                : "transparent",
                              border: selectedSubs[sub.id]
                                ? "none"
                                : "2px solid rgba(174,52,63,0.25)",
                            }}
                          >
                            {selectedSubs[sub.id] && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-[#232323]">
                              {sub.label}
                            </span>
                            <span className="text-xs text-[#232323]/40 ml-2">
                              {sub.note}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-[#232323]/70 flex-shrink-0">
                            +{formatPrice(sub.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Promo block */}
                  {feature.promo && isOn && (
                    <div className="ml-10 sm:ml-16 mt-1">{feature.promo}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bundle nudge */}
          {!isBundle && (
            <button
              onClick={selectAll}
              className="w-full flex items-center justify-center gap-2 my-5 px-5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: "rgba(212,175,55,0.1)",
                border: "1px dashed rgba(212,175,55,0.4)",
                color: "#8B7424",
              }}
            >
              <BadgePercent size={16} />
              Izaberite sve i uštedite {formatPrice(
                FULL_PRICE - BUNDLE_PRICE,
              )}{" "}
              — kompletni paket za samo {formatPrice(BUNDLE_PRICE)}
            </button>
          )}

          {/* Total */}
          <div
            className="mt-8 rounded-2xl px-6 py-6 sm:px-8"
            style={{
              backgroundColor: "white",
              border: "2px solid rgba(174,52,63,0.15)",
            }}
          >
            {isBundle && (
              <div className="flex items-center gap-2 mb-4 text-sm">
                <Sparkles size={16} className="text-[#d4af37]" />
                <span className="font-semibold text-[#AE343F]">
                  Kompletni paket — ušteda{" "}
                  {formatPrice(FULL_PRICE - BUNDLE_PRICE)}!
                </span>
              </div>
            )}

            <div className="space-y-2">
              {FEATURES.filter((f) => selected[f.id] && !f.included).map(
                (f) => (
                  <div
                    key={f.id}
                    className="flex justify-between text-sm text-[#232323]/60"
                  >
                    <span>{f.label}</span>
                    <span>{formatPrice(f.price)}</span>
                  </div>
                ),
              )}
              {selected.audio &&
                FEATURES.find((f) => f.id === "audio")
                  ?.subitems?.filter((s) => selectedSubs[s.id])
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between text-sm text-[#232323]/60 pl-4"
                    >
                      <span>{s.label}</span>
                      <span>+{formatPrice(s.price)}</span>
                    </div>
                  ))}
              {isBundle && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Popust na kompletni paket</span>
                  <span>-{formatPrice(FULL_PRICE - BUNDLE_PRICE)}</span>
                </div>
              )}
            </div>

            <div
              className="flex items-center justify-between mt-4 pt-4"
              style={{ borderTop: "1px solid rgba(35,35,35,0.1)" }}
            >
              <span className="font-serif text-lg text-[#232323]">Ukupno</span>
              <div className="text-right">
                {isBundle && (
                  <span className="text-sm text-[#232323]/30 line-through mr-3">
                    {formatPrice(subtotal)}
                  </span>
                )}
                <span className="text-2xl font-serif font-bold text-[#AE343F]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <Link
              href="/napravi-pozivnicu"
              className="mt-6 w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm uppercase tracking-[0.15em] font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: "#AE343F",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(174,52,63,0.25)",
              }}
            >
              <Heart size={14} fill="currentColor" />
              Napravi svoju pozivnicu
              <Heart size={14} fill="currentColor" />
            </Link>
          </div>

          {/* Example links */}
          <div className="mt-10 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#232323]/30 text-center">
              Pogledajte primere uživo
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  href: "/pozivnica/ana-dejan",
                  label: "Primer pozivnice",
                  tooltip:
                    "Pogledajte kako izgleda personalizovana website pozivnica sa odbrojavanjem, lokacijom i formom za potvrdu dolaska.",
                },
                {
                  href: "/pozivnica/ana-dejan/gde-sedim",
                  label: "Primer /gde-sedim",
                  tooltip:
                    "Gosti ukucaju ime i odmah vide za kojim stolom sede, bez pitanja, bez gužve! Na ulazu možete postaviti samo QR kod.",
                },
                {
                  href: "/pozivnica/ana-dejan/audio-knjiga",
                  label: "Primer /ostavi-audio",
                  tooltip:
                    "Stranica na kojoj gosti snimaju glasovne poruke i čestitke upućene vama! Direktno sa telefona, bez aplikacije.",
                },
              ].map((link) => (
                <div
                  key={link.href}
                  className="group relative rounded-xl px-4 py-3 text-center transition-all border border-[#AE343F]/10 sm:border-transparent sm:hover:border-[#AE343F]/10 sm:hover:bg-white/80"
                >
                  <div className="peer flex items-center justify-center gap-1.5 mb-1">
                    <Info size={14} className="text-[#AE343F]/40 cursor-help" />
                    <Link
                      href={link.href}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-sm text-[#AE343F] font-medium hover:underline"
                    >
                      {link.label} <ExternalLink size={12} />
                    </Link>
                  </div>
                  <p className="text-[11px] text-[#232323]/40 leading-relaxed block sm:hidden">
                    {link.tooltip}
                  </p>
                  <div className="hidden sm:group-hover:block absolute left-0 right-0 top-full mt-1 z-10 px-4 py-2.5 rounded-xl bg-white shadow-lg border border-[#AE343F]/10">
                    <p className="text-[11px] text-[#232323]/60 leading-relaxed">
                      {link.tooltip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
