import { getWeddingData } from "@/data/pozivnice";
import EventPassedGuard from "./EventPassedGuard";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function PozivnicaLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  // Invalid slug → let the page handle the 404
  if (!weddingData) return <>{children}</>;

  // Draft handling lives on /pozivnica/[slug]/page.tsx itself so only the
  // public invitation 404s while management sub-routes (raspored-sedenja,
  // gde-sedim, prijava, ...) stay reachable for draft couples who have
  // paid for raspored but not a full invitation.

  return (
    <EventPassedGuard eventDate={weddingData.event_date}>
      {children}
    </EventPassedGuard>
  );
}
