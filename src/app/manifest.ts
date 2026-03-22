import { MetadataRoute } from "next";

// Required for static export
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Moje Venčanje — Planer | HALO Uspomene",
    short_name: "Moje Venčanje",
    description:
      "Planer za organizaciju venčanja — checklista, budžet i praćenje priprema na jednom mestu.",
    start_url: "/moje-vencanje",
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
