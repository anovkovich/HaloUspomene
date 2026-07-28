import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import { loadPortalData } from "@/lib/portal";
import { loadSeatingLayout } from "@/lib/seating";
import PortalClient from "./PortalClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStandaloneSeating(slug);
  return {
    title: data ? `${data.eventName} — Portal` : "Portal",
    robots: { index: false, follow: false },
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StandalonePortalPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getStandaloneSeating(slug);
  if (!data) notFound();

  const portal = await loadPortalData(slug);

  // Seating fill stats (mirrors the admin list computation).
  let seatingStats: { totalSeats: number; assignedSeats: number } | null = null;
  try {
    const tables = await loadSeatingLayout(slug);
    if (tables) {
      let totalSeats = 0;
      let assignedSeats = 0;
      for (const t of tables) {
        if (t.type === "decoration") continue;
        totalSeats += t.seats;
        assignedSeats += t.assignments.filter(Boolean).length;
      }
      seatingStats = { totalSeats, assignedSeats };
    }
  } catch {
    seatingStats = null;
  }

  const guestCount = data.guests.reduce((s, g) => s + g.guestCount, 0);

  return (
    <PortalClient
      slug={slug}
      eventName={data.eventName}
      eventDate={data.eventDate}
      guestCount={guestCount}
      seatingStats={seatingStats}
      hasAudio={!!(data.paid_for_audio && data.eventDate)}
      hasGallery={!!(data.paid_for_gallery && data.eventDate)}
      initialChecklist={portal.checklist}
      initialBudget={portal.budget}
    />
  );
}
