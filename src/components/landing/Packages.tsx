import React from "react";
import { Check, Mail, Truck } from "lucide-react";

const packages = [
  {
    name: "Classic",
    icon: <Mail className="text-[#AE343F]" size={48} />,
    features: [
      "Iznajmljivanje retro telefona",
      "Slanje poštom (Srbija)",
      "Uputstvo (Poster)",
      "Digitalni fajlovi u 48h",
      "Zadržavanje 3 dana",
    ],
    cta: "Odaberi Classic",
    popular: false,
  },
  {
    name: "Premium",
    icon: <Truck className="text-[#AE343F]" size={48} />,
    features: [
      "Naša lična dostava i montaža",
      "Ekskluzivna drvena govornica",
      "Personalizovani Intro",
      "Digitalni album sa muzikom",
      "Video klipovi za Reels/TikTok",
    ],
    cta: "Rezerviši Premium",
    popular: true,
  },
];

const Packages: React.FC = () => {
  return (
    <section id="packages" className="py-32 bg-[#F5F4DC]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-serif text-[#232323] mb-6">
            Paketi Uspomena
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative p-12 rounded-[3rem] bg-white border-2 ${pkg.popular ? "border-[#AE343F] shadow-2xl scale-[1.05] z-10" : "border-transparent shadow-xl"}`}
            >
              {pkg.popular && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#AE343F] text-[#F5F4DC] px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest">
                  Najtraženije
                </div>
              )}
              <div className="mb-10 w-20 h-20 bg-[#F5F4DC] rounded-3xl flex items-center justify-center">
                {pkg.icon}
              </div>
              <h3 className="text-4xl font-serif text-[#232323] mb-8">{pkg.name}</h3>
              <ul className="space-y-6 mb-12">
                {pkg.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-4 text-lg font-light text-[#232323]"
                  >
                    <Check size={20} className="text-[#AE343F] flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <a
                href="#book"
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
