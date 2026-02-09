import React from "react";
import { Check, Package, PackageCheck } from "lucide-react";

const packages = [
  {
    name: "Essential",
    icon: <Package className="text-[#AE343F]" size={48} />,
    features: [
      "Autentični vintage telefon",
      "Dostava kurirskom službom",
      "Elegantno uputstvo za goste",
      "Svi audio snimci za 48h",
      "Na vašoj adresi do 5 dana",
    ],
    cta: "Izaberite Essential",
    popular: false,
  },
  {
    name: "Premium",
    icon: <PackageCheck className="text-[#AE343F]" size={48} />,
    features: [
      "Lična dostava i montaža u Novom Sadu",
      "Ekskluzivna drvena govornica",
      "Elegantno uputstvo za goste",
      "Svi audio snimci za 48h + highlights",
      "Personalizovana audio dobrodošlica",
    ],
    cta: "Želim Premium paket",
    popular: true,
  },
];

const Packages: React.FC = () => {
  return (
    <section id="paketi" className="py-16 sm:py-24 md:py-32 bg-[#F5F4DC]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16 md:mb-24">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif text-[#232323] mb-6">
            Odaberite svoje iskustvo
          </h2>
          <p className="text-lg text-[#232323]/50 max-w-2xl mx-auto">
            Oba paketa uključuju neograničen broj poruka i trajno vlasništvo nad
            svim snimcima.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative p-6 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-white border-2 ${pkg.popular ? "border-[#AE343F] shadow-2xl md:scale-[1.02] lg:scale-[1.05] z-10" : "border-transparent shadow-xl"}`}
            >
              {pkg.popular && (
                <div className="absolute text-center -top-4 sm:-top-5 md:-top-6 left-1/2 -translate-x-1/2 bg-[#AE343F] text-[#F5F4DC] px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full text-xs font-bold uppercase tracking-widest">
                  Preporuka Mladenaca
                </div>
              )}
              <div className="mb-6 sm:mb-8 md:mb-10 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#F5F4DC] rounded-2xl md:rounded-3xl flex items-center justify-center">
                {pkg.icon}
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#232323] mb-6 sm:mb-8">
                {pkg.name}
              </h3>
              <ul className="space-y-3 sm:space-y-4 md:space-y-6 mb-8 sm:mb-10 md:mb-12">
                {pkg.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base md:text-lg font-light text-[#232323]"
                  >
                    <Check size={20} className="text-[#AE343F] flex-shrink-0" />{" "}
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/#kontakt"
                className={`btn btn-lg w-full rounded-2xl font-bold ${pkg.popular ? "bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] border-none" : "bg-[#232323] hover:bg-[#1a1a1a] text-[#F5F4DC] border-none"}`}
              >
                {pkg.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Packages;
