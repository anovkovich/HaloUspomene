import React from "react";
import { Phone, LayoutGrid, Mic, X, Check } from "lucide-react";

interface PainPoint {
  icon: React.ReactNode;
  problemLabel: string;
  solutionLabel: string;
  problemText: string;
  solutionText: string;
}

const painPoints: PainPoint[] = [
  {
    icon: <Phone className="w-5 h-5" />,
    problemLabel: "Bez nas",
    solutionLabel: "Sa Halo Uspomene",
    problemText:
      "Zivkanje gostiju zbog potvrda, Excel tabele ili gomila papria.",
    solutionText:
      "Web pozivnica sa potvrdom dolaska. Gosti na jednom mestu imaju sve, a vi pratite potvrde!",
  },
  {
    icon: <LayoutGrid className="w-5 h-5" />,
    problemLabel: "Bez nas",
    solutionLabel: "Sa Halo Uspomene",
    problemText:
      "Gužva i spiskovi na ulazu, hostese koje ne stižu, nervozni gosti.",
    solutionText:
      "QR Pano dobrodošlice. Gost skenira, ukuca ime — pronalazi broj stola gde je raspoređen.",
  },
  {
    icon: <Mic className="w-5 h-5" />,
    problemLabel: "Bez nas",
    solutionLabel: "Sa Halo Uspomene",
    problemText: "Posle venčanja ostaju samo fotografije — a emocije blede.",
    solutionText:
      "Audio uspomene. Glasovne čestitke koje slušate godinama — retro telefon ili sa mobilnog.",
  },
];

const PainPointSolution: React.FC = () => {
  return (
    <section
      id="problem"
      className="py-16 sm:py-20 md:py-24 bg-[#F5F4DC] relative"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
            Zašto Halo Uspomene
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
            Tri stvari koje{" "}
            <span className="italic text-[#AE343F]">rešavamo za Vas</span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
          {painPoints.map((point, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-stone-200 hover:border-[#AE343F]/40 hover:shadow-xl hover:shadow-[#AE343F]/10 transition-all duration-500 overflow-hidden grid grid-rows-[auto_1fr_auto]"
            >
              {/* Row 1 — icon + number */}
              <div className="flex items-center justify-between px-6 sm:px-7 pt-5 pb-3">
                <div className="w-11 h-11 rounded-xl bg-[#AE343F]/10 group-hover:bg-[#AE343F]/15 flex items-center justify-center text-[#AE343F] transition-colors">
                  {point.icon}
                </div>
                <span className="text-3xl sm:text-4xl font-serif font-black text-[#AE343F]/15 leading-none">
                  0{idx + 1}
                </span>
              </div>

              {/* Row 2 — problem (1fr expands so dividers align across cards) */}
              <div className="px-6 sm:px-7 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#AE343F]/15 flex items-center justify-center">
                    <X size={11} className="text-[#AE343F]" strokeWidth={3} />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#AE343F]/70">
                    {point.problemLabel}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-[#232323]/75 leading-relaxed">
                  {point.problemText}
                </p>
              </div>

              {/* Row 3 — solution. Min-h applies only on md+ (3-col layout)
                  so solution dividers line up across cards. On mobile each
                  card is on its own row — no alignment needed, no padding
                  filler. */}
              <div className="px-6 sm:px-7 pt-4 pb-6 sm:pb-7 bg-[#f5f4dc]/60 border-t border-[#AE343F]/10 md:min-h-[10rem]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <Check
                      size={11}
                      className="text-emerald-600"
                      strokeWidth={3}
                    />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700/80">
                    {point.solutionLabel}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-[#232323]/85 leading-relaxed font-medium">
                  {point.solutionText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPointSolution;
