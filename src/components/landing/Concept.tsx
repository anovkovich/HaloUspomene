import React from "react";
import { Sparkles, Heart, Infinity as InfinityIcon } from "lucide-react";

const points = [
  {
    icon: <Sparkles className="text-[#AE343F]" size={40} />,
    title: "Autentičnost Glasa",
    description:
      "Papir trpi sve, ali glas otkriva pravu iskrenost. Svaki drhtaj, osmeh i uzdah koji se čuje dok pričaju je trenutak koji ne bledi.",
  },
  {
    icon: <Heart className="text-[#AE343F]" size={40} />,
    title: "Emocija Trenutka",
    description:
      "Zamislite da za 20 godina ponovo čujete glas svoje bake ili najboljeg prijatelja koji vam čestita najvažniji dan u životu.",
  },
  {
    icon: <InfinityIcon className="text-[#AE343F]" size={40} />,
    title: "Digitalna Večnost",
    description:
      "Fotografije su za oči, a audio poruke su za dušu. Svi snimci ostaju u vašem trajnom vlasništvu u digitalnom formatu.",
  },
];

const Concept: React.FC = () => {
  return (
    <section id="concept" className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-serif text-[#232323] mb-8">
            Zašto baš <span className="italic text-[#AE343F]">zvuk</span>?
          </h2>
          <p className="text-xl text-[#232323]/50 leading-relaxed font-light">
            HALO Uspomene vraća intimnost i čaroliju glasa na vaše proslave.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {points.map((point) => (
            <div
              key={point.title}
              className="group p-10 rounded-[2.5rem] bg-[#F5F4DC]/30 border border-[#232323]/5 hover:border-[#AE343F]/20 hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className="mb-8 p-6 bg-white rounded-2xl inline-block shadow-sm group-hover:shadow-md transition-shadow">
                {point.icon}
              </div>
              <h3 className="text-3xl font-serif mb-6 text-[#232323]">
                {point.title}
              </h3>
              <p className="text-[#232323]/60 leading-relaxed font-light text-lg">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Concept;
