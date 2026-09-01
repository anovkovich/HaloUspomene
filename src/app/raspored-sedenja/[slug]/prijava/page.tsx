import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import PrijavaClient from "./PrijavaClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prijava — Raspored sedenja | HALO Uspomene",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ next?: string }>;
}

export default async function PrijavaPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { next = `/raspored-sedenja/${slug}` } = await searchParams;
  const data = await getStandaloneSeating(slug);

  if (!data || !data.active) notFound();

  return (
    <PrijavaClient
      slug={slug}
      nextUrl={next}
      eventName={data.eventName}
    />
  );
}
