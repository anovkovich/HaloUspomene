import React from "react";

const images = [
  {
    src: "https://images.unsplash.com/photo-1512446813985-4a0eb1736836?auto=format&fit=crop&q=80&w=1200",
    alt: "Detalj retro telefona",
    span: "md:col-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1520923642038-b4259ace9439?auto=format&fit=crop&q=80&w=800",
    alt: "Vintage ambijent",
    span: "md:col-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=800",
    alt: "Gosti na venčanju",
    span: "md:col-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=1200",
    alt: "Digitalne uspomene",
    span: "md:col-span-2",
  },
];

const Gallery: React.FC = () => {
  return (
    <section id="gallery" className="py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mb-20">
          <h2 className="text-5xl font-serif text-[#232323] mb-6">
            Pogledajte atmosferu
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {images.map((img, index) => (
            <div
              key={index}
              className={`${img.span} overflow-hidden rounded-[3rem] h-[400px] md:h-[500px] relative group`}
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
