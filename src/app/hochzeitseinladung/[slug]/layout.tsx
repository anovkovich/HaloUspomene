import { getWeddingData } from "@/data/pozivnice";
import EventPassedGuard from "@/app/pozivnica/[slug]/EventPassedGuard";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

// Mirrors /pozivnica/[slug]/layout.tsx — same EventPassedGuard wrapper so
// past-event behaviour is consistent across language variants.
export default async function HochzeitseinladungLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) return <>{children}</>;

  return (
    <EventPassedGuard eventDate={weddingData.event_date}>
      {children}
    </EventPassedGuard>
  );
}
