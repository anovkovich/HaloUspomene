import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWeddingData } from "@/lib/couples";
import { getBirthdayData } from "@/lib/birthday";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import RsvpClient from "./RsvpClient";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

const TYPES = ["pozivnica", "rodjendan", "punoletstvo", "dogadjaj"] as const;
type RsvpType = (typeof TYPES)[number];

function parseId(id: string): { type: RsvpType; slug: string } | null {
  for (const t of TYPES) {
    const prefix = `${t}-`;
    if (id.startsWith(prefix)) {
      const slug = id.slice(prefix.length);
      if (slug) return { type: t, slug };
    }
  }
  return null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Potvrda dolaska — Halo Uspomene",
    description: "Potvrdite svoj dolazak skeniranjem QR koda sa pozivnice.",
    robots: { index: false, follow: false },
  };
}

export default async function RsvpPage({ params }: PageProps) {
  const { id } = await params;
  const parsed = parseId(id);
  if (!parsed) notFound();
  const { type, slug } = parsed;

  if (type === "pozivnica") {
    const data = await getWeddingData(slug);
    if (!data) notFound();
    if (data.draft && process.env.NODE_ENV === "production") notFound();

    const subtitle = data.useCyrillic ? "Венчање" : "Venčanje";

    return (
      <RsvpClient
        kind={data.premium ? "premium" : "classic"}
        slug={slug}
        title={data.couple_names.full_display}
        subtitle={subtitle}
        eventDate={data.event_date}
        submitUntil={data.submit_until}
        theme={data.theme}
        scriptFont={data.scriptFont ?? "great-vibes"}
        useCyrillic={data.useCyrillic ?? false}
      />
    );
  }

  if (type === "dogadjaj") {
    const seating = await getStandaloneSeating(slug);
    if (!seating || !seating.active) notFound();

    return (
      <RsvpClient
        kind="standalone"
        slug={slug}
        title={seating.eventName}
        subtitle="Događaj"
        eventDate={seating.eventDate ?? ""}
        submitUntil=""
      />
    );
  }

  // rodjendan & punoletstvo both live in the birthday data layer
  const data = await getBirthdayData(slug);
  if (!data) notFound();
  if (data.draft && process.env.NODE_ENV === "production") notFound();
  if (type === "punoletstvo" && data.type !== "eighteenth") notFound();

  const isEighteenth = data.type === "eighteenth";
  const title =
    isEighteenth && data.honoree_name && data.honoree_surname
      ? `${data.honoree_name} ${data.honoree_surname}`
      : data.child_name;
  const subtitle = isEighteenth ? "18. rođendan" : `${data.age}. rođendan`;

  return (
    <RsvpClient
      kind="birthday"
      slug={slug}
      title={title}
      subtitle={subtitle}
      eventDate={data.event_date}
      submitUntil={data.submit_until}
      gender={data.gender}
    />
  );
}
