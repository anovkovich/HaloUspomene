"use client";

import type { RSVPEntry } from "@/lib/rsvp";
import type {
  BirthdayThemeType,
  BirthdayType,
} from "@/app/deciji-rodjendan/[slug]/types";
import RasporedClient from "@/lib/seating/editor/RasporedClient";
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
  /** Invitation is live. Nothing to sell on top of a draft — the client has to
   *  buy the invitation itself first. */
  published: boolean;
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
  published,
  attending,
}: Props) {
  return (
    <RasporedClient
      attending={attending}
      slug={slug}
      coupleNames={honoreeDisplay}
      paidForRaspored={paidForRaspored}
      rasporedPayHref={
        published
          ? `/placanje/${
              type === "eighteenth" ? "punoletstvo" : "rodjendan"
            }/${slug}/?tier=raspored`
          : undefined
      }
      actions={{
        save: saveBirthdayRaspored,
        load: loadBirthdayRaspored,
        checkPaid: checkBirthdayPaidStatus,
      }}
      backHref={
        type === "eighteenth"
          ? `/punoletstvo/${slug}/portal`
          : `/deciji-rodjendan/${slug}/portal`
      }
      guestLookupUrl={`https://halouspomene.rs/deciji-rodjendan/${slug}/gde-sedim/`}
      hideWeddingOnlyElements
      enableHallSchemes
      welcomeSigns={[
        {
          label: "Preuzmi QR pano PDF",
          run: () =>
            generateBirthdayWelcomePDF({
              slug,
              honoreeName: honoreeDisplay,
              age,
              type,
              theme: birthdayTheme,
            }),
        },
      ]}
    />
  );
}
