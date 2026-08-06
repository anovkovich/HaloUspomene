import { MetadataRoute } from "next";

// Required for static export
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/moje-vencanje",
    name: "Moje Venčanje — Planer | HALO Uspomene",
    short_name: "Moje Venčanje",
    description:
      "Planer za organizaciju venčanja — checklista, budžet i praćenje priprema na jednom mestu.",
    start_url: "/moje-vencanje",
    scope: "/",
    display: "standalone",
    background_color: "#F5F4DC",
    theme_color: "#AE343F",
    orientation: "portrait",
    // `any` i `maskable` su DVA razlicita crteza, ne isti fajl sa dve oznake.
    // Maskable garantuje samo krug precnika 80% platna, pa znak u njemu mora
    // biti manji (v. SAFE_MASKA u `scripts/generate-favicon.mjs`); ranije je
    // 192px ikonica bila oznacena kao maskable a nije imala bezbednu zonu, pa
    // ju je Android secao po ivicama.
    icons: [
      {
        src: "/images/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["lifestyle", "entertainment"],
    lang: "sr",
  };
}
