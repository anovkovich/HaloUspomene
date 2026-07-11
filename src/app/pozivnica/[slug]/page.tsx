import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWeddingData, getClassicWeddingSlugs } from "@/data/pozivnice";
import InvitationClient from "./InvitationClient";
import PreviewWatermark from "@/components/PreviewWatermark";
import BackgroundMusicPlayer from "@/components/BackgroundMusicPlayer";

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
    // When the couple opted into a German variant, point search engines to it.
    alternates: weddingData.german_enabled
      ? {
          languages: {
            "de-DE": `/hochzeitseinladung/${slug}/`,
          },
        }
      : undefined,
  };
}

export default async function InvitationPage({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) notFound();
  // Premium invitations live at /premium-pozivnica/[slug] only — don't leak
  // premium couples through the classic template if someone guesses the slug.
  if (weddingData.premium) notFound();

  // Freemium (B3): a draft used to 404 in production. Now it renders a
  // watermarked, RSVP-locked PREVIEW so the couple can see their built
  // invitation and pay to publish. The guest-write server gates
  // (RSVP/audio `draft → 403`) are the real wall — this render is safe only
  // because those ship in the same deploy. Metadata already sets
  // robots:{ index:false } for every couple, so drafts stay unindexed.
  const isDraft = !!weddingData.draft;

  return (
    <>
      <InvitationClient data={weddingData} slug={slug} preview={isDraft} />
      {isDraft && (
        <PreviewWatermark payHref={`/placanje/pozivnica/${slug}`} />
      )}
      {weddingData.paid_for_music && weddingData.music_url && (
        <BackgroundMusicPlayer src={weddingData.music_url} />
      )}
    </>
  );
}
