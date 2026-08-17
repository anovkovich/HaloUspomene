import { Metadata } from "next";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
import { notFound } from "next/navigation";
import { getWeddingData, getClassicWeddingSlugs } from "@/data/pozivnice";
import { getRSVPResponses } from "@/lib/rsvp";
import { getGuestList } from "@/lib/portal";
import { buildGuestGroups } from "@/lib/seating/guest-groups";
import { getThemeCSSVariables } from "../constants";
import WeddingRasporedRoot from "./WeddingRasporedRoot";


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
  const slugs = await getClassicWeddingSlugs(); return slugs.map((slug) => ({ slug }));
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

  // Celine iz Liste zvanica postaju dodatni filter u bočnoj traci. Ako par
  // nema listu (ili nijedna celina nema potvrđenog gosta) — prazno, pa se u
  // dropdownu ne pojavljuje ništa novo.
  let guestGroups: import("@/lib/seating/guest-groups").GuestGroupIndex = {
    groups: [],
    groupByGuestId: {},
  };
  try {
    guestGroups = buildGuestGroups(await getGuestList(slug), attending);
  } catch {
    // planer nije obavezan za raspored — tiho preskoči
  }

  const cssVars = getThemeCSSVariables(weddingData.theme, weddingData.scriptFont);

  const editorVars: React.CSSProperties = {
    ...(cssVars as React.CSSProperties),
    "--theme-text-light": "rgba(35, 35, 35, 0.78)",
    "--theme-text-muted": "rgba(35, 35, 35, 0.92)",
    "--theme-border-light": "rgba(35, 35, 35, 0.2)",
    "--theme-border": "rgba(35, 35, 35, 0.32)",
  } as React.CSSProperties;

  return (
    <div style={editorVars}>
      <WeddingRasporedRoot
        attending={attending}
        guestGroups={guestGroups.groups}
        guestGroupByGuestId={guestGroups.groupByGuestId}
        slug={slug}
        coupleNames={weddingData.couple_names.full_display}
        paidForRaspored={weddingData.paid_for_raspored ?? false}
        theme={weddingData.theme}
        scriptFont={weddingData.scriptFont}
        useCyrillic={weddingData.useCyrillic ?? false}
        brideName={weddingData.couple_names.bride}
        groomName={weddingData.couple_names.groom}
        panoCyrillic={weddingData.pano_cyrillic ?? false}
        panoScriptFont={weddingData.pano_script_font}
        panoBrideName={weddingData.pano_bride_name}
        panoGroomName={weddingData.pano_groom_name}
      />
    </div>
  );
}
