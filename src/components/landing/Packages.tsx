import React from "react";
import { Check, Phone, Package } from "lucide-react";
import Link from "next/link";

const features = [
  "Autentični vintage telefon",
  "Dostava kurirskom službom u celoj Srbiji",
  "Elegantno retro uputstvo i dekoracija",
  "Svi audio snimci u digitalnom formatu",
  "Na vašoj adresi čak do 5 dana",
  "Personalizovana poruka dobrodošlice",
  "Besplatan povrat uređaja za celu Srbiju",
];

const Packages: React.FC = () => {
  return (
    <section id="paketi" className="pt-10 pb-6 sm:pt-12 sm:pb-8 bg-[#F5F4DC]">
      <div className="container mx-auto px-4">
        {/* Header — compact with phone icon */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#232323]/5 rounded-full mb-4">
            <Phone size={14} className="text-[#AE343F]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#232323]/50">
              Retro telefon za venčanja
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#232323] mb-3">
            Iznajmite vintage telefon
          </h2>
          <p className="text-sm sm:text-base text-[#232323]/50 max-w-lg mx-auto">
            Gosti podižu slušalicu i ostavljaju glasovnu poruku — neograničen
            broj poruka, trajno vlasništvo nad svim snimcima.
          </p>
        </div>

        {/* Package — single card */}
        <div className="max-w-md mx-auto">
          <div className="relative p-5 sm:p-6 md:p-8 rounded-2xl bg-white border-2 border-[#AE343F] shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#F5F4DC] rounded-xl flex items-center justify-center">
                <Package className="text-[#AE343F]" size={28} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-serif text-[#232323] leading-tight">
                  Audio Guest Book
                </h3>
                <p className="text-sm font-semibold text-[#AE343F]">
                  9.000 din
                </p>
              </div>
            </div>

            <ul className="space-y-2 mb-4">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2.5 text-sm font-light text-[#232323]/80"
                >
                  <Check size={14} className="text-[#AE343F] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <p className="text-xs text-[#232323]/40 mb-5 pl-1">
              Lična dostava i montaža dostupna je samo u Novom Sadu.
            </p>

            <Link
              href="/#kontakt"
              className="block w-full text-center py-2.5 rounded-xl text-sm font-bold transition-colors bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC]"
              data-track="package_click"
              data-track-package-name="Audio Guest Book"
            >
              Rezervišite termin
            </Link>
          </div>
        </div>

        {/* Subtle note */}
        <p className="text-center text-xs text-[#232323]/35 mt-6">
          Saznajte više o{" "}
          <Link
            href="/telefon-uspomena"
            className="text-[#AE343F]/60 hover:text-[#AE343F] underline"
          >
            telefonu uspomena
          </Link>
          {" "}ili pogledajte{" "}
          <Link
            href="/cene"
            className="text-[#AE343F]/60 hover:text-[#AE343F] underline"
          >
            digitalnu pozivnicu sa rasporedom sedenja i audio knjigom
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Packages;
