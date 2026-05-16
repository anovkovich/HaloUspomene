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
import { Translations, getTranslations, type Lang } from "../translations";

interface ThemeContextValue {
  theme: ThemeType;
  config: ThemeConfig;
  scriptFont: ScriptFontType;
  scriptFontConfig: ScriptFontConfig;
  useCyrillic: boolean;
  lang: Lang;
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
  /** Explicit language. When omitted, derived from useCyrillic for backward
   *  compatibility (true → "sr-Cyrl", false → "sr-Latn"). The German mirror
   *  route passes "de" so children read German translations from context. */
  lang?: Lang;
  /** When true, swap Latin strings to the BA/HR/ME ijekavica variant.
   *  Only meaningful when lang is "sr-Latn"; ignored otherwise. */
  useIjekavica?: boolean;
  customPrimaryColor?: string;
  customBackgroundColor?: string;
  children: React.ReactNode;
}

export function ThemeProvider({
  theme,
  scriptFont = "great-vibes",
  useCyrillic = false,
  lang: langProp,
  useIjekavica = false,
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
  const lang: Lang = langProp ?? (useCyrillic ? "sr-Cyrl" : "sr-Latn");
  const translations = getTranslations(lang, useIjekavica);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        config: resolvedConfig,
        scriptFont,
        scriptFontConfig,
        useCyrillic,
        lang,
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
