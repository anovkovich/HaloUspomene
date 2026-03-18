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

  return (
    <EventPassedGuard eventDate={weddingData.event_date}>
      {children}
    </EventPassedGuard>
  );
}
