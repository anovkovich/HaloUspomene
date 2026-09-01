import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWeddingData } from "@/data/pozivnice";
import { getGalleryUploaderStacks } from "@/lib/gallery";
import { guestGate } from "@/lib/gallery-lifecycle";
import { galleryKeyMatches } from "@/lib/gallery-key";
import { getThemeCSSVariables } from "../constants";
import GalerijaClient from "./GalerijaClient";
import { coupleDisplayName } from "@/lib/couple-display-name";

export const dynamicParams = true;
export const revalidate = 30;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ k?: string }>;
}

// The public view only draws one pile per guest, so the grouping happens in
// Mongo (`getGalleryUploaderStacks`) — the payload scales with guests, not with
// photos, and no per-photo cap is needed any more.

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);
  if (!weddingData) return {};
  const title = `${weddingData.couple_names.full_display} — Galerija`;
  // Gallery-only clients have an empty `groom`, so this must not interpolate
  // the two fields blindly — the title above already uses full_display.
  const description = `Podelite vaše fotografije sa venčanja — ${coupleDisplayName(weddingData.couple_names)}`;
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

  let initialStacks: Awaited<ReturnType<typeof getGalleryUploaderStacks>> = [];
  if (gate === "open") {
    try {
      initialStacks = await getGalleryUploaderStacks(slug);
    } catch {
      initialStacks = [];
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
        initialStacks={initialStacks}
        initialPhotos={[]}
      />
    </div>
  );
}
