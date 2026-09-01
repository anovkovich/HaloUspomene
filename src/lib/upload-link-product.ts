import { revalidatePath } from "next/cache";
import { getWeddingData, patchCouple } from "./couples";
import { getBirthdayData, patchBirthday } from "./birthday";
import { coupleDisplayName } from "./couple-display-name";
import { getUploadLinkByToken, type UploadLink } from "./upload-links";

/** Same cap the admin panel and both image routes enforce. */
export const MAX_UPLOAD_IMAGES = 3;

export interface UploadImage {
  url: string;
  pathname: string;
}

export interface UploadTarget {
  link: UploadLink;
  /** Shown to the client so they can tell they opened the right link. */
  displayName: string;
  /** `paid_for_images` on the product — the gallery has to be switched on. */
  enabled: boolean;
  images: UploadImage[];
  eventDate: string;
}

/** Resolves an upload token to the live product. Returns null when the token
 *  is unknown OR the product was deleted under it. */
export async function resolveUploadTarget(
  token: string,
): Promise<UploadTarget | null> {
  const link = await getUploadLinkByToken(token);
  if (!link) return null;

  if (link.product_kind === "couple") {
    const couple = await getWeddingData(link.slug);
    if (!couple) return null;
    return {
      link,
      displayName:
        couple.couple_names?.full_display ||
        coupleDisplayName(couple.couple_names ?? {}) ||
        link.slug,
      enabled: !!couple.paid_for_images,
      images: couple.images ?? [],
      eventDate: couple.event_date ?? "",
    };
  }

  const b = await getBirthdayData(link.slug);
  if (!b) return null;
  const displayName =
    b.type === "eighteenth"
      ? [b.honoree_name, b.honoree_surname].filter(Boolean).join(" ") ||
        b.child_name ||
        link.slug
      : b.child_name || link.slug;
  return {
    link,
    displayName,
    enabled: !!b.paid_for_images,
    images: b.images ?? [],
    eventDate: b.event_date ?? "",
  };
}

/** Writes the new image list back to the product and refreshes the rendered
 *  invitation, so the client sees their photo on the page right away. */
export async function saveUploadImages(
  link: UploadLink,
  images: UploadImage[],
): Promise<void> {
  if (link.product_kind === "couple") {
    await patchCouple(link.slug, { images });
    revalidatePath(`/pozivnica/${link.slug}`);
    revalidatePath(`/premium-pozivnica/${link.slug}`);
    return;
  }
  await patchBirthday(link.slug, { images });
  revalidatePath(`/deciji-rodjendan/${link.slug}`);
  revalidatePath(`/punoletstvo/${link.slug}`);
}
