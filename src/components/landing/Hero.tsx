import React from "react";
import { ArrowRight, Phone, Sparkles } from "lucide-react";

const Hero: React.FC = () => {
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
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .hero-text { animation: fadeInLeft 0.8s ease-out both; }
        .hero-image { animation: fadeInScale 0.8s ease-out 0.2s both; }
        .hero-badge { animation: float 5s ease-in-out infinite; }
      `}</style>

      <div className="absolute top-[-10%] right-[-5%] w-[70%] sm:w-[60%] md:w-[50%] h-[70%] bg-[#AE343F]/5 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] sm:w-[50%] md:w-[40%] h-[60%] bg-[#AE343F]/10 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] -z-10" />

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div className="hero-text">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#AE343F]/10 text-[#AE343F] rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-8">
              <Sparkles size={14} className="animate-pulse" />
              Vaš Dan Zaslužuje Više Od Fotografija
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl  font-serif text-[#232323] leading-none mb-8">
              Reči koje postaju
              <br />
              <span className="italic text-[#AE343F] font-medium">
                uspomena
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#232323]/60 mb-8 sm:mb-10 md:mb-12 max-w-lg leading-relaxed font-light">
              Zamislite da kroz nekoliko godina ponovo čujete kako vam baka
              čestita venčanje. Mi brinemo o svakom detalju, a vi samo uživajte
              u najlepšem danu svog života.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <a
                href="/#kontakt"
                className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] btn-lg rounded-full px-12 shadow-2xl shadow-[#AE343F]/30 group border-none"
              >
                Zakažite konsultacije
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1.5 transition-transform"
                />
              </a>
              <a
                href="/#proces"
                className="btn btn-outline border-[#232323]/20 text-[#232323] hover:bg-[#232323] hover:text-[#F5F4DC] hover:border-[#232323] btn-lg rounded-full px-12"
              >
                Otkrijte kako
              </a>
            </div>
          </div>

          <div className="relative hero-image">
            {/* <div className="relative z-10 rounded-[3rem] overflow-hidden border-[16px] border-white shadow-2xl transform hover:scale-[1.02] transition-transform duration-700"> */}
            <div className="transform rotate-0 md:hover:rotate-2 md:hover:scale-[1.05] transition-transform duration-700">
              <img
                src="/images/phone.png"
                alt="HALO Uspomene vintage retro telefon za audio guest book na venčanju u Srbiji"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* </div> */}

            <div className="hero-badge absolute hidden lg:flex -bottom-10 -left-10 z-20 bg-[#F5F4DC] p-6 rounded-[2rem] shadow-2xl items-center gap-5 border border-white/20 backdrop-blur-sm">
              <div className="w-16 h-16 bg-[#AE343F] rounded-2xl flex items-center justify-center text-[#F5F4DC] shadow-lg shadow-[#AE343F]/20">
                <Phone size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#AE343F] uppercase tracking-[0.2em] mb-1">
                  Model telefona:
                </p>
                <p className="text-lg font-serif font-bold text-[#232323]">
                  Vintage - Rotary Black
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
