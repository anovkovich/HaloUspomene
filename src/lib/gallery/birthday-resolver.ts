import { getBirthdayData } from "@/lib/birthday";
import type { GalleryEntity } from "./handlers";

/**
 * Gallery resolver for both birthday products.
 *
 * `birthday_events` holds dečiji rođendan AND punoletstvo, and a slug is unique
 * across both, so one resolver serves both route trees — the same way the
 * seating editor is shared.
 *
 * A draft (unpaid) invitation is not "live", so its gallery stays closed even
 * if the flag somehow got set.
 */
export async function resolveBirthdayGallery(
  slug: string,
): Promise<GalleryEntity | null> {
  const b = await getBirthdayData(slug);
  if (!b) return null;
  return {
    eventDate: b.event_date,
    enabled: !b.draft && !!b.paid_for_gallery,
  };
}
