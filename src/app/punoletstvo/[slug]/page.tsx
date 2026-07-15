import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBirthdayData, getAllBirthdaySlugs } from "@/lib/birthday";
import PunoletstvoInvitationClient from "./PunoletstvoInvitationClient";
import InvitationFrame from "@/components/invitation/InvitationFrame";
import PreviewWatermark from "@/components/PreviewWatermark";

export const revalidate = 10;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllBirthdaySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBirthdayData(slug);
  if (!data) return {};

  const displayName =
    data.honoree_name && data.honoree_surname
      ? `${data.honoree_name} ${data.honoree_surname}`
      : data.child_name;
  const title = `${displayName} — 18. rođendan`;
  const description = data.tagline || `Pozivnica za punoletstvo — ${displayName}`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PunoletstvoInvitationPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBirthdayData(slug);

  if (!data) notFound();
  if (data.type !== "eighteenth") notFound();

  // Freemium (B3): a draft renders a watermarked, RSVP-locked preview.
  const isDraft = !!data.draft;

  return (
    <InvitationFrame>
      <PunoletstvoInvitationClient data={data} slug={slug} preview={isDraft} />
      {isDraft && (
        <PreviewWatermark payHref={`/placanje/punoletstvo/${slug}`} />
      )}
    </InvitationFrame>
  );
}
