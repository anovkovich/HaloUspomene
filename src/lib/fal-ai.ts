/**
 * AI image generation via Pollinations.ai (free endpoint).
 * Generates paper-craft style couple illustrations from text descriptions.
 */

/**
 * Build the paper-craft couple illustration prompt from user's description.
 * Produces a layered paper cutout style illustration on pure white background
 * that can float over the invitation (like the moon/castle in paper parallax).
 */
function buildPaperCraftPrompt(coupleDescription: string): string {
  return `${coupleDescription}, wedding couple, bride in white dress, groom in dark suit, 3D paper cutout art, layered white paper craft with ink details and shadows, full body, centered with generous empty space around, isolated on pure solid white background (#ffffff), background must be PURE WHITE! NO dirty white color NO ivory - JUST PURE WHITE #fff, 8k`;
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
