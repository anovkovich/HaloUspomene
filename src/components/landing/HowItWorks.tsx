import React from "react";

const steps = [
  {
    number: "01",
    title: "Postavljanje",
    description:
      "Naš tim postavlja retro telefon na dogovoreno mesto sa elegantnim uputstvom.",
  },
  {
    number: "02",
    title: "Snimanje Poruka",
    description:
      "Gosti podižu slušalicu i nakon vašeg pozdrava ostavljaju svoju čestitku.",
  },
  {
    number: "03",
    title: "Večne Uspomene",
    description:
      "U roku od 48h dobijate sve audio fajlove u vašem digitalnom albumu.",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="py-32 bg-[#AE343F] text-[#F5F4DC] overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div>
            <h2 className="text-5xl md:text-8xl font-serif mb-6 leading-none">
              Kako <br />
              <span className="text-[#232323] italic">funkcioniše?</span>
            </h2>
            <div className="w-32 h-1.5 bg-[#232323]"></div>
          </div>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[#F5F4DC]/10"></div>
          <div className="space-y-32">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-12`}
              >
                <div className="flex-1 text-center md:text-left">
                  <div
                    className={`flex flex-col ${index % 2 === 0 ? "md:items-end" : "md:items-start"}`}
                  >
                    <span className="text-[12rem] font-serif font-black text-[#232323]/10 leading-none">
                      {step.number}
                    </span>
                    <div className="mt-[-4rem] relative z-10">
                      <h3 className="text-4xl font-serif mb-6">{step.title}</h3>
                      <p
                        className={`text-[#F5F4DC]/70 text-xl font-light ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-[#232323] ring-[16px] ring-[#AE343F]"></div>
                <div className="flex-1 hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
