import React from "react";
import Image from "next/image";
import { ArrowRight, Award } from "lucide-react";
import Link from "next/link";
import HeroInfoBadge from "./HeroInfoBadge";

function getSocialProofText(): string {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();

  // Peak season: June (5) - September (8)
  const isPeakSeason = month >= 5 && month <= 8;

  if (day <= 7) {
    return isPeakSeason ? "4 rezervacije" : "2 rezervacije";
  }

  if (day <= 22) {
    return isPeakSeason ? "9 rezervacija" : "5 rezervacija";
  }

  return isPeakSeason ? "10+ rezervacija" : "9+ rezervacija";
}

const Hero: React.FC = () => {
  const socialProofText = getSocialProofText();

  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-[#F5F4DC]">
      {/* Inline styles for animations */}
      <style>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .hero-text { animation: fadeInLeft 0.8s ease-out both; }
        .hero-image { animation: fadeInScale 0.8s ease-out 0.2s both; }
      `}</style>

      <div className="absolute top-[-10%] right-[-5%] w-[70%] sm:w-[60%] md:w-[50%] h-[70%] bg-[#AE343F]/5 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] sm:w-[50%] md:w-[40%] h-[60%] bg-[#AE343F]/10 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] -z-10" />

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div className="hero-text">
            <HeroInfoBadge />

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif text-[#232323] leading-none mb-8">
              Reči koje postaju
              <br />
              <span className="italic text-[#AE343F] font-medium">
                uspomena
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#232323]/60 mb-8 sm:mb-10 md:mb-12 max-w-lg leading-relaxed font-light">
              Sačuvajte glasove vaših najdražih zauvek. Putem našeg retro
              telefona na venčanju ili digitalne audio knjige utisaka — svaka
              poruka postaje uspomena koju ćete slušati godinama.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                href="/#kontakt"
                className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] btn-lg rounded-full px-12 shadow-2xl shadow-[#AE343F]/30 group border-none"
                data-track="cta_click"
                data-track-cta-name="zakazite_konsultacije"
                data-track-cta-location="hero"
              >
                Zakažite retro telefon
              </Link>
              <Link
                href="/napravi-pozivnicu"
                className="btn btn-outline border-[#232323]/20 text-[#232323] hover:bg-[#232323] hover:text-[#F5F4DC] hover:border-[#232323] btn-lg rounded-full px-12"
                data-track="cta_click"
                data-track-cta-name="napravi_pozivnicu"
                data-track-cta-location="hero"
              >
                Napravite pozivnicu
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1.5 transition-transform"
                />
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-3 mt-8 text-sm text-[#232323]/60">
              <span className="relative flex w-4 h-4 items-center justify-center flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-30"></span>
                <Award size={14} className="relative text-[#d4af37]" />
              </span>
              <span>
                <strong className="text-[#232323] font-semibold">
                  Najtraženije pozivnice
                </strong>{" "}
                za venčanja u Srbiji
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm text-[#232323]/60">
              <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 m-0.5 bg-green-500"></span>
                </span>
              </span>
              <span>
                <strong className="text-[#232323] font-semibold">
                  {socialProofText}
                </strong>{" "}
                retro telefona ovog meseca
              </span>
            </div>
          </div>

          <div className="relative hero-image">
            <div className="transform rotate-0 md:hover:rotate-2 md:hover:scale-[1.05] transition-transform duration-700">
              <Image
                src="/images/retro-telefon-i-website-pozinica.webp"
                alt="HALO Uspomene — retro telefon, digitalna pozivnica na mobilnom i raspored sedenja na laptopu"
                width={1466}
                height={597}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-auto object-cover"
                priority
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
