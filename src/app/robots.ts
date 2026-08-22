import { MetadataRoute } from "next";

// Required for static export
export const dynamic = "force-static";

// Marketing surfaces we explicitly point AI assistants at. NOTE: the group also
// carries `Allow: /`, so this list does not act as a whitelist — anything not in
// AI_BOT_DISALLOW stays crawlable, which is deliberate: a new landing page is
// reachable the day it ships instead of waiting for someone to remember this
// array. Keep customer-specific routes (pozivnica/[slug] etc.) in the disallow
// list — those are also `noindex` at the page level.
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
  "/iznajmljivanje-automobila-za-vencanje",
  "/iznajmljivanje-oldtajmera-za-vencanje",
  "/iznajmljivanje-opreme-za-vencanje",
  "/lazni-maticar",
  "/raspored-sedenja",
  "/qr-pano-dobrodoslice",
  "/qr-galerija-slika-sa-vencanja",
  "/moje-vencanje",
];

const AI_BOT_DISALLOW = [
  "/api/",
  "/_next/",
  "/admin/",
  "/racun/",
  "/pristup/",
  "/slike/",
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
  "/dogadjaj/",
  "/placanje/",
  "/rsvp/",
];

// Tri kategorije, sve tri namerno puštamo na marketing sadržaj:
//  • trening modela  — GPTBot, ClaudeBot, Google-Extended, CCBot, Bytespider...
//  • indeks za AI pretragu — OAI-SearchBot, Claude-SearchBot, PerplexityBot
//  • live fetch na zahtev korisnika — ChatGPT-User, Claude-User, Perplexity-User
// Druge dve kategorije odlučuju hoće li nas asistent uopšte pomenuti kada ga
// neko pita za preporuku, pa njihovo blokiranje = ispadanje iz AI preporuka.
const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "DuckAssistBot",
  "MistralAI-User",
  // Zastareli Anthropic tokeni — zadržani jer ih stariji klijenti još šalju.
  "anthropic-ai",
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
          // `/racun/` intentionally NOT disallowed — social-media preview
          // scrapers (facebookexternalhit, Twitterbot, Slackbot, etc.)
          // honor robots.txt and would otherwise skip the page entirely,
          // killing OG previews on Instagram/Messenger/Slack. The page
          // itself sets robots: { index: false } via layout.tsx so search
          // engines still won't index per-receipt URLs.
          "/pristup/",
          "/slike/",
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
          "/dogadjaj/",
          "/placanje/",
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
