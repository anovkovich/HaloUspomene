import { ThemeType, ThemeConfig, ScriptFontType } from "./types";

// Script font configurations
export interface ScriptFontConfig {
  name: string;
  variable: string;
  description: string;
}

export const SCRIPT_FONT_CONFIGS: Record<ScriptFontType, ScriptFontConfig> = {
  "great-vibes": {
    name: "Great Vibes",
    variable: "var(--font-great-vibes)",
    description: "Elegant flowing script (Latin & Cyrillic)",
  },
  "dancing-script": {
    name: "Dancing Script",
    variable: "var(--font-dancing-script)",
    description: "Casual and friendly",
  },
  "alex-brush": {
    name: "Alex Brush",
    variable: "var(--font-alex-brush)",
    description: "Brush-style calligraphy",
  },
  parisienne: {
    name: "Parisienne",
    variable: "var(--font-parisienne)",
    description: "Romantic French style",
  },
  allura: {
    name: "Allura",
    variable: "var(--font-allura)",
    description: "Classic formal script",
  },
  "marck-script": {
    name: "Marck Script",
    variable: "var(--font-marck-script)",
    description: "Elegant Cyrillic script",
  },
  caveat: {
    name: "Caveat",
    variable: "var(--font-caveat)",
    description: "Flowing handwritten Cyrillic",
  },
  "bad-script": {
    name: "Bad Script",
    variable: "var(--font-bad-script)",
    description: "Casual handwritten Cyrillic",
  },
};

export const THEME_CONFIGS: Record<ThemeType, ThemeConfig> = {
  // Elegant gold theme - traditional luxury wedding
  luxury_gold: {
    name: "Luxury Gold",
    symbolism: "Večna ljubav, bogatstvo i raskošna elegancija",
    colors: {
      primary: "#d4af37", // Gold
      primaryLight: "#e8d48a",
      primaryMuted: "rgba(212, 175, 55, 0.15)",
      background: "#fffdf5", // Warm ivory
      surface: "#faf7e8",
      surfaceAlt: "#f5f0d8",
      text: "#1a1a1a",
      textMuted: "#78716c",
      textLight: "#a8a29e",
      border: "rgba(212, 175, 55, 0.2)",
      borderLight: "rgba(212, 175, 55, 0.1)",
      waxSeal: "#b82828",
      waxSealDark: "#8a1c1c",
    },
  },

  // Romantic rose theme - warm and timeless
  classic_rose: {
    name: "Classic Rose",
    symbolism: "Romantična ljubav, strast i nežnost čistog srca",
    colors: {
      primary: "#AE343F", // Dusty rose
      primaryLight: "#c4899a",
      primaryMuted: "rgba(158, 74, 93, 0.12)",
      background: "#ffffff",
      surface: "#fdf8f8", // Rose tinted white
      surfaceAlt: "#fbf2f2",
      text: "#2d2426",
      textMuted: "#6b5a5e",
      textLight: "#9a8b8f",
      border: "rgba(158, 74, 93, 0.2)",
      borderLight: "rgba(158, 74, 93, 0.1)",
      waxSeal: "#AE343F",
      waxSealDark: "#8B2833",
    },
  },

  // Contemporary blue theme - calm and modern
  modern_mono: {
    name: "Modern Blue",
    symbolism: "Vernost, spokojstvo i vedro nebo iznad ljubavi",
    colors: {
      primary: "#3D6B9C", // Dusty steel blue
      primaryLight: "#6B97C4",
      primaryMuted: "rgba(61, 107, 156, 0.1)",
      background: "#F6F8FB", // Very pale blue-white
      surface: "#EEF3F9",
      surfaceAlt: "#E4EDF6",
      text: "#1A2A3A",
      textMuted: "#4E6578",
      textLight: "#8AA0B4",
      border: "rgba(61, 107, 156, 0.18)",
      borderLight: "rgba(61, 107, 156, 0.08)",
      waxSeal: "#3D6B9C",
      waxSealDark: "#2A4E78",
    },
  },

  // Soft natural theme - organic and understated
  minimal_sage: {
    name: "Minimal Sage",
    symbolism: "Novi početak, napredak i prirodna harmonija",
    colors: {
      primary: "#7c9a72", // Sage green
      primaryLight: "#a8c4a0",
      primaryMuted: "rgba(124, 154, 114, 0.12)",
      background: "#ffffff",
      surface: "#f8faf7", // Green tinted white
      surfaceAlt: "#f2f5f1",
      text: "#2e3830",
      textMuted: "#5c6b5e",
      textLight: "#8a9a8c",
      border: "rgba(124, 154, 114, 0.2)",
      borderLight: "rgba(124, 154, 114, 0.1)",
      waxSeal: "#5a7352",
      waxSealDark: "#435542",
    },
  },

  // Warm terracotta theme - earthy and romantic
  warm_terracotta: {
    name: "Warm Terracotta",
    symbolism: "Stabilnost, mir i romantika iz starih vremena",
    colors: {
      primary: "#C0622A", // Warm terracotta-orange
      primaryLight: "#E08A55",
      primaryMuted: "rgba(192, 98, 42, 0.12)",
      background: "#FDF8F2", // Warm cream
      surface: "#FAF0E4",
      surfaceAlt: "#F4E5D2",
      text: "#2C1A0E",
      textMuted: "#7A5840",
      textLight: "#B09070",
      border: "rgba(192, 98, 42, 0.2)",
      borderLight: "rgba(192, 98, 42, 0.1)",
      waxSeal: "#A84E1E",
      waxSealDark: "#7E3810",
    },
  },
};

// Helper to generate CSS variables from theme config
export function getThemeCSSVariables(
  theme: ThemeType,
  scriptFont: ScriptFontType = "great-vibes",
): Record<string, string> {
  const config = THEME_CONFIGS[theme];
  const fontConfig = SCRIPT_FONT_CONFIGS[scriptFont];
  return {
    "--theme-primary": config.colors.primary,
    "--theme-primary-light": config.colors.primaryLight,
    "--theme-primary-muted": config.colors.primaryMuted,
    "--theme-background": config.colors.background,
    "--theme-surface": config.colors.surface,
    "--theme-surface-alt": config.colors.surfaceAlt,
    "--theme-text": config.colors.text,
    "--theme-text-muted": config.colors.textMuted,
    "--theme-text-light": config.colors.textLight,
    "--theme-border": config.colors.border,
    "--theme-border-light": config.colors.borderLight,
    "--theme-wax-seal": config.colors.waxSeal,
    "--theme-wax-seal-dark": config.colors.waxSealDark,
    "--theme-radius": "0.75rem",
    "--theme-shadow": "0 4px 6px -1px rgba(0,0,0,0.1)",
    "--theme-script-font": fontConfig.variable,
  };
}

// Get script font config
export function getScriptFontConfig(font: ScriptFontType): ScriptFontConfig {
  return SCRIPT_FONT_CONFIGS[font];
}

// Get theme config
export function getThemeConfig(theme: ThemeType): ThemeConfig {
  return THEME_CONFIGS[theme];
}

// Convert hex to RGB components
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Blend two hex colors by ratio
export function blendHex(hex1: string, hex2: string, ratio: number): string {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return hex1;

  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// Build CSS variable overrides for custom primary and optional background colors
export function buildCustomColorOverrides(
  primaryHex: string,
  bgHex?: string
): Record<string, string> {
  const rgb = hexToRgb(primaryHex);
  if (!rgb) return {};

  const { r, g, b } = rgb;
  // Lighten by 15% toward white for the "light" variant
  const lr = Math.min(255, Math.round(r + (255 - r) * 0.15));
  const lg = Math.min(255, Math.round(g + (255 - g) * 0.15));
  const lb = Math.min(255, Math.round(b + (255 - b) * 0.15));
  const light = `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;

  const overrides: Record<string, string> = {
    "--theme-primary": primaryHex,
    "--theme-primary-light": light,
    "--theme-primary-muted": `rgba(${r},${g},${b},0.12)`,
    "--theme-wax-seal": primaryHex,
    "--theme-wax-seal-dark": light,
    "--theme-border": `rgba(${r},${g},${b},0.2)`,
    "--theme-border-light": `rgba(${r},${g},${b},0.1)`,
  };

  // If custom background provided, use it without blending (respects user's explicit choice)
  if (bgHex) {
    overrides["--theme-background"] = bgHex;
    overrides["--theme-surface"] = bgHex;
    overrides["--theme-surface-alt"] = bgHex;
  }

  return overrides;
}
