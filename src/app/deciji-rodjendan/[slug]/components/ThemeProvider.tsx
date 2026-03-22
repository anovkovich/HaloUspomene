"use client";

import { createContext, useContext } from "react";
import type { BirthdayThemeConfig, BirthdayThemeType } from "../types";
import { getBirthdayThemeConfig } from "../constants";

interface ThemeContextValue {
  config: BirthdayThemeConfig;
  theme: BirthdayThemeType;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useBirthdayTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useBirthdayTheme must be used within BirthdayThemeProvider");
  return ctx;
}

export function BirthdayThemeProvider({
  theme,
  cssVars,
  children,
}: {
  theme: BirthdayThemeType;
  cssVars: Record<string, string>;
  children: React.ReactNode;
}) {
  const config = getBirthdayThemeConfig(theme);

  return (
    <ThemeContext.Provider value={{ config, theme }}>
      <div style={cssVars as React.CSSProperties}>{children}</div>
    </ThemeContext.Provider>
  );
}
