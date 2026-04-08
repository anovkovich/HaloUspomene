// Premium AI mode — glassmorphism CSS classes (light luxury palette)

export const premiumColors = {
  gold: "#d4af37",
  goldLight: "#e8d48a",
  goldDark: "#c5a028",
  ivory: "#fffdf5",
  charcoal: "#232323",
  textMuted: "#8B7355",
} as const;

/** Classic (red/cream) class overrides — keyed by component role */
export const classicClasses = {
  pageBackground: "bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]",
  card: "bg-white rounded-3xl shadow-sm border border-stone-100",
  input:
    "border-b border-stone-200 focus:border-[#AE343F] bg-transparent text-stone-800 placeholder:text-stone-300",
  label: "text-stone-400",
  buttonPrimary:
    "bg-[#AE343F] text-white hover:bg-[#8B2833] shadow-md shadow-[#AE343F]/20",
  buttonSecondary:
    "border border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700",
  progressBar: "bg-[#AE343F]",
  progressTrack: "bg-[#AE343F]/15",
  dotActive: "bg-[#AE343F]",
  dotInactive: "bg-[#AE343F]/25",
  stepTitle: "text-[#8B2833]",
  stepCounter: "text-[#AE343F]",
  pricingBox:
    "bg-[#AE343F]/5 border border-[#AE343F]/15 rounded-2xl",
  priceText: "text-[#AE343F]",
  priceSubtext: "text-[#8B2833]",
  errorText: "text-[#AE343F]",
};

/** Premium (gold/ivory glassmorphism) class overrides */
export const premiumClasses = {
  pageBackground: "bg-[#fffdf5]",
  card: "bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_0_30px_rgba(212,175,55,0.08)] border border-[#d4af37]/20",
  input:
    "border-b border-[#d4af37]/30 focus:border-[#d4af37] bg-transparent text-[#232323] placeholder:text-[#d4af37]/40",
  label: "text-[#8B7355]",
  buttonPrimary:
    "bg-gradient-to-r from-[#d4af37] to-[#c5a028] text-white hover:from-[#c5a028] hover:to-[#b89520] shadow-lg shadow-[#d4af37]/25",
  buttonSecondary:
    "border border-[#d4af37]/30 text-[#8B7355] hover:border-[#d4af37]/50 hover:text-[#d4af37]",
  progressBar: "bg-gradient-to-r from-[#d4af37] to-[#c5a028]",
  progressTrack: "bg-[#d4af37]/15",
  dotActive: "bg-[#d4af37]",
  dotInactive: "bg-[#d4af37]/25",
  stepTitle: "text-[#8B7355]",
  stepCounter: "text-[#d4af37]",
  pricingBox:
    "bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl",
  priceText: "text-[#d4af37]",
  priceSubtext: "text-[#8B7355]",
  errorText: "text-[#d4af37]",
};

/** Returns the correct class set based on premium mode */
export function getThemeClasses(isPremium: boolean) {
  return isPremium ? premiumClasses : classicClasses;
}
