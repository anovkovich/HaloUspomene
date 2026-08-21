import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Next spawns one static-generation worker per core. On a dev machine that
// oversubscribes it: every worker rasterizes OG images (CPU-bound satori/resvg)
// while querying Atlas, event loops stall for seconds, and Mongo connections
// time out or get dropped mid-query — the build then dies on a random page.
// Vercel's builders don't hit this, so cap workers only outside Vercel.
// Override with NEXT_BUILD_CPUS if a machine wants a different number.
const localBuildCpus = process.env.VERCEL
  ? undefined
  : Number(process.env.NEXT_BUILD_CPUS ?? 6);

const nextConfig: NextConfig = {
  trailingSlash: true,
  ...(localBuildCpus ? { experimental: { cpus: localBuildCpus } } : {}),
  async headers() {
    return [
      // API routes and server-rendered pages — always fresh
      {
        source: "/api/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      // Wedding invitation pages — revalidate each visit (content changes: RSVP, seating)
      {
        source: "/pozivnica/(.*)",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
      // Premium invitation pages — revalidate each visit
      {
        source: "/premium-pozivnica/(.*)",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
      // Birthday invitation pages — revalidate each visit (content changes: RSVP)
      {
        source: "/deciji-rodjendan/(.*)",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
      // Event invitation pages — revalidate each visit (content changes: RSVP)
      {
        source: "/dogadjaj/(.*)",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
      // Invitation designs — de-facto opt-out signal against AI training /
      // dataset scrapers (does not affect normal search indexing; unknown
      // tokens are ignored by search engines). Complements the in-page
      // AiCopyrightNotice and the AI-bot rules in robots.ts.
      {
        source:
          "/(pozivnica|premium-pozivnica|deciji-rodjendan|punoletstvo|dogadjaj)/(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noai, noimageai" }],
      },
      // Share-link landing pages — per-customer, password-bearing; never cache
      {
        source: "/pristup/(.*)",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
      // Client photo-upload links — per-customer, token-bearing; never cache
      {
        source: "/slike/(.*)",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
      // Static pages — cache 1 hour, revalidate in background
      {
        source: "/(blog|lokacije|napravi-pozivnicu|napravi-deciju-pozivnicu|telefon-uspomena|planiranje-vencanja|pozivnice|cene|qr-galerija-slika-sa-vencanja|iznajmljivanje-oldtajmera-za-vencanje|iznajmljivanje-automobila-za-vencanje|iznajmljivanje-opreme-za-vencanje|lazni-maticar)(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
      // Homepage
      {
        source: "/",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: { disable: true },
});
