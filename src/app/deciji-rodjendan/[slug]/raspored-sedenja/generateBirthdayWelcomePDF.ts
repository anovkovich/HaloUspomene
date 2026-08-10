import type {
  BirthdayThemeType,
  BirthdayType,
} from "@/app/deciji-rodjendan/[slug]/types";
import { BIRTHDAY_THEME_CONFIGS } from "@/app/deciji-rodjendan/[slug]/constants";
import { downloadWelcomeSign } from "@/lib/seating/pdf/welcomeSign";
import { birthdaySignContent } from "@/lib/seating/pdf/welcomeSignContent";

export interface BirthdayWelcomePDFInput {
  slug: string;
  /** Display name of the honoree — child_name for "child", honoree_name for "eighteenth". */
  honoreeName: string;
  age: number;
  type: BirthdayType; // "child" | "eighteenth"
  theme: BirthdayThemeType;
}

/**
 * B1 welcome sign for birthdays and punoletstvo. Caveat carries the playful
 * register — it is the script slot here, so the age numeral behind the name
 * and the "slavi 5. rođendan" line are both handwritten.
 *
 * Only the poster ships: the arch reads as wedding stationery, and the age
 * numeral behind the name needs the poster's open field.
 */
export async function generateBirthdayWelcomePDF(
  input: BirthdayWelcomePDFInput,
): Promise<void> {
  const { slug, honoreeName, age, type, theme } = input;

  const themeConfig =
    BIRTHDAY_THEME_CONFIGS[theme] ?? BIRTHDAY_THEME_CONFIGS.neutral_circus;

  const safeName = honoreeName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
  const fileLabel = type === "eighteenth" ? "punoletstvo" : "rodjendan";

  await downloadWelcomeSign(
    {
      qrUrl: `https://halouspomene.rs/deciji-rodjendan/${slug}/gde-sedim/`,
      accent: themeConfig.colors.primary,
      scriptFontFile: "Caveat-Regular.ttf",
      ...birthdaySignContent(honoreeName, age, type),
    },
    `dobrodosli-${safeName || slug}-${fileLabel}`,
    "poster",
    false,
  );
}
