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
  /**
   * Twins / multiple children — flips the invitation label from
   * "Vas pozivaju na MOJ ... rođendan" to "... NAŠ ... rođendan".
   * Optional; added by hand in the admin JSON. Defaults to singular.
   */
  twins?: boolean;
  location: BirthdayLocation;
  countdown_enabled: boolean;
  map_enabled: boolean;
  admin_password?: string;
  draft?: boolean;
  example?: boolean; // Demo/example event — sorts to the bottom of the admin list
  /**
   * Unlocks the seating editor at /deciji-rodjendan/[slug]/raspored-sedenja/.
   * Mirrors the wedding `paid_for_raspored` gate — admin flips it after
   * the couple settles the custom receipt for this add-on.
   */
  paid_for_raspored?: boolean;
  /**
   * Unlocks the polaroid photo gallery on the invitation. Mirrors the wedding
   * `paid_for_images` gate field-for-field so the admin panel, the upload route
   * and PolaroidGallery all behave identically across products.
   * Currently rendered only by punoletstvo; the children's birthday renderer
   * ignores it until that product wants a gallery too.
   */
  paid_for_images?: boolean;
  /** Up to 3 Vercel Blob images. Gated by `paid_for_images`. */
  images?: Array<{ url: string; pathname: string }>;
  /** Polaroid arrangement. "triangle" only applies at exactly 3 images. */
  image_layout?: "line" | "triangle";
  /**
   * Per-invitation look, same field names as the wedding product, so a one-off
   * colour request needs no new theme and no code change.
   *
   * NOTE the scope difference from the wedding product: there,
   * custom_background_color also repaints the card surfaces. On punoletstvo it
   * only sets the page background — the framed cards keep the theme's surface
   * colour, which is what the design depends on for contrast.
   */
  custom_primary_color?: string;
  custom_background_color?: string;
  /**
   * Replaces the sunburst + gold wax seal + "18" emblem in the punoletstvo
   * hero with a custom illustration. Blob url, uploaded from the admin panel.
   */
  hero_emblem_url?: string;
  receipt_valid?: boolean;
  receipt_created?: string;
  custom_discount?: number;
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
