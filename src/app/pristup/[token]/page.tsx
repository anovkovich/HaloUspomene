import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShareLinkByToken } from "@/lib/share-links";
import { getWeddingData } from "@/lib/couples";
import { getBirthdayData } from "@/lib/birthday";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import SharePageClient, { type SharePayload } from "./SharePageClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

interface PageProps {
  params: Promise<{ token: string }>;
}

/** Resolves the share token to a normalized payload (URL forms, password,
 *  display name) by fetching the underlying product live. Returns null when
 *  the token is invalid OR the product was deleted under it. */
async function resolvePayload(token: string): Promise<SharePayload | null> {
  const link = await getShareLinkByToken(token);
  if (!link) return null;

  if (link.product_kind === "couple") {
    const couple = await getWeddingData(link.slug);
    if (!couple) return null;
    const isPremium = !!couple.premium;
    const base = isPremium ? "premium-pozivnica" : "pozivnica";
    return {
      kind: "couple",
      isPremium,
      displayName: couple.couple_names?.full_display || link.slug,
      slug: link.slug,
      eventDate: couple.event_date,
      password: couple.potvrde_password || "",
      invitationUrl: `${SITE_URL}/${base}/${link.slug}/`,
      loginUrl: `${SITE_URL}/${base}/${link.slug}/prijava/`,
      portalUrl: `${SITE_URL}/moje-vencanje/`,
      portalLabel: "Moje Venčanje — portal",
      ogImageUrl: `${SITE_URL}/${base}/${link.slug}/opengraph-image`,
    };
  }

  if (link.product_kind === "birthday") {
    const b = await getBirthdayData(link.slug);
    if (!b) return null;
    const isEighteenth = b.type === "eighteenth";
    const base = isEighteenth ? "punoletstvo" : "deciji-rodjendan";
    const displayName = isEighteenth
      ? [b.honoree_name, b.honoree_surname].filter(Boolean).join(" ") ||
        b.child_name ||
        link.slug
      : b.child_name || link.slug;
    return {
      kind: "birthday",
      isEighteenth,
      displayName,
      slug: link.slug,
      eventDate: b.event_date,
      password: b.admin_password || "",
      invitationUrl: `${SITE_URL}/${base}/${link.slug}/`,
      loginUrl: `${SITE_URL}/${base}/${link.slug}/prijava/`,
      portalUrl: `${SITE_URL}/${base}/${link.slug}/portal/`,
      portalLabel: isEighteenth ? "Dashboard za proslavu" : "Dashboard za rođendan",
      ogImageUrl: `${SITE_URL}/${base}/${link.slug}/opengraph-image`,
    };
  }

  // seating
  const s = await getStandaloneSeating(link.slug);
  if (!s) return null;
  return {
    kind: "seating",
    isPremium: false,
    displayName: s.eventName,
    slug: link.slug,
    eventDate: s.eventDate,
    password: s.password,
    invitationUrl: `${SITE_URL}/raspored-sedenja/${link.slug}/`,
    loginUrl: `${SITE_URL}/raspored-sedenja/${link.slug}/prijava/`,
    portalUrl: null,
    portalLabel: null,
    ogImageUrl: null, // no per-product OG; layout falls back to site default
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token } = await params;
  const payload = await resolvePayload(token);

  const robots = { index: false, follow: false };
  const baseTitle = "Vaš pristupni link · HaloUspomene";

  if (!payload) {
    return { title: baseTitle, robots };
  }

  // Reuse the underlying product's own OG image so the IG/Viber preview
  // looks identical to the actual invitation.
  const og = payload.ogImageUrl
    ? {
        title: payload.displayName,
        images: [{ url: payload.ogImageUrl, width: 1200, height: 630 }],
      }
    : undefined;

  return {
    title: `${payload.displayName} · HaloUspomene`,
    robots,
    openGraph: og,
    twitter: og
      ? {
          card: "summary_large_image",
          title: payload.displayName,
          images: og.images.map((i) => i.url),
        }
      : undefined,
  };
}

export default async function PristupPage({ params }: PageProps) {
  const { token } = await params;
  const payload = await resolvePayload(token);
  if (!payload) notFound();
  return <SharePageClient token={token} payload={payload} />;
}
