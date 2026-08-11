import type { ScriptFontType, ThemeType } from "../types";
import { THEME_CONFIGS } from "../constants";
import {
  downloadWelcomeSign,
  type WelcomeSignVariant,
} from "@/lib/seating/pdf/welcomeSign";
import {
  weddingSignContent,
  panoWeddingNames,
} from "@/lib/seating/pdf/welcomeSignContent";

const SCRIPT_FONT_FILES: Record<ScriptFontType, string> = {
  "great-vibes": "GreatVibesHU-Regular.ttf",
  "dancing-script": "DancingScript-Regular.ttf",
  "alex-brush": "AlexBrush-Regular.ttf",
  parisienne: "Parisienne-Regular.ttf",
  allura: "Allura-Regular.ttf",
  "cormorant-garamond": "CormorantGaramond-Regular.ttf",
  "poiret-one": "PoiretOne-Regular.ttf",
  "marck-script": "MarckScript-Regular.ttf",
  caveat: "Caveat-Regular.ttf",
  "bad-script": "BadScript-Regular.ttf",
  jasminum: "Jasminum-Regular.ttf",
};

// Script fonts with full Cyrillic coverage, Serbian Ђ Ј Љ Њ Ћ Џ included —
// verified against the .ttf cmap, not against the foundry's language blurb.
// A font missing from this list gets swapped out below, so leaving one off
// silently overrides the client's choice.
const CYRILLIC_SCRIPT_FONTS: ScriptFontType[] = [
  "great-vibes",
  "cormorant-garamond",
  "poiret-one",
  "marck-script",
  "caveat",
  "bad-script",
  "jasminum",
];

export interface WelcomePDFInput {
  slug: string;
  coupleDisplay: string; // e.g. "Marija & Petar"
  theme: ThemeType;
  scriptFont?: ScriptFontType;
  /** WeddingData.pano_script_font — sign-only font, overrides `scriptFont`. */
  panoScriptFont?: ScriptFontType;
  useCyrillic?: boolean;
  /** Bride/groom as stored, so the pano overrides land on the right half. */
  brideName?: string;
  groomName?: string;
  /** Sign in Cyrillic even though the invitation is Latin — WeddingData.pano_cyrillic. */
  panoCyrillic?: boolean;
  /** WeddingData.pano_bride_name / pano_groom_name — exact names for the sign. */
  panoBrideName?: string;
  panoGroomName?: string;
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

  // The sign carries Cyrillic either because the whole invitation does, or
  // because the couple asked for this one printed piece in the other script.
  const cyrillic = !!useCyrillic || !!input.panoCyrillic;

  // Names come out of the record in the invitation's script, so a Latin couple
  // opting into a Cyrillic sign needs them transliterated. The per-name pano
  // fields win where the rules cannot infer the spelling.
  const names = panoWeddingNames(
    coupleDisplay,
    {
      bride: input.brideName,
      groom: input.groomName,
      panoBride: input.panoBrideName,
      panoGroom: input.panoGroomName,
    },
    !!input.panoCyrillic && !useCyrillic,
  );

  // Pick a Cyrillic-safe script font if needed.
  const requested = input.panoScriptFont ?? scriptFont ?? "great-vibes";
  const effective: ScriptFontType =
    cyrillic && !CYRILLIC_SCRIPT_FONTS.includes(requested)
      ? "marck-script"
      : requested;

  // Filename stays keyed off the Latin record, so it is always typeable.
  const safeName = coupleDisplay
    .replace(/\s*&\s*/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();

  await downloadWelcomeSign(
    {
      qrUrl: `https://halouspomene.rs/pozivnica/${slug}/gde-sedim/`,
      accent: themeConfig.colors.primary,
      scriptFontFile: SCRIPT_FONT_FILES[effective],
      cyrillic,
      ...weddingSignContent(names, cyrillic),
    },
    `dobrodosli-${safeName || slug}`,
    input.variant,
  );
}
