import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import { loadSeatingLayout, type TableData } from "@/lib/seating";
import { buildGuestLookup } from "@/lib/seating/lookup";
import { getGalleryUploaderStacks } from "@/lib/gallery";
import { galleryPhase } from "@/lib/gallery-lifecycle";
import { getAudioMessages } from "@/lib/audio";
import GdeSedimClient from "@/app/pozivnica/[slug]/gde-sedim/GdeSedimClient";
import GuestHubClient from "@/app/pozivnica/[slug]/gde-sedim/GuestHubClient";

export const dynamicParams = true;
export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStandaloneSeating(slug);
  if (!data) return {};
  return {
    title: `${data.eventName} — Gde sedim?`,
    description: `Pronađite svoje mesto sedenja — ${data.eventName}`,
    openGraph: {
      title: `${data.eventName} — Gde sedim?`,
      type: "website",
    },
    robots: { index: false, follow: false },
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Brand palette CSS variables — feeds the shared GdeSedimClient + HallMap
// which read var(--theme-*) tokens for colors.
const BRAND_VARS: React.CSSProperties = {
  "--theme-primary": "#AE343F",
  "--theme-primary-light": "rgba(174,52,63,0.25)",
  "--theme-primary-muted": "rgba(174,52,63,0.15)",
  "--theme-background": "#FAFAF5",
  "--theme-surface": "#F5F4DC",
  "--theme-surface-alt": "#F0EFCF",
  "--theme-text": "#232323",
  "--theme-text-muted": "rgba(35,35,35,0.92)",
  "--theme-text-light": "rgba(35,35,35,0.78)",
  "--theme-border": "rgba(35,35,35,0.32)",
  "--theme-border-light": "rgba(35,35,35,0.2)",
} as React.CSSProperties;

export default async function StandaloneGdeSedimPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getStandaloneSeating(slug);

  if (!data || !data.active) notFound();

  let tables: TableData[] = [];
  let parseError = false;
  try {
    const loaded = await loadSeatingLayout(slug);
    if (loaded) tables = loaded;
  } catch {
    parseError = true;
  }

  // ── Build guest lookup (mirrors wedding /gde-sedim) ────────────────────
  // The owner's guest list supplies the party ("zvanica") holder names, so any
  // member of a party finds the whole party's arrangement.
  const guestLookup = buildGuestLookup(
    tables,
    data.guests.map((g) => ({ id: g.id, name: g.name })),
  );

  // When the owner enabled audio and/or gallery, the gde-sedim URL (the QR
  // pano destination) becomes the full guest hub with bottom tabs. Both
  // add-ons require an event date, so its presence is implied here.
  const hasGallery = !!(data.paid_for_gallery && data.eventDate);
  const hasAudio = !!(data.paid_for_audio && data.eventDate);
  const hasMeni = !!(
    data.meni &&
    ((data.meni.food && data.meni.food.length > 0) ||
      (data.meni.drinks && data.meni.drinks.length > 0))
  );

  if (hasGallery || hasAudio || hasMeni) {
    const phase = data.eventDate
      ? galleryPhase(data.eventDate, data.gallery_extra_days ?? 0)
      : "unknown";

    let galleryStacks: Awaited<ReturnType<typeof getGalleryUploaderStacks>> = [];
    if (hasGallery && phase !== "expired" && phase !== "before") {
      try {
        galleryStacks = await getGalleryUploaderStacks(slug);
      } catch {
        galleryStacks = [];
      }
    }

    let audioRecentMessages: {
      guestName: string;
      durationMs: number;
      createdAt: string;
    }[] = [];
    if (hasAudio) {
      try {
        const msgs = await getAudioMessages(slug);
        audioRecentMessages = msgs
          .slice(-10)
          .reverse()
          .map((m) => ({
            guestName: m.guestName,
            durationMs: m.durationMs,
            createdAt: m.createdAt,
          }));
      } catch {
        audioRecentMessages = [];
      }
    }

    return (
      <div className="min-h-screen" style={BRAND_VARS}>
        <GuestHubClient
          slug={slug}
          coupleNames={data.eventName}
          ijekavica={false}
          useCyrillic={false}
          hasSeating
          guestLookup={guestLookup}
          tables={tables}
          hasGallery={hasGallery}
          galleryPhase={phase}
          galleryStacks={galleryStacks}
          hasMeni={hasMeni}
          meni={data.meni ?? null}
          hasAudio={hasAudio}
          audioRecentMessages={audioRecentMessages}
          eventDate={data.eventDate ?? ""}
          apiBase={`/api/raspored-sedenja/${slug}`}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={BRAND_VARS}>
      <div
        className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]"
        style={{ color: "var(--theme-text)" }}
      >
        <div className="max-w-lg mx-auto px-4 py-10 sm:py-14">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-raleway transition-opacity hover:opacity-60"
              style={{ color: "var(--theme-text-light)" }}
            >
              <ChevronLeft size={15} />
              halouspomene.rs
            </Link>
          </div>

          <div className="text-center mb-10">
            <h1
              className="font-script text-5xl sm:text-6xl mb-4"
              style={{ color: "var(--theme-primary)" }}
            >
              {data.eventName}
            </h1>
            <div className="flex items-center justify-center gap-4 my-4">
              <div
                className="h-px w-10"
                style={{ backgroundColor: "var(--theme-border)" }}
              />
              <span
                style={{
                  color: "var(--theme-primary)",
                  opacity: 0.5,
                  fontSize: 12,
                }}
              >
                ✦
              </span>
              <div
                className="h-px w-10"
                style={{ backgroundColor: "var(--theme-border)" }}
              />
            </div>
            <p
              className="font-raleway text-xs uppercase tracking-widest"
              style={{ color: "var(--theme-text-light)" }}
            >
              Gde sedim?
            </p>
          </div>

          {parseError && (
            <div
              className="text-center py-14 px-6 rounded-xl"
              style={{
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <p
                className="font-raleway text-base mb-2"
                style={{ color: "var(--theme-text-muted)" }}
              >
                Greška pri učitavanju rasporeda
              </p>
              <p
                className="text-sm"
                style={{ color: "var(--theme-text-light)" }}
              >
                Pokušajte ponovo za koji trenutak.
              </p>
            </div>
          )}

          {!parseError && tables.length === 0 && (
            <div
              className="text-center py-14 px-6 rounded-xl"
              style={{
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <p
                className="font-raleway text-base"
                style={{ color: "var(--theme-text-muted)" }}
              >
                Raspored još nije objavljen.
              </p>
            </div>
          )}

          {!parseError && tables.length > 0 && (
            <GdeSedimClient guestLookup={guestLookup} tables={tables} />
          )}
        </div>
      </div>
    </div>
  );
}
