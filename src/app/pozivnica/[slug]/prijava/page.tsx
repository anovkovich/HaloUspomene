import { notFound } from "next/navigation";
import { getWeddingData } from "@/data/pozivnice";
import { getThemeCSSVariables } from "../constants";
import PrijavaClient from "./PrijavaClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ next?: string }>;
}

export default async function PrijavaPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { next = `/pozivnica/${slug}/potvrde` } = await searchParams;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) notFound();

  const cssVars = getThemeCSSVariables(weddingData.theme, weddingData.scriptFont);

  return (
    <PrijavaClient
      slug={slug}
      nextUrl={next}
      coupleNames={weddingData.couple_names.full_display}
      cssVars={cssVars}
      requiresPassword={!!weddingData.potvrde_password}
    />
  );
}
