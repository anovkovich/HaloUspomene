"use client";

import React, { createContext, useContext } from "react";
import { ThemeType, ThemeConfig, ScriptFontType } from "../types";
import {
  getThemeCSSVariables,
  getThemeConfig,
  getScriptFontConfig,
  buildCustomColorOverrides,
  ScriptFontConfig,
} from "../constants";
import { Translations, getTranslations } from "../translations";

interface ThemeContextValue {
  theme: ThemeType;
  config: ThemeConfig;
  scriptFont: ScriptFontType;
  scriptFontConfig: ScriptFontConfig;
  useCyrillic: boolean;
  t: Translations;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  theme: ThemeType;
  scriptFont?: ScriptFontType;
  useCyrillic?: boolean;
  customPrimaryColor?: string;
  customBackgroundColor?: string;
  children: React.ReactNode;
}

export function ThemeProvider({
  theme,
  scriptFont = "great-vibes",
  useCyrillic = false,
  customPrimaryColor,
  customBackgroundColor,
  children,
}: ThemeProviderProps) {
  // Base CSS variables from theme
  const baseCssVars = getThemeCSSVariables(theme, scriptFont);
  // Apply custom color overrides if provided
  const cssVariables =
    customPrimaryColor || customBackgroundColor
      ? {
          ...baseCssVars,
          ...buildCustomColorOverrides(
            customPrimaryColor || baseCssVars["--theme-primary"],
            customBackgroundColor || undefined
          ),
        }
      : baseCssVars;

  // Base config from theme
  const config = getThemeConfig(theme);
  // Override colors in config for context consumers (e.g., EnvelopeLoader)
  const resolvedConfig =
    customPrimaryColor || customBackgroundColor
      ? {
          ...config,
          colors: {
            ...config.colors,
            primary: customPrimaryColor || config.colors.primary,
            background:
              customBackgroundColor || config.colors.background,
          },
        }
      : config;

  const scriptFontConfig = getScriptFontConfig(scriptFont);
  const translations = getTranslations(useCyrillic);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        config: resolvedConfig,
        scriptFont,
        scriptFontConfig,
        useCyrillic,
        t: translations,
      }}
    >
      <div
        className="theme-wrapper"
        style={cssVariables as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
