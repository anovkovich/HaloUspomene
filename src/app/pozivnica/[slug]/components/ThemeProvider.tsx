"use client";

import React, { createContext, useContext } from "react";
import { ThemeType, ThemeConfig, ScriptFontType } from "../types";
import { getThemeCSSVariables, getThemeConfig, getScriptFontConfig, ScriptFontConfig } from "../constants";
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
  children: React.ReactNode;
}

export function ThemeProvider({
  theme,
  scriptFont = "great-vibes",
  useCyrillic = false,
  children
}: ThemeProviderProps) {
  const cssVariables = getThemeCSSVariables(theme, scriptFont);
  const config = getThemeConfig(theme);
  const scriptFontConfig = getScriptFontConfig(scriptFont);
  const translations = getTranslations(useCyrillic);

  return (
    <ThemeContext.Provider value={{
      theme,
      config,
      scriptFont,
      scriptFontConfig,
      useCyrillic,
      t: translations
    }}>
      <div
        className="theme-wrapper"
        style={cssVariables as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
