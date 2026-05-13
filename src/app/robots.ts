import { MetadataRoute } from "next";

// Required for static export
export const dynamic = "force-static";

// All public marketing & landing surfaces that AI assistants are allowed to crawl.
// Keep customer-specific routes (pozivnica/[slug], deciji-rodjendan/[slug], etc.) OUT.
const AI_BOT_ALLOW = [
  "/",
  "/blog/",
  "/lokacije/",
  "/vendori/",
  "/cene",
  "/pozivnice",
  "/recenzija",
  "/telefon-uspomena",
  "/planiranje-vencanja",
  "/napravi-pozivnicu",
  "/napravi-deciju-pozivnicu",
  "/napravi-punoletstvo",
  "/raspored-sedenja",
  "/qr-pano-dobrodoslice",
  "/moje-vencanje",
];

const AI_BOT_DISALLOW = [
  "/api/",
  "/_next/",
  "/admin/",
  "/racun/",
  "/pozivnica/*/portal",
  "/pozivnica/*/raspored-sedenja",
  "/pozivnica/*/potvrde",
  "/pozivnica/*/prijava",
  "/pozivnica/*/gde-sedim",
  "/pozivnica/*/audio-knjiga",
  "/premium-pozivnica/",
  "/deciji-rodjendan/*/portal",
  "/deciji-rodjendan/*/prijava",
  "/punoletstvo/*/portal",
  "/punoletstvo/*/prijava",
  "/raspored-sedenja/*/",
  "/rsvp/",
];

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "anthropic-ai",
  "ClaudeBot",
  "Claude-Web",
  "Applebot-Extended",
  "Bytespider",
  "Amazonbot",
  "Meta-ExternalAgent",
  "FacebookBot",
  "CCBot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/private/",
          "/admin/",
          "/racun/",
          "/pozivnica/*/portal",
          "/pozivnica/*/raspored-sedenja",
          "/pozivnica/*/potvrde",
          "/pozivnica/*/prijava",
          "/pozivnica/*/gde-sedim",
          "/pozivnica/*/audio-knjiga",
          "/deciji-rodjendan/*/portal",
          "/deciji-rodjendan/*/prijava",
          "/punoletstvo/*/portal",
          "/punoletstvo/*/prijava",
          "/raspored-sedenja/*/",
          "/rsvp/",
        ],
      },
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: AI_BOT_ALLOW,
        disallow: AI_BOT_DISALLOW,
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
