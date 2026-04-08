"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import QuestionnaireForm from "./QuestionnaireForm";

export default function FormPageWrapper() {
  const [isPremium, setIsPremium] = useState(false);

  return (
    <main
      className={`min-h-screen pt-28 pb-20 transition-colors duration-500 ${
        isPremium
          ? "bg-[#fffdf5]"
          : "bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]"
      }`}
    >
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header — transforms between classic and premium */}
        <AnimatePresence mode="wait">
          {isPremium ? (
            <motion.div
              key="premium-header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#d4af37] mb-5">
                Premium AI Studio
              </h1>
            </motion.div>
          ) : (
            <motion.div
              key="classic-header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#AE343F] mb-5">
                Napravite svoju pozivnicu
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        <QuestionnaireForm onPremiumChange={setIsPremium} />
      </div>

      {/* Hidden SEO content — visible to crawlers, not to users */}
      <div className="sr-only" aria-hidden="true">
        <h2>
          Website pozivnica za venčanje — napravite svoju online pozivnicu
        </h2>
        <p>
          HALO Uspomene izrađuje personalizovane website pozivnice za venčanja u
          Srbiji. Naša usluga obuhvata kreiranje elegantne online pozivnice sa
          RSVP formom, odbrojavanjem do venčanja i detaljnim programom dana
          svadbe.
        </p>
        <h3>Kako funkcioniše izrada website pozivnice za venčanje?</h3>
        <p>
          Popunite kratki upitnik u 6 koraka: unesite ime i prezime mladenaca,
          datum i lokaciju venčanja, odaberite temu boja i stil fonta, dodajte
          program svadbe i kontakt informacije. Mi zatim za 24 sata pravimo vašu
          personalozivanu digitalnu pozivnicu i šaljemo vam link koji možete
          podeliti sa gostima putem WhatsApp-a, Vibera, Telegrama ili e-maila.
        </p>
        <h3>Šta je uključeno u website pozivnicu za venčanje?</h3>
        <ul>
          <li>
            Personalizovani dizajn u odabranoj temi boja (zlato, ruža, terakota,
            sage, plava)
          </li>
          <li>Elegantni skript fontovi — latinični i ćirilični</li>
          <li>RSVP forma za potvrdu dolaska gostiju</li>
          <li>Odbrojavanje do dana venčanja</li>
          <li>Program venčanja — ceremonija, koktel, večera, ples</li>
          <li>Lokacija ceremonije i salle na Google Maps</li>
          <li>Kontakt informacije mladenaca ili kuma</li>
          <li>Optimizovano za mobilne uređaje i desktop</li>
        </ul>
        <h3>Zašto odabrati website pozivnicu za venčanje?</h3>
        <p>
          Website pozivnica za venčanje je moderna alternativa štampanim
          pozivnicama. Nema troškova štampe, slanja ili kašnjenja. Gosti lako
          pristupaju pozivnici na svom telefonu, potvrđuju dolazak jednim klikom
          i uvek imaju sve informacije na jednom mestu. Idealno za venčanja u
          Beogradu, Novom Sadu, Nišu, Kragujevcu i svim gradovima u Srbiji.
        </p>
        <h3>Cena website pozivnice za venčanje</h3>
        <p>
          Website pozivnica za venčanje u paketu sa HALO Uspomene audio gostom
          knjigom dostupna je po specijalnoj ceni. Pozivnica se može naručiti i
          samostalno. Kontaktirajte nas za više informacija o cenama i paketima.
        </p>
        <h3>Oblasti koje pokrivamo</h3>
        <p>
          Website pozivnica za venčanje Beograd, website pozivnica Novi Sad,
          online venčana pozivnica Niš, pozivnica za svadbu Kragujevac, Subotica,
          kao i za sva venčanja u Srbiji i regionu.
        </p>
      </div>

      {/* Link to birthday invitation */}
      <div className="max-w-3xl mx-auto mt-12 px-4 text-center">
        <a href="/napravi-deciju-pozivnicu" className="birthday-link-btn">
          Tražite pozivnicu za dečiji rođendan? →
        </a>
      </div>
    </main>
  );
}
