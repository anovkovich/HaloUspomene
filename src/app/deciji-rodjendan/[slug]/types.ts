export type BirthdayGender = "boy" | "girl" | "neutral";

export type BirthdayThemeType =
  | "boy_adventure"
  | "boy_animals"
  | "boy_space"
  | "girl_fairy"
  | "girl_princess"
  | "girl_rainbow"
  | "neutral_safari"
  | "neutral_circus";

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
