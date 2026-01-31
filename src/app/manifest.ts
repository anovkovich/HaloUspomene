import { MetadataRoute } from "next";

// Required for static export
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HALO Uspomene - Audio Guest Book za Venčanja",
    short_name: "HALO Uspomene",
    description:
      "Premium audio guest book servis za venčanja. Sačuvajte glasove najdražih zauvek.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F4DC",
    theme_color: "#AE343F",
    orientation: "portrait",
    icons: [
      {
        src: "/images/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["lifestyle", "entertainment"],
    lang: "sr",
  };
}
