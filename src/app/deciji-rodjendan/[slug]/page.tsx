import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBirthdayData, getAllBirthdaySlugs } from "@/data/rodjendani";
import BirthdayClient from "./BirthdayClient";

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
  if (data.draft && process.env.NODE_ENV === "production") notFound();

  return <BirthdayClient data={data} slug={slug} />;
}
