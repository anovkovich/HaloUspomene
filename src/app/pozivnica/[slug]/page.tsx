import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import InvitationClient from "./InvitationClient";

// Allow slugs not in generateStaticParams (new couples added via admin)
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllWeddingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) return {};

  const title = `${weddingData.couple_names.full_display} - Pozivnica`;
  const description = `Website pozivnica za venčanje - ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function InvitationPage({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) notFound();

  return <InvitationClient data={weddingData} slug={slug} />;
}
