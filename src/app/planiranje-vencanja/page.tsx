import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckSquare,
  Wallet,
  Store,
  ArrowRight,
  Calendar,
  ListChecks,
  PiggyBank,
  Search,
  Sparkles,
  Clock,
  Shield,
  Smartphone,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import QuickStartForm from "./QuickStartForm";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title: "Planer za Venčanje — Checklista, Budžet, Vendori | HALO Uspomene",
  description:
    "Online planer za organizaciju venčanja u Srbiji. Checklista zadataka, kalkulator budžeta, direktorijum vendora — sve na jednom mestu uz naše usluge. Registrujte se za 10 sekundi.",
  keywords: [
    "planiranje venčanja",
    "organizacija venčanja",
    "checklista za venčanje",
    "checklista za svadbu",
    "wedding checklist srbija",
    "budžet za venčanje",
    "budžet za venčanje kalkulator",
    "kalkulator za svadbu",
    "troškovi venčanja srbija",
    "vendori za venčanje",
    "vendori za venčanje srbija",
    "organizacija svadbe",
    "planiranje svadbe",
    "wedding planner srbija",
    "besplatan planer za venčanje",
    "online planer venčanje",
    "priprema za venčanje",
    "kako organizovati venčanje",
    "sve za venčanje",
    "alat za organizaciju venčanja",
    "digitalni planer venčanje",
  ],
  openGraph: {
    title: "Planer za Venčanje | HALO Uspomene",
    description:
      "Checklista, budžet kalkulator i direktorijum vendora — sve što vam treba za organizaciju venčanja uz HALO Uspomene.",
    type: "website",
    url: `${siteUrl}/planiranje-vencanja`,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Planer za Venčanje | HALO Uspomene",
    description:
      "Checklista, budžet, vendori — online planer za organizaciju venčanja u Srbiji uz HALO Uspomene.",
  },
  alternates: {
    canonical: `${siteUrl}/planiranje-vencanja`,
  },
};

const features = [
  {
    icon: <ListChecks size={28} />,
    title: "Checklista zadataka",
    desc: "Organizovana po mesecima pre venčanja — od rezervacije sale do poslednjeg detalja. Dodajte, obrišite ili prilagodite zadatke po potrebi.",
    highlights: [
      "Grupisano po periodima (12, 9, 6, 3 meseca...)",
      "Drag-and-drop za preraspoređivanje",
      "Praćenje napretka u procentima",
    ],
  },
  {
    icon: <PiggyBank size={28} />,
    title: "Budžet kalkulator",
    desc: "Unesite ukupni budžet i pratite troškove po kategorijama. Konverzija EUR/RSD u realnom vremenu.",
    highlights: [
      "Predefinisane kategorije troškova",
      "Planirani vs stvarni troškovi",
      "Automatska konverzija EUR ↔ RSD",
      "Dodajte ili obrišite sekcije po potrebi",
    ],
  },
  {
    icon: <Search size={28} />,
    title: "Direktorijum vendora",
    desc: "Pretražite sale, muziku, fotografe, torte, dekoraciju, cveće i ostale vendore širom Srbije.",
    highlights: [
      "Filter po kategoriji i gradu",
      "Sačuvajte favorite",
      "Direktan kontakt: telefon, sajt, Instagram",
      "Sve na jednom mestu",
    ],
  },
];

const howItWorks = [
  {
    n: "01",
    title: "Popunite formu",
    desc: "Unesite vaša imena, kontakt i lozinku — traje 10 sekundi.",
  },
  {
    n: "02",
    title: "Dobijate pristup",
    desc: "Odmah ste u planeru — sa gotovom checklistom, budžetom i vendorima.",
  },
  {
    n: "03",
    title: "Organizujte venčanje",
    desc: "Koristite alate koliko god želite. Besplatno je, samo kasnije goste pozovite našom pozivnicom!",
  },
];

const faqItems = [
  {
    q: "Da li je planer uključen u cenu?",
    a: "Da. Checklista, budžet kalkulator i direktorijum vendora su uključeni za sve parove koji koriste naše usluge — bez dodatnih troškova. Planer je dostupan odmah nakon registracije.",
  },
  {
    q: "Da li je planer povezan sa pozivnicom?",
    a: "Planer je deo naše platforme za organizaciju venčanja. Registrujete se i odmah počinjete sa planiranjem, a naš tim će vam se javiti da zajedno izaberemo pravi paket za vaše venčanje — pozivnicu, telefon uspomena ili oba.",
  },
  {
    q: "Kako se prijavljujem nakon registracije?",
    a: "Na stranici /moje-vencanje unesite vaš slug (npr. ana-dejan) i lozinku koju ste izabrali prilikom registracije.",
  },
  {
    q: "Da li moji podaci ostaju sačuvani?",
    a: "Da. Sve što unesete — zadaci, budžet, favoriti — čuva se na serveru. Možete se prijaviti sa bilo kog uređaja i nastaviti gde ste stali.",
  },
  {
    q: "Šta uključuje checklista?",
    a: "Preko 40 predefinisanih zadataka organizovanih po periodima: 12 meseci pre, 9 meseci, 6 meseci, 3 meseca, mesec dana, nedelju dana i dan venčanja. Možete dodavati sopstvene zadatke.",
  },
  {
    q: "Kako funkcioniše budžet kalkulator?",
    a: "Unesete ukupni budžet, a zatim pratite troškove po kategorijama (sala, muzika, fotograf, torta...). Za svaku kategoriju unosite planirani i stvarni trošak. Kalkulator automatski računa preostali budžet i podržava EUR/RSD konverziju.",
  },
  {
    q: "Koji vendori su dostupni u direktorijumu?",
    a: "Direktorijum pokriva sale, muziku, fotografe i video snimatelje, torte, dekoraciju, cveće, vatromet, prevoz, poklone i još mnogo toga. Vendori su iz Beograda, Novog Sada, Niša, Kragujevca, Subotice i drugih gradova.",
  },
  {
    q: "Da li planer radi na telefonu?",
    a: "Da! Planer je optimizovan za mobilne uređaje i može se instalirati kao aplikacija na Android i iOS uređajima — direktno sa sajta, bez app store-a.",
  },
];

export default function PlaniranjeVencanjaPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "HALO Uspomene — Planer za Venčanje",
    description:
      "Besplatan online planer za organizaciju venčanja: checklista, budžet kalkulator, direktorijum vendora.",
    url: `${siteUrl}/planiranje-vencanja`,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "RSD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "3",
    },
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />

        {/* ═══ HERO ═══ */}
        <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#AE343F]/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#d4af37]/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="mb-6">
              <Breadcrumbs
                items={[
                  { label: "Početna", href: "/" },
                  { label: "Planiranje venčanja" },
                ]}
              />
            </div>

            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#AE343F]/10 rounded-full mb-6">
                <Sparkles size={14} className="text-[#AE343F]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#AE343F]">
                  BESPLATNO uz našu pozivnicu!
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] mb-6 leading-[1.1]">
                Planer za{" "}
                <span className="text-[#AE343F] italic">Venčanje</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#232323]/60 leading-relaxed mb-8 max-w-xl">
                Checklista zadataka, budžet kalkulator i direktorijum vendora —
                sve što vam treba da organizujete venčanje bez stresa.
                Registrujte se za 10 sekundi.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: <CheckSquare size={14} />, label: "Checklista" },
                  { icon: <Wallet size={14} />, label: "Budžet" },
                  { icon: <Store size={14} />, label: "Vendori" },
                  { icon: <Smartphone size={14} />, label: "Aplikacija" },
                ].map((pill) => (
                  <span
                    key={pill.label}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#232323]/8 rounded-full text-sm text-[#232323]/60"
                  >
                    <span className="text-[#AE343F]">{pill.icon}</span>
                    {pill.label}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 text-sm text-[#232323]/40">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#AE343F]" />
                    Registracija za 10 sekundi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ DON'T HAVE ALL DATA YET? ═══ */}
        <section className="py-16 sm:py-20 bg-white border-b border-stone-100">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-4">
                Često pitanje
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#232323] mb-4">
                Da li moram odmah da napravim pozivnicu?
              </h2>
            </div>

            <div className="bg-[#F5F4DC]/50 border border-[#d4af37]/20 rounded-2xl p-6 sm:p-8">
              <p className="text-[#232323]/70 leading-relaxed mb-4">
                <strong className="text-[#232323]">Ne, ne morate.</strong> Mnogi
                parovi još nemaju sve podatke za pozivnicu — datum venčanja,
                lokaciju, program dana. I to je potpuno u redu.
              </p>
              <p className="text-[#232323]/70 leading-relaxed mb-4">
                Registrujte se putem{" "}
                <Link
                  href="#registracija"
                  className="text-[#AE343F] font-semibold hover:underline"
                >
                  brze registracije
                </Link>{" "}
                na dnu stranice i odmah počnite da koristite checklistu, budžet
                i direktorijum vendora. Naš će već biti u kontaktu sa vama pa
                ćete nam dostaviti informacije kada budete znali sve — nakon
                toga mi ćemo napraviti pozivnicu za manje od 24h.
              </p>
              <p className="text-sm text-[#232323]/50 italic">
                Ukratko: registrujte se odmah → planirajte → pozivnicu napravimo
                zajedno kad budete imali sve podatke.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Šta dobijate
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4">
                Tri alata za savršeno venčanje
              </h2>
              <p className="text-[#232323]/50 max-w-2xl mx-auto">
                Sve što vam treba za organizaciju — od prvog planiranja do dana
                venčanja.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-[#faf9f6] rounded-2xl p-6 sm:p-8 border border-stone-100"
                >
                  <div className="w-14 h-14 bg-[#AE343F]/10 rounded-xl flex items-center justify-center mb-5 text-[#AE343F]">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-serif text-[#232323] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#232323]/60 leading-relaxed mb-4">
                    {feature.desc}
                  </p>
                  <ul className="space-y-2">
                    {feature.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 text-xs text-[#232323]/50"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#AE343F] mt-1.5 shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="py-16 sm:py-24 bg-[#232323] relative overflow-hidden">
          <style>{`
            @keyframes dotWavePlanner {
              0%   { background-position: 0px 0px; }
              50%  { background-position: 14px 14px; }
              100% { background-position: 0px 0px; }
            }
          `}</style>
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #F5F4DC 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              animation: "dotWavePlanner 12s ease-in-out infinite",
            }}
          />

          <div className="container mx-auto px-4 max-w-3xl relative z-10">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Kako početi
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F4DC] mb-4">
                3 koraka do organizovanog venčanja
              </h2>
            </div>

            <div className="space-y-5">
              {howItWorks.map((step) => (
                <div
                  key={step.n}
                  className="flex items-start gap-5 bg-white/[0.07] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
                >
                  <span className="text-[#AE343F] font-serif font-black text-2xl w-10 shrink-0 mt-0.5">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="text-[#F5F4DC] text-lg font-semibold mb-1">
                      {step.title}
                    </h3>
                    <p className="text-[#F5F4DC]/50 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="#registracija"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#AE343F] text-white text-sm uppercase tracking-widest font-medium hover:bg-[#8B2833] transition-all rounded-full"
              >
                Registrujte se
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ ALSO AVAILABLE ═══ */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Kada budete spremni
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#232323] mb-4">
                Kompletna platforma za venčanje
              </h2>
              <p className="text-[#232323]/50 max-w-2xl mx-auto">
                Planer je samo početak. Uz pozivnicu dobijate sve alate na
                jednom mestu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/cene"
                className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:border-[#AE343F]/20 hover:shadow-md transition-all group"
              >
                <p className="text-sm font-semibold text-[#232323] group-hover:text-[#AE343F] transition-colors mb-1">
                  Website Pozivnica
                </p>
                <p className="text-xs text-[#232323]/40 mb-3">
                  RSVP, odbrojavanje, mapa, PDF za štampu
                </p>
                <span className="text-xs text-[#AE343F] font-medium inline-flex items-center gap-1">
                  od 5.000 din <ArrowRight size={12} />
                </span>
              </Link>
              <Link
                href="/telefon-uspomena"
                className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:border-[#AE343F]/20 hover:shadow-md transition-all group"
              >
                <p className="text-sm font-semibold text-[#232323] group-hover:text-[#AE343F] transition-colors mb-1">
                  Telefon Uspomena
                </p>
                <p className="text-xs text-[#232323]/40 mb-3">
                  Retro telefon za glasovne poruke gostiju
                </p>
                <span className="text-xs text-[#AE343F] font-medium inline-flex items-center gap-1">
                  9.000 din <ArrowRight size={12} />
                </span>
              </Link>
              <Link
                href="/cene"
                className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:border-[#AE343F]/20 hover:shadow-md transition-all group"
              >
                <p className="text-sm font-semibold text-[#232323] group-hover:text-[#AE343F] transition-colors mb-1">
                  Raspored Sedenja
                </p>
                <p className="text-xs text-[#232323]/40 mb-3">
                  Drag-and-drop editor, gosti nalaze sto sami
                </p>
                <span className="text-xs text-[#AE343F] font-medium inline-flex items-center gap-1">
                  2.500 din <ArrowRight size={12} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-16 sm:py-24 bg-gradient-to-t from-[#faf9f6] to-[#AE343F]/10 border-t-4 border-[#AE343F]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#AE343F]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Česta pitanja
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
                Sve o planeru za venčanje
              </h2>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="collapse collapse-arrow bg-[#faf9f6] rounded-2xl border border-stone-200"
                >
                  <input type="checkbox" />
                  <div className="collapse-title text-base sm:text-lg font-medium text-[#232323] pr-12">
                    {item.q}
                  </div>
                  <div className="collapse-content">
                    <p className="text-[#232323]/60 leading-relaxed pt-2">
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ BOTTOM CTA — SIGNUP FORM ═══ */}
        <section
          id="registracija"
          className="py-16 sm:py-20 md:py-24 bg-[#232323] text-[#F5F4DC] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-[#AE343F]/10 rounded-full blur-2xl sm:blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-[#AE343F]/5 rounded-full blur-2xl sm:blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="container mx-auto px-4 max-w-lg relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4">
                Počnite da planirate
              </h2>
              <p className="text-lg text-[#F5F4DC]/50">
                Za 10 sekundi imate kompletan planer sa checklistom, budžetom i
                vendorima.
              </p>
            </div>
            <QuickStartForm />
          </div>
        </section>

        {/* ═══ SEO HIDDEN CONTENT ═══ */}
        <section className="sr-only">
          <h2>Planer za Organizaciju Venčanja u Srbiji</h2>
          <p>
            HALO Uspomene nudi online planer za organizaciju venčanja uz naše
            usluge. Planer uključuje checklistu zadataka organizovanu po
            mesecima pre venčanja, budžet kalkulator sa EUR/RSD automatskom
            konverzijom, i bazu velikog broja vendora sa filterima po kategoriji
            i gradu. Dostupan je kao aplikacija za mobilne telefone!
          </p>
          <p>
            Planiranje venčanja, organizacija venčanja, checklista za venčanje,
            checklista za svadbu, budžet za venčanje, kalkulator troškova za
            venčanje, vendori za venčanje Srbija, sale za venčanje, muzika za
            venčanje, fotograf za venčanje, torta za venčanje, dekoracija za
            venčanje, cveće za venčanje, wedding planner Srbija, online planer
            venčanje, digitalni planer za svadbu.
          </p>
          <p>
            Vendori u Beogradu, Novom Sadu, Nišu, Kragujevcu, Subotici i svim
            gradovima Srbije. Planer za venčanje uključen uz pozivnicu.
            Registracija za 10 sekundi. Pogledajte i naše{" "}
            <Link href="/cene">cene pozivnica</Link>,{" "}
            <Link href="/telefon-uspomena">telefon uspomena</Link> i{" "}
            <Link href="/lokacije">dostupne gradove</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
