import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: "export",

  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },

  // If deploying to a subpath (e.g., username.github.io/repo-name),
  // uncomment and set basePath:
  // basePath: "/HaloUspomene",

  // Trailing slashes help with GitHub Pages routing
  trailingSlash: true,
};

export default nextConfig;
