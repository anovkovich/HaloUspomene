import { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/data/blog/posts";
import { getAllLocationSlugs } from "@/data/locations";
import { CATEGORY_SLUGS } from "@/data/vendori/categories";

// Required for static export
export const dynamic = "force-static";

/**
 * `next.config.ts` sets `trailingSlash: true`, so every page is served at a URL
 * ending in a slash and the slashless form 308-redirects to it. A sitemap must
 * list the destination, not the redirect: entries written without the slash
 * make Google crawl 78 redirects and keep the slashless variants alive in
 * Search Console, which is how one blog post ended up reported as two URLs
 * splitting its clicks. Normalising here rather than at 78 call sites means a
 * newly added entry cannot reintroduce the problem.
 */
function withTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";
  const lastModified = new Date();

  const blogSlugs = getAllBlogSlugs();
  const locationSlugs = getAllLocationSlugs();

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/cene`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/pozivnice`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/napravi-pozivnicu`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/telefon-uspomena`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/qr-pano-dobrodoslice`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/qr-galerija-slika-sa-vencanja`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/raspored-sedenja`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/planiranje-vencanja`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/iznajmljivanje-automobila-za-vencanje`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/lazni-maticar`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/iznajmljivanje-oldtajmera-za-vencanje`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/iznajmljivanje-opreme-za-vencanje`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/napravi-deciju-pozivnicu`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/napravi-punoletstvo`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // `/moje-vencanje` je NAMERNO izostavljena — to je ulaz u aplikaciju
    // (prijava), postavljena je na `noindex`, a sitemap bi Google-u slao
    // suprotan signal. Javna, indeksabilna stranica o planeru je
    // `/planiranje-vencanja`. V. komentar u `src/app/moje-vencanje/page.tsx`.
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
    {
      url: `${siteUrl}/vendori`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...Object.values(CATEGORY_SLUGS).map((slug) => ({
      url: `${siteUrl}/vendori/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ];

  return entries.map((entry) => ({
    ...entry,
    url: withTrailingSlash(entry.url),
  }));
}
