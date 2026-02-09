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
          "/pozivnica/",
          "/napravi-pozivnicu",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/blog/", "/lokacije/", "/"],
        disallow: ["/pozivnica/", "/api/", "/_next/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/blog/", "/lokacije/", "/"],
        disallow: ["/pozivnica/", "/api/", "/_next/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/blog/", "/lokacije/", "/"],
        disallow: ["/pozivnica/", "/api/", "/_next/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/blog/", "/lokacije/", "/"],
        disallow: ["/pozivnica/", "/api/", "/_next/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
