import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import { getRSVPResponses } from "@/lib/google-sheets";
import { getThemeCSSVariables } from "../constants";
import PotvrdeGate from "../potvrde/PotvrdeGate";
import RasporedClient from "./RasporedClient";

const BASE_URL = "https://halouspomene.rs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = getWeddingData(slug);
  if (!weddingData) return {};
  const title = `${weddingData.couple_names.full_display} - Raspored sedenja`;
  const description = `Raspored sedenja za venčanje - ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `${BASE_URL}/images/gallery/website-pozivnica.png`, width: 1200, height: 630, alt: title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/images/gallery/website-pozivnica.png`],
    },
  };
}

export async function generateStaticParams() {
  return getAllWeddingSlugs().map((slug) => ({ slug }));
}

export default async function RasporedSedenja({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = getWeddingData(slug);

  if (!weddingData) notFound();

  let responses: import("@/lib/google-sheets").RSVPEntry[] = [];

  if (weddingData.responses_spreadsheet_id) {
    try {
      responses = await getRSVPResponses(weddingData.responses_spreadsheet_id);
    } catch {
      // silently fail
    }
  }

  const attending = responses.filter((r) => r.attending === "Da");
  const cssVars = getThemeCSSVariables(weddingData.theme, weddingData.scriptFont);

  const pageContent = (
    <div style={cssVars as React.CSSProperties}>
      <RasporedClient
        attending={attending}
        slug={slug}
        coupleNames={weddingData.couple_names.full_display}
        spreadsheetId={weddingData.responses_spreadsheet_id}
        paidForRaspored={weddingData.paid_for_raspored ?? false}
      />
    </div>
  );

  if (!weddingData.potvrde_password) return pageContent;

  return (
    <PotvrdeGate
      password={weddingData.potvrde_password}
      slug={slug}
      coupleNames={weddingData.couple_names.full_display}
      cssVars={cssVars}
    >
      {pageContent}
    </PotvrdeGate>
  );
}
