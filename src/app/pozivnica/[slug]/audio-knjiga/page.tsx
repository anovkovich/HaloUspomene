import { Metadata } from "next";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
import { notFound } from "next/navigation";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import { getAudioMessages } from "@/lib/audio";
import { getThemeCSSVariables } from "../constants";
import AudioKnjigaClient from "./AudioKnjigaClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);
  if (!weddingData) return {};
  const title = `${weddingData.couple_names.full_display} - Audio knjiga utisaka`;
  const description = `Ostavite audio poruku za ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllWeddingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function AudioKnjigaPage({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) notFound();

  const paidForAudio = weddingData.paid_for_audio ?? false;

  let recentMessages: { guestName: string; durationMs: number; createdAt: string }[] = [];
  if (paidForAudio) {
    try {
      const msgs = await getAudioMessages(slug);
      recentMessages = msgs.slice(-10).reverse().map((m) => ({
        guestName: m.guestName,
        durationMs: m.durationMs,
        createdAt: m.createdAt,
      }));
    } catch {
      // non-critical
    }
  }

  const cssVars = getThemeCSSVariables(
    weddingData.theme,
    weddingData.scriptFont
  );

  return (
    <div className="min-h-screen" style={cssVars as React.CSSProperties}>
      <AudioKnjigaClient
        slug={slug}
        coupleNames={weddingData.couple_names.full_display}
        paidForAudio={paidForAudio}
        eventDate={weddingData.event_date}
        useCyrillic={weddingData.useCyrillic ?? false}
        recentMessages={recentMessages}
      />
    </div>
  );
}
