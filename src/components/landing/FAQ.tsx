import React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

/**
 * FAQ na početnoj strani.
 *
 * Dva razloga zašto postoji:
 * 1. `id="faq"` — footer već linkuje `/#faq`, a taj anchor do sada nije
 *    postojao nigde na sajtu, pa je link vodio u prazno.
 * 2. FAQPage schema — početna je stranica koju pretraživači i AI asistenti
 *    najverovatnije citiraju kada neko pita "šta je HALO Uspomene". Pitanja i
 *    odgovori u strukturiranom obliku su format koji ti sistemi najradije
 *    preuzimaju, a početna ga jedina od glavnih stranica nije imala.
 *
 * Odgovori namerno počinju direktnom tvrdnjom (bez uvoda), jer se za featured
 * snippet i AI citat uzima prva rečenica.
 */

export const homeFaqItems = [
  {
    q: "Šta je HALO Uspomene?",
    a: "HALO Uspomene je srpska platforma za organizaciju venčanja i proslava. Na jednom mestu dobijate digitalnu pozivnicu sa potvrdama dolaska, raspored sedenja, QR pano dobrodošlice, QR galeriju slika, audio knjigu utisaka i planer venčanja. Posredujemo i usluge za dan venčanja: retro telefon, oldtajmere, luksuzna vozila, paviljone i lažnog matičara.",
  },
  {
    q: "Koliko košta digitalna pozivnica za venčanje?",
    a: "Website pozivnica za venčanje počinje od 5.000 dinara i uključuje potvrde dolaska, odbrojavanje, mapu do lokacije i PDF za štampu. Rođendanske pozivnice — dečji rođendan, prvi rođendan i punoletstvo — koštaju 4.500 dinara. Sve aktuelne cene i pakete možete videti na stranici sa cenama.",
  },
  {
    q: "Kako funkcionišu potvrde dolaska?",
    a: "Gost otvori link pozivnice i jednim klikom potvrdi dolazak — bez aplikacije i bez registracije. Vi u svom portalu vidite spisak gostiju uživo, ko je potvrdio, ko je otkazao i koliko je ukupno osoba. Spisak možete izvesti i koristiti za raspored sedenja.",
  },
  {
    q: "Šta je retro telefon uspomena?",
    a: "To je vintage telefon sa brojčanikom koji stoji na vašoj svadbi i snima glasovne poruke gostiju. Radi na bateriju, bez interneta i bez aplikacije, a broj poruka nije ograničen. Posle venčanja dobijate sve snimke, a jedini u Srbiji nudimo i USB suvenire — retro kasetu ili uspomene u bočici.",
  },
  {
    q: "Da li gosti moraju nešto da instaliraju?",
    a: "Ne. Sve što nudimo radi kroz običan link ili QR kod u pregledaču telefona — potvrda dolaska, pretraga Gde sedim, dodavanje fotografija u galeriju i snimanje audio čestitke. Nema aplikacija, naloga ni lozinki za goste.",
  },
  {
    q: "Koliko brzo je pozivnica gotova?",
    a: "Odmah. Popunite upitnik, izaberete temu i font, i pozivnica je napravljena — otključavate je nakon uplate i istog trenutka možete da je šaljete gostima. Izmene su moguće sve do dana venčanja.",
  },
  {
    q: "Da li radite u celoj Srbiji?",
    a: "Da. Digitalni proizvodi rade svuda, a fizičke usluge — retro telefon, QR pano, oldtajmeri, paviljoni i lažni matičar — pokrivamo u celoj Srbiji. Telefon i pano šaljemo kurirskom službom, uz ličnu dostavu i montažu u Novom Sadu.",
  },
  {
    q: "Šta ako nam zatreba pomoć tokom organizacije?",
    a: "Uz naše pakete dobijate planer Moje Venčanje — checklistu sa preko 40 zadataka, kalkulator budžeta i direktorijum proverenih vendora. Dostupni smo svakog dana od 9 do 23 časa putem mejla, WhatsApp-a i Instagrama.",
  },
];

const FAQ: React.FC = () => {
  return (
    <section
      id="faq"
      className="py-16 sm:py-24 md:py-32 bg-white relative overflow-hidden"
    >
      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
            Česta pitanja
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
            Sve što vas zanima
          </h2>
          <p className="text-lg text-[#232323]/50 max-w-2xl mx-auto">
            Najčešća pitanja parova pre nego što krenu sa organizacijom. Ako vam
            nešto nije jasno, pišite nam — odgovaramo svakog dana.
          </p>
        </div>

        <div className="space-y-4">
          {homeFaqItems.map((item) => (
            <details
              key={item.q}
              className="group bg-[#F5F4DC]/50 rounded-2xl border border-stone-100 overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 sm:p-6 font-serif text-lg sm:text-xl text-[#232323] list-none">
                {item.q}
                <ChevronDown
                  size={20}
                  className="shrink-0 text-[#AE343F] group-open:rotate-180 transition-transform"
                />
              </summary>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-[#232323]/60 leading-relaxed text-[15px] sm:text-base text-justify hyphens-auto">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        <p className="text-center text-sm text-[#232323]/50 mt-10">
          Detaljnije o paketima i cenama pogledajte na{" "}
          <Link
            href="/cene"
            className="text-[#AE343F] font-medium hover:underline"
          >
            stranici sa cenama
          </Link>
          , a saveti za organizaciju su na{" "}
          <Link
            href="/blog"
            className="text-[#AE343F] font-medium hover:underline"
          >
            našem blogu
          </Link>
          .
        </p>
      </div>
    </section>
  );
};

export default FAQ;
