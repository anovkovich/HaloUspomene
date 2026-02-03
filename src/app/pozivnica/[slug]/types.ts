export type ThemeType = "classic" | "modern" | "minimal" | "luxury";
export type ScriptFontType = "great-vibes" | "dancing-script" | "alex-brush" | "parisienne" | "allura" | "marck-script";

export interface Location {
  name: string;
  time: string;
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
  icon: string;
}

export interface Entry_IDs {
  name: string;
  attending: string;
  plusOnes: string;
  details: string;
}

export interface WeddingData {
  theme: ThemeType;
  scriptFont?: ScriptFontType;
  useCyrillic?: boolean; // Use Cyrillic script for static text
  rsvp_form_url: string;
  entry_IDs: Entry_IDs;
  couple_names: {
    bride: string;
    groom: string;
    full_display: string;
  };
  event_date: string; // ISO string or YYYY-MM-DD
  submit_until: string;
  tagline?: string;
  locations: Location[];
  timeline: TimelineItem[];
  countdown_enabled: boolean;
  map_enabled: boolean;
}

// Comprehensive theme configuration
export interface ThemeConfig {
  name: string;
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
  style: {
    // Border radius: "none" | "sm" | "md" | "lg" | "full"
    radius: string;
    // Show decorative ornaments
    ornaments: boolean;
    // Shadow intensity: "none" | "sm" | "md" | "lg"
    shadows: string;
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
