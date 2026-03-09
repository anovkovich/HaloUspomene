import React from "react";
import { Heart, Infinity as InfinityIcon, HeartHandshake } from "lucide-react";

const points = [
  {
    icon: (
      <Heart
        className="text-[#AE343F] w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10"
        size={20}
      />
    ),
    title: "Iskrenost & Moć emocija",
    description:
      "Smeh dok vam kum čestita. Drhtaj u glasu Vaše majke kroz suze sreće. To su trenuci koje nijedna fotografija ne može da sačuva — ali glas može.",
  },
  {
    icon: (
      <InfinityIcon
        className="text-[#AE343F] w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10"
        size={20}
      />
    ),
    title: "Nasleđe za generacije",
    description:
      "Jednog dana pustićete svojoj deci glas njihovog dede na Vašoj svadbi, osmeh bake, porodičnu istoriju kroz sačuvan zvuk. Poklon koji je večan.",
  },
  {
    icon: (
      <HeartHandshake
        className="text-[#AE343F] w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10"
        size={20}
      />
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
      className="py-16 sm:py-24 md:py-32 bg-gradient-to-t from-[#f5f4dc] to-[#faf9f6] relative overflow-hidden"
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
            To je moguće uz naš retro telefon poznat i kao audio knjiga
            uspomena, telefon za poruke, audio spomenar ili retro telefon sa
            rotirajućim brojčanikom.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 md:gap-12">
          {points.map((point) => (
            <div
              key={point.title}
              className="group p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-white to-[#F5F4DC]/40 border-2 border-[#AE343F]/40 hover:border-[#AE343F]/80 hover:shadow-2xl hover:shadow-[#AE343F]/20 md:hover:-translate-y-3 transition-all duration-500"
            >
              {/* Mobile: icon + title in one row */}
              <div className="flex items-center gap-3 mb-3 sm:block">
                <div className="p-3 sm:p-7 bg-gradient-to-br from-[#AE343F]/10 to-[#AE343F]/5 rounded-xl sm:rounded-2xl inline-flex sm:mb-8 shadow-md group-hover:shadow-lg group-hover:from-[#AE343F]/20 group-hover:to-[#AE343F]/10 transition-all shrink-0">
                  {point.icon}
                </div>
                <h3 className="text-base font-serif font-bold text-[#232323] sm:hidden">
                  {point.title}
                </h3>
              </div>
              {/* Desktop: title below icon */}
              <h3 className="hidden sm:block text-2xl md:text-3xl font-serif font-bold mb-4 text-[#AE343F] group-hover:text-[#232323] transition-colors">
                {point.title}
              </h3>
              <p className="text-[#232323]/70 leading-relaxed font-light text-sm sm:text-base md:text-lg">
                {point.description}
              </p>
              <div className="mt-6 h-1 w-12 bg-gradient-to-r from-[#AE343F] to-[#AE343F]/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Concept;
