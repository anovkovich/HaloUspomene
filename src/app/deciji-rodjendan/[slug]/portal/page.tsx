import { Metadata } from "next";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
import { notFound } from "next/navigation";
import { getBirthdayData, getAllBirthdaySlugs } from "@/data/rodjendani";
import { getBirthdayRSVP } from "@/lib/birthday-rsvp";
import { getBirthdayThemeCSSVariables } from "../constants";
import ProslavaPortalClient from "@/components/portal/proslava/ProslavaPortalClient";
import {
  addBirthdayManualGuestAction,
  updateBirthdayGuestCountAction,
  deleteBirthdayGuestAction,
  loadBirthdayGalleryAction,
  deleteBirthdayGalleryPhotoAction,
  loadBirthdayMeniAction,
  saveBirthdayMeniAction,
  uploadBirthdayImageAction,
  deleteBirthdayImageAction,
} from "./actions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBirthdayData(slug);
  if (!data) return {};
  const title = `${data.child_name} - Portal`;
  const description = `Portal za rođendan - ${data.child_name}`;
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

export default async function BirthdayPortalPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBirthdayData(slug);

  if (!data) notFound();

  let responses: import("@/lib/birthday-rsvp").BirthdayRSVPEntry[] = [];
  let fetchError = false;

  try {
    responses = await getBirthdayRSVP(slug);
  } catch {
    fetchError = true;
  }

  const cssVars = getBirthdayThemeCSSVariables(data.theme, data.displayFont);

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
        isEighteenth={false}
        displayName={data.child_name}
        eventDate={data.event_date}
        responses={responses}
        fetchError={fetchError}
        paidForRaspored={!!data.paid_for_raspored}
        paidForGallery={!!data.paid_for_gallery}
        paidForImages={!!data.paid_for_images}
        addGuestAction={addBirthdayManualGuestAction}
        updateGuestCountAction={updateBirthdayGuestCountAction}
        deleteGuestAction={deleteBirthdayGuestAction}
        loadGalleryAction={loadBirthdayGalleryAction}
        deleteGalleryPhotoAction={deleteBirthdayGalleryPhotoAction}
        loadMeniAction={loadBirthdayMeniAction}
        saveMeniAction={saveBirthdayMeniAction}
        invitationImages={data.images ?? []}
        uploadImageAction={uploadBirthdayImageAction}
        deleteImageAction={deleteBirthdayImageAction}
      />
    </div>
  );
}
