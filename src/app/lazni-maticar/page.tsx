import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Mic,
  Heart,
  Laugh,
  Sparkles,
  Clock,
  MapPin,
  Scale,
  PartyPopper,
  CalendarHeart,
  FileCheck,
  Plane,
  Trees,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ServiceLeadForm from "@/components/forms/ServiceLeadForm";
import {
  priceFrom,
  pricingApproximate,
  packages,
  includedAlways,
  extras,
  toneOptions,
  occasionOptions,
} from "@/data/lazni-maticar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";
const pageUrl = `${siteUrl}/lazni-maticar`;

export const metadata: Metadata = {
  title: "Lažni matičar — simbolična ceremonija i cene",
  description: `Glumac u ulozi matičara vodi ceremoniju po vašoj priči — emotivnu ili šaljivu. Cene od ${priceFrom} EUR, dolazimo u celu Srbiju. Saznajte kako izgleda i zakažite termin.`,
  keywords: [
    "lažni matičar",
    "lazni maticar",
    "lažni matičar Beograd",
    "lažni matičar cena",
    "koliko košta lažni matičar",
    "lažni matičar za svadbu",
    "lažni matičar za venčanje",
    "šaljivi matičar",
    "komični matičar",
    "simbolični matičar",
    "glumac matičar",
    "simbolična ceremonija venčanja",
    "simbolično venčanje",
    "ceremonija venčanja ako smo već venčani",
    "obnova zaveta",
    "obnavljanje bračnih zaveta",
    "venčanje u prirodi bez matičara",
    "matičar izlazak na teren",
    "iznenađenje za mladence",
    "program za svadbu",
    "voditelj ceremonije venčanja",
    "lažni matičar Novi Sad",
    "lažni matičar Niš",
  ],
  openGraph: {
    title: "Lažni matičar — simbolična ceremonija venčanja | HALO Uspomene",
    description:
      "Ceremonija koju vodi glumac u ulozi matičara, po vašoj priči — emotivna ili šaljiva. Cene, trajanje i odgovori na sva pitanja.",
    type: "website",
    url: pageUrl,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lažni matičar — simbolična ceremonija venčanja",
    description:
      "Glumac u ulozi matičara vodi ceremoniju po vašoj priči. Cene i dostupnost za celu Srbiju.",
  },
  alternates: {
    canonical: pageUrl,
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SADRŽAJ
═══════════════════════════════════════════════════════════════════════════ */

const trustPoints = [
  {
    icon: <Mic size={24} />,
    title: "Govor po vašoj priči",
    desc: "Ne šablon. Tekst se piše prema tome kako ste se upoznali, i vi ga odobravate pre nego što se izgovori pred gostima.",
  },
  {
    icon: <Heart size={24} />,
    title: "Vi birate ton",
    desc: "Emotivno do suza, urnebesno smešno, ili kombinovano — počne kao prava ceremonija, pa se prelomi u šalu.",
  },
  {
    icon: <Sparkles size={24} />,
    title: "Izgleda kao pravo",
    desc: "Odelo, lenta, knjiga, pečat i mikrofon. Dok ne kaže drugačije, gosti veruju da gledaju zvaničnu ceremoniju.",
  },
  {
    icon: <MapPin size={24} />,
    title: "Dolazimo gde vi kažete",
    desc: "Salaš, vinarija, dvorište, plaža, planina, terasa restorana — bez papirologije i bez odobrenja lokacije.",
  },
];

const ceremonyFlow = [
  {
    n: "01",
    title: "Dogovor pre svega",
    desc: "Pričamo o vama, o gostima i o tome koliko daleko šala sme da ide. Vi kažete šta je tabu tema, mi to poštujemo.",
  },
  {
    n: "02",
    title: "Ulazak i zvanični deo",
    desc: "Matičar staje pred goste, otvara knjigu i počinje kao na pravom venčanju. Ovo je trenutak kada svi ustanu.",
  },
  {
    n: "03",
    title: "Vaša priča",
    desc: "Govor sa detaljima koje zna samo uža ekipa. Ovde emotivna varijanta izmami suze, a šaljiva prvi veliki smeh.",
  },
  {
    n: "04",
    title: "Zaveti i veliko DA",
    desc: "Razmena zaveta, simbolično potpisivanje i proglašenje — uz aplauz, fotografije i pokoju maramicu.",
  },
];

const scenarios = [
  {
    icon: <Trees size={26} />,
    title: "Matičar ne izlazi na vašu lokaciju",
    desc: "Matična služba izlazi na teren samo uz opravdane razloge i na odobrene lokacije. Salaš, livada, dvorište ili plaža najčešće ne prolaze — a baš tamo želite ceremoniju.",
  },
  {
    icon: <Plane size={26} />,
    title: "Venčali ste se u inostranstvu",
    desc: "Papiri su odavno gotovi, ali porodica i prijatelji u Srbiji nisu videli ništa. Ovo je najčešći razlog zbog kog se ceremonija naručuje.",
  },
  {
    icon: <CalendarHeart size={26} />,
    title: "Obnova zaveta i godišnjice",
    desc: "Deset, dvadeset ili trideset godina braka — ista pitanja, isti odgovori, samo sa decom u prvom redu. Za mnoge parove emotivnije nego prvi put.",
  },
  {
    icon: <FileCheck size={26} />,
    title: "Građansko venčanje ste obavili pre svadbe",
    desc: "Potpisali ste u opštini nekoliko dana ili nedelja ranije, u uskom krugu. Na dan svadbe zato nema ceremonije — gosti dođu pravo na večeru. Ovo je način da taj trenutak ipak dobiju.",
  },
];

const cities = [
  {
    name: "Beograd",
    desc: "Matična lokacija — najbrže potvrđujemo termin i nema putnih troškova. Pokrivamo sve opštine i sale u okolini grada.",
  },
  {
    name: "Novi Sad i Vojvodina",
    desc: "Salaši oko Novog Sada su među najčešćim lokacijama za simboličnu ceremoniju, upravo zato što matičar tamo po pravilu ne izlazi.",
  },
  {
    name: "Niš, Kragujevac i centralna Srbija",
    desc: "Dolazimo i tamo, uz dogovor o putnim troškovima. Za termine van šireg beogradskog kruga javite se ranije.",
  },
  {
    name: "Vinarije, planine i priroda",
    desc: "Zlatibor, Fruška gora, Tara, vinarije u Šumadiji i Negotinskoj krajini — lokacija ne mora da bude na spisku matične službe da bismo došli.",
  },
];

const faqItems = [
  {
    q: "Da li je venčanje sa lažnim matičarem pravno važeće?",
    a: "Nije, i to nikada ne krijemo. U Srbiji je brak pravno zaključen samo pred ovlašćenim matičarem u postupku koji propisuje zakon. Naša ceremonija je simbolična — sve ono što se vidi i pamti, bez pravnog dejstva. Zvanični deo obavite u opštini pre ili posle proslave, kad vam odgovara.",
  },
  {
    q: "Da li je to uopšte legalno?",
    a: "Jeste. Reč je o ceremoniji i nastupu, a ne o predstavljanju kao državni službenik radi sticanja prava. Niko ne potpisuje pravni dokument i niko ne tvrdi da je brak time zaključen. To je ista vrsta programa kao voditelj ili glumac na proslavi.",
  },
  {
    q: "Zašto ne dođe pravi matičar na našu lokaciju?",
    a: "Matična služba izlazi na teren samo uz opravdane razloge i isključivo na lokacije koje odobri. Privatno dvorište, salaš, livada ili plaža najčešće nisu na tom spisku, a izlazak na teren se i posebno naplaćuje. Simbolična ceremonija nema nijedno od tih ograničenja.",
  },
  {
    q: `Koliko košta lažni matičar?`,
    a: `Kod nas cena počinje od ${priceFrom} € za ceremoniju.${pricingApproximate ? " Cifra je orijentaciona jer zavisi od lokacije, trajanja i toga koliko je scenario složen — tačnu ponudu šaljemo na upit, bez obaveze." : ""} Dolazak van Beograda se dogovara posebno, prema udaljenosti. Poređenja radi, izlazak pravog matičara na teren u Beogradu naplaćuje se i do 18.212 dinara, a i tada samo na odobrenu lokaciju.`,
  },
  {
    q: "Koliko ceremonija traje?",
    a: "Najčešće 10 do 15 minuta, koliko traje i zvanični čin. Može kraće ako želite samo ključni trenutak, ili duže — do četrdesetak minuta — ako u program ulaze govori gostiju, muzika i razmena zaveta.",
  },
  {
    q: "Kada je najbolji trenutak tokom svadbe?",
    a: "Ako je ceremonija glavni događaj, ide na početku proslave dok su gosti okupljeni i sveži, obično pre večere. Ako je zamišljena kao iznenađenje i šaljivi program, bolje radi kasnije, kada je atmosfera već zagrejana.",
  },
  {
    q: "Šta ako gosti ne razumeju šalu?",
    a: "Zato se ton dogovara unapred. Vi kažete kakvo je društvo, koliko je porodica ozbiljna i koje teme ne diramo. Šaljiva varijanta nikada ne ide na račun mladenaca ni gostiju — smeh je uvek na strani slavlja, a ne protiv nekoga.",
  },
  {
    q: "Mogu li mladenci da ne znaju, da im bude iznenađenje?",
    a: "Može, i to je čest scenario — najčešće ga organizuju kum, kuma ili roditelji. U tom slučaju scenario dogovaramo sa vama umesto sa mladencima, a ton biramo opreznije, jer nema provere sa njihove strane.",
  },
  {
    q: "Venčali smo se u inostranstvu. Ima li ovo smisla za nas?",
    a: "Ima, i to su nam najčešći klijenti. Papiri su gotovi, ali porodica i prijatelji u Srbiji nisu prisustvovali ničemu. Ceremonija im daje trenutak koji su propustili — sa istim emocijama, samo bez šaltera.",
  },
  {
    q: "Radi li ovo i za godišnjicu, obnovu zaveta ili rođendan?",
    a: "Radi. Obnova zaveta je posle svadbe najčešći povod, posebno za okrugle godišnjice braka. Šaljiva varijanta se dobro uklapa i na rođendanima, punoletstvima i korporativnim proslavama.",
  },
  {
    q: "Da li je govor zaista personalizovan?",
    a: "Jeste — to je i suština. Uzimamo vašu priču: kako ste se upoznali, ko je kome prvi pisao, čega se porodica najviše seća. Tekst dobijate na uvid pre ceremonije, tako da nema neprijatnih iznenađenja.",
  },
  {
    q: "Ko izvodi ceremoniju?",
    a: "Glumac, odnosno iskusan voditelj ceremonija koji ovo radi redovno. Nastup je odigran, ne pročitan — i baš zato prvih nekoliko minuta gosti stvarno veruju da gledaju zvaničnu ceremoniju.",
  },
  {
    q: "Koliko unapred treba rezervisati?",
    a: "U sezoni, od maja do oktobra, subote se zauzimaju mesecima unapred. Čim imate datum i lokaciju, pošaljite upit da proverimo termin — potvrda je brza, a termin se ne drži bez dogovora.",
  },
  {
    q: "Treba li nam nekakva papirologija?",
    a: "Ne treba ništa. Za simboličnu ceremoniju nema prijava, taksi ni dokumenata — dovoljni su datum, lokacija i vaša priča. Sva papirologija ostaje vezana za zvanični čin u opštini.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SCHEMA.ORG
═══════════════════════════════════════════════════════════════════════════ */

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Lažni matičar — simbolična ceremonija venčanja",
  name: "Lažni matičar za svadbu i simboličnu ceremoniju venčanja",
  description:
    "Simbolična ceremonija venčanja koju vodi glumac u ulozi matičara, sa govorom pisanim po priči para. Emotivna ili šaljiva varijanta, na lokaciji po izboru, širom Srbije. Ceremonija nema pravno dejstvo — brak se zaključuje pred ovlašćenim matičarem.",
  provider: {
    "@type": "Organization",
    name: "HALO Uspomene",
    url: siteUrl,
  },
  areaServed: { "@type": "Country", name: "Srbija" },
  url: pageUrl,
  offers: {
    "@type": "Offer",
    priceCurrency: "EUR",
    price: priceFrom,
    priceSpecification: {
      "@type": "PriceSpecification",
      minPrice: priceFrom,
      priceCurrency: "EUR",
    },
    availability: "https://schema.org/InStock",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Početna", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Lažni matičar", item: pageUrl },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   STRANICA
═══════════════════════════════════════════════════════════════════════════ */

export default function LazniMaticar() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        {/* ─────────────────────────── HERO ─────────────────────────── */}
        <section className="pt-28 sm:pt-32 pb-14 sm:pb-20 relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-5xl">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Lažni matičar" },
              ]}
            />
            <div className="text-center mt-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-5">
                Simbolična ceremonija venčanja
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] leading-tight mb-6">
                Lažni matičar —{" "}
                <span className="italic text-[#AE343F]">prave suze</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#232323]/60 max-w-2xl mx-auto mb-4 leading-relaxed">
                Glumac u ulozi matičara vodi ceremoniju napisanu po vašoj priči
                — tamo gde vi želite, onda kada vi želite. Emotivnu, šaljivu ili
                oboje.
              </p>
              <p className="text-sm text-[#232323]/50 max-w-xl mx-auto mb-8">
                Bez papirologije i bez odobrenja lokacije. Dolazimo širom
                Srbije.
              </p>

              {/* Fotografija je bez pozadine — bez okvira, samo meki topli sjaj */}
              <div className="relative mx-auto mb-8 max-w-3xl">
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[80%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(212,175,55,0.18),transparent_70%)] blur-3xl"
                />
                <Image
                  src="/images/lazni-maticar/ceremonija.webp"
                  alt="Knjiga venčanih, mikrofon, lenta i veo — rekviziti simbolične ceremonije venčanja"
                  width={1200}
                  height={496}
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  // Fotografija je bez pozadine, pa senka ide preko drop-shadow
                  // filtera (prati alfa kanal) umesto box-shadow, koji bi pratio
                  // pravougaonik i visio u praznom prostoru oko objekta.
                  className="relative z-10 h-auto w-full [filter:drop-shadow(0_16px_14px_rgba(35,35,35,0.20))]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-9 text-[#232323]/50 text-sm">
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#AE343F]" />
                  od {priceFrom} € po ceremoniji
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-[#AE343F]" />
                  10–15 minuta
                </span>
                <span className="flex items-center gap-2">
                  <FileText size={16} className="text-[#AE343F]" />
                  bez papirologije
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#kontakt"
                  className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] btn-lg rounded-full px-10 border-none shadow-xl shadow-[#AE343F]/30"
                  data-track="cta_click"
                  data-track-cta-name="upit_lazni_maticar"
                  data-track-cta-location="hero"
                >
                  Proveri termin
                  <ArrowRight size={18} />
                </a>
                <a
                  href="#kako-izgleda"
                  className="btn btn-outline border-[#232323]/20 text-[#232323] hover:bg-[#232323] hover:text-[#F5F4DC] btn-lg rounded-full px-10"
                >
                  Kako izgleda
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────── TRUST ─────────────────────── */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustPoints.map((item) => (
                <div
                  key={item.title}
                  className="text-center p-6 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-serif text-xl text-[#232323] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#232323]/55 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────── ŠTA JE LAŽNI MATIČAR ─────────────────── */}
        <section className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Ukratko
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323]">
                Šta je{" "}
                <span className="italic text-[#AE343F]">lažni matičar</span>?
              </h2>
            </div>
            <div className="space-y-5 text-[#232323]/65 leading-relaxed text-[17px] text-justify hyphens-auto">
              <p>
                Lažni matičar je glumac koji vodi ceremoniju venčanja koja
                izgleda i zvuči kao prava — odelo, lenta, knjiga, pečat i
                mikrofon.{" "}
                <strong className="text-[#232323]">
                  Ceremonija je simbolična i nema nijedan zakonski element
                </strong>
                : ništa se ne prijavljuje, ništa se pravno ne potpisuje i ništa
                se ne upisuje ni u kakvu evidenciju. Namenjena je parovima koji
                su brak već sklopili — u opštini kod nas ili negde u
                inostranstvu — pa žele i pravu ceremoniju, pred svima koje vole.
              </p>
              <p>
                Najveća razlika u odnosu na zvanični čin nije mesto nego
                osećaj.{" "}
                <strong className="text-[#232323]">
                  Mladenci su neuporedivo opušteniji
                </strong>{" "}
                — nema obrasca koji se čita, nema strepnje da li ćete nešto
                pogrešiti i nema osećaja da vas neko požuruje jer sledeći par
                čeka pred vratima. Za to da je matičar glumac znaju samo
                mladenci i kumovi; gosti ne znaju, pa je i njihova reakcija
                potpuno iskrena.
              </p>
              <p>
                Zato ovakve ceremonije ispadnu i lepše i fotogeničnije od
                zvaničnog čina: ljudi se smeju i plaču u pravim trenucima,
                fotograf ima vremena, a ceo tekst je{" "}
                <strong className="text-[#232323]">
                  personalizovan po želji mladenaca
                </strong>{" "}
                — od toga kako ste se upoznali do zaveta koje sami napišete.
                Ideja nije ni nova kod nas: srpske svadbe vekovima imaju
                odigrane uloge, od lažne mlade do kupovine mlade. Ovo je samo
                najnovija u nizu.
              </p>
            </div>
          </div>
        </section>

        {/* ─────────────────── KAKO IZGLEDA ─────────────────── */}
        <section id="kako-izgleda" className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Tok ceremonije
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Kako izgleda{" "}
                <span className="italic text-[#AE343F]">ceremonija</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Traje koliko i zvanični čin — desetak do petnaest minuta. Sve
                pre toga je dogovor, sve posle toga je slavlje.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {ceremonyFlow.map((step) => (
                <div
                  key={step.n}
                  className="p-7 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5"
                >
                  <span className="font-serif text-4xl text-[#AE343F]/25 block mb-3">
                    {step.n}
                  </span>
                  <h3 className="font-serif text-lg text-[#232323] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#232323]/55 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5">
                <div className="w-14 h-14 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mb-5">
                  <Heart size={26} />
                </div>
                <h3 className="font-serif text-2xl text-[#232323] mb-3">
                  Emotivna varijanta
                </h3>
                <p className="text-sm text-[#232323]/55 leading-relaxed">
                  Ozbiljna ceremonija od početka do kraja, sa govorom o vašoj
                  priči i razmenom zaveta. Bira se kada je ovo jedina ceremonija
                  koju ćete imati pred gostima — na primer ako ste se venčali u
                  inostranstvu ili obnavljate zavete posle mnogo godina. Efekat
                  je isti kao na pravom venčanju, često i jači, jer tekst nije
                  službeni obrazac nego vaša priča.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5">
                <div className="w-14 h-14 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mb-5">
                  <Laugh size={26} />
                </div>
                <h3 className="font-serif text-2xl text-[#232323] mb-3">
                  Šaljiva varijanta
                </h3>
                <p className="text-sm text-[#232323]/55 leading-relaxed">
                  Počinje potpuno ozbiljno — i baš zato radi. Gosti ustanu,
                  uozbilje se, neko izvadi telefon da snima, a onda ceremonija
                  polako skrene tamo gde niko ne očekuje. Šala nikada ne ide na
                  račun mladenaca ni gostiju; teme koje se ne diraju dogovaramo
                  sa vama unapred.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────── KADA VAM TREBA ─────────────────── */}
        <section className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Za koga
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Kada vam treba{" "}
                <span className="italic text-[#AE343F]">lažni matičar</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Četiri situacije u kojima parovi najčešće naruče ceremoniju.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scenarios.map((s) => (
                <div
                  key={s.title}
                  className="flex gap-5 p-6 rounded-3xl bg-white border border-[#232323]/8"
                >
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center">
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-[#232323] mb-2">
                      {s.title}
                    </h3>
                    <p className="text-sm text-[#232323]/55 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────── CENA ─────────────────────────── */}
        <section id="cena" className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Cena
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Koliko košta{" "}
                <span className="italic text-[#AE343F]">ceremonija</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Većina ponuđača cenu drži iza forme za upit. Mi je pišemo
                otvoreno.
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-10 p-8 sm:p-10 rounded-3xl bg-[#232323] text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37] mb-3">
                Ceremonija sa glumcem
              </p>
              <p className="font-serif text-5xl sm:text-6xl text-[#F5F4DC] mb-3">
                od {priceFrom} €
              </p>
              <p className="text-[#F5F4DC]/50 text-sm leading-relaxed">
                {pricingApproximate
                  ? "Cena je orijentaciona — zavisi od lokacije, trajanja i složenosti scenarija. Tačnu ponudu šaljemo na upit, bez obaveze."
                  : "Tačna cena zavisi od izabranog paketa i lokacije."}
              </p>
            </div>

            {packages.length > 0 && (
              <div className="overflow-x-auto rounded-3xl border border-[#232323]/8 bg-[#f5f4dc]/40 mb-10">
                <table className="w-full text-left text-sm min-w-[520px]">
                  <thead>
                    <tr className="bg-[#232323] text-[#F5F4DC]">
                      <th className="py-4 px-5 font-semibold">Paket</th>
                      <th className="py-4 px-5 font-semibold text-right">
                        Cena
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((pkg) => (
                      <tr
                        key={pkg.id}
                        className="border-t border-[#232323]/8"
                      >
                        <td className="py-4 px-5">
                          <span className="font-medium text-[#232323]">
                            {pkg.name}
                          </span>
                          <span className="block text-xs text-[#232323]/45">
                            {pkg.includes.join(" · ")}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-serif text-lg text-[#AE343F] text-right whitespace-nowrap">
                          {pkg.price} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-7 rounded-3xl bg-[#f5f4dc]/50 border border-[#232323]/8">
                <h3 className="font-serif text-xl text-[#232323] mb-4">
                  U cenu je uključeno
                </h3>
                <ul className="space-y-2.5 text-sm text-[#232323]/60">
                  {includedAlways.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-7 rounded-3xl bg-[#f5f4dc]/50 border border-[#232323]/8">
                <h3 className="font-serif text-xl text-[#232323] mb-4">
                  Dogovara se posebno
                </h3>
                <ul className="space-y-2.5 text-sm text-[#232323]/60">
                  {extras.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-center text-sm text-[#232323]/50 mt-8 max-w-2xl mx-auto leading-relaxed">
              Za poređenje: izlazak pravog matičara na teren u Beogradu
              naplaćuje se i do 18.212 dinara, a i tada samo na lokaciju koju
              matična služba odobri.
            </p>
          </div>
        </section>

        {/* ─────────────────── PRAVNI STATUS ─────────────────── */}
        <section className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#232323]/8">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center">
                  <Scale size={26} />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#232323]">
                  Da li je ovo pravno venčanje? Nije.
                </h2>
              </div>
              <div className="space-y-4 text-[#232323]/65 leading-relaxed">
                <p>
                  Da nema nikakve zabune: simbolična ceremonija{" "}
                  <strong className="text-[#232323]">
                    nema pravno dejstvo i ne sadrži nijedan zakonski element
                  </strong>
                  . U Srbiji je brak zaključen isključivo pred ovlašćenim
                  matičarem, u postupku koji propisuje zakon. Kod nas se ne
                  potpisuje nijedan pravni dokument, ne izdaje se nikakav
                  izvod i ništa se ne prijavljuje nadležnim organima.
                </p>
                <p>
                  Zbog toga je ovo usluga za parove{" "}
                  <strong className="text-[#232323]">
                    koji su brak već sklopili
                  </strong>{" "}
                  — u opštini pre ili posle proslave, ili ranije u inostranstvu.
                  Zvanični deo je pet minuta na šalteru, bez gostiju i bez
                  stresa; ceremonija je ono zbog čega su svi došli.
                </p>
                <p>
                  A pošto nema propisanog obrasca, ceremonija se{" "}
                  <strong className="text-[#232323]">
                    piše po želji mladenaca
                  </strong>
                  : vaše reči, vaša priča, vaši zaveti, u tonu koji vi izaberete
                  i u trajanju koje vama odgovara.
                </p>
                <p className="text-sm text-[#232323]/50">
                  Za simboličnu ceremoniju ne treba nikakva dokumentacija. Ako
                  vam je zvanični deo tek pred sobom, uklopite ga u{" "}
                  <Link
                    href="/blog/planiranje-vencanja-checklista"
                    className="text-[#AE343F] font-medium hover:underline"
                  >
                    checklistu za planiranje venčanja
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────── GRADOVI ─────────────────────────── */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Gde dolazimo
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Ceremonija{" "}
                <span className="italic text-[#AE343F]">gde vi želite</span>
              </h2>
              <p className="text-[#232323]/55 max-w-2xl mx-auto">
                Lokacija ne mora da bude na spisku matične službe. To je i cela
                poenta.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cities.map((c) => (
                <div
                  key={c.name}
                  className="flex gap-5 p-6 rounded-3xl bg-[#f5f4dc]/40 border border-[#232323]/5"
                >
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-[#232323] mb-2">
                      {c.name}
                    </h3>
                    <p className="text-sm text-[#232323]/55 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────── FAQ ─────────────────────────── */}
        <section className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Česta pitanja
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323]">
                Sve što vas{" "}
                <span className="italic text-[#AE343F]">zanima</span>
              </h2>
            </div>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.q}
                  className="group bg-white rounded-2xl border border-[#232323]/8 overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-serif text-lg text-[#232323] list-none">
                    {item.q}
                    <ArrowRight
                      size={18}
                      className="shrink-0 text-[#AE343F] rotate-90 group-open:rotate-[270deg] transition-transform"
                    />
                  </summary>
                  <div className="px-5 pb-5 text-[#232323]/60 leading-relaxed text-[15px]">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>

            <p className="text-center text-sm text-[#232323]/50 mt-10">
              Zanima vas kako to izgleda iznutra?{" "}
              <Link
                href="/blog/lazni-maticar-kako-izgleda"
                className="text-[#AE343F] font-medium hover:underline"
              >
                Pročitajte tekst o tome kad vas venča glumac
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ─────────────────────── KONTAKT / FORMA ─────────────────────── */}
        <section id="kontakt" className="py-16 sm:py-20 md:py-24 bg-[#232323]">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-4">
                Zakažite ceremoniju
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F4DC] mb-4">
                Proverite termin za{" "}
                <span className="italic text-[#AE343F]">vaš datum</span>
              </h2>
              <p className="text-[#F5F4DC]/50 max-w-xl mx-auto">
                Javite nam datum, lokaciju i kakav ton želite — vraćamo se sa
                potvrdom termina i tačnom cenom. Bez obaveze.
              </p>
            </div>
            <ServiceLeadForm
              primaryOptions={toneOptions}
              primaryLabel="Ton ceremonije"
              primaryIcon={<Mic size={14} className="text-[#AE343F]" />}
              primaryEmailKey="ton_ceremonije"
              secondaryOptions={occasionOptions}
              secondaryLabel="Povod"
              secondaryIcon={
                <PartyPopper size={14} className="text-[#AE343F]" />
              }
              secondaryEmailKey="povod"
              subjectLabel="Upit za lažnog matičara"
              paket="Lažni matičar — simbolična ceremonija"
              introHighlight="simboličnu ceremoniju venčanja"
              submitLabel="Pošalji upit"
              routingProduct="lazni-maticar"
            />
          </div>
        </section>

        {/* ─────────────────────── SEO TEKST (skriven) ─────────────────────── */}
        <section className="sr-only">
          <h2>
            Lažni matičar za svadbu — simbolična ceremonija venčanja širom
            Srbije
          </h2>
          <p>
            HALO Uspomene posreduje uslugu lažnog matičara za venčanja, svadbe i
            proslave u Srbiji. Lazni maticar je glumac koji vodi simboličnu
            ceremoniju venčanja — u odelu, sa lentom, knjigom i mikrofonom —
            koja izgleda kao zvanična, ali nema pravno dejstvo i ne sadrži
            nijedan zakonski element. Namenjena je parovima koji su brak već
            sklopili — u opštini ili u inostranstvu — a ceremonija se u
            potpunosti personalizuje po želji mladenaca. Može biti emotivna ili
            šaljiva, a govor se piše po njihovoj priči.
            Najčešći povodi su venčanje na lokaciji na koju matičar ne izlazi
            (salaš, vinarija, dvorište, priroda), ceremonija za goste kada je
            par venčan u inostranstvu, obnova bračnih zaveta i godišnjice braka,
            kao i šaljivi program i iznenađenje za mladence. Dolazimo u Beograd,
            Novi Sad, Niš, Kragujevac i ostale gradove, kao i na lokacije u
            prirodi. Cena počinje od {priceFrom} evra po ceremoniji. Za
            simbolično venčanje nije potrebna nikakva papirologija — brak se u
            Srbiji zaključuje isključivo pred ovlašćenim matičarem.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
