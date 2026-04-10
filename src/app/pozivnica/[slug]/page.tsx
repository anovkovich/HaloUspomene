import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWeddingData, getClassicWeddingSlugs } from "@/data/pozivnice";
import InvitationClient from "./InvitationClient";

// Allow slugs not in generateStaticParams (new couples added via admin)
export const dynamicParams = true;

// Revalidate from DB every 10 seconds (picks up admin changes quickly)
export const revalidate = 10;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getClassicWeddingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData || weddingData.premium) return {};

  const title = `${weddingData.couple_names.full_display} - Pozivnica`;
  const description = `Website pozivnica za venčanje - ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function InvitationPage({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) notFound();
  // Premium invitations live at /premium-pozivnica/[slug] only — don't leak
  // premium couples through the classic template if someone guesses the slug.
  if (weddingData.premium) notFound();
  if (weddingData.draft && process.env.NODE_ENV === "production") notFound();

  return <InvitationClient data={weddingData} slug={slug} />;
}
