import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: "export",

  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },

  // Deploying to subpath: username.github.io/repo-name
  basePath: "/HaloUspomene",
  assetPrefix: "/HaloUspomene",

  // Trailing slashes help with GitHub Pages routing
  trailingSlash: true,
};

export default nextConfig;
