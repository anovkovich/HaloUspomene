import { Metadata } from "next";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
import { notFound } from "next/navigation";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import { getAudioMessages } from "@/lib/audio";
import { getThemeCSSVariables } from "../../constants";
import SlusajClient from "./SlusajClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);
  if (!weddingData) return {};
  const title = `${weddingData.couple_names.full_display} - Audio poruke`;
  const description = `Audio poruke gostiju za venčanje - ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;
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

export default async function SlusajPage({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) notFound();

  const paidForAudio = weddingData.paid_for_audio ?? false;

  let messages: import("@/lib/audio").AudioMessage[] = [];
  let fetchError = false;

  if (paidForAudio) {
    try {
      messages = await getAudioMessages(slug);
    } catch {
      fetchError = true;
    }
  }

  const cssVars = getThemeCSSVariables(
    weddingData.theme,
    weddingData.scriptFont
  );

  return (
    <div className="min-h-screen" style={cssVars as React.CSSProperties}>
      <SlusajClient
        messages={messages}
        fetchError={fetchError}
        slug={slug}
        coupleNames={weddingData.couple_names.full_display}
        useCyrillic={weddingData.useCyrillic ?? false}
        paidForAudio={paidForAudio}
      />
    </div>
  );
}
