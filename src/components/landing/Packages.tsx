import React from "react";
import { Check, Phone, Package, PackageCheck } from "lucide-react";
import Link from "next/link";

const packages = [
  {
    name: "Essential",
    price: "9.000 din",
    icon: <Package className="text-[#AE343F]" size={28} />,
    features: [
      "Autentični vintage telefon",
      "Dostava kurirskom službom",
      "Elegantno retro uputstvo i dekoracija",
      "Svi audio snimci za 3 do 5 dana",
      "Na vašoj adresi čak 5 dana",
    ],
    cta: "Izaberite Essential",
    popular: false,
  },
  {
    name: "Full Service",
    price: "10.000 din",
    icon: <PackageCheck className="text-[#AE343F]" size={28} />,
    features: [
      "Lična dostava i montaža u Novom Sadu",
      "Ekskluzivna drvena govornica",
      "Elegantno retro uputstvo i dekoracija",
      "Svi audio snimci za 48h + highlights",
      "Personalizovana audio dobrodošlica",
    ],
    cta: "Želim Full Service",
    popular: true,
  },
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

        {/* Packages — compact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative p-5 sm:p-6 md:p-8 rounded-2xl bg-white ${
                pkg.popular
                  ? "border-2 border-[#AE343F] shadow-xl"
                  : "border border-[#232323]/10 shadow-md"
              }`}
            >
              {pkg.popular && (
                <div className="absolute text-center -top-3 left-1/2 -translate-x-1/2 bg-[#AE343F] text-[#F5F4DC] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                  Dostupno u Novom Sadu
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#F5F4DC] rounded-xl flex items-center justify-center">
                  {pkg.icon}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-serif text-[#232323] leading-tight">
                    {pkg.name}
                  </h3>
                  <p className="text-sm font-semibold text-[#AE343F]">
                    {pkg.price}
                  </p>
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {pkg.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm font-light text-[#232323]/80"
                  >
                    <Check
                      size={14}
                      className="text-[#AE343F] flex-shrink-0"
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/#kontakt"
                className={`block w-full text-center py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  pkg.popular
                    ? "bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC]"
                    : "bg-[#232323] hover:bg-[#1a1a1a] text-[#F5F4DC]"
                }`}
                data-track="package_click"
                data-track-package-name={pkg.name}
              >
                {pkg.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Subtle note */}
        <p className="text-center text-xs text-[#232323]/35 mt-6">
          Pogledajte i našu{" "}
          <Link href="/cene" className="text-[#AE343F]/60 hover:text-[#AE343F] underline">
            digitalnu pozivnicu sa rasporedom sedenja i audio knjigom
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Packages;
