import { notFound } from "next/navigation";
import { getWeddingData } from "@/lib/couples";
import type { Metadata } from "next";
import PremiumInvitationClient from "./PremiumInvitationClient";
import PremiumLockedScreen from "./PremiumLockedScreen";

export const revalidate = 10;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getWeddingData(slug);
  if (!data?.premium) return {};

  const { bride, groom, full_display } = data.couple_names;
  return {
    title: `${full_display} — Premium Pozivnica`,
    description: `Premium AI pozivnica za venčanje — ${bride} i ${groom}`,
    robots: { index: false, follow: false },
  };
}

export default async function PremiumInvitationPage({ params }: Props) {
  const { slug } = await params;
  const data = await getWeddingData(slug);

  if (!data?.premium) notFound();

  // Check 2-minute preview window
  if (data.premium_created_at && !data.premium_paid) {
    const createdAt = new Date(data.premium_created_at).getTime();
    const minutesSinceCreation = (Date.now() - createdAt) / 60000;

    if (minutesSinceCreation > 2) {
      return <PremiumLockedScreen slug={slug} data={data} />;
    }
  }

  return <PremiumInvitationClient data={data} slug={slug} />;
}
