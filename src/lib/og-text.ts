/**
 * Strip characters that the OG-image fonts can't render.
 *
 * The opengraph-image routes hand Satori (next/og) a fixed set of bundled
 * .ttf fonts. When a rendered string contains a glyph none of them cover —
 * a decorative star (✦ ★), a heart, an emoji couples put in their names —
 * Satori tries to DOWNLOAD a fallback font at build time. That fetch 400s or,
 * on the Vercel build machine, fails at the network layer, which crashes the
 * whole prerender and fails the deploy.
 *
 * Removing the symbol before it reaches the image sidesteps the fetch
 * entirely. Only the social-preview image is affected — the invitation itself
 * still shows whatever the couple entered. Letters (Latin and Cyrillic),
 * digits, punctuation and the ampersand are all kept.
 */
export function stripOgSymbols(text: string): string {
  return text
    .replace(/[\p{Extended_Pictographic}\p{So}\p{Sk}️‍]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
