import { Metadata } from "next";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
import { notFound } from "next/navigation";
import { getBirthdayData, getAllBirthdaySlugs } from "@/lib/birthday";
import { getBirthdayRSVP } from "@/lib/birthday-rsvp";
import { getBirthdayThemeCSSVariables } from "@/app/deciji-rodjendan/[slug]/constants";
import type { BirthdayFontType } from "@/app/deciji-rodjendan/[slug]/types";
import ProslavaPortalClient from "@/components/portal/proslava/ProslavaPortalClient";
import {
  addPunoletstvoManualGuestAction,
  updatePunoletstvoGuestCountAction,
  deletePunoletstvoGuestAction,
  loadPunoletstvoGalleryAction,
  deletePunoletstvoGalleryPhotoAction,
  loadPunoletstvoMeniAction,
  savePunoletstvoMeniAction,
  uploadPunoletstvoImageAction,
  deletePunoletstvoImageAction,
} from "./actions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBirthdayData(slug);
  if (!data || data.type !== "eighteenth") return {};
  const displayName =
    data.honoree_name && data.honoree_surname
      ? `${data.honoree_name} ${data.honoree_surname}`
      : data.child_name;
  const title = `${displayName} - Portal`;
  const description = `Portal za punoletstvo - ${displayName}`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllBirthdaySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PunoletstvoPortalPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBirthdayData(slug);

  if (!data || data.type !== "eighteenth") notFound();

  let responses: import("@/lib/birthday-rsvp").BirthdayRSVPEntry[] = [];
  let fetchError = false;

  try {
    responses = await getBirthdayRSVP(slug);
  } catch {
    fetchError = true;
  }

  const displayFont = (data as { displayFont?: BirthdayFontType }).displayFont;
  const cssVars = getBirthdayThemeCSSVariables(data.theme, displayFont);

  const displayName =
    data.honoree_name && data.honoree_surname
      ? `${data.honoree_name} ${data.honoree_surname}`
      : data.child_name;

  return (
    <div
      className="min-h-screen"
      style={{
        ...(cssVars as React.CSSProperties),
        backgroundColor: "var(--theme-background)",
      }}
    >
      <ProslavaPortalClient
        slug={slug}
        isEighteenth
        displayName={displayName}
        eventDate={data.event_date}
        responses={responses}
        fetchError={fetchError}
        paidForRaspored={!!data.paid_for_raspored}
        paidForGallery={!!data.paid_for_gallery}
        paidForImages={!!data.paid_for_images}
        addGuestAction={addPunoletstvoManualGuestAction}
        updateGuestCountAction={updatePunoletstvoGuestCountAction}
        deleteGuestAction={deletePunoletstvoGuestAction}
        loadGalleryAction={loadPunoletstvoGalleryAction}
        deleteGalleryPhotoAction={deletePunoletstvoGalleryPhotoAction}
        loadMeniAction={loadPunoletstvoMeniAction}
        saveMeniAction={savePunoletstvoMeniAction}
        invitationImages={data.images ?? []}
        uploadImageAction={uploadPunoletstvoImageAction}
        deleteImageAction={deletePunoletstvoImageAction}
      />
    </div>
  );
}
