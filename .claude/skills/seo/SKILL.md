---
name: seo
description: SEO knowledge base for Next.js App Router projects — use when adding new pages, writing metadata, creating OG images, updating sitemap/robots, or adding JSON-LD schemas
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# SEO Guide for Next.js App Router

You are an SEO expert. Use this knowledge when creating or modifying pages, metadata, structured data, OG images, cache headers, or crawl rules in a Next.js App Router project.

---

## Checklist: Adding a New Page

When creating any new public-facing page, complete ALL of these:

### 1. Metadata

Export `metadata` (static) or `generateMetadata` (dynamic):

```typescript
// Static
export const metadata: Metadata = {
  title: "Page Title",                     // Suffixed by root template
  description: "1-2 keyword-rich sentences.",
  keywords: ["keyword1", "keyword2", ...], // 10-30 relevant terms
  alternates: { canonical: "/page-path" },
  openGraph: {
    title: "OG Title",
    description: "OG description",
    type: "website", // or "article" for blog posts
  },
};

// Dynamic (for [slug] routes)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetchData(params.slug);
  return {
    title: data.title,
    description: data.description,
    keywords: data.tags,
    alternates: { canonical: `/path/${params.slug}` },
    openGraph: { title: data.title, description: data.description, type: "article" },
  };
}
```

Key rules:
- Every page needs `alternates: { canonical: "/path" }`
- Use `metadataBase` in root layout so all URLs resolve correctly
- Don't hardcode the domain — use env var via `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL)`
- Root layout should set `title: { template: "%s | Brand", default: "Default Title" }`

### 2. Sitemap (`src/app/sitemap.ts`)

Add an entry for every public page:

```typescript
{
  url: `${baseUrl}/new-page`,
  lastModified: new Date(),
  changeFrequency: "weekly",  // or "monthly" for stable content
  priority: 0.8,              // see tier guide below
}
```

Priority tiers:
- **1.0** — Homepage
- **0.9** — Primary landing/pricing pages
- **0.8** — Listing hubs (blog index, category pages)
- **0.7** — Individual items (blog posts, detail pages)
- **0.5** — Utility pages (about, contact)

For dynamic routes, pull slugs with a helper function:
```typescript
const blogSlugs = getAllBlogSlugs();
const blogEntries = blogSlugs.map(slug => ({
  url: `${baseUrl}/blog/${slug}`,
  lastModified: new Date(),
  changeFrequency: "monthly" as const,
  priority: 0.7,
}));
```

Use `dynamic = "force-static"` if the sitemap doesn't need runtime data.

**Never add private/user-specific routes to the sitemap.**

### 3. Robots (`src/app/robots.ts`)

Update when adding new route groups:

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/", "/_next/", "/admin/", "/private/", "/dashboard/"],
      },
      // AI bot whitelist — restrict to public marketing content
      {
        userAgent: ["GPTBot", "ChatGPT-User", "Google-Extended", "anthropic-ai"],
        allow: ["/blog/", "/", "/public-pages/"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/user/"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_SITE_URL,
  };
}
```

Rules:
- Public marketing content: allow for all bots
- Private/user-specific routes: always disallow
- AI bots: whitelist only public content you want in training data
- Always declare sitemap URL explicitly

### 4. OG Image (`opengraph-image.tsx`)

Create in the route folder for automatic discovery:

```typescript
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Page description";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const font = await fetch(new URL("./fonts/MyFont.ttf", import.meta.url))
    .then(res => res.arrayBuffer());

  return new ImageResponse(
    (
      <div style={{ /* 1200x630 layout */ }}>
        {/* Title, subtitle, branding */}
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "MyFont", data: font, style: "normal" }],
    }
  );
}
```

Design guidelines:
- **Always** 1200x630 (standard OpenGraph)
- Keep consistent brand design across all OG images (colors, fonts, layout)
- Use serif fonts for headings, sans-serif for body text
- Include site wordmark/brand identifier
- Reuse font files from a shared location — don't duplicate TTFs per route
- For dynamic routes, accept params and customize per item

### 5. JSON-LD Structured Data

Add as `<script type="application/ld+json">` in the page or layout:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
/>
```

Choose the right schema type:

| Page Type | Schema | Key Fields |
|-----------|--------|------------|
| Homepage | LocalBusiness, Organization, WebSite | name, address, geo, openingHours, areaServed, contactPoint, potentialAction (SearchAction) |
| Service page | Service | name, provider, areaServed, serviceType, description |
| Blog post | Article | headline, datePublished, author, publisher, keywords, mainEntityOfPage |
| How-to content | HowTo | name, step[] (HowToStep with name + text) |
| FAQ section | FAQPage | mainEntity[] (Question + acceptedAnswer) |
| Product/Pricing | Product or Offer | name, price, priceCurrency, availability, seller |
| Reviews | Review[] | author, datePublished, reviewBody, reviewRating, itemReviewed |
| Breadcrumbs | BreadcrumbList | itemListElement[] (position, name, item URL) |

Best practices:
- Cross-reference schemas with `@id` properties (e.g., Service → provider references LocalBusiness `@id`)
- Put global schemas (Organization, WebSite, LocalBusiness) in root layout
- Put page-specific schemas (Article, Service, FAQPage) in each page component
- Use `aggregateRating` on LocalBusiness when you have reviews
- Include `hasOfferCatalog` for businesses with multiple service tiers
- Generate Review schemas dynamically from a testimonials data source

### 6. Cache Headers (`next.config.ts`)

Configure per-route pattern:

```typescript
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [{ key: "Cache-Control", value: "no-store" }],
    },
    {
      source: "/dashboard/:path*",
      headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
    },
    {
      source: "/(blog|about|pricing|)/:path*",
      headers: [{
        key: "Cache-Control",
        value: "public, max-age=3600, stale-while-revalidate=86400",
      }],
    },
  ];
},
```

| Route Type | Cache Strategy | Why |
|------------|---------------|-----|
| API routes | `no-store` | Always fresh data |
| User dashboards | `no-cache, must-revalidate` | Live data, but allow conditional caching |
| Public/static content | `public, max-age=3600, s-w-r=86400` | Fast CDN delivery for crawlers + users |

### 7. Analytics Tracking

Add `data-track` attributes on key interactive elements for event delegation:

```html
<button data-track="cta_click" data-track-cta-name="signup" data-track-cta-location="hero">
  Sign Up
</button>
```

Key events to track on every site:
- **CTA clicks** — which CTAs convert
- **Form submissions** — lead capture success rates
- **Scroll depth** — 25/50/75/100% milestones
- **Section visibility** — IntersectionObserver on key sections
- **FAQ interaction** — which questions users open
- **Navigation clicks** — sidebar, nav, footer link usage

---

## Keyword Strategy Guide

When writing keywords for a page:

1. **Core terms** — What is this page about? (3-5 main keywords)
2. **Synonyms & variations** — Different ways people search for the same thing
3. **Geo-targeting** — City/region variations if location-relevant
4. **Intent modifiers** — "how to", "best", "free", "price", "vs", "alternative"
5. **Long-tail** — Combine core + modifier + geo (e.g., "best wedding photographer Belgrade")
6. **Script/language variants** — Include all relevant scripts (e.g., Latin + Cyrillic for Serbian)

Target 10-30 keywords per page. Root layout should have broad coverage (50-200 terms). Individual pages should be focused on their specific topic cluster.

---

## SEO Landing Page Strategy

Create dedicated landing pages for each search intent cluster:

| Intent | Page Type | Example |
|--------|-----------|---------|
| Informational | Service/feature explainer | "How [service] works" |
| Transactional | Pricing/packages | "Plans & Pricing" |
| Comparison | Feature comparison | "[Service] vs alternatives" |
| Lead capture | Questionnaire/form | "Get started" / "Request a quote" |
| Local | City-specific landing page | "[Service] in [City]" |

Each landing page should target a distinct keyword cluster and have its own OG image, JSON-LD schema, and cache headers.

---

## Location/City Pages Pattern

For businesses serving multiple cities:

1. Create `/locations/[city]/page.tsx` with `generateStaticParams`
2. Each city page gets:
   - City-specific metadata + keywords ("[service] in [city]")
   - Dynamic OG image with city name
   - Service schema with `areaServed` set to the city
   - FAQPage schema with location-specific FAQ
3. Add a location hub page (`/locations/`) linking to all cities
4. Location data lives in a shared data file (e.g., `src/data/locations.ts`)

---

## Blog SEO Pattern

1. Posts defined in a registry file with metadata (title, slug, category, tags, publishDate)
2. Content in MDX files, rendered via `next-mdx-remote`
3. `generateMetadata` per post — title, description, tags as keywords, `type: "article"`
4. Article JSON-LD schema per post (headline, datePublished, author, publisher)
5. Conditional HowTo schema for tutorial/guide posts
6. Future-dated posts hidden in production, visible in dev
7. Client-side search + category filtering for discovery
8. Blog listing page with its own OG image

---

## Rendering Strategy for SEO

- **Server components** by default for all `page.tsx` (better for crawlers)
- **`use client`** only on smallest interactive leaf components
- `generateStaticParams()` for known slugs (blog, locations) — hybrid ISR
- `dynamicParams = true` on routes where new items appear without rebuild
- `dynamic = "force-static"` on sitemap, robots, manifest

---

## Common Mistakes to Avoid

- Forgetting canonical URLs — every page needs `alternates: { canonical }`
- Adding private/user routes to sitemap — never index user-specific data
- Hardcoding domain in metadata — always use `metadataBase` + env var
- Inconsistent OG image dimensions — always 1200x630
- Missing JSON-LD cross-references — schemas should reference each other via `@id`
- Forgetting to update robots.ts when adding new route groups
- Not adding cache headers for new public routes — crawlers benefit from CDN caching
- Putting `"use client"` on page.tsx — hurts SSR and crawlability
- Duplicating font files per OG image route — share from one location
