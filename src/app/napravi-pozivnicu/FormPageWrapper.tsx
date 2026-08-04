"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuestionnaireForm from "./QuestionnaireForm";
import type { ThemeType, ScriptFontType } from "@/app/pozivnica/[slug]/types";

// Re-exported from the shared lib so existing imports keep working.
import type { BypassInfo } from "@/lib/bypass-token";
export type { BypassInfo };

export interface UpgradeInitialFormData {
  bride: string;
  groom: string;
  full_display: string;
  useCyrillic: boolean;
  premium: boolean;
  event_date: string;
  event_date_only: string;
  event_time: string;
  submit_until_date: string;
  contact_phone: string;
  contact_phone_secondary: string;
  scriptFont: ScriptFontType;
  theme: ThemeType;
  tagline: string;
  thankYouFooter: string;
  countdown_enabled: boolean;
  map_enabled: boolean;
  extra_raspored: boolean;
  extra_audio: boolean;
  extra_usb_kaseta: boolean;
  extra_usb_bocica: boolean;
}

interface Props {
  upgradeSlug?: string;
  forcePremium?: boolean;
  initialFormData?: UpgradeInitialFormData;
  bypassInfo?: BypassInfo;
  /** Sadržaj koji ide ISPOD formulara, ali i dalje UNUTAR `<main>`.
   *  Ova komponenta renderuje `<main>` kao svoj koren, pa bi sekcije dodate u
   *  `page.tsx` posle nje završile izvan glavnog sadržaja — a pretraživači to
   *  tretiraju kao okvir stranice, slično podnožju. */
  children?: React.ReactNode;
}

export default function FormPageWrapper({
  upgradeSlug,
  forcePremium,
  initialFormData,
  bypassInfo,
  children,
}: Props) {
  // In upgrade mode the premium choice is locked to the value chosen from the
  // portal — user picked "Premium" or "Klasik" before entering the stepper, and
  // can't toggle mid-flow because step routing depends on it.
  const isUpgrade = !!upgradeSlug;
  const [isPremium, setIsPremium] = useState(
    isUpgrade ? !!forcePremium : false,
  );

  return (
    <main
      // `id` nosi anchor `#formular` iz donjeg CTA bloka na stranici.
      id="formular"
      className={`min-h-screen pt-28 pb-20 scroll-mt-28 transition-colors duration-500 ${
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
                {isUpgrade ? "Nadogradnja u Premium" : "Premium Studio"}
              </h1>
              {isUpgrade && (
                <p className="text-sm text-[#8B7355] max-w-md mx-auto">
                  Dovršavate kreiranje svoje pozivnice. Vaš link i lozinka
                  ostaju isti.
                </p>
              )}
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
                {isUpgrade
                  ? "Nadogradnja klasične pozivnice"
                  : "Napravite svoju pozivnicu"}
              </h1>
              {isUpgrade && (
                <p className="text-sm text-[#8B2833] max-w-md mx-auto">
                  Dovršavate kreiranje svoje pozivnice. Vaš link i lozinka
                  ostaju isti.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <QuestionnaireForm
          onPremiumChange={setIsPremium}
          upgradeSlug={upgradeSlug}
          lockPremiumToggle={isUpgrade}
          initialFormData={initialFormData}
          bypassInfo={bypassInfo}
        />

      </div>

      {/* Ovde je stajao `sr-only` blok od ~330 reci. Uklonjen 2026-08-04 iz dva
          razloga: sadrzaj je sada VIDLJIV ispod formulara (sekcije „Sta
          dobijate", „Sta zapravo pisete", FAQ), a stari tekst je bio i
          NETACAN — tvrdio je „Kontaktirajte nas za vise informacija o cenama",
          sto protivreci fiksnoj ceni od 5.000 din koja stoji svuda drugde, i
          nabrajao teme boja koje vise ne odgovaraju formi. */}


      {/* Dugme „Tražite pozivnicu za rođendan?" uklonjeno 2026-08-04 — odvlačilo
          je posetioca sa forme za venčanje. Rođendanske pozivnice se i dalje
          nude preko `InvitationClusterLinks` na dnu stranice, a `BirthdayTypeButton`
          ostaje u upotrebi na `/pozivnice`. */}

      {children}
    </main>
  );
}
