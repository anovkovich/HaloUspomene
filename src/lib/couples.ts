import clientPromise from "./mongodb";
import { WeddingData } from "@/app/pozivnica/[slug]/types";
import { isGalleryOnlyCouple } from "./gallery-only";

export type CoupleDocument = WeddingData & { slug: string };

// Lives in ./gallery-only so client components can import the predicate without
// pulling the Mongo driver in. Re-exported here to keep existing imports valid.
export { isGalleryOnlyCouple };

export interface PortalCoupleInfo {
  bride: string;
  groom: string;
  eventDate: string;
  /** RSVP deadline (`submit_until`, ISO YYYY-MM-DD) — the portal both shows it
   *  and lets the couple push it back once it runs out. */
  submitUntil: string;
  scriptFont: string;
  draft: boolean;
  hasInvitationData: boolean;
  premium: boolean;
  premium_paid: boolean;
  paid_for_gallery: boolean;
  galleryOnly: boolean;
}

/** The couple summary the Moje Venčanje portal boots from. Both entry points —
 *  POST /api/moje-vencanje/auth/[slug] and the verifyAuth() server action — must
 *  return the exact same shape, so they share this instead of each building it. */
export function toPortalCoupleInfo(data: WeddingData): PortalCoupleInfo {
  return {
    bride: data.couple_names.bride,
    groom: data.couple_names.groom,
    eventDate: data.event_date,
    submitUntil: data.submit_until ?? "",
    scriptFont: data.scriptFont ?? "great-vibes",
    draft: data.draft ?? false,
    hasInvitationData: (data.locations ?? []).length > 0,
    premium: data.premium ?? false,
    premium_paid: data.premium_paid ?? false,
    paid_for_gallery: data.paid_for_gallery ?? false,
    galleryOnly: isGalleryOnlyCouple(data),
  };
}

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<CoupleDocument>("couples");
}

export async function getWeddingData(slug: string): Promise<WeddingData | null> {
  const c = await col();
  const doc = await c.findOne({ slug }, { projection: { _id: 0, slug: 0 } });
  return doc as WeddingData | null;
}

/** Slugs for classic invitations (excludes premium couples). */
export async function getClassicWeddingSlugs(): Promise<string[]> {
  const c = await col();
  const docs = await c
    .find(
      { premium: { $ne: true } },
      { projection: { slug: 1, _id: 0 } }
    )
    .toArray();
  return docs.map((d) => d.slug);
}

/** Slugs for premium invitations only. */
export async function getPremiumWeddingSlugs(): Promise<string[]> {
  const c = await col();
  const docs = await c
    .find(
      { premium: true },
      { projection: { slug: 1, _id: 0 } }
    )
    .toArray();
  return docs.map((d) => d.slug);
}

export async function getAllCouples(): Promise<CoupleDocument[]> {
  const c = await col();
  // `example: 1` first so demo/example couples (example: true) always sort to
  // the bottom of the admin list — a missing field sorts as null (< true), so
  // real couples come first, examples last; then newest-first within each group.
  return c
    .find({}, { projection: { _id: 0 } })
    .sort({ example: 1, created_at: -1, _id: -1 })
    .toArray();
}

/** Couples with the QR gallery enabled — minimal fields for the lifecycle cron. */
export async function getGalleryCouples(): Promise<
  Array<{
    slug: string;
    event_date: string;
    contact_phone?: string;
    gallery_sms_last_access_sent?: boolean;
    gallery_sms_purge_warning_sent?: boolean;
    gallery_purged_at?: string;
    gallery_extra_days?: number;
  }>
> {
  const c = await col();
  const docs = await c
    .find(
      { paid_for_gallery: true },
      {
        projection: {
          _id: 0,
          slug: 1,
          event_date: 1,
          contact_phone: 1,
          gallery_sms_last_access_sent: 1,
          gallery_sms_purge_warning_sent: 1,
          gallery_purged_at: 1,
          gallery_extra_days: 1,
        },
      }
    )
    .toArray();
  return docs as Array<{
    slug: string;
    event_date: string;
    contact_phone?: string;
    gallery_sms_last_access_sent?: boolean;
    gallery_sms_purge_warning_sent?: boolean;
    gallery_purged_at?: string;
    gallery_extra_days?: number;
  }>;
}

export async function upsertCouple(
  slug: string,
  data: WeddingData
): Promise<void> {
  const c = await col();
  // Exclude created_at from $set so it doesn't conflict with $setOnInsert.
  // (Mongo rejects updates where the same field appears in both operators.)
  const { created_at: _created_at, ...dataWithoutTimestamp } =
    data as WeddingData & { created_at?: unknown };
  void _created_at;
  await c.updateOne(
    { slug },
    { $set: { slug, ...dataWithoutTimestamp }, $setOnInsert: { created_at: new Date() } },
    { upsert: true }
  );
}

export async function deleteCouple(slug: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ slug });
}

export async function patchCouple(
  slug: string,
  updates: Partial<WeddingData>
): Promise<void> {
  const c = await col();
  await c.updateOne({ slug }, { $set: updates });
}

/** Removes the listed fields from the couple document.
 *  Use this when you want to clear an optional field — `patchCouple` with
 *  `undefined` is a no-op in MongoDB because BSON drops undefined values. */
export async function unsetCoupleFields(
  slug: string,
  fields: Array<keyof WeddingData>
): Promise<void> {
  if (fields.length === 0) return;
  const c = await col();
  const unset: Record<string, "">  = {};
  for (const f of fields) unset[f as string] = "";
  await c.updateOne({ slug }, { $unset: unset });
}
