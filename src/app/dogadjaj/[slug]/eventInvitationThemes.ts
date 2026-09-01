/**
 * Themes for the event invitation. Placeholder palette while the visual
 * language is being designed — the record stores a plain string key, so a new
 * theme is an entry here and nothing else.
 *
 * Values are the CSS custom properties the renderer reads, mirroring how the
 * wedding themes work in `pozivnica/[slug]/constants.tsx`.
 */

export interface EventTheme {
  label: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    primary: string;
    accent: string;
    border: string;
  };
}

export const EVENT_THEMES: Record<string, EventTheme> = {
  executive_navy: {
    label: "Executive Navy",
    colors: {
      background: "#F7F6EF",
      surface: "#FFFFFF",
      text: "#16233d",
      textMuted: "rgba(22,35,61,0.62)",
      primary: "#16233d",
      accent: "#c8a24a",
      border: "rgba(22,35,61,0.16)",
    },
  },
  graphite_silver: {
    label: "Graphite & Silver",
    colors: {
      background: "#F6F6F7",
      surface: "#FFFFFF",
      text: "#232323",
      textMuted: "rgba(35,35,35,0.6)",
      primary: "#232323",
      accent: "#9aa3ad",
      border: "rgba(35,35,35,0.14)",
    },
  },
  gala_black_gold: {
    label: "Gala Black & Gold",
    colors: {
      background: "#14120e",
      surface: "#1c1a15",
      text: "#f3efe4",
      textMuted: "rgba(243,239,228,0.62)",
      primary: "#f3efe4",
      accent: "#d4af37",
      border: "rgba(212,175,55,0.28)",
    },
  },
};

export const DEFAULT_EVENT_THEME = "executive_navy";

export function resolveEventTheme(key?: string): EventTheme {
  return EVENT_THEMES[key ?? ""] ?? EVENT_THEMES[DEFAULT_EVENT_THEME];
}
