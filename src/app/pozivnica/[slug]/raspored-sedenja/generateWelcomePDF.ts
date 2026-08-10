import type { ScriptFontType, ThemeType } from "../types";
import { THEME_CONFIGS } from "../constants";
import {
  downloadWelcomeSign,
  type WelcomeSignVariant,
} from "@/lib/seating/pdf/welcomeSign";
import { weddingSignContent } from "@/lib/seating/pdf/welcomeSignContent";

const SCRIPT_FONT_FILES: Record<ScriptFontType, string> = {
  "great-vibes": "GreatVibes-Regular.ttf",
  "dancing-script": "DancingScript-Regular.ttf",
  "alex-brush": "AlexBrush-Regular.ttf",
  parisienne: "Parisienne-Regular.ttf",
  allura: "Allura-Regular.ttf",
  "marck-script": "MarckScript-Regular.ttf",
  caveat: "Caveat-Regular.ttf",
  "bad-script": "BadScript-Regular.ttf",
};

// Script fonts with full Cyrillic coverage.
const CYRILLIC_SCRIPT_FONTS: ScriptFontType[] = [
  "marck-script",
  "caveat",
  "bad-script",
];

export interface WelcomePDFInput {
  slug: string;
  coupleDisplay: string; // e.g. "Marija & Petar"
  theme: ThemeType;
  scriptFont?: ScriptFontType;
  useCyrillic?: boolean;
  /** Which of the two designs to download. */
  variant: WelcomeSignVariant;
}

/**
 * One B1 welcome sign for a wedding. Both designs are offered, each behind its
 * own button, so a click never triggers two downloads at once. The couple's
 * theme colour and script font are the only things that vary; the layout itself
 * lives in @/lib/seating/pdf/welcomeSign.
 */
export async function generateWelcomePDF(
  input: WelcomePDFInput,
): Promise<void> {
  const { slug, coupleDisplay, theme, scriptFont, useCyrillic } = input;

  const themeConfig = THEME_CONFIGS[theme] ?? THEME_CONFIGS.classic_rose;

  // Pick a Cyrillic-safe script font if needed.
  const requested = scriptFont ?? "great-vibes";
  const effective: ScriptFontType =
    useCyrillic && !CYRILLIC_SCRIPT_FONTS.includes(requested)
      ? "marck-script"
      : requested;

  const safeName = coupleDisplay
    .replace(/\s*&\s*/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();

  await downloadWelcomeSign(
    {
      qrUrl: `https://halouspomene.rs/pozivnica/${slug}/gde-sedim/`,
      accent: themeConfig.colors.primary,
      scriptFontFile: SCRIPT_FONT_FILES[effective],
      cyrillic: !!useCyrillic,
      ...weddingSignContent(coupleDisplay, !!useCyrillic),
    },
    `dobrodosli-${safeName || slug}`,
    input.variant,
  );
}
