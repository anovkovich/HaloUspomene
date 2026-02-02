import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import InvitationClient from "./InvitationClient";

const BASE_URL = "https://anovkovich.github.io/HaloUspomene";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all known wedding slugs
export async function generateStaticParams() {
  const slugs = getAllWeddingSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata with OG image for social sharing
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = getWeddingData(slug);

  if (!weddingData) {
    return {};
  }

  const title = `${weddingData.couple_names.full_display} - Pozivnica`;
  const description = `Digitalna pozivnica za venčanje - ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `${BASE_URL}/gallery/digitalna-pozivnica.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/gallery/digitalna-pozivnica.png`],
    },
  };
}

export default async function InvitationPage({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = getWeddingData(slug);

  if (!weddingData) {
    notFound();
  }

  return <InvitationClient data={weddingData} />;
}
