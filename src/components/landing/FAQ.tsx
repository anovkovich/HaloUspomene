import React from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Osnovno
  {
    category: "Osnovno",
    question: "Šta je audio guest book?",
    answer:
      "Audio guest book je vintage telefon koji omogućava gostima na venčanju da podignu slušalicu i ostave glasovnu poruku za mladence. Umesto klasične knjige utisaka gde se piše, ovde gosti govore — i te audio poruke se čuvaju zauvek. HALO Uspomene nudi ovu uslugu širom Srbije sa dostavom u sve gradove.",
  },
  {
    category: "Osnovno",
    question: "Kako funkcioniše audio guest book na venčanju?",
    answer:
      "Vrlo jednostavno: telefon se postavi na vidno mesto u sali (mi obezbeđujemo uputstvo i opciono drvenu govornicu). Gost podigne slušalicu, sačeka ton, i ostavi poruku. Sve poruke se automatski snimaju u visokom kvalitetu. Nakon venčanja, dobijate digitalni album sa svim snimcima.",
  },
  {
    category: "Osnovno",
    question: "Koliko poruka gosti mogu da ostave?",
    answer:
      "Nema ograničenja! U proseku, na venčanjima sa 150-200 gostiju dobijemo između 50 i 100 poruka. Svaka poruka može trajati koliko god gost želi — od kratke čestitke do duže priče ili pesme.",
  },
  {
    category: "Osnovno",
    question: "Da li gosti znaju kako da koriste telefon?",
    answer:
      "Da! Uz svaki telefon ide elegantno uputstvo koje se postavlja pored aparata. Štaviše, vintage telefon je toliko intuitivan da gosti svih generacija — od dece do baka i deka — lako ostave poruku. To je upravo ono što čini iskustvo posebnim.",
  },
  // Dostava
  {
    category: "Dostava",
    question: "Da li dostavljate u Beograd, Novi Sad i ostale gradove?",
    answer:
      "Da! HALO Uspomene pokriva celu Srbiju. U Novom Sadu nudimo ličnu dostavu i instalaciju, dok za Beograd, Niš, Kragujevac, Suboticu i sve ostale gradove koristimo pouzdanu kurirsku službu sa osiguranjem pošiljke.",
  },
  {
    category: "Dostava",
    question: "Koliko unapred treba da rezervišem?",
    answer:
      "Preporučujemo rezervaciju najmanje 3-4 nedelje pre venčanja kako bismo osigurali dostupnost za vaš datum. U sezoni venčanja (maj-oktobar) je poželjno i ranije. Kontaktirajte nas čim odredite datum!",
  },
  {
    category: "Dostava",
    question: "Kako se telefon vraća nakon venčanja?",
    answer:
      "Za Essential paket, telefon šaljete nazad kurirskom službom u istoj kutiji u kojoj ste ga primili — mi pokrivamo troškove povratne dostave. Za Full Service paket, lično dolazimo po telefon i brinemo o svemu.",
  },
  // Tehnička pitanja
  {
    category: "Tehnička pitanja",
    question: "U kom formatu dobijam audio snimke?",
    answer:
      "Sve poruke dobijate u digitalnom formatu visokog kvaliteta (MP3/WAV). Šaljemo ih putem linka za preuzimanje u roku od 3-5 radnih dana nakon venčanja. Full Service paket uključuje i uređen digitalni album sa imenima govornika.",
  },
  {
    category: "Tehnička pitanja",
    question: "Da li telefon treba struju ili WiFi?",
    answer:
      "Telefon radi na bateriju koja traje celu noć — nema potrebe za strujom niti WiFi konekcijom. Jednostavno ga postavite gde želite u sali i on je spreman za korišćenje.",
  },
  {
    category: "Tehnička pitanja",
    question: "Šta ako se telefon pokvari na venčanju?",
    answer:
      "Naši telefoni prolaze detaljnu proveru pre svake dostave. U retkom slučaju tehničkog problema, naš tim je dostupan telefonom tokom celog događaja. Za Full Service paket, naš tehničar je prisutan na licu mesta.",
  },
  // Cene
  {
    category: "Cene",
    question: "Koliko košta iznajmljivanje audio guest book telefona?",
    answer:
      "Nudimo dva paketa: Essential paket sa kurirskom dostavom i osnovnom opremom, i Full Service paket sa ličnom dostavom, drvenom govornicom, personalizacijom i uređenim digitalnim albumom. Tačne cene zavise od lokacije i datuma — kontaktirajte nas za ponudu.",
  },
  {
    category: "Cene",
    question: "Da li postoji depozit ili kaucija?",
    answer:
      "Da, tražimo depozit prilikom rezervacije koji garantuje vaš termin. Depozit se vraća u celosti nakon što telefon bude vraćen u ispravnom stanju. Sve detalje o uslovima možete pronaći u našim opštim uslovima najma.",
  },
  {
    category: "Cene",
    question: "Da li mogu da koristim audio guest book za rođendan ili drugi događaj?",
    answer:
      "Apsolutno! Iako su venčanja naš primarni fokus, audio guest book je savršen i za rođendane, godišnjice, proslave mature, korporativne događaje i svaku priliku gde želite da sačuvate glasove svojih najdražih.",
  },
];

const categories = ["Osnovno", "Dostava", "Tehnička pitanja", "Cene"];

const FAQ: React.FC = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section
      id="faq"
      className="py-16 sm:py-24 md:py-32 bg-white relative overflow-hidden"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="absolute top-0 right-0 w-64 h-64 bg-[#AE343F]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
            Česta pitanja
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
            Sve što želite da znate
          </h2>
          <p className="text-lg text-[#232323]/50 max-w-2xl mx-auto">
            Odgovori na najčešća pitanja o audio guest book usluzi, dostavi,
            cenama i tehničkim detaljima.
          </p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-10 last:mb-0">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#AE343F] mb-4 pl-1">
              {category}
            </h3>
            <div className="space-y-3">
              {faqData
                .filter((item) => item.category === category)
                .map((item, index) => (
                  <div
                    key={index}
                    className="collapse collapse-arrow bg-[#faf9f6] rounded-2xl border border-stone-100"
                  >
                    <input type="checkbox" />
                    <div className="collapse-title text-base sm:text-lg font-medium text-[#232323] pr-12">
                      {item.question}
                    </div>
                    <div className="collapse-content">
                      <p className="text-[#232323]/60 leading-relaxed pt-2">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
