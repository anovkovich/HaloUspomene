import React from "react";
import { Heart, Infinity as InfinityIcon, HeartHandshake } from "lucide-react";

const points = [
  {
    icon: (
      <Heart className="text-[#AE343F] w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10" size={20} />
    ),
    title: "Iskrenost & Moć emocija",
    description:
      "Smeh dok vam kum čestita. Drhtaj u glasu Vaše majke kroz suze sreće. To su trenuci koje nijedna fotografija ne može da sačuva — ali glas može.",
  },
  {
    icon: (
      <InfinityIcon className="text-[#AE343F] w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10" size={20} />
    ),
    title: "Nasleđe za generacije",
    description:
      "Jednog dana pustićete svojoj deci glas njihovog dede na Vašoj svadbi, osmeh bake, porodičnu istoriju kroz sačuvan zvuk. Poklon koji je večan.",
  },
  {
    icon: (
      <HeartHandshake className="text-[#AE343F] w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10" size={20} />
    ),
    title: "Mi brinemo o svemu",
    description:
      "Tu smo za dogovor, tehničku podršku, sve do finalnih snimaka — brzo i lako, vaš jedini zadatak je da uživate. Za sve ostalo smo tu mi.",
  },
];

const Concept: React.FC = () => {
  return (
    <section
      id="zasto-mi"
      className="py-16 sm:py-24 md:py-32 bg-white relative overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 md:mb-24">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif text-[#232323] mb-8">
            Zašto parovi biraju{" "}
            <span className="italic text-[#AE343F]">nas</span>?
          </h2>
          <p className="text-xl text-[#232323]/50 leading-relaxed font-light">
            Jer znamo da je vaše venčanje jedinstveno i zaslužuje uspomene koje
            traju večno.
          </p>
          <p className="text-sm text-[#232323]/30 mt-3">
            To je moguće uz naš retro telefon poznat i kao audio knjiga utisaka,
            telefon za poruke, audio spomenar ili retro telefon sa rotirajućim
            brojčanikom.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 md:gap-12">
          {points.map((point) => (
            <div
              key={point.title}
              className="group p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] bg-[#F5F4DC]/30 border border-[#232323]/5 hover:border-[#AE343F]/20 hover:shadow-xl md:hover:-translate-y-2 transition-all duration-500"
            >
              {/* Mobile: icon + title in one row */}
              <div className="flex items-center gap-3 mb-3 sm:block">
                <div className="p-2.5 sm:p-6 bg-white rounded-xl sm:rounded-2xl inline-flex sm:mb-8 shadow-sm group-hover:shadow-md transition-shadow shrink-0">
                  {point.icon}
                </div>
                <h3 className="text-base font-serif text-[#232323] sm:hidden">
                  {point.title}
                </h3>
              </div>
              {/* Desktop: title below icon */}
              <h3 className="hidden sm:block text-2xl md:text-3xl font-serif mb-6 text-[#232323]">
                {point.title}
              </h3>
              <p className="text-[#232323]/60 leading-relaxed font-light text-sm sm:text-lg">
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
