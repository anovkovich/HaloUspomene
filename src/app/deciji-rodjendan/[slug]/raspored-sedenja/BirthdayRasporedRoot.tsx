"use client";

import type { RSVPEntry } from "@/lib/rsvp";
import type {
  BirthdayThemeType,
  BirthdayType,
} from "@/app/deciji-rodjendan/[slug]/types";
import RasporedClient from "@/app/pozivnica/[slug]/raspored-sedenja/RasporedClient";
import {
  saveBirthdayRaspored,
  loadBirthdayRaspored,
  checkBirthdayPaidStatus,
} from "./actions";
import { generateBirthdayWelcomePDF } from "./generateBirthdayWelcomePDF";

interface Props {
  slug: string;
  honoreeDisplay: string;
  age: number;
  type: BirthdayType;
  birthdayTheme: BirthdayThemeType;
  paidForRaspored: boolean;
  attending: RSVPEntry[];
}

/**
 * Client-side root for the birthday seating editor. Owns the welcome-PDF
 * closure (holds birthday-specific context) and wires the birthday server
 * actions into the shared RasporedClient.
 */
export default function BirthdayRasporedRoot({
  slug,
  honoreeDisplay,
  age,
  type,
  birthdayTheme,
  paidForRaspored,
  attending,
}: Props) {
  return (
    <RasporedClient
      attending={attending}
      slug={slug}
      coupleNames={honoreeDisplay}
      paidForRaspored={paidForRaspored}
      // `theme` is only consumed by the default wedding welcome-PDF path,
      // which we override below — this is a safe placeholder.
      theme="luxury_gold"
      useCyrillic={false}
      actions={{
        save: saveBirthdayRaspored,
        load: loadBirthdayRaspored,
        checkPaid: checkBirthdayPaidStatus,
      }}
      backHref={`/deciji-rodjendan/${slug}`}
      onGenerateWelcomePDF={() =>
        generateBirthdayWelcomePDF({
          slug,
          honoreeName: honoreeDisplay,
          age,
          type,
          theme: birthdayTheme,
        })
      }
    />
  );
}
