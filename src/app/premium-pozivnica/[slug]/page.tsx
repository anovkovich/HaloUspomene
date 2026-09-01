import { notFound } from "next/navigation";
import { getWeddingData, getPremiumWeddingSlugs } from "@/lib/couples";
import type { Metadata } from "next";
import PremiumInvitationClient from "./PremiumInvitationClient";
import InvitationFrame from "@/components/invitation/InvitationFrame";
import AiCopyrightNotice from "@/components/invitation/AiCopyrightNotice";
import PreviewWatermark from "@/components/PreviewWatermark";
import { builderPayHref } from "@/lib/payments/builder-pricing";
import { issuePromo } from "@/lib/payments/promo";

export const revalidate = 10;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getPremiumWeddingSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getWeddingData(slug);
  if (!data?.premium) return {};

  const { full_display } = data.couple_names;
  const title = `${full_display} — Premium Pozivnica`;
  const description = `Halo Uspomene pozivnica za venčanje — sve na jednom mestu!`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://halouspomene.rs/premium-pozivnica/${slug}`,
      siteName: "HaloUspomene",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: false, follow: false },
  };
}

export default async function PremiumInvitationPage({ params }: Props) {
  const { slug } = await params;
  const data = await getWeddingData(slug);

  if (!data?.premium) notFound();

  // Freemium (B3): a draft premium invitation renders a watermarked, RSVP-locked
  // PREVIEW (guest-write server gates already reject drafts) instead of 404.
  const isDraft = !!data.draft;
  const payHref = builderPayHref(slug, data.builder_extras);
  // Guest-referral promo — same as classic; shown on the RSVP success screen.
  const promo = issuePromo(data.event_date, slug);

  return (
    <InvitationFrame>
      {isDraft && <PreviewWatermark payHref={payHref} />}
      <AiCopyrightNotice />

      <PremiumInvitationClient
        data={data}
        slug={slug}
        preview={isDraft}
        payHref={payHref}
        promoCode={promo?.code}
        promoValidUntil={promo?.validUntil}
      />
    </InvitationFrame>
  );
}
