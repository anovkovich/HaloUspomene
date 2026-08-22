import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  FileDown,
  MapPin,
  Type,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import PunoletstvoQuestionnaireForm from "./PunoletstvoQuestionnaireForm";
import InvitationClusterLinks from "@/components/seo/InvitationClusterLinks";
import { resolveBypassInfo } from "@/lib/bypass-token";
import { getRodjendanPozivnicaPrice, formatPrice } from "@/data/pricing";

export const metadata: Metadata = {
  title: "Digitalne Pozivnice za 18. Rođendan i Punoletstvo",
  description:
    "Elegantna digitalna pozivnica za 18. rođendan i punoletstvo — potvrde dolaska, odbrojavanje i mapa. Gotova odmah, deli se jednim linkom.",
  keywords: [
    "pozivnica za punoletstvo",
    "pozivnica za 18 rođendan",
    "digitalna pozivnica punoletstvo",
    "online pozivnica 18 rođendan",
    "elegantna pozivnica za punoletstvo",
    "website pozivnica 18 rođendan",
    "pozivnica za osamnaesti rođendan",
    "pozivnica za 18. rođendan online",
    "izrada pozivnice za punoletstvo",
    "napravi pozivnicu za punoletstvo",
    "tekst za pozivnicu za punoletstvo",
  ],
  openGraph: {
    title: "Napravi Pozivnicu za Punoletstvo | HALO Uspomene",
    description:
      "Elegantna digitalna pozivnica za 18. rođendan — klasičan stil sa formom za potvrdu dolaska, mapom i odbrojavanjem. Gotova odmah.",
    type: "website",
  },
  alternates: {
    canonical: "/napravi-punoletstvo",
  },
};

/** Cena se čita jednom i koristi i u tekstu i u schemi, da se ne raziđu. */
const cena = formatPrice(getRodjendanPozivnicaPrice(true));

const faqItems = [
  {
    q: "Koliko košta pozivnica za 18. rođendan?",
    a: `Pozivnica za punoletstvo košta ${cena}. U cenu ulazi personalizovana web pozivnica, forma za potvrdu dolaska, odbrojavanje, mapa lokacije i PDF pozivnica za štampu — bez naknadnih doplata.`,
  },
  {
    q: "Kada je pozivnica gotova?",
    a: "Odmah. Popunite upitnik u četiri koraka, izaberete boje i font, i pozivnica je napravljena — otključavate je nakon uplate i istog trenutka možete da je šaljete gostima.",
  },
  {
    q: "Kako gosti potvrđuju dolazak?",
    a: "Gost otvori link pozivnice i jednim klikom potvrdi dolazak — bez aplikacije i bez registracije. Vi u svakom trenutku vidite ko je potvrdio, ko je otkazao i koliko je ukupno osoba.",
  },
  {
    q: "Da li pozivnica može da bude na ćirilici?",
    a: "Može. Podržane su i latinica i ćirilica, a za ćirilicu je na raspolaganju sedam fontova — od kaligrafskih (Great Vibes, Jasminum, Marck Script) do elegantne antikve (Cormorant Garamond) i art deco stila (Poiret One).",
  },
  {
    q: "Može li roditelj da naruči pozivnicu umesto slavljenika?",
    a: "Naravno. Upitnik popunjava ko god organizuje proslavu — slavljenik, roditelj ili neko treći. Bitni su samo podaci o slavljeniku i o proslavi.",
  },
  {
    q: "Mogu li da menjam podatke posle izrade?",
    a: "Da. Lokacija, satnica i detalji mogu da se menjaju sve do dana proslave. Link i QR kod ostaju isti — gostima se ne šalje ništa ponovo, oni prosto vide ažuriranu verziju.",
  },
  {
    q: "Da li dobijam i pozivnicu za štampu?",
    a: "Da. Uz web pozivnicu ide i PDF u A5 formatu sa QR kodom, koji možete odneti u štampariju ili poslati onima kojima je papirna pozivnica draža.",
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
    icon: <CheckCircle2 size={18} />,
    title: "Potvrde dolaska",
    desc: "Gost potvrđuje jednim klikom, vi vidite spisak uživo.",
  },
  {
    icon: <CalendarClock size={18} />,
    title: "Odbrojavanje",
    desc: "Brojač do dana proslave, na samoj pozivnici.",
  },
  {
    icon: <MapPin size={18} />,
    title: "Mapa lokacije",
    desc: "Gost otvara navigaciju direktno iz pozivnice.",
  },
  {
    icon: <BellRing size={18} />,
    title: "Animirani omot",
    desc: "Pozivnica se otvara kao koverta pri prvom otvaranju.",
  },
  {
    icon: <Type size={18} />,
    title: "Latinica i ćirilica",
    desc: "Elegantni script fontovi u oba pisma.",
  },
  {
    icon: <FileDown size={18} />,
    title: "PDF za štampu",
    desc: "A5 format sa QR kodom, uključen u cenu.",
  },
];

export default async function NapraviPunoletstvoPage({
  searchParams,
}: {
  searchParams: Promise<{ bypass?: string }>;
}) {
  // Foreign-customer bypass link (admin-issued) — skips SMS verification.
  const bypassInfo = await resolveBypassInfo((await searchParams).bypass);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-20 bg-gradient-to-b from-[#fffdf5] to-[#faf8ef]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* ═══ 1. Hero + 2. Formular ═══
            Formular ostaje sam u prvom ekranu: upit koji dovodi posetioca
            („pozivnice za 18 rodjendan") je transakcioni, pa je forma odgovor
            na njega. Sav sadržaj ide ISPOD — vidi ga samo onaj ko skroluje, a
            to je po definiciji posetilac koji još nije odlučio. */}
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#AE343F] mb-5">
              Pozivnica za punoletstvo
            </h1>
            <p className="text-[#7A242C] text-lg max-w-xl mx-auto">
              Popunite upitnik u 4 koraka — klasičan dizajn sa elegantnim script
              fontom, formom za potvrdu dolaska i odbrojavanjem. Gotova odmah.
            </p>
            <p className="inline-block mt-4 text-xs tracking-widest uppercase text-stone-400 border border-stone-200 rounded-full px-4 py-1.5">
              Cena: <span className="font-semibold text-[#AE343F]">{cena}</span>
            </p>
            <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#7A242C]/70">
              {["Gotova odmah", "Potvrde dolaska", "Latinica i ćirilica"].map(
                (t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#AE343F]" />
                    {t}
                  </li>
                ),
              )}
            </ul>
          </div>

          <div id="formular" className="scroll-mt-28">
            <PunoletstvoQuestionnaireForm bypassInfo={bypassInfo} />
          </div>
        </div>

        {/* ═══ 3. Demo pozivnice ═══ */}
        <section className="mt-20 sm:mt-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#232323] mb-3">
              Pogledajte pozivnicu uživo
            </h2>
            <p className="text-[#232323]/60 mb-6">
              Dve gotove pozivnice, otvorene za pregled. Isto ovako izgleda i
              vaša — samo sa vašim imenom, datumom i lokacijom.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  href: "/punoletstvo/primer-devojka",
                  name: "Bordo i zlatna",
                  desc: "Klasična kombinacija za proslavu devojke",
                },
                {
                  href: "/punoletstvo/primer-momak",
                  name: "Teget i zlatna",
                  desc: "Svečana kombinacija za proslavu momka",
                },
              ].map((d) => (
                <Link
                  key={d.href}
                  href={d.href}
                  className="group block rounded-2xl border border-stone-200 bg-white p-6 transition-all hover:border-[#AE343F]/40 hover:shadow-md"
                >
                  <p className="font-serif text-lg text-[#232323]">{d.name}</p>
                  <p className="mt-1 text-sm text-[#232323]/55">{d.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#AE343F]">
                    Otvorite primer
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 4. Šta dobijate ═══ */}
        <section className="mt-16 sm:mt-20">
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
                  <span className="mt-0.5 shrink-0 text-[#AE343F]">
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

        {/* ═══ 5. Kako izgleda izrada ═══ */}
        <section className="mt-16 sm:mt-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#232323] mb-6">
              Kako izgleda izrada
            </h2>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  n: "01",
                  t: "Popunite upitnik",
                  d: "Ime slavljenika, datum, lokacija, boje i font — četiri koraka.",
                },
                {
                  n: "02",
                  t: "Pozivnica je gotova",
                  d: "Odmah, bez čekanja. Otključavate je nakon uplate.",
                },
                {
                  n: "03",
                  t: "Podelite link",
                  d: "Viber, WhatsApp ili Instagram — gosti potvrđuju sami.",
                },
              ].map((s) => (
                <li
                  key={s.n}
                  className="rounded-2xl border border-stone-200 bg-white p-5"
                >
                  <span className="font-serif text-2xl font-black text-[#AE343F]/30">
                    {s.n}
                  </span>
                  <p className="mt-2 font-semibold text-[#232323]">{s.t}</p>
                  <p className="mt-1 text-sm text-[#232323]/55">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══ 6. Tekst pozivnice — prozni deo ═══ */}
        <section className="mt-16 sm:mt-20">
          <div className="container mx-auto px-4 max-w-3xl space-y-5 text-[#232323]/70 leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#232323]">
              Kako da napišete tekst pozivnice za 18. rođendan
            </h2>
            <p>
              Kod digitalne pozivnice ne pišete ceo tekst kao na papiru. Datum,
              vreme, naziv i adresa lokacije, kao i rok do kada se potvrđuje
              dolazak — sve su to{" "}
              <strong className="text-[#232323]">zasebna polja u upitniku</strong>{" "}
              i pozivnica ih sama prikazuje, uredno raspoređene. Ništa od toga
              ne morate da sročite u rečenicu.
            </p>
            <p>
              Jedino što zaista pišete jeste{" "}
              <strong className="text-[#232323]">tagline — jedna do dve
              rečenice</strong> koje stoje na vrhu pozivnice i daju joj ton. To
              je cela sloboda i cela odluka: da li je proslava svečana večera sa
              rodbinom ili žurka sa društvom, čuje se upravo iz te dve rečenice.
            </p>
            <p>
              Druga stvar koju tagline nosi jeste{" "}
              <strong className="text-[#232323]">ko poziva</strong>. Kada poziva
              sam slavljenik, piše se u prvom licu; kada pozivaju roditelji,
              rečenica ide u njihovo ime. Oba su ispravna — bitno je da gost
              odmah zna čija je proslava.
            </p>

            <h3 className="text-xl font-serif text-[#232323] pt-2">
              Primeri kratke poruke — svečan ton
            </h3>
            <ul className="space-y-2.5">
              {[
                "Sa radošću Vas pozivamo da sa nama proslavite punoletstvo naše ćerke.",
                "Imam čast da Vas pozovem na proslavu svog osamnaestog rođendana.",
                "Jedna sveća više, i jedan lep razlog da se okupimo sa najdražima.",
                "Osamnaest godina odrastanja iza nas — veče koje pamtimo pred nama.",
              ].map((t) => (
                <li
                  key={t}
                  className="rounded-xl border border-stone-200 bg-white px-5 py-3 italic"
                >
                  {t}
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-serif text-[#232323] pt-2">
              Primeri kratke poruke — opušten ton
            </h3>
            <ul className="space-y-2.5">
              {[
                "Punim 18 — i to se slavi kako treba. Računam na tebe.",
                "Zvanično punoletan, nezvanično isti. Dođi da to proslavimo kako valja.",
                "Osamnaest godina kasnije, vreme je za slavlje. Vidimo se na proslavi.",
                "Biće muzike, torte i previše fotografija. Fali samo ti.",
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
              Ako vam treba više varijanti, u vodiču{" "}
              <Link
                href="/blog/pozivnica-za-punoletstvo-18-rodjendan"
                className="font-medium text-[#AE343F] hover:underline"
              >
                tekst za pozivnicu za punoletstvo
              </Link>{" "}
              ima gotovih primera koje možete odmah iskoristiti, uključujući i
              šaljive.
            </p>
          </div>
        </section>

        {/* ═══ 7. Digitalna ili štampana ═══ */}
        <section className="mt-16 sm:mt-20">
          <div className="container mx-auto px-4 max-w-3xl space-y-5 text-[#232323]/70 leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#232323]">
              Digitalna ili štampana pozivnica za punoletstvo?
            </h2>
            <p>
              Za osamnaesti rođendan pitanje se obično reši samo od sebe:
              društvo se poziva porukom, a rodbina očekuje nešto opipljivo. Zato
              ovde nije ili-ili. Uz web pozivnicu dobijate i{" "}
              <strong className="text-[#232323]">PDF u A5 formatu sa QR
              kodom</strong>, koji odnesete u štampariju — gost skenira kod sa
              papira i završi na istoj pozivnici.
            </p>
            <p>
              Praktična razlika je u tome što digitalna pozivnica{" "}
              <strong className="text-[#232323]">broji goste umesto vas</strong>.
              Umesto da pamtite ko je šta rekao u Viber prepisci, imate spisak
              koji se sam ažurira. Ako se lokacija ili satnica promene, menjate
              ih na jednom mestu i svi vide novu verziju — link ostaje isti.
            </p>
            <p>
              Ista pozivnica radi i za{" "}
              <Link
                href="/napravi-deciju-pozivnicu"
                className="font-medium text-[#AE343F] hover:underline"
              >
                dečije rođendane
              </Link>
              , a ako planirate venčanje, pogledajte{" "}
              <Link
                href="/pozivnice"
                className="font-medium text-[#AE343F] hover:underline"
              >
                izradu pozivnica online
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ═══ 8. FAQ ═══ */}
        <section className="mt-16 sm:mt-20">
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
                      className="shrink-0 text-[#AE343F] transition-transform group-open:rotate-90"
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
        <section className="mt-16 sm:mt-20">
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
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#AE343F] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-[#F5F4DC] transition-colors hover:bg-[#8A2A32]"
              >
                Napravite pozivnicu
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <section className="py-16 sm:py-20 bg-[#faf9f6] border-t border-[#232323]/5">
        <InvitationClusterLinks current="punoletstvo" />
      </section>
      <Footer />
    </>
  );
}
