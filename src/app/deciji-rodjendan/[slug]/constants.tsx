import { BirthdayThemeType, BirthdayThemeConfig, BirthdayFontType } from "./types";

export interface BirthdayFontConfig {
  name: string;
  variable: string;
  description: string;
}

export const BIRTHDAY_FONT_CONFIGS: Record<BirthdayFontType, BirthdayFontConfig> = {
  fredoka: {
    name: "Fredoka",
    variable: "var(--font-fredoka)",
    description: "Zaobljeni i moderni",
  },
  "bubblegum-sans": {
    name: "Bubblegum Sans",
    variable: "var(--font-bubblegum-sans)",
    description: "Veseli i zabavni",
  },
  "baloo-2": {
    name: "Baloo 2",
    variable: "var(--font-baloo-2)",
    description: "Prijateljski i topli",
  },
  "patrick-hand": {
    name: "Patrick Hand",
    variable: "var(--font-patrick-hand)",
    description: "Dečiji rukopis",
  },
  chewy: {
    name: "Chewy",
    variable: "var(--font-chewy)",
    description: "Debeli i razigrani",
  },
};

export const BIRTHDAY_THEME_CONFIGS: Record<BirthdayThemeType, BirthdayThemeConfig> = {
  boy_adventure: {
    name: "Avantura",
    gender: "boy",
    colors: {
      primary: "#4ECDC4",
      primaryLight: "#7EDDD6",
      primaryMuted: "rgba(78, 205, 196, 0.15)",
      secondary: "#FF6B35",
      background: "#F0FFFE",
      surface: "#E6FAF8",
      surfaceAlt: "#D6F5F2",
      text: "#1A3A38",
      textMuted: "#4A7A78",
      textLight: "#8ABAB8",
      border: "rgba(78, 205, 196, 0.25)",
      borderLight: "rgba(78, 205, 196, 0.12)",
      confetti: ["#4ECDC4", "#FF6B35", "#FFE66D", "#95E1D3", "#F38181"],
    },
    illustration: "adventure",
  },

  boy_animals: {
    name: "Safari",
    gender: "boy",
    colors: {
      primary: "#2D6A4F",
      primaryLight: "#52B788",
      primaryMuted: "rgba(45, 106, 79, 0.12)",
      secondary: "#8B5E3C",
      background: "#FEFCF3",
      surface: "#F5F0E1",
      surfaceAlt: "#EDE5D0",
      text: "#1B3A2A",
      textMuted: "#5A7A68",
      textLight: "#8AAA98",
      border: "rgba(45, 106, 79, 0.2)",
      borderLight: "rgba(45, 106, 79, 0.1)",
      confetti: ["#2D6A4F", "#8B5E3C", "#E9C46A", "#F4A261", "#52B788"],
    },
    illustration: "animals",
  },

  boy_space: {
    name: "Svemir",
    gender: "boy",
    colors: {
      primary: "#5B8DEF",
      primaryLight: "#8BB0F4",
      primaryMuted: "rgba(91, 141, 239, 0.12)",
      secondary: "#7B68EE",
      background: "#F5F7FF",
      surface: "#EAEFFF",
      surfaceAlt: "#DEE5FF",
      text: "#1A2340",
      textMuted: "#4A5580",
      textLight: "#8A95B8",
      border: "rgba(91, 141, 239, 0.2)",
      borderLight: "rgba(91, 141, 239, 0.1)",
      confetti: ["#5B8DEF", "#7B68EE", "#FFD93D", "#FF6B6B", "#6BCB77"],
    },
    illustration: "space",
  },

  girl_fairy: {
    name: "Vila",
    gender: "girl",
    colors: {
      primary: "#FF6B9D",
      primaryLight: "#FF9DC0",
      primaryMuted: "rgba(255, 107, 157, 0.12)",
      secondary: "#C084FC",
      background: "#FFF5F9",
      surface: "#FFECF3",
      surfaceAlt: "#FFE0EB",
      text: "#3A1A28",
      textMuted: "#8A5A6E",
      textLight: "#C090A5",
      border: "rgba(255, 107, 157, 0.2)",
      borderLight: "rgba(255, 107, 157, 0.1)",
      confetti: ["#FF6B9D", "#C084FC", "#FFD93D", "#67E8F9", "#A78BFA"],
    },
    illustration: "fairy",
  },

  girl_princess: {
    name: "Princeza",
    gender: "girl",
    colors: {
      primary: "#F472B6",
      primaryLight: "#F9A8D4",
      primaryMuted: "rgba(244, 114, 182, 0.12)",
      secondary: "#FFD700",
      background: "#FFFBFE",
      surface: "#FFF1F9",
      surfaceAlt: "#FFE4F0",
      text: "#3A1A2E",
      textMuted: "#8A5A75",
      textLight: "#C090A8",
      border: "rgba(244, 114, 182, 0.2)",
      borderLight: "rgba(244, 114, 182, 0.1)",
      confetti: ["#F472B6", "#FFD700", "#FCA5A5", "#FBBF24", "#F9A8D4"],
    },
    illustration: "princess",
  },

  girl_rainbow: {
    name: "Sunčana",
    gender: "girl",
    colors: {
      primary: "#F0ABFC",
      primaryLight: "#F5D0FE",
      primaryMuted: "rgba(240, 171, 252, 0.12)",
      secondary: "#93C5FD",
      background: "#FEFBFF",
      surface: "#FBF3FF",
      surfaceAlt: "#F5E8FF",
      text: "#2A1A3A",
      textMuted: "#7A5A8A",
      textLight: "#B090C0",
      border: "rgba(240, 171, 252, 0.2)",
      borderLight: "rgba(240, 171, 252, 0.1)",
      confetti: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"],
    },
    illustration: "rainbow",
  },

  neutral_safari: {
    name: "Jungle",
    gender: "neutral",
    colors: {
      primary: "#DDA15E",
      primaryLight: "#E9C088",
      primaryMuted: "rgba(221, 161, 94, 0.12)",
      secondary: "#606C38",
      background: "#F0F5E8",
      surface: "#E6EDDA",
      surfaceAlt: "#DAE4CC",
      text: "#2A2010",
      textMuted: "#7A6A48",
      textLight: "#B0A080",
      border: "rgba(221, 161, 94, 0.2)",
      borderLight: "rgba(221, 161, 94, 0.1)",
      confetti: ["#DDA15E", "#606C38", "#BC6C25", "#FEFAE0", "#283618"],
    },
    illustration: "safari",
  },

  neutral_circus: {
    name: "Cirkus",
    gender: "neutral",
    colors: {
      primary: "#E63946",
      primaryLight: "#EE6B75",
      primaryMuted: "rgba(230, 57, 70, 0.12)",
      secondary: "#FFD60A",
      background: "#FFFEF5",
      surface: "#FFF8E1",
      surfaceAlt: "#FFEFB5",
      text: "#2A1A10",
      textMuted: "#7A5A40",
      textLight: "#B09070",
      border: "rgba(230, 57, 70, 0.2)",
      borderLight: "rgba(230, 57, 70, 0.1)",
      confetti: ["#E63946", "#FFD60A", "#457B9D", "#F1FAEE", "#A8DADC"],
    },
    illustration: "circus",
  },

};

export function getBirthdayThemeCSSVariables(
  theme: BirthdayThemeType,
  displayFont: BirthdayFontType = "fredoka",
): Record<string, string> {
  const config = BIRTHDAY_THEME_CONFIGS[theme];
  const fontConfig = BIRTHDAY_FONT_CONFIGS[displayFont];
  return {
    "--theme-primary": config.colors.primary,
    "--theme-primary-light": config.colors.primaryLight,
    "--theme-primary-muted": config.colors.primaryMuted,
    "--theme-secondary": config.colors.secondary,
    "--theme-background": config.colors.background,
    "--theme-surface": config.colors.surface,
    "--theme-surface-alt": config.colors.surfaceAlt,
    "--theme-text": config.colors.text,
    "--theme-text-muted": config.colors.textMuted,
    "--theme-text-light": config.colors.textLight,
    "--theme-border": config.colors.border,
    "--theme-border-light": config.colors.borderLight,
    "--theme-radius": "1.25rem",
    "--theme-shadow": "0 4px 12px -2px rgba(0,0,0,0.08)",
    "--theme-display-font": fontConfig.variable,
  };
}

export function getBirthdayThemeConfig(theme: BirthdayThemeType): BirthdayThemeConfig {
  return BIRTHDAY_THEME_CONFIGS[theme];
}

export function getBirthdayFontConfig(font: BirthdayFontType): BirthdayFontConfig {
  return BIRTHDAY_FONT_CONFIGS[font];
}
