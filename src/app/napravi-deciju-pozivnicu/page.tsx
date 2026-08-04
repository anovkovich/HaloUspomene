import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FileDown,
  MapPin,
  Palette,
  Smartphone,
} from "lucide-react";
import {
  Fredoka,
  Bubblegum_Sans,
  Baloo_2,
  Patrick_Hand,
  Chewy,
} from "next/font/google";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import BirthdayQuestionnaireForm from "./BirthdayQuestionnaireForm";
import InvitationClusterLinks from "@/components/seo/InvitationClusterLinks";
import { getRodjendanPozivnicaPrice, formatPrice } from "@/data/pricing";
import { resolveBypassInfo } from "@/lib/bypass-token";

const fredoka = Fredoka({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fredoka",
  display: "swap",
});

const bubblegumSans = Bubblegum_Sans({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-bubblegum-sans",
  display: "swap",
});

const baloo2 = Baloo_2({
  subsets: ["latin", "latin-ext"],
  variable: "--font-baloo-2",
  display: "swap",
});

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-patrick-hand",
  display: "swap",
});

const chewy = Chewy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-chewy",
  display: "swap",
});

const fontVars = `${fredoka.variable} ${bubblegumSans.variable} ${baloo2.variable} ${patrickHand.variable} ${chewy.variable}`;

export const metadata: Metadata = {
  title: "Pozivnice za Dečiji Rođendan — Napravi Online",
  description:
    "Digitalna pozivnica za dečiji rođendan — izaberite temu, dodajte potvrde dolaska i podelite jednim linkom. PDF pozivnica za štampu uključena.",
  keywords: [
    "pozivnica za dečiji rođendan",
    "digitalna pozivnica rođendan",
    "online pozivnica za prvi rođendan",
    "pozivnica za dečiji rođendan online",
    "pozivnica za rođendan deteta",
    "pozivnica za prvi rođendan",
    "dečiji rođendan pozivnica online",
    "šarena pozivnica za rođendan",
    "pozivnica za dečaka rođendan",
    "pozivnica za devojčicu rođendan",
    "pozivnica za rođendan online",
    "napravi pozivnicu za rođendan",
    "izrada pozivnica za rođendan",
    "pozivnica za drugi rođendan",
    "pozivnica za treći rođendan",
    "pozivnica za peti rođendan",
  ],
  openGraph: {
    title: "Napravi Pozivnicu za Dečiji Rođendan | HALO Uspomene",
    description:
      "Šarena digitalna pozivnica za dečiji rođendan — sa formom za potvrdu dolaska, odbrojavanjem i veselim temama. Gotova odmah.",
    type: "website",
  },
  alternates: {
    canonical: "/napravi-deciju-pozivnicu",
  },
};

/** Cena se čita jednom i koristi i u tekstu i u schemi, da se ne raziđu. */
const cena = formatPrice(getRodjendanPozivnicaPrice(false));

const faqItems = [
  {
    q: "Koliko košta pozivnica za dečiji rođendan?",
    a: `Pozivnica za dečiji rođendan košta ${cena}. U cenu ulazi personalizovana web pozivnica, forma za potvrdu dolaska, odbrojavanje, mapa lokacije i PDF pozivnica za štampu — bez naknadnih doplata.`,
  },
  {
    q: "Kada je pozivnica gotova?",
    a: "Odmah. Popunite upitnik u četiri koraka, izaberete temu i boje, i pozivnica je napravljena — otključavate je nakon uplate i istog trenutka možete da je pošaljete u roditeljsku grupu.",
  },
  {
    q: "Koje teme mogu da izaberem?",
    a: "Postoje tema za dečake, tema za devojčice i neutralna tema, uz vesele fontove i šarene ilustracije. Boju možete dodatno prilagoditi ukusu deteta.",
  },
  {
    q: "Da li ovo važi i za prvi rođendan?",
    a: "Da, ista pozivnica se pravi i za prvu godinu — popunjavate isti upitnik, samo izaberete temu i boje koje vam odgovaraju. Nema posebnog proizvoda ni posebne cene za prvi rođendan.",
  },
  {
    q: "Kako gosti potvrđuju dolazak?",
    a: "Roditelj otvori link i jednim klikom potvrdi dolazak — bez aplikacije i bez registracije. Vi vidite ko je potvrdio i koliko ukupno dolazi dece i odraslih.",
  },
  {
    q: "Mogu li da menjam podatke posle izrade?",
    a: "Da. Lokacija, satnica i detalji mogu da se menjaju sve do dana proslave. Link ostaje isti, pa ne morate ništa ponovo da šaljete — svi vide ažuriranu verziju.",
  },
  {
    q: "Da li dobijam i pozivnicu za štampu?",
    a: "Da. Uz web pozivnicu ide i PDF u A5 formatu sa QR kodom — zgodno kada se pozivnice dele u vrtiću ili školi, gde poruka u grupi ne stiže do svih roditelja.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const ukljuceno = [
  {
    icon: <Palette size={18} />,
    title: "Teme po ukusu deteta",
    desc: "Za dečake, devojčice ili neutralna — uz izbor boje.",
  },
  {
    icon: <CheckCircle2 size={18} />,
    title: "Potvrde dolaska",
    desc: "Roditelj potvrdi jednim klikom, vi vidite spisak.",
  },
  {
    icon: <CalendarClock size={18} />,
    title: "Odbrojavanje",
    desc: "Brojač do proslave — deci najzabavniji deo.",
  },
  {
    icon: <MapPin size={18} />,
    title: "Mapa lokacije",
    desc: "Roditelji otvaraju navigaciju iz same pozivnice.",
  },
  {
    icon: <FileDown size={18} />,
    title: "PDF za štampu",
    desc: "A5 sa QR kodom, za vrtić i školu. Uključen.",
  },
  {
    icon: <Smartphone size={18} />,
    title: "Radi na svakom telefonu",
    desc: "Bez aplikacije i bez naloga — otvara se kao link.",
  },
];

export default async function NapraviDecijuPozivnicuPage({
  searchParams,
}: {
  searchParams: Promise<{ bypass?: string }>;
}) {
  // Foreign-customer bypass link (admin-issued) — skips SMS verification.
  const bypassInfo = await resolveBypassInfo((await searchParams).bypass);
  return (
    <>
      <Header />
      <main className={`min-h-screen pt-28 pb-20 relative transition-colors duration-500 ${fontVars} birthday-form-page`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* ═══ 1. Hero + 2. Formular ═══
            Formular ostaje sam u prvom ekranu — upit koji dovodi posetioca
            („napravi mi pozivnicu za rodjendan") je transakcioni, pa je forma
            odgovor na njega. Sadržaj ide ISPOD, za onoga ko još bira. */}
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#FF6B6B] mb-5">
              Napravite pozivnicu za rođendan
            </h1>
            <p className="text-[#E55A5A] text-lg max-w-xl mx-auto">
              Popunite upitnik u 4 koraka — mi ćemo sve ostalo uraditi i Vaša
              pozivnica će biti gotova odmah
            </p>
            <p className="inline-block mt-4 text-xs tracking-widest uppercase text-stone-400 border border-stone-200 rounded-full px-4 py-1.5">
              Cena: <span className="font-semibold text-[#FF6B6B]">{cena}</span>
            </p>
            <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#E55A5A]/80">
              {["Gotova odmah", "Teme za dečake i devojčice", "Potvrde dolaska"].map(
                (t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#FF6B6B]" />
                    {t}
                  </li>
                ),
              )}
            </ul>
          </div>

          <div id="formular" className="scroll-mt-28">
            <BirthdayQuestionnaireForm bypassInfo={bypassInfo} />
          </div>
        </div>

        {/* ═══ 3. Demo pozivnice ═══ */}
        <section className="mt-20 sm:mt-24 relative z-10">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#232323] mb-3">
              Pogledajte primer uživo
            </h2>
            <p className="text-[#232323]/60 mb-6">
              Dve gotove pozivnice, otvorene za pregled — ovako izgleda i vaša,
              samo sa imenom deteta i vašim datumom.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  href: "/deciji-rodjendan/primer-decak",
                  name: "Tema za dečake",
                  desc: "Vesele boje i ilustracije",
                },
                {
                  href: "/deciji-rodjendan/primer-devojcica",
                  name: "Tema za devojčice",
                  desc: "Nežnije boje, isti sadržaj",
                },
              ].map((d) => (
                <Link
                  key={d.href}
                  href={d.href}
                  className="group block rounded-2xl border border-stone-200 bg-white p-6 transition-all hover:border-[#FF6B6B]/50 hover:shadow-md"
                >
                  <p className="font-serif text-lg text-[#232323]">{d.name}</p>
                  <p className="mt-1 text-sm text-[#232323]/55">{d.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#FF6B6B]">
                    Otvorite primer
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              ))}
            </div>
            {/* Ovde se NE linkuje `/pozivnica-za-prvi-rodjendan`. Ta stranica
                postoji samo da bi se indeksirala za taj upit i sama vraća
                posetioca na ovaj formular — link odavde bi ga samo odveo u krug,
                dalje od forme. */}
          </div>
        </section>

        {/* ═══ 4. Šta dobijate ═══ */}
        <section className="mt-16 sm:mt-20 relative z-10">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#232323] mb-6">
              Šta dobijate
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ukljuceno.map((f) => (
                <div
                  key={f.title}
                  className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-5"
                >
                  <span className="mt-0.5 shrink-0 text-[#FF6B6B]">
                    {f.icon}
                  </span>
                  <span>
                    <span className="block font-semibold text-[#232323]">
                      {f.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-[#232323]/55">
                      {f.desc}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 5. Kako funkcioniše ═══ */}
        <section className="mt-16 sm:mt-20 relative z-10">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#232323] mb-6">
              Kako funkcioniše
            </h2>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  n: "01",
                  t: "Popunite upitnik",
                  d: "Ime deteta, datum, lokacija i tema — četiri koraka.",
                },
                {
                  n: "02",
                  t: "Pozivnica je gotova",
                  d: "Odmah, bez čekanja. Otključavate je nakon uplate.",
                },
                {
                  n: "03",
                  t: "Pošaljite u grupu",
                  d: "Jedan link u roditeljsku Viber grupu — i to je to.",
                },
              ].map((s) => (
                <li
                  key={s.n}
                  className="rounded-2xl border border-stone-200 bg-white p-5"
                >
                  <span className="font-serif text-2xl font-black text-[#FF6B6B]/40">
                    {s.n}
                  </span>
                  <p className="mt-2 font-semibold text-[#232323]">{s.t}</p>
                  <p className="mt-1 text-sm text-[#232323]/55">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══ 6. Šta napisati — prozni deo ═══ */}
        <section className="mt-16 sm:mt-20 relative z-10">
          <div className="container mx-auto px-4 max-w-3xl space-y-5 text-[#232323]/70 leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#232323]">
              Šta napisati u pozivnici za dečiji rođendan
            </h2>
            <p>
              Pozivnicu za dečiji rođendan ne čita dete nego roditelj drugog
              deteta — i njemu trebaju sasvim praktični podaci. Zato pozivnica
              koja izgleda lepo, a ne odgovara na njegova pitanja, uvek završi
              nizom poruka tipa <em>a do kada traje</em> i{" "}
              <em>da li i ja ostajem</em>.
            </p>
            <p>
              Dobra vest je da najveći deo toga{" "}
              <strong className="text-[#232323]">ne kucate</strong>. Ime deteta,
              datum, vreme, naziv i adresa lokacije i rok za potvrdu dolaska su
              zasebna polja u upitniku — pozivnica ih sama prikazuje, jasno i
              uredno. Kontakt telefon unosite posebno, za naš tim, i on se ne
              vidi na pozivnici.
            </p>
            <p>
              Vi pišete samo{" "}
              <strong className="text-[#232323]">tagline — jednu do dve
              rečenice</strong> koje stoje na vrhu i daju pozivnici ton. Tu ide
              raspoloženje, ne podaci.
            </p>
            <p>
              Ono što ipak vredi dopisati u tagline jesu sitnice koje roditelju
              menjaju pripremu: da li{" "}
              <strong className="text-[#232323]">roditelji ostaju</strong> ili
              ostavljaju dete, i da li treba poneti patike ili čarape za
              igraonicu. To su dve stvari zbog kojih inače stigne deset poruka.
            </p>

            <h3 className="text-xl font-serif text-[#232323] pt-2">
              Primeri kratke poruke na pozivnici
            </h3>
            <ul className="space-y-2.5">
              {[
                "Naša mala zvezda slavi peti rođendan — dođite da bude bučno i veselo!",
                "Luka puni 6! Spremili smo tortu, igre i gomilu balona, fališ samo ti.",
                "Torta, baloni i najbolje društvo — bez tebe ne počinjemo.",
                "Rođendanska žurka za našeg junaka. Roditelji su dobrodošli da ostanu uz kafu.",
                "Slavimo u igraonici, pa neka mališani ponesu patike i dobru volju.",
                "Jedna godina više, sto novih igara pred nama. Dođite da ih isprobamo.",
                "Anin rođendan slavimo kod kuće, u dvorištu — igra, roštilj i torta.",
                "Male godine, velika žurka. Očekujemo vas na proslavi Markovog rođendana.",
              ].map((t) => (
                <li
                  key={t}
                  className="rounded-xl border border-stone-200 bg-white px-5 py-3 italic"
                >
                  {t}
                </li>
              ))}
            </ul>

            <p>
              Više ideja po temama ima u vodiču{" "}
              <Link
                href="/blog/pozivnice-za-deciji-rodjendan-online"
                className="font-medium text-[#FF6B6B] hover:underline"
              >
                pozivnice za dečiji rođendan online
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ═══ 7. Poruka, papir ili digitalna ═══ */}
        <section className="mt-16 sm:mt-20 relative z-10">
          <div className="container mx-auto px-4 max-w-3xl space-y-5 text-[#232323]/70 leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#232323]">
              Poruka u grupi, papirna ili digitalna pozivnica?
            </h2>
            <p>
              Ono što roditelji danas najčešće rade jeste obična poruka u
              roditeljskoj Viber grupi. Radi — ali se posle tri dana izgubi među
              porukama, niko ne zna ko je zapravo potvrdio, a vi brojite prstima
              koliko parčića torte da spremite.
            </p>
            <p>
              Digitalna pozivnica koristi <strong className="text-[#232323]">isti
              kanal</strong> — i dalje šaljete jedan link u istu grupu — ali{" "}
              <strong className="text-[#232323]">broji goste umesto vas</strong>,
              odvojeno decu i odrasle. Ako se lokacija ili satnica promene,
              menjate ih na jednom mestu; link ostaje isti i niko ne dobija
              ispravku.
            </p>
            <p>
              Papir i dalje ima svoje mesto: u vrtiću i školi poruka u grupi ne
              stiže do svih roditelja. Zato uz web pozivnicu ide i{" "}
              <strong className="text-[#232323]">PDF u A5 formatu sa QR
              kodom</strong> — odštampate ga i podelite, a roditelj skeniranjem
              završi na istoj pozivnici. Za starije slavljenike tu je i{" "}
              <Link
                href="/napravi-punoletstvo"
                className="font-medium text-[#FF6B6B] hover:underline"
              >
                pozivnica za punoletstvo
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ═══ 8. FAQ ═══ */}
        <section className="mt-16 sm:mt-20 relative z-10">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#232323] mb-6">
              Česta pitanja
            </h2>
            <div className="space-y-3">
              {faqItems.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-stone-200 bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-serif text-lg text-[#232323]">
                    {item.q}
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-[#FF6B6B] transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <p className="px-5 pb-5 leading-relaxed text-[#232323]/60">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 9. Povratak na formular ═══ */}
        <section className="mt-16 sm:mt-20 relative z-10">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex flex-col items-center gap-4 rounded-3xl bg-[#232323] px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <p className="font-serif text-xl text-[#F5F4DC] sm:text-2xl">
                  Pozivnica je gotova odmah
                </p>
                <p className="mt-1 text-sm text-[#F5F4DC]/50">
                  Upitnik u četiri koraka. Cena {cena}, bez skrivenih troškova.
                </p>
              </div>
              <Link
                href="#formular"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#FF6B6B] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#E55A5A]"
              >
                Napravite pozivnicu
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <section className="py-16 sm:py-20 bg-[#faf9f6] border-t border-[#232323]/5">
        <InvitationClusterLinks current="deciji" />
      </section>
      <Footer />
    </>
  );
}
