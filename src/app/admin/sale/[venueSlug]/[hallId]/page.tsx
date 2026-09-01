import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHallVenue } from "@/lib/hall-venues";
import HallTemplateEditorRoot from "./HallTemplateEditorRoot";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Šema sale",
  robots: { index: false, follow: false },
};

export default async function HallTemplateEditorPage({
  params,
}: {
  params: Promise<{ venueSlug: string; hallId: string }>;
}) {
  const { venueSlug, hallId } = await params;
  const venue = await getHallVenue(venueSlug);
  if (!venue) notFound();

  const hall = venue.halls.find((h) => h.id === hallId);
  if (!hall) notFound();

  return (
    <HallTemplateEditorRoot
      venueSlug={venueSlug}
      hallId={hallId}
      venueName={venue.name}
      city={venue.city}
      hallName={hall.name}
    />
  );
}
