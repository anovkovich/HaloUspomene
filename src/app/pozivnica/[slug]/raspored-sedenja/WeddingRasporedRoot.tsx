"use client";

import type { RSVPEntry } from "@/lib/rsvp";
import type { GuestGroup } from "@/lib/seating/guest-groups";
import type { ScriptFontType, ThemeType } from "../types";
import RasporedClient from "@/lib/seating/editor/RasporedClient";
import { saveRaspored, loadRaspored, checkPaidStatus } from "./actions";
import { generateWelcomePDF } from "./generateWelcomePDF";

interface Props {
  attending: RSVPEntry[];
  /** Celine iz Liste zvanica — dodatni filter u bočnoj traci sa gostima. */
  guestGroups?: GuestGroup[];
  guestGroupByGuestId?: Record<string, string>;
  slug: string;
  coupleNames: string;
  paidForRaspored: boolean;
  theme: ThemeType;
  scriptFont?: ScriptFontType;
  useCyrillic: boolean;
  /** Bride/groom as stored, so the pano overrides land on the right half. */
  brideName?: string;
  groomName?: string;
  /** Print the QR pano in Cyrillic even on a Latin invitation. */
  panoCyrillic?: boolean;
  /** Sign-only script font, overriding `scriptFont`. */
  panoScriptFont?: ScriptFontType;
  /** Exact names for the pano, bypassing transliteration. */
  panoBrideName?: string;
  panoGroomName?: string;
}

export default function WeddingRasporedRoot({
  attending,
  guestGroups,
  guestGroupByGuestId,
  slug,
  coupleNames,
  paidForRaspored,
  theme,
  scriptFont,
  useCyrillic,
  brideName,
  groomName,
  panoCyrillic,
  panoScriptFont,
  panoBrideName,
  panoGroomName,
}: Props) {
  return (
    <RasporedClient
      attending={attending}
      guestGroups={guestGroups}
      guestGroupByGuestId={guestGroupByGuestId}
      slug={slug}
      coupleNames={coupleNames}
      paidForRaspored={paidForRaspored}
      enableHallSchemes
      actions={{
        save: saveRaspored,
        load: loadRaspored,
        checkPaid: checkPaidStatus,
      }}
      welcomeSigns={[
        { label: "QR pano — dizajn 1 (klasik)", variant: "poster" as const },
        { label: "QR pano — dizajn 2 (sa lukom)", variant: "arch" as const },
      ].map(({ label, variant }) => ({
        label,
        run: () =>
          generateWelcomePDF({
            slug,
            coupleDisplay: coupleNames,
            theme,
            scriptFont,
            useCyrillic,
            brideName,
            groomName,
            panoCyrillic,
            panoScriptFont,
            panoBrideName,
            panoGroomName,
            variant,
          }),
      }))}
    />
  );
}
