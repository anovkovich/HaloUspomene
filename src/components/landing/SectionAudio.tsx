import React from "react";
import Link from "next/link";
import { Phone, Mic, Check, ArrowRight, Disc, Wine } from "lucide-react";
import {
  formatPrice,
  getAudioPrice,
  isAudioDiscountActive,
  pricing,
} from "@/data/pricing";

const SectionAudio: React.FC = () => {
  const retroPrice = getAudioPrice();
  const retroRegular = pricing.packages.essential.price;
  const discountActive = isAudioDiscountActive();
  const digitalPrice = pricing.pozivnica.audio.price;
  const usbKasetaPrice = pricing.addons.find((a) => a.id === "usb_kaseta")!.price;
  const usbBocicaPrice = pricing.addons.find((a) => a.id === "usb_bocica")!.price;

  return (
    <section
      id="audio-uspomene"
      className="py-16 sm:py-20 md:py-24 bg-[#F5F4DC] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
            Audio uspomene
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight mb-5">
            Sačuvajte glasove gostiju{" "}
            <span className="italic text-[#AE343F]">zauvek</span>.
          </h2>
          <p className="text-base sm:text-lg text-[#232323]/60 leading-relaxed">
            Dve opcije — retro telefon ili digitalna audio knjiga. Birate šta
            odgovara Vašem stilu i budžetu.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {/* CARD A — Retro Telefon (Premium) */}
          <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-[#AE343F] shadow-2xl shadow-[#AE343F]/10 flex flex-col">
            <div className="absolute -top-3 left-6 bg-[#AE343F] text-[#F5F4DC] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              POPULARNO
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#AE343F]/10 flex items-center justify-center">
                <Phone size={22} className="text-[#AE343F]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#232323] leading-tight">
                  Retro Telefon
                </h3>
                <p className="text-xs text-[#232323]/50 uppercase tracking-wider mt-0.5">
                  Audio guest book
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#232323]/70 leading-relaxed mb-5">
              Iznajmite pravi vintage telefon. Bez WiFi-ja, na bateriju, dostava
              u celoj Srbiji. Gosti celo veče ostavljaju poruke — sve uspomene
              dobijate u audio formatu!
            </p>

            <ul className="space-y-2 mb-5">
              {[
                "Autentični vintage telefon",
                "Neograničen broj poruka, bez aplikacije",
                "Povratna dostava o našem trošku",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-sm text-[#232323]/75"
                >
                  <Check size={16} className="text-[#AE343F] shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* USB suvenir */}
            <div className="rounded-xl bg-[#d4af37]/8 border border-[#d4af37]/25 p-3.5 mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-1.5 flex items-center gap-2">
                <Disc size={12} />
                Opcioni USB suvenir
              </p>
              <p className="text-xs text-[#232323]/65 leading-relaxed">
                Retro kaseta sa USB-om ({formatPrice(usbKasetaPrice)}) ili
                Uspomene u bočici ({formatPrice(usbBocicaPrice)}) — Vaši snimci
                u fizičkom obliku sačuvani zauvek!
              </p>
            </div>

            <div className="mt-auto">
              <div className="flex items-baseline gap-2 mb-4">
                {discountActive && (
                  <span className="text-base text-[#232323]/30 line-through">
                    {formatPrice(retroRegular)}
                  </span>
                )}
                <span className="text-3xl font-serif font-bold text-[#AE343F]">
                  {formatPrice(retroPrice)}
                </span>
                {discountActive && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#AE343F] text-white px-2 py-0.5 rounded">
                    Sniženo
                  </span>
                )}
              </div>
              <Link
                href="/#kontakt"
                className="block w-full text-center py-3 rounded-xl text-sm font-bold uppercase tracking-wider bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] transition-colors"
                data-track="cta_click"
                data-track-cta-name="rezervisi_retro"
                data-track-cta-location="section_audio"
              >
                Rezervišite termin
              </Link>
            </div>
          </div>

          {/* CARD B — Digitalna Audio Knjiga */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-stone-200 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#232323]/8 flex items-center justify-center">
                <Mic size={22} className="text-[#232323]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#232323] leading-tight">
                  Digitalna audio knjiga
                </h3>
                <p className="text-xs text-[#232323]/50 uppercase tracking-wider mt-0.5">
                  Uz pozivnicu
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#232323]/70 leading-relaxed mb-5">
              Povoljnija opcija. Gosti skeniraju QR kod za stolom i snime
              glasovnu čestitku direktno sa svog pametnog telefona — bez
              aplikacije.
            </p>

            <ul className="space-y-2 mb-5">
              {[
                "QR kod na svakom stolu",
                "Bez instalacije aplikacije",
                "Svi snimci u Vašem portalu",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-sm text-[#232323]/75"
                >
                  <Check
                    size={16}
                    className="text-[#232323]/60 shrink-0 mt-0.5"
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* Spacer to align with USB box */}
            <div className="rounded-xl bg-[#232323]/3 border border-stone-200 p-3.5 mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#232323]/60 mb-1.5 flex items-center gap-2">
                <Wine size={12} />
                Idealno uz pozivnicu
              </p>
              <p className="text-xs text-[#232323]/65 leading-relaxed">
                Najpovoljnija je u kompletnom paketu sa pozivnicom i rasporedom
                sedenja — pogledajte cene.
              </p>
            </div>

            <div className="mt-auto">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-serif font-bold text-[#232323]">
                  {formatPrice(digitalPrice)}
                </span>
                <span className="text-sm text-[#232323]/50">uz pozivnicu</span>
              </div>
              <Link
                href="/cene"
                className="block w-full text-center py-3 rounded-xl text-sm font-bold uppercase tracking-wider border-2 border-[#232323]/15 text-[#232323] hover:border-[#232323] hover:bg-[#232323] hover:text-[#F5F4DC] transition-all"
              >
                Pogledajte cene
              </Link>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-xs text-[#232323]/40 mt-8">
          Lična dostava i montaža retro telefona dostupna je samo u Novom Sadu.{" "}
          <Link
            href="/telefon-uspomena"
            className="text-[#AE343F]/70 hover:text-[#AE343F] underline"
          >
            Saznajte više o retro telefonu
            <ArrowRight size={12} className="inline ml-1" />
          </Link>
        </p>
      </div>
    </section>
  );
};

export default SectionAudio;
