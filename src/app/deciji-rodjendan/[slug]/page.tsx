import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBirthdayData, getAllBirthdaySlugs } from "@/data/rodjendani";
import BirthdayClient from "./BirthdayClient";
import InvitationFrame from "@/components/invitation/InvitationFrame";
import AiCopyrightNotice from "@/components/invitation/AiCopyrightNotice";
import PreviewWatermark from "@/components/PreviewWatermark";
import { issuePromo } from "@/lib/payments/promo";

export const revalidate = 60;
// Allow slugs not in generateStaticParams (new events added via admin)
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

  const title = `${data.child_name} slavi ${data.age}. rođendan!`;
  const description = `Pozivnica za ${data.age}. rođendan - ${data.child_name}`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BirthdayInvitationPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBirthdayData(slug);

  if (!data) notFound();

  // Freemium (B3): a draft renders a watermarked, RSVP-locked preview.
  const isDraft = !!data.draft;
  // Demo primeri (`example`) ne dele promo kod — v. isti izuzetak u
  // /pozivnica/[slug]/page.tsx.
  const promo = data.example ? null : issuePromo(data.event_date, slug);

  return (
    <InvitationFrame>
      <BirthdayClient
        data={data}
        slug={slug}
        preview={isDraft}
        promoCode={promo?.code}
        promoValidUntil={promo?.validUntil}
      />
      {isDraft && (
        <PreviewWatermark payHref={`/placanje/rodjendan/${slug}`} />
      )}
      <AiCopyrightNotice />
    </InvitationFrame>
  );
}
