/**
 * AI image generation via Pollinations.ai (free endpoint).
 * Generates paper-craft style couple illustrations from text descriptions.
 */

/**
 * Build the sculpted cream-and-gold couple illustration prompt.
 *
 * Aesthetic: a hybrid between layered paper-cut and soft painterly
 * relief — cream and ivory tones with warm golden glow, soft sculpted
 * depth (not harsh cut edges), romantic and luminous. The couple
 * description is placed first with a strict "must match" instruction
 * so the model prioritises the user's features over style modifiers.
 *
 * Background is anchored to pure white so the downstream whiten-bg
 * (birefnet) step can cleanly remove it for a transparent RGBA PNG.
 */
function buildPaperCraftPrompt(coupleDescription: string): string {
  return [
    // Subject first — strict match on the user's description
    `European white wedding couple: ${coupleDescription}`,
    `bride and groom MUST accurately match the description above (hair color, hairstyle, dress, suit, beard)`,
    `fair skin, European Caucasian features`,
    `full body, centered, gentle romantic embrace`,
    // Style — layered cream paper sculpture / bas-relief
    `cream paper sculpture illustration, layered cream and ivory paper bas-relief art`,
    `couple as a cut paper foreground element placed on a simple stacked cream paper base, clean organic cut edges`,
    `delicate pencil and fine ink surface line details on dress folds, hair strands, and features`,
    `warm cream, ivory monochrome palette with subtle pale gold highlights`,
    `soft drop shadows between paper layers, visible paper thickness`,
    `stylized 2D paper art illustration, NOT photorealistic, NOT 3D render, NOT CGI, NOT photograph, NOT realistic faces`,
    // Demographic constraint
    `NOT Black people, NOT African, NOT dark skin tones`,
    // Background anchor for birefnet removal
    `isolated on pure solid white background #ffffff, no text, no extra people`,
  ].join(", ");
}

/**
 * Generate a styled illustration using Pollinations.ai (free text-to-image).
 */
export async function generateCoupleIllustration(
  coupleDescription: string,
): Promise<{ url: string }> {
  const prompt = buildPaperCraftPrompt(coupleDescription);
  const seed = Math.floor(Math.random() * 10000);
  const safePrompt = encodeURIComponent(prompt);
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${safePrompt}?nologo=true&seed=${seed}&width=1024&height=1024`;

  const imgResponse = await fetch(pollinationsUrl, { redirect: "follow" });
  if (
    !imgResponse.ok ||
    !imgResponse.headers.get("content-type")?.startsWith("image")
  ) {
    throw new Error("AI generation failed. Please try again.");
  }

  return { url: pollinationsUrl };
}
