import { MetadataRoute } from "next";

// Required for static export
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    // Note: Hash URLs (#section) are not typically crawled by search engines,
    // but including the main URL with high priority ensures the single-page
    // app is properly indexed. When you add separate pages (e.g., /blog, /faq),
    // add them here with appropriate priorities.
  ];
}
