export interface Location {
  slug: string;
  name: string;
  region: string;
  deliveryType: "Lična dostava" | "Kurirska dostava";
  deliveryTime: string;
  description: string;
  shortDescription: string;
  popularVenues: string[];
  localFaq: { question: string; answer: string }[];
  testimonialIds: number[];
}

export const locations: Location[] = [
  {
    slug: "beograd",
    name: "Beograd",
    region: "Centralna Srbija",
    deliveryType: "Kurirska dostava",
    deliveryTime: "1-2 radna dana",
    description:
      "HALO Uspomene nudi audio guest book uslugu za venčanja u Beogradu i okolini. Kao glavni grad Srbije sa najvećim brojem venčanja godišnje, Beograd je naše najtraženije tržište. Dostava se vrši putem kurirske službe — telefon stiže direktno na vašu adresu.",
    shortDescription:
      "Audio guest book za venčanja u Beogradu — telefon na adresi za 2 dana.",
    popularVenues: [
      "Restoran Madera",
      "Hotel Hyatt Regency",
      "Svečana sala Skupštine grada",
      "Restoran Kalemegdanska Terasa",
    ],
    localFaq: [
      {
        question: "Da li HALO Uspomene dostavlja audio guest book u Beograd?",
        answer:
          "Da! Dostavljamo u Beograd i sve beogradske opštine putem kurirske službe. Telefon stiže 2 dana pre venčanja direktno na vašu adresu.",
      },
      {
        question: "Koliko košta dostava audio guest book-a u Beograd?",
        answer:
          "Dostava u Beograd je po standardnoj ceni dostave paketa bez otkupa u Srbiji, a povratnu dostavu ne plaćate!",
      },
      {
        question:
          "Da li nudite Full Service paket sa ličnom dostavom u Beogradu?",
        answer:
          "Trenutno ličnu dostavu i instalaciju nudimo u Novom Sadu. Za Beograd je dostupan Essential paket sa detaljnim uputstvom za jednostavno postavljanje.",
      },
    ],
    testimonialIds: [],
  },
  {
    slug: "novi-sad",
    name: "Novi Sad",
    region: "Vojvodina",
    deliveryType: "Lična dostava",
    deliveryTime: "na dan proslave ili dan pre, po dogovoru",
    description:
      "HALO Uspomene ima sedište u Novom Sadu, što znači da ovde nudimo kompletnu Full Service uslugu — ličnu dostavu, profesionalnu montažu, ekskluzivnu drvenu govornicu (mini & maxi). Novi Sad je naš domaći grad i mesto gde je sve počelo.",
    shortDescription:
      "Audio guest book sa ličnom dostavom i instalacijom u Novom Sadu — dostupan Full Service.",
    popularVenues: [
      "Restoran Aqua Doria",
      "Čarda Ribarsko Ostrvo",
      "Hotel Sheraton",
      "Salaš 137",
    ],
    localFaq: [
      {
        question:
          "Da li je Full Service paket dostupan za venčanja u Novom Sadu?",
        answer:
          "Da! Novi Sad je naš domaći grad i jedini grad gde trenutno nudimo Full Service paket sa ličnom dostavom, profesionalnom montažom, drvenom govornicom.",
      },
      {
        question: "Koliko košta audio guest book za venčanje u Novom Sadu?",
        answer:
          "U Novom Sadu su dostupna oba paketa — Essential i Full Service. Kontaktirajte nas za personalizovanu ponudu prilagođenu vašem datumu i lokaciji.",
      },
      {
        question: "Da li pokrivate i okolinu Novog Sada?",
        answer:
          "Da! Ličnu dostavu nudimo u Novom Sadu i okolini do 20km — uključujući Sremske Karlovce, Futog, Veternik i okolne salaše.",
      },
    ],
    testimonialIds: [1, 2],
  },
  {
    slug: "subotica",
    name: "Subotica",
    region: "Vojvodina",
    deliveryType: "Kurirska dostava",
    deliveryTime: "1-2 radna dana",
    description:
      "HALO Uspomene pokriva Suboticu i celu severnu Vojvodinu. Subotica, kao grad poznat po prelepoj arhitekturi i elegantnim venčanjima — audio guest book savršeno dopunjuje taj šarm sa retro telefonom na vašoj proslavi.",
    shortDescription:
      "Audio guest book za venčanja u Subotici — brza dostava za na području Vojvodine.",
    popularVenues: [
      "Hotel Galleria",
      "Restoran Bates",
      "Palić — Velika terasa",
      "Salaš 84",
    ],
    localFaq: [
      {
        question: "Da li dostavljate Halo govornicu u Suboticu?",
        answer:
          "Nažalost ne, govornica je trenutno dostupna samo uz ličnu dostavu u Novom Sadu. Kurirskom dostavom šaljemo samo telefon sa uputsvom.",
      },
      {
        question: "Da li je moguće lično preuzimanje za venčanja u Subotici?",
        answer:
          "Za takav vid saradnje nas možete kontaktirati pa cemo dogovoriti detalje.",
      },
      {
        question: "Da li pokrivate venčanja na Paliću?",
        answer:
          "Apsolutno! Palić, Subotica i sva okolna mesta su pokrivena kurirskom dostavom, telefon stiže direktno na Vašu adresu.",
      },
    ],
    testimonialIds: [],
  },
  {
    slug: "cacak",
    name: "Čačak",
    region: "Centralna Srbija",
    deliveryType: "Kurirska dostava",
    deliveryTime: "1-2 radna dana",
    description:
      "HALO Uspomene dostavlja audio guest book za venčanja u Čačku i okolini. Čakak je poznat po najveselije organizovanim svadbama — savršena kombinacija sa našim vintage telefonom koji će to veselje i radost sačuvati i oduševiti goste svih generacija.",
    shortDescription:
      "Audio guest book za proslave u Čačku — brza dostava i u okolini Čačka.",
    popularVenues: [
      "Hotel Čačak",
      "Restoran Rajska Vrata",
      "Etno kompleks Rajac",
      "Restoran Balkanski Gusto",
    ],
    localFaq: [
      {
        question:
          "Da li HALO Uspomene vrše dostavu u Čačak i koliko ranije treba da rezervišemo?",
        answer:
          "Da! Čačak i okolina su pokriveni kurirskom dostavom. Telefon stiže 2 dana pre venčanja ali je neophodno da ga rezervišete na vreme, najkasnije 3-4 nedelje pre venčanja.",
      },
      {
        question: "Da li je audio guest book popularan na venčanjima u Čačku?",
        answer:
          "Sve više parova iz Čačka bira audio guest book. Čačanske svadbe su poznate po toplini i autentičnosti — a naš telefon to sačuva zauvek u audio formatu.",
      },
      {
        question: "Da li pokrivate i manja mesta u okolini Čačka?",
        answer:
          "Da! Kurirska dostava pokriva celu Srbiju, uključujući sva manja mesta i u okolini Čačka.",
      },
    ],
    testimonialIds: [],
  },
  {
    slug: "kragujevac",
    name: "Kragujevac",
    region: "Šumadija",
    deliveryType: "Kurirska dostava",
    deliveryTime: "1-2 radna dana",
    description:
      "HALO Uspomene dostavlja svoj retro telefon za proslave u Kragujevcu i celoj Šumadiji. Grad poznat po velikim veseljima — savršena kombinacija sa našim vintage telefonom koji će oduševiti goste svih generacija.",
    shortDescription:
      "Audio guest book za proslave u Kragujevcu — zadovoljni klijenti.",
    popularVenues: [
      "Hotel Kragujevac",
      "Restoran Knez",
      "Hotel Šumarice",
      "Restoran Balkan",
    ],
    localFaq: [
      {
        question: "Da li HALO Uspomene isporučuju telefon u Kragujevac?",
        answer:
          "Da! I Kragujevac i cela Srbija su pokriveni kurirskom dostavom. Telefon stiže i na vreme, ali nažalost ne dostavljamo govornicu, samo telefon i uputstvo.",
      },
      {
        question:
          "Da li je audio guest book popularan na venčanjima u Kragujevcu?",
        answer:
          "Već nekoliko parova iz Kragujevca je rezervisalo naš audio guest book za ovu sezonu.",
      },
      {
        question: "Da li pokrivate i manja mesta u okolini Kragujevca?",
        answer:
          "Da! Kurirska dostava pokriva celu Srbiju, uključujući sva manja mesta u okolini Kragujevca.",
      },
    ],
    testimonialIds: [3],
  },
  {
    slug: "nis",
    name: "Niš",
    region: "Južna Srbija",
    deliveryType: "Kurirska dostava",
    deliveryTime: "1-2 radna dana",
    description:
      "HALO Uspomene pokriva Niš i celu južnu Srbiju. Kao treći grad po veličini u Srbiji, Niš ima bogatu tradiciju velikih svadbi, a sada i mogućnost da te svadbe budu još posebnije sa napu uslugu. Kurirska služba dostavlja naš retro telefon direktno na vašu adresu.",
    shortDescription:
      "Audio guest book za proslave u Nišu — brza dostava za celu južnu Srbiju!",
    popularVenues: [
      "Hotel Ambasador",
      "Restoran Stara Srbija",
      "Restoran Pleasure",
      "Hotel Tami Residence",
    ],
    localFaq: [
      {
        question: "Da li dostavljate telefon u Niš?",
        answer:
          "Da! Dostavljamo u Niš i celu južnu Srbiju putem kurirske službe. Telefon stiže 2 dana pre venčanja na vašu adresu.",
      },
      {
        question: "Koliko unapred treba da rezervišem za venčanje u Nišu?",
        answer:
          "Preporučujemo rezervaciju bar 3-4 nedelje unapred, a u sezoni (maj-septembar) i više, jer je broj telefona ograničen.",
      },
      {
        question: "Kako se telefon vraća nakon venčanja u Nišu?",
        answer:
          "Telefon šaljete nazad u istoj kutiji kurirskom službom — mi pokrivamo troškove povratne dostave. Rok za povratak je 2 radna dana nakon venčanja.",
      },
    ],
    testimonialIds: [4],
  },
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((loc) => loc.slug === slug);
}

export function getAllLocationSlugs(): string[] {
  return locations.map((loc) => loc.slug);
}
