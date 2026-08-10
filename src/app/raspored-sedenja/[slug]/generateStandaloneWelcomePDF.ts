import {
  downloadWelcomeSign,
  type WelcomeSignVariant,
} from "@/lib/seating/pdf/welcomeSign";
import { eventSignContent } from "@/lib/seating/pdf/welcomeSignContent";

/** No invitation theme here, so the sign wears the house burgundy. */
const BRAND_PRIMARY = "#AE343F";

export interface StandaloneWelcomePDFInput {
  slug: string;
  eventName: string;
  /** Which of the two designs to download. */
  variant: WelcomeSignVariant;
}

/** One B1 welcome sign for a standalone event; both designs are offered. */
export async function generateStandaloneWelcomePDF(
  input: StandaloneWelcomePDFInput,
): Promise<void> {
  const { slug, eventName } = input;

  const safeName = eventName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();

  await downloadWelcomeSign(
    {
      qrUrl: `https://halouspomene.rs/raspored-sedenja/${slug}/gde-sedim/`,
      accent: BRAND_PRIMARY,
      scriptFontFile: "GreatVibes-Regular.ttf",
      ...eventSignContent(eventName),
    },
    `dobrodosli-${safeName || slug}`,
    input.variant,
  );
}
