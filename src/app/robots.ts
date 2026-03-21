import { MetadataRoute } from "next";

// Required for static export
export const dynamic = "force-static";

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
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/blog/", "/lokacije/", "/napravi-pozivnicu", "/"],
        disallow: [
          "/api/",
          "/_next/",
          "/pozivnica/*/portal",
          "/pozivnica/*/raspored-sedenja",
          "/pozivnica/*/potvrde",
          "/pozivnica/*/prijava",
          "/pozivnica/*/gde-sedim",
          "/pozivnica/*/audio-knjiga",
        ],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/blog/", "/lokacije/", "/napravi-pozivnicu", "/"],
        disallow: [
          "/api/",
          "/_next/",
          "/pozivnica/*/portal",
          "/pozivnica/*/raspored-sedenja",
          "/pozivnica/*/potvrde",
          "/pozivnica/*/prijava",
          "/pozivnica/*/gde-sedim",
          "/pozivnica/*/audio-knjiga",
        ],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/blog/", "/lokacije/", "/napravi-pozivnicu", "/"],
        disallow: [
          "/api/",
          "/_next/",
          "/pozivnica/*/portal",
          "/pozivnica/*/raspored-sedenja",
          "/pozivnica/*/potvrde",
          "/pozivnica/*/prijava",
          "/pozivnica/*/gde-sedim",
          "/pozivnica/*/audio-knjiga",
        ],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/blog/", "/lokacije/", "/napravi-pozivnicu", "/"],
        disallow: [
          "/api/",
          "/_next/",
          "/pozivnica/*/portal",
          "/pozivnica/*/raspored-sedenja",
          "/pozivnica/*/potvrde",
          "/pozivnica/*/prijava",
          "/pozivnica/*/gde-sedim",
          "/pozivnica/*/audio-knjiga",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
