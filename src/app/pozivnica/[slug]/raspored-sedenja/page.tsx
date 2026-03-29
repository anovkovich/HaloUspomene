import { Metadata } from "next";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
import { notFound } from "next/navigation";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import { getRSVPResponses } from "@/lib/rsvp";
import { getThemeCSSVariables } from "../constants";
import RasporedClient from "./RasporedClient";


interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);
  if (!weddingData) return {};
  const title = `${weddingData.couple_names.full_display} - Raspored sedenja`;
  const description = `Raspored sedenja za venčanje - ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllWeddingSlugs(); return slugs.map((slug) => ({ slug }));
}

export default async function RasporedSedenja({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) notFound();

  let responses: import("@/lib/rsvp").RSVPEntry[] = [];

  try {
    responses = await getRSVPResponses(slug);
  } catch {
    // silently fail
  }

  const attending = responses.filter((r) => r.attending === "Da");
  const cssVars = getThemeCSSVariables(weddingData.theme, weddingData.scriptFont);

  return (
    <div style={cssVars as React.CSSProperties}>
      <RasporedClient
        attending={attending}
        slug={slug}
        coupleNames={weddingData.couple_names.full_display}
        paidForRaspored={weddingData.paid_for_raspored ?? false}
      />
    </div>
  );
}
