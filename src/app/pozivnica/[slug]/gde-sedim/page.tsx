import { Metadata } from "next";
export const dynamicParams = true;
export const revalidate = 60;
import { notFound } from "next/navigation";
import {
  getWeddingData,
  getClassicWeddingSlugs,
  getPremiumWeddingSlugs,
} from "@/data/pozivnice";
import { loadSeatingLayout } from "@/lib/seating";
import { buildGuestLookup } from "@/lib/seating/lookup";
import { getRSVPResponses } from "@/lib/rsvp";
import { getGalleryUploaderStacks } from "@/lib/gallery";
import { getAudioMessages } from "@/lib/audio";
import { galleryPhase } from "@/lib/gallery-lifecycle";
import { getThemeCSSVariables } from "../constants";
import type { TableData } from "@/lib/seating";
import GuestHubClient from "./GuestHubClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// BA/HR/ME couples (phone_country != RS, or phone prefix in +387/+385/+382)
// get the ijekavica variant — same detection as the main invitation page.
function inferUseIjekavica(data: {
  useCyrillic?: boolean;
  phone_country?: "RS" | "BA" | "HR" | "ME" | "MK" | "SI" | "INT";
  contact_phone?: string;
}): boolean {
  if (data.useCyrillic) return false;
  // Only BA/HR/ME use ijekavica; RS/MK/SI/INT stay ekavica. Fall back to the
  // phone prefix for legacy records with no phone_country.
  if (data.phone_country)
    return (
      data.phone_country === "BA" ||
      data.phone_country === "HR" ||
      data.phone_country === "ME"
    );
  const primaryPhone = (data.contact_phone || "").split(",")[0]?.trim() ?? "";
  return /^\+(387|385|382)/.test(primaryPhone);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);
  if (!weddingData) return {};
  const ijekavica = inferUseIjekavica(weddingData);
  const title = `${weddingData.couple_names.full_display} - ${ijekavica ? "Gdje sjedim?" : "Gde sedim?"}`;
  const description = ijekavica
    ? `Pronađite svoje mjesto sjedenja za vjenčanje - ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`
    : `Pronađite svoje mesto sedenja za venčanje - ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function generateStaticParams() {
  // Premium couples use this same /pozivnica/{slug}/gde-sedim/ URL for their
  // seating-lookup, so both sets of slugs must be pre-rendered here.
  const [classic, premium] = await Promise.all([
    getClassicWeddingSlugs(),
    getPremiumWeddingSlugs(),
  ]);
  return [...classic, ...premium].map((slug) => ({ slug }));
}

// Canonical shapes live in @/lib/seating/lookup (shared with the birthday and
// standalone lookup pages); re-exported here for existing importers.
export type {
  GuestTableEntry,
  GuestLookupEntry,
} from "@/lib/seating/lookup";

export default async function GdeSedimPage({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) notFound();

  const hasSeating = !!weddingData.paid_for_raspored;
  const hasGallery = !!weddingData.paid_for_gallery;
  const hasAudio = !!weddingData.paid_for_audio;
  // The hub lives at the welcome-pano QR URL; show it if the couple enabled at
  // least one tabbed feature (seating, gallery, menu, and/or audio).
  if (!hasSeating && !hasGallery && !hasAudio && !weddingData.meni) notFound();

  const cssVars = getThemeCSSVariables(weddingData.theme, weddingData.scriptFont);
  const ijekavica = inferUseIjekavica(weddingData);

  // ── Load seating data from MongoDB ──────────────────────────────────────
  let tables: TableData[] = [];
  if (hasSeating) {
    try {
      const loaded = await loadSeatingLayout(slug);
      if (loaded) tables = loaded;
    } catch {
      tables = [];
    }
  }

  // ── Build guest lookup ───────────────────────────────────────────────────
  // The RSVP roster supplies the party ("zvanica") holder names, so a guest who
  // searches any member of a family sees the whole party's arrangement.
  let parties: { id: string; name: string }[] = [];
  if (hasSeating) {
    try {
      parties = (await getRSVPResponses(slug)).map((r) => ({
        id: r.id,
        name: r.name,
      }));
    } catch {
      parties = [];
    }
  }
  const guestLookup = buildGuestLookup(tables, parties);

  // ── Gallery ──────────────────────────────────────────────────────────────
  const phase = galleryPhase(
    weddingData.event_date,
    weddingData.gallery_extra_days ?? 0,
  );
  let galleryStacks: Awaited<ReturnType<typeof getGalleryUploaderStacks>> = [];
  if (hasGallery && phase !== "expired" && phase !== "before") {
    try {
      galleryStacks = await getGalleryUploaderStacks(slug);
    } catch {
      galleryStacks = [];
    }
  }

  // ── Audio (guest book) ────────────────────────────────────────────────────
  let audioRecent: {
    guestName: string;
    durationMs: number;
    createdAt: string;
  }[] = [];
  if (hasAudio) {
    try {
      const msgs = await getAudioMessages(slug);
      audioRecent = msgs
        .slice(-10)
        .reverse()
        .map((m) => ({
          guestName: m.guestName,
          durationMs: m.durationMs,
          createdAt: m.createdAt,
        }));
    } catch {
      // non-critical
    }
  }

  // ── Meni (free value-add — shown only if the couple added items) ──────────
  const meni = weddingData.meni;
  const hasMeni = !!(
    (meni?.food && meni.food.length > 0) ||
    (meni?.drinks && meni.drinks.length > 0)
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={cssVars as React.CSSProperties}>
      <GuestHubClient
        slug={slug}
        coupleNames={weddingData.couple_names.full_display}
        ijekavica={ijekavica}
        useCyrillic={weddingData.useCyrillic ?? false}
        hasSeating={hasSeating}
        guestLookup={guestLookup}
        tables={tables}
        hasGallery={hasGallery}
        galleryPhase={phase}
        galleryStacks={galleryStacks}
        hasMeni={hasMeni}
        meni={meni ?? null}
        hasAudio={hasAudio}
        audioRecentMessages={audioRecent}
        eventDate={weddingData.event_date}
      />
    </div>
  );
}
