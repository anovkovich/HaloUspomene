import React from "react";
import { Check, LayoutGrid, Mic, Phone, X } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
import CtaButton from "@/components/ui/CtaButton";

/**
 * Spaja `PainPointSolution` i `Concept` — dve sekcije koje su nosile istu
 * poruku o ista tri proizvoda, obe bez ijednog poziva na akciju.
 */

const painPoints = [
  {
    icon: <Phone className="h-5 w-5" />,
    problem:
      "Gosti Vas zivkaju na telefon, Vi pamtite i beležite ko je šta rekao, pa Excel tabele i neuredni spiskovi — čista glavobolja.",
    solution:
      "Web pozivnica sa potvrdom dolaska. Gost potvrdi jednim klikom, a Vi spisak gledate uživo — ništa se ne pamti napamet.",
  },
  {
    icon: <LayoutGrid className="h-5 w-5" />,
    problem: "Gužva i spiskovi na ulazu, hostese koje ne stižu, nervozni gosti.",
    solution:
      "QR pano dobrodošlice: gost skenira kod i sam pronalazi svoje mesto. A ako zapne, hostesa mu na tabletu nađe sto za sekundu.",
  },
  {
    icon: <Mic className="h-5 w-5" />,
    problem:
      "Posle venčanja ostaju samo fotografije — a sećanje na atmosferu bledi.",
    solution:
      "Glasovne čestitke gostiju, snimljene tog dana. Pustite ih za godišnjicu i cela sala Vam se vrati — smeh, glasovi, uzbuđenje u glasu.",
  },
];

const WhyUs: React.FC = () => (
  <Section id="zasto-mi" tone="bela" size="default" width="siroka">
    <SectionHeader
      eyebrow="Zašto Halo Uspomene"
      title="Tri stvari koje"
      accent="rešavamo za Vas"
    />

    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {painPoints.map((point, idx) => (
        <Card
          key={idx}
          tone="bela"
          padding="lg"
          interactive
          className="group flex flex-col"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#AE343F]/10 text-[#AE343F] transition-colors group-hover:bg-[#AE343F]/15">
              {point.icon}
            </span>
            <span className="font-serif text-3xl font-black leading-none text-[#AE343F]/15">
              0{idx + 1}
            </span>
          </div>

          <div className="mb-4 flex-1">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#AE343F]/70">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#AE343F]/15">
                <X size={11} strokeWidth={3} />
              </span>
              Bez nas
            </p>
            <p className="text-sm leading-relaxed text-[#232323]/75">
              {point.problem}
            </p>
          </div>

          <div className="-mx-6 -mb-6 rounded-b-2xl border-t border-[#AE343F]/10 bg-[#F5F4DC]/60 px-6 py-5 sm:-mx-8 sm:-mb-8 sm:rounded-b-3xl sm:px-8">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700/80">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15">
                <Check size={11} className="text-emerald-600" strokeWidth={3} />
              </span>
              Sa Halo Uspomene
            </p>
            <p className="text-sm font-medium leading-relaxed text-[#232323]/85">
              {point.solution}
            </p>
          </div>
        </Card>
      ))}
    </div>

    {/* Poziv na akciju koji nijedna od dve spojene sekcije nije imala. */}
    <div className="mt-10 text-center">
      <CtaButton
        href="/cene"
        variant="primary"
        size="lg"
        track={{ name: "pogledajte_cene", location: "zasto_mi" }}
      >
        Pogledajte cene i pakete
      </CtaButton>
    </div>
  </Section>
);

export default WhyUs;
