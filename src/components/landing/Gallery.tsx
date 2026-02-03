import React from "react";

const images = [
  {
    src: "/images/gallery/halo uspomene 2.png",
    alt: "Vintage telefon za audio guest book na venčanju",
    span: "sm:col-span-2 md:col-span-2",
  },
  {
    src: "/images/gallery/halo uspomene 3.png",
    alt: "Elegantna postavka audio guest book telefona",
    span: "sm:col-span-1 md:col-span-1",
  },
  {
    src: "/images/gallery/halo uspomene 1.png",
    alt: "Gosti ostavljaju audio poruke na venčanju",
    span: "sm:col-span-1 md:col-span-1",
  },
  {
    src: "/images/gallery/halo uspomene 4.png",
    alt: "Sačuvane audio uspomene sa venčanja",
    span: "sm:col-span-2 md:col-span-2",
  },
];

const Gallery: React.FC = () => {
  return (
    <section id="gallery" className="py-16 sm:py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className=" mb-10 sm:mb-14 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
            Trenuci koji govore
          </h2>
          <p className="text-lg text-[#232323]/50 ">
            Svako venčanje je priča za sebe, a naš telefon zauvek čuva baš Vašu
            jedinstvenu priču.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {images.map((img, index) => (
            <div
              key={index}
              className={`${img.span} overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] h-[240px] sm:h-[320px] md:h-[400px] lg:h-[500px] relative group`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
