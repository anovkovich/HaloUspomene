import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  trailingSlash: true,
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
      // Birthday invitation pages — revalidate each visit (content changes: RSVP)
      {
        source: "/deciji-rodjendan/(.*)",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
      // Static pages — cache 1 hour, revalidate in background
      {
        source: "/(blog|lokacije|napravi-pozivnicu|napravi-deciju-pozivnicu)(.*)",
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
