export type ThemeType =
  | "classic_rose"
  | "modern_mono"
  | "minimal_sage"
  | "luxury_gold"
  | "warm_terracotta"
  | "white_gold_burgundy"
  | "white_gold_navy";
export type ScriptFontType =
  | "great-vibes"
  | "dancing-script"
  | "alex-brush"
  | "parisienne"
  | "allura"
  | "marck-script"
  | "caveat"
  | "bad-script";

// Premium AI types
export type PremiumThemeType =
  | "watercolor"
  | "disney_pixar"
  | "line_art"
  | "fountain";

export interface EnvelopeItem {
  type:
    | "clover"
    | "champagne"
    | "boutonniere"
    | "bouquet"
    | "rings"
    | "tulips"
    | "roses"
    | "gold_bow";
  zone: number; // 0-8 predefined snap position
}

export interface Location {
  name: string;
  /** German variant of `name`. Rendered when invitation lang is "de". */
  name_de?: string;
  time?: string;
  address: string;
  /** German variant of `address`. */
  address_de?: string;
  lat?: number;
  lng?: number;
  map_url?: string;
  type: "home" | "church" | "hall" | "ceremony";
}

export interface TimelineItem {
  title: string;
  /** German variant of `title`. */
  title_de?: string;
  time: string;
  description?: string;
  /** German variant of `description`. */
  description_de?: string;
  what?: string; // e.g. "Polazak od kuće", "Crkveno venčanje", "Skup u svečanoj sali"
  /** German variant of `what`. */
  what_de?: string;
  icon: string;
}

export interface WeddingData {
  theme: ThemeType;
  scriptFont?: ScriptFontType;
  useCyrillic?: boolean; // Use Cyrillic script for static text
  potvrde_password?: string; // Password for /potvrde + /moje-vencanje login. Auto-create routes generate ${groom}${random4}; admin/Quick-Start accepts whatever is typed. Legacy couples (pre-2026-04-18) may have ${groom}${DDMM} format from the old lead-gen generator.
  couple_names: {
    bride: string;
    groom: string;
    full_display: string;
  };
  event_date: string; // ISO string: YYYY-MM-DDTHH:mm:ss
  submit_until: string; // ISO date: YYYY-MM-DD — deadline for RSVP submissions
  tagline?: string;
  /** German variant of `tagline`. Used on /hochzeitseinladung/[slug]/. */
  tagline_de?: string;
  /**
   * Optional free-form note rendered between the map and the RSVP section.
   * Manually populated via the admin JSON editor; absent for couples that
   * don't need an extra message. Same font/size as `tagline` but in
   * theme primary color.
   */
  note?: string;
  /** German variant of `note`. */
  note_de?: string;
  thankYouFooter?: string;
  /** German variant of `thankYouFooter`. */
  thankYouFooter_de?: string;
  /** Opt-in: when true, the couple is also reachable at
   *  /hochzeitseinladung/[slug]/ rendered in German. Defaults to false. */
  german_enabled?: boolean;
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
  image_layout?: "line" | "triangle"; // Gallery layout: "line" (default) or "triangle"
  custom_primary_color?: string; // Custom primary color in hex (e.g. "#A23B8C"), overrides theme
  custom_background_color?: string; // Custom background color in hex, overrides theme background
  stamp_color?: string; // Custom wax seal color in hex (e.g. "#8B2252"), overrides theme waxSeal
  draft?: boolean; // Only visible in dev, returns 404 in production
  receipt_valid?: boolean; // Receipt link is active (set false after payment)
  receipt_created?: string; // ISO date when receipt was generated
  custom_discount?: number; // Custom discount in RSD on website pozivnica
  // Premium AI fields
  premium?: boolean;
  premium_theme?: PremiumThemeType;
  ai_couple_image_url?: string;
  envelope_items?: EnvelopeItem[];
  envelope_style?: "classic" | "wing";
  envelope_rose_petals?: boolean;
  premium_city?: string; // Watercolor theme: city background key
  premium_car?: string; // Watercolor theme: car illustration key
  couple_description?: string; // Line art theme: AI couple description
  premium_paid?: boolean;
  /** Comma-separated E.164 phone numbers collected at submission (e.g. "+381638261775,+381615000363"). Optional. */
  contact_phone?: string;
  /** Per-number toggle for displaying call-CTA on the RSVP page. Parallel to `contact_phone`'s split-by-comma order. */
  show_numbers?: boolean[];
  /** Optional per-number labels rendered above each phone in the call-CTA (e.g. "Mama mlade"). Parallel to `contact_phone`. */
  number_names?: string[];
  /** ISO country code for the primary contact phone (RS/BA/HR/ME). Defaults to RS for legacy/Serbian submissions. */
  phone_country?: "RS" | "BA" | "HR" | "ME";
  /** True when the primary phone passed SMS verification; false for couples created via a foreign-customer bypass link. Absent on pre-bypass records. */
  phone_verified?: boolean;
  /** UUID of the bypass token that authorized this submission. Audit-only; absent for normal SMS-verified submissions. */
  bypass_token_id?: string;
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
