// Shared theme configs for the premium envelope loaders (classic + wings).
// Drives every color, gradient, shadow, and text tone so the loading
// envelope matches the invitation theme the user will see underneath.

export type EnvelopeTheme = "watercolor" | "line_art";

export interface EnvelopeThemeConfig {
  /** Full-screen loader backdrop (behind the envelope scene). */
  overlay: {
    bgSealed: string;
    bgOpen: string;
    backdropFilterOpen: string;
  };
  /** Envelope body — the back, front pocket, flap, and wings. */
  envelope: {
    back: string;
    backBorder: string;
    pocket: string;
    flapOuter: string;
    flapInner: string;
    wingOuter: string;
    wingInner: string;
    wingStroke: string;
    wingStrokeOpacity: number;
  };
  /** The invitation card that slides out of the envelope. */
  card: {
    bg: string;
    border: string;
    shadow: string;
    shadowExtracted: string;
    innerBorder1: string;
    innerBorder2: string;
    cornerColor: string;
    backdropFilter?: string;
  };
  /** Text colors used on the invitation card. */
  text: {
    label: string;
    names: string;
    dividerLine: string;
    heart: string;
    dateDay: string;
    dateMonth: string;
    dateYear: string;
  };
  /** Closure element — gold wax stamp (watercolor) or ink medallion (line art). */
  seal:
    | {
        kind: "wax";
        bgGradient: string;
        border: string;
        textColor: string;
        shadow: string;
        textShadow: string;
      }
    | {
        kind: "cut";
        bg: string;
        border: string;
        textColor: string;
        shadow: string;
      };
}

/** Deep gold luxury — solid cream envelope, glassy invitation card. */
export const WATERCOLOR_LOADER: EnvelopeThemeConfig = {
  overlay: {
    bgSealed:
      "radial-gradient(ellipse 80% 70% at 50% 50%, #2a1a0e 0%, #100805 100%)",
    bgOpen:
      "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(42,26,14,0.85) 0%, rgba(16,8,5,0.88) 100%)",
    backdropFilterOpen: "blur(10px)",
  },
  envelope: {
    // OPAQUE warm cream envelope — reads like real luxury paper stock.
    back: "linear-gradient(to bottom right, #f5ead6, #e8dcc0)",
    backBorder: "rgba(212,175,55,0.6)",
    pocket: "linear-gradient(to bottom, #f0e5cc, #e5d8b8)",
    flapOuter: "linear-gradient(to bottom, #f2e7ce, #ebdfc4)",
    flapInner: "linear-gradient(to bottom, #faf4e1, #f0e5cc)",
    wingOuter: "linear-gradient(to right, #f0e5cc, #e5d8b8)",
    wingInner: "linear-gradient(to left, #faf4e1, #f0e5cc)",
    wingStroke: "#b89520",
    wingStrokeOpacity: 0.8,
  },
  card: {
    // Glass pane that stays legible — ~93% opaque cream so the text is
    // always readable against the dark watercolor backdrop, with enough
    // translucency + inset highlight + gold ring to still read as glass.
    bg:
      "linear-gradient(to bottom, rgba(253,250,238,0.95), rgba(247,237,214,0.93))",
    border: "rgba(180,140,40,0.85)",
    shadow:
      "0 24px 60px -15px rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.3), 0 0 0 1px rgba(212,175,55,0.45), inset 0 1px 2px rgba(255,255,255,0.85), inset 0 -1px 2px rgba(212,175,55,0.25)",
    shadowExtracted:
      "0 60px 130px -30px rgba(0,0,0,0.75), 0 16px 38px rgba(0,0,0,0.35), 0 0 0 1px rgba(212,175,55,0.6), inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(212,175,55,0.3)",
    innerBorder1: "rgba(180,140,40,0.6)",
    innerBorder2: "rgba(180,140,40,0.32)",
    cornerColor: "rgba(180,140,40,0.8)",
    backdropFilter: "blur(8px) saturate(140%)",
  },
  text: {
    label: "#9a8a6e",
    names: "#d4af37",
    dividerLine: "rgba(212,175,55,0.55)",
    heart: "rgba(212,175,55,0.7)",
    dateDay: "#dcc88c",
    dateMonth: "#d4af37",
    dateYear: "#8B7355",
  },
  seal: {
    kind: "wax",
    bgGradient:
      "radial-gradient(circle at 35% 35%, #e8c84a, #d4af37 40%, #b89520 80%, #8b6914)",
    border: "#b89520",
    textColor: "#fff",
    shadow:
      "0 10px 30px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), inset 0 2px 6px rgba(255,255,255,0.25), inset 0 -3px 6px rgba(0,0,0,0.25)",
    textShadow:
      "0 1px 3px rgba(0,0,0,0.4), 0 0 8px rgba(255,255,255,0.15)",
  },
};

/** White paper-cut — bright cream, ink on paper, drop-shadow depth. */
export const LINE_ART_LOADER: EnvelopeThemeConfig = {
  overlay: {
    bgSealed:
      "radial-gradient(ellipse 95% 85% at 50% 50%, #FDFBF4 0%, #EFE9D8 100%)",
    bgOpen:
      "radial-gradient(ellipse 95% 85% at 50% 50%, rgba(253,251,244,0.75) 0%, rgba(232,225,200,0.85) 100%)",
    backdropFilterOpen: "blur(4px)",
  },
  envelope: {
    back: "linear-gradient(to bottom right, #f5f2e8, #ede8d6)",
    backBorder: "rgba(26,26,26,0.2)",
    pocket: "linear-gradient(to bottom, #eae5d3, #e0d9c2)",
    flapOuter: "#eae5d3",
    flapInner: "#f5f2e8",
    wingOuter: "linear-gradient(to right, #eae5d3, #e0d9c2)",
    wingInner: "linear-gradient(to left, #f5f2e8, #ede8d6)",
    wingStroke: "#1a1a1a",
    wingStrokeOpacity: 0.35,
  },
  card: {
    // Bright white paper on a cream base — strong drop shadow gives the
    // lifted paper-cut look.
    bg: "linear-gradient(to bottom, #ffffff, #fdfcf6)",
    border: "rgba(26,26,26,0.18)",
    shadow:
      "0 20px 50px -10px rgba(40,25,10,0.28), 0 6px 16px rgba(40,25,10,0.16)",
    shadowExtracted:
      "0 60px 130px -30px rgba(40,25,10,0.4), 0 12px 32px rgba(40,25,10,0.22)",
    innerBorder1: "rgba(26,26,26,0.25)",
    innerBorder2: "rgba(26,26,26,0.1)",
    cornerColor: "rgba(26,26,26,0.4)",
  },
  text: {
    label: "#555",
    names: "#1a1a1a",
    dividerLine: "rgba(26,26,26,0.45)",
    heart: "rgba(26,26,26,0.6)",
    dateDay: "#1a1a1a",
    dateMonth: "#1a1a1a",
    dateYear: "rgba(26,26,26,0.65)",
  },
  seal: {
    kind: "cut",
    bg: "linear-gradient(to bottom, #ffffff, #f6f3e8)",
    border: "#1a1a1a",
    textColor: "#1a1a1a",
    shadow:
      "0 12px 28px rgba(40,25,10,0.35), 0 4px 10px rgba(40,25,10,0.22)",
  },
};

export function getLoaderTheme(
  theme?: EnvelopeTheme | string,
): EnvelopeThemeConfig {
  return theme === "line_art" ? LINE_ART_LOADER : WATERCOLOR_LOADER;
}
