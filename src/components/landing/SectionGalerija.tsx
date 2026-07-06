import React from "react";
import Link from "next/link";
import { QrCode, Camera, FolderDown, ArrowRight, Images } from "lucide-react";
import { formatPrice, pricing } from "@/data/pricing";

const steps = [
  {
    icon: <QrCode size={20} />,
    title: "Gosti skeniraju QR",
    desc: "Kod na zahvalnici ili stolu — bez aplikacije.",
  },
  {
    icon: <Camera size={20} />,
    title: "Dodaju svoje slike",
    desc: "Fotografije direktno sa telefona, tokom i posle slavlja.",
  },
  {
    icon: <FolderDown size={20} />,
    title: "Vi preuzmete sve",
    desc: "Cela galerija na jednom mestu — pojedinačno ili kao ZIP.",
  },
];

const SectionGalerija: React.FC = () => {
  const price = pricing.pozivnica.galerija.price;

  return (
    <section
      id="qr-galerija"
      className="py-16 sm:py-20 md:py-24 bg-white relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
            QR foto galerija
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight mb-5">
            Sve slike gostiju sa venčanja{" "}
            <span className="italic text-[#AE343F]">na jednom mestu</span>.
          </h2>
          <p className="text-base sm:text-lg text-[#232323]/60 leading-relaxed">
            Najlepši, iskreni kadrovi obično ostanu zaboravljeni po telefonima
            gostiju. Uz QR galeriju, gosti sami dodaju svoje fotografije — a vi
            kasnije preuzmete celu galeriju.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6 max-w-4xl mx-auto mb-10">
          {steps.map((s) => (
            <div
              key={s.title}
              className="p-6 rounded-2xl sm:rounded-3xl bg-[#f5f4dc]/50 border border-[#232323]/5 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mx-auto mb-4">
                {s.icon}
              </div>
              <h3 className="font-serif text-lg text-[#232323] mb-1.5">
                {s.title}
              </h3>
              <p className="text-sm text-[#232323]/55 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <span className="inline-flex items-center gap-2 text-sm text-[#232323]/60">
            <Images size={16} className="text-[#AE343F]" />
            Bez aplikacije · radi na iPhone i Android · od {formatPrice(price)}
          </span>
          <Link
            href="/qr-galerija-slika-sa-vencanja"
            className="btn btn-sm bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] rounded-full px-6 border-none"
            data-track="cta_click"
            data-track-cta-name="qr_galerija_saznaj"
            data-track-cta-location="section_galerija"
          >
            Saznajte više
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SectionGalerija;
