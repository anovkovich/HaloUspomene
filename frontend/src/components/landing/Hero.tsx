import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-white py-20 lg:py-32">
      <div className="container relative z-10 mx-auto px-4 text-center">
        {/* MAIN TEXT */}
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-[#1d2939] md:text-6xl lg:text-7xl">
          Pronađite najbolje osiguranje <br /> po povoljnim cenama
        </h1>

        {/* SUBTEXT */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 md:text-xl leading-relaxed">
          Uporedite ponude, izaberite pravu polisu i kupite online
          <br className="hidden md:block" />
          brzo, jednostavno i potpuno transparentno. Bez skrivenih troškova.
        </p>

        {/* CTA BUTTON */}
        <Link
          href="/saznaj-vise"
          className="btn btn-primary border-none bg-primary rounded-full px-10 normal-case text-lg h-auto py-4 group"
        >
          Saznajte više
        </Link>
      </div>

      {/* BOTTOM WAVE */}
      <div className="absolute bottom-0 left-0 w-full rotate-180">
        <svg
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            // fill="#e0f2fe"
            className="fill-base-200"
            fillOpacity="1"
            d="M0,160L80,176C160,192,320,224,480,213.3C640,203,800,149,960,138.7C1120,128,1280,160,1360,176L1440,192L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
