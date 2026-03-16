import { notFound } from "next/navigation";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import { getRSVPResponses } from "@/lib/google-sheets";
import { getThemeCSSVariables } from "../constants";
import PotvrdeGate from "../potvrde/PotvrdeGate";
import RasporedClient from "./RasporedClient";

interface PageProps {
  params: Promise<{ slug: string }>;
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
