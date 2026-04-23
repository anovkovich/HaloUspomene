export type BirthdayGender = "boy" | "girl" | "neutral";

export type BirthdayType = "child" | "eighteenth";

export type BirthdayThemeType =
  | "boy_animals"
  | "boy_space"
  | "girl_fairy"
  | "girl_princess"
  | "neutral_safari"
  | "neutral_circus"
  | "white_gold_burgundy"
  | "white_gold_navy";

export type BirthdayFontType =
  | "fredoka"
  | "bubblegum-sans"
  | "baloo-2"
  | "patrick-hand"
  | "chewy";

export interface BirthdayLocation {
  name: string;
  address: string;
  map_url?: string;
}

export interface BirthdayData {
  theme: BirthdayThemeType;
  gender: BirthdayGender;
  displayFont?: BirthdayFontType;
  /**
   * Discriminates between children's birthday (existing flow) and 18th
   * birthday / punoletstvo (classic-wedding-styled invitation). Defaults
   * to "child" when omitted so existing records keep their behavior.
   */
  type?: BirthdayType;
  /** Punoletstvo: honoree given name (required when type === "eighteenth"). */
  honoree_name?: string;
  /** Punoletstvo: honoree surname. */
  honoree_surname?: string;
  child_name: string;
  parent_names: string;
  age: number;
  event_date: string;
  submit_until: string;
  tagline?: string;
  location: BirthdayLocation;
  countdown_enabled: boolean;
  map_enabled: boolean;
  admin_password?: string;
  draft?: boolean;
  /**
   * Unlocks the seating editor at /deciji-rodjendan/[slug]/raspored-sedenja/.
   * Mirrors the wedding `paid_for_raspored` gate — admin flips it after
   * the couple settles the custom receipt for this add-on.
   */
  paid_for_raspored?: boolean;
}

export interface BirthdayThemeConfig {
  name: string;
  gender: BirthdayGender;
  colors: {
    primary: string;
    primaryLight: string;
    primaryMuted: string;
    secondary: string;
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    textLight: string;
    border: string;
    borderLight: string;
    confetti: string[];
  };
  illustration: string;
}
