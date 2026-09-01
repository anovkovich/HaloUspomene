import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MousePointerClick, Printer, QrCode } from "lucide-react";

const steps = [
  {
    icon: <MousePointerClick size={20} />,
    title: "Rasporedite goste",
    desc: "Pomoću našeg alata napravite šemu stolova i rasporedite goste.",
  },
  {
    icon: <Printer size={20} />,
    title: "Odštampajte QR Pano",
    desc: "Postavite elegantan pano sa QR kodom na ulaz u salu.",
  },
  {
    icon: <QrCode size={20} />,
    title: "Gosti pronalaze svoje mesto",
    desc: "Skeniraju, ukucaju svoje ime i pronalaze njihov sto.",
  },
];

const SectionRaspored: React.FC = () => {
  return (
    <section
      id="qr-pano"
      className="py-16 sm:py-20 md:py-24 bg-[#F5F4DC] relative"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 lg:items-end max-w-6xl mx-auto">
          {/* Image — below text on mobile, left column on desktop. Negative
              margin-bottom matches section's pb so image visually fills the
              cream area to the divider. */}
          <div className="relative z-20 order-last lg:order-first lg:self-end mx-auto sm:max-w-sm lg:max-w-none">
            <Image
              src="/images/pano.webp"
              alt="QR Pano dobrodošlice — gost skenira QR kod na ulazu u salu i pronalazi svoj sto"
              width={1200}
              height={1500}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="w-full h-auto object-contain block -mb-16 sm:-mb-20 md:-mb-24 drop-shadow-[0_20px_30px_rgba(0,0,0,0.08)]"
            />
          </div>

          {/* Text — right on desktop */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
              Pametan raspored sedenja
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight mb-5">
              QR Pano{" "}
              <span className="italic text-[#AE343F]">dobrodošlice</span>.
            </h2>
            <p className="text-base sm:text-lg text-[#232323]/65 leading-relaxed mb-8">
              Zaboravite na ručno crtanje stolova i na zbunjujuće liste na ulazu
              u salu. Tri jednostavna koraka da Vaše veče počinje bez gužve i
              haosa:
            </p>

            <div className="space-y-5 mb-8">
              {steps.map((step, i) => (
                <div key={step.title} className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-[#AE343F] text-[#F5F4DC] flex items-center justify-center shadow-lg shadow-[#AE343F]/30">
                      {step.icon}
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#d4af37] text-[#232323] text-[10px] font-black flex items-center justify-center">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-base sm:text-lg font-bold text-[#232323] mb-1">
                      {step.title}
                    </p>
                    <p className="text-sm text-[#232323]/60 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Link
                href="/qr-pano-dobrodoslice"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-xl shadow-[#AE343F]/20"
                data-track="cta_click"
                data-track-cta-name="qr_pano_saznaj"
                data-track-cta-location="section_raspored"
              >
                Saznajte više o QR Panou
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionRaspored;
