import React from "react";
import CarIcon from "../assets/svg/CarIcon";
import SuitcaseIcon from "../assets/svg/SuitcaseIcon";
import HouseIcon from "../assets/svg/HouseIcon";

const InsurancePackages = () => {
  const packages = [
    {
      title: "Pomoć na putu",
      icon: <CarIcon className="h-25 w-25 text-base-300" />,
      features: [
        "Saobraćajne nezgode",
        "Transport vozila",
        "Popravke na licu mesta",
      ],
      price: "10000",
      period: "din / godisnje",
    },
    {
      title: "Putno osiguranje",
      icon: <SuitcaseIcon className="h-25 w-25 text-base-300" />,
      features: ["Ambulantno lečenje", "Akutna zubobolja", "Sanitetski prevoz"],
      price: "100",
      period: "din / dnevno",
    },
    {
      title: "Osiguranje domaćinstava",
      icon: <HouseIcon className="h-25 w-25 text-base-300" />,
      features: [
        "Požar i provalna krađa",
        "Delimična i potpuna oštećenja",
        "Lom stakla",
      ],
      price: "1000",
      period: "din / mesečno",
    },
  ];

  return (
    <section className="bg-linear-to-b from-base-200 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#1d2939] mb-4">
            Odaberite osiguranje po vašoj meri
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Dostavićemo vam sve ponude osiguravajućih društava koje ispunjavaju
            vaše zahteve i tako vam obezbediti najbolju ponudu na tržištu.
          </p>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="card-body p-8">
                {/* Icon & Title Row */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <h3 className="text-xl font-bold">{pkg.title}</h3>
                  <div className="text-base-content">{pkg.icon}</div>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-10">
                  {pkg.features.map((feature, fIndex) => (
                    <li
                      key={fIndex}
                      className="flex items-center gap-3 text-gray-700 font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-5 h-5 text-success"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Pricing Section */}
                <div className="mt-auto flex items-baseline gap-2">
                  <span className="text-6xl font-black text-warning leading-none">
                    {pkg.price}
                  </span>
                  <div className="flex flex-col text-sm font-bold text-warning leading-tight">
                    <span>din /</span>
                    <span>{pkg.period.split("/ ")[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsurancePackages;
