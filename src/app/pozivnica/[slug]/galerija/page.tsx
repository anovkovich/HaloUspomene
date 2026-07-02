import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWeddingData } from "@/data/pozivnice";
import { getGalleryPhotos } from "@/lib/gallery";
import { galleryPhase } from "@/lib/gallery-lifecycle";
import { getThemeCSSVariables } from "../constants";
import GalerijaClient from "./GalerijaClient";

export const dynamicParams = true;
export const revalidate = 30;

interface PageProps {
  params: Promise<{ slug: string }>;
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

export default async function GalerijaPage({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) notFound();
  if (!weddingData.paid_for_gallery) notFound();

  const cssVars = getThemeCSSVariables(weddingData.theme, weddingData.scriptFont);
  const phase = galleryPhase(weddingData.event_date, weddingData.gallery_extra_days ?? 0);

  let initialPhotos: Awaited<ReturnType<typeof getGalleryPhotos>> = [];
  // Photos are gone once purged; before the event there are none yet.
  if (phase !== "expired" && phase !== "before") {
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
        phase={phase}
        initialPhotos={initialPhotos}
      />
    </div>
  );
}
