import { randomBytes } from "crypto";
import { getWeddingData, patchCouple } from "./couples";

/**
 * Key carried by the gallery link the couple forwards to guests (`?k=`).
 *
 * It is NOT a secret — it travels through group chats and gets forwarded on.
 * Its single job is to separate two entry points that need different windows:
 *
 *   printed QR (no key)  → event day + the day after
 *   forwarded link (key) → also BEFORE the event, so guests who open the
 *                          message early can already add photos
 *
 * After the guest window closes, neither works; both land on the upsell page.
 *
 * This is a bearer value in a URL, so it comes from `randomBytes`, never
 * `Math.random()` — same rule as `generateCheckinToken` in standalone-seating.
 */
export function generateGalleryKey(): string {
  return randomBytes(12).toString("base64url"); // 16 url-safe chars
}

/** Reads the couple's key, generating and persisting one if it has none.
 *  Older couples predate the field, so every share path calls this instead of
 *  assuming the key exists. Returns null when the couple is gone. */
export async function ensureGalleryKey(slug: string): Promise<string | null> {
  const data = await getWeddingData(slug);
  if (!data) return null;
  if (data.gallery_key) return data.gallery_key;

  const key = generateGalleryKey();
  await patchCouple(slug, { gallery_key: key });
  return key;
}

/** Constant-time-ish match. The key only widens an upload window — it guards no
 *  private data — so a plain comparison is enough, but an empty/absent stored
 *  key must never validate. */
export function galleryKeyMatches(
  stored: string | undefined,
  provided: string | undefined | null
): boolean {
  if (!stored || !provided) return false;
  return stored === provided;
}
