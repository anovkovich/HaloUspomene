import type { PremiumThemeType } from "@/app/pozivnica/[slug]/types";

export interface PremiumVisualTheme {
  // Colors
  primary: string;
  primaryLight: string;
  textMain: string;
  textMuted: string;
  bgGradient: string; // Tailwind gradient classes
  cardBg: string;
  cardBorder: string;

  // Hero ornament images (in /public/images/premium/ornaments/)
  archFrame: string | null;
  garlandTop: string | null;
  garlandBottom: string | null;
  floatingElements: string[]; // Array of image paths for scattered elements
  showParticles: boolean;

  // UI style
  glassOpacity: string; // e.g. "bg-white/60" or "bg-white/80"
  buttonGradient: string;
  dividerStyle: "gold" | "ink" | "watercolor";
}

const watercolorTheme: PremiumVisualTheme = {
  primary: "#d4af37",
  primaryLight: "#e8d48a",
  textMain: "#232323",
  textMuted: "#8B7355",
  bgGradient: "bg-gradient-to-b from-[#faf8f0] via-[#fffdf5] to-[#f5f0e6]",
  cardBg: "bg-white/60 backdrop-blur-xl",
  cardBorder: "border-[#d4af37]/15",
  archFrame: "/images/premium/ornaments/ornate-arch-frame.png",
  garlandTop: "/images/premium/ornaments/floral-garland-top.png",
  garlandBottom: "/images/premium/ornaments/floral-garland-bottom.png",
  floatingElements: [
    "/images/premium/ornaments/floating-flower-1.png",
    "/images/premium/ornaments/floating-flower-2.png",
    "/images/premium/ornaments/floating-flower-3.png",
  ],
  showParticles: true,
  glassOpacity: "bg-white/60",
  buttonGradient: "from-[#d4af37] to-[#c5a028]",
  dividerStyle: "gold",
};

const lineArtTheme: PremiumVisualTheme = {
  primary: "#d4af37",
  primaryLight: "#e8d48a",
  textMain: "#232323",
  textMuted: "#8B7355",
  bgGradient: "bg-gradient-to-b from-[#faf8f0] via-[#fffdf5] to-[#f5f0e6]",
  cardBg: "bg-white/60 backdrop-blur-xl",
  cardBorder: "border-[#d4af37]/15",
  archFrame: "/images/premium/ornaments/ornate-arch-frame.png",
  garlandTop: "/images/premium/ornaments/floral-garland-top.png",
  garlandBottom: "/images/premium/ornaments/floral-garland-bottom.png",
  floatingElements: [
    "/images/premium/ornaments/floating-flower-1.png",
    "/images/premium/ornaments/floating-flower-2.png",
    "/images/premium/ornaments/floating-flower-3.png",
  ],
  showParticles: true,
  glassOpacity: "bg-white/60",
  buttonGradient: "from-[#d4af37] to-[#c5a028]",
  dividerStyle: "gold",
};

const themeMap: Record<PremiumThemeType, PremiumVisualTheme> = {
  watercolor: watercolorTheme,
  line_art: lineArtTheme,
  disney_pixar: watercolorTheme, // fallback, unused since we removed disney
};

export function getPremiumVisualTheme(
  theme?: PremiumThemeType,
): PremiumVisualTheme {
  return themeMap[theme || "watercolor"] || watercolorTheme;
}
