import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBirthdayData } from "@/lib/birthday";
import { getGalleryUploaderStacks } from "@/lib/gallery";
import { guestGate } from "@/lib/gallery-lifecycle";
import { getBirthdayThemeCSSVariables } from "../constants";
import GalerijaClient from "@/app/pozivnica/[slug]/galerija/GalerijaClient";

export const dynamicParams = true;
export const revalidate = 30;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Guest-facing QR gallery for both birthday products — punoletstvo links here
 * too, since `birthday_events` is shared and slugs are unique across it.
 *
 * Unlike the wedding gallery there is no `gallery_key` forwarded-link feature,
 * so the window is simply the event day (+1) — `guestGate` with no key.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBirthdayData(slug);
  if (!b) return {};
  const name =
    b.type === "eighteenth"
      ? [b.honoree_name, b.honoree_surname].filter(Boolean).join(" ") ||
        b.child_name
      : b.child_name;
  const title = `${name} — Galerija`;
  const description = `Podelite vaše fotografije sa proslave — ${name}`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
  };
}

export default async function BirthdayGalerijaPage({ params }: PageProps) {
  const { slug } = await params;
  const b = await getBirthdayData(slug);

  // Every dead end renders ./not-found.tsx with a real 404 status — a QR code
  // printed on a table keeps getting scanned for years after the party.
  if (!b) notFound();
  if (b.draft || !b.paid_for_gallery) notFound();

  const gate = guestGate(b.event_date, false);
  if (gate === "closed") notFound();

  const name =
    b.type === "eighteenth"
      ? [b.honoree_name, b.honoree_surname].filter(Boolean).join(" ") ||
        b.child_name
      : b.child_name;

  const cssVars = getBirthdayThemeCSSVariables(b.theme, b.displayFont);

  let initialStacks: Awaited<ReturnType<typeof getGalleryUploaderStacks>> = [];
  if (gate === "open") {
    try {
      initialStacks = await getGalleryUploaderStacks(slug);
    } catch {
      initialStacks = [];
    }
  }

  return (
    <div className="min-h-screen" style={cssVars as React.CSSProperties}>
      <GalerijaClient
        slug={slug}
        coupleNames={name}
        useCyrillic={false}
        phase={gate === "open" ? "upload" : "before"}
        eventDate={b.event_date}
        initialStacks={initialStacks}
        initialPhotos={[]}
        apiBase={`/api/deciji-rodjendan/${slug}`}
      />
    </div>
  );
}
