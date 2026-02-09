import { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/data/blog/posts";
import { getAllLocationSlugs } from "@/data/locations";

// Required for static export
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";
  const lastModified = new Date();

  const blogSlugs = getAllBlogSlugs();
  const locationSlugs = getAllLocationSlugs();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogSlugs.map((slug) => ({
      url: `${siteUrl}/blog/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${siteUrl}/lokacije`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...locationSlugs.map((slug) => ({
      url: `${siteUrl}/lokacije/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
