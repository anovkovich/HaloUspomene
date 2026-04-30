import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import StandaloneRasporedRoot from "./StandaloneRasporedRoot";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStandaloneSeating(slug);
  if (!data) return { title: "Raspored sedenja", robots: { index: false } };
  return {
    title: `${data.eventName} — Raspored sedenja | HALO Uspomene`,
    robots: { index: false, follow: false },
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StandaloneSeatingPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getStandaloneSeating(slug);

  if (!data || !data.active) notFound();

  return (
    <StandaloneRasporedRoot
      slug={slug}
      eventName={data.eventName}
      ownerName={data.ownerName}
      ownerPhone={data.ownerPhone}
      ownerEmail={data.ownerEmail}
      guests={data.guests}
    />
  );
}
