import { getWeddingData } from "@/lib/couples";
import { notFound } from "next/navigation";

export default async function PremiumInvitationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getWeddingData(slug);

  if (!data?.premium) notFound();

  // Check if event has passed (similar to EventPassedGuard for classic)
  if (data.event_date) {
    const eventDate = new Date(data.event_date);
    const now = new Date();
    const dayAfterEvent = new Date(eventDate);
    dayAfterEvent.setDate(dayAfterEvent.getDate() + 7); // Grace period of 7 days
    if (now > dayAfterEvent) {
      return (
        <div className="min-h-screen bg-[#fffdf5] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-serif text-[#d4af37] mb-4">
              Venčanje je prošlo
            </h1>
            <p className="text-[#8B7355]">
              Ova pozivnica više nije aktivna. Hvala na interesovanju!
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
