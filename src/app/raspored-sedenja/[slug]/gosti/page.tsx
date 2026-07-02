import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import GuestsClient from "./GuestsClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStandaloneSeating(slug);
  if (!data) return { title: "Lista gostiju", robots: { index: false } };
  return {
    title: `${data.eventName} — Lista gostiju | HALO Uspomene`,
    robots: { index: false, follow: false },
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GuestsPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getStandaloneSeating(slug);
  if (!data || !data.active) notFound();

  return (
    <GuestsClient
      slug={slug}
      eventName={data.eventName}
      initialGuests={data.guests}
    />
  );
}
