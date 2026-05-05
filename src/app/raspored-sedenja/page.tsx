import React from "react";
import type { Metadata } from "next";
import {
  Armchair,
  ArrowRight,
  Building2,
  Briefcase,
  PartyPopper,
  FileSpreadsheet,
  Mail,
  MousePointerClick,
  Printer,
  QrCode,
  Sparkles,
  Users,
  Shuffle,
  Check,
} from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  formatPrice,
  getStandaloneSeatingPrice,
  getStandaloneSeatingRegularPrice,
  isStandaloneSeatingPromoActive,
} from "@/data/pricing";
import RasporedKontaktForm from "./RasporedKontaktForm";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  title:
    "Raspored sedenja za organizatore — Online alat sa QR Panoom | HALO Uspomene",
  description:
    "Online raspored sedenja za konferencije, korporativne evente i proslave. Drag-and-drop editor stolova, Excel/CSV uvoz gostiju, QR Pano dobrodošlice za ulaz u salu. Pristup po dogovoru.",
  keywords: [
    "raspored sedenja online",
    "raspored stolova alat",
    "online raspored sedenja",
    "seating chart alat",
    "raspored sedenja za konferenciju",
    "raspored sedenja za korporativni event",
    "raspored sedenja za organizatore",
    "QR pano za event",
    "drag and drop raspored stolova",
    "import gostiju iz Excel-a",
    "raspored sedenja Beograd",
    "raspored sedenja Srbija",
  ],
  openGraph: {
    title: "Raspored sedenja za organizatore | HALO Uspomene",
    description:
      "Online alat za raspored stolova + QR Pano dobrodošlice. Za konferencije, korporativne evente i veće proslave.",
    type: "website",
    url: `${siteUrl}/raspored-sedenja`,
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raspored sedenja za organizatore | HALO Uspomene",
    description:
      "Online alat za raspored stolova + QR Pano dobrodošlice za vaš event.",
  },
  alternates: {
    canonical: `${siteUrl}/raspored-sedenja`,
  },
};

const steps = [
  {
    n: "01",
    icon: <Mail size={22} />,
    title: "Popunite kontakt formu",
    desc: "Otvorite formu na dnu ove stranice i ostavite osnovne podatke o događaju. Javljamo Vam se u toku 24h sa potvrdom i uputstvom za korišćenje.",
  },
  {
    n: "02",
    icon: <MousePointerClick size={22} />,
    title: "Dobijete privatan pristup",
    desc: "Otvorite link, dodate goste direktno iz Excel/CSV fajla ili unesete goste ručno, postavite stolove prema šemi sale i na kraju rasporedite goste.",
  },
  {
    n: "03",
    icon: <Printer size={22} />,
    title: "QR Pano za ulaz",
    desc: "Generišete pano dobrodošlice ili samo QR kod za štampu. Postavite pano na ulaz u salu ili prosledite hostesi link na kom će lako i brzo pronaći mesto svakom gostu.",
  },
];

const benefits = [
  {
    icon: <Users size={20} />,
    title: "Bez gužve na ulazu",
    desc: "Postavite pano na ulazu i gosti će se sami snaći — ili prosledite link hostesi koja će lako pronaći mesto svakom gostu bez haosa sa štampanim spiskovima.",
  },
  {
    icon: <Shuffle size={20} />,
    title: "Promene u zadnji čas",
    desc: "Neko je otkazao? Dolaze dodatni gosti? Promenite raspored u editoru — pano i link ostaju isti, sve se ažurira u realnom vremenu tako da budite bez brige.",
  },
  {
    icon: <FileSpreadsheet size={20} />,
    title: "Excel / CSV uvoz",
    desc: "Već imate spisak u Excel-u? Učitajte fajl, naš alat ga procesuira (ime zvanice, broj gostiju, kategorija) i gosti su spremni za raspoređivanje za par sekundi.",
  },
  {
    icon: <Sparkles size={20} />,
    title: "Wow utisak",
    desc: "Ostavite profesionalan utisak koji odudara od standardnih šablona. Gosti će pričati o ovim detaljima, a vi ćete biti ponosni na nivo organizacije.",
  },
];

const useCases = [
  {
    icon: <Briefcase size={26} />,
    title: "Korporativni eventi",
    desc: "Gala večere, godišnjice firme, team building — lako razvrstavanje gostiju po timovima ili nivoima rukovodstva.",
  },
  {
    icon: <Building2 size={26} />,
    title: "Konferencije i forumi",
    desc: "Panel diskusije, seminari, prezentacije — sto za govornike, okrugli stolovi i jasno definisana mesta za sve.",
  },
  {
    icon: <PartyPopper size={26} />,
    title: "Veće proslave",
    desc: "Punoletstva, jubileji, godišnjice — kad imate više od 50 gostiju i hoćete da svako zna gde sedi bez gužve na ulazu.",
  },
];

export default function RasporedSedenjaLanding() {
  const standalonePrice = getStandaloneSeatingPrice();
  const standaloneRegular = getStandaloneSeatingRegularPrice();
  const standalonePromoActive = isStandaloneSeatingPromoActive();
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-12 sm:pt-36 sm:pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-[#F5F4DC] to-[#faf9f6] overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#AE343F]/8 rounded-full blur-[120px] translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] -translate-x-1/3" />

          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Raspored sedenja za organizatore" },
              ]}
            />

            <div className="max-w-4xl mx-auto mt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#AE343F]/8 border border-[#AE343F]/20 rounded-full mb-5">
                <Armchair size={12} className="text-[#AE343F]" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#AE343F]">
                  Za organizatore
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#232323] leading-tight mb-5">
                Raspored sedenja{" "}
                <span className="italic text-[#AE343F]">za vaš event</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-[#232323]/65 leading-relaxed mb-8 max-w-2xl">
                Online alat za raspoređivanje stolova i gostiju + QR pano
                dobrodošlice za ulaz u salu. Idealan za konferencije, forume,
                godišnjice, korporativne događaje i veće proslave gde imate
                listu gostiju i želite da svako odmah zna gde sedi.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#kontakt-raspored"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-xl shadow-[#AE343F]/20"
                >
                  Kontaktirajte nas
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Kako radi
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
                Tri koraka i sve je{" "}
                <span className="italic text-[#AE343F]">organizovano</span>.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {steps.map((step) => (
                <div
                  key={step.n}
                  className="relative bg-[#faf9f6] rounded-2xl sm:rounded-3xl p-7 sm:p-8 border border-stone-200"
                >
                  <span className="absolute top-5 right-6 text-5xl font-serif font-black text-[#AE343F]/15">
                    {step.n}
                  </span>
                  <div className="w-14 h-14 rounded-2xl bg-[#AE343F] text-[#F5F4DC] flex items-center justify-center mb-5 shadow-lg shadow-[#AE343F]/30">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#232323] mb-3 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#232323]/65 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-16 sm:py-20 bg-[#F5F4DC]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Za koga je ovo
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
                Tipovi događaja
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {useCases.map((u) => (
                <div
                  key={u.title}
                  className="bg-white rounded-2xl p-7 border border-stone-200 text-center"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mb-5">
                    {u.icon}
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#232323] mb-2">
                    {u.title}
                  </h3>
                  <p className="text-sm text-[#232323]/65 leading-relaxed">
                    {u.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
                Prednosti
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] leading-tight">
                Bolji od ručnih spiskova jer:
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="flex items-start gap-4 bg-[#faf9f6] rounded-2xl p-6 border border-stone-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#232323] mb-1">
                      {b.title}
                    </p>
                    <p className="text-sm text-[#232323]/60 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="py-16 sm:py-20 bg-[#F5F4DC]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-10 md:p-12 border border-stone-200">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#232323] text-center mb-8">
                Šta tačno dobijate
              </h2>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-8">
                {[
                  "Jednostavan alat za raspoređivanje stolova prema sali",
                  "Okrugli, pravougaoni i jednostrani stolovi",
                  "Excel / CSV uvoz gostiju (ime, broj, kategorija)",
                  "Ručno dodavanje, izmena i brisanje gostiju",
                  "Filtriranje po kategorijama (npr. VIP, Govornici, Studenti)",
                  'Personalizovan link „Gde sedim?" za goste',
                  "QR kod (visoka rezolucija za štampu)",
                  "QR pano u B1 formatu spreman za štampu (PDF format)",
                  "Mapa sale sa vizuelnim rasporedom stolova",
                  "Promene moguće do poslednjeg trenutka",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-[#232323]/80"
                  >
                    <Check
                      size={16}
                      className="text-[#AE343F] shrink-0 mt-0.5"
                      strokeWidth={2.5}
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-4 border-t border-stone-200">
                {standalonePromoActive && (
                  <span className="inline-block mb-3 px-3 py-1 rounded-full bg-[#AE343F]/10 text-[#AE343F] text-[10px] font-bold uppercase tracking-[0.2em]">
                    Majska akcija
                  </span>
                )}
                <div className="flex items-baseline justify-center gap-3 mb-5">
                  {standalonePromoActive && (
                    <span className="text-xl sm:text-2xl font-serif text-stone-400 line-through">
                      {formatPrice(standaloneRegular)}
                    </span>
                  )}
                  <p className="text-4xl sm:text-5xl font-serif text-[#AE343F]">
                    {formatPrice(standalonePrice)}
                  </p>
                </div>
                <a
                  href="#kontakt-raspored"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] text-sm uppercase tracking-widest font-medium rounded-full transition-all shadow-xl shadow-[#AE343F]/20"
                >
                  Pošaljite nam upit
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* RSVP QR bonus */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#faf9f6] to-[#F5F4DC] rounded-3xl p-8 sm:p-10 md:p-12 border border-stone-200">
              <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center shrink-0">
                  <QrCode size={36} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-3">
                    Bonus
                  </p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#232323] leading-tight mb-4">
                    Gosti potvrđuju sami —{" "}
                    <span className="italic text-[#AE343F]">
                      ne unosite ručno
                    </span>
                  </h2>
                  <p className="text-base text-[#232323]/70 leading-relaxed mb-5">
                    Uz alat dobijate i poseban QR kod do stranice za online
                    potvrdu dolaska. Zalepite ga na štampane pozivnice — gosti
                    skeniraju, ukucaju ime i broj osoba, i automatski ulaze u
                    Vašu listu gostiju spremni za raspoređivanje. Nema
                    preuzimanja Excel fajlova, nema ručnog unosa, nema SMS-ova.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    {[
                      "Minimalna stranica — samo ime + broj osoba",
                      "Potvrde direktno upadaju u Vašu listu gostiju",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-2 text-sm text-[#232323]/80"
                      >
                        <Check
                          size={15}
                          className="text-[#AE343F] shrink-0 mt-0.5"
                          strokeWidth={2.5}
                        />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact form */}
        <section
          id="kontakt-raspored"
          className="py-16 sm:py-20 md:py-24 bg-[#232323] text-[#F5F4DC] relative overflow-hidden scroll-mt-20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#AE343F]/15 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#AE343F]/8 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10 sm:mb-12">
                <Armchair size={28} className="mx-auto mb-5 text-[#AE343F]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-3">
                  Kontakt
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4">
                  Spremni da organizujete?
                </h2>
                <p className="text-base sm:text-lg text-[#F5F4DC]/65 leading-relaxed">
                  Ostavite osnovne podatke o događaju — a mi ćemo Vas
                  kontaktirati u roku od 24h
                </p>
              </div>

              <RasporedKontaktForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
