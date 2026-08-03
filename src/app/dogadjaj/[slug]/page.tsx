import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import type { EventInvitationView } from "@/lib/event-invitation-view";
import InvitationFrame from "@/components/invitation/InvitationFrame";
import AiCopyrightNotice from "@/components/invitation/AiCopyrightNotice";
import EventInvitationClient from "./EventInvitationClient";

export const revalidate = 10;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Every gate the public page needs, in one place.
 *
 *  Deliberately does NOT require `invitation`: payment is what grants the
 *  product, and the details are typed in by us afterwards. Requiring them here
 *  meant a company could pay for the Korporativni paket and land on a 404 —
 *  `unlock()` sets the paid flags directly and never touches `invitation`.
 *  Every field below is optional, so a freshly paid event renders a minimal but
 *  working invitation (name, date, potvrda dolaska) until we fill in the rest. */
async function loadInvitation(slug: string): Promise<EventInvitationView | null> {
  const s = await getStandaloneSeating(slug);
  if (!s || !s.active || !s.paid_for_invitation) return null;
  if (!s.eventDate) return null;

  const inv = s.invitation ?? {};
  return {
    title: s.eventName,
    subtitle: undefined,
    date: s.eventDate,
    time: s.eventTime,
    location: inv.location
      ? {
          name: inv.location.name,
          address: inv.location.address,
          mapUrl: inv.location.map_url,
        }
      : undefined,
    agenda: inv.agenda?.filter((a) => a.time || a.title),
    dressCode: inv.dressCode,
    tagline: inv.tagline,
    theme: inv.theme ?? "executive_navy",
    rsvp: { slug, kind: "standalone", submitUntil: inv.submitUntil },
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const view = await loadInvitation(slug);
  if (!view) return { robots: { index: false, follow: false } };

  const title = view.title;
  const description = view.tagline || `Pozivnica — ${view.title}`;

  return {
    title,
    description,
    // Per-customer page: never indexed.
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function EventInvitationPage({ params }: PageProps) {
  const { slug } = await params;
  const view = await loadInvitation(slug);
  if (!view) notFound();

  return (
    <InvitationFrame>
      <EventInvitationClient view={view} />
      <AiCopyrightNotice />
    </InvitationFrame>
  );
}
