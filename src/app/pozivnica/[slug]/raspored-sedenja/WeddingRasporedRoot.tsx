"use client";

import type { RSVPEntry } from "@/lib/rsvp";
import type { ScriptFontType, ThemeType } from "../types";
import RasporedClient from "@/lib/seating/editor/RasporedClient";
import { saveRaspored, loadRaspored, checkPaidStatus } from "./actions";
import { generateWelcomePDF } from "./generateWelcomePDF";

interface Props {
  attending: RSVPEntry[];
  slug: string;
  coupleNames: string;
  paidForRaspored: boolean;
  theme: ThemeType;
  scriptFont?: ScriptFontType;
  useCyrillic: boolean;
}

export default function WeddingRasporedRoot({
  attending,
  slug,
  coupleNames,
  paidForRaspored,
  theme,
  scriptFont,
  useCyrillic,
}: Props) {
  return (
    <RasporedClient
      attending={attending}
      slug={slug}
      coupleNames={coupleNames}
      paidForRaspored={paidForRaspored}
      actions={{
        save: saveRaspored,
        load: loadRaspored,
        checkPaid: checkPaidStatus,
      }}
      onGenerateWelcomePDF={() =>
        generateWelcomePDF({
          slug,
          coupleDisplay: coupleNames,
          theme,
          scriptFont,
          useCyrillic,
        })
      }
    />
  );
}
