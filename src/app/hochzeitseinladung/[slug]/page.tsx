import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWeddingData } from "@/data/pozivnice";
import InvitationClient from "@/app/pozivnica/[slug]/InvitationClient";

// Couples opt in via the `german_enabled: true` flag in MongoDB. Slugs are
// not pre-rendered here — they're a tiny opt-in subset of the classic
// invitation slugs and Next.js can build them on demand.
export const dynamicParams = true;
export const revalidate = 10;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getWeddingData(slug);

  if (!data || data.premium || !data.german_enabled) return {};

  const title = `${data.couple_names.full_display} — Hochzeitseinladung`;
  const description = `Online-Hochzeitseinladung — ${data.couple_names.bride} & ${data.couple_names.groom}`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website", locale: "de_DE" },
    twitter: { card: "summary_large_image", title, description },
    alternates: {
      languages: {
        "sr-Latn": `/pozivnica/${slug}/`,
      },
    },
  };
}

export default async function HochzeitseinladungPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getWeddingData(slug);

  if (!data) notFound();
  // Premium invitations live on /premium-pozivnica/, not here.
  if (data.premium) notFound();
  // Hard gate — only opted-in couples are reachable on the German URL.
  if (!data.german_enabled) notFound();
  if (data.draft && process.env.NODE_ENV === "production") notFound();

  return <InvitationClient data={data} slug={slug} lang="de" />;
}
