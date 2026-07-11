"use client";

import React from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Camera,
  HelpCircle,
  Cake,
  PartyPopper,
} from "lucide-react";
import type { FeatureInfoKey } from "@/components/ui/FeatureInfoModal";
import {
  formatPrice,
  getTier,
  getKompletnoSavings,
  getPremiumTierSavings,
  pricing,
  getStandaloneSeatingPrice,
  getStandaloneSeatingRegularPrice,
  isStandaloneSeatingPromoActive,
  getRodjendanPozivnicaPrice,
} from "@/data/pricing";

/**
 * Three-tier bundle block for /cene: Osnovno / Kompletno (anchor) / Premium.
 * Sells the outcome, not à-la-carte parts, to raise average order value.
 * Responsive: cards stack (grid-cols-1) on mobile with Kompletno first &
 * highlighted; side-by-side (md:grid-cols-3) on desktop with the middle card
 * elevated. Below: standalone offers + a link to the à-la-carte configurator.
 */
function Li({
  children,
  gold,
}: {
  children: React.ReactNode;
  gold?: boolean;
}) {
  return (
    <li className="flex gap-2">
      <Check
        size={16}
        className={`${gold ? "text-[#d4af37]" : "text-[#AE343F]"} shrink-0 mt-0.5`}
      />
      <span>{children}</span>
    </li>
  );
}

export default function TierCards({
  onOpenInfo,
}: {
  onOpenInfo?: (key: FeatureInfoKey) => void;
}) {
  const osnovno = getTier("osnovno");
  const kompletno = getTier("kompletno");
  const premium = getTier("premium");
  const kompletnoSavings = getKompletnoSavings();
  const premiumSavings = getPremiumTierSavings();
  const standalonePrice = getStandaloneSeatingPrice();
  const standaloneRegular = getStandaloneSeatingRegularPrice();
  const standalonePromo = isStandaloneSeatingPromoActive();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-stretch">
        {/* Osnovno */}
        <div className="order-1 md:order-1 rounded-3xl bg-white border border-[#232323]/10 p-6 flex flex-col">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#232323]/50 mb-1">
            {osnovno?.label ?? "Osnovno"}
          </p>
          <p className="text-3xl font-serif text-[#232323] mb-1">
            {formatPrice(osnovno?.price ?? 5000)}
          </p>
          <p className="text-xs text-[#232323]/50 mb-4">
            Digitalna pozivnica sa potvrdama — spremno za 24h.
          </p>
          <ul className="space-y-2 text-sm text-[#232323]/70 flex-1 mb-5">
            <Li>Personalizovana web pozivnica</Li>
            <Li>Odbrojavanje do događaja</Li>
            <Li>Mapa do lokacija venčanja</Li>
            <Li>Protokol dana venčanja</Li>
            <Li>Online potvrda dolaska (RSVP)</Li>
            <Li>QR kod za potvrdu na štampanim pozivnicama</Li>
            <Li>Pristup {'„Moje Venčanje"'} portalu</Li>
            <Li>🎁 Gratis PDF pozivnica za štampu</Li>
          </ul>
          <Link
            href="/napravi-pozivnicu?paket=osnovno"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold border-2 border-[#AE343F]/20 text-[#AE343F] hover:bg-[#AE343F]/5 transition-colors"
          >
            Izaberi
          </Link>
        </div>

        {/* Kompletno — highlighted, first on mobile */}
        <div className="order-2 md:order-2 relative rounded-3xl bg-white p-6 flex flex-col ring-2 ring-[#AE343F] shadow-xl md:scale-[1.04]">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white bg-gradient-to-r from-[#AE343F] to-[#8A2A32] shadow">
            <Sparkles size={11} /> Najpopularnije
          </span>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#AE343F] mb-1 mt-1">
            {kompletno?.label ?? "Kompletno"}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-serif text-[#232323]">
              {formatPrice(kompletno?.price ?? 9900)}
            </p>
            {kompletno?.fullPrice && (
              <span className="text-sm text-[#232323]/40 line-through">
                {formatPrice(kompletno.fullPrice)}
              </span>
            )}
          </div>
          {kompletnoSavings > 0 && (
            <p className="text-xs font-semibold text-green-700 mb-4">
              Ušteda {formatPrice(kompletnoSavings)}
            </p>
          )}
          <ul className="space-y-2 text-sm text-[#232323]/75 flex-1 mb-5">
            <Li>
              <strong>Sve iz Osnovnog paketa</strong>
            </Li>
            <Li>Alat za raspored sedenja</Li>
            <Li>QR pano dobrodošlice na ulazu u salu</Li>
            <Li>QR galerija fotografija — sačuvajte slike gostiju</Li>
            <Li>Digitalna audio knjiga utisaka — glasovne poruke gostiju</Li>
            <Li>
              <strong>SVE NA JEDNOM MESTU</strong> — jedna stranica: Gde sedim ·
              Plan sale · Meni · Galerija · Audio
              {onOpenInfo && (
                <button
                  type="button"
                  onClick={() => onOpenInfo("hub")}
                  className="align-middle ml-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide text-[#AE343F] bg-[#AE343F]/[0.06] border border-[#AE343F]/20 hover:bg-[#AE343F]/10 transition-colors cursor-pointer"
                >
                  <HelpCircle size={10} /> Šta je ovo?
                </button>
              )}
            </Li>
          </ul>
          <p className="text-xs text-[#AE343F] font-semibold mb-4 text-center">
            ⭐ Najbolja vrednost — najveći popust!
          </p>
          <Link
            href="/napravi-pozivnicu?raspored=1&audio=1&galerija=1&paket=kompletno"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-sm font-bold text-white bg-[#AE343F] hover:bg-[#8A2A32] transition-colors shadow-lg shadow-[#AE343F]/25"
          >
            Izaberi Komplet <ArrowRight size={15} />
          </Link>
        </div>

        {/* Premium */}
        <div className="order-3 md:order-3 rounded-3xl bg-[#232323] text-[#F5F4DC] p-6 flex flex-col">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#d4af37] mb-1">
            <Sparkles size={12} /> {premium?.label ?? "Premium"}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-serif text-[#F5F4DC]">
              {formatPrice(premium?.price ?? 13900)}
            </p>
            {premium?.fullPrice && (
              <span className="text-sm text-[#F5F4DC]/40 line-through">
                {formatPrice(premium.fullPrice)}
              </span>
            )}
          </div>
          {premiumSavings > 0 && (
            <p className="text-xs font-semibold text-[#d4af37] mb-4">
              Ušteda {formatPrice(premiumSavings)}
            </p>
          )}
          <ul className="space-y-2 text-sm text-[#F5F4DC]/75 flex-1 mb-5">
            <Li gold>
              <strong className="text-[#F5F4DC]">Sve iz Kompletnog paketa</strong>
            </Li>
            <Li gold>
              <strong className="text-[#F5F4DC]">Premium pozivnica</strong> umesto
              standardne — luksuzna i animirana, u 3 stila:
            </Li>
          </ul>
          <ul className="space-y-1.5 text-xs text-[#F5F4DC]/60 mb-5 pl-1">
            <li>
              <span className="text-[#d4af37]">▸ Akvarel</span> — akvarelna
              pozadina venčanog mesta i vintage automobil
            </li>
            <li>
              <span className="text-[#d4af37]">▸ Papirni svet</span> — izrada
              personalizovane ilustracije mladenaca po vašem opisu kao centralni
              element
            </li>
            <li>
              <span className="text-[#d4af37]">▸ Burgundy scena</span> — ruže i
              animirani par belih golubova
            </li>
            <li className="pt-1 text-[#F5F4DC]/50">
              + 2 vrste animiranih koverti dobrodošlice i parallax filmski
              efekti
            </li>
          </ul>
          <Link
            href="/napravi-pozivnicu?premium=1&raspored=1&audio=1&galerija=1&paket=premium"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold text-[#232323] bg-[#d4af37] hover:brightness-105 transition-all"
          >
            Izaberi Premium <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Iskombinuj sam */}
      <div className="text-center mt-8">
        <a
          href="#konfigurator"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-[#232323]/70 border border-[#232323]/15 hover:border-[#AE343F]/40 hover:text-[#AE343F] transition-colors"
        >
          Iskombinuj sam svoj paket
          <ArrowRight size={15} className="rotate-90" />
        </a>
      </div>

      {/* Standalone offers */}
      <div className="mt-12">
        <p className="text-center text-sm text-[#232323]/55 mb-5 max-w-2xl mx-auto">
          Treba vam samo{" "}
          <strong className="text-[#232323]/75">alat za raspored sedenja</strong>{" "}
          ili samo{" "}
          <strong className="text-[#232323]/75">QR foto galerija</strong>? Uzmite
          ih samostalno:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <Link
            href="/raspored-sedenja"
            className="group flex items-center gap-4 bg-white rounded-2xl border-2 border-[#AE343F]/20 p-5 hover:border-[#AE343F] hover:bg-[#AE343F]/[0.04] hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center shrink-0">
              <LayoutDashboard size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#232323] text-sm group-hover:text-[#AE343F] transition-colors">
                Raspored sedenja — samostalno
              </p>
              <p className="text-xs text-[#232323]/50">Za organizatore, bez pozivnice</p>
            </div>
            <div className="text-right shrink-0">
              {standalonePromo && (
                <span className="block text-[10px] text-[#232323]/40 line-through">
                  {formatPrice(standaloneRegular)}
                </span>
              )}
              <span className="text-sm font-bold text-[#AE343F]">
                {formatPrice(standalonePrice)}
              </span>
            </div>
            <ArrowRight
              size={16}
              className="shrink-0 text-[#AE343F] group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <Link
            href="/qr-galerija-slika-sa-vencanja"
            className="group flex items-center gap-4 bg-white rounded-2xl border-2 border-[#AE343F]/20 p-5 hover:border-[#AE343F] hover:bg-[#AE343F]/[0.04] hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center shrink-0">
              <Camera size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#232323] text-sm group-hover:text-[#AE343F] transition-colors">
                QR galerija — samostalno
              </p>
              <p className="text-xs text-[#232323]/50">Sa QR kodom za zahvalnice</p>
            </div>
            <span className="text-sm font-bold text-[#AE343F] shrink-0">
              {formatPrice(pricing.pozivnica.galerija.price)}
            </span>
            <ArrowRight
              size={16}
              className="shrink-0 text-[#AE343F] group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>

      {/* Nije venčanje? — non-wedding invitations sold from /cene */}
      <div className="mt-10">
        <p className="text-center text-sm text-[#232323]/55 mb-5 max-w-2xl mx-auto">
          Ne pravite venčanje? Imamo pozivnice i za{" "}
          <strong className="text-[#232323]/75">dečji rođendan</strong> i{" "}
          <strong className="text-[#232323]/75">punoletstvo</strong>:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <Link
            href="/napravi-deciju-pozivnicu"
            className="group flex items-center gap-4 bg-white rounded-2xl border-2 border-[#AE343F]/20 p-5 hover:border-[#AE343F] hover:bg-[#AE343F]/[0.04] hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center shrink-0">
              <Cake size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#232323] text-sm group-hover:text-[#AE343F] transition-colors">
                Dečja rođendanska pozivnica
              </p>
              <p className="text-xs text-[#232323]/50">Sa RSVP i QR kodom</p>
            </div>
            <span className="text-sm font-bold text-[#AE343F] shrink-0">
              od {formatPrice(getRodjendanPozivnicaPrice(false))}
            </span>
            <ArrowRight
              size={16}
              className="shrink-0 text-[#AE343F] group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <Link
            href="/napravi-punoletstvo"
            className="group flex items-center gap-4 bg-white rounded-2xl border-2 border-[#AE343F]/20 p-5 hover:border-[#AE343F] hover:bg-[#AE343F]/[0.04] hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center shrink-0">
              <PartyPopper size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#232323] text-sm group-hover:text-[#AE343F] transition-colors">
                Pozivnica za punoletstvo
              </p>
              <p className="text-xs text-[#232323]/50">Za 18. rođendan</p>
            </div>
            <span className="text-sm font-bold text-[#AE343F] shrink-0">
              od {formatPrice(getRodjendanPozivnicaPrice(true))}
            </span>
            <ArrowRight
              size={16}
              className="shrink-0 text-[#AE343F] group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>

      {/* Divider into the à-la-carte configurator */}
      <div
        id="konfigurator"
        className="flex items-center gap-4 mt-14 mb-2 max-w-2xl mx-auto scroll-mt-28"
      >
        <div className="h-px flex-1 bg-[#232323]/10" />
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#232323]/40">
          Ili iskombinujte sam
        </span>
        <div className="h-px flex-1 bg-[#232323]/10" />
      </div>
    </div>
  );
}
