export type ThemeType =
  | "classic_rose"
  | "modern_mono"
  | "minimal_sage"
  | "luxury_gold"
  | "warm_terracotta";
export type ScriptFontType =
  | "great-vibes"
  | "dancing-script"
  | "alex-brush"
  | "parisienne"
  | "allura"
  | "marck-script"
  | "caveat"
  | "bad-script";

export interface Location {
  name: string;
  time?: string;
  address: string;
  lat?: number;
  lng?: number;
  map_url?: string;
  type: "home" | "church" | "hall" | "ceremony";
}

export interface TimelineItem {
  title: string;
  time: string;
  description?: string;
  what?: string; // e.g. "Polazak od kuće", "Crkveno venčanje", "Skup u svečanoj sali"
  icon: string;
}

export interface WeddingData {
  theme: ThemeType;
  scriptFont?: ScriptFontType;
  useCyrillic?: boolean; // Use Cyrillic script for static text
  potvrde_password?: string; // Password to access the /potvrde admin page (format: GroomNameDDMM)
  couple_names: {
    bride: string;
    groom: string;
    full_display: string;
  };
  event_date: string; // ISO string: YYYY-MM-DDTHH:mm:ss
  submit_until: string; // ISO date: YYYY-MM-DD — deadline for RSVP submissions
  tagline?: string;
  thankYouFooter?: string;
  locations: Location[];
  timeline: TimelineItem[];
  countdown_enabled: boolean;
  map_enabled: boolean;
  paid_for_raspored?: boolean; // Unlocks full seating chart (default: false = demo, 1 seat only)
  paid_for_pdf?: boolean; // Unlocks watermark-free PDF export
  paid_for_audio?: boolean; // Unlocks audio guest book recording
  paid_for_audio_USB?: "" | "kaseta" | "bocica"; // USB suvenir choice
  paid_for_images?: boolean; // Unlocks photo gallery add-on
  images?: Array<{ url: string; pathname: string }>; // Up to 3 uploaded photos
  custom_primary_color?: string; // Custom primary color in hex (e.g. "#A23B8C"), overrides theme
  custom_background_color?: string; // Custom background color in hex, overrides theme background
  draft?: boolean; // Only visible in dev, returns 404 in production
  receipt_valid?: boolean; // Receipt link is active (set false after payment)
  receipt_created?: string; // ISO date when receipt was generated
  custom_discount?: number; // Custom discount in RSD on website pozivnica
}

// Comprehensive theme configuration
export interface ThemeConfig {
  name: string;
  symbolism: string;
  colors: {
    // Primary accent color (gold, rose, black, sage)
    primary: string;
    primaryLight: string;
    primaryMuted: string;
    // Background colors
    background: string;
    surface: string;
    surfaceAlt: string;
    // Text colors
    text: string;
    textMuted: string;
    textLight: string;
    // UI colors
    border: string;
    borderLight: string;
    // Special
    waxSeal: string;
    waxSealDark: string;
  };
}

// Legacy interface for backwards compatibility
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}
