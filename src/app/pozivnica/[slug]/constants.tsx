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
    description: "Elegant flowing script",
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
};

export const THEME_CONFIGS: Record<ThemeType, ThemeConfig> = {
  // Elegant gold theme - traditional luxury wedding
  luxury: {
    name: "Luxury Gold",
    colors: {
      primary: "#d4af37", // Gold
      primaryLight: "#e8d48a",
      primaryMuted: "rgba(212, 175, 55, 0.15)",
      background: "#ffffff",
      surface: "#faf9f6", // Ivory
      surfaceAlt: "#f5f3ee",
      text: "#1a1a1a",
      textMuted: "#78716c", // stone-500
      textLight: "#a8a29e", // stone-400
      border: "rgba(212, 175, 55, 0.2)",
      borderLight: "rgba(212, 175, 55, 0.1)",
      waxSeal: "#b82828",
      waxSealDark: "#8a1c1c",
    },
    style: {
      radius: "sm",
      ornaments: true,
      shadows: "lg",
    },
  },

  // Romantic rose theme - warm and timeless
  classic: {
    name: "Classic Rose",
    colors: {
      primary: "#9e4a5d", // Dusty rose
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
      waxSeal: "#9e4a5d",
      waxSealDark: "#7a3a4a",
    },
    style: {
      radius: "md",
      ornaments: false,
      shadows: "md",
    },
  },

  // Bold contemporary theme - minimalist and striking
  modern: {
    name: "Modern Mono",
    colors: {
      primary: "#1a1a1a", // Black
      primaryLight: "#404040",
      primaryMuted: "rgba(26, 26, 26, 0.08)",
      background: "#ffffff",
      surface: "#fafafa",
      surfaceAlt: "#f5f5f5",
      text: "#0a0a0a",
      textMuted: "#525252", // neutral-600
      textLight: "#a3a3a3", // neutral-400
      border: "rgba(0, 0, 0, 0.1)",
      borderLight: "rgba(0, 0, 0, 0.05)",
      waxSeal: "#1a1a1a",
      waxSealDark: "#000000",
    },
    style: {
      radius: "none",
      ornaments: false,
      shadows: "sm",
    },
  },

  // Soft natural theme - organic and understated
  minimal: {
    name: "Minimal Sage",
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
    style: {
      radius: "lg",
      ornaments: false,
      shadows: "sm",
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
    "--theme-radius":
      config.style.radius === "none"
        ? "0"
        : config.style.radius === "sm"
          ? "0.375rem"
          : config.style.radius === "md"
            ? "0.75rem"
            : config.style.radius === "lg"
              ? "1rem"
              : "9999px",
    "--theme-shadow":
      config.style.shadows === "none"
        ? "none"
        : config.style.shadows === "sm"
          ? "0 1px 2px rgba(0,0,0,0.05)"
          : config.style.shadows === "md"
            ? "0 4px 6px -1px rgba(0,0,0,0.1)"
            : "0 10px 15px -3px rgba(0,0,0,0.1)",
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
