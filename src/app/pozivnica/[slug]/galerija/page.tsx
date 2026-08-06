import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWeddingData } from "@/data/pozivnice";
import { getGalleryPhotos } from "@/lib/gallery";
import { guestGate } from "@/lib/gallery-lifecycle";
import { galleryKeyMatches } from "@/lib/gallery-key";
import { getThemeCSSVariables } from "../constants";
import GalerijaClient from "./GalerijaClient";

export const dynamicParams = true;
export const revalidate = 30;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ k?: string }>;
}

// Public view stacks photos by uploader, so we load all metadata up front and
// group client-side; only the stack covers actually render images (lazy).
const PUBLIC_LOAD_CAP = 2000;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);
  if (!weddingData) return {};
  const title = `${weddingData.couple_names.full_display} — Galerija`;
  const description = `Podelite vaše fotografije sa venčanja — ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
  };
}

export default async function GalerijaPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { k } = await searchParams;
  const weddingData = await getWeddingData(slug);

  // Every dead end — unknown slug, gallery never bought, window over — renders
  // ./not-found.tsx: a real 404 status (no soft-404) carrying our own offer,
  // because a QR printed on a table keeps getting scanned for years.
  if (!weddingData) notFound();
  if (!weddingData.paid_for_gallery) notFound();

  const hasKey = galleryKeyMatches(weddingData.gallery_key, k);
  const gate = guestGate(weddingData.event_date, hasKey);
  if (gate === "closed") notFound();

  const cssVars = getThemeCSSVariables(weddingData.theme, weddingData.scriptFont);

  let initialPhotos: Awaited<ReturnType<typeof getGalleryPhotos>> = [];
  if (gate === "open") {
    try {
      initialPhotos = await getGalleryPhotos(slug, { limit: PUBLIC_LOAD_CAP });
    } catch {
      initialPhotos = [];
    }
  }

  return (
    <div className="min-h-screen" style={cssVars as React.CSSProperties}>
      <GalerijaClient
        slug={slug}
        coupleNames={weddingData.couple_names.full_display}
        useCyrillic={weddingData.useCyrillic ?? false}
        phase={gate === "open" ? "upload" : "before"}
        eventDate={weddingData.event_date}
        galleryKey={hasKey ? k : undefined}
        initialPhotos={initialPhotos}
      />
    </div>
  );
}
