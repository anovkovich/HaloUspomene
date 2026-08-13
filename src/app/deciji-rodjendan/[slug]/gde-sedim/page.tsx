import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getBirthdayData, getAllBirthdaySlugs } from "@/lib/birthday";
import { loadSeatingLayout } from "@/lib/seating";
import { buildGuestLookup } from "@/lib/seating/lookup";
import { getBirthdayRSVP } from "@/lib/birthday-rsvp";
import { getBirthdayThemeCSSVariables } from "../constants";
import type { TableData } from "@/lib/seating";
import GdeSedimClient from "@/app/pozivnica/[slug]/gde-sedim/GdeSedimClient";
import MeniTab from "@/app/pozivnica/[slug]/gde-sedim/MeniTab";
import GalerijaClient from "@/app/pozivnica/[slug]/galerija/GalerijaClient";
import { getGalleryUploaderStacks } from "@/lib/gallery";
import { galleryPhase } from "@/lib/gallery-lifecycle";

export const dynamicParams = true;
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBirthdayData(slug);
  if (!data) return {};
  const honoree =
    data.type === "eighteenth"
      ? `${data.honoree_name ?? ""} ${data.honoree_surname ?? ""}`.trim() ||
        data.child_name
      : data.child_name;
  const title = `${honoree} — Gde sedim?`;
  const description = `Pronađite svoje mesto sedenja za proslavu — ${honoree}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllBirthdaySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BirthdayGdeSedimPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const data = await getBirthdayData(slug);

  if (!data) notFound();

  // The page is now a small guest hub, not only a seat lookup: it opens when
  // EITHER add-on has something to show. Mirrors the standalone seating hub,
  // whose gate is `hasGallery || hasAudio || hasMeni`.
  const meni = data.meni;
  const hasMeni = !!(
    meni &&
    ((meni.food && meni.food.length > 0) ||
      (meni.drinks && meni.drinks.length > 0))
  );
  const hasSeating = !!data.paid_for_raspored;
  const hasGallery = !!data.paid_for_gallery;
  if (!hasSeating && !hasMeni && !hasGallery) notFound();

  // Deliberately NO date gate on the hub: the seat lookup and the menu never
  // expire, and the printed welcome-sign QR has to keep working. The gallery
  // tab renders its own phase (before / upload / closed / expired) — the real
  // upload window stays enforced server-side in the API route.
  const galleryPhaseValue = hasGallery
    ? galleryPhase(
        data.event_date,
        (data as { gallery_extra_days?: number }).gallery_extra_days ?? 0,
      )
    : "unknown";

  let galleryStacks: Awaited<ReturnType<typeof getGalleryUploaderStacks>> = [];
  if (
    hasGallery &&
    galleryPhaseValue !== "expired" &&
    galleryPhaseValue !== "before"
  ) {
    try {
      galleryStacks = await getGalleryUploaderStacks(slug);
    } catch {
      galleryStacks = [];
    }
  }

  // Requested tab wins when it exists; otherwise fall back to whatever this
  // event actually has, seat lookup first.
  const requested =
    tab === "meni" && hasMeni
      ? "meni"
      : tab === "galerija" && hasGallery
        ? "galerija"
        : null;
  const activeTab =
    requested ??
    (hasSeating ? "sedenje" : hasGallery ? "galerija" : "meni");

  const hubTabs = [
    ...(hasSeating ? [{ key: "sedenje", label: "Gde sedim" }] : []),
    ...(hasGallery ? [{ key: "galerija", label: "Galerija" }] : []),
    ...(hasMeni ? [{ key: "meni", label: "Meni" }] : []),
  ];

  const cssVars = getBirthdayThemeCSSVariables(data.theme, data.displayFont);

  // ── Load seating data from MongoDB ──────────────────────────────────────
  let tables: TableData[] = [];
  let parseError = false;

  try {
    const loaded = await loadSeatingLayout(slug);
    if (loaded) tables = loaded;
  } catch {
    parseError = true;
  }

  // ── Build guest lookup — same algorithm as the wedding page ─────────────
  // The RSVP roster supplies the party ("zvanica") holder names, so any member
  // of a party finds the whole party's arrangement.
  let parties: { id: string; name: string }[] = [];
  try {
    parties = (await getBirthdayRSVP(slug)).map((r) => ({
      id: r.id,
      name: r.name,
    }));
  } catch {
    parties = [];
  }
  const guestLookup = buildGuestLookup(tables, parties);

  const honoree =
    data.type === "eighteenth"
      ? `${data.honoree_name ?? ""} ${data.honoree_surname ?? ""}`.trim() ||
        data.child_name
      : data.child_name;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={cssVars as React.CSSProperties}>
      <div
        className="min-h-screen"
        style={{
          backgroundColor: "var(--theme-background)",
          color: "var(--theme-text)",
        }}
      >
        <div className="max-w-lg mx-auto px-4 py-10 sm:py-14">
          {/* Back link */}
          <div className="mb-8">
            <Link
              href={`/deciji-rodjendan/${slug}`}
              className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-60"
              style={{ color: "var(--theme-text-light)" }}
            >
              <ChevronLeft size={15} />
              Nazad na pozivnicu
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1
              className="text-5xl sm:text-6xl mb-4 font-bold"
              style={{
                color: "var(--theme-primary)",
                fontFamily: "var(--theme-display-font)",
              }}
            >
              {honoree}
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
            {/* With a tab bar the eyebrow just repeats the active tab, so it
                only earns its place on a single-purpose hub. */}
            {hubTabs.length === 1 && (
              <p
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--theme-text-light)" }}
              >
                {hasSeating ? "Gde sedim?" : hasGallery ? "Galerija" : "Meni"}
              </p>
            )}
          </div>

          {hubTabs.length > 1 && (
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {hubTabs.map((t) => {
                const on = activeTab === t.key;
                return (
                  <Link
                    key={t.key}
                    href={`/deciji-rodjendan/${slug}/gde-sedim/${
                      t.key === "sedenje" ? "" : `?tab=${t.key}`
                    }`}
                    scroll={false}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: on
                        ? "var(--theme-primary)"
                        : "var(--theme-surface)",
                      color: on ? "#fff" : "var(--theme-text-muted)",
                      border: on
                        ? "1px solid var(--theme-primary)"
                        : "1px solid var(--theme-border-light)",
                    }}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </div>
          )}

          {activeTab === "meni" && meni && (
            <MeniTab meni={meni} useCyrillic={false} />
          )}

          {activeTab === "galerija" && (
            <GalerijaClient
              slug={slug}
              coupleNames={honoree}
              useCyrillic={false}
              phase={galleryPhaseValue}
              eventDate={data.event_date}
              initialStacks={galleryStacks}
              initialPhotos={[]}
              embedded
              apiBase={`/api/deciji-rodjendan/${slug}`}
            />
          )}

          {activeTab === "sedenje" && parseError && (
            <div
              className="text-center py-14 px-6 rounded-xl"
              style={{
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <p
                className="text-base mb-2"
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

          {activeTab === "sedenje" && !parseError && (
            <GdeSedimClient guestLookup={guestLookup} tables={tables} />
          )}
        </div>
      </div>
    </div>
  );
}
